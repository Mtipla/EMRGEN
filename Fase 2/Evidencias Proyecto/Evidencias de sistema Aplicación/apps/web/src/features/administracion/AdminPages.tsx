import { AdminCuentas, AdminTrabajadores, type UsuarioAdminFila } from '@repo/ui/admin-views'
import { puede, type Perfil } from '@repo/ui/permisos'
import { AlertasTabla, type Alerta, type Ticket } from '@repo/ui/soporte'
import { AdminTickets } from '@repo/ui/admin-tickets'
import { apiFetch, internalFetch, useRemote } from '../cuenta/session'

const ROL_SOPORTE = 2

export { AdminComprasPage } from './AdminComprasPage'

/** Listado de GET /admin/usuarios (rol Administrador) y acciones que lo recargan al terminar. */
function useAdminUsuarios() {
  const { data, cargando, error, recargar } = useRemote(() => apiFetch<UsuarioAdminFila[]>('/admin/usuarios'), [])

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
  const { usuarios, cargando, error, conRecarga, cambiarAcceso } = useAdminUsuarios()

  return (
    <AdminTrabajadores
      trabajadores={usuarios.filter((u) => u.rol_ID === ROL_SOPORTE)}
      cargando={cargando}
      error={error}
      onCrear={conRecarga((nombre_usuario: string, correo_usuario: string, password: string) =>
        apiFetch('/admin/usuarios/soporte', {
          method: 'POST',
          body: JSON.stringify({ nombre_usuario, correo_usuario, password }),
        }),
      )}
      onCambiarAcceso={cambiarAcceso}
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
const actualizarTicket = (id: number, cambios: { estado?: string; solucion?: string }) =>
  internalFetch(`/tickets-soporte/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) })

export function AdminTicketsPage() {
  return <AdminTickets listar={listarTickets} listarEstados={listarEstados} actualizar={actualizarTicket} />
}

export function AdminAlertasPage() {
  const { data, cargando, error } = useRemote(() => internalFetch<Alerta[]>('/alertas?limit=100'), [])
  return <AlertasTabla alertas={data} cargando={cargando} error={error} />
}
