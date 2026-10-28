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
  /** Estado del cobro: COMPLETED, PENDING (en revisión en PayPal), DECLINED o FAILED. */
  captureStatus?: string;
  amount?: { value: string; currency: string };
  payerEmail?: string;
}

/* ------------------------------------------------------------------ */
/* Compra de cuentas apadrinadas (PayPal vía backend)                  */
/* ------------------------------------------------------------------ */

/** REVISION: resultado incierto o discrepancia; requiere conciliación, no acredita un cobro. */
export type EstadoCompra = 'PENDIENTE' | 'PAGADO' | 'RECHAZADO' | 'CANCELADO' | 'REVISION';

export type TipoCompra = 'PLAN' | 'CUPOS';

export interface ResumenCompra extends ResumenCompraApadrinados {
  tipoCompra: TipoCompra;
}

export interface ResumenCompraApadrinados {
  /** Nombre de la cuenta principal que recibe los cupos (de la sesión). */
  usuario: string;
  plan: string;
  /** Precio por cuenta en CLP, leído de la tabla PLAN. */
  precioUnitario: number;
  cuposAdquiridos: number;
  /** Cuántas cuentas puede comprar ahora (0 si ya alcanzó el límite). */
  maxCantidad: number;
}

export interface OrdenCompraResponse {
  /** Número de boleta (VENTA.venta_ID). */
  ventaId: number;
  /** Id de la orden en PayPal, para los botones del SDK. */
  orderId: string;
  totalClp: number;
  /** Monto que cobra PayPal (CLP convertido con el dólar del día). */
  montoCobrado: string;
  monedaCobrada: string;
}

export interface ResultadoCompraResponse {
  ventaId: number;
  estado: EstadoCompra;
  /** Total de cupos del usuario después de la compra (solo si estado = PAGADO). */
  cuposAdquiridos?: number;
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
  /** Segundos epoch del último ingreso con credenciales (claim `auth_time`); no cambia al refrescar. */
  authTime?: number;
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
  /** Hay un QR vigente en `GET /notifications/whatsapp/qr` (cambia cada ~20 s). */
  qrAvailable: boolean;
  /** Número emisor vinculado, solo con `state: "open"`. */
  phoneNumber?: string;
  lastError?: string;
}

export interface WhatsappPairingCodeRequest {
  /** Número que se vinculará como emisor, con código de país (ej. "+56912345678"). */
  phoneNumber: string;
}

export interface WhatsappPairingCodeResponse {
  /** Código de 8 caracteres para WhatsApp → Dispositivos vinculados → Vincular con número. */
  code: string;
}

export interface EmergencyAlertLocation extends GeoPoint {
  /** Dirección legible (ej. resultado de `/maps/reverse-geocode`). */
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
  /** Datos del perfil que se incorporan al texto inicial del SOS. */
  record?: EmergencyAlertMedicalRecord;
  /** Resumen breve (alergias, grupo sanguíneo...). Queda guardado en el chat del receptor. */
  summary?: string;
  /** Enlace HTTPS temporal a la ficha médica (HU-12), revocable al finalizar la emergencia. */
  url?: string;
}

export interface SendEmergencyAlertRequest {
  /** 1 a 5 números (CA-03.2). Sin "+" y con 9 dígitos o menos se asume el código de país por defecto (56). */
  recipients: string[];
  /** Nombre del usuario que emite la alerta. */
  senderName?: string;
  senderEmail?: string;
  /** Fecha de creación del SOS, en ISO 8601. */
  occurredAt?: string;
  /** Tipo de emergencia seleccionado al generar el SOS. */
  emergencyType?: string;
  /** Mensaje personalizado del usuario (máx. 200, como USUARIO_MENSAJE_PERSONALIZADO). */
  message: string;
  location?: EmergencyAlertLocation;
  /** Ubicación descriptiva cuando no hay coordenadas; indica también las pruebas simuladas. */
  locationLabel?: string;
  medicalInfo?: EmergencyAlertMedicalInfo;
  /** false omite por completo el bloque médico para este destinatario. */
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
  /** Ids de los mensajes enviados (texto y ubicación). */
  messageIds: string[];
  error?: string;
}

export interface EmergencyAlertResult {
  /** Fecha ISO 8601 del despacho. */
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
