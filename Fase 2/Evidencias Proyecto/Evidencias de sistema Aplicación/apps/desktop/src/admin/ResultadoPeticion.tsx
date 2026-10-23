/** Mantiene visible la respuesta de la API, incluyendo errores y detalles del expediente. */
export function ResultadoPeticion({ salida }: { salida: string }) {
  return (
    <div className="desktop-test-result" role="status" aria-live="polite">
      <h3>Resultado de la operación</h3>
      <pre>{salida || 'Todavía no se han realizado operaciones en este apartado.'}</pre>
    </div>
  )
}
