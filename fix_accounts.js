const { pool } = require('./db.js');

async function run() {
  try {
    const res = await pool.query("SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'actualizar_saldo';");
    console.log("Function def:\n", res.rows[0].pg_get_functiondef);

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

run();
