# PROYECTO INTEGRADOR: ECOSISTEMA FINANCIERO BANCOUM
**Materia:** Base de Datos II
**Estudiante:** Christian Villa (u otro integrante / reemplaza esto)
**Repositorio GitHub / Despliegue en Vivo:** https://bancoum.onrender.com/

---

## 1. RESUMEN EJECUTIVO
El proyecto **BancoUM** es una simulación de un "Web Core Bancario" de ciclo completo (Full-Stack). Tiene como propósito principal modelar el almacenamiento, la persistencia, las reglas de negocio transaccionales globales y el acceso a los datos de una entidad bancaria funcional desde cero.

El modelo se apoya en un patrón Cliente-Servidor compuesto por tres macro bloques:
*   **Base de Datos en la Nube (Neon.tech LTS):** Servidor Serverless ejecutando una instancia robusta de **PostgreSQL**, escogido por su compatibilidad estricta con el estándar SQL y control de concurrencia multiversión (MVCC).
*   **API y Capa Controladora (Servidor Express/Node.js):** Actúa como middleware de persistencia y enrutador RESTful para mediar la información transaccional y la seguridad.
*   **Interfaz Gráfica de Usuario (React + Vite):** Implementada como una aplicación SPA (Single Page Application) modular y asíncrona que renderiza virtualmente el DOM para mayor velocidad.

---

## 2. ARQUITECTURA DE DOMINIO Y ENTIDADES DE NEGOCIO
El motor del **BancoUM** está soportado en un diagrama relacional conformado por 18 entidades interconectadas. Para preservar la normalización y la flexibilidad a largo plazo, el dominio del modelo separa los catálogos estáticos de las acciones dinámicas:

1.  **Tablas de Catálogo (Nivel 1):** Configuran el estado inmutable o reglas corporativas, tales como `tipo_documento`, `tipo_movimiento`, y el árbol de infraestructura `zona` > `comuna` > `barrio` > `punto_atencion` (Sedimentando el alcance geográfico de la entidad).
2.  **Tablas Principales (Nivel 2 - Actores):** Residen aquí los `empleado`s, el directorio de `cliente`s, y la ramificación de `cuenta`s activas asociadas a la clientela.
3.  **Tabla de Hechos (Nivel 3 - Transacciones):** `movimiento` actúa como la tabla histórica más pesada del banco. Documenta toda entrada, salida y transferencia vinculando las llaves foráneas correspondientes.

---

## 3. MECANISMOS DE AISLAMIENTO: VISIÓN MULTI-ROL (AUTH WALL)
Con la meta de respetar la privacidad y evitar filtraciones de PII (Personally Identifiable Information), el Front-End se desacopló en tres "Fases" o portales usando protección asíncrona (React Router States):

*   **Fase 1 (Pública):** Landing Page comercial y un Registro de Cliente que acciona un `HTTP POST /api/clientes` para inyectar prospectos directamente a la entidad `cliente`.
*   **Fase 2 (Portal de Autogestión 'Home Banking'):** Un cliente real accede de manera segura utilizando coincidencia de base de datos (`email` y `numero_documento`). Tras autenticarse, invoca el Endpoint de `GET /api/cuentas/cliente/:id`, recuperando un mapa de solo lectura (y permisos limitados de escritura) estrictamente vinculado a sus IDs.
*   **Fase 3 (Dashboard C-Level):** Accesible exclusivamente bajo el rol maestro, expone terminales CRUD dinámicas capaces de alterar el directorio de todas las entidades, ofreciendo poder absoluto al Gestor General de la BD.

---

## 4. CONFIABILIDAD Y OPERACIONES A.C.I.D. (El Módulo de Traslados SQL)
Al tratarse de una materia enfocada en la robustez y consistencia de los datos, el desarrollo más importante del **BancoUM** fue blindar las transferencias financieras del usuario.

Cuando un usuario envía dinero desde el "Home Banking" a una cuenta tercera, el modelo del Servidor Express ejecuta una Transacción SQL manual a través de un pool asíncrono. La función cumple las cuatro propiedades **ACID** vitales de toda BDD:

1.  **`BEGIN;`**  (Bloqueo de la Transacción)
2.  Descuento Origen: `UPDATE cuenta SET saldo = saldo - $Monto WHERE id = $Origen;`
3.  Acumulación Destino: `UPDATE cuenta SET saldo = saldo + $Monto WHERE id = $Destino;`
4.  Persistencia Histórica: `INSERT INTO movimiento (...) VALUES (...);`
5.  **`COMMIT;`** (Aprobación permanente en disco de los 3 pasos anteriores).

**Atomicidad y Manejo de Errores (ROLLBACK):**
La arquitectura transaccional se envolvió en un bloque `try-catch`. Si un bloque intermedio fallase de improvisto —por ejemplo, un saldo insuficiente, una caída de disco, o una llave destino inexistente— la BDD ejecuta automáticamente el comando **`ROLLBACK;`**. Al hacer esto, todo el bloque se desmorona y los saldos vuelven exactamente a su estado de inicio, evitando el terrible escenario de que al cliente se le descuente dinero que nunca llega destino.

---

## 5. DESPLIEGUE CONTINUO Y CI/CD (Render Platform)
La aplicación sobrepasó el concepto genérico de "Localhost". Toda la arquitectura y sus dependencias (`npm`) fueron orquestadas a través de perfiles variables de entorno `.env` atados al sistema de control de versiones **Git / GitHub**. 
El repositorio principal de BancoUM se ancló a una instancia automática en **Render.com**, encargándose de montar y levantar el contenedor `express` visible para todo el mundo vía HTTP Segura y reaccionando activamente a cualquier cambio (`Push`) aprobado en el código fuente.
