// Levanta NestJS (backend-aislado.cjs) en 127.0.0.1:3710 y FastAPI (uvicorn) en 127.0.0.1:3711
// contra la BD aislada (bd-aislada.mjs up). Se queda en primer plano; Ctrl+C detiene ambos.
// Variables del host relacionadas con la app se eliminan: nunca se usa el .env del equipo.
// Secretos JWT y de cifrado médico: aleatorios por ejecución; se guardan solo en AUD_SCRATCH
// (fuera del repositorio) para que las pruebas puedan firmar tokens de prueba (expirados, etc.).
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync, createWriteStream } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DB } from './bd-aislada.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO = resolve(HERE, '../../..');
const APP = resolve(REPO, 'Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación');
const EVID = resolve(HERE, '../evidencias');
const SCRATCH = process.env.AUD_SCRATCH;
if (!SCRATCH) throw new Error('Define AUD_SCRATCH (directorio temporal fuera del repo)');
mkdirSync(resolve(SCRATCH, 'flags'), { recursive: true });

const env = { ...process.env };
for (const k of Object.keys(env))
  if (/^(DB_|JWT_|WHATSAPP_|VITE_|MEDICAL_|PAYPAL_|GOOGLE_|FIREBASE_|JSREPORT_|INTERNAL_API_|EMERGEN_|CORS_|NODE_OPTIONS|PORT$|HOST$)/i.test(k)) delete env[k];
const jwtSecret = randomBytes(32).toString('hex');
Object.assign(env, {
  EMERGEN_ENVIRONMENT: 'test', NODE_ENV: 'test', WHATSAPP_ENABLED: 'false', EMERGEN_DEPLOYMENT_ID: 'aud-claude-20261030',
  DB_HOST: '127.0.0.1', DB_PORT: DB.port, DB_USER: DB.user, DB_PASSWORD: '', DB_NAME: DB.name,
  JWT_SECRET: jwtSecret, MEDICAL_DATA_KEYS: 'aud1:' + randomBytes(32).toString('base64'),
  CORS_ORIGINS: 'http://localhost:5181,http://localhost:5182,http://localhost:5183',
  PYTHONDONTWRITEBYTECODE: '1',
  // Límites altos para no bloquear el volumen de altas/logins de la batería funcional.
  // /compras/precio queda en su valor por defecto (60/min) para la prueba dedicada de rate-limit.
  API_IDENTITY_PER_15_MINUTES: '2000', API_LOGIN_PER_MINUTE: '2000',
  API_AUX_PER_MINUTE: '2000', API_PURCHASE_PER_MINUTE: '2000', API_EXPORT_PER_MINUTE: '2000',
  INTERNAL_API_TICKETS_PER_15_MINUTES: '1000',
});
writeFileSync(resolve(SCRATCH, 'aud-secrets.json'), JSON.stringify({ jwtSecret }));

const children = [];
function start(name, cmd, args, cwd, extra) {
  const out = createWriteStream(resolve(EVID, `${name}.log`), { flags: 'w' });
  const child = spawn(cmd, args, { cwd, env: { ...env, ...extra }, windowsHide: true });
  child.stdout.pipe(out); child.stderr.pipe(out);
  child.on('exit', (code) => console.log(`${name} terminó con código ${code}`));
  children.push(child);
}
start('backend', process.execPath, [resolve(HERE, 'backend-aislado.cjs')], APP, {
  PORT: '3710', AUD_BACKEND_DIST: resolve(APP, 'node_modules/.cache/emergen-aud-claude/dist'),
  AUD_PROVIDER_LOG: resolve(EVID, 'proveedores-falsos.jsonl'), AUD_FLAGS_DIR: resolve(SCRATCH, 'flags'),
});
// AUD_PYTHON: venv propio de la auditoría (el .venv del equipo carecía de bcrypt; ver hallazgo QA-ENV-01).
start('fastapi', process.env.AUD_PYTHON || resolve(APP, 'services/internal-api/.venv/Scripts/python.exe'),
  ['-B', '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '3711', '--timeout-keep-alive', '5'],
  resolve(APP, 'services/internal-api'), {});
console.log('APIs aisladas iniciándose: NestJS 127.0.0.1:3710, FastAPI 127.0.0.1:3711');
const stop = () => { for (const c of children) c.kill(); process.exit(0); };
process.on('SIGINT', stop); process.on('SIGTERM', stop);
