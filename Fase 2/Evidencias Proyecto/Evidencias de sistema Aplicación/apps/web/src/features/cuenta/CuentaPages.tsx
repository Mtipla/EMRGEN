import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { downloadBlob } from '@repo/api-client'
import { GestionApadrinados, apadrinadosApi } from '@repo/ui/cuentas-apadrinadas'
import { PerfilForm, perfilApi } from '@repo/ui/perfil-form'
import { ResumenCuenta } from '@repo/ui/resumen-cuenta'
import { accesoCompleto, perfilDe, visible, type Accion } from '@repo/ui/permisos'
import { SolicitudSoporte, type Catalogo, type Ticket } from '@repo/ui/soporte'
import { NumerosEmergencia } from '@repo/ui/wireframe'
import type { AuthenticatedUser } from '../auth/AuthForm'
import { apiFetch, internalFetch, useCupos, useRemote } from './session'

// Fuera de los componentes: GestionApadrinados recarga cuando cambia `api`.
const apadrinados = apadrinadosApi(apiFetch)

/** Home con sesión: accesos según perfil y números de emergencia. */
export function HomePage({ user }: { user: AuthenticatedUser }) {
  const disponible = (accion: Accion) => visible(user, accion)

  return (
    <>
      <section className="wf-card">
        <h1>Hola, {user.nombre_usuario}</h1>
        <div className="wf-row">
          <Link className="wf-button wf-button--secondary" to="/perfil">Modificar usuario</Link>
          {disponible('cuentas.informe') && (
            <Link className="wf-button wf-button--secondary" to="/cuentas">Administrar cuentas</Link>
          )}
          {disponible('compras.comprar') && (
            <Link className="wf-button" to={user.plan_efectivo ? '/comprar' : '/premium'}>
              {user.plan_efectivo ? 'Comprar cupos de cuentas' : 'Comprar Premium'}
            </Link>
          )}
          {perfilDe(user) !== 'ADMINISTRADOR' && disponible('soporte.solicitar') && (
            <Link className="wf-button wf-button--secondary" to="/soporte">Solicitar soporte</Link>
          )}
        </div>
      </section>

      <ResumenCuenta user={user} />

      <NumerosEmergencia />
    </>
  )
}

/** Informe con alertas y actividad; el servidor determina qué cuentas incluye. */
export function DescargarInforme({ esPrincipal }: { esPrincipal: boolean }) {
  const [formato, setFormato] = useState<'pdf' | 'xlsx'>('pdf')
  const [estado, setEstado] = useState({ cargando: false, error: '' })

  async function descargar() {
    setEstado({ cargando: true, error: '' })
    try {
      const archivo = await apiFetch<Blob>(`/usuarios/me/informe?formato=${formato}`, {
        headers: { Accept: formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      })
      downloadBlob(archivo, `informe-personal-${new Date().toISOString().slice(0, 10)}.${formato}`)
      setEstado({ cargando: false, error: '' })
    } catch (cause) {
      setEstado({ cargando: false, error: (cause as Error).message })
    }
  }

  return (
    <section className="wf-card wf-form">
      <h2>Informe de actividad</h2>
      <p className="wf-muted">
        {esPrincipal
          ? 'Descarga tus alertas y acciones, junto con las de tus cuentas apadrinadas.'
          : 'Descarga las alertas y acciones de tu cuenta.'}
      </p>
      <label>
        Formato del informe
        <select value={formato} disabled={estado.cargando} onChange={(e) => setFormato(e.target.value as 'pdf' | 'xlsx')}>
          <option value="pdf">PDF</option>
          <option value="xlsx">Excel (.xlsx)</option>
        </select>
      </label>
      <button type="button" className="wf-button wf-button--secondary" disabled={estado.cargando} onClick={() => void descargar()}>
        {estado.cargando ? 'Generando informe…' : 'Descargar Informe PDF/Excel'}
      </button>
      {estado.error && <p className="wf-message wf-message--error" role="alert">No se pudo generar el informe: {estado.error}</p>}
    </section>
  )
}

type ProfilePageProps = {
  user: AuthenticatedUser
  onUserUpdated: (user: AuthenticatedUser) => void
}

// Fuera del componente: PerfilForm recarga cuando cambia `api`.
const perfilDatos = perfilApi(apiFetch)

/** "Modificar Usuario": nombre y correo con PATCH /usuarios/me; datos de emergencia con /usuarios/me/perfil y /contactos. */
export function ProfilePage({ user, onUserUpdated }: ProfilePageProps) {
  const perfil = perfilDe(user)

  async function guardar(nombre_usuario: string, correo_usuario: string, PIN_principal?: string) {
    const updated = await apiFetch<AuthenticatedUser>('/usuarios/me', {
      method: 'PATCH',
      body: JSON.stringify({ nombre_usuario, correo_usuario: correo_usuario || undefined, PIN_principal }),
    })
    localStorage.setItem('emergen.user', JSON.stringify(updated))
    onUserUpdated(updated)
  }

  return (
    <PerfilForm
      nombreUsuario={user.nombre_usuario}
      correo={user.correo_usuario}
      onGuardarPersonal={async (datos) => {
        const updated = await apiFetch<AuthenticatedUser>('/usuarios/me', { method: 'PATCH', body: JSON.stringify(datos) })
        localStorage.setItem('emergen.user', JSON.stringify(updated))
        onUserUpdated(updated)
      }}
      variante={perfil === 'ADMINISTRADOR' ? 'administrador' : perfil === 'SOPORTE' ? 'soporte' : 'usuario'}
      // Sesiones antiguas sin estado_ID no se tratan como parciales; el backend decide igual.
      accesoParcial={user.estado_ID !== undefined && !accesoCompleto(user)}
      onGuardar={guardar}
      api={perfilDatos}
      onCambiarPassword={async (password_actual, password_nueva) => {
        await apiFetch('/usuarios/me/password', {
          method: 'PATCH',
          body: JSON.stringify({ password_actual, password_nueva }),
        })
      }}
    />
  )
}

/** "Administrar Cuentas" del usuario principal: cupos comprados y sus cuentas apadrinadas reales. */
export function AccountsPage({ user }: { user: AuthenticatedUser }) {
  const esPrincipal = perfilDe(user) === 'USUARIO'
  return (
    <>
      {visible(user, 'cuentas.apadrinadas')
        ? <CuentasPrincipal />
        : <section className="wf-card"><h1>Administrar cuentas</h1></section>}
      <DescargarInforme esPrincipal={esPrincipal} />
    </>
  )
}

function CuentasPrincipal() {
  const navigate = useNavigate()
  const { cupos, cargando, error } = useCupos()

  if (cargando) return <p className="wf-muted">Cargando cuentas…</p>

  return (
    <GestionApadrinados cupos={cupos} aviso={error} api={apadrinados} onAnadir={() => navigate('/comprar')} />
  )
}

const aCatalogo = (filas: { categoria_id: number; nombre: string }[]): Catalogo[] =>
  filas.map((f) => ({ id: f.categoria_id, nombre: f.nombre }))

/** HU-18 / RF18: solicitud de soporte (internal-api). */
export function SoportePage() {
  const categorias = useRemote(
    () => internalFetch<{ categoria_id: number; nombre: string }[]>('/tickets-soporte/categorias').then(aCatalogo),
    [],
  )
  const tickets = useRemote(() => internalFetch<Ticket[]>('/tickets-soporte'), [])

  return (
    <SolicitudSoporte
      categorias={categorias.data}
      tickets={tickets.data}
      cargando={tickets.cargando}
      error={categorias.error || tickets.error}
      onCrear={async (descripcion, categoria_id) => {
        await internalFetch('/tickets-soporte', { method: 'POST', body: JSON.stringify({ descripcion, categoria_id }) })
        tickets.recargar()
      }}
    />
  )
}
