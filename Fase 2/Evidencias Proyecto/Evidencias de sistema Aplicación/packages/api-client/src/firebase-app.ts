import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

/**
 * Inicializa el SDK web de Firebase una sola vez (reutiliza la app si ya existe).
 * La configuración llega desde las variables VITE_FIREBASE_* de cada app; no se escribe en el código.
 */
export function initFirebase(config: FirebaseOptions): { app: FirebaseApp; auth: Auth } {
  const app = getApps()[0] ?? initializeApp(config);
  return { app, auth: getAuth(app) };
}

/**
 * Analytics solo funciona en navegadores compatibles (no en tests ni en algunos WebViews
 * de Capacitor/Electron), por eso se carga de forma condicional.
 */
export async function initFirebaseAnalytics(app: FirebaseApp): Promise<Analytics | undefined> {
  if (!app.options.measurementId || !(await isSupported())) return undefined;
  return getAnalytics(app);
}
