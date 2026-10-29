const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { client } = require('./db-dev.cjs');

async function main() {
  const db = client();
  await db.connect();
  try {
    await db.query(readFileSync(resolve(__dirname, '../migrations/20261028_tickets_responsable.sql'), 'utf8'));
    console.log('Migración aplicada: autor de la solución de tickets de soporte.');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    await db.end();
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
