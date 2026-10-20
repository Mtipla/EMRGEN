
import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'

import { AuthForm, type AuthenticatedUser } from './features/auth/AuthForm'
import { PinSetupForm } from './features/auth/PinSetupForm'
import { UsersAdmin } from './features/auth/UsersAdmin'
import { PremiumPurchase } from './features/compra/PremiumPurchase'
import { PublicSite, type PublicView } from './features/inicio/PublicSite'

const savedUser = localStorage.getItem('emergen.user')
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function App() {
  const navigate = useNavigate()

  const [user, setUser] = useState<AuthenticatedUser | null>(() => {
    if (!savedUser) return null

    try {
      return JSON.parse(savedUser) as AuthenticatedUser
    } catch {
      localStorage.removeItem('emergen.user')
      localStorage.removeItem('emergen.token')
      return null
    }
  })

  const [checkingSession, setCheckingSession] = useState(Boolean(savedUser))

  useEffect(() => {
    const token = localStorage.getItem('emergen.token')

    if (!token) {
      setUser(null)
      setCheckingSession(false)
      return
    }

    async function refreshSession() {
      try {
        const response = await fetch(`${API_URL}/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error('La sesión expiró')

        const currentUser = (await response.json()) as AuthenticatedUser

        localStorage.setItem('emergen.user', JSON.stringify(currentUser))
        setUser(currentUser)
      } catch {
        localStorage.removeItem('emergen.user')
        localStorage.removeItem('emergen.token')
        setUser(null)
      } finally {
        setCheckingSession(false)
      }
    }

    void refreshSession()
  }, [])

  const hasSession = user !== null && !user.requiere_pin

  function closeSession() {
    localStorage.removeItem('emergen.user')
    localStorage.removeItem('emergen.token')
    setUser(null)
    navigate('/login')
  }

  function handleAuthenticated(authenticatedUser: AuthenticatedUser) {
    setUser(authenticatedUser)

    navigate(
      authenticatedUser.requiere_pin ? '/login' : '/usuarios',
      { replace: true },
    )
  }

  function handlePinCreated() {
    if (!user) return

    const updatedUser = { ...user, requiere_pin: false }

    localStorage.setItem('emergen.user', JSON.stringify(updatedUser))
    setUser(updatedUser)
    navigate('/usuarios', { replace: true })
  }

  function renderPublicSite(view: PublicView) {
    return (
      <PublicSite
        view={view}
        isAuthenticated={user !== null}
        onNavigate={(next) => navigate(next === 'premium' ? '/premium' : '/')}
        onAccount={() => navigate(user ? '/usuarios' : '/login')}
        onBuy={() => navigate(hasSession ? '/comprar' : '/login')}
      />
    )
  }

  if (checkingSession) {
    return <main>Verificando sesión…</main>
  }

  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/" element={renderPublicSite('inicio')} />
      <Route path="/premium" element={renderPublicSite('premium')} />

      {/* Inicio de sesión o configuración del PIN */}
      <Route
        path="/login"
        element={
          user ? (
            user.requiere_pin ? (
              <main className="auth-page">
                <PinSetupForm
                  user={user}
                  onLogout={closeSession}
                  onPinCreated={handlePinCreated}
                />
              </main>
            ) : (
              <Navigate to="/usuarios" replace />
            )
          ) : (
            <main className="auth-page">
              <button type="button" className="secondary-button" onClick={() => navigate('/')}>
                Volver al inicio
              </button>
              <AuthForm onAuthenticated={handleAuthenticated} />
            </main>
          )
        }
      />

      {/* Panel de administración protegido por sesión */}
      <Route
        path="/usuarios"
        element={
          user && hasSession ? (
            <main className="auth-page">
              <button type="button" className="secondary-button" onClick={() => navigate('/')}>
                Ir al inicio
              </button>
              <button type="button" className="primary-button" onClick={() => navigate('/comprar')}>
                Comprar Cuenta Premium
              </button>
              <UsersAdmin
                user={user}
                onLogout={closeSession}
                onUserUpdated={setUser}
              />
            </main>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Compra de Cuenta Premium con PayPal (requiere sesión) */}
      <Route
        path="/comprar"
        element={
          hasSession ? (
            <main className="auth-page">
              <PremiumPurchase onClose={() => navigate('/usuarios')} />
            </main>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Redirigir rutas inexistentes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
