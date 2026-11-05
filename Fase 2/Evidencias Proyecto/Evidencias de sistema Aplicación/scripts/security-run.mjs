import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const [mode, ...args] = process.argv.slice(2);
const env = { ...process.env };
for (const name of Object.keys(env)) {
  if (/^(DB_|JWT_|WHATSAPP_|VITE_|MEDICAL_|PAYPAL_|GOOGLE_|FIREBASE_|JSREPORT_|INTERNAL_API_|EMERGEN_|NODE_OPTIONS)/i.test(name)) delete env[name];
}
Object.assign(env, { EMERGEN_ENVIRONMENT: 'test', NODE_ENV: 'test', WHATSAPP_ENABLED: 'false',
  JWT_SECRET: randomBytes(32).toString('hex'), PYTHONDONTWRITEBYTECODE: '1' });
const preload = resolve(root, 'scripts/security-test-preload.cjs');
let command = process.execPath;
let childArgs;
let cwd = root;
if (mode === 'jest') {
  cwd = resolve(root, 'apps/backend');
  childArgs = ['--require', preload, '--experimental-vm-modules', resolve(root, 'node_modules/jest/bin/jest.js'), '--runInBand', '--no-cache', ...args];
} else if (mode === 'vitest') {
  childArgs = ['--require', preload, resolve(root, 'node_modules/vitest/vitest.mjs'), 'run', ...args];
} else if (mode === 'python-config') {
  command = resolve(root, 'services/internal-api/.venv/Scripts/python.exe');
  const program = `import sys,runpy,socket
sys.dont_write_bytecode=True
socket.socket.connect=lambda *a,**k: (_ for _ in ()).throw(RuntimeError('Network blocked'))
sys.path.insert(0,sys.argv[1])
try:
 ns=runpy.run_path(sys.argv[2])
 actual=ns['Settings']; calls=[]
 def checked(*a,**k):
  calls.append(1)
  return actual(*a,**k)
 ns['test_production_requires_explicit_configuration'].__globals__['Settings']=checked
 ns['test_production_requires_explicit_configuration']()
 ns['test_production_without_explicit_tls_policy_is_rejected']()
 assert len(calls)==6
 print('Python configuration: 2 tests / 6 settings cases PASS; no DB, env files or providers')
except Exception as error:
 print('Python configuration failed: '+type(error).__name__+'; input values omitted')
 sys.exit(1)`;
  childArgs = ['-B', '-c', program, resolve(root, 'services/internal-api'), resolve(root, 'services/internal-api/tests/test_deployment_config.py')];
} else if (mode === 'build') {
  const allowed = new Set(['backend', 'web', 'mobile', 'desktop', '@repo/api-client']);
  if (!allowed.has(args[0])) throw new Error('Unknown workspace');
  env.NODE_ENV = 'production';
  Object.assign(env, { VITE_API_URL: 'http://127.0.0.1:55440', VITE_INTERNAL_API_URL: 'http://127.0.0.1:55441',
    VITE_DEPLOYMENT_ID: 'synthetic', VITE_FIREBASE_API_KEY: 'synthetic-public-config',
    VITE_FIREBASE_PROJECT_ID: 'synthetic', VITE_FIREBASE_AUTH_DOMAIN: 'synthetic.invalid' });
  // Offline build in explicitly local mode; never invokes hosting/readiness scripts.
  childArgs = [resolve(process.execPath, '../node_modules/npm/bin/npm-cli.js'), 'run', args[0] === '@repo/api-client' ? 'check-types' : 'build', '--workspace=' + args[0],
    ...(['web', 'mobile', 'desktop'].includes(args[0]) ? ['--', '--mode', 'security-check'] : []), ...args.slice(1)];
} else throw new Error('Use jest, vitest, python-config or build');
const result = spawnSync(command, childArgs, { cwd, env, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, windowsHide: true });
const redact = (s = '') => s.replace(/\beyJ[\w=-]+\.[\w=-]+\.[\w=-]+/g, '[TOKEN REDACTADO]')
  .replace(/\$2[aby]\$[\w./$]+/g, '[HASH REDACTADO]');
process.stdout.write(redact(result.stdout));
process.stderr.write(redact(result.stderr));
if (result.error) console.error('Isolated command could not start:', result.error.code);
process.exitCode = result.status ?? 1;
