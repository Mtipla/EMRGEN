// Inserta SOLO en la BD aislada (127.0.0.1:55710) las cuentas de personal que no pueden crearse por API
// (administrador inicial y soporte) y la cuenta admin@emergen.test que exigen los fixtures de pytest.
// Las cuentas de usuario final se crean por API en las pruebas (registro con Firebase falso).
// Credenciales aleatorias -> AUD_SCRATCH/aud-creds.json (fuera del repositorio; nunca en informes).
import { createRequire } from 'node:module';
import { randomBytes, randomInt } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DB } from './bd-aislada.mjs';

const APP = resolve(fileURLToPath(new URL('../../../', import.meta.url)), 'Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación');
const req = createRequire(resolve(APP, 'apps/backend/package.json'));
const bcrypt = req('bcrypt');
const { Client } = req('pg');
const SCRATCH = process.env.AUD_SCRATCH;
if (!SCRATCH) throw new Error('Define AUD_SCRATCH');

const client = new Client({ host: '127.0.0.1', port: Number(DB.port), user: DB.user, database: DB.name });
await client.connect();
const [{ current_database: name }] = (await client.query('SELECT current_database()')).rows;
if (name !== DB.name) throw new Error('No es la BD aislada');

const pin = String(randomInt(1000, 10000));
const pinHash = await bcrypt.hash(pin, 12);
const creds = { pinPersonal: pin };
const accounts = [
  ['admin', 'AUD Admin', 'aud.admin@example.invalid', 1],
  ['admin2', 'AUD Admin Dos', 'aud.admin2@example.invalid', 1],
  ['soporte', 'AUD Soporte', 'aud.soporte@example.invalid', 2],
  ['pytestAdmin', 'Pytest Admin', 'admin@emergen.test', 1],
];
for (const [key, nombre, correo, rol] of accounts) {
  const password = 'Aud-' + randomBytes(9).toString('base64url');
  const { rows: [p] } = await client.query('INSERT INTO pin(pin_hash) VALUES ($1) RETURNING pin_id', [pinHash]);
  const { rows: [u] } = await client.query(
    'INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,rol_id,estado_id,pin_id) VALUES ($1,$2,$3,$4,1,$5) RETURNING usuario_id',
    [nombre, correo, await bcrypt.hash(password, 12), rol, p.pin_id]);
  creds[key] = { id: u.usuario_id, correo, password };
  console.log(`creado ${key}: usuario_id=${u.usuario_id} rol=${rol} correo=${correo}`);
}
await client.end();
writeFileSync(resolve(SCRATCH, 'aud-creds.json'), JSON.stringify(creds, null, 1));
console.log('credenciales sintéticas guardadas fuera del repositorio');
