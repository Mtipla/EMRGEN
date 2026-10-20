import { useEffect, useState } from 'react'
import { AuthForm, type AuthenticatedUser } from './features/auth/AuthForm'
import { PinSetupForm } from './features/auth/PinSetupForm'
import { UsersAdmin } from './features/auth/UsersAdmin'
import { PremiumPurchase } from './features/compra/PremiumPurchase'
import { PublicSite, type PublicView } from './features/inicio/PublicSite'

const savedUser = localStorage.getItem('emergen.user')
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function App() {
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

  const [buying, setBuying] = useState(false)
  const [view, setView] = useState<PublicView | 'login' | 'cuenta'>(() => (user ? 'cuenta' : 'inicio'))

  function closeSession() {
    localStorage.removeItem('emergen.user')
    localStorage.removeItem('emergen.token')
    setBuying(false)
    setUser(null)
    setView('inicio')
  }

  if (checkingSession) {
    return <main>Verificando sesión…</main>
  }

  if (user?.requiere_pin) {
    return (
      <main className="auth-page">
        <PinSetupForm
          user={user}
          onLogout={closeSession}
          onPinCreated={() => {
            const updatedUser = { ...user, requiere_pin: false }
            localStorage.setItem('emergen.user', JSON.stringify(updatedUser))
            setUser(updatedUser)
          }}
        />
      </main>
    )
  }

  if (user && buying) {
    return (
      <main className="auth-page">
        <PremiumPurchase onClose={() => setBuying(false)} />
      </main>
    )
  }

  if (user && view === 'cuenta') {
    return (
      <main className="auth-page">
        <button type="button" className="secondary-button" onClick={() => setView('inicio')}>
          Ir al inicio
        </button>
        <button type="button" className="primary-button" onClick={() => setBuying(true)}>
          Comprar Cuenta Premium
        </button>
        <UsersAdmin
          user={user}
          onLogout={closeSession}
          onUserUpdated={setUser}
        />
      </main>
    )
  }

  if (!user && view === 'login') {
    return (
      <main className="auth-page">
        <button type="button" className="secondary-button" onClick={() => setView('inicio')}>
          Volver al inicio
        </button>
        <AuthForm
          onAuthenticated={(authenticated) => {
            setUser(authenticated)
            setView('cuenta')
          }}
        />
      </main>
    )
  }

  return (
    <PublicSite
      view={view === 'premium' ? 'premium' : 'inicio'}
      isAuthenticated={user !== null}
      onNavigate={setView}
      onAccount={() => setView(user ? 'cuenta' : 'login')}
      onBuy={() => setBuying(true)}
    />
  )
}

export default App
