import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';

/**
 * Importar ANTES que AppModule (que lee DB_* al importarse). Igual que en
 * integrations.live: Jest no comparte process.loadEnvFile, así que el .env de la raíz
 * del monorepo se lee a mano, sin sobrescribir variables ya definidas.
 */
const file = resolve(__dirname, '../../../.env');
if (existsSync(file))
  process.env = { ...parseEnv(readFileSync(file, 'utf8')), ...process.env };

// "db:5432" solo existe dentro de la red de docker-compose; desde el PC, Postgres se
// publica en localhost:5433 (ver docker-compose.yml).
if (process.env.DB_HOST === 'db') {
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5433';
}
