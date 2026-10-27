import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

vi.mock('@repo/api-client', async (original) => ({
  ...await original<typeof import('@repo/api-client')>(), initFirebase: vi.fn(() => ({})),
}))
const fetchMock = vi.fn<typeof fetch>()
const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } })
const cuenta = { usuario_ID: 9, nombre_usuario: 'Principal Demo', correo_usuario: 'principal@emergen.test', rol_ID: 3, estado_ID: 1 }
let yo: Record<string, unknown>
let ticket = { ticket_id: 1, usuario_id: 9, nombre_usuario: cuenta.nombre_usuario, correo_usuario: cuenta.correo_usuario,
  descripcion: 'No puedo acceder a mi cuenta', estado: 'ABIERTO', solucion: null as string | null, categoria_id: 1, categoria: 'Cuenta' }

async function abrir(ruta: string, rol = 2) {
  yo = { ...cuenta, usuario_ID: 5, nombre_usuario: 'Soporte Demo', rol_ID: rol, requiere_pin: false, plan_efectivo: true }
  localStorage.setItem('emergen.token', 'token-test')
  localStorage.setItem('emergen.user', JSON.stringify(yo))
  vi.resetModules()
  const { default: App } = await import('../../App')
  render(<MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>)
}

beforeEach(() => {
  localStorage.clear()
  ticket = { ...ticket, estado: 'ABIERTO', solucion: null }
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(async (url, init) => {
    const path = new URL(String(url)).pathname
    if (path === '/usuarios/me') return json(yo)
    if (path === '/admin/usuarios') return json([cuenta])
    if (path === '/admin/ventas') return json({ ventas: [{ venta_id: 73, usuario_id: 9, nombre_usuario: 'Comprador real', correo_usuario: cuenta.correo_usuario,
      fecha_venta: '2026-10-27T12:00:00Z', total_venta: 5000, estado: 'PAGADO', metodo_pago: 'PAYPAL', detalles: [] }], total: 1, total_pagado_clp: 5000 })
    if (path.endsWith('/tickets-soporte/estados')) return json([{ estado_id: 1, nombre: 'ABIERTO' }, { estado_id: 3, nombre: 'CERRADO' }])
    if (path.endsWith('/tickets-soporte/1') && init?.method === 'PATCH') {
      ticket = { ...ticket, ...JSON.parse(String(init.body)) }
      return json(ticket)
    }
    if (path.endsWith('/tickets-soporte')) return json([ticket])
    return json([])
  })
})
afterEach(() => { cleanup(); fetchMock.mockReset(); vi.unstubAllGlobals(); localStorage.clear() })

test('SOPORTE ve cuentas y detalles sin formularios ni acciones de escritura', async () => {
  await abrir('/administracion/cuentas')
  const fila = await screen.findByText('Principal Demo')
  fireEvent.click(fila)
  expect(await screen.findByRole('heading', { name: 'Cuenta 9' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Añadir' })).toBeNull()
  expect(screen.queryByRole('button', { name: /Guardar|Eliminar|acceso/i })).toBeNull()
  expect(screen.queryByRole('textbox')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Descargar' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: /Soporte Demo/ }))
  const menu = screen.getByRole('navigation', { name: 'Menú de usuario' })
  expect(Array.from(menu.querySelectorAll('a')).map((a) => a.getAttribute('href'))).toEqual([
    '/administracion/cuentas', '/administracion/compras', '/administracion/tickets',
  ])
})

test('SOPORTE consulta compras reales con paginación y sin edición', async () => {
  await abrir('/administracion/compras')
  expect(await screen.findByText('Comprador real')).toBeTruthy()
  expect(screen.queryByText(/MOCK/)).toBeNull()
  expect(screen.queryByRole('button', { name: /Guardar|Eliminar|Descargar/ })).toBeNull()
  const consulta = fetchMock.mock.calls.find(([url]) => new URL(String(url)).pathname === '/admin/ventas')
  expect(new URL(String(consulta?.[0])).searchParams.get('limit')).toBe('20')
})

test('SOPORTE responde un ticket de usuario y cambia su estado en la API interna', async () => {
  await abrir('/administracion/tickets')
  const fila = await screen.findByText('Principal Demo (ID 9)')
  expect(screen.getAllByRole('columnheader').map((celda) => celda.textContent)).toEqual([
    'Ticket', 'Usuario', 'Correo', 'Categoría', 'Estado',
  ])
  expect(screen.queryByText(ticket.descripcion)).toBeNull()
  expect(screen.queryByLabelText('Solución')).toBeNull()
  fireEvent.click(fila)
  expect(screen.getByText(ticket.descripcion)).toBeTruthy()
  const acciones = screen.getByRole('button', { name: /^Cerrar$/ }).parentElement
  expect(Array.from(acciones?.querySelectorAll('button') ?? []).map((boton) => boton.textContent)).toEqual(['Cerrar', 'Marcar como leído', 'Solucionado', 'Rechazar', 'Guardar cambios'])
  fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'CERRADO' } })
  fireEvent.change(screen.getByLabelText('Solución'), { target: { value: 'Acceso restablecido' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
  expect(await screen.findByText('Ticket actualizado.')).toBeTruthy()
  const peticion = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
  expect(String(peticion?.[0])).toContain('/internal/v1/tickets-soporte/1')
  expect(JSON.parse(String(peticion?.[1]?.body))).toEqual({ estado: 'CERRADO', solucion: 'Acceso restablecido' })
  expect(peticion?.[1]?.headers).toMatchObject({ Authorization: 'Bearer token-test' })
  await waitFor(() => expect((screen.getByLabelText('Solución') as HTMLTextAreaElement).value).toBe('Acceso restablecido'))
  fireEvent.click(screen.getByRole('button', { name: /^Cerrar$/ }))
  expect(screen.queryByLabelText('Solución')).toBeNull()
  expect(screen.queryByText(ticket.descripcion)).toBeNull()
  fireEvent.click(screen.getByText('Principal Demo (ID 9)'))
  expect((screen.getByLabelText('Solución') as HTMLTextAreaElement).value).toBe('Acceso restablecido')
  expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'PATCH')).toHaveLength(1)
})

test.each(['/administracion/trabajadores', '/administracion/alertas'])(
  'SOPORTE no accede a %s escribiendo la URL', async (ruta) => {
    await abrir(ruta)
    expect(await screen.findByRole('heading', { name: 'Sin permisos' })).toBeTruthy()
    expect(fetchMock.mock.calls.some(([url]) => /\/admin\/(usuarios|alertas)$/.test(new URL(String(url)).pathname))).toBe(false)
  },
)

test('el usuario principal no accede a los tickets del personal', async () => {
  await abrir('/administracion/tickets', 3)
  expect(await screen.findByRole('heading', { name: 'Sin permisos' })).toBeTruthy()
  expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/tickets-soporte'))).toBe(false)
})

test('el administrador conserva los controles de las cuentas', async () => {
  await abrir('/administracion/cuentas', 1)
  fireEvent.click(await screen.findByText('Principal Demo'))
  expect(screen.getByRole('button', { name: 'Añadir' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Modificar / Guardar cambios' })).toBeTruthy()
})

test('SOPORTE rechaza un ticket: exige el motivo y lo envía como CERRADO', async () => {
  await abrir('/administracion/tickets')
  fireEvent.click(await screen.findByText('Principal Demo (ID 9)'))
  fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }))
  expect(await screen.findByText('Escribe la solución o el motivo antes de continuar.')).toBeTruthy()
  expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false)
  fireEvent.change(screen.getByLabelText('Solución'), { target: { value: 'Rechazada: fuera de alcance' } })
  fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }))
  expect(await screen.findByText('Ticket actualizado.')).toBeTruthy()
  const peticion = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
  expect(JSON.parse(String(peticion?.[1]?.body))).toEqual({ estado: 'CERRADO', solucion: 'Rechazada: fuera de alcance' })
})
