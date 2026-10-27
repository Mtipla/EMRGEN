import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { firebaseAuth } from '../../lib/api'
import { AuthForm } from './AuthForm'

vi.mock('../../lib/api', () => ({
  firebaseAuth: {
    signUp: vi.fn(),
    signIn: vi.fn(),
    sendEmailVerification: vi.fn(),
    deleteAccount: vi.fn(),
    refresh: vi.fn(),
  },
}))

const token = (verificado: boolean) => `h.${btoa(JSON.stringify({ email_verified: verificado }))}.s`
const sesion = (email: string, verificado: boolean) =>
  ({ idToken: token(verificado), refreshToken: 'r', email, uid: 'uid', expiresIn: 3600 })
const fetchMock = vi.fn<typeof fetch>()
const respuesta = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

function registrarse(correo: string) {
  render(<MemoryRouter><AuthForm onAuthenticated={() => {}} /></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'No tengo cuenta' }))
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } })
  fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { value: correo } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'ClaveSegura123' } })
  fireEvent.change(screen.getByLabelText('Confirmar'), { target: { value: 'ClaveSegura123' } })
  fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }))
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  vi.mocked(firebaseAuth.signUp).mockImplementation(async (email: string) => sesion(email, false))
  vi.mocked(firebaseAuth.sendEmailVerification).mockResolvedValue(undefined as never)
  vi.mocked(firebaseAuth.deleteAccount).mockResolvedValue(undefined as never)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

test('CA-01.1: correo ya registrado en la BD se rechaza sin pedir confirmación y se borra la cuenta de Firebase', async () => {
  fetchMock.mockResolvedValue(respuesta(409, { message: 'El correo ingresado es inválido o ya se encuentra registrado' }))
  registrarse('apadrinado@emergen.test')
  expect((await screen.findAllByText('El correo ingresado es inválido o ya se encuentra registrado')).length).toBeGreaterThan(0)
  expect(firebaseAuth.deleteAccount).toHaveBeenCalledWith(token(false))
  expect(firebaseAuth.sendEmailVerification).not.toHaveBeenCalled()
  expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeTruthy()
})

test('correo nuevo: el 403 del backend lleva a "Confirma tu correo" con el marco de la web', async () => {
  fetchMock.mockResolvedValue(respuesta(403, { message: 'Debes confirmar tu correo antes de crear la cuenta' }))
  registrarse('nueva@emergen.test')
  await screen.findByRole('heading', { name: 'Confirma tu correo' })
  expect(firebaseAuth.sendEmailVerification).toHaveBeenCalledWith(token(false))
  expect(firebaseAuth.deleteAccount).not.toHaveBeenCalled()
  expect(screen.getByRole('link', { name: /FIND ME/ })).toBeTruthy()
  expect(screen.queryByText('EMERGEN')).toBeNull()
  expect(document.querySelector('.auth-layout .auth-main .auth-card')).not.toBeNull()
})

test('regresión: con el correo ya confirmado se crea la cuenta como antes', async () => {
  vi.mocked(firebaseAuth.signUp).mockResolvedValue(sesion('ok@emergen.test', true))
  fetchMock.mockResolvedValue(respuesta(201, { usuario_ID: 1 }))
  registrarse('ok@emergen.test')
  await waitFor(() => expect(screen.getAllByText(/Correo confirmado y cuenta creada/).length).toBeGreaterThan(0))
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(firebaseAuth.sendEmailVerification).not.toHaveBeenCalled()
})

test('cuenta tipo Netflix: contraseña de la principal, perfil, PIN y cambio obligatorio del PIN temporal', async () => {
  const onAuthenticated = vi.fn()
  fetchMock
    .mockResolvedValueOnce(respuesta(201, { perfiles: [
      { usuario_ID: 3, nombre_usuario: 'Principal', tipo: 'PRINCIPAL', tiene_pin: true },
      { usuario_ID: 5, nombre_usuario: 'Ana', tipo: 'APADRINADO', tiene_pin: true },
      { usuario_ID: 6, nombre_usuario: 'Luis', tipo: 'APADRINADO', tiene_pin: false },
    ] }))
    .mockResolvedValueOnce(respuesta(201, { cambio_pin_requerido: true }))
    .mockResolvedValueOnce(respuesta(201, { access_token: 't', usuario: { usuario_ID: 5 } }))
  render(<MemoryRouter><AuthForm onAuthenticated={onAuthenticated} /></MemoryRouter>)
  fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { value: 'principal@emergen.test' } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'EmergenDev123!' } })
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

  await screen.findByRole('heading', { name: '¿Quién eres?' })
  expect((screen.getByRole('button', { name: /Luis/ }) as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Ana' }))
  expect(screen.getByRole('heading', { name: 'PIN de Ana' })).toBeTruthy()
  fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '1234' } })
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

  fireEvent.change(await screen.findByLabelText('PIN nuevo'), { target: { value: '4321' } })
  fireEvent.change(screen.getByLabelText('Repite el PIN nuevo'), { target: { value: '4321' } })
  fireEvent.click(screen.getByRole('button', { name: 'Cambiar PIN e ingresar' }))

  await waitFor(() => expect(onAuthenticated).toHaveBeenCalled())
  const cuerpos = fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init?.body)))
  expect(cuerpos[0]).not.toHaveProperty('PIN')
  expect(cuerpos[1]).toMatchObject({ correo_usuario: 'principal@emergen.test', perfil_ID: 5, PIN: '1234' })
  expect(cuerpos[2]).toMatchObject({ perfil_ID: 5, PIN: '1234', PIN_nuevo: '4321' })
})
