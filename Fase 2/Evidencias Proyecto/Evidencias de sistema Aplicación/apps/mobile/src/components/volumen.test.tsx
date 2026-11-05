import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import ConfigurarAlerta from "./ConfigurarAlerta";
import AlertaVolumen from "./AlertaVolumen";
import { apiFetch, restaurarSesionNativa } from "../lib/session";
import {
  volumeSos,
  volumenAndroid,
  type VolumeCapture,
  type VolumeSosState,
} from "../lib/volumen-nativo";

const native = vi.hoisted(() => ({
  id: "",
  counter: 0,
  capture: (() => {}) as (event: VolumeCapture) => void,
  state: (() => {}) as (state: VolumeSosState) => void,
  remove: vi.fn(),
}));
vi.mock("@ionic/react", () => {
  const Container = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    IonCard: Container,
    IonCardContent: Container,
    IonCardHeader: Container,
    IonCardTitle: Container,
  };
});
vi.mock("@capacitor/app", () => ({
  App: { addListener: vi.fn(async () => ({ remove: native.remove })) },
}));
vi.mock("../lib/session", () => ({
  apiFetch: vi.fn(),
  restaurarSesionNativa: vi.fn(),
  errorText: (error: unknown) =>
    error instanceof Error ? error.message : "Error",
}));
vi.mock("../lib/volumen-nativo", async (original) => ({
  ...(await original<typeof import("../lib/volumen-nativo")>()),
  volumenAndroid: vi.fn(() => true),
  volumeSos: {
    beginCapture: vi.fn(async () => {
      native.id = "capture-" + ++native.counter;
      return { captureId: native.id };
    }),
    endCapture: vi.fn(async () => {}),
    saveSequence: vi.fn(),
    setEnabled: vi.fn(),
    getStatus: vi.fn(),
    openAccessibilitySettings: vi.fn(),
    openAppSettings: vi.fn(),
    addListener: vi.fn(
      async (
        event: string,
        listener: typeof native.capture & typeof native.state,
      ) => {
        if (event === "volumeKey") native.capture = listener;
        if (event === "stateChanged") native.state = listener;
        return { remove: native.remove };
      },
    ),
  },
}));
const state: VolumeSosState = {
  enabled: false,
  recovering: false,
  location: {
    available: false,
    enabled: true,
    permitted: true,
    ageMs: -1,
    accuracyMeters: -1,
    message: "Activa segundo plano para obtener ubicación.",
  },
  authorized: true,
  accessibilityEnabled: true,
  accessibilityConnected: true,
  expiresAt: Date.now() + 3600000,
  sequence: ["UP", "UP", "DOWN"],
  captureId: "",
  lastResult: { message: "", alertId: 0 },
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(volumenAndroid).mockReturnValue(true);
  vi.mocked(volumeSos.getStatus).mockResolvedValue(state);
  vi.mocked(volumeSos.saveSequence).mockResolvedValue(state);
  vi.mocked(volumeSos.setEnabled).mockResolvedValue({
    ...state,
    enabled: true,
  });
  vi.mocked(restaurarSesionNativa).mockResolvedValue(undefined);
});
afterEach(async () => {
  cleanup();
  await Promise.resolve();
  vi.useRealTimers();
});
const click = async (name: string) =>
  act(async () => {
    fireEvent.click(screen.getByRole("button", { name }));
  });
function physical(keys: VolumeCapture["keys"], gap = false) {
  act(() =>
    native.capture({ captureId: native.id, keys, gap, overflow: false }),
  );
}

test("solo guarda después de dos pruebas físicas correctas y nunca activa ni envía durante la configuración", async () => {
  render(<ConfigurarAlerta onClose={vi.fn()} />);
  await click("Comenzar grabación");
  expect(screen.queryByRole("button", { name: "Volumen +" })).toBeNull();
  physical(["UP", "UP", "DOWN"]);
  await click("Terminar grabación");
  await click("Comenzar prueba 1");
  physical(["UP", "UP", "DOWN"]);
  await click("Comprobar prueba");
  expect(volumeSos.saveSequence).not.toHaveBeenCalled();
  await click("Comenzar prueba 2");
  physical(["UP", "UP", "DOWN"]);
  await click("Comprobar prueba");
  expect(volumeSos.saveSequence).toHaveBeenCalledWith({
    keys: ["UP", "UP", "DOWN"],
  });
  expect(screen.getByText("Secuencia guardada")).not.toBeNull();
  expect(volumeSos.setEnabled).not.toHaveBeenCalled();
  expect(apiFetch).not.toHaveBeenCalled();
});

test("una pausa larga invalida la prueba aunque las teclas coincidan", async () => {
  render(<ConfigurarAlerta onClose={vi.fn()} />);
  await click("Comenzar grabación");
  physical(["UP", "UP", "DOWN"]);
  await click("Terminar grabación");
  await click("Comenzar prueba 1");
  physical(["UP", "UP", "DOWN"], true);
  await click("Comprobar prueba");
  expect(screen.getByRole("alert").textContent).toContain("pausa larga");
  expect(volumeSos.saveSequence).not.toHaveBeenCalled();
});

test("cancela la captura incompleta a los 20 segundos y no guarda una secuencia inválida", async () => {
  vi.useFakeTimers();
  render(<ConfigurarAlerta onClose={vi.fn()} />);
  await click("Comenzar grabación");
  physical(["UP"]);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(20000);
  });
  expect(volumeSos.endCapture).toHaveBeenCalledWith({ captureId: native.id });
  expect(volumeSos.saveSequence).not.toHaveBeenCalled();
  expect(
    screen.getByRole("button", { name: "Comenzar grabación" }),
  ).not.toBeNull();
});

test("la web explica que necesita Android y no ofrece una secuencia simulada", () => {
  vi.mocked(volumenAndroid).mockReturnValue(false);
  render(<ConfigurarAlerta onClose={vi.fn()} />);
  expect(screen.getByText(/disponible en el APK Android/)).not.toBeNull();
  expect(volumeSos.beginCapture).not.toHaveBeenCalled();
});

test("impide activar sin una prioridad guardada y sincroniza la sesión antes de una activación válida", async () => {
  vi.mocked(apiFetch).mockImplementation(async (path) =>
    path === "/usuarios/me" ? { plan_efectivo: true } : { prioridad_ID: null },
  );
  render(<AlertaVolumen tienePlan onConfigurar={vi.fn()} />);
  await act(async () => {});
  await click("Activar segundo plano");
  expect(screen.getByRole("alert").textContent).toContain("finalidad");
  expect(volumeSos.setEnabled).not.toHaveBeenCalled();
  vi.mocked(apiFetch).mockImplementation(async (path) =>
    path === "/usuarios/me" ? { plan_efectivo: true } : { prioridad_ID: 2 },
  );
  await click("Activar segundo plano");
  expect(restaurarSesionNativa).toHaveBeenCalledOnce();
  expect(volumeSos.setEnabled).toHaveBeenCalledWith({ enabled: true });
  vi.mocked(apiFetch).mockClear();
  await click("Desactivar segundo plano");
  expect(volumeSos.setEnabled).toHaveBeenLastCalledWith({ enabled: false });
  expect(apiFetch).not.toHaveBeenCalled();
});

test("distingue una ubicación reciente de una búsqueda sin coordenadas y nunca envía al actualizar el estado", async () => {
  render(<AlertaVolumen tienePlan onConfigurar={vi.fn()} />);
  await act(async () => {});
  act(() =>
    native.state({
      ...state,
      enabled: true,
      location: {
        ...state.location,
        available: true,
        ageMs: 2000,
        accuracyMeters: 8.2,
        message: "Ubicación reciente disponible para el SOS.",
      },
    }),
  );
  expect(
    screen.getByText(/Ubicación reciente disponible/).textContent,
  ).toContain("±9 m");
  act(() =>
    native.state({
      ...state,
      enabled: true,
      location: {
        ...state.location,
        ageMs: 61000,
        message:
          "Buscando ubicación. Si aún no se obtiene, el SOS se enviará sin ella.",
      },
    }),
  );
  expect(screen.queryByText(/Ubicación reciente disponible/)).toBeNull();
  expect(screen.getByText(/Buscando ubicación/)).not.toBeNull();
  expect(apiFetch).not.toHaveBeenCalled();
  expect(volumeSos.setEnabled).not.toHaveBeenCalled();
});

test("permite desactivar mientras Accesibilidad se reconecta, sin exigir una API disponible", async () => {
  vi.mocked(volumeSos.getStatus).mockResolvedValue({
    ...state,
    recovering: true,
    accessibilityConnected: false,
  });
  vi.mocked(volumeSos.setEnabled).mockResolvedValue(state);
  render(<AlertaVolumen tienePlan onConfigurar={vi.fn()} />);
  await act(async () => {});
  expect(screen.getByText("RECONECTANDO")).not.toBeNull();
  await click("Desactivar segundo plano");
  expect(volumeSos.setEnabled).toHaveBeenCalledWith({ enabled: false });
  expect(apiFetch).not.toHaveBeenCalled();
});
