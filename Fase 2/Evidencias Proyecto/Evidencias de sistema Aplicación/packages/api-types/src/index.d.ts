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
  amount: string;
  currency?: string;
  description?: string;
  referenceId?: string;
}

export interface PaypalOrderResponse {
  id: string;
  status: string;
  approveUrl?: string;
}

export interface CapturePaypalOrderResponse {
  orderId: string;
  status: string;
  captureId?: string;
  captureStatus?: string;
  amount?: { value: string; currency: string };
  payerEmail?: string;
}

/* ------------------------------------------------------------------ */
/* Compra de cuentas apadrinadas (PayPal vía backend)                  */
/* ------------------------------------------------------------------ */


export type EstadoCompra = 'PENDIENTE' | 'PAGADO' | 'RECHAZADO' | 'CANCELADO' | 'REVISION';

export type TipoCompra = 'PLAN' | 'CUPOS';

export interface ResumenCompra extends ResumenCompraApadrinados {
  tipoCompra: TipoCompra;
}

export interface ResumenCompraApadrinados {
  usuario: string;
  plan: string;
  precioUnitario: number;
  cuposAdquiridos: number;
  maxCantidad: number;
}

export interface OrdenCompraResponse {
  ventaId: number;
  orderId: string;
  totalClp: number;
  montoCobrado: string;
  monedaCobrada: string;
}

export interface ResultadoCompraResponse {
  ventaId: number;
  estado: EstadoCompra;
  cuposAdquiridos?: number;
}

/* ------------------------------------------------------------------ */
/* jsReport                                                            */
/* ------------------------------------------------------------------ */

export interface GenerateReportRequest {
  templateName: string;
  data: Record<string, unknown>;
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
  signInProvider?: string;
  authTime?: number;
}

/** Sesión devuelta por la API REST de Firebase Auth al iniciar sesión o registrarse. */
export interface FirebaseSession {
  uid: string;
  email: string;
  idToken: string;
  refreshToken: string;
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
  date: string;
  value: number;
}

export interface EconomicIndicator {
  code: IndicatorCode;
  name: string;
  unit: string;
  series: IndicatorValue[];
}

/* ------------------------------------------------------------------ */
/* WhatsApp (Baileys): notificaciones de emergencia                    */
/* ------------------------------------------------------------------ */

/**
 * - `disabled`: WHATSAPP_ENABLED no es `true`.
 * - `connecting`: negociando con WhatsApp (o esperando para reintentar).
 * - `waiting_for_link`: sin sesión; hay que escanear el QR o usar un código de emparejamiento.
 * - `open`: sesión vinculada, lista para enviar.
 * - `closed`: detenido (sesión reemplazada por otra instancia o número bloqueado); requiere intervención.
 */
export type WhatsappConnectionState =
  | 'disabled'
  | 'connecting'
  | 'waiting_for_link'
  | 'open'
  | 'closed';

export interface WhatsappStatusResponse {
  enabled: boolean;
  state: WhatsappConnectionState;
  qrAvailable: boolean;
  phoneNumber?: string;
  lastError?: string;
}

export interface WhatsappPairingCodeRequest {
  phoneNumber: string;
}

export interface WhatsappPairingCodeResponse {
  code: string;
}

export interface EmergencyAlertLocation extends GeoPoint {
  address?: string;
}

export interface EmergencyAlertMedicalRecord {
  tipo_sangre: string;
  alergias: string;
  enfermedades_cronicas: string;
  medicamentos_actuales: string;
  discapacidad_presente: string;
  donante_organos: boolean;
}

export interface EmergencyAlertMedicalInfo {
  record?: EmergencyAlertMedicalRecord;
  summary?: string;
  url?: string;
}

export interface SendEmergencyAlertRequest {
  /** 1 a 5 números. Sin "+" y con 9 dígitos o menos se asume el código de país por defecto (56). */
  recipients: string[];
  senderName?: string;
  senderEmail?: string;
  occurredAt?: string;
  emergencyType?: string;
  message: string;
  location?: EmergencyAlertLocation;
  locationLabel?: string;
  medicalInfo?: EmergencyAlertMedicalInfo;
  includeMedicalInfo?: boolean;
}

export type EmergencyAlertDeliveryStatus =
  | 'sent'
  | 'not_on_whatsapp'
  | 'invalid_number'
  | 'failed';

export interface EmergencyAlertDelivery {
  phoneNumber: string;
  status: EmergencyAlertDeliveryStatus;
  messageIds: string[];
  error?: string;
}

export interface EmergencyAlertResult {
  sentAt: string;
  sent: number;
  failed: number;
  deliveries: EmergencyAlertDelivery[];
}

/** Compras propias pendientes; permiten recuperarse tras perder la respuesta o reiniciar. */
export interface CompraPendiente extends Omit<OrdenCompraResponse, 'orderId'> {
  orderId: string | null;
  cantidad: number;
  puedeRetomar: boolean;
}
