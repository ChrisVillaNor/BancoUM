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

module.exports = router;
