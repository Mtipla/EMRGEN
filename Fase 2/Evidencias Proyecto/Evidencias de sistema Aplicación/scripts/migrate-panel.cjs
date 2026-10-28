const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { client } = require('./db-dev.cjs');

async function main() {
  const db = client();
  await db.connect();
  try {
    await db.query(readFileSync(resolve(__dirname, '../migraciones/005_panel_administrativo.sql'), 'utf8'));
    await db.query(readFileSync(resolve(__dirname, '../migraciones/006_usuario_solo_roles.sql'), 'utf8'));
    console.log('Migración del panel administrativo aplicada.');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally { await db.end(); }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
