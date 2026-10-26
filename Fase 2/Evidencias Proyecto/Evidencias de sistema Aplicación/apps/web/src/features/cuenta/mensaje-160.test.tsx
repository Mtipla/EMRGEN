import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { PerfilForm, type PerfilApi } from '@repo/ui/perfil-form'

afterEach(() => cleanup())

test('CA-05.1: el mensaje admite 160 caracteres y el contador cambia a rojo al llegar al límite', async () => {
  const perfil = { prioridad_ID: null, mensaje: null, contactos: [], ficha_medica: null }
  const api = { cargar: vi.fn().mockResolvedValue(perfil), guardar: vi.fn(), guardarContacto: vi.fn(), eliminarContacto: vi.fn() }
  render(<PerfilForm nombreUsuario="Ana" correo="a@emergen.test" variante="usuario" onGuardar={async () => {}} api={api as unknown as PerfilApi} />)

  const campo = (await screen.findByLabelText(/Mensaje personalizado/)) as HTMLTextAreaElement
  expect(campo.maxLength).toBe(160)

  fireEvent.change(campo, { target: { value: 'a'.repeat(159) } })
  const contador = screen.getByText('159/160')
  expect(contador.className).not.toContain('wf-ayuda--error')

  fireEvent.change(campo, { target: { value: 'a'.repeat(160) } })
  expect(screen.getByText('160/160').className).toContain('wf-ayuda--error')
})
