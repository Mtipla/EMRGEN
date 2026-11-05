import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import Home from './Home';

const session = vi.hoisted(() => ({
  user: {
    usuario_ID: 7,
    nombre_usuario: 'Usuario de prueba',
    rol_ID: 3,
    estado_ID: 1,
    usuario_principal_ID: null,
    plan_efectivo: true,
  },
}));

vi.mock('@ionic/react', () => {
  const Container = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  return {
    IonPage: Container,
    IonHeader: Container,
    IonToolbar: Container,
    IonTitle: Container,
    IonButtons: Container,
    IonButton: Container,
    IonPopover: Container,
    IonList: Container,
    IonItem: Container,
    IonContent: Container,
    useIonRouter: () => ({ push: vi.fn() }),
    useIonViewWillEnter: vi.fn(),
    useIonViewDidLeave: vi.fn(),
  };
});
vi.mock('../lib/session', () => ({
  getUser: () => session.user,
  apiFetch: () => new Promise(() => {}),
  saveSession: vi.fn(),
  clearSession: vi.fn(),
}));
vi.mock('../components/AlertaVolumen', () => ({ default: () => null }));
vi.mock('../components/ConfigurarAlerta', () => ({ default: () => null }));
vi.mock('../components/AlertaSos', () => ({ default: () => null }));
vi.mock('../components/AlertasActivas', () => ({ default: () => <h2>Alertas</h2> }));

afterEach(() => {
  cleanup();
  session.user.plan_efectivo = true;
});

test('el Home muestra los teléfonos entre las características de la cuenta y las alertas', () => {
  render(<Home />);
  expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
    'Características de tu cuenta', 'Números de emergencia', 'Alertas',
  ]);
  expect(screen.getByText('Una vez presionado un número de emergencia, se redirigirá y digitará para un llamado rápido.')).not.toBeNull();
  expect(screen.getAllByRole('link')).toHaveLength(3);
});

test('los números del Home están disponibles aunque la cuenta no tenga plan', () => {
  session.user.plan_efectivo = false;
  render(<Home />);
  expect(screen.getByRole('button', { name: 'Alerta rápida en la APP' }).getAttribute('aria-disabled')).toBe('true');
  expect(screen.getByRole('heading', { name: 'Números de emergencia' })).not.toBeNull();
  expect(screen.getAllByRole('link')).toHaveLength(3);
});
