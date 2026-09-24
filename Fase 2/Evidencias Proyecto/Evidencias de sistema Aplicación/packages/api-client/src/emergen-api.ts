import type {
  CapturePaypalOrderResponse,
  CreatePaypalOrderRequest,
  EconomicIndicator,
  FirebaseAuthUser,
  GenerateReportRequest,
  GeocodeResult,
  GeoPoint,
  IndicatorCode,
  PaypalOrderResponse,
} from '@repo/api-types';
import { createHttpClient } from './http';

/**
 * Cliente tipado de los endpoints de integraciones del backend.
 * Las credenciales secretas viven solo en el backend; el frontend nunca las ve.
 *
 * @param baseUrl URL del backend, normalmente `import.meta.env.VITE_API_URL`.
 */
export function createEmergenApi(baseUrl: string) {
  const http = createHttpClient(baseUrl);

  return {
    paypal: {
      createOrder: (request: CreatePaypalOrderRequest) =>
        http.json<PaypalOrderResponse>('/payments/paypal/orders', {
          method: 'POST',
          body: JSON.stringify(request),
        }),
      captureOrder: (orderId: string) =>
        http.json<CapturePaypalOrderResponse>(
          `/payments/paypal/orders/${encodeURIComponent(orderId)}/capture`,
          { method: 'POST' },
        ),
    },

    auth: {
      /** Valida el ID token de Firebase en el backend y devuelve el usuario. */
      me: (idToken: string) =>
        http.json<FirebaseAuthUser>('/auth/me', {
          headers: { Authorization: `Bearer ${idToken}` },
        }),
    },

    reports: {
      /** Devuelve el PDF como Blob; usar `downloadBlob` para guardarlo. */
      generate: (request: GenerateReportRequest) =>
        http.blob('/reports', { method: 'POST', body: JSON.stringify(request) }),
    },

    maps: {
      geocode: (address: string) =>
        http.json<GeocodeResult[]>(`/maps/geocode?${new URLSearchParams({ address })}`),
      reverseGeocode: ({ lat, lng }: GeoPoint) =>
        http.json<GeocodeResult[]>(
          `/maps/reverse-geocode?${new URLSearchParams({ lat: String(lat), lng: String(lng) })}`,
        ),
    },

    indicators: {
      /** Valores del día de todos los indicadores (UF, dólar, euro, UTM, etc.). */
      today: () => http.json<EconomicIndicator[]>('/indicators'),
      /** Serie de un indicador; con `date` (dd-mm-yyyy) devuelve solo ese día. */
      get: (code: IndicatorCode, date?: string) =>
        http.json<EconomicIndicator>(
          `/indicators/${code}${date ? `?${new URLSearchParams({ date })}` : ''}`,
        ),
    },
  };
}

export type EmergenApi = ReturnType<typeof createEmergenApi>;

/** Descarga un Blob en el navegador (web y desktop). */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
