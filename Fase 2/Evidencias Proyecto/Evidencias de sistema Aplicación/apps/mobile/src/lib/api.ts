import { createEmergenApi } from '@repo/api-client';

/**
 * Configuración pública del frontend. Vite lee el .env de la raíz del monorepo (envDir)
 * y solo expone las variables con prefijo VITE_: nunca poner secretos con ese prefijo.
 *
 * En un teléfono real "localhost" es el propio teléfono: define VITE_API_URL con la IP
 * del PC en la red local (ej. http://192.168.1.20:3000).
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  paypalClientId: import.meta.env.VITE_PAYPAL_CLIENT_ID ?? '',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  googleMapsMapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || undefined,
};

/** Cliente del backend: pagos, validación de correo, reportes y geocodificación. */
export const api = createEmergenApi(env.apiUrl);
