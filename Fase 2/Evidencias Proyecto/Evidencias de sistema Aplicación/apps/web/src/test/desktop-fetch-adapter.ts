import type { AxiosAdapter } from 'axios'

/** Permite probar el cliente real del panel con las respuestas HTTP simuladas de estas pruebas. */
export const desktopFetchAdapter: AxiosAdapter = async (config) => {
  const url = new URL(`${config.baseURL?.replace(/\/$/, '')}/${config.url?.replace(/^\//, '')}`)
  for (const [key, value] of Object.entries(config.params ?? {})) {
    url.searchParams.set(key, String(value))
  }
  const response = await fetch(url.toString(), {
    method: config.method?.toUpperCase(),
    headers: config.headers.toJSON() as Record<string, string>,
    body: config.data,
    signal: config.signal as AbortSignal | undefined,
  })
  return {
    data: config.responseType === 'blob' ? await response.blob() : await response.json().catch(() => null),
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    config,
  }
}
