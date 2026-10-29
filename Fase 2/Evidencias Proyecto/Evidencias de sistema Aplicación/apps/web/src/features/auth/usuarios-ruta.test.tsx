import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

vi.mock('@repo/api-client', async (original) => ({
  ...await original<typeof import('@repo/api-client')>(),
  initFirebase: vi.fn(() => ({})),
}))

const fetchMock = vi.fn<typeof fetch>()
const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } })
let yo: Record<string, unknown>

function Ruta() {
  return <output aria-label="Ruta actual">{useLocation().pathname}</output>
}

/** App.tsx lee la sesión guardada al importarse: se importa después de dejarla en localStorage. */
async function abrir(ruta: string) {
  vi.resetModules()
  const { default: App } = await import('../../App')
  render(<MemoryRouter initialEntries={[ruta]}><App /><Ruta /></MemoryRouter>)
}

function guardarSesion(rol_ID: number, usuario_principal_ID: number | null = null) {
  yo = { usuario_ID: 5, nombre_usuario: 'Administrador Demo', correo_usuario: 'p@emergen.test', rol_ID, estado_ID: 1, usuario_principal_ID, requiere_pin: false, plan_efectivo: false }
  localStorage.setItem('emergen.token', 'token-test')
  localStorage.setItem('emergen.user', JSON.stringify(yo))
}

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(async (url) => {
    const path = new URL(String(url)).pathname
    if (path === '/usuarios/me') return json(yo)
    if (path === '/usuarios/login') return json({ access_token: 'token-test', usuario: yo })
    return json([])
  })
})

afterEach(() => {
  cleanup()
  fetchMock.mockReset()
  vi.unstubAllGlobals()
  localStorage.clear()
})

const rutasAdministrativas = [
  '/usuarios',
  '/administracion/cuentas',
  '/administracion/compras',
  '/administracion/trabajadores',
  '/administracion/planes',
  '/administracion/tickets',
  '/administracion/contacto',
  '/administracion/alertas',
]

test.each(rutasAdministrativas.flatMap((ruta) => [1, 2, 3, null].map((rol) => ({ ruta, rol }))))(
  'la web no registra $ruta para el rol $rol, tampoco al escribir la URL', async ({ ruta, rol }) => {
    if (rol !== null) guardarSesion(rol)
    await abrir(ruta)
    await waitFor(() => expect(screen.getByLabelText('Ruta actual').textContent).toBe('/'))
    expect(fetchMock.mock.calls.map(([url]) => new URL(String(url)).pathname)).toEqual(rol === null ? [] : ['/usuarios/me'])
  },
)

test.each([1, 2])('el inicio web del personal (rol %s) ofrece solo sus accesos personales', async (rol) => {
  guardarSesion(rol)
  await abrir('/inicio')
  expect(await screen.findByRole('heading', { name: 'Hola, Administrador Demo' })).toBeTruthy()
  expect(screen.getByLabelText('Ruta actual').textContent).toBe('/inicio')
  expect(screen.queryByRole('link', { name: 'Panel de administración' })).toBeNull()
  expect(screen.queryByRole('link', { name: 'Solicitar soporte' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: /Administrador Demo/ }))
  const menu = screen.getByRole('navigation', { name: 'Menú de usuario' })
  expect(Array.from(menu.querySelectorAll(':scope > a')).map((a) => a.getAttribute('href'))).toEqual(['/perfil'])
  expect(within(menu).getByRole('button', { name: 'Cerrar sesión' })).toBeTruthy()
})

test.each([1, 2].flatMap((rol) => ['/cuentas', '/soporte'].map((ruta) => ({ rol, ruta }))))(
  'el personal (rol $rol) tampoco abre $ruta mediante la URL', async ({ rol, ruta }) => {
    guardarSesion(rol)
    await abrir(ruta)
    await waitFor(() => expect(screen.getByLabelText('Ruta actual').textContent).toBe('/'))
    expect(fetchMock.mock.calls.map(([url]) => new URL(String(url)).pathname)).toEqual(['/usuarios/me'])
  },
)

test.each([null, 9])('el usuario con principal %s conserva sus cuentas y solicitud de soporte', async (principal) => {
  guardarSesion(3, principal)
  await abrir('/inicio')
  fireEvent.click(await screen.findByRole('button', { name: /Administrador Demo/ }))
  const menu = screen.getByRole('navigation', { name: 'Menú de usuario' })
  expect(within(menu).getByRole('link', { name: 'Administrar cuentas' }).getAttribute('href')).toBe('/cuentas')
  fireEvent.click(within(menu).getByRole('link', { name: 'Solicitar soporte' }))
  expect(await screen.findByRole('heading', { name: 'Solicitar soporte' })).toBeTruthy()
  expect(screen.getByLabelText('Ruta actual').textContent).toBe('/soporte')
  fireEvent.click(screen.getByRole('button', { name: /Administrador Demo/ }))
  fireEvent.click(screen.getByRole('link', { name: 'Administrar cuentas' }))
  expect(await screen.findByRole('button', { name: 'Descargar Informe PDF/Excel' })).toBeTruthy()
  expect(screen.getByLabelText('Ruta actual').textContent).toBe('/cuentas')
})

test('al iniciar sesión como administrador se abre el inicio sin accesos administrativos', async () => {
  guardarSesion(1)
  localStorage.clear()
  await abrir('/login')
  fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { value: 'admin@emergen.test' } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'ClavePrueba123!' } })
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
  expect(await screen.findByRole('heading', { name: 'Hola, Administrador Demo' })).toBeTruthy()
  expect(screen.getByLabelText('Ruta actual').textContent).toBe('/inicio')
  expect(screen.queryByRole('link', { name: 'Panel de administración' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: /Administrador Demo/ }))
  expect(screen.queryByRole('link', { name: /Administrar|Usuarios registrados|Solicitar soporte|Alertas|Gestión de planes/ })).toBeNull()
})
