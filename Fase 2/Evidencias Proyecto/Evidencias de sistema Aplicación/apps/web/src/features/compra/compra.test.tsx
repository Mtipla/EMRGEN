import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { loadPaypalSdk } from '@repo/api-client'
import App from '../../App'

vi.mock('@repo/api-client', async (original) => ({
  ...await original<typeof import('@repo/api-client')>(),
  initFirebase: vi.fn(() => ({})),
  loadPaypalSdk: vi.fn(),
}))

const usuario = {
  usuario_ID: 37, nombre_usuario: 'Prueba compra plan', correo_usuario: 'compra@emergen.test',
  rol_ID: 3, estado_ID: 1, usuario_principal_ID: null, requiere_pin: false,
}
let tienePlan = false
const fetchMock = vi.fn<typeof fetch>()
const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } })

function Ruta() {
  return <output aria-label="Ruta actual">{useLocation().pathname}</output>
}

beforeEach(() => {
  tienePlan = false
  localStorage.clear()
  localStorage.setItem('emergen.token', 'token-test')
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(async (url, init) => {
    const path = new URL(String(url)).pathname
    if (path === '/usuarios/me') return json({ ...usuario, plan_efectivo: tienePlan })
    if (path === '/usuarios/me/vinculadas') return json([])
    if (path === '/compras/precio') return json({ precioUnitario: 1000, precioPlan: 5000 })
    if (path === '/compras/resumen') return json({ usuario: usuario.nombre_usuario, plan: 'PLAN BASE DEMOSTRACION',
      tipoCompra: tienePlan ? 'CUPOS' : 'PLAN', precioUnitario: tienePlan ? 1000 : 5000,
      maxCantidad: tienePlan ? 5 : 1, cuposAdquiridos: 0 })
    if (path.endsWith('/ventas/pendientes')) return json([])
    if (path.endsWith('/ordenes')) {
      expect(JSON.parse(init!.body as string)).toEqual({ cantidad: 1, tipo: tienePlan ? 'CUPOS' : 'PLAN' })
      return json({ ventaId: 91, orderId: 'ORDER91', totalClp: 5000, montoCobrado: '5.27', monedaCobrada: 'USD' })
    }
    if (path.endsWith('/captura')) {
      tienePlan = true
      return json({ ventaId: 91, estado: 'PAGADO', cuposAdquiridos: 0 })
    }
    throw new Error(`Petición inesperada: ${path}`)
  })
  vi.mocked(loadPaypalSdk).mockImplementation(async () => ({
    Buttons: (callbacks) => ({
      render: async (container: HTMLElement) => {
        const button = document.createElement('button')
        button.textContent = 'Pagar en PayPal de prueba'
        button.onclick = () => {
          void callbacks.createOrder().then(orderID => callbacks.onApprove({ orderID })).catch(callbacks.onError)
        }
        container.append(button)
      },
      close: async () => {},
    }),
  }))
})

afterEach(() => {
  cleanup()
  fetchMock.mockReset()
  vi.unstubAllGlobals()
  localStorage.clear()
})

test('sin plan: inicio → premium con ambos precios → comprar un plan → inicio con Premium activo', async () => {
  render(<MemoryRouter initialEntries={['/inicio']}><App /><Ruta /></MemoryRouter>)
  const comprar = (await screen.findAllByRole('link', { name: 'Comprar Premium' }))[0]
  fireEvent.click(comprar)
  await waitFor(() => expect(screen.getByLabelText('Ruta actual').textContent).toBe('/premium'))
  const valor = await screen.findByText(/Valor de la cuenta Premium/)
  expect(valor.textContent).toContain('$5.000')
  expect(valor.nextElementSibling?.textContent).toContain('Valor por cuenta apadrinada: $1.000')
  fireEvent.click(screen.getAllByRole('button', { name: 'Comprar Premium' }).at(-1)!)
  await screen.findByText('1 plan para tu cuenta')
  expect(screen.queryByRole('spinbutton')).toBeNull()
  expect(screen.getByLabelText('Ruta actual').textContent).toBe('/comprar')
  fireEvent.click(screen.getByRole('button', { name: 'Continuar con PayPal' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Pagar en PayPal de prueba' }))
  await screen.findByText(/Tu cuenta Premium está activa/)
  await waitFor(() => expect(JSON.parse(localStorage.getItem('emergen.user')!).plan_efectivo).toBe(true))
  fireEvent.click(screen.getByRole('button', { name: 'Ok entiendo' }))
  await screen.findByRole('heading', { name: 'Hola, Prueba compra plan' })
  expect(screen.getByLabelText('Ruta actual').textContent).toBe('/inicio')
  expect(screen.getAllByRole('link', { name: 'Comprar cupos de cuentas' }).every(link => link.getAttribute('href') === '/comprar')).toBe(true)
})

test('con plan: los dos accesos de inicio abren directamente la compra de cupos', async () => {
  tienePlan = true
  render(<MemoryRouter initialEntries={['/inicio']}><App /><Ruta /></MemoryRouter>)
  const links = await screen.findAllByRole('link', { name: 'Comprar cupos de cuentas' })
  expect(links).toHaveLength(2)
  expect(links.every(link => link.getAttribute('href') === '/comprar')).toBe(true)
  expect(screen.queryByRole('link', { name: 'Comprar Premium' })).toBeNull()
  fireEvent.click(links[1])
  await screen.findByRole('spinbutton', { name: 'Cantidad de cuentas' })
  expect(screen.getByLabelText('Ruta actual').textContent).toBe('/comprar')
  expect(screen.getByRole('heading', { name: 'Comprar cupos de cuentas' })).toBeDefined()
})
