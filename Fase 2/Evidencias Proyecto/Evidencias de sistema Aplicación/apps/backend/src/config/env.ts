import { ServiceUnavailableException } from '@nestjs/common';

/** Valores de ejemplo de `.env.example` (ej. `<INSERT_YOUR_PAYPAL_CLIENT_ID_HERE>`). */
const PLACEHOLDER = /^<INSERT_.*>$/;

/** Devuelve la variable o `undefined` si está vacía o todavía tiene el marcador de ejemplo. */
export function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  if (!value || PLACEHOLDER.test(value)) return undefined;
  return value;
}

/**
 * Devuelve la variable o lanza 503. Las integraciones la llaman en cada uso (no al
 * arrancar), así el backend levanta aunque falten credenciales de alguna API.
 */
export function requireEnv(name: string, integration: string): string {
  const value = readEnv(name);
  if (!value) {
    throw new ServiceUnavailableException(
      `${integration} no está configurado: define ${name} en el archivo .env (ver readme-apis.md).`,
    );
  }
  return value;
}
