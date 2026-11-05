import { BadGatewayException, Logger } from '@nestjs/common';
import { MindicadorService } from './mindicador.service';

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200 });

describe('MindicadorService', () => {
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    delete process.env.MINDICADOR_API_URL;
    jest.restoreAllMocks();
  });

  it('traduce la serie de un indicador', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        codigo: 'uf',
        nombre: 'Unidad de fomento (UF)',
        unidad_medida: 'Pesos',
        serie: [{ fecha: '2026-09-24T03:00:00.000Z', valor: 39000.5 }],
      }),
    );

    await expect(new MindicadorService().get('uf')).resolves.toEqual({
      code: 'uf',
      name: 'Unidad de fomento (UF)',
      unit: 'Pesos',
      series: [{ date: '2026-09-24T03:00:00.000Z', value: 39000.5 }],
    });
    expect(fetchMock.mock.calls[0][0]).toBe('https://mindicador.cl/api/uf');
  });

  it('obtiene la UF de una fecha concreta (dd-mm-yyyy)', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        codigo: 'uf',
        nombre: 'Unidad de fomento (UF)',
        unidad_medida: 'Pesos',
        serie: [{ fecha: '2026-09-24T03:00:00.000Z', valor: 39000.5 }],
      }),
    );

    const uf = await new MindicadorService().get('uf', '24-09-2026');

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://mindicador.cl/api/uf/24-09-2026',
    );
    expect(uf.series[0].value).toBe(39000.5);
  });

  it('devuelve serie vacía para un día sin valor (ej. dólar en fin de semana)', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        codigo: 'dolar',
        nombre: 'Dólar observado',
        unidad_medida: 'Pesos',
        serie: [],
      }),
    );
    await expect(
      new MindicadorService().get('dolar', '27-09-2026'),
    ).resolves.toMatchObject({ code: 'dolar', series: [] });
  });

  it('today() traduce los indicadores del día e ignora los desconocidos', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        version: '1.7.0',
        autor: 'mindicador.cl',
        fecha: '2026-09-24T03:00:00.000Z',
        uf: {
          codigo: 'uf',
          nombre: 'Unidad de fomento (UF)',
          unidad_medida: 'Pesos',
          fecha: '2026-09-24T03:00:00.000Z',
          valor: 39000.5,
        },
        dolar: {
          codigo: 'dolar',
          nombre: 'Dólar observado',
          unidad_medida: 'Pesos',
          fecha: '2026-09-24T03:00:00.000Z',
          valor: 950.1,
        },
      }),
    );

    const indicators = await new MindicadorService().today();

    expect(indicators.map(({ code }) => code)).toEqual(['uf', 'dolar']);
    expect(indicators[0]).toEqual({
      code: 'uf',
      name: 'Unidad de fomento (UF)',
      unit: 'Pesos',
      series: [{ date: '2026-09-24T03:00:00.000Z', value: 39000.5 }],
    });
    expect(fetchMock.mock.calls[0][0]).toBe('https://mindicador.cl/api');
  });

  it('respeta MINDICADOR_API_URL y quita la barra final', async () => {
    process.env.MINDICADOR_API_URL = 'https://espejo.example.com/api/';
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        codigo: 'utm',
        nombre: 'UTM',
        unidad_medida: 'Pesos',
        serie: [],
      }),
    );
    await new MindicadorService().get('utm');
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://espejo.example.com/api/utm',
    );
  });

  it('responde 502 si mindicador.cl falla (HTTP 500)', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    fetchMock.mockResolvedValueOnce(new Response('error', { status: 500 }));
    await expect(new MindicadorService().get('uf')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});
