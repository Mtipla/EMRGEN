import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import type { GeocodeResult, GeoPoint } from '@repo/api-types';
import { requireEnv } from '../../config/env';
import { requestExternalJson } from '../http-client';

const INTEGRATION = 'Google Maps';
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

interface GeocodeApiResponse {
  status: string;
  error_message?: string;
  results: Array<{
    formatted_address: string;
    place_id: string;
    geometry: { location: GeoPoint };
  }>;
}

/**
 * Google Maps Platform (Geocoding API) desde el servidor, con la key de servidor.
 * Convierte direcciones en coordenadas y coordenadas GPS (app móvil) en direcciones
 * legibles para las alertas. El renderizado del mapa se hace en el frontend con la
 * key de navegador (VITE_GOOGLE_MAPS_API_KEY).
 */
@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);

  geocode(address: string): Promise<GeocodeResult[]> {
    return this.query({ address });
  }

  reverseGeocode({ lat, lng }: GeoPoint): Promise<GeocodeResult[]> {
    return this.query({ latlng: `${lat},${lng}` });
  }

  private async query(
    params: Record<string, string>,
  ): Promise<GeocodeResult[]> {
    const url = new URL(GEOCODE_URL);
    for (const [key, value] of Object.entries(params))
      url.searchParams.set(key, value);
    url.searchParams.set('language', 'es');
    url.searchParams.set('region', 'cl');
    url.searchParams.set('key', requireEnv('GOOGLE_MAPS_API_KEY', INTEGRATION));

    const body = await requestExternalJson<GeocodeApiResponse>(
      INTEGRATION,
      url.toString(),
    );

    // La Geocoding API responde HTTP 200 incluso con errores; el estado real viene en `status`.
    if (body.status === 'ZERO_RESULTS') return [];
    if (body.status !== 'OK') {
      this.logger.error(
        `Geocoding respondió ${body.status}: ${body.error_message ?? ''}`,
      );
      throw new BadGatewayException(
        `${INTEGRATION} rechazó la solicitud (${body.status}).`,
      );
    }

    return body.results.map((result) => ({
      formattedAddress: result.formatted_address,
      location: result.geometry.location,
      placeId: result.place_id,
    }));
  }
}
