import { useState } from 'react'
import { AuthForm, type AuthenticatedUser } from './features/auth/AuthForm'
import { UsersAdmin } from './features/auth/UsersAdmin'
import { PremiumPurchase } from './features/compra/PremiumPurchase'

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

  function closeSession() {
    localStorage.removeItem('emergen.user')
    localStorage.removeItem('emergen.token')
    setBuying(false)
    setUser(null)
  }

  if (user && buying) {
    return (
      <main className="auth-page">
        <PremiumPurchase onClose={() => setBuying(false)} />
      </main>
    )
  }

  return user ? (
    <main className="auth-page">
      <button type="button" className="primary-button" onClick={() => setBuying(true)}>
        Comprar Cuenta Premium
      </button>
      <UsersAdmin
        user={user}
        onLogout={closeSession}
        onUserUpdated={setUser}
      />
    </main>
  ) : (
    <main className="auth-page">
      <AuthForm onAuthenticated={setUser} />
    </main>
  )
}

export default App
