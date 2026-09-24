import { createEmergenApi, createFirebaseAuth, initFirebase } from '@repo/api-client'

/**
 * Configuración pública del frontend. Vite lee el .env de la raíz del monorepo (envDir)
 * y solo expone las variables con prefijo VITE_: nunca poner secretos con ese prefijo.
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  paypalClientId: import.meta.env.VITE_PAYPAL_CLIENT_ID ?? '',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  googleMapsMapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || undefined,
  firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
}

/** Cliente del backend: pagos, autenticación, reportes, geocodificación e indicadores económicos. */
export const api = createEmergenApi(env.apiUrl)

/** Registro, inicio de sesión y refresco de tokens con Firebase Authentication. */
export const firebaseAuth = createFirebaseAuth(env.firebaseApiKey)

/** SDK web de Firebase (app + Auth). Analytics: `initFirebaseAnalytics(firebase.app)`. */
export const firebase = initFirebase({
  apiKey: env.firebaseApiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
})
