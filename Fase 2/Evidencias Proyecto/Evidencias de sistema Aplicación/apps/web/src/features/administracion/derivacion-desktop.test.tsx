import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { PanelAdmin } from '../../../../desktop/src/admin/PanelAdmin'

const { api } = vi.hoisted(() => ({ api: {
  login: vi.fn(), listarUsuarios: vi.fn(), listarTickets: vi.fn(), listarEstadosTickets: vi.fn(),
  actualizarTicket: vi.fn(), listarPlanes: vi.fn(), verExpediente: vi.fn(), guardarPlan: vi.fn(),
  listarAlertas: vi.fn(),
} }))
vi.mock('../../../../desktop/src/admin/api', () => ({
  adminApi: api, API_URL: 'http://api.test', MODO_API: 'prueba',
  setToken: vi.fn(), describirError: async (error: Error) => error.message,
}))

const usuario = { usuario_ID: 9, nombre_usuario: 'Cuenta del ticket', correo_usuario: 'cuenta@emergen.test', rol_ID: 3, estado_ID: 1 }
let ticket = { ticket_id: 27, usuario_id: 9, nombre_usuario: usuario.nombre_usuario, correo_usuario: usuario.correo_usuario,
  categoria_id: 2, categoria: 'PAGOS Y PLANES', descripcion: 'Revisar cupos adquiridos', estado: 'EN PROCESO', solucion: null }

beforeEach(() => {
  vi.clearAllMocks()
  ticket = { ...ticket, categoria: 'PAGOS Y PLANES', estado: 'EN PROCESO' }
  api.login.mockResolvedValue({ access_token: 'sesion-test', usuario: { ...usuario, usuario_ID: 5, nombre_usuario: 'Administrador', rol_ID: 1 } })
  api.listarUsuarios.mockResolvedValue([usuario])
  api.listarTickets.mockImplementation(async () => [ticket])
  api.listarEstadosTickets.mockResolvedValue([{ id: 1, nombre: 'ABIERTO' }, { id: 2, nombre: 'EN PROCESO' }])
  api.listarPlanes.mockResolvedValue([{ plan_ID: 2, nombre_plan: 'Premium' }])
  api.listarAlertas.mockResolvedValue({ alertas: [], total: 0 })
})
afterEach(() => { cleanup(); localStorage.clear() })

async function abrir(rol = 1) {
  api.login.mockResolvedValue({ access_token: 'sesion-test', usuario: { ...usuario, usuario_ID: 5, nombre_usuario: 'Personal', rol_ID: rol } })
  render(<MemoryRouter initialEntries={['/administracion/tickets']}><PanelAdmin /></MemoryRouter>)
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'personal@emergen.test' } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'ClavePrueba123!' } })
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
  fireEvent.click(await screen.findByText('Cuenta del ticket (ID 9)'))
}

test('el panel de escritorio deriva y vuelve al ticket con su borrador seleccionado', async () => {
  await abrir()
  fireEvent.change(screen.getByLabelText('Solución'), { target: { value: 'Verificar cupos antes de responder' } })
  fireEvent.click(screen.getByRole('button', { name: 'Gestión de planes y cupos de usuario' }))
  const resumen = await screen.findByRole('complementary', { name: 'Resumen del ticket 27' })
  expect(within(resumen).getByText('Revisar cupos adquiridos')).toBeTruthy()
  expect(await screen.findByRole('heading', { name: 'Gestión de planes y cupos de usuario' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Volver a editar solución' }))
  expect((await screen.findByLabelText('Solución') as HTMLTextAreaElement).value).toBe('Verificar cupos antes de responder')
  await waitFor(() => expect(screen.getByText('Cuenta del ticket (ID 9)').closest('tr')?.getAttribute('aria-selected')).toBe('true'))
  expect(api.actualizarTicket).not.toHaveBeenCalled()
})

test('al cambiar de módulo en escritorio desaparecen resumen, selección y borrador', async () => {
  await abrir()
  fireEvent.change(screen.getByLabelText('Solución'), { target: { value: 'Borrador temporal' } })
  fireEvent.click(screen.getByRole('button', { name: 'Gestión de planes y cupos de usuario' }))
  expect(await screen.findByRole('complementary')).toBeTruthy()
  fireEvent.click(screen.getByRole('link', { name: 'Administrar cuentas' }))
  expect(await screen.findByRole('heading', { name: 'Administrar cuentas' })).toBeTruthy()
  expect(screen.queryByRole('complementary')).toBeNull()
  fireEvent.click(screen.getByRole('link', { name: 'Administrar Tickets de soporte' }))
  expect(await screen.findByText('Cuenta del ticket (ID 9)')).toBeTruthy()
  expect(screen.queryByLabelText('Solución')).toBeNull()
  fireEvent.click(screen.getByText('Cuenta del ticket (ID 9)'))
  expect((screen.getByLabelText('Solución') as HTMLTextAreaElement).value).toBe('')
})

test.each([['PAGOS Y PLANES', 2], ['OTRO', 1]])('escritorio no sugiere derivación para %s con rol %s', async (categoria, rol) => {
  ticket = { ...ticket, categoria }
  await abrir(rol)
  expect(screen.queryByRole('heading', { name: 'Módulo sugerido' })).toBeNull()
  expect(screen.queryByRole('complementary')).toBeNull()
})

test('SOPORTE pierde la edición en escritorio al enviar el ticket a verificación', async () => {
  ticket = { ...ticket, estado: 'ABIERTO' }
  api.actualizarTicket.mockImplementationOnce(async () => {
    ticket = { ...ticket, estado: 'EN PROCESO' }
    return ticket
  })
  await abrir(2)
  expect(screen.getByLabelText('Solución')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Enviar verificación a Administrador' }))
  expect(await screen.findByText('Verificación enviada al administrador. Ticket EN PROCESO.')).toBeTruthy()
  expect(screen.queryByLabelText('Solución')).toBeNull()
  expect(screen.queryByLabelText('Estado')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Enviar verificación a Administrador' })).toBeNull()
  expect(api.actualizarTicket).toHaveBeenCalledExactlyOnceWith(27, { estado: 'EN PROCESO', enviar_verificacion: true })
  fireEvent.click(screen.getByRole('button', { name: /^Cerrar$/ }))
  fireEvent.click(screen.getByText('Cuenta del ticket (ID 9)'))
  expect(screen.queryByLabelText('Solución')).toBeNull()
  expect(screen.getByText('Solo el administrador puede modificar un ticket EN PROCESO.')).toBeTruthy()
})
