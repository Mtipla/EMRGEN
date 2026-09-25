import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Un solo .env en la raíz del monorepo; Vite solo expone las variables VITE_*.
  envDir: '../../',
})
