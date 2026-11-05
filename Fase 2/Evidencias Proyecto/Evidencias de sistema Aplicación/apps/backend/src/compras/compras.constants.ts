import type { EstadoCompra } from '@repo/api-types';


export const METODO_PAGO_PAYPAL = 1;
export const PLAN_CUENTA_APADRINADA = 1;
export const PLAN_BASE = 2;

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


export const MAX_APADRINADOS = 5;


export const MONEDA_PAYPAL = 'USD';


export function clpAUsd(totalClp: number, dolar: number): string {
  if (!(dolar > 0)) throw new Error(`Valor del dólar inválido: ${dolar}`);
  return Math.max(Math.ceil((totalClp / dolar) * 100) / 100, 0.01).toFixed(2);
}
