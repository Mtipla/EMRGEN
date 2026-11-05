import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AdminTicketsPage } from './AdminPages'
import { VistaTickets } from '../../../../desktop/src/admin/VistaTickets'
import { downloadBlob } from '@repo/api-client'

const { descargarDesktop } = vi.hoisted(() => ({ descargarDesktop: vi.fn() }))
vi.mock('@repo/api-client', async (original) => ({
  ...await original<typeof import('@repo/api-client')>(), downloadBlob: vi.fn(),
}))
vi.mock('../../../../desktop/src/admin/api', () => ({
  adminApi: {
    listarTickets: async () => [], listarEstadosTickets: async () => [], actualizarTicket: vi.fn(),
    descargarInformeTickets: descargarDesktop,
  },
  describirError: async (error: Error) => error.message,
}))
const fetchMock = vi.fn<typeof fetch>()
const archivo = new Blob(['informe de prueba'], { type: 'application/pdf' })

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.setItem('emergen.token', 'token-administrador')
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(async (url) => {
    if (String(url).includes('/admin/tickets/reporte')) return new Response(archivo)
    return new Response('[]', { headers: { 'Content-Type': 'application/json' } })
  })
  descargarDesktop.mockResolvedValue(archivo)
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear() })

test.each(['pdf', 'xlsx'] as const)('ADMIN descarga %s de todos los cerrados aunque filtre la bandeja por ABIERTO', async (formato) => {
  fetchMock.mockImplementation(async (url) => {
    if (String(url).includes('/admin/tickets/reporte')) return new Response(archivo)
    if (String(url).includes('/estados')) return new Response(JSON.stringify([{ estado_id: 1, nombre: 'ABIERTO' }]))
    return new Response('[]')
  })
  render(<AdminTicketsPage perfil="ADMINISTRADOR" />)
  await screen.findByRole('option', { name: 'ABIERTO' })
  fireEvent.change(screen.getByLabelText('Filtrar por estado'), { target: { value: 'ABIERTO' } })
  fireEvent.click(screen.getByRole('button', { name: formato === 'pdf' ? 'Descargar PDF' : 'Descargar Excel' }))
  await waitFor(() => expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), expect.stringMatching(new RegExp(`tickets-cerrados-.*\\.${formato}$`))))
  const llamada = fetchMock.mock.calls.find(([url]) => String(url).includes('/admin/tickets/reporte'))!
  expect(new URL(String(llamada[0])).search).toBe(`?formato=${formato}`)
  expect(llamada[1]?.headers).toMatchObject({ Authorization: 'Bearer token-administrador', Accept: formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  expect(await screen.findByRole('status')).toHaveProperty('textContent', `Informe ${formato === 'pdf' ? 'PDF' : 'Excel'} descargado.`)
})

test('SOPORTE no ve controles de descarga en web ni escritorio', async () => {
  const web = render(<AdminTicketsPage perfil="SOPORTE" />)
  await screen.findByText('No hay tickets.')
  expect(screen.queryByRole('group', { name: 'Informes de tickets cerrados' })).toBeNull()
  web.unmount()
  render(<VistaTickets esAdministrador={false} />)
  await screen.findByText('No hay tickets.')
  expect(screen.queryByRole('button', { name: /Descargar/ })).toBeNull()
  expect(descargarDesktop).not.toHaveBeenCalled()
  expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/admin/tickets/reporte'))).toBe(false)
})

test.each(['pdf', 'xlsx'] as const)('el panel de escritorio descarga %s', async (formato) => {
  render(<VistaTickets esAdministrador />)
  fireEvent.click(screen.getByRole('button', { name: formato === 'pdf' ? 'Descargar PDF' : 'Descargar Excel' }))
  await waitFor(() => expect(downloadBlob).toHaveBeenCalledWith(archivo, expect.stringMatching(new RegExp(`\\.${formato}$`))))
  expect(descargarDesktop).toHaveBeenCalledExactlyOnceWith(formato)
})

test('bloquea descargas simultáneas y permite reintentar si falla el servidor', async () => {
  let rechazar!: (error: Error) => void
  descargarDesktop.mockImplementationOnce(() => new Promise((_, reject) => { rechazar = reject }))
  render(<VistaTickets esAdministrador />)
  const pdf = screen.getByRole('button', { name: 'Descargar PDF' }) as HTMLButtonElement
  const excel = screen.getByRole('button', { name: 'Descargar Excel' }) as HTMLButtonElement
  fireEvent.click(pdf)
  fireEvent.click(excel)
  expect(descargarDesktop).toHaveBeenCalledTimes(1)
  expect(pdf.disabled).toBe(true)
  expect(excel.disabled).toBe(true)
  expect(screen.getByRole('status').textContent).toBe('Generando informe de tickets cerrados…')
  rechazar(new Error('No se pudo generar el informe'))
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'No se pudo generar el informe')
  expect(downloadBlob).not.toHaveBeenCalled()
  expect(pdf.disabled).toBe(false)
  fireEvent.click(pdf)
  await waitFor(() => expect(downloadBlob).toHaveBeenCalledTimes(1))
})

test('muestra errores HTTP de la descarga web sin descargar un archivo de error', async () => {
  fetchMock.mockImplementation(async (url) => String(url).includes('/admin/tickets/reporte')
    ? new Response(JSON.stringify({ message: 'No tienes permisos para esta acción' }), { status: 403 })
    : new Response('[]'))
  render(<AdminTicketsPage perfil="ADMINISTRADOR" />)
  fireEvent.click(screen.getByRole('button', { name: 'Descargar PDF' }))
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'No tienes permisos para esta acción')
  expect(downloadBlob).not.toHaveBeenCalled()
})
