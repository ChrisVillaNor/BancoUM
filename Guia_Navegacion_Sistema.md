# 🗺️ GUÍA DEFINITIVA DE NAVEGACIÓN Y ACCESOS (BANCOUM)
*Esta es la guía oficial paso a paso de cómo debes demostrar el recorrido del proyecto al profesor, desde la portada principal hasta la transferencia de fondos.*

---

## 1. MODO GESTOR DE BASE DE DATOS (El Administrador)
El panel de Administrador es el modo maestro construido en React que te permite listar y editar las 18 tablas (incluyendo clientes y cuentas bancarias de terceros).

**Cómo ingresar en la app:**
1. Abre `http://localhost:5173/` (o tu link de Render).
2. Haz clic en el botón superior derecho **"Acceso Clientes"**.
3. En la pantalla de Login Dorado, usa estas credenciales fijas ocultas en el código:
   - **Correo Electrónico:** `admin@bancoum.edu`
   - **Código de Seguridad (Contraseña):** `admin123`

**¿Qué mostrarle al profesor aquí?**
- Haz clic en **Clientes** y muéstrale cómo se alimentaron los datos desde los registros de "Únete a UM".
- Haz clic en **Cuentas**, dale a "Nueva Cuenta", escoge a cualquier persona existente en la base de datos y ponle un gran saldo a favor (por ejemplo _$500,000_).

---

## 2. EL PORTAL DEL CLIENTE (Home Banking - Vista Real)
A diferencia del administrador, un cliente común solo puede ver una bóveda digital protegida con las cuentas bancarias que el Admin aprobó o configuró para él.

**¿Cómo funciona el login de cliente en BancoUM?**
Para evitar que en la universidad tengas que lidiar con recuperar contraseñas o librerías de encriptación complejas, enrutamos que la **"Contraseña" de un cliente común sea su Número de Documento (Cédula).**

### 🔑 Ejemplo de un Acceso de Cliente listo para probar
Vamos a usar los datos de **Gladys Norena** (que vimos en tu base de datos) porque a ella tú le generaste la cuenta de $3,000,000:

1. Asegúrate de haber presionado "Cerrar Sesión" en el modo Admin.
2. Accede nuevamente a **"Acceso Clientes"**.
3. En el formulario, usa las credenciales exactas de ella almacenadas en BDD:
   - **Correo Electrónico:** _¡El correo real que usaste al crear a Gladys!_ (Si no lo recuerdas, míralo rápido entrando como Admin en la pestaña Clientes).
   - **Código de Seguridad (Contraseña):** `25232820` *(Que es su número de cédula)*.

**¿Qué mostrarle al profesor aquí?**
- El código SQL confirmará que Gladys existe, y en vez de llevarte al panel maestro ABURRIDO, la aplicación montará dinámicamente el **Portal de Cliente Lujoso**.
- Allí flotará una tarjeta vertical gigante con el nombre de Gladys impreso en vivo desde React, mostrando un saldo de `$3,000,000` traído directamente de la persistencia de Neon.
- **EL GRAN FINAL:** Dirígete a la sección de transferencias a la derecha. Pon la cuenta destino _(puedes elegir otra que tengas en tu base, como la **202688144204**)_ y pon un monto de envío (Ej. `$100,000`).
- Dale a enviar. En vivo verás cómo el saldo de la tarjeta de Gladys se reduce dinámicamente a $2,900,000, y explicarás: *"En este preciso milisegundo, Node.js orquestó un bloque SQL ACID que alteró a la vez las dos entidades y las selló con un COMMIT."*

---

> 💡 **Tip Extra:** Si olvidas la cédula o los correos de tus usuarios de prueba, solo entra un instante como Admin (`admin@bancoum.edu` / `admin123`) a revisar la tabla de **Clientes**, y memoriza rápido el correo y cédula de algún usuario rico de tu base de datos antes de llamarlo a calificar.
