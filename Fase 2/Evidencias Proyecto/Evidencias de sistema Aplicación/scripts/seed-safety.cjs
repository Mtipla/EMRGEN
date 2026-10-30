/** Check before importing a DB client or reading any env file. */
function assertSeedTarget(env) {
  const stage = env.EMERGEN_ENVIRONMENT;
  const suffix = stage === 'development' ? '_dev' : stage === 'test' ? '_test' : null;
  const consistent = !env.NODE_ENV || env.NODE_ENV === stage;
  if (!suffix || !consistent || env.DATABASE_URL ||
      (env.EMERGEN_DEPLOYMENT_ID && !['local', 'test'].includes(env.EMERGEN_DEPLOYMENT_ID)) ||
      !['127.0.0.1', 'localhost', '::1'].includes(env.DB_HOST) ||
      !/^[1-9][0-9]{0,4}$/.test(env.DB_PORT || '') || Number(env.DB_PORT) > 65535 ||
      !/^[a-z][a-z0-9_]*$/.test(env.DB_NAME || '') || !env.DB_NAME.endsWith(suffix) ||
      env.EMERGEN_SEED_EXPECTED_DB !== env.DB_NAME) {
    throw new Error('Seed bloqueado: exige entorno local/test coherente y destino explícito con sufijo _dev/_test y EMERGEN_SEED_EXPECTED_DB coincidente.');
  }
}
module.exports = { assertSeedTarget };
