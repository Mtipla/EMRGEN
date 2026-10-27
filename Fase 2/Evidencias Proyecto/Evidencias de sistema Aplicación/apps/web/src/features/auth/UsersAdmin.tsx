import { useEffect, useState, type FormEvent } from 'react'
import type { AuthenticatedUser } from './AuthForm'
import { AppShell } from '../cuenta/AppShell'

type UsersAdminProps = {
  user: AuthenticatedUser
  onLogout: () => void
  onUserUpdated: (user: AuthenticatedUser) => void
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function UsersAdmin({ user, onLogout, onUserUpdated }: UsersAdminProps) {
  const [users, setUsers] = useState<AuthenticatedUser[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [nombre, setNombre] = useState(user.nombre_usuario)
  const [correo, setCorreo] = useState(user.correo_usuario)
  const [profileMessage, setProfileMessage] = useState('')
  const token = localStorage.getItem('emergen.token')

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setProfileMessage('')
    try {
      const response = await fetch(`${API_URL}/usuarios/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
        body: JSON.stringify({ nombre_usuario: nombre, correo_usuario: correo }),
      })
      const data = await response.json()
      if (!response.ok) {
        const message = Array.isArray(data.message) ? data.message.join(', ') : data.message
        throw new Error(message ?? 'No se pudo actualizar el perfil')
      }
      setNombre(data.nombre_usuario)
      setCorreo(data.correo_usuario)
      localStorage.setItem('emergen.user', JSON.stringify(data))
      onUserUpdated(data as AuthenticatedUser)
      setProfileMessage('Tus datos se actualizaron.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo actualizar el perfil')
    }
  }

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch(`${API_URL}/usuarios`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message ?? 'No se pudo cargar la lista')
        setUsers(data as AuthenticatedUser[])
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Error al cargar usuarios')
      } finally {
        setLoading(false)
      }
    }
    void loadUsers()
  }, [token])

  async function deleteUser(id: number) {
    setError('')
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token ?? ''}` },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? 'No se pudo eliminar el usuario')
      setUsers((current) => current.filter((item) => item.usuario_ID !== id))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al eliminar usuario')
    }
  }

  return (
    <div className="users-admin">
      <AppShell user={user} onLogout={onLogout}>
      <main className="ua-main" id="usuarios">
        <section className="ua-users-panel" aria-labelledby="ua-title">
          <div className="ua-panel-heading">
            <div>
              <p className="ua-eyebrow">PANEL DE ADMINISTRACIÓN</p>
              <h1 id="ua-title">Usuarios registrados</h1>
            </div>
            <span className="ua-count">{users.length} usuarios</span>
          </div>
          {loading && <p className="ua-state">Cargando usuarios…</p>}
          {error && <p className="ua-alert" role="alert">{error}</p>}
          {!loading && users.length === 0 && <p className="ua-state">No hay usuarios registrados.</p>}
          {users.length > 0 && (
            <div className="ua-user-list">
              {users.map((item) => (
                <article className="ua-user-row" key={item.usuario_ID}>
                  <div className="ua-avatar" aria-hidden="true"><span /></div>
                  <div className="ua-user-name">{item.nombre_usuario}</div>
                  <div className="ua-user-info">
                    <span>{item.correo_usuario}</span>
                    <small>ID de usuario: {item.usuario_ID}</small>
                  </div>
                  <button className="ua-delete" type="button" onClick={() => void deleteUser(item.usuario_ID)} aria-label={`Eliminar a ${item.nombre_usuario}`} title="Eliminar usuario">⌫</button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="ua-profile-panel" aria-labelledby="ua-profile-title">
          <div className="ua-panel-heading">
            <div><p className="ua-eyebrow">TU CUENTA</p><h2 id="ua-profile-title">Modificar mi usuario</h2></div>
          </div>
          <form className="ua-profile-form" onSubmit={updateProfile}>
            <label>Nombre<input value={nombre} onChange={(event) => setNombre(event.target.value)} minLength={2} maxLength={50} required /></label>
            <label>Correo electrónico<input type="email" value={correo} onChange={(event) => setCorreo(event.target.value)} maxLength={100} required /></label>
            <button className="ua-save" type="submit">Guardar cambios</button>
            {profileMessage && <p className="ua-success">{profileMessage}</p>}
          </form>
        </section>
      </main>
      </AppShell>
    </div>
  )
}
