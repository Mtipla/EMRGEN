// Proceso principal de Electron. El renderer (React) no tiene acceso a Node.js: toda la
// comunicación con el sistema pasa por HTTP hacia la API de NestJS (ver src/admin/api.ts).
const { app, BrowserWindow, shell } = require('electron')
const path = require('node:path')

// En desarrollo, scripts/dev.mjs levanta Vite y entrega aquí su URL.
const RENDERER_URL = process.env.ELECTRON_RENDERER_URL

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
    if (new URL(url).origin !== new URL(win.webContents.getURL()).origin) {
      event.preventDefault()
    }
  })

  if (RENDERER_URL) {
    void win.loadURL(RENDERER_URL)
  } else {
    void win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
