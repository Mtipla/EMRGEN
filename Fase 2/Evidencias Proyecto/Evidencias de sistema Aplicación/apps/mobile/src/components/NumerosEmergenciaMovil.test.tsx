import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import NumerosEmergenciaMovil from './NumerosEmergenciaMovil';

const native = vi.hoisted(() => ({
  platform: 'android',
  openDialer: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => native.platform },
  registerPlugin: () => ({ openDialer: native.openDialer }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  native.platform = 'android';
  native.openDialer.mockResolvedValue(undefined);
});
afterEach(cleanup);

test('cada número solicita abrir el marcador de Android con el número seleccionado', async () => {
  render(<NumerosEmergenciaMovil />);
  const links = screen.getAllByRole('link');
  for (const [index, numero] of ['131', '132', '133'].entries()) {
    await userEvent.click(links[index]!);
    expect(native.openDialer).toHaveBeenLastCalledWith({ numero });
  }
});

test('si no se puede abrir el marcador conserva los números e indica la alternativa manual', async () => {
  native.openDialer.mockRejectedValue(new Error('Sin marcador'));
  render(<NumerosEmergenciaMovil />);
  await userEvent.click(screen.getByRole('link', { name: /132/ }));
  expect((await screen.findByRole('alert')).textContent).toContain('Puedes marcar 132 manualmente');
  expect(screen.getAllByRole('link')).toHaveLength(3);
});

test('la versión web conserva los enlaces telefónicos sin depender del plugin Android', () => {
  native.platform = 'web';
  render(<NumerosEmergenciaMovil />);
  expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
    'tel:131', 'tel:132', 'tel:133',
  ]);
  expect(native.openDialer).not.toHaveBeenCalled();
});
