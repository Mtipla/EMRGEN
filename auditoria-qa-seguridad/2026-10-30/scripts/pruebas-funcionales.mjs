// QA funcional por API frente a HU/CA/RF (fuentes: Historias Usuario con instructivo.xlsx,
// CRITERIOS DE ACEPTACIÓN.xlsx, Informe ERS.docx). Solo entorno aislado; datos sintéticos *.example.invalid.
// Uso: AUD_SCRATCH=<dir> node pruebas-funcionales.mjs   -> evidencias/resultados-funcionales.jsonl
import { randomBytes, randomUUID } from 'node:crypto';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { api, caso, creds, fakeFirebase, FAST, NEST, outFile, resumen, sql } from './lib.mjs';

const F = 'resultados-funcionales.jsonl';
writeFileSync(outFile(F), '');
const tag = randomBytes(3).toString('hex');
const pass = () => 'Aud-' + randomBytes(9).toString('base64url');
const C = creds();
const flags = resolve(process.env.AUD_SCRATCH, 'flags');
mkdirSync(flags, { recursive: true });

async function staffToken(key) {
  const r = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: C[key].correo, password: C[key].password } });
  return r.json?.access_token;
}
const ADMIN = await staffToken('admin');
const SOPORTE = await staffToken('soporte');

// ---------- HU-01 Registro (RF1, CA-01.1, CA-01.2) ----------
const U1 = { nombre_usuario: 'AUD Principal Uno', correo_usuario: `aud.p1.${tag}@example.invalid`, password: pass() };
const U2 = { nombre_usuario: 'AUD Principal Dos', correo_usuario: `aud.p2.${tag}@example.invalid`, password: pass() };
const U3 = { nombre_usuario: 'AUD Sin Plan', correo_usuario: `aud.p3.${tag}@example.invalid`, password: pass() };
const ids = {};

await caso(F, { id: 'QA-001', req: 'HU-01 E1 / CA-01.1 / RF1', desc: 'Pre-validación de registro con datos válidos', esperado: '201 {valido:true}' }, async () => {
  const