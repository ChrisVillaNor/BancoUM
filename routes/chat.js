const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const axios = require('axios');
const { pool } = require('../db');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy_key' });

const esquema_bd = `
Base de datos: BancoUM
Tablas:
- barrio(id, comuna_id, nombre)
- cliente(id, tipo_documento, numero_documento, nombre, apellido, fecha_nacimiento, telefono, email, direccion, comuna, activo, contrasena)
- comuna(id, municipio_id, nombre)
- cuenta(id, usuario_id, tipo_cuenta_id, numero_cuenta, saldo, cupo_total, cupo_disponible, con_cuota_manejo, cuota_manejo_valor, tasa_interes, fecha_apertura, password_pagos_hash, activa, fecha_corte, dia_pago, intereses_acumulados, mora_acumulada)
- departamento(id, codigo_dane, nombre)
- empleado(id, tipo_documento, numero_documento, nombre, apellido, sede_id, activo)
- movimiento(id, tipo_movimiento_id, cuenta_origen_id, cuenta_destino_id, punto_id, valor, fecha)
- municipio(id, departamento_id, codigo_dane, nombre)
- notificacion(id, usuario_id, tipo, titulo, mensaje, leida, fecha)
- pago_credito(id, cuenta_credito_id, cuenta_origen_id, monto_total, capital, intereses, mora, registrado_por, admin_id, fecha)
- producto_solicitud(id, usuario_id, tipo_producto, estado, fecha_solicitud, fecha_resolucion, observaciones)
- punto_atencion(id, codigo, sede_id, tipo_id, activo)
- sede(id, nombre, direccion, barrio_id, telefono, activa)
- tipo_cuenta(id, nombre)
- tipo_movimiento(id, nombre)
- tipo_punto_atencion(id, nombre)
- turno(id, empleado_id, fecha, hora_inicio, hora_fin)
- usuario(id, cedula, nombre, apellido, email, telefono, direccion, fecha_nacimiento, password_hash, password_seguridad_hash, rol, estado, token_activacion, fecha_registro, activo)

Reglas de Join:
- movimiento.cuenta_origen_id -> cuenta.id
- movimiento.cuenta_destino_id -> cuenta.id
- cuenta.usuario_id -> usuario.id
- municipio.departamento_id -> departamento.id
- comuna.municipio_id -> municipio.id
`;

router.post('/', async (req, res) => {
  try {
    const { pregunta, userId, userRole, userEmail } = req.body;
    if (!pregunta) return res.status(400).json({ error: "Falta la pregunta" });

    if (!process.env.OPENAI_API_KEY) {
       return res.status(500).json({ error: "Falta OPENAI_API_KEY en el servidor" });
    }

    // Reglas dinámicas de seguridad para el LLM
    let reglas_seguridad = "";
    if (userRole === 'admin') {
       reglas_seguridad = `Eres el Administrador del sistema del BancoUM. Tienes acceso total.
Puedes responder cualquier consulta sobre clientes, cuentas, movimientos, etc.
Sin embargo, si la consulta pide listar registros completos y es muy ambigua, ponle un LIMIT 20 para no saturar.
EXTREMADAMENTE IMPORTANTE: Si te preguntan "cuántos", "cantidad" o "total de" registros (ej. ¿cuántos movimientos hay?), DEBES usar SIEMPRE la función agregada SELECT COUNT(*). ¡NUNCA uses SELECT * con LIMIT en estos casos, debes contar todos los registros de la tabla de forma precisa!`;
    } else if (userRole === 'client' && userId) {
       reglas_seguridad = `REGLA DE SEGURIDAD CRÍTICA E INQUEBRANTABLE (ROW-LEVEL SECURITY):
Estás interactuando EXCLUSIVAMENTE con el CLIENTE LOGUEADO cuyo ID es ${userId} y su correo es '${userEmail}'.
TODA CONSULTA que generes hacia las tablas 'cuenta', 'movimiento' o 'cliente' TIENE QUE TENER OBLIGATORIAMENTE la cláusula WHERE para restringir los datos SOLO a este cliente.
- Si consultas 'cliente', DEBES poner: WHERE id = ${userId} o WHERE email = '${userEmail}'
- Si consultas 'cuenta', DEBES poner: WHERE usuario_id = ${userId}
- Si consultas 'movimiento', DEBES hacer JOIN con cuenta y asegurar que el dueño de la cuenta sea ${userId}.
¡ESTÁ ESTRICTAMENTE PROHIBIDO DEVOLVER DATOS DE OTROS CLIENTES O LISTAR TODOS LOS CLIENTES!
Si el cliente actual te pide "todas las cuentas" o "todos los clientes", asume que se refiere SOLO A SUS CUENTAS. 
Si explícitamente pide información de otro nombre o correo diferente al suyo, genera EXCELENTEMENTE este SQL de rechazo:
SELECT 'ACCESO DENEGADO' as error, 'Solo puedes consultar tus propios productos financieros por seguridad.' as mensaje;`;
    } else {
       reglas_seguridad = "No hay usuario autenticado. Responde con un SQL que devuelva un mensaje de error pidiendo que inicie sesión.";
    }

    const prompt_seguro_sql = `
Eres un experto en SQL para PostgreSQL.
Convierte la pregunta del usuario en una consulta SQL válida para PostgreSQL.
Reglas obligatorias y estrictas:
1. Usa SOLO las tablas y columnas explícitamente listadas en el Esquema proporcionado. 
2. ESTÁ TOTALMENTE PROHIBIDO consultar tablas del sistema (como pg_roles, pg_user, pg_class, information_schema, etc.). NUNCA inventes tablas ni saques información de tablas que no sean tuyas.
3. Genera únicamente la consulta SQL pura en texto plano, sin formato markdown, sin comillas invertidas, sin explicar.
4. Nunca uses DROP, DELETE, UPDATE, INSERT o ALTER. Solo SELECT.
5. Limita a 100 filas.

${reglas_seguridad}

Esquema:
${esquema_bd}
`;

    // 1. Generar SQL con OpenAI
    const sqlResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: prompt_seguro_sql },
        { role: "user", content: pregunta }
      ]
    });

    let sql_generado = sqlResponse.choices[0].message.content.trim();
    if (sql_generado.startsWith('\`\`\`sql')) {
        sql_generado = sql_generado.replace(/\`\`\`sql/g, '').replace(/\`\`\`/g, '').trim();
    }
    if (sql_generado.startsWith('\`\`\`')) {
        sql_generado = sql_generado.replace(/\`\`\`/g, '').trim();
    }

    const sql_limpio = sql_generado.toLowerCase();
    if (!sql_limpio.startsWith('select')) {
        return res.status(400).json({ error: "La IA generó algo que no es un SELECT", sql_generado });
    }
    const bloqueadas = ["drop ", "delete ", "update ", "insert ", "alter ", "pg_", "information_schema"];
    if (bloqueadas.some(b => sql_limpio.includes(b))) {
        return res.status(403).json({ error: "Bloqueo de Seguridad: Intento de acceso a tablas no permitidas.", sql_generado });
    }

    // VERIFICACIÓN HARDCORE DE SEGURIDAD EN BACKEND (Evita hackeos al LLM)
    if (userRole === 'client' && !sql_limpio.includes('acceso denegado')) {
        // Bloqueo total a tablas administrativas
        if (/from\s+(usuario|empleado|turno|sede|punto_atencion)/.test(sql_limpio)) {
             return res.status(403).json({ 
                 error: "Bloqueo de Seguridad: Intento de acceso a tablas administrativas.",
                 sql: "ACCESO DENEGADO",
                 resultado: [],
                 respuesta: "Por políticas de seguridad, los clientes no tienen acceso a la información administrativa interna del banco."
             });
        }

        // Un cliente NUNCA debería poder ejecutar una consulta en cliente, cuenta o movimiento sin un WHERE
        const intentaAccederTablasProhibidas = /from\s+(cuenta|cliente|movimiento|pago_credito|producto_solicitud|notificacion)/.test(sql_limpio);
        const tieneWhere = /\bwhere\b/.test(sql_limpio);
        
        if (intentaAccederTablasProhibidas && !tieneWhere) {
             return res.status(403).json({ 
                 error: "Bloqueo de Seguridad: La consulta intentó acceder a datos globales sin filtros.",
                 sql: "ACCESO DENEGADO",
                 resultado: [],
                 respuesta: "Por políticas de seguridad de BancoUM, solo puedes consultar información vinculada directamente a tu cuenta. No tienes permiso para listar todos los registros del banco."
             });
        }
    }

    let data_tabular = [];
    try {
        const dbResult = await pool.query(sql_generado);
        data_tabular = dbResult.rows;
    } catch(err) {
        return res.status(500).json({ 
            error: "Error ejecutando el SQL en la base de datos.", 
            sql_generado, 
            db_error: err.message 
        });
    }

    const prompt_respuesta = `
Eres Molleja IA, un asistente bancario. Responde brevemente la pregunta basándote SOLAMENTE en la tabla JSON de resultados adjunta. 
ESTRICTA OBLIGACIÓN: DEBES responder EXCLUSIVAMENTE en idioma ESPAÑOL (Spanish), bajo cualquier circunstancia, incluso si la pregunta o los datos están en otro idioma.
Si está vacía, di que no se encontraron resultados. No menciones el SQL ni detalles técnicos.
Pregunta: ${pregunta}
Resultados JSON: ${JSON.stringify(data_tabular).substring(0, 3000)}
    `;

    const natResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [{ role: "user", content: prompt_respuesta }]
    });

    const respuesta_natural = natResponse.choices[0].message.content.trim();

    let audioBase64 = null;
    try {
        if (process.env.ELEVENLABS_API_KEY) {
            // Usar ElevenLabs si la key existe
            const voice_id = "EXAVITQu4vr4xnSDxMaL"; // Voz de ElevenLabs predeterminada (Rachel o similar)
            const elRes = await axios.post(
                `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
                {
                    text: respuesta_natural,
                    model_id: "eleven_multilingual_v2",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                },
                {
                    headers: {
                        'Accept': 'audio/mpeg',
                        'xi-api-key': process.env.ELEVENLABS_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'arraybuffer'
                }
            );
            const buffer = Buffer.from(elRes.data);
            audioBase64 = buffer.toString('base64');
        } else {
            // Fallback a OpenAI TTS (ya que lo tienes configurado)
            const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: "nova", // Nova es una voz femenina muy natural
                input: respuesta_natural,
            });
            const buffer = Buffer.from(await mp3.arrayBuffer());
            audioBase64 = buffer.toString('base64');
        }
    } catch(ttsErr) {
        console.error("Error generando audio (ElevenLabs/OpenAI):", ttsErr.message);
    }

    res.json({
        pregunta,
        sql: sql_generado,
        resultado: data_tabular,
        respuesta: respuesta_natural,
        audioBase64
    });

  } catch (err) {
    console.error('Error general en chat:', err);
    res.status(500).json({ error: "Error en el servidor procesando tu consulta de IA." });
  }
});

module.exports = router;
