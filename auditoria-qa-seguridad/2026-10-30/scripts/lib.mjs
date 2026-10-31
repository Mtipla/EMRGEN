// Utilidades compartidas por las pruebas de la auditoría (solo entorno aislado 127.0.0.1:3710/3711).
import { appendFileSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DB } from './bd-aislada.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
export const APP = resolve(HERE, '../../../Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación');
export const EVID = resolve(HERE, '../evidencias');
// Objetivos configurables por entorno: por defecto el stack in-process (3710/3711); el stack
// Docker de auditoría usa AUD_NEST/AUD_FAST/AUD_DB_PORT/AUD_SECRETS_FILE.
export const NEST = process.env.AUD_NEST || 'http://127.0.0.1:3710';
export const FAST = process.env.AUD_FAST || 'http://127.0.0.1:3711';
export const ORIGIN = 'http://localhost:5181';
export const DB_PORT = process.env.AUD_DB_PORT || null; // override del puerto de BD para sql()
const SCRATCH = process.env.AUD_SCRATCH;
if (!SCRATCH) throw new Error('Define AUD_SCRATCH');
const SECRETS_FILE = process.env.AUD_SECRETS_FILE || 'aud-secrets.json';
export const creds = () => JSON.parse(readFileSync(resolve(SCRATCH, 'aud-creds.json'), 'utf8'));
export const secrets = () => JSON.parse(readFileSync(resolve(SCRATCH, SECRETS_FILE), 'utf8'));
export const req = createRequire(resolve(APP, 'apps/backend/package.json'));

// Nunca se registran tokens, contraseñas, PIN ni hashes en evidencias.
export function sanitize(value) {
  return JSON.stringify(value ?? null)
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]*/g, '[JWT]')
    .replace(/\$2[aby]\$\d\d\$[\w./]{53}/g, '[HASH]')
    .replace(/aud-firebase\.[\w-]+/g, '[FIREBASE-FALSO]');
}

export async function api(base, method, path, { token, body, headers = {}, raw } = {}) {
  const h = { ...headers };
  if (token) h.Authorization = `Bearer ${token}`;
  let payload = raw;
  if (body !== undefined) { payload = JSON.stringify(body); h['Content-Type'] ??= 'application/json'; }
  const r = await fetch(base + path, { method, headers: h, body: payload, redirect: 'manual' });
  const text = await r.text();
  let json; try { json = JSON.parse(text); } catch { json = undefined; }
  return { status: r.status, json, text, headers: r.headers };
}

export function fakeFirebase(email, { verified = true, ageSec = 0 } = {}) {
  return 'aud-firebase.' + Buffer.from(JSON.stringify({ email, verified, ageSec })).toString('base64url');
}

const results = [];
export function outFile(name) { return resolve(EVID, name); }
export async function caso(file, { id, req: requisito, desc, esperado, inferido = false }, fn) {
  let estado, observado, nota;
  try {
    const r = await fn();
    observado = r.observado; nota = r.nota;
    estado = r.estado ?? (r.ok ? 'APROBADO' : 'FALLIDO');
  } catch (e) { estado = 'BLOQUEADO'; observado = 'Error del arnés: ' + e.message; }
  const row = { id, requisito, desc, esperado, inferido, observado, estado, nota, t: new Date().toISOString() };
  results.push(row);
  appendFileSync(outFile(file), sanitize(row) + '\n');
  console.log(`${estado.padEnd(10)} ${id} ${desc}${estado === 'APROBADO' ? '' : ' -> ' + sanitize(observado).slice(0, 220)}`);
  return row;
}
export const resumen = () => results.reduce((a, r) => ((a[r.estado] = (a[r.estado] || 0) + 1), a), {});

export async function sql(text, params = []) {
  const { Client } = req('pg');
  const c = DB_PORT
    ? new Client({ host: '127.0.0.1', port: Number(DB_PORT), user: 'aud_synthetic', password: 'aud_synthetic_pwd', database: 'emergen_aud_docker' })
    : new Client({ host: '127.0.0.1', port: Number(DB.port), user: DB.user, database: DB.name });
  await c.connect();
  try { return (await c.query(text, params)).rows; } finally { await c.end(); }
}
