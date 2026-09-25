import { BadGatewayException, Logger } from '@nestjs/common';

const logger = new Logger('ExternalApi');

export interface ExternalRequestInit extends RequestInit {
  /** Tiempo máximo de espera en ms (por defecto 15 s). */
  timeoutMs?: number;
}

/**
 * `fetch` hacia un proveedor externo con timeout y manejo de errores uniforme.
 * El detalle de la respuesta del proveedor solo se registra en el log del servidor;
 * al cliente se le devuelve un 502 genérico para no filtrar información interna.
 * Nunca se registra la URL, porque algunas (Google Maps) llevan la API key.
 */
export async function requestExternal(
  integration: string,
  url: string,
  { timeoutMs = 15_000, ...init }: ExternalRequestInit = {},
): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    logger.error(
      `${integration}: sin respuesta del proveedor (${(error as Error).message})`,
    );
    throw new BadGatewayException(
      `${integration}: no se pudo contactar al proveedor.`,
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    logger.error(
      `${integration} respondió HTTP ${response.status}: ${body.slice(0, 500)}`,
    );
    throw new BadGatewayException(
      `${integration} rechazó la solicitud (HTTP ${response.status}).`,
    );
  }

  return response;
}

export async function requestExternalJson<T>(
  integration: string,
  url: string,
  init?: ExternalRequestInit,
): Promise<T> {
  const response = await requestExternal(integration, url, init);
  return (await response.json()) as T;
}
