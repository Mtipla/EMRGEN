import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { NumerosEmergencia } from '@repo/ui/wireframe'
import { internalFetch } from '../cuenta/session'
import type { PublicView } from './rutas'

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
  // Las vistas comparten el componente, así que el router no reinicia el scroll al cambiar de página.
  useEffect(() => {
    document.documentElement.scrollTop = 0
  }, [view])

  return (
    <main className="public-page">
      <PublicNav view={view} isAuthenticated={isAuthenticated} onNavigate={onNavigate} onAccount={onAccount} />
      {view === 'premium' ? (
        <PremiumInfo isAuthenticated={isAuthenticated} onBuy={onBuy} onAccount={onAccount} />
      ) : view === 'como-funciona' ? (
        <ComoFunciona onAccount={onAccount} isAuthenticated={isAuthenticated} />
      ) : view === 'descargar' ? (
        <Descargar onAccount={onAccount} isAuthenticated={isAuthenticated} />
      ) : view === 'preguntas' ? (
        <PreguntasFrecuentes onNavigate={onNavigate} />
      ) : (
        <Landing onNavigate={onNavigate} onAccount={onAccount} isAuthenticated={isAuthenticated} />
      )}
    </main>
  )
}

type PublicNavProps = Pick<PublicSiteProps, 'view' | 'isAuthenticated' | 'onNavigate' | 'onAccount'>

const SECCIONES: [PublicView, string][] = [
  ['como-funciona', '¿Cómo funciona?'],
  ['descargar', 'Descargar App'],
  ['preguntas', 'Preguntas frecuentes'],
  ['premium', 'Comprar Premium'],
]

function PublicNav({ view, isAuthenticated, onNavigate, onAccount }: PublicNavProps) {
  return (
    <nav className="purchase-nav public-nav" aria-label="EMERGEN">
      <button type="button" className="public-logo" onClick={() => onNavigate('inicio')}>
        EMERGEN
      </button>
      {SECCIONES.map(([destino, label]) => (
        <button
          key={destino}
          type="button"
          className="public-link"
          aria-current={view === destino ? 'page' : undefined}
          onClick={() => onNavigate(destino)}
        >
          {label}
        </button>
      ))}
      <button type="button" className="purchase-primary" onClick={onAccount}>
        {isAuthenticated ? 'Mi cuenta' : 'Iniciar sesión'}
      </button>
    </nav>
  )
}

/** Íconos de trazo simple; heredan el color del texto. */
const ICONOS: Record<string, ReactNode> = {
  alerta: <path d="M12 3 2 20h20L12 3Zm0 6v5m0 3v.5" />,
  ubicacion: <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  salud: <path d="M12 20s-8-4.8-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.2 12 20 12 20Zm0-9v5m-2.5-2.5h5" />,
  familia: <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9a6 6 0 0 1 12 0m1-9a3 3 0 1 0 0-6m2 15h3a5 5 0 0 0-4-5" />,
}

function Icono({ nombre }: { nombre: keyof typeof ICONOS }) {
  return (
    <span className="public-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {ICONOS[nombre]}
      </svg>
    </span>
  )
}

/** Finalidades del Acta de constitución: definen qué se envía en cada alerta. */
const TIPOS_EMERGENCIA = [
  { nombre: 'Urbano', detalle: 'Robos, asaltos o accidentes en la vía pública. Envía tu ubicación y tu mensaje personalizado.' },
  { nombre: 'Emergencia', detalle: 'Incidentes domésticos o situaciones de riesgo general. Envía tu ubicación y tu mensaje personalizado.' },
  { nombre: 'Médico', detalle: 'Crisis de salud. Además de tu ubicación y tu mensaje, envía los antecedentes médicos que registraste.' },
  { nombre: 'Adulto mayor', detalle: 'Ubicación, mensaje y antecedentes médicos, con una configuración de la app móvil simplificada.' },
]

type LandingProps = Pick<PublicSiteProps, 'onNavigate' | 'onAccount' | 'isAuthenticated'>

function Landing({ onNavigate, onAccount, isAuthenticated }: LandingProps) {
  return (
    <>
      <section className="public-banner">
        <div>
          <p className="public-eyebrow">Tu red de ayuda, a un botón de distancia</p>
          <h1>Cuando cada segundo cuenta, EMERGEN avisa por ti.</h1>
          <p>
            Ante un incidente médico, doméstico o un accidente urbano, envía con un solo gesto tu
            ubicación, tu mensaje y tus antecedentes médicos a las personas que pueden ayudarte.
          </p>
          <div className="public-actions">
            <button type="button" className="purchase-primary" onClick={onAccount}>
              {isAuthenticated ? 'Ir a mi cuenta' : 'Crear mi cuenta'}
            </button>
            <button type="button" className="public-ghost" onClick={() => onNavigate('como-funciona')}>
              Conoce cómo funciona
            </button>
          </div>
        </div>
        <TelefonoSos />
      </section>

      <ul className="public-stats" aria-label="EMERGEN en cifras">
        <li><strong>1 botón</strong><span>para avisar a toda tu red</span></li>
        <li><strong>5</strong><span>contactos de emergencia por perfil</span></li>
        <li><strong>5</strong><span>cuentas apadrinadas con Premium</span></li>
        <li><strong>24 h</strong><span>y la alerta se cierra sola</span></li>
      </ul>

      <section className="public-section">
        <h2>¿Por qué EMERGEN?</h2>
        <p>
          Las funciones de emergencia de los teléfonos solo avisan a personas específicas, sin entregar
          los detalles necesarios para ayudarte. Además, si te roban el equipo, su rastreo deja de
          indicar dónde ocurrió el incidente. EMERGEN envía, en el momento de la alerta, la ubicación
          desde donde la generaste junto con todo lo que tu red necesita saber.
        </p>
        <div className="public-grid">
          <article className="public-card">
            <Icono nombre="alerta" />
            <h3>Alerta en segundos</h3>
            <p>Un botón SOS en la app móvil avisa por WhatsApp a todos tus contactos de emergencia.</p>
          </article>
          <article className="public-card">
            <Icono nombre="ubicacion" />
            <h3>Ubicación del incidente</h3>
            <p>La alerta adjunta la ubicación del dispositivo al momento de activarla.</p>
          </article>
          <article className="public-card">
            <Icono nombre="salud" />
            <h3>Tu información, tu decisión</h3>
            <p>Solo se envían los antecedentes médicos que tú registras, guardados de forma cifrada.</p>
          </article>
          <article className="public-card">
            <Icono nombre="familia" />
            <h3>Cuida a los tuyos</h3>
            <p>Con Premium compartes tu cuenta con hasta 5 personas, cada una con su propio perfil.</p>
          </article>
        </div>
      </section>

      <section className="public-section">
        <h2>Tipos de emergencia</h2>
        <p>Configura la finalidad de tu perfil según tu situación; cada tipo envía la información que corresponde.</p>
        <TiposEmergencia />
      </section>

      {/* RF14 / HU-17: los números oficiales también se ven sin iniciar sesión. */}
      <NumerosEmergencia />

      <section className="public-cta">
        <h2>Prepárate hoy, antes de necesitarlo.</h2>
        <p>Crear tu cuenta y configurar tus contactos toma solo unos minutos.</p>
        <div className="public-actions">
          <button type="button" className="purchase-primary" onClick={onAccount}>
            {isAuthenticated ? 'Ir a mi cuenta' : 'Empezar ahora'}
          </button>
          <button type="button" className="public-ghost" onClick={() => onNavigate('premium')}>
            Ver Premium
          </button>
        </div>
      </section>
    </>
  )
}

/** Ilustración de la app móvil: el botón SOS en un teléfono (solo decorativa). */
function TelefonoSos() {
  return (
    <div className="public-phone" role="img" aria-label="Pantalla de la app móvil con el botón SOS">
      <span className="public-phone__label">Alerta rápida</span>
      <span className="public-phone__sos">SOS</span>
      <span className="public-phone__hint">Tu ubicación y tu mensaje se envían a tus contactos</span>
    </div>
  )
}

function TiposEmergencia() {
  return (
    <div className="public-grid">
      {TIPOS_EMERGENCIA.map((tipo) => (
        <article key={tipo.nombre} className="public-card">
          <h3>{tipo.nombre}</h3>
          <p>{tipo.detalle}</p>
        </article>
      ))}
    </div>
  )
}

/** Explicación de la cuenta compartida; se usa en Cómo funciona y en Premium. */
function CuentaCompartida() {
  return (
    <>
      <p>
        Una cuenta Premium funciona como una cuenta compartida con perfiles: tú, el titular, compartes
        tu cuenta con hasta 5 personas que dependen de ti, como adultos mayores o hijos. Funciona
        igual que los servicios de streaming que permiten varios perfiles en una misma suscripción.
      </p>
      <ol className="public-steps">
        <li>
          <h3>Un solo correo y una sola contraseña</h3>
          <p>
            Las cuentas apadrinadas no tienen credenciales propias: todos ingresan con el correo y la
            contraseña de la cuenta principal.
          </p>
        </li>
        <li>
          <h3>Cada persona elige su perfil</h3>
          <p>
            Después de ingresar, EMERGEN pregunta «¿Quién eres?». Cada uno elige su perfil y lo abre
            con su propio PIN de 4 dígitos, que lo protege del resto.
          </p>
        </li>
        <li>
          <h3>Todo es personal dentro del perfil</h3>
          <p>
            Cada perfil tiene su finalidad, sus contactos de emergencia (hasta 5), su mensaje, su
            ficha médica y su historial de alertas. Lo que envía un perfil no se mezcla con el de otro.
          </p>
        </li>
        <li>
          <h3>Tú decides el nivel de acceso</h3>
          <p>
            Con acceso completo, la persona administra su perfil. Con acceso parcial, puede enviar su
            alerta SOS con el mensaje configurado, pero los cambios necesitan la autorización de la
            cuenta principal.
          </p>
        </li>
      </ol>
    </>
  )
}

type CuentaProps = Pick<PublicSiteProps, 'isAuthenticated' | 'onAccount'>

function ComoFunciona({ isAuthenticated, onAccount }: CuentaProps) {
  return (
    <>
      <section className="public-section public-section--first">
        <h1>¿Cómo funciona?</h1>
        <p className="public-subtitle">Prepárate una vez y pide ayuda con un solo gesto.</p>
        <ol className="public-steps">
          <li>
            <h3>Crea tu cuenta</h3>
            <p>
              Regístrate con tu nombre, correo y contraseña. En el primer ingreso defines un PIN de 4
              dígitos, que protege tu perfil y las acciones sensibles de tu cuenta.
            </p>
          </li>
          <li>
            <h3>Configura tu perfil de emergencia</h3>
            <p>
              Elige la finalidad de tu perfil (Urbano, Emergencia, Médico o Adulto mayor), registra
              entre 1 y 5 contactos de emergencia, escribe tu mensaje de auxilio (hasta 160
              caracteres) y, si quieres, completa tu ficha médica.
            </p>
          </li>
          <li>
            <h3>Activa el SOS desde la app móvil</h3>
            <p>
              Ante una emergencia, presiona el botón SOS y elige el tipo de emergencia. EMERGEN
              registra la alerta y avisa por WhatsApp a cada uno de tus contactos con tu mensaje, tu
              ubicación y los antecedentes médicos que registraste.
            </p>
          </li>
          <li>
            <h3>Finaliza la alerta</h3>
            <p>
              Cuando la situación termine, cierra la alerta desde el apartado Alertas con tu PIN. Tus
              contactos reciben un aviso de cierre. Si no la cierras, la alerta finaliza sola a las 24
              horas.
            </p>
          </li>
        </ol>
        <div className="public-actions">
          <button type="button" className="purchase-primary" onClick={onAccount}>
            {isAuthenticated ? 'Ir a mi cuenta' : 'Crear mi cuenta'}
          </button>
        </div>
      </section>

      <section className="public-section">
        <h2>¿Qué reciben tus contactos?</h2>
        <ul>
          <li>Tu mensaje de emergencia personalizado, o uno predeterminado si no lo configuraste.</li>
          <li>Un punto de ubicación en el mapa. Si no se pudo obtener, la alerta se envía igual, sin ella.</li>
          <li>
            Los antecedentes médicos que tú registraste: tipo de sangre, alergias, enfermedades
            crónicas, medicamentos actuales, discapacidad y si eres donante.
          </li>
          <li>Un aviso de cierre cuando la emergencia finaliza.</li>
        </ul>
      </section>

      <section className="public-section">
        <h2>Tipos de emergencia</h2>
        <TiposEmergencia />
      </section>

      <section className="public-section">
        <h2>Cuentas apadrinadas: una cuenta, varios perfiles</h2>
        <CuentaCompartida />
      </section>

      <section className="public-section">
        <h2>Tu información, protegida</h2>
        <ul>
          <li>Tu ficha médica se guarda cifrada y solo viaja en los mensajes de una alerta.</li>
          <li>
            EMERGEN no consulta fichas de hospitales ni centros de salud: solo envía lo que tú escribes
            en tu perfil.
          </li>
          <li>Cada perfil ve únicamente sus propios datos, y la cuenta principal los de sus apadrinados.</li>
          <li>El acceso a cada función se valida en el servidor según tu rol.</li>
          <li>Tratamos tus datos de salud conforme a la Ley 21.719 de protección de datos personales.</li>
        </ul>
      </section>
    </>
  )
}

function Descargar({ isAuthenticated, onAccount }: CuentaProps) {
  return (
    <>
      <section className="public-section public-section--first">
        <h1>Descargar App</h1>
        <p className="public-subtitle">EMERGEN te acompaña en el teléfono y en el navegador.</p>
        <div className="public-grid">
          <article className="public-card">
            <h3>App móvil</h3>
            <p>
              Es donde activas el botón SOS. Desde ella también revisas y finalizas tus alertas,
              ingresas con tu PIN y ves los números de emergencia.
            </p>
            <p className="public-pending">Próximamente en Android e iOS.</p>
          </article>
          <article className="public-card">
            <h3>Sitio web</h3>
            <p>
              Administra tu perfil, tus contactos, tu ficha médica y tus cuentas apadrinadas.
              Compra Premium y solicita soporte si tienes algún problema.
            </p>
            <button type="button" className="secondary-button" onClick={onAccount}>
              {isAuthenticated ? 'Ir a mi cuenta' : 'Iniciar sesión'}
            </button>
          </article>
        </div>
      </section>

      <section className="public-section">
        <h2>Antes de usar la app móvil</h2>
        <ul>
          <li>Crea tu cuenta y tu PIN; puedes hacerlo desde este sitio.</li>
          <li>Registra al menos un contacto de emergencia con un número que use WhatsApp.</li>
          <li>Concede el permiso de ubicación para que tus alertas indiquen dónde estás.</li>
          <li>Mantén una conexión a internet activa: las alertas se envían en línea.</li>
        </ul>
      </section>
    </>
  )
}

const PREGUNTAS: { pregunta: string; respuesta: ReactNode }[] = [
  {
    pregunta: '¿Qué es EMERGEN?',
    respuesta:
      'Una aplicación que, ante una emergencia, avisa a tus contactos de confianza con tu mensaje, tu ubicación y tus antecedentes médicos, para que puedan ayudarte más rápido.',
  },
  {
    pregunta: '¿EMERGEN reemplaza a los números de emergencia?',
    respuesta:
      'No. EMERGEN complementa el llamado a los servicios públicos. Si tu vida está en riesgo, llama al 131 (Ambulancia), 132 (Bomberos) o 133 (Carabineros); los tienes siempre a mano en la app y en este sitio.',
  },
  {
    pregunta: '¿Cómo reciben la alerta mis contactos?',
    respuesta:
      'Por WhatsApp. Cada contacto recibe tu mensaje, tu ubicación en el mapa y tus antecedentes médicos, y luego un aviso cuando la alerta finaliza.',
  },
  {
    pregunta: '¿Cuántos contactos de emergencia puedo registrar?',
    respuesta:
      'Necesitas al menos 1 y puedes registrar hasta 5. Cada perfil apadrinado tiene su propio límite de 5 contactos.',
  },
  {
    pregunta: '¿Qué pasa si la app no consigue mi ubicación?',
    respuesta: 'La alerta se envía igual con tu mensaje y tus antecedentes, sin la ubicación, y la app te avisa del problema.',
  },
  {
    pregunta: '¿Cómo finalizo una alerta?',
    respuesta:
      'Desde el apartado Alertas de la app, ingresando tu PIN. Tus contactos reciben un aviso de cierre. Si no la finalizas, se cierra sola a las 24 horas.',
  },
  {
    pregunta: '¿Para qué sirve el PIN?',
    respuesta:
      'Es un código de 4 dígitos que creas en tu primer ingreso. Abre tu perfil y confirma acciones sensibles, como finalizar una alerta. En una cuenta compartida es lo que separa tu perfil del de los demás.',
  },
  {
    pregunta: '¿Qué es una cuenta apadrinada?',
    respuesta:
      'Es un perfil dentro de tu cuenta principal para una persona que depende de ti. Funciona como una cuenta compartida con perfiles: todos ingresan con el mismo correo y contraseña, y luego cada persona elige su perfil y lo abre con su propio PIN. Con Premium puedes tener hasta 5 y definir si cada una tiene acceso completo o parcial.',
  },
  {
    pregunta: 'Si apadrino a otras personas, ¿debo cambiar mi contraseña?',
    respuesta: (
      <>
        Te lo recomendamos. Al apadrinar, todas las personas de tu cuenta compartirán el mismo correo
        electrónico y la misma contraseña, así que trátalos como datos de toda la cuenta:
        <ul>
          <li>Antes de compartirla, cambia tu contraseña por una nueva que no uses en otros servicios, como tu correo personal o tu banco.</li>
          <li>Cámbiala también cuando quites a una persona de tu cuenta.</li>
          <li>Pide a cada apadrinado que no comparta su PIN: es lo único que protege su perfil del resto.</li>
        </ul>
      </>
    ),
  },
  {
    pregunta: '¿Quién verifica mi información médica?',
    respuesta: (
      <>
        Nadie: la información médica es responsabilidad de cada usuario. EMERGEN no verifica
        antecedentes ni consulta fichas de hospitales o centros de salud. Por eso:
        <ul>
          <li>Revisa que lo que registras sea correcto y esté actualizado.</li>
          <li>
            EMERGEN no obtiene ni envía otra información privada tuya: tus contactos solo reciben lo
            que tú decidas escribir en tu ficha.
          </li>
          <li>Todos los campos de la ficha médica son opcionales.</li>
        </ul>
      </>
    ),
  },
  {
    pregunta: '¿Quién puede ver mi información médica?',
    respuesta:
      'Tu ficha médica se guarda cifrada. Solo se incluye en los mensajes que reciben tus contactos de emergencia cuando envías una alerta.',
  },
  {
    pregunta: '¿Cómo compro Premium?',
    respuesta:
      'Inicia sesión y entra a Comprar Premium. El pago se realiza con PayPal; el precio se muestra en pesos chilenos y se convierte a dólares al pagar.',
  },
  {
    pregunta: '¿Cómo pido ayuda si tengo un problema con la app?',
    respuesta:
      'Si tienes cuenta, inicia sesión y abre Solicitar soporte en el menú. Si aún no tienes cuenta, envíanos tu pregunta con el formulario de esta página.',
  },
]

function PreguntasFrecuentes({ onNavigate }: Pick<PublicSiteProps, 'onNavigate'>) {
  return (
    <>
      <section className="public-section public-section--first">
        <h1>Preguntas frecuentes</h1>
        <div className="public-faq">
          {PREGUNTAS.map(({ pregunta, respuesta }) => (
            <details key={pregunta}>
              <summary>{pregunta}</summary>
              <div>{respuesta}</div>
            </details>
          ))}
        </div>
        <div className="public-actions">
          <button type="button" className="secondary-button" onClick={() => onNavigate('como-funciona')}>
            Ver cómo funciona
          </button>
        </div>
      </section>
      <PreguntaVisitante />
    </>
  )
}

/** Etiquetas de TIPO_CONTACTO para el visitante. */
const TIPOS_CONTACTO: Record<string, string> = { CONSULTA: 'Consulta', SUGERENCIA: 'Sugerencia', RECLAMO: 'Reclamo' }

/** Contacto sin sesión: guarda en MENSAJE_CONTACTO (POST /internal/v1/mensajes-contacto); el personal responde desde su panel. */
function PreguntaVisitante() {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [ticket, setTicket] = useState<number | null>(null)
  const [tipos, setTipos] = useState<{ id: number; nombre: string }[]>([])

  // Catálogo público; sin él no se puede enviar (el tipo es obligatorio en la tabla).
  useEffect(() => {
    internalFetch<{ id: number; nombre: string }[]>('/mensajes-contacto/tipos').then(setTipos, () =>
      setError('No pudimos cargar el formulario. Inténtalo más tarde.'),
    )
  }, [])

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const { tipo_id, ...datos } = Object.fromEntries(new FormData(form))
    setEnviando(true)
    setError('')
    try {
      const creado = await internalFetch<{ mensaje_contacto_id: number }>('/mensajes-contacto', {
        method: 'POST',
        body: JSON.stringify({ ...datos, tipo_id: Number(tipo_id) }),
      })
      setTicket(creado.mensaje_contacto_id)
      form.reset()
    } catch (causa) {
      setError((causa as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="public-section">
      <h2>¿No encontraste tu respuesta?</h2>
      <p>
        Escríbenos aunque no tengas cuenta: una consulta, una sugerencia o un reclamo. Tu mensaje llega a nuestro equipo de soporte, que te
        contactará al correo que indiques.
      </p>
      <form className="public-form" onSubmit={enviar}>
        <label className="auth-field">
          <span>Nombre</span>
          <input name="nombre" autoComplete="name" maxLength={100} required />
        </label>
        <label className="auth-field">
          <span>Correo electrónico</span>
          <input name="correo" type="email" autoComplete="email" maxLength={100} required />
        </label>
        <label className="auth-field public-form__full">
          <span>Tipo de mensaje</span>
          <select
            name="tipo_id"
            key={tipos.length}
            defaultValue={tipos.find((t) => t.nombre === 'CONSULTA')?.id}
            required
          >
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {TIPOS_CONTACTO[t.nombre] ?? t.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="auth-field public-form__full">
          <span>Tu mensaje</span>
          <textarea name="mensaje" rows={4} maxLength={500} required />
        </label>
        {error && <p role="alert" className="form-message failure public-form__full">{error}</p>}
        {ticket !== null && (
          <p role="status" className="form-message success public-form__full">
            ¡Gracias! Recibimos tu mensaje (N.º {ticket}). Te responderemos a tu correo.
          </p>
        )}
        <button type="submit" className="purchase-primary" disabled={enviando || tipos.length === 0}>
          {enviando ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </form>
    </section>
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

  const comprar = () => (isAuthenticated ? onBuy() : setWarning(true))

  return (
    <>
      <section className="public-hero">
        <div>
          <p className="public-eyebrow public-eyebrow--accent">EMERGEN Premium</p>
          <h1>Protege a toda tu familia desde una sola cuenta.</h1>
          <p>
            Premium convierte tu cuenta en una cuenta compartida: suma hasta 5 perfiles para las
            personas que cuidas, cada uno con su propio PIN, sus contactos y su ficha médica.
          </p>
        </div>
        <div className="purchase-card">
          <h2>Cuenta Premium</h2>
          {precios !== null ? (
            <>
              <p>
                Valor de la cuenta Premium: <strong className="public-price">{clp.format(precios.precioPlan)}</strong>
              </p>
              <p>
                Valor por cuenta apadrinada: <strong>{clp.format(precios.precioUnitario)}</strong>
              </p>
            </>
          ) : (
            <p className="public-pending">El precio vigente se muestra al continuar con la compra.</p>
          )}
          <ul>
            <li>Hasta 5 cuentas apadrinadas.</li>
            <li>Pago seguro con PayPal.</li>
            <li>Amplía tus cupos cuando lo necesites.</li>
          </ul>
          <button type="button" className="purchase-primary public-buy" onClick={comprar}>
            Comprar Premium
          </button>
        </div>
      </section>

      <section className="public-section">
        <h2>Qué incluye</h2>
        <div className="public-grid">
          <article className="public-card">
            <Icono nombre="familia" />
            <h3>Hasta 5 perfiles apadrinados</h3>
            <p>Agrega a adultos mayores, hijos u otras personas que dependen de ti, dentro de tu misma cuenta.</p>
          </article>
          <article className="public-card">
            <Icono nombre="alerta" />
            <h3>SOS propio para cada perfil</h3>
            <p>
              Cada perfil tiene su finalidad, su mensaje y hasta 5 contactos de emergencia. Su alerta
              llega a su red, no a la tuya.
            </p>
          </article>
          <article className="public-card">
            <Icono nombre="salud" />
            <h3>Ficha médica por perfil</h3>
            <p>Registra los antecedentes de cada persona para que sus contactos los reciban en una emergencia.</p>
          </article>
          <article className="public-card">
            <Icono nombre="ubicacion" />
            <h3>Control e informes</h3>
            <p>
              Define el acceso completo o parcial de cada perfil y genera informes con el historial de
              alertas de tus apadrinados.
            </p>
          </article>
        </div>
      </section>

      <section className="public-section">
        <h2>Cómo funciona la cuenta compartida</h2>
        <CuentaCompartida />
        <p className="public-note">
          Recuerda: todos los perfiles ingresan con tu correo y tu contraseña. Antes de compartirlos,
          cámbiala por una contraseña nueva que no uses en otros servicios.
        </p>
      </section>

      <section className="public-section">
        <h2>Beneficios</h2>
        <ul>
          <li>Una sola cuenta y un solo pago para proteger a toda tu familia.</li>
          <li>Ayudas a quienes cuidas aunque no sepan configurar la app: tú preparas su perfil.</li>
          <li>Con acceso parcial, un adulto mayor puede pedir ayuda sin riesgo de cambiar su configuración por error.</li>
          <li>Cada perfil mantiene su privacidad con su propio PIN.</li>
          <li>Sabes cuándo y desde dónde pidieron ayuda gracias al historial de alertas.</li>
        </ul>
      </section>

      <section className="public-section">
        <h2>Cómo comprar</h2>
        <ol className="public-steps">
          <li><h3>Inicia sesión con tu cuenta principal</h3><p>Por seguridad, solo se puede comprar con sesión iniciada.</p></li>
          <li><h3>Elige Premium o más cupos</h3><p>Revisa el resumen de la compra con el precio en pesos chilenos.</p></li>
          <li><h3>Paga con PayPal</h3><p>El monto se convierte a dólares al momento del pago. Tus perfiles se habilitan al confirmarse.</p></li>
        </ol>
        <div className="public-actions">
          <button type="button" className="purchase-primary" onClick={comprar}>
            Comprar Premium
          </button>
        </div>
      </section>
      {warning && <LoginRequiredModal onClose={() => setWarning(false)} onLogin={onAccount} />}
    </>
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
