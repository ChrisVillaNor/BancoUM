const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Obtener todos los clientes (lista)
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM cliente ORDER BY id DESC LIMIT 50';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener un cliente específico
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = 'SELECT id, tipo_documento, numero_documento, nombre, apellido, fecha_nacimiento, telefono, email, direccion, comuna, activo FROM cliente WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener cliente:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Actualizar un cliente (requiere verificación de contraseña)
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { currentPassword, telefono, direccion, comuna, email } = req.body;
  try {
    // 1. Verificación de seguridad
    const checkQuery = 'SELECT * FROM cliente WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    
    const client = checkResult.rows[0];
    const validPassword = (client.contrasena === currentPassword) || (client.numero_documento === currentPassword);
    
    if (!validPassword) {
      return res.status(403).json({ error: 'Contraseña incorrecta. Edición denegada.' });
    }

    // 2. Actualización
    const updateQuery = `
      UPDATE cliente 
      SET telefono = COALESCE($1, telefono), 
          direccion = COALESCE($2, direccion), 
          comuna = COALESCE($3, comuna), 
          email = COALESCE($4, email)
      WHERE id = $5
      RETURNING id, tipo_documento, numero_documento, nombre, apellido, fecha_nacimiento, telefono, email, direccion, comuna, activo;
    `;
    const result = await pool.query(updateQuery, [telefono, direccion, comuna || null, email, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    res.status(500).json({ error: 'Error interno del servidor intentando actualizar el perfil.' });
  }
});

// Crear un nuevo cliente
router.post('/', async (req, res) => {
  const { 
    tipo_documento, 
    numero_documento, 
    nombre, 
    apellido, 
    fecha_nacimiento, 
    telefono, 
    email, 
    direccion, 
    comuna,
    contrasena
  } = req.body;

  try {
    const query = `
      INSERT INTO cliente (
        tipo_documento, numero_documento, nombre, apellido, 
        fecha_nacimiento, telefono, email, direccion, comuna, contrasena, activo
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      RETURNING *;
    `;
    const values = [
      tipo_documento, numero_documento, nombre, apellido, 
      fecha_nacimiento, telefono, email, direccion, comuna || null, contrasena
    ];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear cliente:', err);
    res.status(500).json({ error: 'Error al registrar el cliente, revisa que no haya datos duplicados.' });
  }
});
// Iniciar sesión (Login de Cliente) usando Correo y Contrasena
router.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;
  try {
    const query = 'SELECT id, nombre, apellido, email, numero_documento FROM cliente WHERE email = $1 AND (contrasena = $2 OR numero_documento = $2) AND activo = true';
    const result = await pool.query(query, [email, contrasena]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifique su correo o su contraseña.' });
    }
    // Si entró, le damos un "token" simulado con su data
    res.json({
      token: 'client-token-abc',
      user: {
        id: result.rows[0].id,
        nombre: result.rows[0].nombre + ' ' + result.rows[0].apellido,
        email: result.rows[0].email,
        numero_documento: result.rows[0].numero_documento,
        role: 'client'
      }
    });
  } catch (err) {
    console.error('Error en Login de cliente:', err);
    res.status(500).json({ error: 'Error interno del servidor intentando iniciar sesión.' });
  }
});

module.exports = router;
