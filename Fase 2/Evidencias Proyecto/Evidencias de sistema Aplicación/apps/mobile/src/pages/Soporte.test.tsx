import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import type { Ticket } from "@repo/ui/soporte";
import { internalFetch } from "../lib/session";
import Soporte from "./Soporte";

const lifecycle = vi.hoisted(() => ({
  enter: () => {},
  leave: () => {},
  appState: (() => {}) as (state: { isActive: boolean }) => void,
  remove: vi.fn(),
}));

vi.mock("@ionic/react", () => {
  const Container = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    IonPage: Container,
    IonHeader: Container,
    IonToolbar: Container,
    IonButtons: Container,
    IonTitle: Container,
    IonContent: Container,
    IonBackButton: () => null,
    IonButton: ({
      children,
      onClick,
    }: {
      children?: ReactNode;
      onClick: () => void;
    }) => <button onClick={onClick}>{children}</button>,
    useIonViewWillEnter: (callback: () => void) => {
      lifecycle.enter = callback;
    },
    useIonViewDidLeave: (callback: () => void) => {
      lifecycle.leave = callback;
    },
  };
});
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => true },
}));
vi.mock("@capacitor/app", () => ({
  App: {
    addListener: vi.fn(
      (_event: string, callback: (state: { isActive: boolean }) => void) => {
        lifecycle.appState = callback;
        return Promise.resolve({ remove: lifecycle.remove });
      },
    ),
  },
}));
vi.mock("../lib/session", () => ({
  internalFetch: vi.fn(),
  errorText: (cause: unknown) =>
    cause instanceof Error ? cause.message : "Error de conexión",
}));

const inicial: Ticket = {
  ticket_id: 19,
  usuario_id: 7,
  categoria_id: 1,
  categoria: "Aplicación móvil",
  descripcion: "Consulta de prueba",
  estado: "ABIERTO",
  solucion: null,
};
let actual: Ticket;

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  actual = { ...inicial };
  vi.mocked(internalFetch).mockImplementation(async (path) =>
    path.endsWith("/categorias")
      ? [{ categoria_id: 1, nombre: "Aplicación móvil" }]
      : [{ ...actual }],
  );
});
afterEach(async () => {
  cleanup();
  await Promise.resolve();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

async function abrir() {
  render(<Soporte />);
  await act(async () => {});
}
async function siguienteConsulta() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
}
const consultas = () =>
  vi
    .mocked(internalFetch)
    .mock.calls.filter(([path]) => path === "/tickets-soporte");

test("refleja el cierre y la solución del panel sin perder el borrador ni colapsar el detalle", async () => {
  await abrir();
  expect(screen.getByText("ABIERTO")).not.toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Ver solución del ticket 19" }),
  );
  fireEvent.change(screen.getByLabelText(/Descripción/), {
    target: { value: "Borrador sin enviar" },
  });
  actual = {
    ...actual,
    estado: "CERRADO",
    solucion: "Respuesta guardada en el panel",
  };
  await siguienteConsulta();
  expect(screen.getByText("CERRADO")).not.toBeNull();
  expect(screen.getByText("Respuesta guardada en el panel")).not.toBeNull();
  expect(
    (screen.getByLabelText(/Descripción/) as HTMLTextAreaElement).value,
  ).toBe("Borrador sin enviar");
  expect(consultas()).toHaveLength(2);
  expect(consultas()[1][1]).toMatchObject({
    cache: "no-store",
    signal: expect.any(AbortSignal),
  });
  expect(
    vi
      .mocked(internalFetch)
      .mock.calls.filter(([path]) => path.endsWith("/categorias")),
  ).toHaveLength(1);
});

test("deja de consultar al salir de la página Ionic y actualiza inmediatamente al volver", async () => {
  await abrir();
  act(() => lifecycle.leave());
  await act(async () => {
    await vi.advanceTimersByTimeAsync(9000);
  });
  expect(consultas()).toHaveLength(1);
  actual = { ...actual, estado: "CERRADO" };
  await act(async () => lifecycle.enter());
  expect(screen.getByText("CERRADO")).not.toBeNull();
  expect(consultas()).toHaveLength(2);
});

test("pausa en segundo plano y recupera los cambios al reanudar la app nativa", async () => {
  await abrir();
  act(() => lifecycle.appState({ isActive: false }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(9000);
  });
  expect(consultas()).toHaveLength(1);
  actual = { ...actual, estado: "CERRADO" };
  await act(async () => lifecycle.appState({ isActive: true }));
  expect(screen.getByText("CERRADO")).not.toBeNull();
});

test("conserva los datos ante un fallo de red y vuelve a sincronizar al recuperarse", async () => {
  await abrir();
  vi.mocked(internalFetch).mockRejectedValueOnce(new TypeError("Sin conexión"));
  await siguienteConsulta();
  expect(screen.getByText("ABIERTO")).not.toBeNull();
  expect(screen.getAllByRole("alert")[0].textContent).toContain(
    "El listado puede estar desactualizado",
  );
  actual = { ...actual, estado: "CERRADO" };
  await siguienteConsulta();
  expect(screen.getByText("CERRADO")).not.toBeNull();
  expect(screen.queryByRole("alert")).toBeNull();
});

test("actualiza a petición del usuario y elimina el listener nativo al desmontar", async () => {
  await abrir();
  actual = { ...actual, estado: "CERRADO" };
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Actualizar" })),
  );
  expect(screen.getByText("CERRADO")).not.toBeNull();
  cleanup();
  await act(async () => {
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(9000);
  });
  expect(lifecycle.remove).toHaveBeenCalledOnce();
  expect(consultas()).toHaveLength(2);
});
