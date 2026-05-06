const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Obtener la lista de cuentas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cuenta ORDER BY id DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Obtener las cuentas específicas de un cliente
router.get('/cliente/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await pool.query('SELECT * FROM cuenta WHERE usuario_id = $1 ORDER BY id DESC', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear una nueva cuenta inicial
router.post('/', async (req, res) => {
  const { usuario_id, tipo_cuenta_id, numero_cuenta, saldo, cupo_total, alias } = req.body;
  try {
    const query = `
      INSERT INTO cuenta (
        usuario_id, tipo_cuenta_id, numero_cuenta, saldo, 
        cupo_total, cupo_disponible, con_cuota_manejo, cuota_manejo_valor, 
        tasa_interes, fecha_apertura, activa, alias
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, false, 0, 0, NOW(), true, $7)
      RETURNING *;
    `;
    const saldoNum = parseFloat(saldo) || 0;
    const cupoNum = parseFloat(cupo_total) || 0;

    const values = [usuario_id || 1, tipo_cuenta_id || 1, numero_cuenta, saldoNum, cupoNum, cupoNum, alias || null];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear cuenta:', err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar una cuenta
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM cuenta WHERE id = $1', [id]);
    res.json({ message: 'Cuenta eliminada con éxito' });
  } catch (err) {
    console.error('Error al eliminar cuenta:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
