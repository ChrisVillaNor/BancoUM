const { pool } = require('./db');

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT current_database(), current_date, current_time');
    console.log('✅ ¡Conexión exitosa a la base de datos BancoUM!');
    console.log('Base de datos actual:', result.rows[0].current_database);
    console.log('Hora del servidor:', result.rows[0].current_time);
    client.release();
  } catch (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
  } finally {
    pool.end();
  }
}

testConnection();
