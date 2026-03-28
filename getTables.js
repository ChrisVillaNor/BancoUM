const { pool } = require('./db');

async function getTables() {
  try {
    const client = await pool.connect();
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `;
    const result = await client.query(query);
    
    console.log(`✅ Se encontraron ${result.rowCount} tablas en la base de datos BancoUM:`);
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });

    client.release();
  } catch (err) {
    console.error('❌ Error al obtener las tablas:', err);
  } finally {
    pool.end();
  }
}

getTables();
