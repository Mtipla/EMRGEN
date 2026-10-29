import { AdminCuentas, AdminTrabajadores, type UsuarioAdminFila } from '@repo/ui/admin-views'
import { puede, type Perfil } from '@repo/ui/permisos'
import { AlertasTabla, type Alerta, type Catalogo, type Ticket } from '@repo/ui/soporte'
import { AdminContacto, type CambiosMensaje, type MensajeContacto } from '@repo/ui/admin-contacto'
import { AdminTickets } from '@repo/ui/admin-tickets'
import type { CambiosTicket } from '@repo/ui/soporte'
import type { ExpedienteCuenta } from '@repo/ui/admin-cuentas'
import type { CambiosTrabajador } from '@repo/ui/admin-trabajadores'
import { AdminPlanes, type ApiPlanes } from '@repo/ui/admin-planes'
import { apiFetch, internalFetch, useRemote } from '../cuenta/session'

const consultarCuenta = (id: number, signal: AbortSignal) =>
  apiFetch<ExpedienteCuenta>(`/admin/usuarios/${id}`, { signal })

export { AdminComprasPage } from './AdminComprasPage'

const apiPlanes: ApiPlanes = {
  listar: () => apiFetch('/admin/usuarios'),
  planes: () => apiFetch('/admin/usuarios/planes'),
  consultar: (id, signal) => apiFetch(`/admin/usuarios/${id}`, { signal }),
  guardar: (id, datos) => apiFetch(`/admin/usuarios/${id}/plan`, { method: 'PUT', body: JSON.stringify(datos) }),
}
export function AdminPlanesPage() { return <AdminPlanes api={apiPlanes} /> }

/** Listado de GET /admin/usuarios (rol Administrador) y acciones que lo recargan al terminar. */
function useAdminUsuarios(ruta = '/admin/usuarios') {
  const { data, cargando, error, recargar } = useRemote(() => apiFetch<UsuarioAdminFila[]>(ruta), [])

  const conRecarga =
    <A extends unknown[]>(accion: (...args: A) => Promise<unknown>) =>
    async (...args: A) => {
      await accion(...args)
      recargar()
    }

  const cambiarAcceso = conRecarga((id: number, estado_ID: number) =>
    apiFetch(`/admin/usuarios/${id}/estado`, { method: 'PUT', body: JSON.stringify({ estado_ID }) }),
  )

  return { usuarios: data, cargando, error, conRecarga, cambiarAcceso }
}

/** Componente común para SOPORTE (= Trabajador) y ADMINISTRADOR; acciones según la matriz de permisos. */
export function AdminCuentasPage({ perfil }: { perfil: Perfil | null }) {
  const { usuarios, cargando, error, conRecarga, cambiarAcceso } = useAdminUsuarios()
  const editar = puede(perfil, 'admin.cuentas.editar')
  const eliminar = puede(perfil, 'admin.cuentas.eliminar')

  return (
    <AdminCuentas
      titulo="Administrar cuentas"
      usuarios={usuarios}
      cargando={cargando}
      error={error}
      soloLectura={!editar}
      onConsultar={consultarCuenta}
      onGuardar={
        editar
          ? conRecarga((id: number, nombre_usuario: string, correo_usuario: string) =>
              apiFetch(`/admin/usuarios/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ nombre_usuario, correo_usuario }),
              }),
            )
          : undefined
      }
      onCambiarAcceso={editar ? cambiarAcceso : undefined}
      onEliminarApadrinado={
        eliminar
          ? conRecarga((id: number) => apiFetch(`/admin/usuarios/apadrinado/${id}`, { method: 'DELETE' }))
          : undefined
      }
    />
  )
}

export function AdminTrabajadoresPage() {
  const { usuarios, cargando, error, conRecarga } = useAdminUsuarios('/admin/usuarios/trabajadores')

  return (
    <AdminTrabajadores
      trabajadores={usuarios}
      cargando={cargando}
      error={error}
      onCrear={conRecarga((nombre_usuario: string, correo_usuario: string, password: string) =>
        apiFetch('/admin/usuarios/soporte', {
          method: 'POST',
          body: JSON.stringify({ nombre_usuario, correo_usuario, password }),
        }),
      )}
      onActualizar={conRecarga((id: number, cambios: CambiosTrabajador) =>
        apiFetch(`/admin/usuarios/trabajadores/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) }))}
      onEliminar={conRecarga((id: number) =>
        apiFetch(`/admin/usuarios/trabajadores/${id}`, { method: 'DELETE' }))}
    />
  )
}

/** Función documentada de SOPORTE (ERS/HU-18): responder tickets y cambiar su estado. */
const listarTickets = (consulta: { estado: string; limit: number; offset: number }, signal: AbortSignal) => {
  const params = new URLSearchParams({ limit: String(consulta.limit), offset: String(consulta.offset) })
  if (consulta.estado) params.set('estado', consulta.estado)
  return internalFetch<Ticket[]>(`/tickets-soporte?${params}`, { signal })
}
const listarEstados = (signal: AbortSignal) =>
  internalFetch<{ estado_id: number; nombre: string }[]>('/tickets-soporte/estados', { signal }).then((filas) =>
    filas.map((f) => ({ id: f.estado_id, nombre: f.nombre })),
  )
const actualizarTicket = (id: number, cambios: CambiosTicket) =>
  internalFetch(`/tickets-soporte/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) })
const descargarInformeTickets = (formato: 'pdf' | 'xlsx') =>
  apiFetch<Blob>(`/admin/tickets/reporte?formato=${formato}`, {
    headers: { Accept: formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  })

export function AdminTicketsPage({ perfil }: { perfil: Perfil | null }) {
  return <AdminTickets esAdministrador={perfil === 'ADMINISTRADOR'} listar={listarTickets} listarEstados={listarEstados} actualizar={actualizarTicket}
    descargarInforme={perfil === 'ADMINISTRADOR' ? descargarInformeTickets : undefined} />
}

/** Mensajes del formulario público (MENSAJE_CONTACTO): ADMINISTRADOR y SOPORTE responden y cambian el estado. */
const apiContacto = {
  listar: (consulta: { estado: string; limit: number }, signal: AbortSignal) => {
    const params = new URLSearchParams({ limit: String(consulta.limit) })
    if (consulta.estado) params.set('estado', consulta.estado)
    return internalFetch<MensajeContacto[]>(`/mensajes-contacto?${params}`, { signal })
  },
  listarEstados: (signal: AbortSignal) => internalFetch<Catalogo[]>('/mensajes-contacto/estados', { signal }),
  actualizar: (id: number, cambios: CambiosMensaje) =>
    internalFetch<MensajeContacto>(`/mensajes-contacto/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) }),
}

export function AdminContactoPage() {
  return <AdminContacto {...apiContacto} />
}

export function AdminAlertasPage() {
  const { data, cargando, error } = useRemote(() => internalFetch<Alerta[]>('/alertas?limit=100'), [])
  return <AlertasTabla alertas={data} cargando={cargando} error={error} />
}
