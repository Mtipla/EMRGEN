import { validateRuntimeConfig } from './runtime-config';

const production = {
  EMERGEN_ENVIRONMENT: 'production',
  EMERGEN_DEPLOYMENT_ID: 'emergen-prod',
  DB_HOST: 'db',
  DB_PORT: '5432',
  DB_USER: 'app',
  DB_PASSWORD: 'solo-para-test',
  DB_NAME: 'emergen',
  JWT_SECRET: 'x'.repeat(48),
  MEDICAL_DATA_KEYS: `k1:${Buffer.alloc(32, 1).toString('base64')}`,
  CORS_ORIGINS: 'https://app.emergen.cl,https://localhost',
  WHATSAPP_ENABLED: 'true',
  WHATSAPP_SENDER_PHONE: '+56912345678',
  WHATSAPP_AUTH_DIR: '/data/whatsapp',
};
describe('Configuración antes del arranque', () => {
  it('acepta el contrato de producción sin modificar claves ni datos', () => {
    expect(validateRuntimeConfig(production)).toBe(production);
  });
  it.each([
    'DB_PASSWORD',
    'JWT_SECRET',
    'MEDICAL_DATA_KEYS',
    'EMERGEN_DEPLOYMENT_ID',
    'WHATSAPP_AUTH_DIR',
  ])('rechaza %s omitida en producción', (key) => {
    expect(() => validateRuntimeConfig({ ...production, [key]: '' })).toThrow(
      key,
    );
  });
  it('rechaza WhatsApp deshabilitado, claves repetidas y puertos inválidos', () => {
    expect(() =>
      validateRuntimeConfig({ ...production, WHATSAPP_ENABLED: 'false' }),
    ).toThrow('WHATSAPP_ENABLED');
    expect(() =>
      validateRuntimeConfig({
        ...production,
        MEDICAL_DATA_KEYS: `${production.MEDICAL_DATA_KEYS},${production.MEDICAL_DATA_KEYS}`,
      }),
    ).toThrow('MEDICAL_DATA_KEYS');
    expect(() => validateRuntimeConfig({ PORT: '3000abc' })).toThrow('PORT');
  });
  it('conserva el desarrollo sin exigir vinculación o credenciales productivas', () => {
    expect(
      validateRuntimeConfig({ EMERGEN_ENVIRONMENT: 'development' }),
    ).toEqual({ EMERGEN_ENVIRONMENT: 'development' });
  });
});
