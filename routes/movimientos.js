const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Obtener historial de movimientos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movimiento ORDER BY id DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transacción SQL Crítica: Transferir Dinero
router.post('/transferir', async (req, res) => {
  const { cuenta_origen_id, cuenta_destino_id, valor, tipo_movimiento_id, punto_id } = req.body;
  
  if (!cuenta_origen_id || !cuenta_destino_id || !valor) {
    return res.status(400).json({ error: "Faltan datos obligatorios (Origen, Destino, Valor)" });
  }

  if(cuenta_origen_id === cuenta_destino_id) return res.status(400).json({error: "Las cuentas de origen y destino no pueden ser iguales"});
  if(valor <= 0) return res.status(400).json({error: "El valor a transferir debe ser mayor a cero, no estafemos al banco."});

  const client = await pool.connect();
  try {
    // === INICIAMOS TRANSACCIÓN (SQL BEGIN) ===
    await client.query('BEGIN');
    
    // 1. Descontar dinero del Origen
    const resOrigen = await client.query('UPDATE cuenta SET saldo = saldo - $1 WHERE id = $2 RETURNING saldo', [valor, cuenta_origen_id]);
    if(resOrigen.rowCount === 0) throw new Error(`La cuenta origen [${cuenta_origen_id}] no existe.`);
    
    // 2. Sumar dinero al Destino
    const resDestino = await client.query('UPDATE cuenta SET saldo = saldo + $1 WHERE id = $2 RETURNING saldo', [valor, cuenta_destino_id]);
    if(resDestino.rowCount === 0) throw new Error(`La cuenta destino [${cuenta_destino_id}] no existe.`);

    // 3. Registrar este movimiento explícitamente como evidencia
    const queryMov = `
      INSERT INTO movimiento (tipo_movimiento_id, cuenta_origen_id, cuenta_destino_id, punto_id, valor, fecha) 
      VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *;
    `;
    const resMov = await client.query(queryMov, [tipo_movimiento_id || 1, cuenta_origen_id, cuenta_destino_id, punto_id || 1, valor]);
    
    // === FINALIZAR TRANSACCIÓN CON ÉXITO (SQL COMMIT) ===
    await client.query('COMMIT'); 
    res.status(201).json(resMov.rows[0]);

  } catch (err) {
    // Si la luz se va, o hubo error en cualquier paso (ej. una cuenta no existía), DESHACEMOS LO PARCIAL (SQL ROLLBACK).
    await client.query('ROLLBACK');
    console.error('Rollback activado por error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Transacción SQL: Consignación Administrativa
router.post('/admin-deposit', async (req, res) => {
  const { cuenta_destino_id, valor, tipo_movimiento_id, punto_id } = req.body;
  
  if (!cuenta_destino_id || !valor) {
    return res.status(400).json({ error: "Faltan datos obligatorios (Destino, Valor)" });
  }

  if(valor <= 0) return res.status(400).json({error: "El valor a consignar debe ser mayor a cero."});

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Sumar dinero al Destino
    const resDestino = await client.query('UPDATE cuenta SET saldo = saldo + $1 WHERE id = $2 RETURNING saldo', [valor, cuenta_destino_id]);
    if(resDestino.rowCount === 0) throw new Error(`La cuenta destino [${cuenta_destino_id}] no existe.`);

    // Registrar este movimiento explícitamente como evidencia
    const queryMov = `
      INSERT INTO movimiento (tipo_movimiento_id, cuenta_origen_id, cuenta_destino_id, punto_id, valor, fecha) 
      VALUES ($1, NULL, $2, $3, $4, NOW()) RETURNING *;
    `;
    const resMov = await client.query(queryMov, [tipo_movimiento_id || 1, cuenta_destino_id, punto_id || 1, valor]);
    
    await client.query('COMMIT'); 
    res.status(201).json({ movimiento: resMov.rows[0], nuevo_saldo: resDestino.rows[0].saldo });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Rollback activado por error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
