import { useState, type FormEvent } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { perfilDe, puede, type Perfil } from '@repo/ui/permisos'
import { adminApi, API_URL, describirError, MODO_API, setToken, type Sesion } from './api'
import { SeccionBitacora } from './SeccionBitacora'
import { SeccionSoporte } from './SeccionSoporte'
import { SeccionUsuarios } from './SeccionUsuarios'
import { VistaCompras, VistaCuentas, VistaPerfil, VistaTrabajadores } from './VistasWireframe'

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
  const perfil: Perfil = sesion && perfilDe(sesion.usuario) === 'SOPORTE' ? 'SOPORTE' : 'ADMINISTRADOR'
  const esSoporte = perfil === 'SOPORTE'

  function cerrarSesion() {
    setToken('')
    setSesion(null)
  }

  if (!API_URL) {
    return (
      <p role="alert" style={{ textAlign: 'left', padding: 16 }}>
        VITE_API_URL no está definida. Agrégala al .env de la raíz del monorepo (backend local,
        http://localhost:3000) o inicia el panel con el script dev:docker (backend de Docker,
        http://localhost:3001).
      </p>
    )
  }

  return (
    <div style={{ textAlign: 'left', padding: 16 }}>
      <h2>EMERGEN - Panel de administrador (pruebas)</h2>
      <p>
        API: {API_URL} ({MODO_API})
      </p>

      {!sesion ? (
        <form onSubmit={(event) => void iniciarSesion(event)}>
          <label>
            Correo{' '}
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </label>{' '}
          <label>
            Contraseña{' '}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>{' '}
          <button type="submit">Iniciar sesión</button>
          {error && <p role="alert">{error}</p>}
        </form>
      ) : (
        <>
          <p>
            Sesión: {sesion.usuario.nombre_usuario} ({sesion.usuario.correo_usuario}), ID{' '}
            {sesion.usuario.usuario_ID}{' '}
            <button type="button" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </p>
          {/* Las vistas de los wireframes viven dentro de la sesión: el token está solo en memoria. */}
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
            {!esSoporte && <Link to="/">Panel de pruebas</Link>}
            <Link to="/perfil">Modificar usuario</Link>
            <Link to="/administracion/cuentas">Administrar cuentas</Link>
            <Link to="/administracion/compras">Administrar compras</Link>
            {puede(perfil, 'admin.trabajadores') && (
              <Link to="/administracion/trabajadores">Administrar trabajadores</Link>
            )}
          </nav>
          {/* Las rutas que el Trabajador no tiene ni se registran: la URL cae en el redirect. */}
          <Routes>
            {!esSoporte && (
              <Route
                path="/"
                element={
                  <>
                    <SeccionUsuarios />
                    <SeccionSoporte />
                    <SeccionBitacora />
                  </>
                }
              />
            )}
            <Route path="/perfil" element={<VistaPerfil sesion={sesion} onActualizado={setSesion} />} />
            <Route path="/administracion/cuentas" element={<VistaCuentas perfil={perfil} />} />
            <Route path="/administracion/compras" element={<VistaCompras perfil={perfil} />} />
            {puede(perfil, 'admin.trabajadores') && (
              <Route path="/administracion/trabajadores" element={<VistaTrabajadores />} />
            )}
            <Route path="*" element={<Navigate to={esSoporte ? '/administracion/cuentas' : '/'} replace />} />
          </Routes>
        </>
      )}
    </div>
  )
}
