import { ServiceUnavailableException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { cifrar, cifrarFicha, descifrar, descifrarFicha, CAMPOS_FICHA } from './cifrado-medico';

const script = require(resolve(__dirname, '../../../../scripts/cifrar-fichas.cjs')) as {
  cifrar: (texto: string, aad: string, mapa: Map<string, Buffer>) => string;
  claves: (texto: string) => Map<string, Buffer>;
};

const k1 = 'k1:' + randomBytes(32).toString('base64');
const k2 = 'k2:' + randomBytes(32).toString('base64');
const ficha = {
  tipo_sangre: 'O+',
  alergias: 'Penicilina',
  enfermedades_cronicas: '',
  medicamentos_actuales: 'Losartán 50 mg',
  discapacidad_presente: 'Ninguna',
  donante_organos: true,
};
const filaDe = (valores: string[]) =>
  Object.fromEntries(CAMPOS_FICHA.map((c, i) => [c, valores[i]])) as Record<(typeof CAMPOS_FICHA)[number], string>;

describe('cifrado de la ficha médica (CA-11.1)', () => {
  const original = process.env.MEDICAL_DATA_KEYS;
  beforeEach(() => (process.env.MEDICAL_DATA_KEYS = k1));
  afterAll(() => (process.env.MEDICAL_DATA_KEYS = original));

  it('ida y vuelta de las seis columnas, sin texto en claro en lo guardado', () => {
    const guardado = cifrarFicha(7, ficha);
    expect(guardado).toHaveLength(6);
    for (const valor of guardado) expect(valor).toMatch(/^k1:[^:]+:[^:]+:[^:]*$/);
    expect(guardado.join()).not.toMatch(/Penicilina|Losart|O\+|true/);
    expect(descifrarFicha(7, filaDe(guardado))).toEqual(ficha);
    expect(descifrarFicha(7, filaDe(cifrarFicha(7, { ...ficha, donante_organos: false }))).donante_organos).toBe(false);
  });

  it('IV aleatorio: el mismo texto produce cifrados distintos', () => {
    expect(cifrar('O+', 'a')).not.toBe(cifrar('O+', 'a'));
  });

  it('un valor copiado a otro usuario o columna no descifra (AAD)', () => {
    const guardado = cifrarFicha(7, ficha);
    expect(() => descifrarFicha(8, filaDe(guardado))).toThrow();
    expect(() => descifrar(guardado[1], 'antecedente_medico:7:tipo_sangre')).toThrow();
  });

  it('detecta manipulación del cifrado', () => {
    const [id, iv, tag, cifrado] = cifrar('Penicilina', 'a').split(':');
    const alterado = Buffer.from(cifrado, 'base64');
    alterado[0] ^= 1;
    expect(() => descifrar([id, iv, tag, alterado.toString('base64')].join(':'), 'a')).toThrow();
  });

  it('rotación: la clave nueva cifra y la antigua sigue descifrando', () => {
    const viejo = cifrar('O+', 'a');
    process.env.MEDICAL_DATA_KEYS = `${k2},${k1}`;
    expect(descifrar(viejo, 'a')).toBe('O+');
    expect(cifrar('O+', 'a')).toMatch(/^k2:/);
    process.env.MEDICAL_DATA_KEYS = k2;
    expect(() => descifrar(viejo, 'a')).toThrow('clave desconocida');
  });

  it('sin clave responde 503 y con clave inválida falla: el guardado se aborta', () => {
    delete process.env.MEDICAL_DATA_KEYS;
    expect(() => cifrarFicha(7, ficha)).toThrow(ServiceUnavailableException);
    process.env.MEDICAL_DATA_KEYS = 'k1:corta';
    expect(() => cifrarFicha(7, ficha)).toThrow('mal formada');
  });

  it('el script de migración produce el mismo formato que descifra el backend', () => {
    const valor = script.cifrar('Penicilina', 'antecedente_medico:7:alergias', script.claves(k1));
    expect(descifrar(valor, 'antecedente_medico:7:alergias')).toBe('Penicilina');
  });
});
