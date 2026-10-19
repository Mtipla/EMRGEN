import { useState } from 'react'
import { downloadBlob } from '@repo/api-client'
import { adminApi, ROLES, type EntradaBitacora, type FiltrosBitacora } from './api'
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
    .map(([campo, { antes, despues }]) => `${campo}: ${antes ?? '(vacío)'} → ${despues ?? '(vacío)'}`)
    .join('; ')

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

  async function exportarPdf() {
    const pdf = await ejecutar('Exportar PDF (jsReport)', () => adminApi.descargarReporte(filtros))
    // En Electron abre el diálogo "Guardar como" del sistema.
    if (pdf) downloadBlob(pdf, `bitacora-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <fieldset>
      <legend>Bitácora / auditoría</legend>
      <p>
        <label>
          Desde{' '}
          <input
            type="date"
            value={filtros.desde}
            onChange={(e) => cambiar('desde', e.target.value)}
          />
        </label>{' '}
        <label>
          Hasta{' '}
          <input
            type="date"
            value={filtros.hasta}
            onChange={(e) => cambiar('hasta', e.target.value)}
          />
        </label>{' '}
        <label>
          ID administrador (actor){' '}
          <input
            type="number"
            min={1}
            value={filtros.usuario_ID}
            onChange={(e) => cambiar('usuario_ID', e.target.value)}
          />
        </label>{' '}
        <label>
          ID usuario afectado{' '}
          <input
            type="number"
            min={1}
            value={filtros.usuario_afectado_ID}
            onChange={(e) => cambiar('usuario_afectado_ID', e.target.value)}
          />
        </label>{' '}
        <label>
          Aplicación{' '}
          <select
            value={filtros.aplicacion_ID}
            onChange={(e) => cambiar('aplicacion_ID', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="1">1 - WEB</option>
            <option value="2">2 - MOVIL</option>
            <option value="3">3 - ESCRITORIO</option>
          </select>
        </label>{' '}
        <label>
          Límite (1-1000){' '}
          <input
            type="number"
            min={1}
            max={1000}
            value={filtros.limite}
            onChange={(e) => cambiar('limite', e.target.value)}
          />
        </label>
      </p>
      <p>
        <button type="button" onClick={() => void listar()}>
          Listar bitácora
        </button>{' '}
        <button type="button" onClick={() => void exportarPdf()}>
          Exportar PDF (jsReport)
        </button>
      </p>

      <pre>{salida}</pre>

      {entradas.length > 0 && (
        <table border={1}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Actor</th>
              <th>Usuario afectado</th>
              <th>Acción</th>
              <th>Resultado</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {entradas.map((entrada) => (
              <tr key={entrada.bitacora_sistema_ID}>
                <td>{entrada.bitacora_sistema_ID}</td>
                <td>{new Date(entrada.fecha_accion).toLocaleString('es-CL')}</td>
                <td>
                  {entrada.usuario_ID} - {entrada.nombre_usuario} (
                  {ROLES[entrada.rol_actor_ID ?? 0] ?? 'sin rol'})
                </td>
                <td>
                  {entrada.usuario_afectado_ID !== null &&
                    `${entrada.usuario_afectado_ID} - ${entrada.nombre_usuario_afectado ?? '(eliminado)'}`}
                </td>
                <td>
                  {entrada.tipo_accion} {entrada.entidad_afectada}
                </td>
                <td>{entrada.resultado}</td>
                <td>
                  {entrada.accion_realizada}
                  {entrada.cambios && <div>{describirCambios(entrada.cambios)}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </fieldset>
  )
}
