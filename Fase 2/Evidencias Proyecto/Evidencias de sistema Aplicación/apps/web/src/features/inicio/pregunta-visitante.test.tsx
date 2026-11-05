import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { PublicSite } from './PublicSite'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

test('un visitante sin sesión envía un mensaje de contacto (CONSULTA por defecto)', async () => {
  const fetchMock = vi.fn(async (url: string) =>
    url.endsWith('/mensajes-contacto/tipos')
      ? json([{ id: 1, nombre: 'RECLAMO' }, { id: 2, nombre: 'SUGERENCIA' }, { id: 3, nombre: 'CONSULTA' }])
      : json({ mensaje_contacto_id: 7 }, 201),
  )
  vi.stubGlobal('fetch', fetchMock)
  const nada = () => {}
  render(<PublicSite view="preguntas" isAuthenticated={false} onNavigate={nada} onAccount={nada} onBuy={nada} />)

  expect(await screen.findByRole('option', { name: 'Consulta', selected: true })).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } })
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'ana@correo.cl' } })
  fireEvent.change(screen.getByLabelText('Tu mensaje'), { target: { value: '¿Funciona sin internet?' } })
  fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

  expect((await screen.findByRole('status')).textContent).toContain('N.º 7')
  const [url, init] = fetchMock.mock.calls[1] as unknown as [string, RequestInit]
  expect(url).toMatch(/\/internal\/v1\/mensajes-contacto$/)
  expect(JSON.parse(String(init.body))).toEqual({
    nombre: 'Ana',
    correo: 'ana@correo.cl',
    mensaje: '¿Funciona sin internet?',
    tipo_id: 3,
  })
})
