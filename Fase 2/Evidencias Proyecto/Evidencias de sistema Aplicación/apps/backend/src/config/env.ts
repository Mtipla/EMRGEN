import { ServiceUnavailableException } from '@nestjs/common';


const PLACEHOLDER = /^<INSERT_.*>$/;


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
