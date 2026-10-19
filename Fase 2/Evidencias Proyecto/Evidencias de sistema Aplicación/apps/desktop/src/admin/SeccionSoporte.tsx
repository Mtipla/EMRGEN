import { useState, type FormEvent } from 'react'
import { adminApi } from './api'
import { usePeticion } from './usePeticion'

export function SeccionSoporte() {
  const { salida, ejecutar } = usePeticion()
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')

  async function crear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cuenta = await ejecutar('Crear cuenta SOPORTE', () =>
      adminApi.crearSoporte({ nombre_usuario: nombre, correo_usuario: correo, password }),
    )
    if (cuenta) setPassword('')
  }

  return (
    <fieldset>
      <legend>Crear cuenta de SOPORTE</legend>
      {/* El rol SOPORTE lo asigna el backend: el formulario no envía rol ni estado. */}
      <form onSubmit={(event) => void crear(event)}>
        <label>
          Nombre{' '}
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            minLength={2}
            maxLength={50}
            required
          />
        </label>{' '}
        <label>
          Correo{' '}
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            maxLength={100}
            required
          />
        </label>{' '}
        <label>
          Contraseña{' '}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={72}
            required
          />
        </label>{' '}
        <button type="submit">Crear cuenta SOPORTE</button>
      </form>
      <pre>{salida}</pre>
    </fieldset>
  )
}
