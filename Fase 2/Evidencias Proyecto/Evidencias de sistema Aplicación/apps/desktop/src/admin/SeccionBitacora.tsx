import { useState } from 'react'
import { DataTable, type Column } from '@repo/ui/wireframe'
import { adminApi, ROLES, type EntradaBitacora, type FiltrosBitacora } from './api'
import { BotonDescargarReporte } from './BotonDescargarReporte'
import { ResultadoPeticion } from './ResultadoPeticion'
import { usePeticion } from './usePeticion'

const SIN_FILTROS: FiltrosBitacora = {
  desde: '',
  hasta: '',
  usuario_ID: '',
  usuario_afectado_ID: '',
  aplicacion_ID: '',
  limite: '',
}

const describirCambios = (cambios: EntradaBitacora['cambios']) =>
  Object.entries(cambios ?? {})
    .map(
      ([campo, { antes, despues }]) => `${campo}: ${antes ?? '(vacío)'} → ${despues ?? '(vacío)'}`,
    )
    .join('; ')

const COLUMNAS: Column<EntradaBitacora>[] = [
  { header: 'ID', render: (entrada) => entrada.bitacora_sistema_ID },
  { header: 'Fecha', render: (entrada) => new Date(entrada.fecha_accion).toLocaleString('es-CL') },
  {
    header: 'Actor',
    render: (entrada) =>
      `${entrada.usuario_ID} - ${entrada.nombre_usuario} (${ROLES[entrada.rol_actor_ID ?? 0] ?? 'sin rol'})`,
  },
  {
    header: 'Usuario afectado',
    render: (entrada) =>
      entrada.usuario_afectado_ID !== null
        ? `${entrada.usuario_afectado_ID} - ${entrada.nombre_usuario_afectado ?? '(eliminado)'}`
        : '',
  },
  {
    header: 'Acción',
    render: (entrada) => `${entrada.tipo_accion ?? ''} ${entrada.entidad_afectada ?? ''}`,
  },
  { header: 'Resultado', render: (entrada) => entrada.resultado },
  {
    header: 'Detalle',
    render: (entrada) => (
      <>
        {entrada.accion_realizada}
        {entrada.cambios && <div>{describirCambios(entrada.cambios)}</div>}
      </>
    ),
  },
]

/** Auditoría de solo lectura: las entradas las genera el backend al ejecutar cada acción. */
export function SeccionBitacora() {
  const { salida, ejecutar } = usePeticion()
  const [filtros, setFiltros] = useState(SIN_FILTROS)
  const [entradas, setEntradas] = useState<EntradaBitacora[]>([])

  const cambiar = (campo: keyof FiltrosBitacora, valor: string) =>
    setFiltros((actuales) => ({ ...actuales, [campo]: valor }))

  async function listar() {
    const lista = await ejecutar('Listar bitácora', () => adminApi.listarBitacora(filtros))
    if (lista) setEntradas(lista)
  }

  return (
    <section
      className="wf-card desktop-test-audit"
      id="pruebas-bitacora"
      aria-labelledby="pruebas-bitacora-titulo"
    >
      <h2 id="pruebas-bitacora-titulo">Bitácora / auditoría</h2>
      <p className="wf-muted">
        Consulta las acciones registradas en el sistema y exporta un reporte PDF o Excel con los
        mismos filtros.
      </p>
      <div className="wf-form desktop-test-list">
        <div className="wf-grid">
          <label>
            Desde
            <input
              type="date"
              value={filtros.desde}
              onChange={(e) => cambiar('desde', e.target.value)}
            />
          </label>
          <label>
            Hasta
            <input
              type="date"
              value={filtros.hasta}
              onChange={(e) => cambiar('hasta', e.target.value)}
            />
          </label>
          <label>
            ID administrador (actor)
            <input
              type="number"
              min={1}
              value={filtros.usuario_ID}
              onChange={(e) => cambiar('usuario_ID', e.target.value)}
            />
          </label>
          <label>
            ID usuario afectado
            <input
              type="number"
              min={1}
              value={filtros.usuario_afectado_ID}
              onChange={(e) => cambiar('usuario_afectado_ID', e.target.value)}
            />
          </label>
          <label>
            Aplicación
            <select
              value={filtros.aplicacion_ID}
              onChange={(e) => cambiar('aplicacion_ID', e.target.value)}
            >
              <option value="">Todas</option>
              <option value="1">1 - WEB</option>
              <option value="2">2 - MOVIL</option>
              <option value="3">3 - ESCRITORIO</option>
            </select>
          </label>
          <label>
            Límite (1-1000)
            <input
              type="number"
              min={1}
              max={1000}
              value={filtros.limite}
              onChange={(e) => cambiar('limite', e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="wf-actions">
        <BotonDescargarReporte
          nombre="bitacora"
          className="wf-button wf-button--secondary"
          descargar={(formato) => adminApi.descargarReporte(filtros, formato)}
        />
        <button type="button" className="wf-button" onClick={() => void listar()}>
          Listar bitácora
        </button>
      </div>
      <ResultadoPeticion salida={salida} />
      <div className="desktop-test-list">
        <h3>Registros de auditoría</h3>
        <DataTable
          columns={COLUMNAS}
          rows={entradas}
          rowKey={(entrada) => entrada.bitacora_sistema_ID}
          empty="Sin registros en el listado. Usa «Listar bitácora» para consultar."
        />
      </div>
    </section>
  )
}
