import { useEffect, useRef, useState } from 'react'
import {
  ApiError,
  createEmergenApi,
  type OrdenCompraResponse,
  type ResumenCompraApadrinados,
} from '@repo/api-client'

const api = createEmergenApi(import.meta.env.VITE_API_URL ?? 'http://localhost:3000')

export type PurchaseModal =
  | { type: 'success'; cantidad: number }
  | { type: 'error'; detail?: string }

/**
 * Estado y reglas de la pantalla de compra, sin nada visual: otra interfaz puede usar
 * este hook tal cual. El precio, el usuario y la confirmación del pago los decide el
 * backend; aquí solo se muestra el éxito cuando la captura responde estado PAGADO.
 */
export function usePremiumPurchase() {
  const token = localStorage.getItem('emergen.token') ?? ''
  const [summary, setSummary] = useState<ResumenCompraApadrinados>()
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
        const data = await api.compras.summary(token)
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
    try {
      const created = await api.compras.createOrder(token, cantidad)
      setOrder(created)
      return created.orderId
    } catch (error) {
      // El SDK de PayPal envuelve el error al pasarlo a onError: se guarda el original.
      orderError.current = error
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
        setModal({ type: 'success', cantidad })
      } else if (result.estado === 'PENDIENTE') {
        setUnconfirmedOrderId(orderId)
        setNotice(
          `Tu pago (boleta ${result.ventaId}) está pendiente de confirmación en PayPal. ` +
            'La cuenta se habilitará cuando PayPal lo apruebe; no vuelvas a pagar.',
        )
      } else {
        setUnconfirmedOrderId(undefined)
        setModal({ type: 'error' })
      }
    } catch (error) {
      setCheckoutOpen(false)
      if (error instanceof TypeError) {
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
    }
  }

  /** onCancel: el comprador cerró la ventana de PayPal. Nada se cobró. */
  async function paymentCancelled() {
    setCheckoutOpen(false)
    setNotice('Compra cancelada. No se realizó ningún cobro.')
    if (order) await api.compras.cancel(token, order.orderId).catch(() => undefined)
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
      await api.compras.cancel(token, order.orderId).catch(() => undefined)
    }
  }

  function closeModal() {
    const wasSuccess = modal?.type === 'success'
    setModal(undefined)
    if (wasSuccess) loadSummary()
  }

  return {
    summary,
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
    if (error.status >= 502) return 'El servicio de pagos no está disponible en este momento.'
    return error.message
  }
  return 'Ocurrió un error inesperado.'
}

/** Detalle extra para el modal de error, solo si el backend dio un motivo para el usuario. */
function specificMessage(error: unknown): string | undefined {
  if (error instanceof ApiError && error.status < 502) return errorMessage(error)
  if (error instanceof TypeError) return errorMessage(error)
  return undefined
}
