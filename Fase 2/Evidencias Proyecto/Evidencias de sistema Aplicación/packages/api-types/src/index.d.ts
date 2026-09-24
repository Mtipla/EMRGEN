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

/* ------------------------------------------------------------------ */
/* Firebase Authentication                                             */
/* ------------------------------------------------------------------ */

/** Usuario autenticado según el ID token de Firebase verificado por el backend. */
export interface FirebaseAuthUser {
  uid: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
  /** Proveedor usado para iniciar sesión (ej. "password", "google.com"). */
  signInProvider?: string;
}

/** Sesión devuelta por la API REST de Firebase Auth al iniciar sesión o registrarse. */
export interface FirebaseSession {
  uid: string;
  email: string;
  /** ID token (JWT, dura 1 hora): enviarlo al backend como `Authorization: Bearer <idToken>`. */
  idToken: string;
  refreshToken: string;
  /** Segundos hasta que expira el ID token. */
  expiresIn: number;
}

/* ------------------------------------------------------------------ */
/* mindicador.cl (indicadores económicos de Chile)                     */
/* ------------------------------------------------------------------ */

/** Códigos que acepta mindicador.cl. */
export type IndicatorCode =
  | 'uf'
  | 'ivp'
  | 'dolar'
  | 'dolar_intercambio'
  | 'euro'
  | 'ipc'
  | 'utm'
  | 'imacec'
  | 'tpm'
  | 'libra_cobre'
  | 'tasa_desempleo'
  | 'bitcoin';

export interface IndicatorValue {
  /** Fecha ISO 8601 del valor. */
  date: string;
  value: number;
}

export interface EconomicIndicator {
  code: IndicatorCode;
  name: string;
  /** Unidad de medida (ej. "Pesos", "Porcentaje"). */
  unit: string;
  /** Valores del más reciente al más antiguo. */
  series: IndicatorValue[];
}
