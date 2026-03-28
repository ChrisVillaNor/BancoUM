const pool = require('./db');

async function test() {
  const res = await pool.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name;");
  
  const tables = {};
  res.rows.forEach(r => {
    if(!tables[r.table_name]) tables[r.table_name] = [];
    tables[r.table_name].push(r.column_name + ' (' + r.data_type + ')');
  });

  console.log(JSON.stringify(tables, null, 2));
  
  pool.end();
}
test();
