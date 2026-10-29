const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { client } = require('./db-dev.cjs');

async function main() {
  const db = client();
  await db.connect();
  try {
    await db.query(readFileSync(resolve(__dirname, '../migrations/20261028_contactos_antecedentes.sql'), 'utf8'));
    console.log('Migración aplicada: permiso de antecedentes médicos por contacto.');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    await db.end();
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
