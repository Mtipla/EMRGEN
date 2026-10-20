// Desarrollo del panel de escritorio: levanta Vite y abre Electron apuntando a su URL.
// Al cerrar la ventana se detiene Vite y termina la tarea de Turborepo.
//
//   node scripts/dev.mjs                 -> backend local  (VITE_API_URL de .env)
//   node scripts/dev.mjs --mode docker   -> backend Docker (VITE_API_URL de .env.docker)
//
// El resto de los argumentos pasa a Electron (p. ej. --remote-debugging-port=9222).
import { spawn } from 'node:child_process'
import electron from 'electron'
import { createServer } from 'vite'

const argumentos = process.argv.slice(2)
const indiceModo = argumentos.indexOf('--mode')
const [, modo] = indiceModo === -1 ? [] : argumentos.splice(indiceModo, 2)

const server = await createServer({ mode: modo })
await server.listen()
server.printUrls()
console.log(`  ➜  API:     ${server.config.env.VITE_API_URL ?? '(VITE_API_URL sin definir)'}`)

const url = server.resolvedUrls?.local[0]
if (!url) throw new Error('Vite no entregó una URL local para el renderer.')

const env = { ...process.env, ELECTRON_RENDERER_URL: url }
// Las terminales de VS Code definen esta variable y Electron arrancaría como Node, sin ventana.
delete env.ELECTRON_RUN_AS_NODE

// Al importarlo desde Node, el paquete `electron` exporta la ruta de su ejecutable.
const ventana = spawn(electron, ['.', ...argumentos], { stdio: 'inherit', env })

async function terminar(codigo) {
  await server.close()
  process.exit(codigo)
}

ventana.on('close', (codigo) => void terminar(codigo ?? 0))
for (const evento of ['SIGINT', 'SIGTERM']) {
  process.on(evento, () => ventana.kill())
}
