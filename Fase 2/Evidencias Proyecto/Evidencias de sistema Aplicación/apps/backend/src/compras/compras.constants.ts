import type { EstadoCompra } from '@repo/api-types';

/** IDs fijos de los catálogos sembrados en init.sql (y migraciones/001_compras_paypal.sql). */
export const METODO_PAGO_PAYPAL = 1;
export const PLAN_CUENTA_APADRINADA = 1;

export const ESTADO_PAGO = {
  PENDIENTE: 1,
  PAGADO: 2,
  RECHAZADO: 3,
  CANCELADO: 4,
  REVISION: 5,
} as const satisfies Record<EstadoCompra, number>;

export const nombreEstado = (id: number): EstadoCompra =>
  (Object.keys(ESTADO_PAGO) as EstadoCompra[]).find(
    (nombre) => ESTADO_PAGO[nombre] === id,
  ) ?? 'REVISION';

/** Mismo límite que UsuariosService.crearUsuarioApadrinado. */
export const MAX_APADRINADOS = 5;

/** PayPal no acepta CLP: se cobra en USD con el dólar observado del día (mindicador). */
export const MONEDA_PAYPAL = 'USD';

/** CLP -> USD redondeado hacia arriba al centavo, para no cobrar menos que el precio. */
export function clpAUsd(totalClp: number, dolar: number): string {
  if (!(dolar > 0)) throw new Error(`Valor del dólar inválido: ${dolar}`);
  return Math.max(Math.ceil((totalClp / dolar) * 100) / 100, 0.01).toFixed(2);
}
