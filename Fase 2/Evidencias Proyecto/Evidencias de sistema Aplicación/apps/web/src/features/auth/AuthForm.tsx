import './AuthForm.css'
import { Link } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { FirebaseAuthError } from '@repo/api-client'
import { avisar } from '@repo/ui/avisos'
import { firebaseAuth } from '../../lib/api'

type Mode = 'login' | 'registro' | 'verificacion'

type FirebaseSession = Awaited<ReturnType<typeof firebaseAuth.signUp>>

/** Cuenta de Firebase que espera la confirmación del correo antes de guardarse en la BD. */
type PendingAccount = {
  session: FirebaseSession
  /** true si la cuenta de Firebase se creó en este intento (se puede borrar al cancelar). */
  created: boolean
}

export type AuthenticatedUser = {
  usuario_ID: number
  nombre_usuario: string
  correo_usuario: string
  requiere_pin: boolean
  /** Opcionales: el backend los añadió el 2026-10-21; las sesiones guardadas antes no los traen. */
  rol_ID?: number
  estado_ID?: number
  usuario_principal_ID?: number | null
  /** Premium (plan propio o del principal); solo en login y GET /usuarios/me. */
  plan_efectivo?: boolean
}

type AuthFormProps = {
  onAuthenticated: (user: AuthenticatedUser) => void
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const FIREBASE_ERRORS: Record<string, string> = {
  EMAIL_EXISTS: 'Ya existe una cuenta con ese correo.',
  INVALID_LOGIN_CREDENTIALS:
    'Ya existe una cuenta con ese correo. Si no terminaste el registro, usa la misma contraseña.',
  INVALID_EMAIL: 'El correo electrónico no es válido.',
  WEAK_PASSWORD: 'La contraseña es demasiado débil.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Demasiados intentos. Espera unos minutos.',
}

const firebaseErrorMessage = (code: string) =>
  FIREBASE_ERRORS[code] ?? 'No se pudo crear la cuenta en Firebase. Inténtalo nuevamente.'

/** Lee el claim `email_verified` del ID token. Solo decide la UI: el backend lo verifica con la firma. */
function isEmailVerified(idToken: string) {
  try {
    const payload = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return (JSON.parse(atob(payload)) as { email_verified?: boolean }).email_verified === true
  } catch {
    return false
  }
}

export function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [mode, setMode] = useState<Mode>('login')
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [pending, setPending] = useState<PendingAccount | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function postUsuarios(path: 'registro' | 'login', body: object, idToken?: string) {
    const response = await fetch(`${API_URL}/usuarios/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    if (!response.ok) {
      throw Object.assign(new Error(data.message ?? 'No se pudo completar la solicitud'), {
        status: response.status,
      })
    }
    return data
  }

  function describeError(cause: unknown) {
    return cause instanceof FirebaseAuthError
      ? firebaseErrorMessage(cause.code)
      : cause instanceof TypeError
        ? 'No se pudo conectar con el backend. Comprueba que esté activo en el puerto 3000.'
        : cause instanceof Error
          ? cause.message
          : 'Ocurrió un error inesperado'
  }

  async function run(action: () => Promise<void>) {
    setMessage('')
    setError('')
    setLoading(true)
    try {
      await action()
    } catch (cause) {
      setError(describeError(cause))
      avisar('error', describeError(cause))
    } finally {
      setLoading(false)
    }
  }

  /** Mensaje de éxito en la tarjeta y como alerta flotante. */
  function informar(texto: string) {
    setMessage(texto)
    avisar('exito', texto)
  }

  /** Crea el usuario en la BD; el backend exige un ID token con el correo ya confirmado. */
  async function completeRegistration({ session, created }: PendingAccount) {
    try {
      await postUsuarios(
        'registro',
        { nombre_usuario: nombre, correo_usuario: correo, password },
        session.idToken,
      )
    } catch (cause) {
      // Si el backend rechazó el alta, se borra la cuenta de Firebase creada en este intento
      // para no dejarla huérfana. Una cuenta previa (p. ej. ya registrada) nunca se borra.
      if (created && !(cause instanceof TypeError)) {
        await firebaseAuth.deleteAccount(session.idToken).catch(() => undefined)
      }
      setPending(null)
      setMode('registro')
      throw cause
    }
    setPending(null)
    setMode('login')
    setPassword('')
    setConfirmacion('')
    informar('Correo confirmado y cuenta creada. Ahora inicia sesión con tu correo y contraseña.')
  }

  /** Crea (o retoma) la cuenta en Firebase y envía el correo de confirmación. */
  async function startRegistration() {
    const email = correo.trim()
    let account: PendingAccount
    try {
      account = { session: await firebaseAuth.signUp(email, password), created: true }
    } catch (cause) {
      // Un registro anterior sin terminar: se retoma iniciando sesión con la misma contraseña.
      if (!(cause instanceof FirebaseAuthError && cause.code === 'EMAIL_EXISTS')) throw cause
      account = { session: await firebaseAuth.signIn(email, password), created: false }
    }

    if (isEmailVerified(account.session.idToken)) {
      await completeRegistration(account)
      return
    }
    // CA-01.1: antes de enviar la confirmación se pregunta al backend. Con un correo ya
    // registrado responde 409 (se borra la cuenta de Firebase recién creada); un 403 solo
    // significa que falta confirmar el correo, y se sigue con la verificación.
    try {
      await postUsuarios(
        'registro',
        { nombre_usuario: nombre, correo_usuario: correo, password },
        account.session.idToken,
      )
    } catch (cause) {
      if ((cause as { status?: number }).status !== 403) {
        if (account.created && !(cause instanceof TypeError)) {
          await firebaseAuth.deleteAccount(account.session.idToken).catch(() => undefined)
        }
        throw cause
      }
    }
    await firebaseAuth.sendEmailVerification(account.session.idToken)
    setPending(account)
    setMode('verificacion')
  }

  /** Obtiene un ID token nuevo: el claim `email_verified` solo cambia al refrescarlo. */
  async function refreshPending(account: PendingAccount): Promise<PendingAccount> {
    const session = await firebaseAuth.refresh(account.session.refreshToken)
    const updated = { ...account, session: { ...session, email: account.session.email } }
    setPending(updated)
    return updated
  }

  const checkVerification = () =>
    run(async () => {
      if (!pending) return
      const account = await refreshPending(pending)
      if (!isEmailVerified(account.session.idToken)) {
        throw new Error('Aún no confirmas tu correo. Revisa tu bandeja de entrada o la carpeta de spam.')
      }
      await completeRegistration(account)
    })

  const resendVerification = () =>
    run(async () => {
      if (!pending) return
      const account = await refreshPending(pending)
      await firebaseAuth.sendEmailVerification(account.session.idToken)
      informar(`Te enviamos un nuevo correo de confirmación a ${account.session.email}.`)
    })

  const cancelVerification = () =>
    run(async () => {
      if (pending?.created) {
        const account = await refreshPending(pending).catch(() => pending)
        await firebaseAuth.deleteAccount(account.session.idToken).catch(() => undefined)
      }
      setPending(null)
      setMode('registro')
    })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void run(async () => {
      if (mode === 'registro') {
        if (password !== confirmacion) throw new Error('Las contraseñas no coinciden.')
        await startRegistration()
        return
      }
      const data = await postUsuarios('login', { correo_usuario: correo, password })
      localStorage.setItem('emergen.token', data.access_token)
      localStorage.setItem('emergen.user', JSON.stringify(data.usuario))
      onAuthenticated(data.usuario as AuthenticatedUser)
    })
  }

  if (mode === 'verificacion' && pending) {
    // Mismo marco que login y registro (auth-layout, barra FIND ME), con clases de AuthForm.css.
    return (
      <div className="auth-layout">
        <header className="auth-navbar">
          <Link to="/" className="find-me">
            <span>📍</span>
            FIND ME
          </Link>
        </header>

        <main className="auth-main">
          <section className="auth-card">
            <h1>Confirma tu correo</h1>
            <p>
              Enviamos un enlace de confirmación a <strong>{pending.session.email}</strong>. Ábrelo
              y luego vuelve aquí para terminar de crear tu cuenta.
            </p>

            {message && <p className="form-message success">{message}</p>}
            {error && <p className="form-message failure">{error}</p>}

            <div className="auth-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={cancelVerification}
                disabled={loading}
              >
                Cancelar registro
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={checkVerification}
                disabled={loading}
              >
                {loading ? 'Procesando…' : 'Ya confirmé mi correo'}
              </button>
            </div>

            <a
              href="#reenviar"
              className="forgot-password"
              onClick={(event) => {
                event.preventDefault()
                if (!loading) void resendVerification()
              }}
            >
              ¿No te llegó? Reenviar correo
            </a>
          </section>
        </main>
      </div>
    )
  }

  const isRegister = mode === 'registro'
  const passwordOk = password.length >= 8
  const confirmacionOk = confirmacion === password


  return (
    <div className="auth-layout">
      <header className="auth-navbar">
        <Link to="/" className="find-me">
          <span>📍</span>
          FIND ME
        </Link>
      </header>

      <main className="auth-main">
        <section className="auth-card">
          <h1>{isRegister ? 'Crear cuenta' : 'Inicio de sesión'}</h1>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <label className="auth-field">
                <span>Nombre de usuario</span>
                <input
                  autoComplete="username"
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  minLength={2}
                  maxLength={50}
                  required
                />
              </label>
            )}

            <label className="auth-field">
              <span>Correo Electrónico</span>
              <input
                type="email"
                autoComplete="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                required
              />
            </label>

            <label className="auth-field">
              <span>Contraseña</span>
              <input
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                className={isRegister && password ? (passwordOk ? 'wf-valido' : 'wf-invalido') : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={isRegister ? 8 : undefined}
                required
              />
            </label>

            {isRegister && (
              <p className={`password-hint wf-ayuda ${password ? (passwordOk ? 'wf-ayuda--ok' : 'wf-ayuda--error') : ''}`}>
                {!password
                  ? 'Usa al menos 8 caracteres.'
                  : passwordOk
                    ? '✓ Largo suficiente.'
                    : `✕ Faltan ${8 - password.length} caracteres (mínimo 8).`}
              </p>
            )}

            {isRegister && (
              <label className="auth-field">
                <span>Confirmar</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  aria-label="Confirmar contraseña"
                  className={confirmacion ? (confirmacionOk ? 'wf-valido' : 'wf-invalido') : undefined}
                  value={confirmacion}
                  onChange={(event) => setConfirmacion(event.target.value)}
                  required
                />
              </label>
            )}

            {isRegister && confirmacion && (
              <p className={`password-hint wf-ayuda ${confirmacionOk ? 'wf-ayuda--ok' : 'wf-ayuda--error'}`}>
                {confirmacionOk ? '✓ Las contraseñas coinciden.' : '✕ Las contraseñas no coinciden.'}
              </p>
            )}

            {message && (
              <p className="form-message success">{message}</p>
            )}

            {error && (
              <p className="form-message failure">{error}</p>
            )}

            <div className="auth-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setMode(isRegister ? 'login' : 'registro')
                  setMessage('')
                  setError('')
                }}
              >
                {isRegister ? 'Ya tengo cuenta' : 'No tengo cuenta'}
              </button>

              <button
                className="primary-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Procesando…'
                  : isRegister
                    ? 'Registrarme'
                    : 'Siguiente'}
              </button>
            </div>
          </form>

          {!isRegister && (
            <a
              href="#recuperar"
              className="forgot-password"
              onClick={(event) => {
                event.preventDefault()
                // Pendiente de decisión: el login valida contra la BD, no contra Firebase.
                avisar('info', 'La recuperación de contraseña aún no está disponible. Si no recuerdas tu contraseña, escríbele al equipo de soporte.')
              }}
            >
              ¿Has olvidado tu correo electrónico o contraseña?
            </a>
          )}
        </section>
      </main>
    </div>
  )

}
