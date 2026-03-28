const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Tablas administrativas que tienen sentido exponer (evitamos exponer contraseñas/logs)
const ALLOWED_TABLES = [
  'tipo_cuenta', 'tipo_movimiento', 'sede', 'empleado', 
  'punto_atencion', 'comuna', 'barrio', 'municipio', 'departamento'
];

// Obtener qué columnas exige exactamente la base de datos (Data Types)
router.get('/schema/:tabla', async (req, res) => {
  const { tabla } = req.params;
  if (!ALLOWED_TABLES.includes(tabla)) return res.status(403).json({ error: 'Tabla no permitida' });

  try {
    const query = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    const result = await pool.query(query, [tabla]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener las filas de esa tabla
router.get('/:tabla', async (req, res) => {
  const { tabla } = req.params;
  if (!ALLOWED_TABLES.includes(tabla)) return res.status(403).json({ error: 'Tabla no permitida' });

  try {
    const result = await pool.query(`SELECT * FROM ${tabla} ORDER BY id DESC LIMIT 50`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Insertar datos a cualquier tabla aprobada de forma genérica auto-construida en SQL
router.post('/:tabla', async (req, res) => {
  const { tabla } = req.params;
  if (!ALLOWED_TABLES.includes(tabla)) return res.status(403).json({ error: 'Tabla no permitida' });

  const data = req.body;
  delete data.id; // La base de datos auto-incrementa esto (SERIAL)

  const keys = Object.keys(data).filter(k => data[k] !== ''); // Evitar keys vacías forzadas
  const values = keys.map(k => data[k]);
  
  if (keys.length === 0) return res.status(400).json({ error: 'El formulario está vacío' });

  const paramHolders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const columnsStr = keys.join(', ');

  const query = `INSERT INTO ${tabla} (${columnsStr}) VALUES (${paramHolders}) RETURNING *`;

  try {
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error insertando catálogo:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
