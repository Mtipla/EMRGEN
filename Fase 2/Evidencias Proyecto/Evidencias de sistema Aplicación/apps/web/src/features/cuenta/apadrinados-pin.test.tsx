import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { GestionApadrinados, type ApadrinadosApi } from '@repo/ui/cuentas-apadrinadas'

const hijo = { usuario_ID: 11, nombre_usuario: 'Hijo', tipo: 'APADRINADO' as const, correo_usuario: 'h@emergen.test', estado_ID: 2, tiene_pin: true }

function montar() {
  const api = {
    listar: vi.fn().mockResolvedValue([hijo]),
    crear: vi.fn(),
    definirPin: vi.fn().mockResolvedValue([hijo]),
    cambiarAcceso: vi.fn().mockResolvedValue([{ ...hijo, estado_ID: 1 }]),
    eliminar: vi.fn().mockResolvedValue([]),
  }
  render(<GestionApadrinados cupos={1} api={api as unknown as ApadrinadosApi} onAnadir={() => {}} />)
  return api
}

async function ingresarPin(pin: string) {
  const campo = await screen.findByLabelText('PIN')
  fireEvent.change(campo, { target: { value: pin } })
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
}

afterEach(() => cleanup())

test('HU-10: eliminar pide confirmación y luego el PIN del principal; un PIN incorrecto se muestra en el diálogo', async () => {
  const api = montar()
  fireEvent.click(await screen.findByRole('button', { name: 'Eliminar' }))
  fireEvent.click(screen.getByRole('button', { name: 'Sí' }))
  expect(api.eliminar).not.toHaveBeenCalled()

  api.eliminar.mockRejectedValueOnce(new Error('PIN incorrecto. Te quedan 2 intentos.'))
  await ingresarPin('0000')
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'PIN incorrecto. Te quedan 2 intentos.')
  expect(screen.getByRole('dialog', { name: /eliminar a "Hijo"/ })).toBeTruthy()

  await ingresarPin('1234')
  await waitFor(() => expect(api.eliminar).toHaveBeenLastCalledWith(11, '1234'))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

test('HU-10: cambiar el acceso y el PIN del apadrinado también exigen el PIN del principal', async () => {
  const api = montar()
  fireEvent.click(await screen.findByLabelText('Acceso completo'))
  expect(api.cambiarAcceso).not.toHaveBeenCalled()
  await ingresarPin('1234')
  await waitFor(() => expect(api.cambiarAcceso).toHaveBeenCalledWith(11, 1, '1234'))

  fireEvent.click(await screen.findByRole('button', { name: 'Regenerar PIN' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Ok, entiendo' }))
  fireEvent.change(await screen.findByLabelText('PIN'), { target: { value: '5555' } })
  fireEvent.change(screen.getByLabelText('Confirmar PIN'), { target: { value: '5555' } })
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
  expect(api.definirPin).not.toHaveBeenCalled()
  await ingresarPin('1234')
  await waitFor(() => expect(api.definirPin).toHaveBeenCalledWith(11, '5555', '1234'))
})
