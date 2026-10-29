/** Rutas de las páginas públicas; App.tsx crea una ruta por cada entrada. */
export const RUTAS_PUBLICAS = {
  inicio: '/',
  'como-funciona': '/como-funciona',
  descargar: '/descargar',
  preguntas: '/preguntas-frecuentes',
  premium: '/premium',
} as const

export type PublicView = keyof typeof RUTAS_PUBLICAS
