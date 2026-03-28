const { pool } = require('./db');
const fs = require('fs');

async function getSchema() {
  const client = await pool.connect();
  const res = await client.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'movimiento';
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  client.release();
  pool.end();
}
getSchema();
