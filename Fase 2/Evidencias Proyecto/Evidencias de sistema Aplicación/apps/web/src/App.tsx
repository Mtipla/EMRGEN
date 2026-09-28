import { useState } from 'react'
import { AuthForm, type AuthenticatedUser } from './features/auth/AuthForm'
import { UsersAdmin } from './features/auth/UsersAdmin'

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

  function closeSession() {
    localStorage.removeItem('emergen.user')
    localStorage.removeItem('emergen.token')
    setUser(null)
  }

  return user ? (
    <main className="auth-page">
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
