import { useEffect, useState, type FormEvent } from 'react'
import type { AuthenticatedUser } from './AuthForm'

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ nombre_usuario: nombre, correo_usuario: correo }),
      })
      const data = await response.json()
      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message
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
        if (!response.ok) {
          throw new Error(data.message ?? 'No se pudo cargar la lista')
        }
        setUsers(data as AuthenticatedUser[])
        console.log('Usuarios actualmente en memoria:', data)
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
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token ?? ''}` },
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message ?? 'No se pudo eliminar el usuario')
      }
      setUsers((current) => current.filter((item) => item.usuario_ID !== id))
      console.log('Usuario eliminado:', data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al eliminar usuario')
    }
  }

  return (
    <section>
      <h1>Administración de usuarios</h1>
      <p>Sesión iniciada como {user.nombre_usuario} ({user.correo_usuario})</p>
      <button type="button" onClick={onLogout}>Cerrar sesión</button>

      <h2>Modificar mi usuario</h2>
      <form onSubmit={updateProfile}>
        <label>
          Nombre
          <input
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            minLength={2}
            maxLength={50}
            required
          />
        </label>
        <label>
          Correo electrónico
          <input
            type="email"
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            maxLength={100}
            required
          />
        </label>
        <button type="submit">Guardar cambios</button>
        {profileMessage && <p>{profileMessage}</p>}
      </form>

      <h2>Usuarios creados en memoria</h2>
      {loading && <p>Cargando usuarios…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && users.length === 0 && <p>No hay usuarios registrados.</p>}

      {users.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.usuario_ID}>
                <td>{item.usuario_ID}</td>
                <td>{item.nombre_usuario}</td>
                <td>{item.correo_usuario}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => void deleteUser(item.usuario_ID)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
