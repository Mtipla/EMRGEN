import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import AlertaSos from './AlertaSos';
import AlertasActivas from './AlertasActivas';
import { enviarSos, finalizarSos, listarActivas, type Alerta } from '../lib/sos';
import { obtenerUbicacionSos } from '../lib/ubicacion-sos';

vi.mock('../lib/ubicacion-sos', () => ({ obtenerUbicacionSos: vi.fn() }));

vi.mock('../lib/sos', async (original) => ({
  ...(await original<typeof import('../lib/sos')>()),
  enviarSos: vi.fn(),
  finalizarSos: vi.fn(),
  listarActivas: vi.fn(),
}));

const alerta: Alerta = {
  alerta_id: 81,
  usuario_id: 7,
  estado_alerta: 'ACTIVA',
  prioridad_id: 3,
  mensaje: 'Necesito ayuda',
  ubicacion: null,
  fecha_creacion: '2026-10-23T20:00:00Z',
  fecha_cierre: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(obtenerUbicacionSos).mockResolvedValue('SIMULADA: -33.4378,-70.6504');
  vi.stubGlobal('crypto', {
    randomUUID: () => '084fd63f-080d-441e-aa30-05ec7593796c',
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test('conserva la selección de emergencia, muestra los teléfonos después de Enviar SOS y confirma el registro', async () => {
  vi.mocked(enviarSos).mockResolvedValue(alerta);
  const onRegistrada = vi.fn();
  render(<AlertaSos onClose={vi.fn()} onRegistrada={onRegistrada} />);
  const enviar = screen.getByRole('button', { name: 'Enviar SOS' });
  const numeros = screen.getByRole('heading', {
    name: 'Números de emergencia',
  });
  expect(enviar.compareDocumentPosition(numeros) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
  await userEvent.click(enviar);
  expect(enviarSos).toHaveBeenCalledWith(1, expect.any(String), 'SIMULADA: -33.4378,-70.6504');
  expect(await screen.findByText('ACTIVA')).not.toBeNull();
  expect(onRegistrada).toHaveBeenCalledOnce();
});

test('un envío fallido permite reintentar con la misma clave sin mostrar un éxito falso', async () => {
  vi.mocked(enviarSos)
    .mockRejectedValueOnce(new Error('Servicio no disponible'))
    .mockResolvedValueOnce(alerta);
  const onRegistrada = vi.fn();
  render(<AlertaSos onClose={vi.fn()} onRegistrada={onRegistrada} />);
  await userEvent.click(screen.getByRole('button', { name: 'Enviar SOS' }));
  expect((await screen.findByRole('alert')).textContent).toContain('Servicio no disponible');
  expect(onRegistrada).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Enviar SOS' }));
  expect(await screen.findByText('ACTIVA')).not.toBeNull();
  expect(vi.mocked(enviarSos).mock.calls[0]).toEqual(vi.mocked(enviarSos).mock.calls[1]);
  expect(obtenerUbicacionSos).toHaveBeenCalledTimes(1);
});

test('el listado muestra únicamente alertas activas del usuario', async () => {
  vi.mocked(listarActivas).mockResolvedValue([
    alerta,
    { ...alerta, alerta_id: 82, usuario_id: 8 },
    { ...alerta, alerta_id: 83, estado_alerta: 'FINALIZADA' },
  ]);
  render(<AlertasActivas usuarioId={7} version={0} />);
  expect(await screen.findByRole('heading', { name: 'Alerta #81' })).not.toBeNull();
  expect(screen.queryByRole('heading', { name: 'Alerta #82' })).toBeNull();
  expect(screen.queryByRole('heading', { name: 'Alerta #83' })).toBeNull();
});

test('informa la causa de la ubicación no disponible y mantiene el envío del SOS', async () => {
  vi.mocked(obtenerUbicacionSos).mockImplementationOnce(async (onUnavailable) => {
    onUnavailable?.(
      'El dispositivo no pudo determinar tu ubicación. Comprueba que la ubicación esté activada.',
    );
    return undefined;
  });
  vi.mocked(enviarSos).mockResolvedValue(alerta);
  render(<AlertaSos onClose={vi.fn()} onRegistrada={vi.fn()} />);
  await userEvent.click(screen.getByRole('button', { name: 'Enviar SOS' }));
  expect(await screen.findByText(/El dispositivo no pudo determinar tu ubicación/)).not.toBeNull();
  expect(screen.getByText('ACTIVA')).not.toBeNull();
  expect(enviarSos).toHaveBeenCalledWith(3, expect.any(String), undefined);
});

test('solo finaliza con PIN válido; un PIN incorrecto conserva la alerta activa', async () => {
  let cerrada = false;
  vi.mocked(listarActivas).mockImplementation(async () => (cerrada ? [] : [alerta]));
  vi.mocked(finalizarSos).mockImplementation(async (_id, pin) => {
    if (pin !== '0007') throw new Error('PIN incorrecto');
    cerrada = true;
    return { ...alerta, estado_alerta: 'FINALIZADA' };
  });
  render(<AlertasActivas usuarioId={7} version={0} />);
  await userEvent.click(await screen.findByRole('button', { name: 'Finalizar alerta' }));
  const input = screen.getByLabelText('PIN');
  fireEvent.change(input, { target: { value: '123' } });
  await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  expect(finalizarSos).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: '9999' } });
  await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  expect((await screen.findByRole('alert')).textContent).toContain('PIN incorrecto');
  expect(screen.getByText('ACTIVA')).not.toBeNull();
  fireEvent.change(input, { target: { value: '0007' } });
  await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  await waitFor(() => expect(screen.queryByText('ACTIVA')).toBeNull());
  expect(screen.getByText('Alerta #81 finalizada.')).not.toBeNull();
  expect(finalizarSos).toHaveBeenLastCalledWith(81, '0007');
});

test('cancelar el ingreso de PIN no finaliza la alerta', async () => {
  vi.mocked(listarActivas).mockResolvedValue([alerta]);
  render(<AlertasActivas usuarioId={7} version={0} />);
  await userEvent.click(await screen.findByRole('button', { name: 'Finalizar alerta' }));
  await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(finalizarSos).not.toHaveBeenCalled();
  expect(screen.getByText('ACTIVA')).not.toBeNull();
});
