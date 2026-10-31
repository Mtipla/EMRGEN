import { isAbsolute } from 'node:path';
import { existsSync } from 'node:fs';

type Environment = Record<string, unknown>;
const value = (env: Environment, key: string) => {
  const current = env[key];
  if (typeof current === 'string') return current.trim();
  return typeof current === 'number' || typeof current === 'boolean'
    ? String(current)
    : '';
};
const missing = (text: string) =>
  !text || /<INSERT_|REEMPLAZAR|CHANGE_ME/i.test(text);

/** Valida antes de abrir conexiones; nunca imprime valores de secretos. */
export function validateRuntimeConfig(env: Environment): Environment {
  const sslMode = value(env, 'DB_SSLMODE') || 'disable';
  if (!['disable', 'verify-full'].includes(sslMode))
    throw new Error(
      'DB_SSLMODE: usa disable en red privada o verify-full con CA del proveedor.',
    );
  if (
    sslMode === 'verify-full' &&
    (!value(env, 'DB_SSL_CA_FILE') || !existsSync(value(env, 'DB_SSL_CA_FILE')))
  ) {
    throw new Error(
      'DB_SSL_CA_FILE: se necesita el archivo CA para verificar el servidor PostgreSQL.',
    );
  }
  for (const key of ['PORT', 'DB_PORT']) {
    const port = value(env, key);
    if (
      port &&
      (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535)
    ) {
      throw new Error(`${key}: debe ser un puerto entre 1 y 65535.`);
    }
  }
  const environment =
    value(env, 'EMERGEN_ENVIRONMENT') ||
    value(env, 'NODE_ENV') ||
    'development';
  if (!['development', 'test', 'staging', 'production'].includes(environment)) {
    throw new Error(
      'EMERGEN_ENVIRONMENT: usa development, test, staging o production.',
    );
  }
  if (!['staging', 'production'].includes(environment)) return env;
  for (const key of ['DB_SSLMODE', 'JSREPORT_URL']) {
    if (missing(value(env, key))) throw new Error(`${key}: debe configurarse explícitamente en ${environment}.`);
  }
  try {
    const report = new URL(value(env, 'JSREPORT_URL'));
    if (report.protocol !== 'https:' || report.username || report.password ||
        /^(?:localhost|host\.docker\.internal|127\.|0\.0\.0\.0)/i.test(report.hostname)) throw new Error();
  } catch { throw new Error('JSREPORT_URL: usa HTTPS del servicio administrado; no admite el equipo de desarrollo.'); }
  const proxies = value(env, 'TRUSTED_PROXY_CIDRS');
  if (proxies && proxies.split(',').some(p => !/^(?:[0-9a-f:.]+)(?:\/\d{1,3})?$/i.test(p.trim())))
    throw new Error('TRUSTED_PROXY_CIDRS: enumera direcciones/CIDR concretos; no admite confianza global.');
  for (const key of [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'MEDICAL_DATA_KEYS',
    'CORS_ORIGINS',
    'EMERGEN_DEPLOYMENT_ID',
    'WHATSAPP_SENDER_PHONE',
    'WHATSAPP_AUTH_DIR',
  ]) {
    if (missing(value(env, key)))
      throw new Error(
        `${key}: debe configurarse explícitamente en ${environment}.`,
      );
  }
  if (value(env, 'JWT_SECRET').length < 32)
    throw new Error('JWT_SECRET: usa al menos 32 caracteres.');
  const keyIds = new Set<string>();
  for (const pair of value(env, 'MEDICAL_DATA_KEYS').split(',')) {
    const [id, key, extra] = pair.trim().split(':');
    if (
      !/^[a-z0-9]+$/i.test(id) ||
      !key ||
      extra ||
      keyIds.has(id) ||
      Buffer.from(key, 'base64').length !== 32
    ) {
      throw new Error(
        'MEDICAL_DATA_KEYS: formato o longitud no válidos. Conserva las claves de los datos existentes.',
      );
    }
    keyIds.add(id);
  }
  if (value(env, 'WHATSAPP_ENABLED').toLowerCase() !== 'true') {
    throw new Error(
      'WHATSAPP_ENABLED: debe ser true para el servicio SOS en staging/production.',
    );
  }
  if (!/^\+?[1-9]\d{7,14}$/.test(value(env, 'WHATSAPP_SENDER_PHONE'))) {
    throw new Error(
      'WHATSAPP_SENDER_PHONE: usa el número emisor en formato internacional.',
    );
  }
  if (!isAbsolute(value(env, 'WHATSAPP_AUTH_DIR'))) {
    throw new Error(
      'WHATSAPP_AUTH_DIR: usa una ruta absoluta en almacenamiento persistente.',
    );
  }
  for (const origin of value(env, 'CORS_ORIGINS')
    .split(',')
    .map((item) => item.trim())) {
    if (origin === 'https://localhost' || origin === 'capacitor://localhost')
      continue;
    try {
      const url = new URL(origin);
      if (
        url.protocol !== 'https:' ||
        url.origin !== origin ||
        url.hostname === 'localhost' ||
        url.username ||
        url.password
      )
        throw new Error();
    } catch {
      throw new Error(
        'CORS_ORIGINS: configura orígenes HTTPS exactos y el origen nativo del móvil.',
      );
    }
  }
  return env;
}
