import { Link, useNavigate } from 'react-router-dom'
import { GestionApadrinados, apadrinadosApi } from '@repo/ui/cuentas-apadrinadas'
import { PerfilForm, perfilApi } from '@repo/ui/perfil-form'
import { ResumenCuenta } from '@repo/ui/resumen-cuenta'
import { accesoCompleto, perfilDe, visible, type Accion } from '@repo/ui/permisos'
import { SolicitudSoporte, type Catalogo, type Ticket } from '@repo/ui/soporte'
import { NumerosEmergencia, Pendiente } from '@repo/ui/wireframe'
import type { AuthenticatedUser } from '../auth/AuthForm'
import { apiFetch, internalFetch, useCupos, useRemote } from './session'

// Fuera de los componentes: GestionApadrinados recarga cuando cambia `api`.
const apadrinados = apadrinadosApi(apiFetch)

/** Home con sesión: accesos según perfil, cuentas vinculadas y números de emergencia. */
export function HomePage({ user }: { user: AuthenticatedUser }) {
  const perfil = perfilDe(user)
  const disponible = (accion: Accion) => visible(user, accion)

  return (
    <>
      <section className="wf-card">
        <h1>Hola, {user.nombre_usuario}</h1>
        <div className="wf-row">
          <Link className="wf-button wf-button--secondary" to="/perfil">Modificar usuario</Link>
          {disponible('cuentas.apadrinadas') && (
            <Link className="wf-button wf-button--secondary" to="/cuentas">Administrar cuentas</Link>
          )}
          {disponible('compras.comprar') && (
            <Link className="wf-button" to={user.plan_efectivo ? '/comprar' : '/premium'}>
              {user.plan_efectivo ? 'Comprar cupos de cuentas' : 'Comprar Premium'}
            </Link>
          )}
          {disponible('admin.cuentas.ver') && (
            <Link className="wf-button wf-button--secondary" to="/administracion/cuentas">Panel de administración</Link>
          )}
          <Link className="wf-button wf-button--secondary" to="/soporte">Solicitar soporte</Link>
        </div>
      </section>

      <ResumenCuenta user={user} />

      <NumerosEmergencia />

      {(perfil === 'USUARIO' || perfil === 'APADRINADO') && (
        <section className="wf-card">
          <h2>Cuentas vinculadas</h2>
          <CuentasVinculadas esPrincipal={perfil === 'USUARIO'} />
          {/* HU-19 / RF22: no hay endpoint de informe personal (jsReport solo se usa en la bitácora). */}
          <Pendiente>informe personal de actividad (HU-19)</Pendiente>
          <button type="button" className="wf-button wf-button--secondary" disabled>Descargar informe</button>
        </section>
      )}
    </>
  )
}

/** GET /usuarios/me/vinculadas: apadrinados del principal, o el principal y los demás apadrinados. */
function CuentasVinculadas({ esPrincipal }: { esPrincipal: boolean }) {
  const { data, cargando, error } = useRemote(apadrinados.listar, [])

  if (cargando) return <p className="wf-muted">Cargando cuentas vinculadas…</p>
  if (error) return <p className="wf-message wf-message--error">No se pudieron cargar: {error}</p>
  if (data.length === 0) {
    return (
      <p className="wf-muted">
        {esPrincipal
          ? 'Aún no tienes cuentas apadrinadas. Créalas desde "Administrar cuentas".'
          : 'No hay otras cuentas vinculadas.'}
      </p>
    )
  }
  return (
    <div className="wf-grid">
      {data.map((cuenta) => (
        <article className="wf-card" key={cuenta.usuario_ID}>
          <h3>{cuenta.nombre_usuario}</h3>
          <p className="wf-muted">
            {cuenta.tipo === 'PRINCIPAL'
              ? 'Cuenta principal'
              : cuenta.estado_ID === undefined
                ? 'Cuenta apadrinada'
                : `Cuenta apadrinada · acceso ${cuenta.estado_ID === 1 ? 'completo' : 'parcial'}`}
          </p>
        </article>
      ))}
    </div>
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
      body: JSON.stringify({ nombre_usuario, correo_usuario, PIN_principal }),
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
export function AccountsPage() {
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
