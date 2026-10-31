import { BadGatewayException, Logger } from '@nestjs/common';

const logger = new Logger('ExternalApi');

export interface ExternalRequestInit extends RequestInit {
  /** Tiempo máximo de espera en ms (por defecto 15 s). */
  timeoutMs?: number;
}

/**
 * `fetch` hacia un proveedor externo con timeout y manejo de errores uniforme.
 * Solo registra evento, integración y estado HTTP permitidos; omite cuerpo y excepción.
 * Al cliente se le devuelve un 502 genérico para no filtrar información interna.
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
  } catch {
    // Allowlist: never log URL, request/response bodies, headers or exception text.
    logger.error({ event: 'provider_unavailable', integration });
    throw new BadGatewayException(
      `${integration}: no se pudo contactar al proveedor.`,
    );
  }

  if (!response.ok) {
    logger.error({ event: 'provider_rejected', integration, status: response.status });
    await response.body?.cancel().catch(() => undefined);
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
  try {
    return JSON.parse(new TextDecoder().decode(await boundedExternalBody(response, 524_288))) as T;
  } catch {
    throw new BadGatewayException(`${integration}: respuesta JSON inválida del proveedor.`);
  }
}

/** Limit actual response bytes, including chunked provider responses. */
export async function boundedExternalBody(response: Response, maximum: number): Promise<Uint8Array> {
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > maximum) {
        await reader.cancel();
        throw new BadGatewayException('Respuesta del proveedor demasiado grande');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}
