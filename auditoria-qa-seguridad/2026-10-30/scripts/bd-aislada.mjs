// BD PostgreSQL desechable para la auditoría QA/seguridad del 30-10-2026.
// Uso: node bd-aislada.mjs up | down
// - Solo crea/elimina su propio contenedor (nombre y etiqueta fijos de esta auditoría).
// - Datos en tmpfs: al detener el contenedor desaparecen.
// - init.sql y las migraciones se LEEN y se envían por stdin; nunca se modifican.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = fileURLToPath(new URL('../../../', import.meta.url));
const APP = resolve(REPO, 'Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación');
export const DB = { container: 'emergen-aud-claude-db', port: '55710', user: 'aud_synthetic', name: 'emergen_aud_test' };
const SCHEMA = ['init.sql', 'migrations/20261026_whatsapp_finalizacion.sql',
  'migrations/20261028_contactos_antecedentes.sql', 'migrations/20261028_tickets_responsable.sql'];

const sh = (args, opts = {}) => spawnSync('docker', args, { encoding: 'utf8', windowsHide: true, ...opts });
const sha = (file) => createHash('sha256').update(readFileSync(resolve(APP, file))).digest('hex');

function up() {
  const before = sha('init.sql');
  const r = sh(['run', '--rm', '-d', '--name', DB.container, '--label', 'emergen.purpose=claude-qa-audit-2026-10-30',
    '--tmpfs', '/var/lib/postgresql/data:rw,nosuid,size=256m', '--memory=512m', '--cpus=1', '--pids-limit=256',
    '-p', `127.0.0.1:${DB.port}:5432`, '-e', `POSTGRES_USER=${DB.user}`, '-e', `POSTGRES_DB=${DB.name}`,
    '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', 'postgres:15-alpine']);
  if (r.status !== 0) throw new Error('docker run falló: ' + r.stderr.trim());
  // pg_isready responde también durante el servidor temporal de initdb: exigir 3 éxitos seguidos.
  let ok = 0;
  for (let i = 0; i < 60 && ok < 3; i++) {
    const p = sh(['exec', DB.container, 'pg_isready', '-h', '127.0.0.1', '-U', DB.user, '-d', DB.name]);
    ok = p.status === 0 ? ok + 1 : 0;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 700);
  }
  if (ok < 3) throw new Error('BD no quedó lista');
  for (const file of SCHEMA) {
    const p = sh(['exec', '-i', DB.container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', DB.user, '-d', DB.name],
      { input: readFileSync(resolve(APP, file), 'utf8') });
    if (p.status !== 0) throw new Error(`Esquema ${file} falló: ${p.stderr.split('\n').slice(0, 3).join(' ')}`);
    console.log(`aplicado: ${file}`);
  }
  const after = sha('init.sql');
  console.log(`init.sql SHA-256 antes=${before} después=${after} ${before === after ? 'SIN CAMBIOS' : 'CAMBIÓ (!)'}`);
  console.log(`BD aislada lista en 127.0.0.1:${DB.port}/${DB.name}`);
}

function down() {
  const r = sh(['stop', DB.container]);
  console.log(r.status === 0 ? `contenedor ${DB.container} detenido y eliminado (--rm, tmpfs)` : `no se pudo detener: ${r.stderr.trim()}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const action = { up, down }[process.argv[2]];
  if (action) action(); else console.error('Uso: node bd-aislada.mjs up|down');
}
