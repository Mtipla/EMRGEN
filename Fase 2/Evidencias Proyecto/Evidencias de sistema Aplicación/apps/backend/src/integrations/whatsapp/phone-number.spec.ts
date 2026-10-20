import {
  maskPhoneNumber,
  normalizePhoneNumber,
  toUserJid,
} from './phone-number';

describe('normalizePhoneNumber', () => {
  afterEach(() => delete process.env.WHATSAPP_DEFAULT_COUNTRY_CODE);

  it('agrega el código de país a los números nacionales (CONTACTO_EMERGENCIA)', () => {
    expect(normalizePhoneNumber('912345678')).toBe('56912345678');
  });

  it('respeta el código de país con "+" o con más de 9 dígitos', () => {
    expect(normalizePhoneNumber('+56912345678')).toBe('56912345678');
    expect(normalizePhoneNumber('+5491123456789')).toBe('5491123456789');
    expect(normalizePhoneNumber('56912345678')).toBe('56912345678');
  });

  it('usa WHATSAPP_DEFAULT_COUNTRY_CODE', () => {
    process.env.WHATSAPP_DEFAULT_COUNTRY_CODE = '51';
    expect(normalizePhoneNumber('912345678')).toBe('51912345678');
  });

  it.each(['', '12345', '+56 9 1234 5678', '9-1234-5678', 'abc123456', '+0912345678'])(
    'rechaza %p',
    (value) => expect(normalizePhoneNumber(value)).toBeUndefined(),
  );
});

describe('toUserJid / maskPhoneNumber', () => {
  it('arma el JID y oculta el número en los logs', () => {
    expect(toUserJid('56912345678')).toBe('56912345678@s.whatsapp.net');
    expect(maskPhoneNumber('56912345678')).toBe('569*****678');
  });
});
