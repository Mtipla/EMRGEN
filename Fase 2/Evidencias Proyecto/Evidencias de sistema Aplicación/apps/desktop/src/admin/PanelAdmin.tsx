import { useState, type FormEvent } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { perfilDe, puede, type Perfil } from '@repo/ui/permisos'
import { adminApi, API_URL, describirError, MODO_API, setToken, type Sesion } from './api'
import {
  VistaCompras,
  VistaCuentas,
  VistaPerfil,
  VistaPruebas,
  VistaTrabajadores,
} from './VistasWireframe'
import './panel-admin.css'
import { SelectorTema } from './SelectorTema'
import { VistaAlertas } from './VistaAlertas'

/** Panel de pruebas del administrador (y vistas del Trabajador/SOPORTE): cada sección consume sus endpoints con Axios. */
export function PanelAdmin() {
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
      // SOPORTE (= Trabajador) entra con su menú reducido; el resto se comprueba con una
      // ruta exclusiva del administrador, como antes.
      if (perfilDe(nueva.usuario) !== 'SOPORTE') await adminApi.listarUsuarios()
      setSesion(nueva)
      setPassword('')
    } catch (causa) {
      setToken('')
      setError(await describirError(causa))
    }
  }

  // Quien no es SOPORTE superó la comprobación de GET /admin/usuarios: es ADMINISTRADOR.
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
        <>
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
                Panel de pruebas
              </NavLink>
            )}
            <NavLink to="/perfil">Modificar usuario</NavLink>
            <NavLink to="/administracion/cuentas">Administrar cuentas</NavLink>
            <NavLink to="/administracion/compras">Administrar compras</NavLink>
            {!esSoporte && <NavLink to="/administracion/alertas">Alertas SOS</NavLink>}
            {puede(perfil, 'admin.trabajadores') && (
              <NavLink to="/administracion/trabajadores">Administrar trabajadores</NavLink>
            )}
          </nav>
          {/* Las rutas que el Trabajador no tiene ni se registran: la URL cae en el redirect. */}
          <Routes>
            {!esSoporte && <Route path="/" element={<VistaPruebas />} />}
            <Route
              path="/perfil"
              element={<VistaPerfil sesion={sesion} onActualizado={setSesion} />}
            />
            <Route path="/administracion/cuentas" element={<VistaCuentas perfil={perfil} />} />
            <Route path="/administracion/compras" element={<VistaCompras perfil={perfil} />} />
            {!esSoporte && <Route path="/administracion/alertas" element={<VistaAlertas />} />}
            {puede(perfil, 'admin.trabajadores') && (
              <Route path="/administracion/trabajadores" element={<VistaTrabajadores />} />
            )}
            <Route
              path="*"
              element={<Navigate to={esSoporte ? '/administracion/cuentas' : '/'} replace />}
            />
          </Routes>
        </>
      )}
    </div>
  )
}
