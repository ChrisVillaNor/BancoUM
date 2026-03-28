const { pool } = require('./db');
async function descTable() {
  const client = await pool.connect();
  const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cliente'`);
  console.log(res.rows.map(r => `${r.column_name}: ${r.data_type}`).join('\n'));
  client.release();
  pool.end();
}
descTable();
