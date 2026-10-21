import { Link, useNavigate } from 'react-router-dom'
import { CuentasApadrinadas } from '@repo/ui/cuentas-apadrinadas'
import { MOCK_CUENTAS_VINCULADAS } from '@repo/ui/mocks'
import { PerfilForm } from '@repo/ui/perfil-form'
import { accesoCompleto, perfilDe, puede } from '@repo/ui/permisos'
import { SolicitudSoporte, type Catalogo, type Ticket } from '@repo/ui/soporte'
import { NumerosEmergencia, Pendiente } from '@repo/ui/wireframe'
import type { AuthenticatedUser } from '../auth/AuthForm'
import { apiFetch, internalFetch, useCupos, useRemote } from './session'

/** Home con sesión: accesos según perfil, cuentas vinculadas y números de emergencia. */
export function HomePage({ user }: { user: AuthenticatedUser }) {
  const perfil = perfilDe(user)

  return (
    <>
      <section className="wf-card">
        <h1>Hola, {user.nombre_usuario}</h1>
        <div className="wf-row">
          <Link className="wf-button wf-button--secondary" to="/perfil">Modificar usuario</Link>
          {puede(perfil, 'cuentas.apadrinadas') && (
            <Link className="wf-button wf-button--secondary" to="/cuentas">Administrar cuentas</Link>
          )}
          {puede(perfil, 'compras.comprar') && <Link className="wf-button" to="/premium">Comprar Premium</Link>}
          {puede(perfil, 'admin.cuentas.ver') && (
            <Link className="wf-button wf-button--secondary" to="/administracion/cuentas">Panel de administración</Link>
          )}
          <Link className="wf-button wf-button--secondary" to="/soporte">Solicitar soporte</Link>
        </div>
      </section>

      <NumerosEmergencia />

      {(perfil === 'USUARIO' || perfil === 'APADRINADO') && (
        <section className="wf-card">
          <h2>Cuentas vinculadas</h2>
          <Pendiente>el backend aún no lista las cuentas vinculadas; datos de ejemplo</Pendiente>
          <div className="wf-grid">
            {MOCK_CUENTAS_VINCULADAS.map((cuenta) => (
              <article className="wf-card" key={cuenta.nombre}>
                <h3>{cuenta.nombre}</h3>
                <p className="wf-muted">{cuenta.informacion}</p>
              </article>
            ))}
          </div>
          {/* HU-19 / RF22: no hay endpoint de informe personal (jsReport solo se usa en la bitácora). */}
          <Pendiente>informe personal de actividad (HU-19)</Pendiente>
          <button type="button" className="wf-button wf-button--secondary" disabled>Descargar informe</button>
        </section>
      )}
    </>
  )
}

type ProfilePageProps = {
  user: AuthenticatedUser
  onUserUpdated: (user: AuthenticatedUser) => void
}

/** "Modificar Usuario": guarda nombre de usuario y correo con PATCH /usuarios/me (igual que UsersAdmin). */
export function ProfilePage({ user, onUserUpdated }: ProfilePageProps) {
  const perfil = perfilDe(user)

  async function guardar(nombre_usuario: string, correo_usuario: string) {
    const updated = await apiFetch<AuthenticatedUser>('/usuarios/me', {
      method: 'PATCH',
      body: JSON.stringify({ nombre_usuario, correo_usuario }),
    })
    localStorage.setItem('emergen.user', JSON.stringify(updated))
    onUserUpdated(updated)
  }

  return (
    <PerfilForm
      nombreUsuario={user.nombre_usuario}
      correo={user.correo_usuario}
      variante={perfil === 'ADMINISTRADOR' ? 'administrador' : perfil === 'SOPORTE' ? 'soporte' : 'usuario'}
      // Sesiones antiguas sin estado_ID no se tratan como parciales; el backend decide igual.
      accesoParcial={user.estado_ID !== undefined && !accesoCompleto(user)}
      onGuardar={guardar}
    />
  )
}

/** "Administrar Cuentas" del usuario principal: cupos reales, contenido de cada cupo pendiente. */
export function AccountsPage() {
  const navigate = useNavigate()
  const { cupos, cargando, error } = useCupos()

  if (cargando) return <p className="wf-muted">Cargando cuentas…</p>

  return <CuentasApadrinadas cupos={cupos} aviso={error} onAnadir={() => navigate('/comprar')} />
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
