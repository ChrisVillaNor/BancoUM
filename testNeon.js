const { Pool } = require('pg');

const pool = new Pool({
  user: 'neondb_owner',
  host: 'ep-bitter-band-am7ygnih.c-5.us-east-1.aws.neon.tech',
  database: 'neondb',
  password: 'npg_R4L2TvgpzoNB',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
  .then(r => {
    if (r.rows.length === 0) {
      console.log('⚠️  NEON VACÍO: No hay tablas. Debes importar tu backup .sql');
    } else {
      console.log('✅ TABLAS EN NEON:');
      r.rows.forEach(row => console.log(' -', row.table_name));
    }
    pool.end();
  })
  .catch(e => {
    console.log('❌ ERROR DE CONEXIÓN:', e.message);
    pool.end();
  });
