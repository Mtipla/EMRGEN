const { test } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { bundledPath, sameOrigin } = require('./local-protocol.cjs')

test('el protocolo solo sirve archivos del directorio de assets', () => {
  const directory = path.resolve(__dirname, '../dist')
  assert.equal(bundledPath('emergen://panel/assets/app.js', directory), path.join(directory, 'assets/app.js'))
  for (const address of [
    'emergen://panel/%2e%2e%2fsecret.env',
    'emergen://panel/%2e%2e%5csecret.env',
    'emergen://otro/index.html',
    'https://panel/index.html',
    'emergen://panel/%00',
  ]) assert.equal(bundledPath(address, directory), undefined)
})

test('navegación: compara protocolo y host de orígenes personalizados', () => {
  assert.equal(sameOrigin('emergen://panel/index.html#/usuarios', 'emergen://panel/index.html'), true)
  assert.equal(sameOrigin('emergen://otro/index.html', 'emergen://panel/index.html'), false)
  assert.equal(sameOrigin('file:///secret', 'emergen://panel/index.html'), false)
  assert.equal(sameOrigin('https://panel/index.html', 'emergen://panel/index.html'), false)
})
