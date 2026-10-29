import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { DerivacionTicketsProvider, ResumenTicketDerivado } from '@repo/ui/derivacion-tickets'
import { perfilDe, puede, type Perfil } from '@repo/ui/permisos'
import { adminApi, API_URL, MODO_API, setToken, type Sesion } from './api'
import {
  VistaCompras,
  VistaCuentas,
  VistaPerfil,
  VistaTrabajadores,
} from './VistasWireframe'
import './panel-admin.css'
import { SelectorTema } from './SelectorTema'
import { VistaAlertas } from './VistaAlertas'
import { VistaTickets } from './VistaTickets'
import { VistaContacto } from './VistaContacto'
import { SeccionUsuarios } from './SeccionUsuarios'
import { SeccionBitacora } from './SeccionBitacora'

function mensajeErrorInicioSesion(error: unknown): string {
  if (isAxiosError(error)) {
    const estado = error.response?.status
    if (!error.response) return 'No se pudo conectar con el servicio. Inténtalo nuevamente más tarde.'
    if (estado === 401) return 'Correo o contraseña incorrectos.'
    if (estado === 403) return 'Tu cuenta no tiene permisos para acceder al panel administrativo.'
    if (estado !== undefined && estado >= 500) {
      return 'El servicio no está disponible en este momento. Inténtalo más tarde.'
    }
  }
  return 'No se pudo iniciar sesión. Verifica tus datos e inténtalo nuevamente.'
}

/** Panel administrativo y vistas de SOPORTE: cada sección consume sus endpoints con Axios. */
export function PanelAdmin() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [sesion, setSesion] = useState<Sesion | null>(null)
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function iniciarSesion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    try {
      const nueva = await adminApi.login(correo, password)
      setToken(nueva.access_token)
      const perfil = perfilDe(nueva.usuario)
      if (perfil !== 'ADMINISTRADOR' && perfil !== 'SOPORTE') {
        throw new Error('El panel requiere una cuenta de administrador o soporte.')
      }
      // Confirma también el acceso completo mediante una consulta autorizada por el servidor.
      await adminApi.listarUsuarios()
      setSesion(nueva)
      setPassword('')
    } catch (causa) {
      setToken('')
      setError(mensajeErrorInicioSesion(causa))
    }
  }

  const perfil: Perfil =
    sesion && perfilDe(sesion.usuario) === 'SOPORTE' ? 'SOPORTE' : 'ADMINISTRADOR'
  const esSoporte = perfil === 'SOPORTE'

  function cerrarSesion() {
    setToken('')
    setSesion(null)
  }

  if (!API_URL) {
    return (
      <div className="wf-shell desktop-admin">
        <SelectorTema />
        <p role="alert" className="wf-message wf-message--error">
          VITE_API_URL no está definida. Agrégala al .env de la raíz del monorepo (backend local,
          http://localhost:3000) o inicia el panel con el script dev:docker (backend de Docker,
          http://localhost:3001).
        </p>
      </div>
    )
  }

  return (
    <div className="wf-shell desktop-admin">
      <header className="wf-header">
        <strong className="wf-brand">EMERGEN</strong>
        <span className="desktop-admin-title">Panel administrativo</span>
        <SelectorTema />
      </header>
      <p className="wf-muted desktop-admin-connection">
        API: {API_URL} ({MODO_API})
      </p>

      {!sesion ? (
        <form
          className="wf-card wf-form desktop-admin-login"
          onSubmit={(event) => void iniciarSesion(event)}
        >
          <h1>Iniciar sesión</h1>
          <label>
            Correo
            <input
              type="email"
              autoComplete="username"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <div className="wf-actions">
            <button type="submit" className="wf-button">
              Iniciar sesión
            </button>
          </div>
          {error && (
            <p role="alert" className="wf-message wf-message--error">
              {error}
            </p>
          )}
        </form>
      ) : (
        <DerivacionTicketsProvider key={sesion.usuario.usuario_ID} rutaActual={pathname}
          esAdministrador={!esSoporte} onNavegar={navigate}>
          <div className="desktop-admin-session">
            <p>
              Sesión: <strong>{sesion.usuario.nombre_usuario}</strong>
              <span className="wf-muted">
                {sesion.usuario.correo_usuario} · ID {sesion.usuario.usuario_ID}
              </span>
            </p>
            <button type="button" className="wf-button wf-button--secondary" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
          {/* Las vistas de los wireframes viven dentro de la sesión: el token está solo en memoria. */}
          <nav className="desktop-admin-nav" aria-label="Secciones del panel administrativo">
            {!esSoporte && (
              <NavLink to="/" end>
                Bitácora / Auditoría
              </NavLink>
            )}
            <NavLink to="/perfil">Modificar usuario</NavLink>
            <NavLink to="/administracion/cuentas">Administrar cuentas</NavLink>
            <NavLink to="/administracion/compras">Administrar compras</NavLink>
            <NavLink to="/administracion/tickets">Administrar Tickets de soporte</NavLink>
            <NavLink to="/administracion/contacto">Mensajes de contacto</NavLink>
            {!esSoporte && <NavLink to="/administracion/planes">Gestión de planes y cupos de usuario</NavLink>}
            {!esSoporte && <NavLink to="/administracion/alertas">Alertas SOS</NavLink>}
            {puede(perfil, 'admin.trabajadores') && (
              <NavLink to="/administracion/trabajadores">Administrar trabajadores</NavLink>
            )}
          </nav>
          <ResumenTicketDerivado />
          {/* Las rutas que el Trabajador no tiene ni se registran: la URL cae en el redirect. */}
          <Routes>
            {!esSoporte && <Route path="/" element={<SeccionBitacora />} />}
            <Route
              path="/perfil"
              element={<VistaPerfil sesion={sesion} onActualizado={setSesion} />}
            />
            <Route path="/administracion/cuentas" element={<VistaCuentas perfil={perfil} />} />
            <Route path="/administracion/compras" element={<VistaCompras perfil={perfil} />} />
            <Route path="/administracion/tickets" element={<VistaTickets esAdministrador={!esSoporte} />} />
            <Route path="/administracion/contacto" element={<VistaContacto />} />
            {!esSoporte && <Route path="/administracion/planes" element={<SeccionUsuarios />} />}
            {!esSoporte && <Route path="/administracion/alertas" element={<VistaAlertas />} />}
            {puede(perfil, 'admin.trabajadores') && (
              <Route path="/administracion/trabajadores" element={<VistaTrabajadores />} />
            )}
            <Route
              path="*"
              element={<Navigate to={esSoporte ? '/administracion/cuentas' : '/'} replace />}
            />
          </Routes>
        </DerivacionTicketsProvider>
      )}
    </div>
  )
}
