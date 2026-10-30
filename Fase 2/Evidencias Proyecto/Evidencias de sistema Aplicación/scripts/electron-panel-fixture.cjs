// Native Electron/Chromium check of the real main.cjs + built renderer; APIs are doubles.
require('./security-test-preload.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const electron = require('electron');
const { app, session } = electron;
const root = path.resolve(__dirname, '..');
const profile = process.env.EMERGEN_ELECTRON_TEST_PROFILE;
assert.ok(profile && fs.existsSync(path.join(profile, '.emergen-test-profile')));
app.setPath('userData', profile);
fs.mkdirSync(path.join(profile, 'session'), { recursive: true });
app.setPath('sessionData', path.join(profile, 'session'));
for (const flag of ['disable-background-networking', 'disable-component-update', 'no-proxy-server']) app.commandLine.appendSwitch(flag);
app.commandLine.appendSwitch('host-resolver-rules', 'MAP * ~NOTFOUND');
const cases = [];
const calls = [];
let activeCase = 'bootstrap';
let window;
let done = false;
const deadline = setTimeout(() => finish(new Error('Timeout')), 30000);
function finish(error) {
  if (done) return;
  done = true;
  clearTimeout(deadline);
  console.log('EMERGEN_ELECTRON_CHECK:' + JSON.stringify({ ok: !error, cases,
    failedCase: error ? activeCase : undefined, errorType: error?.name,
    mockRequests: calls.length, network: 'http/https intercepted in-memory; websockets denied',
    screenshot: error ? undefined : 'node_modules/.cache/electron-panel-check.png' }));
  for (const item of electron.BrowserWindow.getAllWindows()) item.destroy();
  app.exit(error ? 1 : 0);
}
process.on('uncaughtException', finish);
process.on('unhandledRejection', finish);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const evaluate = (code) => window.webContents.executeJavaScript(code);
async function waitFor(code) {
  const until = Date.now() + 5000;
  while (Date.now() < until) {
    if (await evaluate(code)) return;
    await delay(40);
  }
  throw new Error('UI expectation timed out');
}
async function step(name, fn) {
  activeCase = name;
  await fn();
  cases.push({ name, passed: true });
}
const user = { usuario_ID: 7, nombre_usuario: 'Synthetic QA', correo_usuario: 'qa@emergen-test.invalid', rol_ID: 1, estado_ID: 1 };
const headers = { 'content-type': 'application/json', 'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'Content-Type,Authorization' };
const response = (body, status = 200) => new Response(body === null ? null : JSON.stringify(body), { status, headers });
async function mockApi(request) {
  const url = new URL(request.url);
  if (!['http://127.0.0.1:55440', 'http://127.0.0.1:55441'].includes(url.origin)) return response({ error: 'Blocked in test' }, 403);
  if (request.method === 'OPTIONS') return response(null, 204);
  const authorized = request.headers.get('authorization') === 'Bearer synthetic-electron-token';
  calls.push({ path: url.pathname, method: request.method, authorized });
  if (request.method === 'POST' && url.pathname === '/usuarios/login') {
    const body = await request.json();
    return body.correo_usuario === user.correo_usuario && body.password === 'ValidFixturePassword'
      ? response({ access_token: 'synthetic-electron-token', usuario: user })
      : response({ message: 'Synthetic rejected credentials' }, 401);
  }
  if (!authorized) return response({ message: 'Synthetic unauthorized' }, 401);
  if (request.method !== 'GET') return response({ error: 'Unexpected mutation blocked' }, 405);
  if (url.pathname === '/admin/usuarios') return response([user]);
  if (url.pathname === '/admin/auditoria') return response([{ bitacora_sistema_ID: 501, fecha_accion: '2026-01-01T00:00:00Z',
    accion_realizada: 'SYNTHETIC_AUDIT_ROW', tipo_accion: 'LECTURA', entidad_afectada: 'SISTEMA', resultado: 'EXITOSA',
    cambios: null, usuario_ID: 7, nombre_usuario: user.nombre_usuario, rol_actor_ID: 1, usuario_afectado_ID: null,
    nombre_usuario_afectado: null, aplicacion_ID: 2, origen_aplicacion: 'DESKTOP' }]);
  if (url.pathname === '/admin/alertas') return response({ total: 1, activas: 1, alertas: [{
    alerta_id: 701, usuario_id: 7, nombre_usuario: user.nombre_usuario, correo_usuario: user.correo_usuario,
    estado_alerta: 'ACTIVA', prioridad_id: 1, prioridad: 'SYNTHETIC_ALERT_PRIORITY', mensaje: 'Synthetic only',
    ubicacion: null, fecha_creacion: '2026-01-01T00:00:00Z', fecha_cierre: null }] });
  if (url.pathname === '/internal/v1/tickets-soporte/estados') return response([{ estado_id: 1, nombre: 'ABIERTO' }]);
  if (url.pathname === '/internal/v1/tickets-soporte') return response([{ ticket_id: 801, usuario_id: 7,
    nombre_usuario: user.nombre_usuario, correo_usuario: user.correo_usuario, descripcion: 'Synthetic only',
    estado: 'ABIERTO', solucion: null, categoria_id: 1, categoria: 'SYNTHETIC_TICKET_CATEGORY' }]);
  return response({ error: 'Unspecified fixture route' }, 503);
}
async function login(password) {
  await evaluate('(function(){const values=' + JSON.stringify([user.correo_usuario, password]) +
    ';const inputs=[document.querySelector("input[type=email]"),document.querySelector("input[type=password]")];' +
    'inputs.forEach((input,i)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(input,values[i]);input.dispatchEvent(new Event("input",{bubbles:true}));});})()');
  await delay(80);
  await evaluate('document.querySelector("form.desktop-admin-login").requestSubmit()');
}
async function checkPanel() {
  try {
    await step('native-runtime-and-login-screen', async () => {
      assert.equal(process.versions.electron, process.env.EMERGEN_ELECTRON_EXPECTED_VERSION);
      await waitFor('!!document.querySelector("form.desktop-admin-login")');
      const preferences = window.webContents.getLastWebPreferences();
      assert.equal(preferences.nodeIntegration, false);
      assert.equal(preferences.contextIsolation, true);
      assert.equal(preferences.sandbox, true);
      assert.equal(await evaluate('typeof require === "undefined" && typeof process === "undefined"'), true);
    });
    await step('invalid-login-rejected', async () => {
      await login('InvalidFixturePassword');
      await waitFor('document.querySelector("[role=alert]")?.textContent.includes("incorrectos")');
      assert.equal(await evaluate('!!document.querySelector(".desktop-admin-nav")'), false);
    });
    await step('admin-login-and-audit-render', async () => {
      await login('ValidFixturePassword');
      await waitFor('!!document.querySelector(".desktop-admin-nav")');
      await evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.trim()==="Listar bitácora").click()');
      await waitFor('document.body.textContent.includes("SYNTHETIC_AUDIT_ROW")');
      assert.ok(calls.some((call) => call.path === '/admin/auditoria' && call.authorized));
    });
    await step('sos-monitor-read-only', async () => {
      await evaluate('document.querySelector("a[href=\\"#/administracion/alertas\\"]").click()');
      await waitFor('document.body.textContent.includes("SYNTHETIC_ALERT_PRIORITY")');
      assert.ok(calls.some((call) => call.path === '/admin/alertas' && call.authorized));
    });
    await step('tickets-second-api-and-render', async () => {
      await evaluate('document.querySelector("a[href=\\"#/administracion/tickets\\"]").click()');
      await waitFor('document.body.textContent.includes("SYNTHETIC_TICKET_CATEGORY")');
      assert.ok(calls.some((call) => call.path === '/internal/v1/tickets-soporte' && call.authorized));
      // Wait for Chromium to paint the React update before capturing a hidden window.
      await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
      const capture = await window.webContents.capturePage();
      fs.writeFileSync(path.join(root, 'node_modules/.cache/electron-panel-check.png'), capture.toPNG());
    });
    await step('logout-and-reload-remain-logged-out', async () => {
      await evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.trim()==="Cerrar sesión").click()');
      await waitFor('!!document.querySelector("form.desktop-admin-login")');
      const loaded = new Promise((resolve) => window.webContents.once('did-finish-load', resolve));
      window.webContents.reload();
      await loaded;
      await waitFor('!!document.querySelector("form.desktop-admin-login")');
      assert.equal(await evaluate('!!document.querySelector(".desktop-admin-nav")'), false);
    });
    finish();
  } catch (error) { finish(error); }
}
app.whenReady().then(() => {
  const partition = 'emergen-panel-check-' + process.pid;
  const isolated = session.fromPartition(partition);
  for (const current of [session.defaultSession, isolated]) {
    current.protocol.handle('http', mockApi);
    current.protocol.handle('https', () => response({ error: 'External network blocked' }, 403));
    current.webRequest.onBeforeRequest({ urls: ['ws://*/*', 'wss://*/*'] }, (_details, callback) => callback({ cancel: true }));
    current.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  }
  const mainFile = path.join(root, 'apps/desktop/electron/main.cjs');
  const originalLoad = Module._load;
  Module._load = function (name, parent, isMain) {
    if (name === 'electron' && parent?.filename === mainFile) return new Proxy(electron, {
      get(target, property) {
        if (property === 'shell') return { openExternal() { throw new Error('External navigation blocked'); } };
        if (property === 'BrowserWindow') return class {
          constructor(options) {
            window = new target.BrowserWindow({ ...options, show: false,
              webPreferences: { ...options.webPreferences, partition } });
            window.webContents.once('did-finish-load', checkPanel);
            return window;
          }
          static getAllWindows() { return target.BrowserWindow.getAllWindows(); }
        };
        return target[property];
      },
    });
    return originalLoad.call(this, name, parent, isMain);
  };
  require(mainFile);
}).catch(finish);
