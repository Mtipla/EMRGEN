import { useState } from 'react'
import { AuthForm, type AuthenticatedUser } from './features/auth/AuthForm'
import { UsersAdmin } from './features/auth/UsersAdmin'
import { PremiumPurchase } from './features/compra/PremiumPurchase'
import { PublicSite, type PublicView } from './features/inicio/PublicSite'

const savedUser = localStorage.getItem('emergen.user')

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

  const [buying, setBuying] = useState(false)
  const [view, setView] = useState<PublicView | 'login' | 'cuenta'>(() => (user ? 'cuenta' : 'inicio'))

  function closeSession() {
    localStorage.removeItem('emergen.user')
    localStorage.removeItem('emergen.token')
    setBuying(false)
    setUser(null)
    setView('inicio')
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
