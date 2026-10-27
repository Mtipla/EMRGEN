import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
/** FastAPI internal-api (alertas y tickets); requiere INTERNAL_API_CORS_ORIGINS con el origen de la web. */
export const INTERNAL_API_URL = import.meta.env.VITE_INTERNAL_API_URL ?? 'http://localhost:8000'

/** fetch al backend con el token de la sesión; lanza Error con el `message` (o `detail`) del backend. */
export async function apiFetch<T>(path: string, init: RequestInit = {}, base = API_URL): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('emergen.token') ?? ''}`,
      ...init.headers,
    },
  }).catch(() => {
    // fetch solo rechaza por red/CORS: "Failed to fetch" no le dice nada al usuario.
    throw new Error('Error al comunicarse con el servidor. Inténtalo nuevamente.')
  })
  // Archivos (PDF): el cuerpo solo se lee como JSON si es un error.
  if (response.ok && init.headers && (init.headers as Record<string, string>).Accept === 'application/pdf') {
    return (await response.blob()) as T
  }
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const body = data as { message?: string | string[]; detail?: string } | null
    const message = body?.message ?? body?.detail
    throw new Error((Array.isArray(message) ? message.join(', ') : message) ?? `Error ${response.status}`)
  }
  return data as T
}

export const internalFetch = <T>(path: string, init?: RequestInit) =>
  apiFetch<T>(`/internal/v1${path}`, init, INTERNAL_API_URL)

/** GET una vez al montar; `recargar` vuelve a pedir. */
export function useRemote<T>(load: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial)
  const [estado, setEstado] = useState({ cargando: true, error: '' })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    load().then(
      (value) => {
        if (!active) return
        setData(value)
        setEstado({ cargando: false, error: '' })
      },
      (cause: Error) => active && setEstado({ cargando: false, error: cause.message }),
    )
    return () => {
      active = false
    }
    // `load` es una función nueva en cada render; solo se recarga con `version`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  return { data, ...estado, recargar: () => setVersion((v) => v + 1) }
}

/** Cupos de apadrinados (GET /compras/apadrinados); null si la cuenta no puede comprar. */
export function useCupos() {
  const token = localStorage.getItem('emergen.token') ?? ''
  const { data, cargando, error } = useRemote<number | null>(
    () => api.compras.summary(token).then((resumen) => resumen.cuposAdquiridos),
    null,
  )
  return { cupos: data, cargando, error }
}
