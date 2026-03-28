const { pool } = require('./db');

async function getSchemas() {
  const client = await pool.connect();
  
  try {
    const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('cuenta', 'movimiento')
      ORDER BY table_name, ordinal_position;
    `);
    
    console.log('--- ESQUEMAS ---');
    res.rows.forEach(r => console.log(`${r.table_name} -> ${r.column_name}: ${r.data_type}`));
  } finally {
    client.release();
    pool.end();
  }
}
getSchemas();
