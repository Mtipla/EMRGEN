import { useState } from 'react'
import { adminApi, ESTADOS, ROLES, type UsuarioAdmin } from './api'
import { usePeticion } from './usePeticion'

/** Gestión completa de un usuario: expediente, datos, plan y cupos, estado y apadrinados. */
export function SeccionUsuarios() {
  const { salida, ejecutar } = usePeticion()
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [id, setId] = useState('')
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [planId, setPlanId] = useState('')
  const [ocupacion, setOcupacion] = useState<{ usados: number; disponibles: number }>()
  const [cupos, setCupos] = useState('0')
  const [estado, setEstado] = useState('1')

  async function listar() {
    const lista = await ejecutar('Listar usuarios', adminApi.listarUsuarios)
    if (lista) setUsuarios(lista)
  }

  /** Carga el expediente y deja sus valores en los formularios para editarlos. */
  async function verExpediente() {
    const expediente = await ejecutar('Ver expediente', () => adminApi.verExpediente(Number(id)))
    if (!expediente) return
    setNombre(expediente.usuario.nombre_usuario)
    setCorreo(expediente.usuario.correo_usuario)
    setEstado(String(expediente.usuario.estado_ID))
    setPlanId(String(expediente.plan?.plan_ID ?? ''))
    setCupos(String(expediente.plan?.cupos_apadrinados_adq ?? 0))
    setOcupacion({ usados: expediente.plan?.cupos_ocupados ?? 0, disponibles: expediente.plan?.cupos_disponibles ?? 0 })
  }

  /** Ejecuta una acción sobre el usuario indicado y, si resulta, refresca la tabla. */
  async function accion(titulo: string, peticion: () => Promise<unknown>) {
    if ((await ejecutar(titulo, peticion)) === null) return
    await adminApi
      .listarUsuarios()
      .then(setUsuarios)
      .catch(() => undefined)
  }

  return (
    <fieldset>
      <legend>Gestión de usuarios</legend>
      <p>
        <button type="button" onClick={() => void listar()}>
          Listar usuarios
        </button>{' '}
        <label>
          ID usuario{' '}
          <input type="number" min={1} value={id} onChange={(e) => setId(e.target.value)} />
        </label>{' '}
        <button type="button" disabled={!id} onClick={() => void verExpediente()}>
          Ver expediente
        </button>
      </p>

      <p>
        <label>
          Nombre{' '}
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={50} />
        </label>{' '}
        <label>
          Correo{' '}
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            maxLength={100}
            size={30}
          />
        </label>{' '}
        <button
          type="button"
          disabled={!id || (!nombre.trim() && !correo.trim())}
          onClick={() =>
            void accion('Guardar datos', () => adminApi.actualizarDatos(Number(id), nombre, correo))
          }
        >
          Guardar datos
        </button>
      </p>

      <p>
        <label>
          <input
            type="number" min={1}
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
          />{' '}
          Plan vigente (ID)
        </label>{' '}
        <label>
          Cupos de apadrinados (0-5){' '}
          <input
            type="number"
            min={0}
            max={5}
            value={cupos}
            onChange={(e) => setCupos(e.target.value)}
          />
        </label>{' '}
        <button
          type="button"
          disabled={!id || !planId || cupos === ''}
          onClick={() =>
            void accion('Guardar plan y cupos', () =>
              adminApi.guardarPlan(Number(id), {
                plan_ID: Number(planId),
                cupos_apadrinados_adq: Number(cupos),
              }),
            )
          }
        >
          Guardar plan y cupos
        </button>
      </p>

      <p>
        <label>
          Estado{' '}
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            {Object.entries(ESTADOS).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {valor} - {texto}
              </option>
            ))}
          </select>
        </label>{' '}
        <button
          type="button"
          disabled={!id}
          onClick={() =>
            void accion('Cambiar estado', () => adminApi.cambiarEstado(Number(id), Number(estado)))
          }
        >
          Cambiar estado
        </button>{' '}
        <button
          type="button"
          disabled={!id}
          onClick={() =>
            void accion('Eliminar apadrinado', () => adminApi.eliminarApadrinado(Number(id)))
          }
        >
          Eliminar apadrinado
        </button>
      </p>

      <p>Última consulta: ocupados {ocupacion?.usados ?? "—"}; disponibles {ocupacion?.disponibles ?? "—"}. Usa «Ver expediente» para actualizar.</p>
      <pre>{salida}</pre>

      {usuarios.length > 0 && (
        <table border={1}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Cuenta principal</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.usuario_ID}>
                <td>{usuario.usuario_ID}</td>
                <td>{usuario.nombre_usuario}</td>
                <td>{usuario.correo_usuario}</td>
                <td>{ROLES[usuario.rol_ID] ?? usuario.rol_ID}</td>
                <td>{ESTADOS[usuario.estado_ID] ?? usuario.estado_ID}</td>
                <td>{usuario.usuario_principal_ID ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </fieldset>
  )
}
