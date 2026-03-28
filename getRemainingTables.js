const { pool } = require('./db');

async function getRemaining() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('cliente', 'cuenta', 'movimiento')
      ORDER BY table_name;
    `);
    const tables = res.rows.map(r => r.table_name);
    console.log(JSON.stringify(tables));
  } finally {
    client.release();
    pool.end();
  }
}
getRemaining();
