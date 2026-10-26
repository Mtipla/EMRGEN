import { useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { DataTable, type Column } from '@repo/ui/wireframe'
import { adminApi, describirError, type AlertaAdmin, type PaginaAlertas } from './api'

const TAMANO_PAGINA = 20
const INTERVALO = 3000
const fecha = (valor: string | null) => (valor ? new Date(valor).toLocaleString('es-CL') : '—')

function EstadoAlerta({ estado }: { estado: AlertaAdmin['estado_alerta'] }) {
  return (
    <span className={`desktop-alert-status desktop-alert-status--${estado.toLowerCase()}`}>
      {estado}
    </span>
  )
}

/** Monitor de solo lectura: reutiliza la sesión Admin y consulta sin solapar peticiones. */
export function VistaAlertas() {
  const [filtros, setFiltros] = useState({ estado: '', usuario_id: '' })
  const [consulta, setConsulta] = useState({
    ...filtros,
    limit: TAMANO_PAGINA,
    offset: 0,
  })
  const [recarga, setRecarga] = useState(0)
  const [seleccion, setSeleccion] = useState<number | null>(null)
  const [monitor, setMonitor] = useState<{
    pagina: PaginaAlertas | null
    cargando: boolean
    error: string
    actualizado: Date | null
  }>({ pagina: null, cargando: true, error: '', actualizado: null })

  useEffect(() => {
    let activo = true
    let temporizador: ReturnType<typeof setTimeout> | undefined
    let peticion: AbortController

    async function actualizar() {
      peticion = new AbortController()
      let reintentar = true
      try {
        const pagina = await adminApi.listarAlertas(consulta, peticion.signal)
        if (!activo) return
        if (consulta.offset > 0 && consulta.offset >= pagina.total) {
          setConsulta((actual) => ({
            ...actual,
            offset: Math.max(0, Math.ceil(pagina.total / TAMANO_PAGINA) - 1) * TAMANO_PAGINA,
          }))
          return
        }
        setMonitor({
          pagina,
          cargando: false,
          error: '',
          actualizado: new Date(),
        })
      } catch (causa) {
        if (!activo || peticion.signal.aborted) return
        const sinPermiso = isAxiosError(causa) && [401, 403].includes(causa.response?.status ?? 0)
        const error = sinPermiso
          ? 'La sesión ya no permite consultar alertas. Vuelve a iniciar sesión como administrador.'
          : await describirError(causa)
        if (!activo) return
        reintentar = !sinPermiso
        setMonitor((anterior) => ({
          ...anterior,
          pagina: sinPermiso ? null : anterior.pagina,
          actualizado: sinPermiso ? null : anterior.actualizado,
          cargando: false,
          error,
        }))
      } finally {
        if (activo && reintentar) temporizador = setTimeout(() => void actualizar(), INTERVALO)
      }
    }

    void actualizar()
    return () => {
      activo = false
      clearTimeout(temporizador)
      peticion?.abort()
    }
  }, [consulta, recarga])

  function aplicarFiltros(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSeleccion(null)
    setMonitor({ pagina: null, cargando: true, error: '', actualizado: null })
    setConsulta({ ...filtros, limit: TAMANO_PAGINA, offset: 0 })
  }

  const { pagina, cargando, error, actualizado } = monitor
  const detalle = pagina?.alertas.find((alerta) => alerta.alerta_id === seleccion)
  const columnas: Column<AlertaAdmin>[] = [
    { header: 'Alerta', render: (a) => <strong>#{a.alerta_id}</strong> },
    {
      header: 'Usuario',
      render: (a) => (
        <>
          <strong>{a.nombre_usuario ?? 'Cuenta eliminada'}</strong>
          <span className="desktop-alert-secondary">
            {a.correo_usuario ?? 'Sin cuenta asociada'}
          </span>
          {a.usuario_id !== null && (
            <span className="desktop-alert-secondary">ID {a.usuario_id}</span>
          )}
        </>
      ),
    },
    { header: 'Emergencia', render: (a) => a.prioridad },
    {
      header: 'Estado',
      render: (a) => <EstadoAlerta estado={a.estado_alerta} />,
    },
    { header: 'Fecha de creación', render: (a) => fecha(a.fecha_creacion) },
    {
      header: 'Detalle',
      render: (a) => (
        <button
          type="button"
          className="wf-button wf-button--secondary"
          onClick={() => setSeleccion(a.alerta_id)}
        >
          Ver detalle
        </button>
      ),
    },
  ]

  return (
    <section className="wf-card desktop-alerts" aria-labelledby="alertas-titulo">
      <div className="desktop-alert-heading">
        <div>
          <h1 id="alertas-titulo">Alertas SOS</h1>
          <p className="wf-muted">
            Consulta las alertas que ingresan al sistema. Actualización automática cada 3 segundos.
          </p>
        </div>
        <button
          type="button"
          className="wf-button"
          disabled={cargando}
          onClick={() => {
            setMonitor((actual) => ({ ...actual, cargando: true }))
            setRecarga((actual) => actual + 1)
          }}
        >
          Actualizar ahora
        </button>
      </div>

      <div className="desktop-alert-summary">
        <p>
          <strong>{pagina?.activas ?? '—'}</strong>
          <span>Activas en el sistema</span>
        </p>
        <p>
          <strong>{pagina?.total ?? '—'}</strong>
          <span>Resultados con estos filtros</span>
        </p>
        <p className="desktop-alert-sync" role="status">
          <span className={error ? 'desktop-alert-offline' : ''}>
            {error
              ? 'Actualización interrumpida'
              : cargando
                ? 'Consultando alertas…'
                : 'Actualización automática activa'}
          </span>
          <span className="wf-muted">
            {actualizado
              ? `Última consulta: ${actualizado.toLocaleTimeString('es-CL')}`
              : 'Esperando la primera consulta'}
          </span>
        </p>
      </div>

      <form className="wf-form desktop-alert-filters" onSubmit={aplicarFiltros}>
        <label>
          Estado
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVA">Activas</option>
            <option value="FINALIZADA">Finalizadas</option>
            <option value="EXPIRADA">Expiradas</option>
          </select>
        </label>
        <label>
          ID de usuario
          <input
            type="number"
            min={1}
            step={1}
            placeholder="Todos los usuarios"
            value={filtros.usuario_id}
            onChange={(e) => setFiltros({ ...filtros, usuario_id: e.target.value })}
          />
        </label>
        <button type="submit" className="wf-button wf-button--secondary">
          Aplicar filtros
        </button>
      </form>

      {error && (
        <p role="alert" className="wf-message wf-message--error">
          {error}
          {pagina && ' Se conserva la última consulta; los datos pueden estar desactualizados.'}
        </p>
      )}

      <DataTable
        columns={columnas}
        rows={pagina?.alertas ?? []}
        rowKey={(a) => a.alerta_id}
        selectedKey={seleccion ?? undefined}
        onSelect={(a) => setSeleccion(a.alerta_id)}
        empty={
          cargando
            ? 'Cargando alertas…'
            : error
              ? 'No se pudo obtener el listado de alertas.'
              : 'No hay alertas con estos filtros.'
        }
      />

      <div className="desktop-alert-pagination">
        <p className="wf-muted">
          {pagina?.total
            ? `${consulta.offset + 1}–${consulta.offset + pagina.alertas.length} de ${pagina.total} alertas`
            : '0 alertas'}
        </p>
        <div className="wf-row">
          <button
            type="button"
            className="wf-button wf-button--secondary"
            disabled={cargando || consulta.offset === 0}
            onClick={() => {
              setMonitor({
                pagina: null,
                cargando: true,
                error: '',
                actualizado: null,
              })
              setConsulta((actual) => ({
                ...actual,
                offset: Math.max(0, actual.offset - TAMANO_PAGINA),
              }))
            }}
          >
            Anterior
          </button>
          <button
            type="button"
            className="wf-button wf-button--secondary"
            disabled={cargando || !pagina || consulta.offset + TAMANO_PAGINA >= pagina.total}
            onClick={() => {
              setMonitor({
                pagina: null,
                cargando: true,
                error: '',
                actualizado: null,
              })
              setConsulta((actual) => ({
                ...actual,
                offset: actual.offset + TAMANO_PAGINA,
              }))
            }}
          >
            Siguiente
          </button>
        </div>
      </div>

      {detalle && (
        <section className="desktop-alert-detail" aria-labelledby="alerta-detalle-titulo">
          <div className="desktop-alert-heading">
            <h2 id="alerta-detalle-titulo">Detalle de alerta #{detalle.alerta_id}</h2>
            <EstadoAlerta estado={detalle.estado_alerta} />
          </div>
          <dl>
            <div>
              <dt>Usuario</dt>
              <dd>
                {detalle.nombre_usuario ?? 'Cuenta eliminada'}
                {detalle.usuario_id !== null && ` · ID ${detalle.usuario_id}`}
              </dd>
            </div>
            <div>
              <dt>Tipo de emergencia</dt>
              <dd>{detalle.prioridad}</dd>
            </div>
            <div>
              <dt>Mensaje registrado</dt>
              <dd>{detalle.mensaje}</dd>
            </div>
            <div>
              <dt>Ubicación</dt>
              <dd>{detalle.ubicacion ?? 'Sin ubicación registrada'}</dd>
            </div>
            <div>
              <dt>Creación</dt>
              <dd>{fecha(detalle.fecha_creacion)}</dd>
            </div>
            <div>
              <dt>Cierre</dt>
              <dd>
                {detalle.fecha_cierre ? fecha(detalle.fecha_cierre) : 'La alerta continúa activa'}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </section>
  )
}
