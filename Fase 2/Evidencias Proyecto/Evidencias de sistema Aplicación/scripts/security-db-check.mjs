// Only creates/stops its own disposable test container; never uses project .env/Compose.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const container = 'emergen-security-test-' + randomBytes(6).toString('hex');
const port = '55439';
const env = { ...process.env };
for (const name of Object.keys(env)) if (/^(DB_|JWT_|WHATSAPP_|VITE_|MEDICAL_|PAYPAL_|GOOGLE_|FIREBASE_|JSREPORT_|INTERNAL_API_|EMERGEN_|NODE_OPTIONS)/i.test(name)) delete env[name];
Object.assign(env, { EMERGEN_ENVIRONMENT: 'test', NODE_ENV: 'test', WHATSAPP_ENABLED: 'false',
  DB_HOST: '127.0.0.1', DB_PORT: port, DB_USER: 'synthetic', DB_PASSWORD: '', DB_NAME: 'emergen_security_test',
  JWT_SECRET: randomBytes(32).toString('hex'), MEDICAL_DATA_KEYS: 'test:' + randomBytes(32).toString('base64'),
  PYTHONDONTWRITEBYTECODE: '1', SECURITY_ISOLATED_DB: '1' });
function run(command, args, options = {}) {
  const r = spawnSync(command, args, { cwd: root, env, encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024, ...options });
  if (r.status !== 0) {
    const safe = (r.stderr || '').split('\n').filter(line => /^(  File |AssertionError:|ModuleNotFoundError:|ImportError:|TypeError:|ValueError:|NameError:|RuntimeError:)/.test(line)).join('\n');
    if (safe) console.error(safe);
    for (const line of (r.stdout || '').split('\n')) if (/PASS$|PASS;/.test(line)) console.log(line);
    throw new Error('Isolated step failed: ' + (command === 'docker' ? args[0] : args.at(-1)));
  }
  return r;
}
let created = false;
try {
  run('docker', ['run', '--rm', '-d', '--name', container, '--label', 'emergen.purpose=isolated-security-check',
    '--tmpfs', '/var/lib/postgresql/data:rw,nosuid,size=256m', '--memory=384m', '--cpus=1', '--pids-limit=128',
    '-p', '127.0.0.1:' + port + ':5432', '-e', 'POSTGRES_USER=synthetic', '-e', 'POSTGRES_DB=emergen_security_test',
    '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', 'postgres:15-alpine']);
  created = true;
  let ready = false;
  for (let i = 0; i < 20; i++) {
    const r = spawnSync('docker', ['exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'synthetic', '-d', 'emergen_security_test'], { encoding: 'utf8', windowsHide: true });
    if (r.status === 0) { ready = true; break; }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error('Isolated database not ready');
  // Only schema/catalog of the protected file into this NEW tmpfs DB. No seed scripts.
  for (const file of ['init.sql', 'migrations/20261026_whatsapp_finalizacion.sql',
    'migrations/20261028_contactos_antecedentes.sql', 'migrations/20261028_tickets_responsable.sql']) {
    run('docker', ['exec', '-i', container, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'synthetic', '-d', 'emergen_security_test'], { input: readFileSync(resolve(root, file), 'utf8') });
  }
  const node = run(process.execPath, ['--require', resolve(root, 'scripts/security-test-preload.cjs'), '--experimental-vm-modules',
    resolve(root, 'node_modules/jest/bin/jest.js'), '--config', 'test/jest-e2e.json', '--runInBand', '--no-cache',
    '--runTestsByPath', 'test/security-functional.e2e-spec.ts'], { cwd: resolve(root, 'apps/backend') });
  process.stdout.write((node.stdout || '') + (node.stderr || ''));
  const py = run(resolve(root, 'services/internal-api/.venv/Scripts/python.exe'), [resolve(root, 'scripts/security-python-checks.py')]);
  process.stdout.write(py.stdout);
  console.log('Synthetic integration completed; no real providers or existing database used.');
} catch (error) {
  // Never dump arbitrary DB/provider/test exception output or credential-bearing env.
  console.error(error.message, '(details suppressed; synthetic check only)');
  process.exitCode = 1;
} finally {
  if (created) {
    const r = spawnSync('docker', ['stop', container], { encoding: 'utf8', windowsHide: true });
    if (r.status !== 0) { console.error('Test container cleanup pending:', container); process.exitCode = 1; }
  }
}
