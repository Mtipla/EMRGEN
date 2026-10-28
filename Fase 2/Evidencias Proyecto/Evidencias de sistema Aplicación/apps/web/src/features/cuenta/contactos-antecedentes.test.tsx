import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { PerfilForm, type PerfilApi, type PerfilEmergencia } from '@repo/ui/perfil-form'

afterEach(cleanup)

test('guarda el permiso por contacto y lo conserva al volver a abrir el perfil', async () => {
  let perfil: PerfilEmergencia = {
    prioridad_ID: null, mensaje: null, ficha_medica: null,
    contactos: [
      { contacto_emergencia_ID: 1, nombre_contacto: 'Mamá', num_emergencia: '+56912345678', compartir_antecedentes: true },
      { contacto_emergencia_ID: 2, nombre_contacto: 'Papá', num_emergencia: '+56987654321', compartir_antecedentes: true },
    ],
  }
  const api: PerfilApi = {
    cargar: vi.fn(async () => perfil), guardar: vi.fn(), eliminarContacto: vi.fn(),
    guardarContacto: vi.fn(async (datos, id) => {
      perfil = { ...perfil, contactos: perfil.contactos.map((c) => c.contacto_emergencia_ID === id ? { ...c, ...datos } : c) }
      return perfil
    }),
  }
  const montar = () => render(<PerfilForm nombreUsuario="Ana" correo="a@emergen.test" onGuardar={async () => {}} api={api} />)
  montar()
  await screen.findByText('Mamá')
  fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0])
  fireEvent.change(screen.getByLabelText('Compartir antecedentes médicos por WhatsApp'), { target: { value: 'false' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar contacto' }))
  await waitFor(() => expect(api.guardarContacto).toHaveBeenCalledWith(expect.objectContaining({ compartir_antecedentes: false }), 1))
  expect(perfil.contactos[1].compartir_antecedentes).toBe(true)
  cleanup()
  montar()
  await screen.findByText('Mamá')
  expect(screen.getByText('Antecedentes médicos: Deshabilitado')).toBeTruthy()
  fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0])
  expect((screen.getByLabelText('Compartir antecedentes médicos por WhatsApp') as HTMLSelectElement).value).toBe('false')
  fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[1])
  expect((screen.getByLabelText('Compartir antecedentes médicos por WhatsApp') as HTMLSelectElement).value).toBe('true')
})
