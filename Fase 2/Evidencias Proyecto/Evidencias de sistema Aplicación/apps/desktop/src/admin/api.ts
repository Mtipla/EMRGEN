import axios, { isAxiosError, type AxiosResponse } from 'axios'

/**
 * Cliente Axios del panel de administrador. El renderer de Electron no usa Node.js:
 * todo pasa por HTTP hacia la API de NestJS.
 *
 * La URL sale de VITE_API_URL y depende del modo de Vite, sin valor por defecto para que
 * el panel nunca se conecte en silencio a un backend distinto del esperado:
 *   - `dev`        -> .env        -> backend local (npm run start:dev), puerto 3000
 *   - `dev:docker` -> .env.docker -> backend de docker compose, puerto 3001
 */
export const API_URL: string = import.meta.env.VITE_API_URL ?? ''
export const MODO_API =
  import.meta.env.MODE === 'docker' ? 'backend de Docker' : 'backend local (start:dev)'

const http = axios.create({ baseURL: API_URL })

// El token vive solo en memoria: se pierde al cerrar o recargar la ventana.
let token = ''
export function setToken(nuevo: string) {
  token = nuevo
}

http.interceptors.request.use((config) => {
  if (token && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

export const ROLES: Record<number, string> = { 1: 'ADMINISTRADOR', 2: 'SOPORTE', 3: 'USUARIO' }
export const ESTADOS: Record<number, string> = {
  1: 'ACCESO COMPLETO',
  2: 'ACCESO PARCIAL',
  3: 'BLOQUEADO/INACTIVO',
}

export type Sesion = {
  access_token: string
  usuario: { usuario_ID: number; nombre_usuario: string; correo_usuario: string }
}

export type UsuarioAdmin = {
  usuario_ID: number
  nombre_usuario: string
  correo_usuario: string
  rol_ID: number
  estado_ID: number
  usuario_principal_ID?: number | null
}

export type DatosSoporte = { nombre_usuario: string; correo_usuario: string; password: string }

export type PlanUsuario = {
  plan_usuario_ID: number
  usuario_ID: number
  tiene_acceso_completo: boolean
  cupos_apadrinados_adq: number
  cupos_apadrinados_utili: number
}

export type DatosPlan = Pick<PlanUsuario, 'tiene_acceso_completo' | 'cupos_apadrinados_adq'>

export type Expediente = {
  usuario: UsuarioAdmin
  plan: PlanUsuario | null
  apadrinados: Pick<UsuarioAdmin, 'usuario_ID' | 'nombre_usuario' | 'estado_ID'>[]
}

type Valor = string | number | boolean | null

export type EntradaBitacora = {
  bitacora_sistema_ID: number
  fecha_accion: string
  accion_realizada: string
  tipo_accion: string | null
  entidad_afectada: string | null
  resultado: 'EXITOSA' | 'FALLIDA'
  cambios: Record<string, { antes: Valor; despues: Valor }> | null
  usuario_ID: number
  nombre_usuario: string | null
  rol_actor_ID: number | null
  usuario_afectado_ID: number | null
  nombre_usuario_afectado: string | null
  aplicacion_ID: number
  origen_aplicacion: string | null
}

/** Filtros de la bitácora tal como salen de los inputs ('' = sin filtro). */
export type FiltrosBitacora = {
  desde: string
  hasta: string
  usuario_ID: string
  usuario_afectado_ID: string
  aplicacion_ID: string
  limite: string
}

const datos = <T>(respuesta: Promise<AxiosResponse<T>>) => respuesta.then((r) => r.data)

/** El backend rechaza parámetros vacíos: solo se envían los campos con valor. */
const sinVacios = (campos: Record<string, string>) =>
  Object.fromEntries(Object.entries(campos).filter(([, valor]) => valor !== ''))

export const adminApi = {
  login: (correo_usuario: string, password: string) =>
    datos(http.post<Sesion>('/usuarios/login', { correo_usuario, password })),

  // Usuarios
  listarUsuarios: () => datos(http.get<UsuarioAdmin[]>('/admin/usuarios')),
  verExpediente: (id: number) => datos(http.get<Expediente>(`/admin/usuarios/${id}`)),
  actualizarDatos: (id: number, nombre_usuario: string, correo_usuario: string) =>
    datos(
      http.patch<UsuarioAdmin>(
        `/admin/usuarios/${id}`,
        sinVacios({ nombre_usuario: nombre_usuario.trim(), correo_usuario: correo_usuario.trim() }),
      ),
    ),
  guardarPlan: (id: number, plan: DatosPlan) =>
    datos(http.put<PlanUsuario>(`/admin/usuarios/${id}/plan`, plan)),
  cambiarEstado: (id: number, estado_ID: number) =>
    datos(http.put<UsuarioAdmin>(`/admin/usuarios/${id}/estado`, { estado_ID })),
  eliminarApadrinado: (id: number) => datos(http.delete<void>(`/admin/usuarios/apadrinado/${id}`)),
  crearSoporte: (cuenta: DatosSoporte) =>
    datos(http.post<UsuarioAdmin>('/admin/usuarios/soporte', cuenta)),

  // Bitácora / auditoría (solo lectura: las entradas las genera el backend)
  listarBitacora: (filtros: FiltrosBitacora) =>
    datos(http.get<EntradaBitacora[]>('/admin/auditoria', { params: sinVacios(filtros) })),
  /** PDF generado por jsReport en el backend. */
  descargarReporte: (filtros: FiltrosBitacora) =>
    datos(
      http.get<Blob>('/admin/auditoria/reporte', {
        params: sinVacios(filtros),
        responseType: 'blob',
      }),
    ),
}

/** Mensaje legible de un error de Axios (el backend responde `{ message }`). */
export async function describirError(error: unknown): Promise<string> {
  if (!isAxiosError(error)) return error instanceof Error ? error.message : String(error)
  if (!error.response) {
    return (
      `Sin respuesta de ${API_URL} (${MODO_API}). Revisa que ese backend esté levantado y que ` +
      `su CORS_ORIGINS incluya ${window.location.origin}. Para usar el otro backend inicia el ` +
      `panel con el script del otro modo (dev / dev:docker).`
    )
  }

  let cuerpo: unknown = error.response.data
  // Con responseType 'blob' (PDF), el JSON del error también llega como Blob.
  if (cuerpo instanceof Blob) {
    cuerpo = await cuerpo
      .text()
      .then((texto) => JSON.parse(texto) as unknown)
      .catch(() => undefined)
  }
  const mensaje = (cuerpo as { message?: string | string[] } | undefined)?.message
  return `HTTP ${error.response.status}: ${Array.isArray(mensaje) ? mensaje.join(', ') : (mensaje ?? error.message)}`
}
