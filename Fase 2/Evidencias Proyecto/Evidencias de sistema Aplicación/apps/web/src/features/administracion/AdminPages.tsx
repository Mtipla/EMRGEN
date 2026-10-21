import { AdminCompras, AdminCuentas, AdminTrabajadores, type UsuarioAdminFila } from '@repo/ui/admin-views'
import { BACKEND_SOPORTE, puede, requierePinTrabajador, type Perfil } from '@repo/ui/permisos'
import { AlertasTabla, GestionTickets, type Alerta, type Ticket } from '@repo/ui/soporte'
import { apiFetch, internalFetch, useRemote } from '../cuenta/session'

const ROL_SOPORTE = 2

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
      // Inconsistencia I-02: la UI sigue el mockup del Trabajador, el backend aún lo rechaza (403).
      aviso={perfil === 'SOPORTE' ? BACKEND_SOPORTE : undefined}
      pinParaEliminar={requierePinTrabajador(perfil)}
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

export function AdminComprasPage({ perfil }: { perfil: Perfil | null }) {
  return (
    <AdminCompras
      titulo="Administrar compras"
      puedeEditar={puede(perfil, 'admin.compras.editar')}
      pinParaEliminar={requierePinTrabajador(perfil)}
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
export function AdminTicketsPage() {
  const tickets = useRemote(() => internalFetch<Ticket[]>('/tickets-soporte?limit=100'), [])
  const estados = useRemote(
    () =>
      internalFetch<{ estado_id: number; nombre: string }[]>('/tickets-soporte/estados').then((filas) =>
        filas.map((f) => ({ id: f.estado_id, nombre: f.nombre })),
      ),
    [],
  )

  return (
    <GestionTickets
      tickets={tickets.data}
      estados={estados.data}
      cargando={tickets.cargando}
      error={tickets.error || estados.error}
      onActualizar={async (id, cambios) => {
        await internalFetch(`/tickets-soporte/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) })
        tickets.recargar()
      }}
    />
  )
}

export function AdminAlertasPage() {
  const { data, cargando, error } = useRemote(() => internalFetch<Alerta[]>('/alertas?limit=100'), [])
  return <AlertasTabla alertas={data} cargando={cargando} error={error} />
}
