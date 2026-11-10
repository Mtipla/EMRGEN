const path = require('node:path')

const PANEL_URL = 'emergen://panel/index.html'

function bundledPath(address, directory) {
  const url = new URL(address)
  if (url.protocol !== 'emergen:' || url.host !== 'panel') return undefined
  const pathname = decodeURIComponent(url.pathname)
  if (pathname.includes('\0')) return undefined
  const file = path.resolve(directory, '.' + (pathname === '/' ? '/index.html' : pathname))
  const relative = path.relative(directory, file)
  if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) return undefined
  return file
}

function sameOrigin(address, base) {
  try {
    const next = new URL(address)
    const current = new URL(base)
    return next.protocol === current.protocol && next.host === current.host
  } catch {
    return false
  }
}

module.exports = { PANEL_URL, bundledPath, sameOrigin }
