import { useEffect, useRef, useState } from 'react'
import { loadPaypalSdk } from '@repo/api-client'
import { usePremiumPurchase, type PurchaseModal } from './usePremiumPurchase'
import './PremiumPurchase.css'

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID ?? ''
const MISSING_CLIENT_ID = !PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID.startsWith('<INSERT')
const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

type PremiumPurchaseProps = {
  onClose: () => void
  onPurchased?: () => Promise<void>
}

/** Pantalla "Comprar Cuenta Premium". Solo presenta: la lógica está en usePremiumPurchase. */
export function PremiumPurchase({ onClose, onPurchased }: PremiumPurchaseProps) {
  const purchase = usePremiumPurchase(onPurchased)
  const { summary, order, cantidad, processing, checkoutOpen } = purchase
  const soldOut = summary?.maxCantidad === 0
  const esPlan = summary?.tipoCompra === 'PLAN'

  async function cancel() {
    await purchase.cancelPurchase()
    onClose()
  }

  return (
    <section className="purchase">
      <nav className="purchase-nav" aria-label="FIND ME">
        <strong>FIND ME</strong>
        {/* Destinos pendientes: estas páginas aún no existen en la web. */}
        <a href="#como-funciona">¿Como Funciona?</a>
        <a href="#descargar-app">Descargar App</a>
        <a href="#preguntas-frecuentes">Preguntas Frecuentes</a>
      </nav>

      <div className="purchase-card" aria-busy={processing || !summary}>
        <h1>{summary ? (esPlan ? 'Comprar Cuenta Premium' : 'Comprar cupos de cuentas') : 'Cargando compra'}</h1>

        {purchase.loadError ? (
          <div role="alert" className="purchase-notice purchase-notice--error">
            <p>No se pudieron cargar los datos de la compra: {purchase.loadError}</p>
            <button type="button" onClick={purchase.reload}>
              Reintentar
            </button>
          </div>
        ) : !summary ? (
          <p>Cargando datos de la compra…</p>
        ) : (
          <>
            <dl className="purchase-details">
              <dt>Cantidad</dt>
              <dd>
                {esPlan ? '1 plan para tu cuenta' : (
                  <>
                    <input
                      type="number"
                      aria-label="Cantidad de cuentas"
                      min={1}
                      max={Math.max(summary.maxCantidad, 1)}
                      value={cantidad}
                      disabled={soldOut || checkoutOpen || processing}
                      onChange={(event) => {
                        const value = Math.trunc(Number(event.target.value))
                        purchase.setCantidad(Math.min(Math.max(value || 1, 1), summary.maxCantidad))
                      }}
                    />
                    <small> (máximo {summary.maxCantidad})</small>
                  </>
                )}
              </dd>
              <dt>Descripción</dt>
              <dd>
                {esPlan ? `Activar cuenta Premium para "${summary.usuario}"` : `Añadir Cuenta(s) Extra a "${summary.usuario}"`}
              </dd>
              <dt>Número de boleta</dt>
              <dd>{order ? order.ventaId : <small>se asigna al iniciar el pago</small>}</dd>
              <dt>Precio</dt>
              <dd className="purchase-price">
                ({clp.format(summary.precioUnitario * cantidad)})
                {order && (
                  <small>
                    {' '}
                    se cobran {order.montoCobrado} {order.monedaCobrada} en PayPal
                  </small>
                )}
              </dd>
            </dl>

            {soldOut && (
              <p className="purchase-notice">
                {esPlan ? 'Ya tienes una compra de plan pendiente. Retómala o verifica su pago.' : 'No hay cupos disponibles para una nueva compra. Revisa tus compras pendientes.'}
              </p>
            )}
            {purchase.notice && (
              <p role="status" className="purchase-notice">
                {purchase.notice}
              </p>
            )}
            {processing && <p role="status">Procesando pago, no cierres esta ventana…</p>}

            {purchase.pending.length > 0 && (
              <div aria-label="Compras pendientes">
                <p>Compras pendientes</p>
                {purchase.pending.map((sale) => (
                  <button key={sale.ventaId} type="button" disabled={processing || checkoutOpen}
                    onClick={() => void purchase.recover(sale)}>
                    {sale.puedeRetomar ? 'Retomar' : 'Verificar'} compra {sale.ventaId}
                  </button>
                ))}
              </div>
            )}
            {checkoutOpen && (
              <PaypalCheckout
                createOrder={purchase.createOrder}
                onApprove={purchase.confirm}
                onCancel={purchase.paymentCancelled}
                onError={purchase.paymentFailed}
              />
            )}

            <div className="purchase-actions">
              {purchase.unconfirmedOrderId ? (
                <button
                  type="button"
                  className="purchase-primary"
                  disabled={processing}
                  onClick={() => void purchase.confirm(purchase.unconfirmedOrderId!)}
                >
                  Verificar pago
                </button>
              ) : (
                <button
                  type="button"
                  className="purchase-primary"
                  disabled={soldOut || checkoutOpen || processing}
                  onClick={purchase.openCheckout}
                >
                  Continuar con PayPal
                </button>
              )}
              <button
                type="button"
                className="secondary-button"
                disabled={processing}
                onClick={() => void cancel()}
              >
                Cancelar Compra
              </button>
            </div>
          </>
        )}
      </div>

      {purchase.modal && (
        <ResultModal
          modal={purchase.modal}
          boleta={order?.ventaId}
          onClose={() => {
            const success = purchase.modal?.type === 'success'
            purchase.closeModal()
            if (success) onClose()
          }}
        />
      )}
    </section>
  )
}

type PaypalCheckoutProps = {
  createOrder: () => Promise<string>
  onApprove: (orderId: string) => Promise<void>
  onCancel: () => Promise<void>
  onError: (error: unknown) => void
}

/** Botones del SDK de PayPal (ventana emergente). El Client ID es público; el secreto no sale del backend. */
function PaypalCheckout(props: PaypalCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loadError, setLoadError] = useState('')
  // Callbacks por ref para no recrear los botones de PayPal en cada render.
  const callbacks = useRef(props)
  useEffect(() => {
    callbacks.current = props
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container || MISSING_CLIENT_ID) return

    let closed = false
    const rendering = loadPaypalSdk(PAYPAL_CLIENT_ID, 'USD').then(async (paypal) => {
      const buttons = paypal.Buttons({
        createOrder: () => callbacks.current.createOrder(),
        onApprove: ({ orderID }) => callbacks.current.onApprove(orderID),
        onCancel: () => void callbacks.current.onCancel(),
        onError: (error) => callbacks.current.onError(error),
      })
      if (!closed) await buttons.render(container)
      return buttons
    })
    rendering.catch((error: unknown) => {
      if (!closed) setLoadError(error instanceof Error ? error.message : String(error))
    })
    return () => {
      closed = true
      void rendering.then((buttons) => buttons.close()).catch(() => undefined)
    }
  }, [])

  if (loadError || MISSING_CLIENT_ID) {
    return (
      <p role="alert" className="purchase-notice purchase-notice--error">
        No se pudo cargar PayPal:{' '}
        {loadError || 'falta configurar VITE_PAYPAL_CLIENT_ID en el .env.'}
      </p>
    )
  }
  return <div className="purchase-paypal" ref={containerRef} aria-label="Pagar con PayPal" />

}

type ResultModalProps = {
  modal: PurchaseModal
  boleta?: number
  onClose: () => void
}

function ResultModal({ modal, boleta, onClose }: ResultModalProps) {
  const success = modal.type === 'success'
  return (
    <div className="purchase-overlay">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="purchase-modal-title"
        className={`purchase-modal ${success ? 'purchase-modal--success' : 'purchase-modal--error'}`}
      >
        <h2 id="purchase-modal-title">
          {success ? 'Pago realizado con Exito' : 'ERROR en el Pago'}
        </h2>
        {success ? (
          <p>
            {modal.tipoCompra === 'PLAN'
              ? 'Tu cuenta Premium está activa. Ya puedes comprar cupos de cuentas apadrinadas.'
              : modal.cantidad === 1
              ? 'Su cuenta se encuentra habilitada con una cuenta APADRINADA adicional.'
              : `Su cuenta se encuentra habilitada con ${modal.cantidad} cuentas APADRINADAS adicionales.`}
          </p>
        ) : (
          <>
            <p>
              Su pago no pudo ser procesado, intente nuevamente, si persiste el problema
              contáctese con el servicio al cliente.
            </p>
            {modal.detail && <p className="purchase-modal-detail">{modal.detail}</p>}
          </>
        )}
        {boleta !== undefined && <p>Número de boleta: {boleta}</p>}
        <button type="button" className="purchase-primary" autoFocus onClick={onClose}>
          Ok entiendo
        </button>
      </div>
    </div>
  )
}
