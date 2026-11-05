import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

// vite.config.ts exporta una función (recibe { command, mode }); mergeConfig no fusiona
// configs en forma de callback. Se resuelve primero para modo test antes de fusionar.
const base =
  typeof viteConfig === 'function'
    ? viteConfig({ command: 'serve', mode: 'test' })
    : viteConfig

export default mergeConfig(base, defineConfig({
  test: {
    environment: 'jsdom',
    env: { VITE_PAYPAL_CLIENT_ID: 'test-client' },
  },
}))
