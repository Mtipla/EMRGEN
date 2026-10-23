import { useState } from 'react'
import { DataTable, type Column } from '@repo/ui/wireframe'
import { adminApi, ESTADOS, ROLES, type UsuarioAdmin } from './api'
import { ResultadoPeticion } from './ResultadoPeticion'
import { usePeticion } from './usePeticion'

const COLUMNAS: Column<UsuarioAdmin>[] = [
  { header: 'ID', render: (usuario) => usuario.usuario_ID },
  { header: 'Nombre', render: (usuario) => usuario.nombre_usuario },
  { header: 'Correo', render: (usuario) => usuario.correo_usuario },
  { header: 'Rol', render: (usuario) => ROLES[usuario.rol_ID] ?? usuario.rol_ID },
  { header: 'Estado', render: (usuario) => ESTADOS[usuario.estado_ID] ?? usuario.estado_ID },
  { header: 'Cuenta principal', render: (usuario) => usuario.usuario_principal_ID ?? '—' },
]

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
    setOcupacion({
      usados: expediente.plan?.cupos_ocupados ?? 0,
      disponibles: expediente.plan?.cupos_disponibles ?? 0,
    })
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
    <section className="wf-card" id="pruebas-usuarios" aria-labelledby="pruebas-usuarios-titulo">
      <h2 id="pruebas-usuarios-titulo">Gestión de usuarios</h2>
      <p className="wf-muted">
        Consulta el listado e indica el ID del usuario para revisar su expediente o realizar
        cambios.
      </p>
      <div className="wf-row desktop-test-toolbar">
        <button
          type="button"
          className="wf-button wf-button--secondary"
          onClick={() => void listar()}
        >
          Listar usuarios
        </button>
        <div className="wf-form">
          <label>
            ID usuario
            <input type="number" min={1} value={id} onChange={(e) => setId(e.target.value)} />
          </label>
        </div>
        <button
          type="button"
          className="wf-button"
          disabled={!id}
          onClick={() => void verExpediente()}
        >
          Ver expediente
        </button>
      </div>

      <div className="desktop-test-list">
        <h3>Listado de usuarios</h3>
        <DataTable
          columns={COLUMNAS}
          rows={usuarios}
          rowKey={(usuario) => usuario.usuario_ID}
          empty="Sin usuarios en el listado. Usa «Listar usuarios» para consultar."
        />
      </div>

      <div className="desktop-test-grid">
        <fieldset className="desktop-test-group wf-form">
          <legend>Datos del usuario</legend>
          <label>
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={50} />
          </label>
          <label>
            Correo
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              maxLength={100}
            />
          </label>
          <div className="wf-actions">
            <button
              type="button"
              className="wf-button"
              disabled={!id || (!nombre.trim() && !correo.trim())}
              onClick={() =>
                void accion('Guardar datos', () =>
                  adminApi.actualizarDatos(Number(id), nombre, correo),
                )
              }
            >
              Guardar datos
            </button>
          </div>
        </fieldset>

        <fieldset className="desktop-test-group wf-form">
          <legend>Plan y cupos</legend>
          <label>
            Plan vigente (ID)
            <input
              type="number"
              min={1}
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
            />
          </label>
          <label>
            Cupos de apadrinados (0-5)
            <input
              type="number"
              min={0}
              max={5}
              value={cupos}
              onChange={(e) => setCupos(e.target.value)}
            />
          </label>
          <p className="wf-muted">
            Última consulta: ocupados {ocupacion?.usados ?? '—'}; disponibles{' '}
            {ocupacion?.disponibles ?? '—'}. Usa «Ver expediente» para actualizar.
          </p>
          <div className="wf-actions">
            <button
              type="button"
              className="wf-button"
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
          </div>
        </fieldset>

        <fieldset className="desktop-test-group wf-form">
          <legend>Acceso de la cuenta</legend>
          <label>
            Estado
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              {Object.entries(ESTADOS).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {valor} - {texto}
                </option>
              ))}
            </select>
          </label>
          <div className="wf-actions">
            <button
              type="button"
              className="wf-button"
              disabled={!id}
              onClick={() =>
                void accion('Cambiar estado', () =>
                  adminApi.cambiarEstado(Number(id), Number(estado)),
                )
              }
            >
              Cambiar estado
            </button>
          </div>
        </fieldset>

        <fieldset className="desktop-test-group wf-form">
          <legend>Cuenta apadrinada</legend>
          <p className="wf-muted">Elimina la cuenta apadrinada indicada en el campo ID usuario.</p>
          <div className="wf-actions">
            <button
              type="button"
              className="wf-button wf-button--secondary"
              disabled={!id}
              onClick={() =>
                void accion('Eliminar apadrinado', () => adminApi.eliminarApadrinado(Number(id)))
              }
            >
              Eliminar apadrinado
            </button>
          </div>
        </fieldset>
      </div>
      <ResultadoPeticion salida={salida} />
    </section>
  )
}
