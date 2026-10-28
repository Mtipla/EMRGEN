import { cleanup, render, screen, waitFor } from '@testing-library/react'
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

async function abrirUsuarios(rol_ID: number, usuario_principal_ID: number | null = null) {
  yo = { usuario_ID: 5, nombre_usuario: 'Prueba', correo_usuario: 'p@emergen.test', rol_ID, estado_ID: 1, usuario_principal_ID, requiere_pin: false, plan_efectivo: true }
  localStorage.setItem('emergen.token', 'token-test')
  localStorage.setItem('emergen.user', JSON.stringify(yo))
  await abrir('/usuarios')
}

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(async (url) => {
    const path = new URL(String(url)).pathname
    if (path === '/usuarios/me') return json(yo)
    if (path === '/usuarios') return json([])
    return json([])
  })
})

afterEach(() => {
  cleanup()
  fetchMock.mockReset()
  vi.unstubAllGlobals()
  localStorage.clear()
})

test.each([
  ['usuario común', 3, null],
  ['apadrinado', 3, 9],
  ['soporte', 2, null],
])('CA-13.1: %s ve "Sin permisos" en /usuarios y no se pide la lista', async (_n, rol, principal) => {
  await abrirUsuarios(rol, principal)
  expect(await screen.findByRole('heading', { name: 'Sin permisos' })).toBeTruthy()
  expect(screen.queryByText('PANEL DE ADMINISTRACIÓN')).toBeNull()
  expect(fetchMock.mock.calls.some(([url]) => new URL(String(url)).pathname === '/usuarios')).toBe(false)
})

test('regresión: el administrador sigue viendo el panel de /usuarios', async () => {
  await abrirUsuarios(1)
  expect(await screen.findByText('PANEL DE ADMINISTRACIÓN')).toBeTruthy()
  expect(screen.queryByRole('heading', { name: 'Sin permisos' })).toBeNull()
})

test('sin sesión /usuarios lleva a /login', async () => {
  await abrir('/usuarios')
  await waitFor(() => expect(screen.getByLabelText('Ruta actual').textContent).toBe('/login'))
})
