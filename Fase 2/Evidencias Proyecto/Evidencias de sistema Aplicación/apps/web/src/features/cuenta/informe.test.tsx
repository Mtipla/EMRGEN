import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import type { AuthenticatedUser } from '../auth/AuthForm'

vi.mock('@repo/api-client', async (original) => ({
  ...await original<typeof import('@repo/api-client')>(),
  initFirebase: vi.fn(() => ({})), downloadBlob: vi.fn(),
}))
import { downloadBlob } from '@repo/api-client'
import { AccountsPage, DescargarInforme, HomePage } from './CuentaPages'
import { apiFetch } from './session'

const fetchMock = vi.fn<typeof fetch>()
const usuario = {
  usuario_ID: 5, nombre_usuario: 'Prueba', correo_usuario: 'p@emergen.test',
  rol_ID: 3, estado_ID: 1, usuario_principal_ID: null, plan_efectivo: false,
} as AuthenticatedUser

beforeEach(() => { vi.stubGlobal('fetch', fetchMock); vi.clearAllMocks() })
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

test('inicio elimina cuentas vinculadas y lleva a Administrar cuentas incluso sin Premium', () => {
  render(<MemoryRouter><HomePage user={usuario} /></MemoryRouter>)
  expect(screen.queryByText('Cuentas vinculadas')).toBeNull()
  expect(screen.queryByRole('button', { name: /Descargar Informe/ })).toBeNull()
  expect(screen.getByRole('link', { name: 'Administrar cuentas' }).getAttribute('href')).toBe('/cuentas')
  expect(fetchMock).not.toHaveBeenCalled()
})

test.each([null, 9])('sin Premium o con principal %s, muestra el informe sin pedir cupos de compra', (principal) => {
  render(<MemoryRouter><AccountsPage user={{ ...usuario, usuario_principal_ID: principal }} /></MemoryRouter>)
  expect(screen.getByRole('heading', { name: 'Administrar cuentas' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Descargar Informe PDF/Excel' })).toBeTruthy()
  expect(fetchMock).not.toHaveBeenCalled()
})

test.each([
  ['pdf', 'application/pdf'],
  ['xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
])('descarga %s como archivo binario con su extensión', async (formato, tipo) => {
  const archivo = new Blob(['archivo'], { type: tipo })
  fetchMock.mockResolvedValue({ ok: true, blob: async () => archivo } as Response)
  render(<DescargarInforme esPrincipal />)
  fireEvent.change(screen.getByLabelText('Formato del informe'), { target: { value: formato } })
  fireEvent.click(screen.getByRole('button', { name: 'Descargar Informe PDF/Excel' }))
  await waitFor(() => expect(downloadBlob).toHaveBeenCalledWith(archivo, expect.stringMatching(new RegExp('\\.' + formato + '$'))))
  expect(fetchMock.mock.calls[0][0]).toContain('/usuarios/me/informe?formato=' + formato)
  expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({ Accept: tipo })
})

test('muestra un error del servidor y vuelve a habilitar la descarga', async () => {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: 'jsReport no disponible' }), { status: 502 }))
  render(<DescargarInforme esPrincipal={false} />)
  fireEvent.click(screen.getByRole('button', { name: 'Descargar Informe PDF/Excel' }))
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('jsReport no disponible'))
  expect((screen.getByRole('button', { name: 'Descargar Informe PDF/Excel' }) as HTMLButtonElement).disabled).toBe(false)
  expect(downloadBlob).not.toHaveBeenCalled()
})

test('el fetch de Excel conserva los errores JSON del backend', async () => {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: 'Sin sesión' }), { status: 401 }))
  await expect(apiFetch('/usuarios/me/informe?formato=xlsx', {
    headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  })).rejects.toThrow('Sin sesión')
})
