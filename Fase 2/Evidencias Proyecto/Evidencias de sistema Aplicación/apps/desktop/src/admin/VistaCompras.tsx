import { useEffect, useState, type FormEvent } from 'react'
import { DataTable, type Column } from '@repo/ui/wireframe'
import type { Perfil } from '@repo/ui/permisos'
import {
  adminApi,
  describirError,
  type FiltrosVentas,
  type PaginaVentas,
  type VentaAdmin,
} from './api'
import { BotonDescargarReporte } from './BotonDescargarReporte'

const SIN_FILTROS: FiltrosVentas = { busqueda: '', estado_pago_id: '', desde: '', hasta: '' }
const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
const FECHA = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Santiago',
})
const ESTADOS = ['PENDIENTE', 'PAGADO', 'RECHAZADO', 'CANCELADO', 'REVISION']
const COLUMNAS: Column<VentaAdmin>[] = [
  { header: 'Número de boleta', render: (v) => <strong>#{v.venta_id}</strong> },
  { header: 'Fecha (Chile)', render: (v) => FECHA.format(new Date(v.fecha_venta)) },
  {
    header: 'Nombre',
    render: (v) => (
      <div className="desktop-sales-user">
        <strong>{v.nombre_usuario ?? 'Cuenta eliminada'}</strong>
        {v.usuario_id !== null && <span className="wf-muted">ID {v.usuario_id}</span>}
      </div>
    ),
  },
  {
    header: 'Correo',
    render: (v) => <span className="desktop-sales-email">{v.correo_usuario ?? 'Sin cuenta asociada'}</span>,
  },
  {
    header: 'Detalle de compra',
    render: (v) =>
      v.detalles.length
        ? v.detalles.map((d) => (
            <div key={d.detalle_venta_id} className="desktop-sale-line">
              <strong>{d.tipo_compra === 'CUPOS' ? 'Cupos adicionales' : 'Plan Premium'}</strong>
              <span className="wf-muted">
                {d.cantidad} × {CLP.format(d.precio_uni)}
              </span>
            </div>
          ))
        : 'Sin detalle registrado',
  },
  { header: 'Total (CLP)', render: (v) => CLP.format(v.total_venta) },
  {
    header: 'Método de pago',
    render: (v) => (
      <>
        {v.metodo_pago}
        {v.monto_cobrado && v.moneda_cobrada && (
          <span className="desktop-sale-charge wf-muted">
            Orden: {v.monto_cobrado} {v.moneda_cobrada}
          </span>
        )}
      </>
    ),
  },
  {
    header: 'Estado',
    render: (v) => (
      <span className={`desktop-sale-state desktop-sale-state--${v.estado.toLowerCase()}`}>
        {v.estado}
      </span>
    ),
  },
]

export function VistaCompras({ perfil }: { perfil: Perfil }) {
  return perfil === 'ADMINISTRADOR' ? (
    <Ventas />
  ) : (
    <section className="wf-card">
      <h1>Administrar compras</h1>
      <p className="wf-message wf-message--error" role="alert">
        La consulta y descarga de ventas requiere una cuenta de administrador con acceso completo.
      </p>
    </section>
  )
}

function Ventas() {
  const [filtros, setFiltros] = useState(SIN_FILTROS)
  const [consulta, setConsulta] = useState({ filtros: SIN_FILTROS, offset: 0 })
  const [version, setVersion] = useState(0)
  const [estado, setEstado] = useState<{
    pagina: PaginaVentas | null
    cargando: boolean
    error: string
  }>({ pagina: null, cargando: true, error: '' })
  const [generando, setGenerando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const peticion = new AbortController()
    void adminApi.listarVentas(consulta.filtros, consulta.offset, peticion.signal).then(
      (pagina) => {
        if (peticion.signal.aborted) return
        if (consulta.offset > 0 && consulta.offset >= pagina.total) {
          setConsulta((actual) => ({
            ...actual,
            offset: Math.max(0, Math.ceil(pagina.total / 20) - 1) * 20,
          }))
          return
        }
        setEstado({ pagina, cargando: false, error: '' })
      },
      async (causa: unknown) => {
        if (peticion.signal.aborted) return
        const error = await describirError(causa)
        if (!peticion.signal.aborted) setEstado((actual) => ({ ...actual, cargando: false, error }))
      },
    )
    return () => peticion.abort()
  }, [consulta, version])

  function aplicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMensaje('')
    setEstado({ pagina: null, cargando: true, error: '' })
    setConsulta({ filtros: { ...filtros, busqueda: filtros.busqueda.trim() }, offset: 0 })
  }

  function cambiarPagina(offset: number) {
    setEstado({ pagina: null, cargando: true, error: '' })
    setConsulta((actual) => ({ ...actual, offset }))
  }

  const { pagina, cargando, error } = estado
  const cambiar = (campo: keyof FiltrosVentas, valor: string) =>
    setFiltros((actual) => ({ ...actual, [campo]: valor }))

  return (
    <section className="wf-card desktop-sales" aria-labelledby="ventas-titulo">
      <div className="desktop-alert-heading">
        <div>
          <h1 id="ventas-titulo">Administrar compras</h1>
          <p className="wf-muted">
            Ventas registradas en el sistema. Descarga un reporte PDF o Excel con los filtros
            aplicados.
          </p>
        </div>
        <BotonDescargarReporte
          nombre="ventas"
          disabled={cargando || !pagina}
          descargar={(formato) => adminApi.descargarVentas(consulta.filtros, formato)}
          onGenerandoChange={(valor) => {
            setGenerando(valor)
            if (valor) setMensaje('')
          }}
          onDescargado={(formato) =>
            setMensaje(
              `Reporte generado. Se inició la descarga del ${formato === 'pdf' ? 'PDF' : 'Excel'}.`,
            )
          }
        />
      </div>
      <div className="desktop-alert-summary">
        <p>
          <strong>{pagina?.total ?? '—'}</strong>
          <span>Ventas con estos filtros</span>
        </p>
        <p>
          <strong>{pagina ? CLP.format(pagina.total_pagado_clp) : '—'}</strong>
          <span>Total pagado (CLP)</span>
        </p>
      </div>
      <form className="wf-form desktop-sales-filters" onSubmit={aplicar}>
        <label>
          Buscar
          <input
            type="search"
            placeholder="Boleta, usuario o correo"
            maxLength={100}
            value={filtros.busqueda}
            disabled={generando}
            onChange={(e) => cambiar('busqueda', e.target.value)}
          />
        </label>
        <label>
          Estado
          <select
            value={filtros.estado_pago_id}
            disabled={generando}
            onChange={(e) => cambiar('estado_pago_id', e.target.value)}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((nombre, i) => (
              <option key={nombre} value={i + 1}>
                {nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Desde
          <input
            type="date"
            value={filtros.desde}
            max={filtros.hasta || undefined}
            disabled={generando}
            onChange={(e) => cambiar('desde', e.target.value)}
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            value={filtros.hasta}
            min={filtros.desde || undefined}
            disabled={generando}
            onChange={(e) => cambiar('hasta', e.target.value)}
          />
        </label>
        <button type="submit" className="wf-button wf-button--secondary" disabled={generando}>
          Aplicar filtros
        </button>
        <button
          type="button"
          className="wf-button wf-button--secondary"
          disabled={generando || cargando}
          onClick={() => {
            setEstado((actual) => ({ ...actual, cargando: true }))
            setVersion((actual) => actual + 1)
          }}
        >
          Actualizar
        </button>
      </form>
      {cargando && (
        <p role="status" className="wf-muted">
          Consultando ventas…
        </p>
      )}
      {error && (
        <p role="alert" className="wf-message wf-message--error">
          {error}
        </p>
      )}
      {mensaje && (
        <p role="status" className="wf-message">
          {mensaje}
        </p>
      )}
      <DataTable
        columns={COLUMNAS}
        rows={pagina?.ventas ?? []}
        rowKey={(v) => v.venta_id}
        empty={
          cargando
            ? 'Cargando ventas…'
            : error
              ? 'No se pudo obtener el listado.'
              : 'No hay ventas con estos filtros.'
        }
      />
      <div className="desktop-alert-pagination">
        <p className="wf-muted">
          {pagina?.total
            ? `${consulta.offset + 1}–${consulta.offset + pagina.ventas.length} de ${pagina.total} ventas`
            : '0 ventas'}
        </p>
        <div className="wf-row">
          <button
            type="button"
            className="wf-button wf-button--secondary"
            disabled={generando || cargando || consulta.offset === 0}
            onClick={() => cambiarPagina(Math.max(0, consulta.offset - 20))}
          >
            Anterior
          </button>
          <button
            type="button"
            className="wf-button wf-button--secondary"
            disabled={generando || cargando || !pagina || consulta.offset + 20 >= pagina.total}
            onClick={() => cambiarPagina(consulta.offset + 20)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  )
}
