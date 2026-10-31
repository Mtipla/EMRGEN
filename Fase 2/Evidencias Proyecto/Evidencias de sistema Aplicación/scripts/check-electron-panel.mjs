import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Run only against a security-check desktop build. Never starts an API or reads .env.
const root = fileURLToPath(new URL('../', import.meta.url));
const json = (file) => JSON.parse(readFileSync(join(root, file), 'utf8'));
const expected = json('apps/desktop/package.json').devDependencies.electron;
assert.equal(json('package-lock.json').packages['node_modules/electron'].version, expected);
if (!existsSync(join(root, 'node_modules/electron/package.json'))) {
  console.error('Electron: falta el paquete local. Desde la raíz workspace, ejecuta: npm ci --no-audit --no-fund');
  process.exit(1);
}
assert.equal(json('node_modules/electron/package.json').version, expected);
const binary = process.platform === 'win32' ? 'electron.exe'
  : process.platform === 'darwin' ? 'Electron.app/Contents/MacOS/Electron' : 'electron';
const executable = join(root, 'node_modules/electron/dist', binary);
if (!existsSync(join(root, 'node_modules/electron/dist/version')) || !existsSync(executable)) {
  console.error('Electron: falta el binario local. Desde la raíz workspace, ejecuta: node node_modules/electron/install.js (después de npm ci --no-audit --no-fund).');
  process.exit(1);
}
assert.equal(readFileSync(join(root, 'node_modules/electron/dist/version'), 'utf8').trim(), expected);
const env = { ...process.env };
for (const name of Object.keys(env)) {
  if (/^(DB_|JWT_|WHATSAPP_|VITE_|MEDICAL_|PAYPAL_|GOOGLE_|FIREBASE_|JSREPORT_|INTERNAL_API_|EMERGEN_|ELECTRON_|NODE_OPTIONS|DEBUG)|TOKEN|PASSWORD|SECRET|API_KEY/i.test(name)) delete env[name];
}
Object.assign(env, { NODE_ENV: 'production', EMERGEN_ENVIRONMENT: 'test' });
const query = spawnSync(executable, ['-p', 'JSON.stringify({electron:process.versions.electron,chrome:process.versions.chrome,node:process.versions.node,platform:process.platform,arch:process.arch})'],
  { env: { ...env, ELECTRON_RUN_AS_NODE: '1' }, encoding: 'utf8', windowsHide: true, timeout: 15000 });
assert.equal(query.status, 0, 'Native executable version query failed');
const native = JSON.parse(query.stdout.trim());
assert.equal(native.electron, expected);
assert.equal(native.platform, process.platform);
assert.equal(native.arch, process.arch);
const cache = join(root, 'node_modules/.cache');
mkdirSync(cache, { recursive: true });
const profile = mkdtempSync(join(cache, 'electron-panel-profile-'));
const marker = randomUUID();
writeFileSync(join(profile, '.emergen-test-profile'), marker);
Object.assign(env, { EMERGEN_ELECTRON_TEST_PROFILE: profile, EMERGEN_ELECTRON_EXPECTED_VERSION: expected });
const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
try {
  const child = spawnSync(executable, [join(root, 'scripts/electron-panel-fixture.cjs'), '--no-first-run'],
    { cwd: root, env, encoding: 'utf8', windowsHide: true, timeout: 45000, maxBuffer: 2 * 1024 * 1024 });
  const prefix = 'EMERGEN_ELECTRON_CHECK:';
  const line = (child.stdout || '').split(/\r?\n/).find((value) => value.startsWith(prefix));
  const result = line ? JSON.parse(line.slice(prefix.length)) : null;
  if (!result || child.status !== 0 || !result.ok) {
    console.error(JSON.stringify({ check: 'electron-panel', ok: false, result,
      exit: child.status, spawnError: child.error?.code, stderrLines: (child.stderr || '').split(/\r?\n/).filter(Boolean).length }));
    process.exitCode = 1;
  } else {
    assert.equal(result.cases.length, 6);
    const evidence = { checkedAtUTC: new Date().toISOString(), ok: true, native,
      executable: relative(root, executable).replaceAll(sep, '/'), executableSha256: hash(executable),
      mainSha256: hash(join(root, 'apps/desktop/electron/main.cjs')),
      indexSha256: hash(join(root, 'apps/desktop/dist/index.html')), ...result };
    writeFileSync(join(cache, 'electron-panel-check-latest.json'), JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify(evidence));
  }
} finally {
  // Only the newly created, marked profile under this project's cache can be removed.
  const resolvedProfile = realpathSync(profile);
  assert.ok(resolvedProfile.startsWith(realpathSync(cache) + sep));
  assert.ok(resolvedProfile.split(sep).at(-1).startsWith('electron-panel-profile-'));
  assert.equal(readFileSync(join(profile, '.emergen-test-profile'), 'utf8'), marker);
  rmSync(resolvedProfile, { recursive: true });
}
