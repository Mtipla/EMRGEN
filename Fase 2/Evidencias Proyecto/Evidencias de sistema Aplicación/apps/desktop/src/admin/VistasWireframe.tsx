import { useEffect, useState } from 'react'
import { AdminCuentas, AdminTrabajadores } from '@repo/ui/admin-views'
import { PerfilForm } from '@repo/ui/perfil-form'
import {
  perfilDe,
  puede,
  type Perfil,
} from '@repo/ui/permisos'
import { adminApi, describirError, type Sesion, type UsuarioAdmin } from './api'

const consultarCuenta = async (id: number, signal: AbortSignal) => {
  try { return await adminApi.verExpediente(id, signal) }
  catch (causa) { throw new Error(await describirError(causa), { cause: causa }) }
}

export { VistaCompras } from './VistaCompras'

/** Listado de usuarios con adminApi; cada acción traduce el error de Axios y recarga. */
function useUsuarios(listar = adminApi.listarUsuarios) {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [estado, setEstado] = useState({ cargando: true, error: '' })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let activo = true
    listar().then(
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
  }, [listar, version])

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

/** Vistas de "web y escritorio.pdf" para ADMINISTRADOR y SOPORTE (= Trabajador), sobre los mismos endpoints del panel. */
export function VistaCuentas({ perfil }: { perfil: Perfil }) {
  const { usuarios, cargando, error, conRecarga, cambiarAcceso } = useUsuarios()
  return (
    <AdminCuentas
      titulo="Administrar cuentas"
      usuarios={usuarios}
      cargando={cargando}
      error={error}
      soloLectura={!puede(perfil, 'admin.cuentas.editar')}
      onConsultar={consultarCuenta}
      onGuardar={puede(perfil, 'admin.cuentas.editar') ? conRecarga(adminApi.actualizarDatos) : undefined}
      onCambiarAcceso={puede(perfil, 'admin.cuentas.editar') ? cambiarAcceso : undefined}
      onEliminarApadrinado={puede(perfil, 'admin.cuentas.eliminar') ? conRecarga(adminApi.eliminarApadrinado) : undefined}
    />
  )
}

/** "Modificar Usuario" del personal (mockup págs. 12 y 32) con PATCH /usuarios/me. */
export function VistaPerfil({
  sesion,
  onActualizado,
}: {
  sesion: Sesion
  onActualizado: (s: Sesion) => void
}) {
  return (
    <PerfilForm
      nombreUsuario={sesion.usuario.nombre_usuario}
      correo={sesion.usuario.correo_usuario}
      variante={perfilDe(sesion.usuario) === 'SOPORTE' ? 'soporte' : 'administrador'}
      onGuardar={async () => {}}
      onGuardarPersonal={async (cambios) => {
        try {
          const usuario = await adminApi.actualizarMiUsuario(cambios)
          onActualizado({ ...sesion, usuario: { ...sesion.usuario, ...usuario } })
        } catch (causa) {
          throw new Error(await describirError(causa), { cause: causa })
        }
      }}
    />
  )
}

export function VistaTrabajadores() {
  const { usuarios, cargando, error, conRecarga } = useUsuarios(adminApi.listarTrabajadores)
  return (
    <AdminTrabajadores
      trabajadores={usuarios}
      cargando={cargando}
      error={error}
      onCrear={conRecarga((nombre_usuario: string, correo_usuario: string, password: string) =>
        adminApi.crearSoporte({ nombre_usuario, correo_usuario, password }),
      )}
      onActualizar={conRecarga(adminApi.actualizarTrabajador)}
      onEliminar={conRecarga(adminApi.eliminarTrabajador)}
    />
  )
}
