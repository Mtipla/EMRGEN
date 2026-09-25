import {
  BadGatewayException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GoogleMapsService } from './google-maps.service';

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200 });

describe('GoogleMapsService', () => {
  const originalEnv = { ...process.env };
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = 'maps-key';
    fetchMock = jest.spyOn(global, 'fetch');
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it('geocodifica una dirección', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        status: 'OK',
        results: [
          {
            formatted_address: 'Santiago, Chile',
            place_id: 'p1',
            geometry: { location: { lat: -33.4, lng: -70.6 } },
          },
        ],
      }),
    );

    const results = await new GoogleMapsService().geocode('Plaza de Armas');

    expect(results).toEqual([
      {
        formattedAddress: 'Santiago, Chile',
        placeId: 'p1',
        location: { lat: -33.4, lng: -70.6 },
      },
    ]);
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get('address')).toBe('Plaza de Armas');
    expect(url.searchParams.get('key')).toBe('maps-key');
  });

  it('devuelve lista vacía con ZERO_RESULTS', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ status: 'ZERO_RESULTS', results: [] }),
    );
    await expect(
      new GoogleMapsService().reverseGeocode({ lat: 0, lng: 0 }),
    ).resolves.toEqual([]);
  });

  it('responde 502 cuando Google deniega la solicitud', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ status: 'REQUEST_DENIED', results: [] }),
    );
    await expect(
      new GoogleMapsService().geocode('x y z'),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('envía latlng, idioma y región en la geocodificación inversa', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ status: 'ZERO_RESULTS', results: [] }),
    );
    await new GoogleMapsService().reverseGeocode({ lat: -33.44, lng: -70.65 });

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get('latlng')).toBe('-33.44,-70.65');
    expect(url.searchParams.get('language')).toBe('es');
    expect(url.searchParams.get('region')).toBe('cl');
  });

  it('responde 503 sin llamar a Google si falta GOOGLE_MAPS_API_KEY', async () => {
    delete process.env.GOOGLE_MAPS_API_KEY;
    await expect(
      new GoogleMapsService().geocode('Plaza de Armas'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['OVER_QUERY_LIMIT', 'INVALID_REQUEST', 'UNKNOWN_ERROR'])(
    'responde 502 con status %s sin filtrar la key en el mensaje',
    async (status) => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ status, error_message: 'detalle', results: [] }),
      );
      const error = await new GoogleMapsService()
        .geocode('x y z')
        .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(BadGatewayException);
      expect((error as Error).message).not.toContain('maps-key');
    },
  );
});
