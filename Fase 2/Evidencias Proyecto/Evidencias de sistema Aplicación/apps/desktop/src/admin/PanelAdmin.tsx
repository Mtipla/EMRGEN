import { useState, type FormEvent } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { adminApi, API_URL, describirError, MODO_API, setToken, type Sesion } from './api'
import { SeccionBitacora } from './SeccionBitacora'
import { SeccionSoporte } from './SeccionSoporte'
import { SeccionUsuarios } from './SeccionUsuarios'
import { VistaCompras, VistaCuentas, VistaTrabajadores } from './VistasWireframe'

/** Panel de pruebas del administrador: cada sección consume sus endpoints con Axios. */
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
      // El login no informa el rol: se comprueba con una ruta exclusiva del administrador.
      await adminApi.listarUsuarios()
      setSesion(nueva)
      setPassword('')
    } catch (causa) {
      setToken('')
      setError(await describirError(causa))
    }
  }

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
            <Link to="/">Panel de pruebas</Link>
            <Link to="/administracion/cuentas">Administrar cuentas</Link>
            <Link to="/administracion/compras">Administrar compras</Link>
            <Link to="/administracion/trabajadores">Administrar trabajadores</Link>
          </nav>
          <Routes>
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
            <Route path="/administracion/cuentas" element={<VistaCuentas />} />
            <Route path="/administracion/compras" element={<VistaCompras />} />
            <Route path="/administracion/trabajadores" element={<VistaTrabajadores />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      )}
    </div>
  )
}
