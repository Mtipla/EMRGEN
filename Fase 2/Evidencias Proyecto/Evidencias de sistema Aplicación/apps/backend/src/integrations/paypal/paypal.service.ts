import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  CapturePaypalOrderResponse,
  CreatePaypalOrderRequest,
  PaypalOrderResponse,
} from '@repo/api-types';
import { readEnv, requireEnv } from '../../config/env';
import { requestExternalJson } from '../http-client';

const INTEGRATION = 'PayPal';

const BASE_URLS = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  live: 'https://api-m.paypal.com',
} as const;

interface PaypalLink {
  href: string;
  rel: string;
}

interface PaypalOrder {
  id: string;
  status: string;
  links?: PaypalLink[];
  payer?: { email_address?: string };
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: { value: string; currency_code: string };
      }>;
    };
  }>;
}

/**
 * Cliente de la PayPal REST API (Orders v2) usando fetch nativo.
 * Flujo: el frontend pide crear la orden -> el comprador la aprueba en PayPal ->
 * el frontend pide capturarla. El secreto nunca sale del backend.
 */
@Injectable()
export class PaypalService {
  private token?: { value: string; expiresAt: number };

  private get baseUrl(): string {
    return readEnv('PAYPAL_MODE') === 'live'
      ? BASE_URLS.live
      : BASE_URLS.sandbox;
  }

  async createOrder(
    request: CreatePaypalOrderRequest,
    requestId: string = randomUUID(),
  ): Promise<PaypalOrderResponse> {
    // ComprasService calcula el importe y proporciona una clave durable por venta.
    const order = await requestExternalJson<PaypalOrder>(
      INTEGRATION,
      `${this.baseUrl}/v2/checkout/orders`,
      {
        method: 'POST',
        headers: await this.headers({ 'PayPal-Request-Id': requestId }),
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: request.referenceId,
              description: request.description,
              amount: {
                currency_code: request.currency ?? 'USD',
                value: request.amount,
              },
            },
          ],
        }),
      },
    );

    return {
      id: order.id,
      status: order.status,
      approveUrl: order.links?.find(
        (link) => link.rel === 'approve' || link.rel === 'payer-action',
      )?.href,
    };
  }

  /**
   * @param requestId clave de idempotencia: reintentar con la misma clave devuelve la
   * captura ya hecha en vez de cobrar de nuevo (ComprasService usa una por venta).
   */
  async captureOrder(
    orderId: string,
    requestId: string = randomUUID(),
  ): Promise<CapturePaypalOrderResponse> {
    const order = await requestExternalJson<PaypalOrder>(
      INTEGRATION,
      `${this.baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: 'POST',
        headers: await this.headers({ 'PayPal-Request-Id': requestId }),
      },
    );

    return this.resultadoOrden(order);
  }

  async getOrder(orderId: string): Promise<CapturePaypalOrderResponse> {
    const order = await requestExternalJson<PaypalOrder>(INTEGRATION, `${this.baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}`, { method: 'GET', headers: await this.headers() });
    return this.resultadoOrden(order);
  }

  private resultadoOrden(order: PaypalOrder): CapturePaypalOrderResponse {
    const captures = order.purchase_units?.flatMap((unit) => unit.payments?.captures ?? []) ?? [];
    if (captures.length > 1) throw new Error('La orden requiere conciliación de capturas múltiples');
    const capture = captures[0];
    return {
      orderId: order.id,
      status: order.status,
      captureId: capture?.id,
      captureStatus: capture?.status,
      amount: capture && {
        value: capture.amount.value,
        currency: capture.amount.currency_code,
      },
      payerEmail: order.payer?.email_address,
    };
  }

  private async headers(
    extra: Record<string, string> = {},
  ): Promise<Record<string, string>> {
    return {
      Authorization: `Bearer ${await this.accessToken()}`,
      'Content-Type': 'application/json',
      ...extra,
    };
  }

  /** Token OAuth2 (client credentials), reutilizado hasta 1 minuto antes de expirar. */
  private async accessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now())
      return this.token.value;

    const clientId = requireEnv('PAYPAL_CLIENT_ID', INTEGRATION);
    const secret = requireEnv('PAYPAL_SECRET', INTEGRATION);
    const { access_token, expires_in } = await requestExternalJson<{
      access_token: string;
      expires_in: number;
    }>(INTEGRATION, `${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    this.token = {
      value: access_token,
      expiresAt: Date.now() + (expires_in - 60) * 1000,
    };
    return access_token;
  }
}
