import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

vi.mock('@repo/api-client', async (original) => ({
  ...await original<typeof import('@repo/api-client')>(), initFirebase: vi.fn(() => ({})),
}))
vi.mock('axios', async (original) => {
  const actual = await original<typeof import('axios')>()
  const { desktopFetchAdapter } = await import('../../test/desktop-fetch-adapter')
  return { ...actual, default: { ...actual.default, create: (config: import('axios').CreateAxiosDefaults) =>
    actual.default.create({ ...config, adapter: desktopFetchAdapter }) } }
})
const fetchMock = vi.fn<typeof fetch>()
const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } })
let yo: Record<string, unknown>
let mensaje = {
  mensaje_contacto_id: 4, nombre: 'Ana Visitante', correo: 'ana@correo.cl', mensaje: '¿Funciona sin internet?',
  fecha: '2026-10-28T12:00:00Z', tipo: 'CONSULTA', estado: 'PENDIENTE',
  respuestas: [] as { respuesta_id: number; texto: string; fecha: string; autor: string | null }[],
}

async function abrir(rol: number) {
  yo = { usuario_ID: 5, nombre_usuario: 'Admin Demo', correo_usuario: 'admin@emergen.test', rol_ID: rol, estado_ID: 1, requiere_pin: false, plan_efectivo: true }
  localStorage.setItem('emergen.token', 'token-test')
  localStorage.setItem('emergen.user', JSON.stringify(yo))
  vi.resetModules()
  const { PanelAdmin } = await import('../../../../desktop/src/admin/PanelAdmin')
  const { Avisos } = await import('@repo/ui/avisos')
  render(<MemoryRouter initialEntries={['/administracion/contacto']}><Avisos /><PanelAdmin /></MemoryRouter>)
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'personal@emergen.test' } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'ClavePrueba123!' } })
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(async (url, init) => {
    const path = new URL(String(url)).pathname
    if (path === '/usuarios/login') return json({ access_token: 'token-test', usuario: yo })
    if (path === '/usuarios/me') return json(yo)
    if (path === '/internal/v1/mensajes-contacto/estados') {
      return json([{ id: 1, nombre: 'EN_REVISION' }, { id: 2, nombre: 'PENDIENTE' }, { id: 3, nombre: 'REVISADO' }])
    }
    if (path === '/internal/v1/mensajes-contacto') return json([mensaje])
    if (path === '/internal/v1/mensajes-contacto/4' && init?.method === 'PATCH') {
      const { respuesta } = JSON.parse(String(init.body))
      mensaje = { ...mensaje, estado: 'REVISADO', respuestas: [{ respuesta_id: 1, texto: respuesta, fecha: '2026-10-28T13:00:00Z', autor: 'Admin Demo' }] }
      return json(mensaje)
    }
    return json([])
  })
})
afterEach(() => { cleanup(); fetchMock.mockReset(); vi.unstubAllGlobals(); localStorage.clear() })

test('el administrador responde un mensaje de contacto y lo puede enviar por correo', async () => {
  await abrir(1)
  fireEvent.click(await screen.findByText('Ana Visitante'))
  fireEvent.change(screen.getByLabelText('Nueva respuesta'), { target: { value: 'Necesitas conexión a internet.' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

  expect(await screen.findByText('Necesitas conexión a internet.')).toBeTruthy()
  const patch = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')!
  expect(JSON.parse(String(patch[1]!.body))).toEqual({ respuesta: 'Necesitas conexión a internet.' })
  const writeText = vi.fn(async () => {})
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
  const open = vi.spyOn(window, 'open').mockReturnValue(null)
  fireEvent.click(screen.getByRole('button', { name: 'Copiar respuesta y abrir Gmail' }))

  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Hola Ana Visitante:\n\nNecesitas conexión a internet.'))
  const [url, destino] = open.mock.calls[0]
  expect(String(url)).toBe(
    'https://mail.google.com/mail/?view=cm&fs=1&to=ana%40correo.cl&su=Respuesta%20a%20tu%20mensaje%20en%20EMERGEN',
  )
  expect(destino).toBe('_blank')
  expect(await screen.findByText(/Respuesta copiada/)).toBeTruthy()
  open.mockRestore()
})

test('si el portapapeles falla, igual abre Gmail y avisa que se copie a mano', async () => {
  mensaje = { ...mensaje, respuestas: [{ respuesta_id: 1, texto: 'Hola', fecha: '2026-10-28T13:00:00Z', autor: null }] }
  await abrir(1)
  fireEvent.click(await screen.findByText('Ana Visitante'))
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText: vi.fn(async () => { throw new Error('denegado') }) } })
  const open = vi.spyOn(window, 'open').mockReturnValue(null)
  fireEvent.click(screen.getByRole('button', { name: 'Copiar respuesta y abrir Gmail' }))
  expect(open).toHaveBeenCalledOnce()
  expect(await screen.findByText(/No se pudo copiar/)).toBeTruthy()
  open.mockRestore()
})

test('un usuario normal no accede a los mensajes de contacto', async () => {
  await abrir(3)
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'No se pudo iniciar sesión. Verifica tus datos e inténtalo nuevamente.')
  expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/mensajes-contacto'))).toBe(false)
})
