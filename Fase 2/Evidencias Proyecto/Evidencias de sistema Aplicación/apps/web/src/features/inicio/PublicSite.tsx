import { useEffect, useState } from 'react'
import { NumerosEmergencia } from '@repo/ui/wireframe'

export type PublicView = 'inicio' | 'premium'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type PublicSiteProps = {
  view: PublicView
  isAuthenticated: boolean
  onNavigate: (view: PublicView) => void
  /** "Iniciar sesión" (sin sesión) o "Mi cuenta" (con sesión). */
  onAccount: () => void
  /** Solo se llama con sesión activa: abre el flujo de compra existente. */
  onBuy: () => void
}

/** Páginas públicas de EMERGEN: se ven sin iniciar sesión. */
export function PublicSite({ view, isAuthenticated, onNavigate, onAccount, onBuy }: PublicSiteProps) {
  return (
    <main className="public-page">
      <PublicNav isAuthenticated={isAuthenticated} onNavigate={onNavigate} onAccount={onAccount} />
      {view === 'premium' ? (
        <PremiumInfo isAuthenticated={isAuthenticated} onBuy={onBuy} onAccount={onAccount} />
      ) : (
        <Landing onNavigate={onNavigate} />
      )}
    </main>
  )
}

type PublicNavProps = Pick<PublicSiteProps, 'isAuthenticated' | 'onNavigate' | 'onAccount'>

function PublicNav({ isAuthenticated, onNavigate, onAccount }: PublicNavProps) {
  return (
    <nav className="purchase-nav public-nav" aria-label="EMERGEN">
      <button type="button" className="public-logo" onClick={() => onNavigate('inicio')}>
        EMERGEN
      </button>
      {/* Las secciones viven en la página de inicio; Landing hace scroll al hash al montarse. */}
      <a href="#como-funciona" onClick={() => onNavigate('inicio')}>¿Cómo funciona?</a>
      <a href="#descargar-app" onClick={() => onNavigate('inicio')}>Descargar App</a>
      <a href="#preguntas-frecuentes" onClick={() => onNavigate('inicio')}>Preguntas frecuentes</a>
      <button type="button" className="public-link" onClick={() => onNavigate('premium')}>
        Comprar Premium
      </button>
      <button type="button" className="purchase-primary" onClick={onAccount}>
        {isAuthenticated ? 'Mi cuenta' : 'Iniciar sesión'}
      </button>
    </nav>
  )
}

function Landing({ onNavigate }: Pick<PublicSiteProps, 'onNavigate'>) {
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <>
      <section className="public-hero">
        <div>
          <h1>EMERGEN</h1>
          <p className="public-subtitle">Ayuda rápida cuando más la necesitas.</p>
          <p>
            EMERGEN es una aplicación pensada para situaciones de emergencia: incidentes médicos,
            domésticos o accidentes urbanos. Complementa tu llamado de ayuda con información clave,
            como tu ubicación y tu contexto, para que el personal de rescate y tus contactos de
            emergencia sepan dónde estás y qué ocurre.
          </p>
          <div className="public-actions">
            <a className="purchase-primary" href="#como-funciona">Conoce cómo funciona</a>
            <button type="button" className="secondary-button" onClick={() => onNavigate('premium')}>
              Ver Premium
            </button>
          </div>
        </div>
        <ImagePlaceholder label="Imagen representativa de la aplicación" />
      </section>

      <section id="como-funciona" className="public-section">
        <h2>¿Cómo funciona?</h2>
        <ol>
          <li>Creas tu cuenta y registras a tus contactos de emergencia.</li>
          <li>Ante una emergencia, envías una alerta desde la app.</li>
          <li>La alerta incluye tu ubicación y datos relevantes para quienes deben ayudarte.</li>
        </ol>
      </section>

      {/* RF14 / HU-17: los números oficiales también se ven sin iniciar sesión. */}
      <NumerosEmergencia />

      <section id="descargar-app" className="public-section">
        <h2>Descargar App</h2>
        <p className="public-pending">Próximamente: enlaces de descarga para Android e iOS.</p>
      </section>

      <section id="preguntas-frecuentes" className="public-section">
        <h2>Preguntas frecuentes</h2>
        <p className="public-pending">Próximamente: preguntas frecuentes.</p>
      </section>
    </>
  )
}

type PremiumInfoProps = Pick<PublicSiteProps, 'isAuthenticated' | 'onBuy' | 'onAccount'>

const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

function PremiumInfo({ isAuthenticated, onBuy, onAccount }: PremiumInfoProps) {
  const [warning, setWarning] = useState(false)
  const [precios, setPrecios] = useState<{ precioUnitario: number; precioPlan: number } | null>(null)

  // GET /compras/precio es público; si falla, la página sigue sin mostrar el precio.
  useEffect(() => {
    fetch(`${API_URL}/compras/precio`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { precioUnitario: number; precioPlan: number } | null) => setPrecios(data))
      .catch(() => setPrecios(null))
  }, [])

  return (
    <section className="public-hero">
      <ImagePlaceholder label="Capturas de la aplicación" />
      <div className="purchase-card">
        <h1>Comprar cuenta Premium</h1>
        <p>Con Premium tu cuenta principal puede añadir cuentas apadrinadas para cuidar a otras personas:</p>
        <ul>
          <li>Hasta 5 cuentas apadrinadas asociadas a tu cuenta principal.</li>
          <li>Pago seguro con PayPal.</li>
        </ul>
        {precios !== null ? (
          <>
            <p>
              Valor de la cuenta Premium: <strong>{clp.format(precios.precioPlan)}</strong>
            </p>
            <p>
              Valor por cuenta apadrinada: <strong>{clp.format(precios.precioUnitario)}</strong>
            </p>
          </>
        ) : (
          <p className="public-pending">El precio vigente se muestra al continuar con la compra.</p>
        )}
        <button
          type="button"
          className="purchase-primary public-buy"
          onClick={() => (isAuthenticated ? onBuy() : setWarning(true))}
        >
          Comprar Premium
        </button>
      </div>
      {warning && <LoginRequiredModal onClose={() => setWarning(false)} onLogin={onAccount} />}
    </section>
  )
}

type LoginRequiredModalProps = {
  onClose: () => void
  onLogin?: () => void
}

/** Aviso al intentar comprar sin sesión. Solo informa: no toca la sesión ni redirige. */
export function LoginRequiredModal({ onClose, onLogin }: LoginRequiredModalProps) {
  return (
    <div className="purchase-overlay" onKeyDown={(event) => event.key === 'Escape' && onClose()}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="login-required-title"
        aria-describedby="login-required-text"
        className="purchase-modal purchase-modal--error"
      >
        <h2 id="login-required-title">Cuidado, inicia sesión antes</h2>
        <p id="login-required-text">
          Por tu seguridad, las compras solo se pueden realizar con una cuenta registrada e
          iniciada en la página. Así mantenemos tus datos protegidos.
        </p>
        <div className="public-modal-actions">
          <button type="button" className="purchase-primary" autoFocus onClick={onClose}>
            Ok, entiendo
          </button>
          {onLogin && (
            <button type="button" className="secondary-button" onClick={onLogin}>
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="public-image" role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  )
}
