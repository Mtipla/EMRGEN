import type { ApiErrorResponse } from '@repo/api-types';

/** Error lanzado cuando el backend responde con un código HTTP de error. */
export class ApiError extends Error {
  readonly status: number;
  readonly body?: ApiErrorResponse;

  constructor(status: number, body?: ApiErrorResponse) {
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    super(message ?? `Error HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export interface HttpClient {
  json<T>(path: string, init?: RequestInit): Promise<T>;
  blob(path: string, init?: RequestInit): Promise<Blob>;
}

/** Cliente HTTP mínimo sobre fetch, con la URL base del backend. */
export function createHttpClient(baseUrl: string): HttpClient {
  const base = baseUrl.replace(/\/+$/, '');

  async function send(path: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

    const response = await fetch(`${base}${path}`, { ...init, headers });
    if (!response.ok) {
      const body = (await response.json().catch(() => undefined)) as ApiErrorResponse | undefined;
      throw new ApiError(response.status, body);
    }
    return response;
  }

  return {
    async json<T>(path: string, init?: RequestInit) {
      return (await (await send(path, init)).json()) as T;
    },
    async blob(path: string, init?: RequestInit) {
      return (await send(path, init)).blob();
    },
  };
}
