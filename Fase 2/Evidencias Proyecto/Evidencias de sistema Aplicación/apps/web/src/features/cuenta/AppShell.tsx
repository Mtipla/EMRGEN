import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ETIQUETA_PERFIL, perfilDe, puede, type Accion } from '@repo/ui/permisos'
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
  { to: '/administracion/cuentas', label: 'Administrar cuentas de usuarios', accion: 'admin.cuentas.ver' },
  { to: '/administracion/compras', label: 'Administrar compras', accion: 'admin.compras.ver' },
  { to: '/administracion/trabajadores', label: 'Administrar trabajadores', accion: 'admin.trabajadores' },
  { to: '/administracion/tickets', label: 'Tickets de soporte', accion: 'soporte.gestionarTickets' },
  { to: '/administracion/alertas', label: 'Alertas', accion: 'alertas.verTodas' },
  { to: '/soporte', label: 'Solicitar soporte', accion: 'soporte.solicitar' },
]

/** Cabecera FIND ME con el menú de usuario; el backend sigue siendo quien autoriza cada acción. */
export function AppShell({ user, onLogout, children }: AppShellProps) {
  const perfil = perfilDe(user)
  const [open, setOpen] = useState(false)

  return (
    <div className="wf-shell">
      <header className="wf-header">
        <Link to="/inicio" className="wf-brand">FIND ME</Link>
        <Link to="/#como-funciona">¿Cómo funciona?</Link>
        <Link to="/#descargar-app">Descargar App</Link>
        <Link to="/#preguntas-frecuentes">Preguntas frecuentes</Link>
        {puede(perfil, 'compras.comprar') && <Link to="/premium">Comprar Premium</Link>}

        <div className="wf-menu">
          <button type="button" className="wf-link" aria-expanded={open} onClick={() => setOpen(!open)}>
            👤 {user.nombre_usuario} ▾
          </button>
          {open && (
            <nav className="wf-menu-list" aria-label="Menú de usuario" onClick={() => setOpen(false)}>
              <span className="wf-muted">{perfil ? ETIQUETA_PERFIL[perfil] : 'Perfil sin rol (vuelve a iniciar sesión)'}</span>
              {MENU.filter((item) => puede(perfil, item.accion)).map((item) => (
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

/** Página para un perfil sin permiso en la UI. El backend rechaza igual la llamada (403). */
export function SinPermiso() {
  return (
    <section className="wf-card">
      <h1>Sin permisos</h1>
      <p>Tu perfil no tiene acceso a esta sección.</p>
      <Link className="wf-button" to="/inicio">Volver al inicio</Link>
    </section>
  )
}
