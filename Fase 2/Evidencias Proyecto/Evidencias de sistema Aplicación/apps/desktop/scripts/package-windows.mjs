import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { build, Platform, Arch } from 'electron-builder'
import { loadEnv } from 'vite'
import { publicApiUrls } from '../../../scripts/api-environment.mjs'

if (process.platform !== 'win32') throw new Error('Este comando genera el ejecutable local desde Windows.')
const desktop = fileURLToPath(new URL('../', import.meta.url))
const root = resolve(desktop, '../..')
const env = loadEnv('local-pc', root, 'VITE_')
const urls = publicApiUrls(env, 'local-pc')
if (env.VITE_DEPLOYMENT_ID !== 'ejecucion-local') throw new Error('Selecciona el despliegue ejecucion-local.')
for (const [script, args] of [
  ['node_modules/typescript/bin/tsc', ['-b']],
  ['node_modules/vite/bin/vite.js', ['build', '--mode', 'local-pc']],
]) {
  const result = spawnSync(process.execPath, [resolve(root, script), ...args], { cwd: desktop, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
const cache = resolve(root, 'node_modules/.cache')
mkdirSync(cache, { recursive: true })
const stage = mkdtempSync(resolve(cache, 'desktop-local-package-'))
cpSync(resolve(desktop, 'dist'), resolve(stage, 'dist'), { recursive: true })
mkdirSync(resolve(stage, 'electron'))
for (const file of ['main.cjs', 'local-protocol.cjs']) cpSync(resolve(desktop, 'electron', file), resolve(stage, 'electron', file))
// La aplicación empaquetada solo necesita Node/Electron y los assets ya compilados.
// La carpeta de preparación no contiene .env ni dependencias del resto del monorepo.
const version = '0.1.0'
writeFileSync(resolve(stage, 'package.json'), JSON.stringify({
  name: 'emergen-panel-local', version, private: true, main: 'electron/main.cjs',
  description: 'Panel administrativo EMERGEN para servicios locales', author: 'EMERGEN',
  dependencies: {},
}, null, 2))
const output = resolve(desktop, 'release')
const electronVersion = JSON.parse(readFileSync(resolve(root, 'node_modules/electron/package.json'), 'utf8')).version
const artifacts = await build({
  projectDir: desktop,
  targets: Platform.WINDOWS.createTarget('portable', Arch.x64),
  publish: 'never',
  config: {
    appId: 'cl.emergen.panel.local', productName: 'EMERGEN Panel Local',
    directories: { app: stage, output },
    files: ['dist/**/*', 'electron/**/*', 'package.json'],
    asar: true,
    // React y los clientes HTTP están incluidos por Vite; no copiar node_modules.
    beforeBuild: async () => false,
    electronVersion, electronDist: resolve(root, 'node_modules/electron/dist'),
    artifactName: 'EMERGEN-Panel-Local-${version}-${arch}.${ext}',
    win: { executableName: 'EMERGEN-Panel-Local', signExecutable: false, requestedExecutionLevel: 'asInvoker' },
    portable: { unpackDirName: 'EMERGEN-Panel-Local-' + version },
  },
})
const executable = artifacts.find(file => file.endsWith('.exe'))
if (!executable) throw new Error('No se generó el ejecutable portable.')
const content = readFileSync(executable)
if (content.subarray(0, 2).toString() !== 'MZ') throw new Error('El resultado no es un ejecutable Windows.')
writeFileSync(resolve(output, 'local-build.json'), JSON.stringify({
  version, electronVersion, deployment: env.VITE_DEPLOYMENT_ID, ...urls,
  builtAt: new Date().toISOString(), bytes: content.length,
  sha256: createHash('sha256').update(content).digest('hex'),
}, null, 2))
console.log('Ejecutable local: ' + executable)
