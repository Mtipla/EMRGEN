import { useState, type FormEvent } from 'react'

type Mode = 'login' | 'registro'

export type AuthenticatedUser = {
  usuario_ID: number
  nombre_usuario: string
  correo_usuario: string
  requiere_pin: boolean
}

type AuthFormProps = {
  onAuthenticated: (user: AuthenticatedUser) => void
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [mode, setMode] = useState<Mode>('login')
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    const isRegister = mode === 'registro'
    try {
      const response = await fetch(
        `${API_URL}/usuarios/${isRegister ? 'registro' : 'login'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            isRegister
              ? { nombre_usuario: nombre, correo_usuario: correo, password }
              : { correo_usuario: correo, password },
          ),
        },
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? 'No se pudo completar la solicitud')
      }

      if (isRegister) {
        setMessage('Cuenta creada. Ahora inicia sesión con tu correo y contraseña.')
        setMode('login')
        setPassword('')
      } else {
        localStorage.setItem('emergen.token', data.access_token)
        localStorage.setItem('emergen.user', JSON.stringify(data.usuario))
        onAuthenticated(data.usuario as AuthenticatedUser)
      }
    } catch (cause) {
      setError(
        cause instanceof TypeError
          ? 'No se pudo conectar con el backend. Comprueba que esté activo en el puerto 3000.'
          : cause instanceof Error
            ? cause.message
            : 'Ocurrió un error inesperado',
      )
    } finally {
      setLoading(false)
    }
  }

  const isRegister = mode === 'registro'

  return (
    <section className="auth-card">
      <p className="eyebrow">EMERGEN</p>
      <h1>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
      <p className="auth-intro">
        {isRegister
          ? 'Regístrate para comenzar.'
          : 'Ingresa con tu correo y contraseña.'}
      </p>

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <label>
            Nombre
            <input
              autoComplete="name"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              minLength={2}
              required
            />
          </label>
        )}
        <label>
          Correo electrónico
          <input
            type="email"
            autoComplete="email"
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          {isRegister && <small>Usa al menos 8 caracteres.</small>}
        </label>

        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message failure">{error}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading
            ? 'Procesando…'
            : isRegister
              ? 'Crear cuenta'
              : 'Iniciar sesión'}
        </button>
      </form>

      <p className="auth-switch">
        {isRegister ? '¿Ya tienes cuenta?' : '¿Todavía no tienes cuenta?'}{' '}
        <button
          type="button"
          onClick={() => {
            setMode(isRegister ? 'login' : 'registro')
            setMessage('')
            setError('')
          }}
        >
          {isRegister ? 'Inicia sesión' : 'Regístrate'}
        </button>
      </p>
    </section>
  )
}
