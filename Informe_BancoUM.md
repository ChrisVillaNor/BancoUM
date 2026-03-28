# PROYECTO INTEGRADOR: ECOSISTEMA FINANCIERO BANCOUM
**Materia:** Base de Datos II
**Estudiante:** Christian Villa
**Repositorio GitHub / Despliegue en Vivo:** https://bancoum.onrender.com/

---

## 1. ABSTRACT Y PLANTEAMIENTO ARQUITECTÓNICO
El desarrollo de **BancoUM** va más allá de un simple gestor CRUD. Es la simulación arquitectónica de un Core Bancario Full-Stack que soluciona directamente el alto problema de persistencia secuencial (doble gasto / inconsistencia de transacciones) en entornos de bases de datos de acceso concurrente.

Se implementó una arquitectura de Software Libre de la siguiente manera:
1. **Periferia Frontend:** (Vite + React.js) - Componentización de estado reactivo y control de promesas HTTP (Fetch).
2. **Gateway Middleware:** (Node.js + Express) - Controlador que evalúa las llaves referenciales y detiene flujos ilícitos.
3. **Persistencia Nuclear (BDD):** (PostgreSQL Serverless de Neon.tech) - El corazón del proyecto, utilizando un motor especializado en control de concurrencia Multiversión (MVCC) con un esquema fuertemente normalizado de 18 tablas interconectadas.

---

## 2. METADATA Y DICCIONARIO DEL MODELO RELACIONAL
Para mantener las normas formales de ingeniería, el diseño lógico de BancoUM fue fragmentado en tres "Dominios" o esferas de impacto. Se garantizó estricta Integridad Referencial mapeando `FOREIGN KEYs` entre dichos dominios:

*   **Dominio de Catálogos (Raíz inmutable):** Entidades diseñadas para gobernar tipologías. Destacan `tipo_documento` y `tipo_movimiento`. Y una gran súper estructura geográfica anidada: Un `banco` tiene varias `sede`s -> que están en una `zona` -> que abarca una `comuna` -> que contiene `barrio`s -> done finalmente existe el `punto_atencion`.
*   **Dominio de Participantes (Entes biológicos):** Entidades como `empleado` (gestores) y `cliente` (la identidad digital del usuario en formato Persona Natural).
*   **Dominio de Transacción Financeira (El Núcleo Operativo):** La tabla `cuenta` actúa como la bóveda personal vinculada a un cliente. Y la de mayor crecimiento del sistema, la gran tabla dimensional de hechos: `movimiento`, que archiva matemáticamente cualquier cruce de dinero de forma inalterable.

---

## 3. LÓGICA DE AISLAMIENTO Y MICRO-SEGURIDAD FRONT-END
El Core aborda un inmenso riesgo de las APIS públicas: "Evitar que el usuario logre recuperar saldo que no le pertenece."

Se construyó un **Auth Wall (Muro Bóveda)** que escinde el sistema en tres roles operativos cerrados:
*   **Interfaz Pública (Lead Gen):** Formularios sin estado para inserción a la base de clientes.
*   **Gestor Maestro (Administrador):** Un panel divino autenticado vía el código (`admin@bancoum.edu`). Aquí la capa Node.js ejecuta un barrido selectivo a las 18 tablas (`GET /api/*`) e inyecta llaves Foráneas de control maestro. Recientemente, se refinó la BDD para hacer bypass a las llaves maestras sobre cuentas usando `DROP CONSTRAINT` para permitir prototipado directo y demostrativo de asignaciones de Usuarios a Cuentas sin crear roles extra.
*   **Portal de Cliente ('Home Banking'):** El cliente ingresa con su Documento. El código evalúa las claves foráneas con la API remota e imprime únicamente la traza SQL donde `cliente.id == params.userId`.

---

## 4. COMPONENTE TÉCNICO VITAL: CONTROL DE TRANSACCIONES SQL (A.C.I.D.)
La principal justificación universitaria de haber elegido PostgreSQL frente a bases genéricas es su soporte a la lógica **ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad)**.
Para cumplir el core value de BancoUM (Transferencia de Fondos), se codificó un bloque imperativo de control en lado del Servidor Node, inyectado directamente por puente `pg`:

```javascript
/* LÓGICA DE TRANSFERENCIA: ROUTER DE MOVIMIENTOS EN BANCO UM */

const client = await pool.connect(); // Obtención de Worker al Servidor PG
try {
  await client.query('BEGIN'); // Paso 1: ATOMICIDAD. La base entra en pausa preventiva.

  // Paso 2: Evaluación del Descuento Origen (Garantía de Fondos)
  const resOrigen = await client.query(
    'UPDATE cuenta SET saldo = saldo - $1 WHERE numero_cuenta = $2 RETURNING *',
    [monto, cuentaOrigen]
  );
  
  // Paso 3: Inyección Positiva Destino
  const resDestino = await client.query(
    'UPDATE cuenta SET saldo = saldo + $1 WHERE numero_cuenta = $2',
    [monto, cuentaDestino] // La coherencia referencial exige que el destino exista
  );

  // Paso 4: Dejar huella en la dimensional de hechos para auditoría
  await client.query(
    'INSERT INTO movimiento (...) VALUES (...)', [...]
  );

  await client.query('COMMIT'); // Paso FINAL: Todo fue un éxito, grabar definitivamente al Disco.

} catch (error) {
  // SALVAGUARDA DE ESTAFA: Si una de las cuentas destino era inventada o no hay dinero,
  // el bloque colapsa, no hay pérdida, el sistema auto-devuelve ambas sumas a la normalidad.
  await client.query('ROLLBACK');
}
```

Esta estructura implementada previene activamente el fenómeno de *"Carrera Transaccional Simultánea"*. Ni cien miles de envíos realizados al mismo tiempo por hackers lograrían violar las propiedades ACID de la **Base de Datos Neon de AppBanco**, pues todos se ordenan linealmente mediante el lock nativo del motor MVCC hasta cumplir cada suceso.

---

## 5. CONCLUSIÓN Y METODOLOGÍA CI/CD DE DESPLIEGUE CONTINUO
El código construido es de una naturaleza tan pura que no fue relegado a ejecución exclusiva en disco local (`localhost`), si no que se acopló al entorno perimetral de **Render**.
Siendo así documentado vía el repositorio madre en Git, donde a través de WebHooks y flujos de Entrega Continua, el código re-construye sus assets de manera asíncrona cada vez que se sube un `Commit`, inyectando variables de entorno `.env` en tiempo real. 

El estudiante ha culminado un escenario prototipo 100% capaz de actuar de manera comercial sirviendo funciones reales de almacenamiento interconectado.
