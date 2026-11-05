import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { PerfilForm, type PerfilApi } from '@repo/ui/perfil-form'

const mama = { contacto_emergencia_ID: 1, nombre_contacto: 'Mamá', num_emergencia: '+56912345678' }
const perfil = { prioridad_ID: null, mensaje: null, contactos: [mama], ficha_medica: null }

function montar() {
  const api = {
    cargar: vi.fn().mockResolvedValue(perfil),
    guardar: vi.fn(),
    guardarContacto: vi.fn().mockResolvedValue(perfil),
    eliminarContacto: vi.fn(),
  }
  render(<PerfilForm nombreUsuario="Ana" correo="a@emergen.test" variante="usuario" onGuardar={async () => {}} api={api as unknown as PerfilApi} />)
  return api
}

const escribirNumero = (valor: string) =>
  fireEvent.change(screen.getByLabelText('Número del contacto'), { target: { value: valor } })

afterEach(() => cleanup())

test.each(['+56912345678', '+56 9 1234 5678', '(9) 1234-5678', '912345678'])(
  'CA-03.1: "%s" ya está en la lista → error en el campo y Agregar bloqueado',
  async (numero) => {
    const api = montar()
    await screen.findByText('Mamá')
    fireEvent.change(screen.getByLabelText('Nombre del contacto'), { target: { value: 'Otra' } })
    escribirNumero(numero)
    expect(screen.getByText(/Ese número ya está en tu lista de contactos de emergencia/)).toBeTruthy()
    const agregar = screen.getByRole('button', { name: 'Agregar contacto +' }) as HTMLButtonElement
    expect(agregar.disabled).toBe(true)
    fireEvent.click(agregar)
    expect(api.guardarContacto).not.toHaveBeenCalled()
  },
)

test('número nuevo en formato nacional se envía normalizado a E.164', async () => {
  const api = montar()
  await screen.findByText('Mamá')
  fireEvent.change(screen.getByLabelText('Nombre del contacto'), { target: { value: 'Papá' } })
  escribirNumero('(9) 8765-4321')
  expect(screen.getByText(/Número válido: \+56987654321/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Agregar contacto +' }))
  await waitFor(() =>
    expect(api.guardarContacto).toHaveBeenCalledWith({ nombre_contacto: 'Papá', num_emergencia: '+56987654321', compartir_antecedentes: true }, undefined),
  )
})

test('al editar, el contacto puede conservar su propio número', async () => {
  const api = montar()
  await screen.findByText('Mamá')
  fireEvent.click(screen.getByRole('button', { name: 'Editar' }))
  fireEvent.change(screen.getByLabelText('Nombre del contacto'), { target: { value: 'Mamá Ana' } })
  const guardar = screen.getByRole('button', { name: 'Guardar contacto' }) as HTMLButtonElement
  expect(guardar.disabled).toBe(false)
  fireEvent.click(guardar)
  await waitFor(() =>
    expect(api.guardarContacto).toHaveBeenCalledWith({ nombre_contacto: 'Mamá Ana', num_emergencia: '+56912345678', compartir_antecedentes: true }, 1),
  )
})
