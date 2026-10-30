const { test } = require('node:test');
const assert = require('node:assert/strict');
const { assertSeedTarget } = require('./seed-safety.cjs');
const local = { EMERGEN_ENVIRONMENT: 'test', NODE_ENV: 'test', DB_HOST: '127.0.0.1',
  DB_PORT: '55439', DB_NAME: 'synthetic_test', EMERGEN_SEED_EXPECTED_DB: 'synthetic_test' };
test('permite destino sintético explícito', () => assert.doesNotThrow(() => assertSeedTarget(local)));
for (const [name, change] of [
  ['entorno ausente', { EMERGEN_ENVIRONMENT: undefined }],
  ['producción', { EMERGEN_ENVIRONMENT: 'production' }],
  ['indicadores contradictorios', { NODE_ENV: 'production' }],
  ['host remoto', { DB_HOST: 'db.example.invalid' }],
  ['destino no confirmado', { EMERGEN_SEED_EXPECTED_DB: 'other_test' }],
]) test(name, () => assert.throws(() => assertSeedTarget({ ...local, ...change })));
test('contrato README: demo nueva dev y rechazos intencionales', () => {
  const development = { EMERGEN_ENVIRONMENT: 'development', NODE_ENV: 'development',
    DB_HOST: '127.0.0.1', DB_PORT: '55432', DB_NAME: 'emergen_dev', EMERGEN_SEED_EXPECTED_DB: 'emergen_dev' };
  assert.doesNotThrow(() => assertSeedTarget(development));
  for (const change of [
    { DB_NAME: 'EMERGEN_BDD', EMERGEN_SEED_EXPECTED_DB: 'EMERGEN_BDD' },
    { EMERGEN_ENVIRONMENT: 'staging', NODE_ENV: 'staging' },
    { EMERGEN_ENVIRONMENT: 'production', NODE_ENV: 'production' },
    { EMERGEN_SEED_EXPECTED_DB: undefined },
    { EMERGEN_SEED_EXPECTED_DB: 'other_dev' },
  ]) assert.throws(() => assertSeedTarget({ ...development, ...change }));
});
