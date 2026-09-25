import type { CapturePaypalOrderResponse, CreatePaypalOrderRequest } from '@repo/api-types';
import type { EmergenApi } from './emergen-api';
import { loadScript } from './load-script';

/* Tipos mínimos del PayPal JavaScript SDK (botones de pago). */
interface PaypalButtonsOptions {
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onCancel?: () => void;
  onError?: (error: unknown) => void;
}

interface PaypalButtons {
  render(container: HTMLElement): Promise<void>;
  close(): Promise<void>;
}

interface PaypalNamespace {
  Buttons(options: PaypalButtonsOptions): PaypalButtons;
}

/**
 * Carga el PayPal JS SDK. El Client ID es público (sirve para mostrar los botones);
 * el secreto queda solo en el backend.
 */
export async function loadPaypalSdk(clientId: string, currency = 'USD'): Promise<PaypalNamespace> {
  const params = new URLSearchParams({ 'client-id': clientId, currency, intent: 'capture' });
  await loadScript(`https://www.paypal.com/sdk/js?${params}`);

  const paypal = (window as unknown as { paypal?: PaypalNamespace }).paypal;
  if (!paypal) throw new Error('PayPal SDK no se inicializó: revisa VITE_PAYPAL_CLIENT_ID.');
  return paypal;
}

export interface RenderPaypalButtonsOptions {
  api: EmergenApi;
  clientId: string;
  order: CreatePaypalOrderRequest;
  onPaid: (result: CapturePaypalOrderResponse) => void;
  onCancel?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Muestra los botones de PayPal. La orden se crea y se captura en el backend,
 * así el monto y la confirmación del pago nunca dependen solo del navegador.
 */
export async function renderPaypalButtons(
  container: HTMLElement,
  { api, clientId, order, onPaid, onCancel, onError }: RenderPaypalButtonsOptions,
): Promise<PaypalButtons> {
  const paypal = await loadPaypalSdk(clientId, order.currency);
  const buttons = paypal.Buttons({
    createOrder: async () => (await api.paypal.createOrder(order)).id,
    onApprove: async ({ orderID }) => onPaid(await api.paypal.captureOrder(orderID)),
    onCancel,
    onError,
  });
  await buttons.render(container);
  return buttons;
}
