// Siembra cuentas sintéticas en la BD del stack Docker de auditoría (127.0.0.1:55733).
// Como contra Docker no se pueden inyectar dobles de Firebase, los usuarios se crean directo en
// la BD (bcrypt) y luego se inicia sesión por API (el login no depende de proveedores externos).
import { createRequire } from 'node:module';
import { randomBytes, randomInt } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = resolve(fileURLToPath(new URL('../../../', import.meta.url)), 'Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación');
const req = createRequire(resolve(APP, 'apps/backend/package.json'));
const bcrypt = req('bcrypt');
const { Client } = req('pg');
const SCRATCH = process.env.AUD_SCRATCH;
if (!SCRATCH) throw new Error('Define AUD_SCRATCH');

const client = new Client({ host: '127.0.0.1', port: 55733, user: 'aud_synthetic', password: 'aud_synthetic_pwd', database: 'emergen_aud_docker' });
await client.connect();
const [{ current_database: name }] = (await client.query('SELECT current_database()')).rows;
if (name !== 'emergen_aud_docker') throw new Error('No es la BD Docker de auditoría');

const out = {};
async function cuenta(key, nombre, correo, rol, { plan = false, contacto = false, estado = 1, pin } = {}) {
  const password = 'Aud-' + randomBytes(9).toString('base64url');
  let pinId = null;
  if (pin) { const { rows: [p] } = await client.query('INSERT INTO pin(pin_hash) VALUES ($1) RETURNING pin_id', [await bcrypt.hash(pin, 12)]); pinId = p.pin_id; }
  const { rows: [u] } = await client.query(
    'INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,rol_id,estado_id,pin_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING usuario_id',
    [nombre, correo, await bcrypt.hash(password, 12), rol, estado, pinId]);
  if (plan) await client.query('INSERT INTO plan_usuario(usuario_id,plan_id,cupos_apadrinados_adq) VALUES ($1,2,0)', [u.usuario_id]);
  if (contacto) await client.query("INSERT INTO contacto_emergencia(usuario_id,num_emergencia,nombre_contacto) VALUES ($1,'+56988880000','Contacto')", [u.usuario_id]);
  out[key] = { id: u.usuario_id, correo, password, pin };
  console.log(`creado ${key}: id=${u.usuario_id} rol=${rol} estado=${estado}`);
}

await cuenta('admin', 'AUD Admin', 'aud.admin@example.invalid', 1, { estado: 1 });
await cuenta('soporte', 'AUD Soporte', 'aud.soporte@example.invalid', 2, { estado: 1 });
// Principal con acceso completo (estado 1) + PIN + plan + contacto, listo para perfil/SOS.
await cuenta('principal', 'AUD Principal', 'aud.principal@example.invalid', 3, { estado: 1, pin: String(randomInt(1000, 10000)), plan: true, contacto: true });
// Dos usuarios para IDOR (con acceso completo y PIN para poder editar perfil/contactos).
await cuenta('userA', 'AUD UserA', 'aud.usera@example.invalid', 3, { estado: 1, pin: '4321', contacto: false });
await cuenta('userB', 'AUD UserB', 'aud.userb@example.invalid', 3, { estado: 1, pin: '4321', contacto: false });
await client.end();
writeFileSync(resolve(SCRATCH, 'aud-docker-creds.json'), JSON.stringify(out, null, 1));
console.log('credenciales Docker sintéticas guardadas fuera del repositorio');
