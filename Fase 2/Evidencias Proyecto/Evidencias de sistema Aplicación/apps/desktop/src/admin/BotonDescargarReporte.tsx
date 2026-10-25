import { useEffect, useRef, useState } from 'react'
import { downloadBlob } from '@repo/api-client'
import { Modal } from '@repo/ui/wireframe'
import { describirError, type FormatoReporte } from './api'

type Props = {
  nombre: 'bitacora' | 'ventas'
  descargar: (formato: FormatoReporte) => Promise<Blob>
  disabled?: boolean
  className?: string
  onGenerandoChange?: (generando: boolean) => void
  onDescargado?: (formato: FormatoReporte) => void
}

/** Conserva el botón de cada sección y comparte la elección y descarga del formato. */
export function BotonDescargarReporte({
  nombre,
  descargar,
  disabled = false,
  className = 'wf-button',
  onGenerandoChange,
  onDescargado,
}: Props) {
  const [abierto, setAbierto] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState('')
  const boton = useRef<HTMLButtonElement>(null)
  const estabaAbierto = useRef(false)
  const enCurso = useRef(false)

  useEffect(() => {
    if (!abierto && estabaAbierto.current) boton.current?.focus()
    estabaAbierto.current = abierto
  }, [abierto])

  function cerrar() {
    if (!enCurso.current) setAbierto(false)
  }

  async function generar(formato: FormatoReporte) {
    if (enCurso.current) return
    enCurso.current = true
    setGenerando(true)
    onGenerandoChange?.(true)
    setError('')
    try {
      const archivo = await descargar(formato)
      downloadBlob(archivo, `${nombre}-${new Date().toISOString().slice(0, 10)}.${formato}`)
      onDescargado?.(formato)
      setAbierto(false)
    } catch (causa) {
      setError(await describirError(causa))
    } finally {
      enCurso.current = false
      setGenerando(false)
      onGenerandoChange?.(false)
    }
  }

  return (
    <>
      <button
        ref={boton}
        type="button"
        className={className}
        disabled={disabled || generando}
        aria-haspopup="dialog"
        onClick={() => {
          setError('')
          setAbierto(true)
        }}
      >
        Descargar PDF/Excel
      </button>
      {abierto && (
        <Modal
          title={`Descargar reporte de ${nombre === 'bitacora' ? 'bitácora' : 'compras'}`}
          onClose={cerrar}
          actions={
            <>
              <button
                type="button"
                className="wf-button wf-button--secondary"
                disabled={generando}
                onClick={cerrar}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="wf-button"
                autoFocus
                disabled={generando}
                onClick={() => void generar('pdf')}
              >
                PDF
              </button>
              <button
                type="button"
                className="wf-button"
                disabled={generando}
                onClick={() => void generar('xlsx')}
              >
                Excel (.xlsx)
              </button>
            </>
          }
        >
          <p>Elige el formato del reporte. Se utilizarán los filtros de esta sección.</p>
          {generando && <p role="status">Generando reporte…</p>}
          {error && (
            <p role="alert" className="wf-message wf-message--error">
              No se pudo generar el reporte: {error}
            </p>
          )}
        </Modal>
      )}
    </>
  )
}
