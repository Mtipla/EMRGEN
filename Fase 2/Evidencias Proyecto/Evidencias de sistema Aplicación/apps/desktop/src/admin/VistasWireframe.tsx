import { useEffect, useState } from 'react'
import { AdminCompras, AdminCuentas, AdminTrabajadores } from '@repo/ui/admin-views'
import { adminApi, describirError, type UsuarioAdmin } from './api'

const ROL_SOPORTE = 2 // ROLES[2] en ./api

/** Listado de usuarios con adminApi; cada acción traduce el error de Axios y recarga. */
function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [estado, setEstado] = useState({ cargando: true, error: '' })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let activo = true
    adminApi.listarUsuarios().then(
      (lista) => {
        if (!activo) return
        setUsuarios(lista)
        setEstado({ cargando: false, error: '' })
      },
      async (causa: unknown) => {
        const error = await describirError(causa)
        if (activo) setEstado({ cargando: false, error })
      },
    )
    return () => {
      activo = false
    }
  }, [version])

  const conRecarga =
    <A extends unknown[]>(accion: (...args: A) => Promise<unknown>) =>
    async (...args: A) => {
      try {
        await accion(...args)
      } catch (causa) {
        throw new Error(await describirError(causa), { cause: causa })
      }
      setVersion((v) => v + 1)
    }

  return { usuarios, ...estado, conRecarga, cambiarAcceso: conRecarga(adminApi.cambiarEstado) }
}

/** Vistas de "web y escritorio.pdf" para el administrador, sobre los mismos endpoints del panel. */
export function VistaCuentas() {
  const { usuarios, cargando, error, conRecarga, cambiarAcceso } = useUsuarios()
  return (
    <AdminCuentas
      titulo="Administrar cuentas"
      usuarios={usuarios}
      cargando={cargando}
      error={error}
      onGuardar={conRecarga(adminApi.actualizarDatos)}
      onCambiarAcceso={cambiarAcceso}
      onEliminarApadrinado={conRecarga(adminApi.eliminarApadrinado)}
    />
  )
}

export function VistaCompras() {
  // El panel de escritorio solo admite ADMINISTRADOR (PanelAdmin comprueba GET /admin/usuarios).
  return <AdminCompras titulo="Administrar compras" puedeEditar />
}

export function VistaTrabajadores() {
  const { usuarios, cargando, error, conRecarga, cambiarAcceso } = useUsuarios()
  return (
    <AdminTrabajadores
      trabajadores={usuarios.filter((u) => u.rol_ID === ROL_SOPORTE)}
      cargando={cargando}
      error={error}
      onCrear={conRecarga((nombre_usuario: string, correo_usuario: string, password: string) =>
        adminApi.crearSoporte({ nombre_usuario, correo_usuario, password }),
      )}
      onCambiarAcceso={cambiarAcceso}
    />
  )
}
