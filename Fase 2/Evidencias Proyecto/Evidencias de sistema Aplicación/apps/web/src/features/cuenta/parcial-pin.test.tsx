import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { PerfilForm, type PerfilApi } from '@repo/ui/perfil-form'

const perfil = { prioridad_ID: null, mensaje: null, contactos: [], ficha_medica: null }

function montar(accesoParcial: boolean) {
  const onGuardar = vi.fn().mockResolvedValue(undefined)
  const api = { cargar: vi.fn().mockResolvedValue(perfil), guardar: vi.fn().mockResolvedValue(perfil), guardarContacto: vi.fn(), eliminarContacto: vi.fn() }
  render(<PerfilForm nombreUsuario="Hijo" correo="h@emergen.test" variante="usuario" accesoParcial={accesoParcial} onGuardar={onGuardar} api={api as unknown as PerfilApi} />)
  return { onGuardar, api }
}

afterEach(() => cleanup())

test('E-08 / HU-10: el parcial guarda nombre y correo solo tras ingresar el PIN del principal', async () => {
  const { onGuardar, api } = montar(true)
  await screen.findByText(/Tu cuenta tiene acceso parcial/)
  fireEvent.change(screen.getByLabelText('Nombre de usuario'), { target: { value: 'Hijo Nuevo' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
  expect(onGuardar).not.toHaveBeenCalled()

  fireEvent.click(await screen.findByRole('button', { name: 'Ok, entiendo' }))
  onGuardar.mockRejectedValueOnce(new Error('PIN incorrecto. Te quedan 2 intentos.'))
  fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '0000' } })
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
  expect((await screen.findByRole('alert')).textContent).toBe('PIN incorrecto. Te quedan 2 intentos.')

  fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '1234' } })
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
  await waitFor(() => expect(onGuardar).toHaveBeenLastCalledWith('Hijo Nuevo', 'h@emergen.test', '1234'))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(api.guardar).not.toHaveBeenCalled() // sus datos de emergencia siguen en solo lectura
})

test('regresión: con acceso completo se guarda sin pedir PIN', async () => {
  const { onGuardar } = montar(false)
  await screen.findByLabelText('Nombre de usuario')
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
  await waitFor(() => expect(onGuardar).toHaveBeenCalledWith('Hijo', 'h@emergen.test'))
  expect(screen.queryByRole('dialog')).toBeNull()
})
