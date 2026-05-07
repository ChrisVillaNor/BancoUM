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
  const { cuenta_origen_id, cuenta_destino_id, numero_cuenta_destino, valor, tipo_movimiento_id, punto_id } = req.body;
  
  const destIdOrNum = numero_cuenta_destino || cuenta_destino_id;
  
  if (!cuenta_origen_id || !destIdOrNum || !valor) {
    return res.status(400).json({ error: "Faltan datos obligatorios (Origen, Destino, Valor)" });
  }

  if(valor <= 0) return res.status(400).json({error: "El valor a transferir debe ser mayor a cero, no estafemos al banco."});

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    let realDestinoId = destIdOrNum;
    
    // Si es un número de cuenta (cadena larga) buscamos su ID interno
    if (numero_cuenta_destino || String(cuenta_destino_id).length > 6) {
       const destCheck = await client.query('SELECT id FROM cuenta WHERE numero_cuenta = $1', [String(destIdOrNum)]);
       if (destCheck.rows.length === 0) throw new Error(`La cuenta destino número [${destIdOrNum}] no existe en el sistema.`);
       realDestinoId = destCheck.rows[0].id;
    }

    if(cuenta_origen_id == realDestinoId) throw new Error("Las cuentas de origen y destino no pueden ser iguales");

    // La base de datos tiene un TRIGGER (trigger_actualizar_saldo) que
    // se encarga de descontar y sumar saldos automáticamente al insertar.
    // Solo debemos insertar el registro y el trigger hará el resto.
    // tipo_movimiento_id 3 = TRANSFERENCIA

    const queryMov = `
      INSERT INTO movimiento (tipo_movimiento_id, cuenta_origen_id, cuenta_destino_id, punto_id, valor, fecha) 
      VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *;
    `;
    const resMov = await client.query(queryMov, [3, cuenta_origen_id, realDestinoId, punto_id || 1, valor]);
    
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
    
    // La base de datos tiene un TRIGGER (trigger_actualizar_saldo) que
    // suma el dinero al destino cuando se inserta un depósito (tipo_movimiento_id = 1).
    
    const queryMov = `
      INSERT INTO movimiento (tipo_movimiento_id, cuenta_origen_id, cuenta_destino_id, punto_id, valor, fecha) 
      VALUES ($1, NULL, $2, $3, $4, NOW()) RETURNING *;
    `;
    const resMov = await client.query(queryMov, [1, cuenta_destino_id, punto_id || 1, valor]);
    
    // Recuperar el saldo actualizado para mandarlo al front
    const saldoRes = await client.query('SELECT saldo FROM cuenta WHERE id = $1', [cuenta_destino_id]);

    await client.query('COMMIT'); 
    res.status(201).json({ movimiento: resMov.rows[0], nuevo_saldo: saldoRes.rows[0].saldo });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Rollback activado por error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
