
import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'

import { AuthForm, type AuthenticatedUser } from './features/auth/AuthForm'
import { PinSetupForm } from './features/auth/PinSetupForm'
import { UsersAdmin } from './features/auth/UsersAdmin'
import { PremiumPurchase } from './features/compra/PremiumPurchase'
import { PublicSite, type PublicView } from './features/inicio/PublicSite'
import { bloqueo, perfilDe, type Accion } from '@repo/ui/permisos'
import { avisar, Avisos } from '@repo/ui/avisos'
import { AppShell, SinPermiso } from './features/cuenta/AppShell'
import { AccountsPage, HomePage, ProfilePage, SoportePage } from './features/cuenta/CuentaPages'
import {
  AdminAlertasPage,
  AdminComprasPage,
  AdminCuentasPage,
  AdminTicketsPage,
  AdminTrabajadoresPage,
} from './features/administracion/AdminPages'

const savedUser = localStorage.getItem('emergen.user')
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function App() {
  const navigate = useNavigate()

  const [user, setUser] = useState<AuthenticatedUser | null>(() => {
    if (!savedUser) return null

    try {
      return JSON.parse(savedUser) as AuthenticatedUser
    } catch {
      localStorage.removeItem('emergen.user')
      localStorage.removeItem('emergen.token')
      return null
    }
  })

  const [checkingSession, setCheckingSession] = useState(Boolean(savedUser))

  useEffect(() => {
    const token = localStorage.getItem('emergen.token')

    if (!token) {
      setUser(null)
      setCheckingSession(false)
      return
    }

    async function refreshSession() {
      try {
        const response = await fetch(`${API_URL}/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error('La sesión expiró')

        const currentUser = (await response.json()) as AuthenticatedUser

        localStorage.setItem('emergen.user', JSON.stringify(currentUser))
        setUser(currentUser)
      } catch {
        localStorage.removeItem('emergen.user')
        localStorage.removeItem('emergen.token')
        setUser(null)
        avisar('info', 'Tu sesión expiró. Vuelve a iniciar sesión.')
      } finally {
        setCheckingSession(false)
      }
    }

    void refreshSession()
  }, [])

  const hasSession = user !== null && !user.requiere_pin

  async function refreshPurchasedUser() {
    const token = localStorage.getItem('emergen.token')
    try {
      const response = await fetch(`${API_URL}/usuarios/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('No se pudo actualizar la cuenta')
      const currentUser = (await response.json()) as AuthenticatedUser
      localStorage.setItem('emergen.user', JSON.stringify(currentUser))
      setUser(currentUser)
    } catch {
      avisar('info', 'El pago se confirmó. Recarga la página para actualizar el estado de tu cuenta.')
    }
  }

  function closeSession() {
    localStorage.removeItem('emergen.user')
    localStorage.removeItem('emergen.token')
    setUser(null)
    navigate('/login')
    avisar('info', 'Cerraste tu sesión.')
  }

  function handleAuthenticated(authenticatedUser: AuthenticatedUser) {
    setUser(authenticatedUser)
    avisar(
      authenticatedUser.requiere_pin ? 'info' : 'exito',
      authenticatedUser.requiere_pin
        ? 'Último paso: crea tu PIN de 4 dígitos.'
        : `Bienvenido, ${authenticatedUser.nombre_usuario}.`,
    )

    navigate(
      authenticatedUser.requiere_pin ? '/login' : '/inicio',
      { replace: true },
    )
  }

  function handlePinCreated() {
    if (!user) return

    const updatedUser = { ...user, requiere_pin: false }

    localStorage.setItem('emergen.user', JSON.stringify(updatedUser))
    setUser(updatedUser)
    navigate('/inicio', { replace: true })
    avisar('exito', 'PIN creado. Tu cuenta ya está lista.')
  }

  function renderPublicSite(view: PublicView) {
    return (
      <PublicSite
        view={view}
        isAuthenticated={user !== null}
        onNavigate={(next) => navigate(next === 'premium' ? '/premium' : '/')}
        onAccount={() => navigate(user ? '/inicio' : '/login')}
        onBuy={() => navigate(hasSession ? '/comprar' : '/login')}
      />
    )
  }

  const perfil = user && perfilDe(user)
  // El menú del Trabajador (mockup pág. 11) no incluye compra Premium ni el panel /usuarios.
  const esSoporte = perfil === 'SOPORTE'
  // El apadrinado usa el plan de su principal: POST /compras/apadrinados/ordenes le responde 403.
  const sinCompra = esSoporte || perfil === 'APADRINADO'

  /** Páginas de los wireframes: exigen sesión con PIN y, si se indica, un permiso de la matriz (rol, acceso y Premium). */
  function privatePage(page: ReactNode, accion?: Accion) {
    if (!user || !hasSession) return <Navigate to="/login" replace />
    const motivo = accion ? bloqueo(user, accion) : null
    return (
      <AppShell user={user} onLogout={closeSession}>
        {motivo ? <SinPermiso motivo={motivo} /> : page}
      </AppShell>
    )
  }

  if (checkingSession) {
    // <Avisos /> en la misma posición que abajo: sigue montado y muestra "sesión expirada".
    return (
      <>
        <Avisos />
        <main>Verificando sesión…</main>
      </>
    )
  }

  return (
    <>
    <Avisos />
    <Routes>
      {/* Páginas públicas */}
      <Route path="/" element={renderPublicSite('inicio')} />
      <Route path="/premium" element={renderPublicSite('premium')} />

      {/* Inicio de sesión o configuración del PIN */}
      <Route
        path="/login"
        element={
          user ? (
            user.requiere_pin ? (
              <main className="auth-page">
                <PinSetupForm
                  user={user}
                  onLogout={closeSession}
                  onPinCreated={handlePinCreated}
                />
              </main>
            ) : (
              <Navigate to="/inicio" replace />
            )
          ) : (
            <main className="auth-page">
              <button type="button" className="secondary-button" onClick={() => navigate('/')}>
                Volver al inicio
              </button>
              <AuthForm onAuthenticated={handleAuthenticated} />
            </main>
          )
        }
      />

      {/* Panel de administración protegido por sesión */}
      <Route
        path="/usuarios"
        element={
          // CA-13.1: solo ADMINISTRADOR, igual que el enlace del menú y GET /usuarios (@Roles).
          // No usa 'admin.cuentas.ver': esa acción también admite SOPORTE.
          user && hasSession && perfil !== 'ADMINISTRADOR' ? (
            privatePage(<SinPermiso />)
          ) : user && hasSession ? (
            <main className="auth-page">
              <button type="button" className="secondary-button" onClick={() => navigate('/')}>
                Ir al inicio
              </button>
              <button type="button" className="primary-button" onClick={() => navigate('/comprar')}>
                Comprar Cuenta Premium
              </button>
              <UsersAdmin
                user={user}
                onLogout={closeSession}
                onUserUpdated={setUser}
              />
            </main>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Compra de Cuenta Premium con PayPal (requiere sesión) */}
      <Route
        path="/comprar"
        element={
          sinCompra ? (
            privatePage(<SinPermiso />)
          ) : hasSession ? (
            <main className="auth-page">
              <PremiumPurchase onClose={() => navigate('/inicio')} onPurchased={refreshPurchasedUser} />
            </main>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Wireframes: home, perfil y cuentas del usuario; administración (rol Administrador en backend) */}
      <Route path="/inicio" element={privatePage(esSoporte ? <Navigate to="/administracion/cuentas" replace /> : user && <HomePage user={user} />)} />
      <Route
        path="/perfil"
        element={privatePage(user && <ProfilePage user={user} onUserUpdated={setUser} />)}
      />
      <Route path="/cuentas" element={privatePage(<AccountsPage />, 'cuentas.apadrinadas')} />
      <Route path="/soporte" element={privatePage(<SoportePage />, 'soporte.solicitar')} />
      <Route
        path="/administracion/cuentas"
        element={privatePage(<AdminCuentasPage perfil={perfil} />, 'admin.cuentas.ver')}
      />
      <Route
        path="/administracion/compras"
        element={privatePage(<AdminComprasPage />, 'admin.compras.ver')}
      />
      <Route
        path="/administracion/trabajadores"
        element={privatePage(<AdminTrabajadoresPage />, 'admin.trabajadores')}
      />
      <Route
        path="/administracion/tickets"
        element={privatePage(<AdminTicketsPage />, 'soporte.gestionarTickets')}
      />
      <Route path="/administracion/alertas" element={privatePage(<AdminAlertasPage />, 'alertas.verTodas')} />

      {/* Redirigir rutas inexistentes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default App
