import { useEffect, useState } from 'react'
import { AdminCompras, AdminCuentas, AdminTrabajadores } from '@repo/ui/admin-views'
import { PerfilForm } from '@repo/ui/perfil-form'
import {
  BACKEND_SOPORTE,
  perfilDe,
  puede,
  requierePinTrabajador,
  type Perfil,
} from '@repo/ui/permisos'
import { adminApi, describirError, type Sesion, type UsuarioAdmin } from './api'
import { SeccionBitacora } from './SeccionBitacora'
import { SeccionSoporte } from './SeccionSoporte'
import { SeccionUsuarios } from './SeccionUsuarios'

const ROL_SOPORTE = 2 // ROLES[2] en ./api

/** Herramientas de pruebas con la misma presentación que las demás vistas del panel. */
export function VistaPruebas() {
  return (
    <div className="desktop-test-panel">
      <section className="wf-card">
        <h1>Panel de pruebas</h1>
        <p className="wf-muted">
          Consulta y modifica usuarios, crea cuentas de soporte y revisa la bitácora del sistema.
          Cada apartado conserva el resultado de su última operación.
        </p>
        <nav className="wf-row desktop-test-shortcuts" aria-label="Apartados del panel de pruebas">
          {[
            { id: 'pruebas-usuarios', titulo: 'Gestión de usuarios' },
            { id: 'pruebas-soporte', titulo: 'Crear cuenta de soporte' },
            { id: 'pruebas-bitacora', titulo: 'Bitácora / auditoría' },
          ].map(({ id, titulo }) => (
            <button
              key={id}
              type="button"
              className="wf-button wf-button--secondary"
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
            >
              {titulo}
            </button>
          ))}
        </nav>
      </section>
      <SeccionUsuarios />
      <SeccionSoporte />
      <SeccionBitacora />
    </div>
  )
}

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

/** Vistas de "web y escritorio.pdf" para ADMINISTRADOR y SOPORTE (= Trabajador), sobre los mismos endpoints del panel. */
export function VistaCuentas({ perfil }: { perfil: Perfil }) {
  const { usuarios, cargando, error, conRecarga, cambiarAcceso } = useUsuarios()
  return (
    <AdminCuentas
      titulo="Administrar cuentas"
      usuarios={usuarios}
      cargando={cargando}
      error={error}
      // Igual que en la web: la UI sigue el mockup del Trabajador, el backend aún lo rechaza (403).
      aviso={perfil === 'SOPORTE' ? BACKEND_SOPORTE : undefined}
      pinParaEliminar={requierePinTrabajador(perfil)}
      onGuardar={conRecarga(adminApi.actualizarDatos)}
      onCambiarAcceso={cambiarAcceso}
      onEliminarApadrinado={conRecarga(adminApi.eliminarApadrinado)}
    />
  )
}

export function VistaCompras({ perfil }: { perfil: Perfil }) {
  return (
    <AdminCompras
      titulo="Administrar compras"
      puedeEditar={puede(perfil, 'admin.compras.editar')}
      pinParaEliminar={requierePinTrabajador(perfil)}
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
      onGuardar={async (nombre, correo) => {
        try {
          const usuario = await adminApi.actualizarMiUsuario(nombre, correo)
          onActualizado({ ...sesion, usuario: { ...sesion.usuario, ...usuario } })
        } catch (causa) {
          throw new Error(await describirError(causa), { cause: causa })
        }
      }}
    />
  )
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
