/**
 * Contratos HTTP entre el backend (apps/backend) y los frontends (web, mobile, desktop).
 *
 * Es un archivo de declaraciones (.d.ts): solo contiene tipos, no genera código en
 * tiempo de ejecución. Así el backend (CommonJS) y los frontends (ESM/Vite) pueden
 * importarlo con `import type` sin problemas de formato de módulo.
 */

/* ------------------------------------------------------------------ */
/* Errores                                                             */
/* ------------------------------------------------------------------ */

/** Forma estándar de los errores que devuelve NestJS. */
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

/* ------------------------------------------------------------------ */
/* PayPal REST API (Orders v2)                                         */
/* ------------------------------------------------------------------ */

export interface CreatePaypalOrderRequest {
  /** Monto con máximo 2 decimales, como string (ej. "9.99"). */
  amount: string;
  /** Código ISO 4217. PayPal NO admite CLP: usar USD u otra moneda soportada. Por defecto "USD". */
  currency?: string;
  description?: string;
  /** Referencia interna (ej. id del plan o de la venta). */
  referenceId?: string;
}

export interface PaypalOrderResponse {
  /** Id de la orden en PayPal. */
  id: string;
  /** CREATED, APPROVED, COMPLETED, etc. */
  status: string;
  /** URL a la que se redirige al comprador para aprobar el pago (flujo sin botones JS). */
  approveUrl?: string;
}

export interface CapturePaypalOrderResponse {
  orderId: string;
  /** COMPLETED si el cobro se realizó. */
  status: string;
  captureId?: string;
  amount?: { value: string; currency: string };
  payerEmail?: string;
}

/* ------------------------------------------------------------------ */
/* Twilio SendGrid Email Validation                                    */
/* ------------------------------------------------------------------ */

export interface EmailValidationRequest {
  email: string;
  /** Etiqueta opcional para identificar el origen en SendGrid (ej. "registro-web"). */
  source?: string;
}

export type EmailValidationVerdict = 'Valid' | 'Risky' | 'Invalid';

export interface EmailValidationResponse {
  email: string;
  verdict: EmailValidationVerdict;
  /** Probabilidad (0 a 1) de que el correo sea válido. */
  score: number;
  /** true solo cuando el veredicto es "Valid". */
  isValid: boolean;
  /** Corrección sugerida por SendGrid para errores de tipeo (ej. "gmail.com"). */
  suggestion?: string;
}

/* ------------------------------------------------------------------ */
/* jsReport                                                            */
/* ------------------------------------------------------------------ */

export interface GenerateReportRequest {
  /** Nombre de una plantilla ya creada en el servidor jsReport. */
  templateName: string;
  /** Datos que recibe la plantilla. */
  data: Record<string, unknown>;
  /** Nombre del archivo descargado, sin extensión. */
  fileName?: string;
}

/* ------------------------------------------------------------------ */
/* Google Maps Platform                                                */
/* ------------------------------------------------------------------ */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  formattedAddress: string;
  location: GeoPoint;
  placeId: string;
}
