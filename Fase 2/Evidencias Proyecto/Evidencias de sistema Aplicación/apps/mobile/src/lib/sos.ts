import { errorText, internalFetch } from './session';

export type Alerta = {
  alerta_id: number;
  usuario_id: number | null;
  estado_alerta: 'ACTIVA' | 'FINALIZADA' | 'EXPIRADA';
  prioridad_id: number;
  mensaje: string;
  ubicacion: string | null;
  fecha_creacion: string;
  fecha_cierre: string | null;
  whatsapp?: { pendientes: number; enviados: number; fallidos: number };
  whatsapp_cierre?: { pendientes: number; enviados: number; fallidos: number };
};

export const MENSAJE_REQUIERE_PLAN = 'Esta es una opción que requiere un plan';

export const listarActivas = (usuarioId: number, signal: AbortSignal) =>
  internalFetch<Alerta[]>(`/alertas?estado=ACTIVA&usuario_id=${usuarioId}&limit=100`, {
    signal,
    cache: 'no-store',
  });

export const enviarSos = (prioridadId: number, claveIdempotencia: string, ubicacion?: string) =>
  internalFetch<Alerta>('/alertas', {
    method: 'POST',
    body: JSON.stringify({
      clave_idempotencia: claveIdempotencia,
      prioridad_id: prioridadId,
      ubicacion,
    }),
  });

export const consultarSos = (alertaId: number, signal: AbortSignal) =>
  internalFetch<Alerta>(`/alertas/${alertaId}`, { signal, cache: 'no-store' });

export function estadoWhatsapp(alerta: Alerta): string {
  const estado = alerta.whatsapp;
  if (!estado) return 'WhatsApp: estado de envío no disponible.';
  return `WhatsApp: ${estado.enviados} enviado(s), ${estado.pendientes} pendiente(s), ${estado.fallidos} fallido(s).`;
}

export const finalizarSos = (alertaId: number, pin: string) =>
  internalFetch<Alerta>(`/alertas/${alertaId}/cerrar`, {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });

export const errorSos = (causa: unknown) =>
  causa instanceof TypeError
    ? 'No se pudo conectar con el servicio de alertas. Intenta nuevamente.'
    : errorText(causa);
