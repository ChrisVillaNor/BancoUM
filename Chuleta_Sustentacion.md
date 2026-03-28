# 🕵️‍♂️ CHULETA DE CREDENCIALES BANCOUM (Solo para ti)
*Guía rápida para no trabarte durante la sustentación en vivo frente al profesor.*

## 1. MODO DIOS: Panel de Administrador (CRUD Maestro)
En este modo podrás administrar las 18 tablas completas (Crear sedes, documentos, y ver todas las cuentas y clientes a la vez). No importa qué pongas en la base de datos o en tu Front, estas credenciales **están fijadas a la fuerza en el código fuente (`Login.jsx`)**.

- **Correo Electrónico Institucional:** `admin@bancoum.edu`
- **Código de Seguridad:** `admin123`

> **📝 Script para la presentación:** *"Profesor, primero, voy a iniciar sesión con los privilegios de Administrador Supremo del banco. Con esta cuenta accedo al modo Gestor y así evito que el panel de administración sea público... ¡Vea cómo se mapean en directo todas las inserciones que mis compañeros hicieron de prueba anoche en la base PostgreSQL de Neon!"*

---

## 2. MODO DEMOSTRACIÓN: Home Banking de un Cliente Normal
Aquí mostrarás las validaciones ácidas (Transacciones SQL). Ingresarás a ver cómo luce "la billetera del usuario", y no todas las cuentas maestras de la aplicación. Para este paso, necesitas un usuario que **exista** en la tabla de tu base de datos y que al menos tenga 1 cuenta enlazada en la tabla `cuenta` sumándole saldo.

Como no sé qué números de cédula reales metiste hoy, **te sugiero crear uno frente a él para deslumbrarlo:**

### Paso A: Creación en vivo
1. Entra a "Únete a UM".
2. Di que crearás a alguien de ejemplo.
3. Pon la Identificación **`999888`** y el Correo **`profesor@test.com`**.
4. Llena los demás datos como quieras y dale a "Comenzar". (¡Boom! Se insertará dinámicamente en vivo a PostgreSQL usando `INSERT CLIENTE`).

### Paso B: Crearle Dinero Ficticio (Modo Dios)
1. Sal, e ingresa rápido como Admin (`admin@bancoum.edu` / `admin123`).
2. Ve a Clientes, confirma que él está allí (busca su ID, usualmente el último, pongamos de ejemplo ID 50).
3. Pasa a "Cuentas". Créale una cuenta a nombre del Cliente "50". Ponle un Saldo de **`$100.000`**.

### Paso C: Entrar como el Profesor
Cierra la sesión del administrador, y ahora ingresa normalmente pero como si fueses el profesor:
- **Correo Electrónico:** `profesor@test.com`
- **Código de Seguridad:** `999888`
*(Mágicamente, en vez del panel maestro, cargará tu bóveda del Frontend hecha en React, consultará tu API y cargará las tarjetas doradas. El profesor exclamará: "¡Caray, este estudiante me asombra!").*

---

### 3. EL TRUCO FINAL: Transacción SQL en vivo
Dentro del Modo Cliente del Profesor, utiliza el lado derecho para mandarle dinero a cualquier otra cuenta (Ejemplo: a la ID 104). Ingresa **`50000`** en el Monto.
Al apretar enviar, menciona: *"En este preciso milisegundo, la base de datos acaba de ejecutar un bloque `BEGIN`. Vio que yo tenía suficiente dinero, de manera que actualizó mis restas y sus sumas y sentenció el bloque con un `COMMIT` perpetuando la integridad del historial en PostgreSQL."*
