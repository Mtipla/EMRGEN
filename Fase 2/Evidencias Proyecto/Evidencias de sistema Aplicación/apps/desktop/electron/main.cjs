// Proceso principal de Electron. El renderer (React) no tiene acceso a Node.js: toda la
// comunicación con el sistema pasa por HTTP hacia la API de NestJS (ver src/admin/api.ts).
const { app, BrowserWindow, shell, protocol, net } = require('electron')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { PANEL_URL, bundledPath, sameOrigin } = require('./local-protocol.cjs')

// Origen estable para el ejecutable: permite CORS explícito y almacenamiento local.
protocol.registerSchemesAsPrivileged([{
  scheme: 'emergen',
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
}])

// En desarrollo, scripts/dev.mjs levanta Vite y entrega aquí su URL.
const RENDERER_URL = !app.isPackaged && process.env.NODE_ENV === 'development'
  ? process.env.ELECTRON_RENDERER_URL : undefined

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  })

  // Los enlaces externos se abren en el navegador del sistema, nunca dentro del panel.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url)
    return { action: 'deny' }
  })
  // El panel no navega fuera de su propio origen.
  win.webContents.on('will-navigate', (event, url) => {
    if (!sameOrigin(url, win.webContents.getURL())) {
      event.preventDefault()
    }
  })

  if (RENDERER_URL) {
    void win.loadURL(RENDERER_URL)
  } else {
    void win.loadURL(PANEL_URL)
  }
}

app.whenReady().then(() => {
  const directory = path.resolve(__dirname, '../dist')
  protocol.handle('emergen', async (request) => {
    try {
      const file = bundledPath(request.url, directory)
      if (!file || !['GET', 'HEAD'].includes(request.method)) return new Response('Not found', { status: 404 })
      return await net.fetch(pathToFileURL(file).href)
    } catch {
      return new Response('Not found', { status: 404 })
    }
  })
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
