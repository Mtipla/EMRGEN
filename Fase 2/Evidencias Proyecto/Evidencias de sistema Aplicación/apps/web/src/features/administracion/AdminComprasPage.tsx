import { useEffect, useState, type FormEvent } from 'react'
import { VentasTabla, type PaginaVentas } from '@repo/ui/admin-ventas'
import { apiFetch } from '../cuenta/session'

const SIN_FILTROS = { busqueda: '', estado_pago_id: '', desde: '', hasta: '' }
const ESTADOS = ['PENDIENTE', 'PAGADO', 'RECHAZADO', 'CANCELADO', 'REVISION']
const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
const LIMITE = 20

/** Consulta las ventas reales; no ofrece operaciones de escritura sobre compras. */
export function AdminComprasPage() {
  const [filtros, setFiltros] = useState(SIN_FILTROS)
  const [consulta, setConsulta] = useState({ filtros: SIN_FILTROS, offset: 0 })
  const [version, setVersion] = useState(0)
  const [resultado, setResultado] = useState<{
    pagina: PaginaVentas | null; cargando: boolean; error: string
  }>({ pagina: null, cargando: true, error: '' })

  useEffect(() => {
    const peticion = new AbortController()
    const params = new URLSearchParams({ limit: String(LIMITE), offset: String(consulta.offset) })
    Object.entries(consulta.filtros).forEach(([campo, valor]) => {
      if (valor) params.set(campo, valor)
    })
    apiFetch<PaginaVentas>(`/admin/ventas?${params}`, { signal: peticion.signal }).then(
      (pagina) => {
        if (!peticion.signal.aborted) setResultado({ pagina, cargando: false, error: '' })
      },
      (causa: Error) => {
        if (!peticion.signal.aborted) setResultado({ pagina: null, cargando: false, error: causa.message })
      },
    )
    return () => peticion.abort()
  }, [consulta, version])

  function aplicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResultado({ pagina: null, cargando: true, error: '' })
    setConsulta({ filtros: { ...filtros, busqueda: filtros.busqueda.trim() }, offset: 0 })
  }
  function cambiarPagina(offset: number) {
    setResultado({ pagina: null, cargando: true, error: '' })
    setConsulta((actual) => ({ ...actual, offset }))
  }
  const { pagina, cargando, error } = resultado

  return (
    <section className="wf-card">
      <h1>Administrar compras</h1>
      <p className="wf-muted">Ventas registradas en el sistema. Consulta de compras en solo lectura.</p>
      <form className="wf-form" onSubmit={aplicar}>
        <label>Buscar
          <input type="search" placeholder="Boleta, usuario o correo" maxLength={100}
            value={filtros.busqueda} onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })} />
        </label>
        <label>Estado
          <select value={filtros.estado_pago_id} onChange={(e) => setFiltros({ ...filtros, estado_pago_id: e.target.value })}>
            <option value="">Todos los estados</option>
            {ESTADOS.map((estado, i) => <option key={estado} value={i + 1}>{estado}</option>)}
          </select>
        </label>
        <label>Desde
          <input type="date" value={filtros.desde} max={filtros.hasta || undefined}
            onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })} />
        </label>
        <label>Hasta
          <input type="date" value={filtros.hasta} min={filtros.desde || undefined}
            onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })} />
        </label>
        <div className="wf-actions">
          <button className="wf-button" type="submit" disabled={cargando}>Aplicar filtros</button>
          <button className="wf-button wf-button--secondary" type="button" disabled={cargando}
            onClick={() => {
              setResultado({ pagina: null, cargando: true, error: '' })
              setVersion((v) => v + 1)
            }}>Actualizar</button>
        </div>
      </form>
      {cargando && <p role="status">Consultando ventas…</p>}
      {error && <p className="wf-message wf-message--error" role="alert">{error}</p>}
      {pagina && <p>{pagina.total} ventas · Total pagado: {clp.format(pagina.total_pagado_clp)}</p>}
      <VentasTabla ventas={pagina?.ventas ?? []}
        empty={cargando ? 'Cargando ventas…' : error ? 'No se pudo obtener el listado.' : 'No hay ventas con estos filtros.'} />
      <div className="wf-actions">
        <button type="button" className="wf-button wf-button--secondary"
          disabled={cargando || consulta.offset === 0} onClick={() => cambiarPagina(Math.max(0, consulta.offset - LIMITE))}>Anterior</button>
        <button type="button" className="wf-button wf-button--secondary"
          disabled={cargando || !pagina || consulta.offset + LIMITE >= pagina.total}
          onClick={() => cambiarPagina(consulta.offset + LIMITE)}>Siguiente</button>
      </div>
    </section>
  )
}
