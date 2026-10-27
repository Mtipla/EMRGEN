import { useState, type FormEvent } from 'react'
import { adminApi } from './api'
import { ResultadoPeticion } from './ResultadoPeticion'
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
    <section className="wf-card" id="pruebas-soporte" aria-labelledby="pruebas-soporte-titulo">
      <h2 id="pruebas-soporte-titulo">Crear cuenta de SOPORTE</h2>
      <p className="wf-muted">Registra un trabajador con su nombre de usuario, correo y contraseña inicial.</p>
      {/* El rol SOPORTE lo asigna el backend: el formulario no envía rol ni estado. */}
      <form className="wf-form desktop-test-list" onSubmit={(event) => void crear(event)}>
        <div className="wf-grid">
          <label>
            Nombre de usuario
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              minLength={2}
              maxLength={50}
              required
            />
          </label>
          <label>
            Correo
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              maxLength={100}
              required
            />
          </label>
          <label>
            Contraseña inicial
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              maxLength={72}
              required
            />
          </label>
        </div>
        <div className="wf-actions">
          <button type="submit" className="wf-button">
            Crear cuenta SOPORTE
          </button>
        </div>
      </form>
      <ResultadoPeticion salida={salida} />
    </section>
  )
}
