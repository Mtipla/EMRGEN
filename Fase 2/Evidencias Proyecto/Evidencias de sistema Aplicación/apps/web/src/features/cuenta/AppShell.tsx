import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ETIQUETA_PERFIL, MENSAJE_BLOQUEO, perfilDe, visible, type Accion, type Bloqueo } from '@repo/ui/permisos'
import type { AuthenticatedUser } from '../auth/AuthForm'
import '@repo/ui/wireframe' // carga los estilos wf-* compartidos

type AppShellProps = {
  user: AuthenticatedUser
  onLogout: () => void
  children: ReactNode
}

/** Entradas del menú de usuario de los wireframes, filtradas por la matriz de permisos. */
const MENU: { to: string; label: string; accion: Accion }[] = [
  { to: '/perfil', label: 'Modificar usuario', accion: 'perfil.editar' },
  { to: '/cuentas', label: 'Administrar cuentas', accion: 'cuentas.apadrinadas' },
  { to: '/administracion/cuentas', label: 'Administrar cuentas', accion: 'admin.cuentas.ver' },
  { to: '/administracion/compras', label: 'Administrar compras', accion: 'admin.compras.ver' },
  { to: '/administracion/trabajadores', label: 'Administrar trabajadores', accion: 'admin.trabajadores' },
  { to: '/administracion/tickets', label: 'Administrar Tickets de soporte', accion: 'soporte.gestionarTickets' },
  { to: '/administracion/alertas', label: 'Alertas', accion: 'alertas.verTodas' },
  { to: '/soporte', label: 'Solicitar soporte', accion: 'soporte.solicitar' },
]

/** Cabecera EMERGEN con el menú de usuario; el backend sigue siendo quien autoriza cada acción. */
export function AppShell({ user, onLogout, children }: AppShellProps) {
  const perfil = perfilDe(user)
  const [open, setOpen] = useState(false)
  const enlaces = (
    <>
      <Link to="/#como-funciona">¿Cómo funciona?</Link>
      <Link to="/#descargar-app">Descargar App</Link>
      <Link to="/#preguntas-frecuentes">Preguntas frecuentes</Link>
      {visible(user, 'compras.comprar') && (
        <Link to={user.plan_efectivo ? '/comprar' : '/premium'}>
          {user.plan_efectivo ? 'Comprar cupos de cuentas' : 'Comprar Premium'}
        </Link>
      )}
    </>
  )

  return (
    <div className="wf-shell">
      <header className="wf-header">
        <Link to="/inicio" className="wf-brand">EMERGEN</Link>
        {/* En pantallas angostas estos enlaces pasan al menú de usuario (wireframe.css). */}
        <nav className="wf-header-links" aria-label="Secciones">{enlaces}</nav>

        <div className="wf-menu">
          <button type="button" className="wf-link" aria-expanded={open} onClick={() => setOpen(!open)}>
            👤 {user.nombre_usuario} ▾
          </button>
          {open && (
            <nav className="wf-menu-list" aria-label="Menú de usuario" onClick={() => setOpen(false)}>
              <span className="wf-muted">{perfil ? ETIQUETA_PERFIL[perfil] : 'Perfil sin rol (vuelve a iniciar sesión)'}</span>
              <div className="wf-menu-secciones">{enlaces}</div>
              {/* Mockup pág. 29: sin Premium no aparece "Administrar cuentas". */}
              {MENU.filter((item) => visible(user, item.accion) &&
                (perfil !== 'SOPORTE' || item.to.startsWith('/administracion/'))).map((item) => (
                <Link key={item.to} to={item.to}>{item.label}</Link>
              ))}
              {perfil === 'ADMINISTRADOR' && <Link to="/usuarios">Usuarios registrados</Link>}
              <button type="button" className="wf-link" onClick={onLogout}>Cerrar sesión</button>
            </nav>
          )}
        </div>
      </header>
      {children}
    </div>
  )
}

/** Página para un perfil sin permiso en la UI. El backend rechaza igual la llamada (403/409). */
export function SinPermiso({ motivo = 'permiso' }: { motivo?: Bloqueo }) {
  return (
    <section className="wf-card">
      <h1>{motivo === 'premium' ? 'Requiere Premium' : 'Sin permisos'}</h1>
      <p>{motivo === 'permiso' ? 'Tu perfil no tiene acceso a esta sección.' : MENSAJE_BLOQUEO[motivo]}</p>
      <Link className="wf-button" to="/inicio">Volver al inicio</Link>
    </section>
  )
}
