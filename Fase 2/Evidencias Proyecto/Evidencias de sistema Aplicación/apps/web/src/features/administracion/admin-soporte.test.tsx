import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

vi.mock('@repo/api-client', async (original) => ({
  ...await original<typeof import('@repo/api-client')>(), initFirebase: vi.fn(() => ({})),
}))
const fetchMock = vi.fn<typeof fetch>()
const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } })
const cuenta = { usuario_ID: 9, nombre_usuario: 'Principal Demo', correo_usuario: 'principal@emergen.test', rol_ID: 3, estado_ID: 1, numeros_vinculados: 1, alertas_generadas: 1 }
let trabajadores: (typeof cuenta)[] = []
let plan = { plan_ID: 2, cupos_apadrinados_adq: 2, cupos_ocupados: 1, cupos_disponibles: 1 }
let yo: Record<string, unknown>
let ticket = { ticket_id: 1, usuario_id: 9, nombre_usuario: cuenta.nombre_usuario, correo_usuario: cuenta.correo_usuario,
  descripcion: 'No puedo acceder a mi cuenta', estado: 'ABIERTO', solucion: null as string | null, categoria_id: 1, categoria: 'Cuenta' }

function HistorialPruebas() {
  const navigate = useNavigate()
  return <button onClick={() => navigate(-1)}>Atrás de prueba</button>
}

async function abrir(ruta: string, rol = 2, historial = false) {
  yo = { ...cuenta, usuario_ID: 5, nombre_usuario: 'Soporte Demo', rol_ID: rol, requiere_pin: false, plan_efectivo: true }
  localStorage.setItem('emergen.token', 'token-test')
  localStorage.setItem('emergen.user', JSON.stringify(yo))
  vi.resetModules()
  const { default: App } = await import('../../App')
  render(<MemoryRouter initialEntries={[ruta]}><App />{historial && <HistorialPruebas />}</MemoryRouter>)
}

beforeEach(() => {
  localStorage.clear()
  ticket = { ...ticket, estado: 'ABIERTO', solucion: null, categoria: 'Cuenta' }
  trabajadores = []
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(async (url, init) => {
    const path = new URL(String(url)).pathname
    if (path === '/usuarios/me') {
      if (init?.method === 'PATCH') yo = { ...yo, ...JSON.parse(String(init.body)) }
      return json(yo)
    }
    if (path === '/usuarios/me/perfil') return json({ prioridad_ID: null, mensaje: null, contactos: [], ficha_medica: null })
    if (path === '/admin/usuarios') return json([cuenta, ...trabajadores])
    if (path === '/admin/usuarios/trabajadores') return json(trabajadores)
    if (path === '/admin/usuarios/planes') return json([{ plan_ID: 2, nombre_plan: 'Premium' }])
    if (path === '/admin/usuarios/9/plan' && init?.method === 'PUT') {
      plan = { ...plan, ...JSON.parse(String(init.body)) }
      return json({ ...plan, cupos_disponibles: plan.cupos_apadrinados_adq - plan.cupos_ocupados })
    }
    if (path === '/admin/usuarios/trabajadores/19') {
      if (init?.method === 'DELETE') trabajadores = []
      if (init?.method === 'PATCH') {
        const cambios = JSON.parse(String(init.body))
        trabajadores = trabajadores.map((t) => ({ ...t, ...(cambios.correo_usuario && { correo_usuario: cambios.correo_usuario }),
          ...(cambios.rol_ID !== undefined && { rol_ID: cambios.rol_ID }) }))
      }
      return json(trabajadores[0])
    }
    if (path === '/admin/usuarios/9') return json({ usuario: cuenta, plan, apadrinados: [], contactos: [
      { contacto_emergencia_ID: 11, nombre_contacto: 'Contacto real', num_emergencia: '+56912345678' },
    ], alertas: [{ alerta_id: 22, estado_alerta: 'FINALIZADA', prioridad: 'MEDICO', mensaje: 'Necesito ayuda',
      ubicacion: 'Santiago', fecha_creacion: '2026-10-27T12:00:00Z', fecha_cierre: '2026-10-27T12:10:00Z' }] })
    if (path === '/admin/ventas') return json({ ventas: [{ venta_id: 73, usuario_id: 9, nombre_usuario: 'Comprador real', correo_usuario: cuenta.correo_usuario,
      fecha_venta: '2026-10-27T12:00:00Z', total_venta: 5000, estado: 'PAGADO', metodo_pago: 'PAYPAL', detalles: [] }], total: 1, total_pagado_clp: 5000 })
    if (path.endsWith('/tickets-soporte/estados')) return json([{ estado_id: 1, nombre: 'ABIERTO' }, { estado_id: 2, nombre: 'EN PROCESO' }, { estado_id: 3, nombre: 'CERRADO' }])
    if (path.endsWith('/tickets-soporte/1') && init?.method === 'PATCH') {
      const cambios = JSON.parse(String(init.body))
      ticket = { ...ticket, ...(cambios.estado && { estado: cambios.estado }), ...(cambios.solucion && { solucion: cambios.solucion }) }
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
  expect(await screen.findByText('Contacto real')).toBeTruthy()
  expect(screen.getByText('+56912345678')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Desglose de Alertas Generadas (1)' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Añadir' })).toBeNull()
  expect(screen.queryByRole('button', { name: /Guardar|Eliminar|acceso/i })).toBeNull()
  expect(screen.queryByRole('textbox')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Descargar' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: /Soporte Demo/ }))
  const menu = screen.getByRole('navigation', { name: 'Menú de usuario' })
  expect(Array.from(menu.querySelectorAll(':scope > a')).map((a) => a.getAttribute('href'))).toEqual([
    '/perfil', '/administracion/cuentas', '/administracion/compras', '/administracion/tickets',
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
  expect(Array.from(acciones?.querySelectorAll('button') ?? []).map((boton) => boton.textContent)).toEqual(['Cerrar', 'Enviar verificación a Administrador', 'Guardar cambios'])
  fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'CERRADO' } })
  fireEvent.change(screen.getByLabelText('Solución'), { target: { value: 'Acceso restablecido' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
  expect(screen.getByText('¿Estás seguro de cerrar este ticket?')).toBeTruthy()
  expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'PATCH')).toHaveLength(0)
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(screen.queryByText('¿Estás seguro de cerrar este ticket?')).toBeNull()
  expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'PATCH')).toHaveLength(0)
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
  fireEvent.click(screen.getByRole('button', { name: 'Sí, cerrar ticket' }))
  expect(await screen.findByText('Ticket actualizado.')).toBeTruthy()
  const peticion = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
  expect(String(peticion?.[0])).toContain('/internal/v1/tickets-soporte/1')
  expect(JSON.parse(String(peticion?.[1]?.body))).toEqual({ estado: 'CERRADO', solucion: 'Acceso restablecido', confirmar_cierre: true })
  expect(peticion?.[1]?.headers).toMatchObject({ Authorization: 'Bearer token-test' })
  await waitFor(() => expect(screen.queryByLabelText('Solución')).toBeNull())
  expect(screen.queryByLabelText('Estado')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull()
  expect(screen.getByText('Acceso restablecido')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: /^Cerrar$/ }))
  expect(screen.queryByLabelText('Solución')).toBeNull()
  expect(screen.queryByText(ticket.descripcion)).toBeNull()
  fireEvent.click(screen.getByText('Principal Demo (ID 9)'))
  expect(screen.getByText('Acceso restablecido')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Enviar verificación a Administrador' })).toBeNull()
  expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'PATCH')).toHaveLength(1)
})

test.each(['/administracion/trabajadores', '/administracion/alertas', '/administracion/planes'])(
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
  expect(screen.getByRole('button', { name: 'Pasar a Acceso Parcial' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Modificar / Guardar cambios' })).toBeTruthy()
})

test('SOPORTE envía a verificación un ticket abierto y queda inmediatamente en solo lectura', async () => {
  ticket = { ...ticket, estado: 'ABIERTO' }
  await abrir('/administracion/tickets')
  fireEvent.click(await screen.findByText('Principal Demo (ID 9)'))
  fireEvent.change(screen.getByLabelText('Solución'), { target: { value: 'Borrador sin guardar' } })
  fireEvent.click(screen.getByRole('button', { name: 'Enviar verificación a Administrador' }))
  expect(await screen.findByText('Verificación enviada al administrador. Ticket EN PROCESO.')).toBeTruthy()
  const [, init] = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')!
  expect(JSON.parse(String(init?.body))).toEqual({ estado: 'EN PROCESO', enviar_verificacion: true })
  expect(screen.queryByLabelText('Solución')).toBeNull()
  expect(screen.queryByLabelText('Estado')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Enviar verificación a Administrador' })).toBeNull()
  expect(screen.getByText('Solo el administrador puede modificar un ticket EN PROCESO.')).toBeTruthy()
  expect(screen.getByText('Sin solución registrada.')).toBeTruthy()
  expect(screen.queryByText('Borrador sin guardar')).toBeNull()
  expect(ticket.solucion).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: /^Cerrar$/ }))
  fireEvent.click(screen.getByText('Principal Demo (ID 9)'))
  expect(screen.queryByLabelText('Solución')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Enviar verificación a Administrador' })).toBeNull()
  expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'PATCH')).toHaveLength(1)
})

test.each([2, 1])('un ticket que ya está EN PROCESO solo permite edición al ADMIN (rol %s)', async (rol) => {
  ticket = { ...ticket, estado: 'EN PROCESO', solucion: 'Respuesta registrada' }
  await abrir('/administracion/tickets', rol)
  fireEvent.click(await screen.findByText('Principal Demo (ID 9)'))
  expect(Boolean(screen.queryByLabelText('Estado'))).toBe(rol === 1)
  expect(Boolean(screen.queryByLabelText('Solución'))).toBe(rol === 1)
  expect(Boolean(screen.queryByRole('button', { name: 'Guardar cambios' }))).toBe(rol === 1)
  expect(screen.queryByRole('button', { name: 'Enviar verificación a Administrador' })).toBeNull()
  if (rol === 1) {
    fireEvent.change(screen.getByLabelText('Solución'), { target: { value: 'Respuesta revisada por el administrador' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByText('Ticket actualizado.')).toBeTruthy()
    expect(ticket.solucion).toBe('Respuesta revisada por el administrador')
  } else {
    expect(screen.getByText('Respuesta registrada')).toBeTruthy()
    cleanup()
    await abrir('/administracion/tickets', rol)
    fireEvent.click(await screen.findByText('Principal Demo (ID 9)'))
    expect(screen.queryByLabelText('Solución')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false)
  }
})

test('ADMINISTRADOR puede editar y reabrir un ticket cerrado', async () => {
  ticket = { ...ticket, estado: 'CERRADO', solucion: 'Solución original' }
  await abrir('/administracion/tickets', 1)
  fireEvent.click(await screen.findByText('Principal Demo (ID 9)'))
  expect(screen.queryByRole('button', { name: 'Enviar verificación a Administrador' })).toBeNull()
  fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'EN PROCESO' } })
  fireEvent.change(screen.getByLabelText('Solución'), { target: { value: 'Solución revisada' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
  expect(await screen.findByText('Ticket actualizado.')).toBeTruthy()
  const [, init] = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')!
  expect(JSON.parse(String(init?.body))).toEqual({ estado: 'EN PROCESO', solucion: 'Solución revisada' })
})

test('perfil de USUARIO usa nombre de usuario y conserva los números solo en contactos de emergencia', async () => {
  await abrir('/perfil', 3)
  expect(await screen.findByLabelText('Número del contacto')).toBeTruthy()
  expect(screen.queryByLabelText('Nombre')).toBeNull()
  expect(screen.queryByLabelText('Número telefónico')).toBeNull()
  fireEvent.change(screen.getByLabelText('Nombre de usuario'), { target: { value: 'usuario.editado' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
  expect((await screen.findAllByText('Datos guardados.')).length).toBeGreaterThan(0)
  const [, init] = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')!
  expect(JSON.parse(String(init?.body))).toEqual({ nombre_usuario: 'usuario.editado', correo_usuario: cuenta.correo_usuario })
})

test.each([2, 1])('perfil del personal (rol %s) muestra y envía solo sus campos autorizados', async (rol) => {
  await abrir('/perfil', rol)
  expect(await screen.findByRole('heading', { name: 'Modificar usuario' })).toBeTruthy()
  expect(screen.queryByLabelText('Correo electrónico')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Cambiar contraseña' })).toBeNull()
  expect(screen.queryByLabelText('Teléfono')).toBeNull()
  expect(screen.queryByLabelText('Nombre')).toBeNull()
  expect(Boolean(screen.queryByRole('button', { name: 'Modificar PIN' }))).toBe(rol === 1)
  fireEvent.change(screen.getByLabelText('Nombre de usuario'), { target: { value: 'usuario.editado' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
  expect(await screen.findByText('Datos guardados.')).toBeTruthy()
  const [, init] = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')!
  expect(JSON.parse(String(init?.body))).toEqual({
    nombre_usuario: 'usuario.editado',
  })
})

test('administrar trabajadores muestra habilitación por rol, conserva deshabilitados al recargar y permite habilitarlos', async () => {
  trabajadores = [{ ...cuenta, usuario_ID: 19, nombre_usuario: 'Trabajador real', rol_ID: 2 }]
  await abrir('/administracion/trabajadores', 1)
  fireEvent.click(await screen.findByText('Trabajador real'))
  expect(screen.queryByRole('heading', { name: 'Asignar rol SOPORTE a una cuenta existente' })).toBeNull()
  expect(screen.queryByLabelText('Cuenta de usuario')).toBeNull()
  expect(screen.queryByText('Principal Demo')).toBeNull()
  expect(screen.getAllByRole('columnheader').map((celda) => celda.textContent)).toEqual([
    'ID trabajador', 'Nombre de usuario', 'Correo trabajador', 'Rol', 'Habilitado/Inhabilitado',
  ])
  expect(screen.getByRole('cell', { name: 'Habilitado' })).toBeTruthy()
  fireEvent.change(screen.getAllByLabelText('Correo trabajador')[0], { target: { value: 'nuevo@emergen.test' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar correo' }))
  expect(await screen.findByText('Correo actualizado.')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Modificar PIN' }))
  const dialogo = screen.getByRole('dialog')
  fireEvent.change(within(dialogo).getByLabelText('PIN'), { target: { value: '0042' } })
  fireEvent.change(within(dialogo).getByLabelText('Confirmar PIN'), { target: { value: '0042' } })
  fireEvent.submit(within(dialogo).getByLabelText('PIN').closest('form')!)
  expect(await screen.findByText('PIN actualizado.')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Deshabilitar cuenta' }))
  expect(await screen.findByText('Cuenta deshabilitada.')).toBeTruthy()
  expect(await screen.findByRole('button', { name: 'Habilitar cuenta' })).toBeTruthy()
  expect(screen.getByRole('cell', { name: 'Inhabilitado' })).toBeTruthy()
  expect(screen.getByRole('cell', { name: 'USUARIO' })).toBeTruthy()
  expect(screen.getByText('Trabajador real')).toBeTruthy()
  cleanup()
  await abrir('/administracion/trabajadores', 1)
  fireEvent.click(await screen.findByText('Trabajador real'))
  expect(screen.getByRole('cell', { name: 'Inhabilitado' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Habilitar cuenta' }))
  expect(await screen.findByText('Cuenta habilitada.')).toBeTruthy()
  expect(await screen.findByRole('button', { name: 'Deshabilitar cuenta' })).toBeTruthy()
  expect(screen.getByRole('cell', { name: 'Habilitado' })).toBeTruthy()
  expect(screen.getByRole('cell', { name: 'SOPORTE' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar trabajador' }))
  expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(false)
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí' }))
  expect(await screen.findByText('Trabajador eliminado.')).toBeTruthy()
  await waitFor(() => expect(screen.queryByText('Trabajador real')).toBeNull())
  const cambios = fetchMock.mock.calls.filter(([, init]) => init?.method === 'PATCH').map(([, init]) => JSON.parse(String(init?.body)))
  expect(cambios).toEqual([{ correo_usuario: 'nuevo@emergen.test' }, { PIN: '0042' }, { rol_ID: 3 }, { rol_ID: 2 }])
})

test('gestión de planes y cupos solo permite modificar el plan y los cupos adquiridos', async () => {
  await abrir('/administracion/planes', 1)
  fireEvent.click(await screen.findByText('Principal Demo'))
  await waitFor(() => expect((screen.getByLabelText('Plan vigente') as HTMLSelectElement).value).toBe('2'))
  expect(screen.queryByLabelText('Nombre usuario')).toBeNull()
  expect(screen.queryByLabelText('Correo')).toBeNull()
  expect(screen.queryByRole('button', { name: /Eliminar|acceso/i })).toBeNull()
  fireEvent.change(screen.getByLabelText('Cupos de apadrinados (0-5)'), { target: { value: '3' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar plan y cupos' }))
  expect(await screen.findByText('Plan y cupos guardados.')).toBeTruthy()
  const [, init] = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT')!
  expect(JSON.parse(String(init?.body))).toEqual({ plan_ID: 2, cupos_apadrinados_adq: 3 })
})

test.each([
  ['PAGOS Y PLANES', 'Gestión de planes y cupos de usuario', 'Gestión de planes y cupos de usuario'],
  ['ALERTAS', 'Alertas SOS', 'Alertas'],
  ['CUENTA Y ACCESO', 'Administrar cuentas', 'Administrar cuentas'],
  ['APLICACIÓN', 'Alertas SOS', 'Alertas'],
  ['APLICACION', 'Alertas SOS', 'Alertas'],
])('ADMIN deriva %s al módulo correspondiente y vuelve al mismo ticket', async (categoria, modulo, titulo) => {
  ticket = { ...ticket, categoria }
  await abrir('/administracion/tickets', 1)
  fireEvent.click(await screen.findByText('Principal Demo (ID 9)'))
  const descripcion = screen.getByRole('heading', { name: 'Descripción' })
  const sugerencia = screen.getByRole('heading', { name: 'Módulo sugerido' })
  const estado = screen.getByLabelText('Estado')
  expect(descripcion.compareDocumentPosition(sugerencia) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(sugerencia.compareDocumentPosition(estado) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: modulo }))
  const resumen = await screen.findByRole('complementary', { name: 'Resumen del ticket 1' })
  expect(within(resumen).getByText(ticket.descripcion)).toBeTruthy()
  expect(within(resumen).getByText(/Principal Demo/)).toBeTruthy()
  expect(await screen.findByRole('heading', { name: titulo })).toBeTruthy()
  fireEvent.click(within(resumen).getByRole('button', { name: 'Volver a editar solución' }))
  expect(await screen.findByLabelText('Solución')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Ticket 1' })).toBeTruthy()
  await waitFor(() => expect(screen.getByText('Principal Demo (ID 9)').closest('tr')?.getAttribute('aria-selected')).toBe('true'))
  expect(screen.queryByRole('complementary')).toBeNull()
  expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false)
})

test.each([['OTRO', 1], ['PAGOS Y PLANES', 2]])('no ofrece módulo sugerido para %s con rol %s', async (categoria, rol) => {
  ticket = { ...ticket, categoria }
  await abrir('/administracion/tickets', rol)
  fireEvent.click(await screen.findByText('Principal Demo (ID 9)'))
  expect(screen.getByLabelText('Solución')).toBeTruthy()
  expect(screen.queryByRole('heading', { name: 'Módulo sugerido' })).toBeNull()
})

test('conserva filtro, estado y solución en edición durante la resolución en el módulo de planes', async () => {
  ticket = { ...ticket, categoria: 'PAGOS Y PLANES', estado: 'EN PROCESO' }
  await abrir('/administracion/tickets', 1)
  await screen.findByRole('option', { name: 'EN PROCESO' })
  fireEvent.change(await screen.findByLabelText('Filtrar por estado'), { target: { value: 'EN PROCESO' } })
  fireEvent.click(await screen.findByText('Principal Demo (ID 9)'))
  fireEvent.change(screen.getByLabelText('Solución'), { target: { value: 'Cupos corregidos para el usuario' } })
  fireEvent.click(screen.getByRole('button', { name: 'Gestión de planes y cupos de usuario' }))
  fireEvent.click(await screen.findByRole('cell', { name: 'Principal Demo' }))
  await waitFor(() => expect((screen.getByLabelText('Plan vigente') as HTMLSelectElement).value).toBe('2'))
  fireEvent.change(screen.getByLabelText('Cupos de apadrinados (0-5)'), { target: { value: '4' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar plan y cupos' }))
  expect(await screen.findByText('Plan y cupos guardados.')).toBeTruthy()
  expect(screen.getByRole('complementary', { name: 'Resumen del ticket 1' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Volver a editar solución' }))
  expect((await screen.findByLabelText('Solución') as HTMLTextAreaElement).value).toBe('Cupos corregidos para el usuario')
  expect((screen.getByLabelText('Estado') as HTMLSelectElement).value).toBe('EN PROCESO')
  await waitFor(() => expect((screen.getByLabelText('Filtrar por estado') as HTMLSelectElement).value).toBe('EN PROCESO'))
  expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false)
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
  expect(await screen.findByText('Ticket actualizado.')).toBeTruthy()
  const [url, init] = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')!
  expect(String(url)).toContain('/tickets-soporte/1')
  expect(JSON.parse(String(init?.body))).toEqual({ solucion: 'Cupos corregidos para el usuario' })
})

test('cambiar de módulo descarta el resumen y la selección, incluso al volver con el historial', async () => {
  ticket = { ...ticket, categoria: 'PAGOS Y PLANES' }
  await abrir('/administracion/tickets', 1, true)
  fireEvent.click(await screen.findByText('Principal Demo (ID 9)'))
  fireEvent.change(screen.getByLabelText('Solución'), { target: { value: 'Borrador que debe descartarse' } })
  fireEvent.click(screen.getByRole('button', { name: 'Gestión de planes y cupos de usuario' }))
  expect(await screen.findByRole('complementary')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: /Soporte Demo/ }))
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Menú de usuario' })).getByRole('link', { name: 'Administrar cuentas' }))
  expect(await screen.findByRole('heading', { name: 'Administrar cuentas' })).toBeTruthy()
  expect(screen.queryByRole('complementary')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Atrás de prueba' }))
  expect(await screen.findByRole('heading', { name: 'Gestión de planes y cupos de usuario' })).toBeTruthy()
  expect(screen.queryByRole('complementary')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Atrás de prueba' }))
  expect(await screen.findByRole('heading', { name: 'Administrar Tickets de soporte' })).toBeTruthy()
  expect(screen.queryByLabelText('Solución')).toBeNull()
  fireEvent.click(await screen.findByText('Principal Demo (ID 9)'))
  expect((screen.getByLabelText('Solución') as HTMLTextAreaElement).value).toBe('')
})
