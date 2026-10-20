import { clpAUsd, nombreEstado } from './compras.constants';

describe('clpAUsd', () => {
  it('redondea hacia arriba al centavo para no cobrar menos que el precio', () => {
    expect(clpAUsd(1000, 950)).toBe('1.06'); // 1.0526...
    expect(clpAUsd(2000, 1000)).toBe('2.00');
    expect(clpAUsd(1, 1000)).toBe('0.01');
  });

  it('rechaza un valor del dólar inválido en vez de cobrar un monto absurdo', () => {
    expect(() => clpAUsd(1000, 0)).toThrow();
    expect(() => clpAUsd(1000, Number.NaN)).toThrow();
  });
});

describe('nombreEstado', () => {
  it('traduce los IDs de ESTADO_PAGO', () => {
    expect(nombreEstado(1)).toBe('PENDIENTE');
    expect(nombreEstado(2)).toBe('PAGADO');
    expect(nombreEstado(5)).toBe('REVISION');
  });
});
