const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { client } = require('./db-dev.cjs');
(async () => {
  const db = client();
  await db.connect();
  try {
    await db.query(readFileSync(resolve(__dirname,'../pruebas_init.sql'),'utf8'));
    console.log('pruebas_init.sql: OK (constraints diferidos comprobados; rollback)');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error.code, error.message);
    process.exitCode=1;
  } finally { await db.end(); }
})();
