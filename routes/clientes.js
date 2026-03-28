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
    comuna 
  } = req.body;

  try {
    const query = `
      INSERT INTO cliente (
        tipo_documento, numero_documento, nombre, apellido, 
        fecha_nacimiento, telefono, email, direccion, comuna, activo
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING *;
    `;
    const values = [
      tipo_documento, numero_documento, nombre, apellido, 
      fecha_nacimiento, telefono, email, direccion, comuna || null
    ];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear cliente:', err);
    res.status(500).json({ error: 'Error al registrar el cliente, revisa que no haya datos duplicados.' });
  }
});
// Iniciar sesión (Login de Cliente) usando Documento y Correo
router.post('/login', async (req, res) => {
  const { email, numero_documento } = req.body;
  try {
    const query = 'SELECT id, nombre, apellido, email, numero_documento FROM cliente WHERE email = $1 AND numero_documento = $2 AND activo = true';
    const result = await pool.query(query, [email, numero_documento]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifique su correo o su N° de documento.' });
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
