import { ServiceUnavailableException } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Valores de ejemplo de `.env.example` (ej. `<INSERT_YOUR_PAYPAL_CLIENT_ID_HERE>`). */
const PLACEHOLDER = /^<INSERT_.*>$/;

/**
 * Carga el `.env` de la raíz del monorepo cuando el backend corre fuera de Docker
 * (`npm run start:dev --workspace=backend` se ejecuta con cwd = apps/backend).
 * En Docker no existe el archivo: las variables llegan desde docker-compose.yml.
 * Las variables ya definidas en el entorno no se sobrescriben.
 */
export function loadEnvFile(): void {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
  ];
  const file = candidates.find((path) => existsSync(path));
  if (file) process.loadEnvFile(file);
}

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
