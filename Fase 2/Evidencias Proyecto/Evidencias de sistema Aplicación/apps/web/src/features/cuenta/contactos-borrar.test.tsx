import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { PerfilForm, type PerfilApi } from '@repo/ui/perfil-form'

const UNICO = 'Debe mantener al menos un contacto activo en su red de auxilio. Se recomienda editar el contacto activo'
const mama = { contacto_emergencia_ID: 1, nombre_contacto: 'Mamá', num_emergencia: '+56912345678' }
const papa = { contacto_emergencia_ID: 2, nombre_contacto: 'Papá', num_emergencia: '+56987654321' }

function montar(contactos: (typeof mama)[]) {
  const perfil = { prioridad_ID: null, mensaje: null, contactos, ficha_medica: null }
  const api = {
    cargar: vi.fn().mockResolvedValue(perfil),
    guardar: vi.fn(),
    guardarContacto: vi.fn(),
    eliminarContacto: vi.fn().mockResolvedValue({ ...perfil, contactos: [mama] }),
  }
  render(<PerfilForm nombreUsuario="Ana" correo="a@emergen.test" variante="usuario" onGuardar={async () => {}} api={api as unknown as PerfilApi} />)
  return api
}

afterEach(() => cleanup())

test('CA-04.1: borrar pide confirmación; cancelar no borra y "Sí" borra', async () => {
  const api = montar([mama, papa])
  await screen.findByText('Papá')
  fireEvent.click(screen.getAllByRole('button', { name: 'Borrar' })[1])
  expect(screen.getByRole('dialog', { name: 'Eliminar a "Papá"' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'No' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(api.eliminarContacto).not.toHaveBeenCalled()

  fireEvent.click(screen.getAllByRole('button', { name: 'Borrar' })[1])
  fireEvent.click(screen.getByRole('button', { name: 'Sí' }))
  await waitFor(() => expect(api.eliminarContacto).toHaveBeenCalledWith(2))
})

test('CA-04.1: el único contacto no se borra y se muestra el mensaje del CA', async () => {
  const api = montar([mama])
  await screen.findByText('Mamá')
  fireEvent.click(screen.getByRole('button', { name: 'Borrar' }))
  expect(screen.getAllByText(UNICO).length).toBeGreaterThan(0)
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(api.eliminarContacto).not.toHaveBeenCalled()
})
