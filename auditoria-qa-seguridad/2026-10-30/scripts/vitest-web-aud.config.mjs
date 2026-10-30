// Configuración temporal SOLO para la auditoría: apps/web/vitest.config.ts falla con
// "Cannot merge config in form of callback" porque vite.config.ts exporta una función.
// Aquí se resuelve primero la función y luego se combina (es la corrección recomendada QA-REG-02).
// Uso (desde la carpeta de la aplicación): vitest run --root apps/web --config <este archivo>
import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const webDir = resolve(process.cwd(), 'apps/web');
const viteConfig = (await import(pathToFileURL(resolve(webDir, 'vite.config.ts')).href)).default;
const base = typeof viteConfig === 'function' ? viteConfig({ command: 'serve', mode: 'security-check' }) : viteConfig;

export default mergeConfig(base, defineConfig({
  root: webDir,
  test: { environment: 'jsdom', env: { VITE_PAYPAL_CLIENT_ID: 'test-client' } },
}));
