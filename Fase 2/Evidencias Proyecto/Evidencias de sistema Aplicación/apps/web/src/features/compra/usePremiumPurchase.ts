import { useEffect, useRef, useState } from 'react'
import {
  ApiError,
  createEmergenApi,
  type OrdenCompraResponse,
  type CompraPendiente,
  type ResumenCompra,
  type TipoCompra,
} from '@repo/api-client'

const api = createEmergenApi(import.meta.env.VITE_API_URL ?? 'http://localhost:3000')

export type PurchaseModal =
  | { type: 'success'; cantidad: number; tipoCompra: TipoCompra }
  | { type: 'error'; detail?: string }

/**
 * Estado y reglas de la pantalla de compra, sin nada visual: otra interfaz puede usar
 * este hook tal cual. El precio, el usuario y la confirmación del pago los decide el
 * backend; aquí solo se muestra el éxito cuando la captura responde estado PAGADO.
 */
export function usePremiumPurchase(onPurchased?: () => Promise<void>) {
  const token = localStorage.getItem('emergen.token') ?? ''
  const [summary, setSummary] = useState<ResumenCompra>()
  const [pending, setPending] = useState<CompraPendiente[]>([])
  const [loadError, setLoadError] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [order, setOrder] = useState<OrdenCompraResponse>()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [notice, setNotice] = useState('')
  // Orden cuyo resultado no se pudo confirmar (se cortó la conexión o quedó PENDING).
  const [unconfirmedOrderId, setUnconfirmedOrderId] = useState<string>()
  const [modal, setModal] = useState<PurchaseModal>()
  const busy = useRef(false)
  const orderError = useRef<unknown>(undefined)

  const [reloads, setReloads] = useState(0)
  const loadSummary = () => setReloads((n) => n + 1)

  useEffect(() => {
    async function load() {
      try {
        const [data, pendingSales] = await Promise.all([api.compras.purchaseSummary(token), api.compras.pending(token)])
        setPending(pendingSales)
        setLoadError('')
        setSummary(data)
        setCantidad((actual) => Math.min(Math.max(actual, 1), Math.max(data.maxCantidad, 1)))
      } catch (error) {
        setLoadError(errorMessage(error))
      }
    }
    void load()
  }, [token, reloads])

  /** Botón "Método de pago": muestra los botones de PayPal (la orden se crea al pulsarlos). */
  function openCheckout() {
    setNotice('')
    setOrder(undefined)
    setCheckoutOpen(true)
  }

  /** Callback createOrder del SDK de PayPal. */
  async function createOrder(): Promise<string> {
    orderError.current = undefined
    if (order) return order.orderId
    try {
      if (!summary) throw new Error('La compra aún no está lista')
      const created = await api.compras.createOrder(token, cantidad, summary.tipoCompra)
      setOrder(created)
      return created.orderId
    } catch (error) {
      // El SDK de PayPal envuelve el error al pasarlo a onError: se guarda el original.
      orderError.current = error
      loadSummary()
      throw error
    }
  }

  /** Callback onApprove: el comprador aprobó en PayPal; el backend cobra y confirma. */
  async function confirm(orderId: string) {
    if (busy.current) return
    busy.current = true
    setProcessing(true)
    setNotice('')
    try {
      const result = await api.compras.capture(token, orderId)
      setCheckoutOpen(false)
      if (result.estado === 'PAGADO') {
        setUnconfirmedOrderId(undefined)
        setModal({ type: 'success', cantidad, tipoCompra: summary!.tipoCompra })
        await onPurchased?.()
      } else if (result.estado === 'PENDIENTE' || result.estado === 'REVISION') {
        setUnconfirmedOrderId(orderId)
        setNotice(
          `Tu pago (boleta ${result.ventaId}) está pendiente de confirmación en PayPal. ` +
            'Verifica el pago para conciliarlo antes de volver a comprar.',
        )
      } else {
        setUnconfirmedOrderId(undefined)
        setModal({ type: 'error' })
      }
    } catch (error) {
      setCheckoutOpen(false)
      if (error instanceof TypeError || (error instanceof ApiError && error.status >= 500)) {
        // Sin respuesta: el cobro pudo hacerse. Reintentar es seguro (el backend no cobra dos veces).
        setUnconfirmedOrderId(orderId)
        setNotice('Se perdió la conexión y no pudimos confirmar tu pago. Pulsa "Verificar pago".')
      } else {
        setUnconfirmedOrderId(undefined)
        setModal({ type: 'error', detail: specificMessage(error) })
      }
    } finally {
      busy.current = false
      setProcessing(false)
      loadSummary()
    }
  }

  /** Cerrar la ventana no prueba que no haya cobro: la base confirma la cancelación. */
  async function paymentCancelled() {
    setCheckoutOpen(false)
    if (!order) { setNotice('Ventana cerrada. Revisa tus compras si hubo un error al crear la orden.'); return }
    try {
      const result = await api.compras.cancel(token, order.orderId)
      setNotice(result.estado === 'CANCELADO' ? 'Compra cancelada.' : 'Revisa el estado de la compra.')
      loadSummary()
    } catch (error) {
      setUnconfirmedOrderId(order.orderId)
      setNotice(errorMessage(error) + ' Verifica el pago antes de volver a comprar.')
    }
  }

  /** onError del SDK (no se pudo crear la orden o PayPal falló antes de cobrar). */
  function paymentFailed(sdkError: unknown) {
    const error = orderError.current ?? sdkError
    setCheckoutOpen(false)
    if (error instanceof ApiError && error.status === 401) {
      setNotice(errorMessage(error))
      return
    }
    setModal({ type: 'error', detail: specificMessage(error) })
  }

  /** Botón "Cancelar Compra": cierra una orden sin pagar y sale de la pantalla. */
  async function cancelPurchase() {
    if (order && !unconfirmedOrderId) {
      await paymentCancelled()
    }
  }

  async function recover(sale: CompraPendiente) {
    if (busy.current) return
    if (sale.puedeRetomar && sale.orderId) {
      setCantidad(sale.cantidad)
      setOrder({ ...sale, orderId: sale.orderId })
      setCheckoutOpen(true)
      return
    }
    busy.current = true
    setProcessing(true)
    try {
      const result = await api.compras.reconcile(token, sale.ventaId)
      if ('orderId' in result) {
        setCantidad(sale.cantidad)
        setOrder(result)
        setCheckoutOpen(true)
        setNotice('Compra recuperada. Continúa con PayPal para aprobarla.')
      } else if (result.estado === 'PAGADO') {
        setUnconfirmedOrderId(undefined)
        setModal({ type: 'success', cantidad: sale.cantidad, tipoCompra: summary!.tipoCompra })
        await onPurchased?.()
      } else {
        setNotice('Estado de la compra: ' + result.estado + '. Verifica antes de realizar otro pago.')
      }
    } catch (error) { setNotice(errorMessage(error)) }
    finally { busy.current = false; setProcessing(false); loadSummary() }
  }

  function closeModal() {
    const wasSuccess = modal?.type === 'success'
    setModal(undefined)
    if (wasSuccess) loadSummary()
  }

  return {
    summary,
    pending,
    recover,
    loadError,
    reload: loadSummary,
    cantidad,
    setCantidad,
    order,
    checkoutOpen,
    processing,
    notice,
    unconfirmedOrderId,
    modal,
    openCheckout,
    createOrder,
    confirm,
    paymentCancelled,
    paymentFailed,
    cancelPurchase,
    closeModal,
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
  }
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Tu sesión expiró. Cierra sesión y vuelve a ingresar.'
    return error.message
  }
  return 'Ocurrió un error inesperado.'
}

/** Detalle extra para el modal de error, solo si el backend dio un motivo para el usuario. */
function specificMessage(error: unknown): string | undefined {
  if (error instanceof ApiError && error.status >= 400) return errorMessage(error)
  if (error instanceof TypeError) return errorMessage(error)
  return undefined
}
