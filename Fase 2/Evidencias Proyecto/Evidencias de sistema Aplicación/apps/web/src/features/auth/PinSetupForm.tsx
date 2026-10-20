import { useState, type FormEvent } from 'react'
import type { AuthenticatedUser } from './AuthForm'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type PinSetupFormProps = {
  user: AuthenticatedUser
  onPinCreated: () => void
  onLogout: () => void
}

export function PinSetupForm({ user, onPinCreated, onLogout }: PinSetupFormProps) {
  const [pin, setPin] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!/^\d{4}$/.test(pin)) {
      setError('El PIN debe tener exactamente 4 dígitos.')
      return
    }
    if (pin !== confirmation) {
      setError('Los PIN no coinciden.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/usuarios/me/pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('emergen.token') ?? ''}`,
        },
        body: JSON.stringify({ PIN: pin }),
      })
      const data = await response.json()
      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message
        throw new Error(message ?? 'No se pudo guardar el PIN')
      }
      onPinCreated()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el PIN')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h1>Configura tu PIN</h1>
      <p>
        Hola, {user.nombre_usuario}. Para continuar, crea un PIN de 4 dígitos.
        Lo usarás para vincular cuentas.
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          PIN de 4 dígitos
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            pattern="[0-9]{4}"
            minLength={4}
            maxLength={4}
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            required
          />
        </label>
        <label>
          Repite tu PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            pattern="[0-9]{4}"
            minLength={4}
            maxLength={4}
            value={confirmation}
            onChange={(event) =>
              setConfirmation(event.target.value.replace(/\D/g, '').slice(0, 4))
            }
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando…' : 'Crear PIN'}
        </button>
      </form>
      <button type="button" onClick={onLogout}>Cerrar sesión</button>
    </section>
  )
}
