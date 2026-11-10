const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = readFileSync(path.join(__dirname, 'main.cjs'), 'utf8');

for (const scenario of [
  { name: 'desarrollo explícito permite renderer local', packaged: false, environment: 'development', remote: true },
  { name: 'empaquetado ignora renderer del entorno', packaged: true, environment: 'development', remote: false },
  { name: 'producción sin empaquetar también usa los assets incluidos', packaged: false, environment: 'production', remote: false },
]) test(scenario.name, () => {
  const loaded = [];
  let preferences;
  class BrowserWindow {
    constructor(options) { preferences = options.webPreferences; this.webContents = { setWindowOpenHandler() {}, on() {} }; }
    loadURL(url) { loaded.push(['url', url]); }
    loadFile(file) { loaded.push(['file', file]); }
    static getAllWindows() { return []; }
  }
  const app = { isPackaged: scenario.packaged, on() {}, whenReady: () => ({ then: fn => fn() }) };
  vm.runInNewContext(source, { __dirname, process: { env: { NODE_ENV: scenario.environment,
    ELECTRON_RENDERER_URL: 'http://127.0.0.1:55440' }, platform: 'win32' }, require(name) {
    if (name === 'electron') return { app, BrowserWindow, protocol: { registerSchemesAsPrivileged() {}, handle() {} }, net: {}, shell: { openExternal() { throw new Error('External navigation blocked in test'); } } };
    if (name === 'node:path') return path;
    if (name === 'node:url') return require('node:url');
    if (name === './local-protocol.cjs') return require('./local-protocol.cjs');
    throw new Error('Unmocked import');
  } });
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0][0], 'url');
  assert.equal(loaded[0][1], scenario.remote ? 'http://127.0.0.1:55440' : 'emergen://panel/index.html');
  assert.equal(preferences.sandbox, true);
  assert.equal(preferences.contextIsolation, true);
  assert.equal(preferences.nodeIntegration, false);
});
