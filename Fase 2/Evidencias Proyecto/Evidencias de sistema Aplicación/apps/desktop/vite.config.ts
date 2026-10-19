import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Rutas relativas: Electron carga el build con file:// (electron/main.cjs).
  base: './',
  // Un solo .env en la raíz del monorepo; Vite solo expone las variables VITE_*.
  // Con `--mode docker` se suma .env.docker (VITE_API_URL del backend de Docker).
  envDir: '../../',
  server: {
    // Puerto propio del panel, incluido en CORS_ORIGINS del backend. strictPort: si está
    // ocupado Vite se detiene con un error claro en vez de pasar a un puerto que CORS rechaza.
    port: 5175,
    strictPort: true,
  },
})
