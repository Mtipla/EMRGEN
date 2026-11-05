const { readFileSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { parseEnv } = require('node:util');
const { createRequire } = require('node:module');
const root = resolve(__dirname, '..');
const requireBackend = createRequire(resolve(root, 'apps/backend/package.json'));
const { Client } = requireBackend('pg');
const bcrypt = requireBackend('bcrypt');
function client() {
  const env = { ...parseEnv(readFileSync(resolve(root, '.env'), 'utf8')), ...process.env };
  return new Client({ host: env.DB_HOST === 'db' ? 'localhost' : env.DB_HOST,
    port: env.DB_HOST === 'db' ? 5433 : Number(env.DB_PORT ?? 5433), user: env.DB_USER,
    password: env.DB_PASSWORD, database: env.DB_NAME });
}
module.exports = { client, bcrypt };
