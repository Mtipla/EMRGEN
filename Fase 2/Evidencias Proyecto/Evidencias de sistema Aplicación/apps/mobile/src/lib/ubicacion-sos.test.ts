import { vi } from "vitest";
import { Capacitor } from "@capacitor/core";
import { Geolocation, type Position } from "@capacitor/geolocation";
import { obtenerUbicacionSos } from "./ubicacion-sos";

vi.mock("@capacitor/core", () => ({
  Capacitor: { getPlatform: vi.fn(() => "web") },
}));
vi.mock("@capacitor/geolocation", () => ({
  Geolocation: {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    getCurrentPosition: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(Capacitor.getPlatform).mockReturnValue("web");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

test("no espera indefinidamente si el permiso queda sin respuesta", async () => {
  vi.useFakeTimers();
  vi.stubEnv("VITE_SOS_SIMULATED_LOCATION", "");
  vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: vi.fn() } });
  const location = obtenerUbicacionSos();
  await vi.advanceTimersByTimeAsync(10_000);
  expect(await location).toBeUndefined();
});

test("captura las coordenadas del dispositivo", async () => {
  vi.stubEnv("VITE_SOS_SIMULATED_LOCATION", "");
  vi.stubGlobal("navigator", {
    geolocation: {
      getCurrentPosition: (ok: PositionCallback) =>
        ok({
          coords: { latitude: -33.4378, longitude: -70.6504 },
        } as GeolocationPosition),
    },
  });
  expect(await obtenerUbicacionSos()).toBe("-33.437800,-70.650400");
});

test("la denegación de GPS no impide registrar la emergencia", async () => {
  vi.stubEnv("VITE_SOS_SIMULATED_LOCATION", "");
  vi.stubGlobal("navigator", {
    geolocation: {
      getCurrentPosition: (_ok: unknown, error: () => void) => error(),
    },
  });
  expect(await obtenerUbicacionSos()).toBeUndefined();
});

test("solo permite una ubicación simulada en desarrollo y la identifica", async () => {
  vi.stubEnv("DEV", true);
  vi.stubEnv("VITE_SOS_SIMULATED_LOCATION", "-33.4378,-70.6504");
  expect(await obtenerUbicacionSos()).toBe("SIMULADA: -33.4378,-70.6504");
  vi.stubEnv("DEV", false);
  vi.stubGlobal("navigator", {});
  expect(await obtenerUbicacionSos()).toBeUndefined();
});

test.each([
  [1, "bloqueado"],
  [2, "no pudo determinar"],
  [3, "10 segundos"],
])(
  "explica el error de ubicación %s sin impedir el SOS",
  async (code, description) => {
    vi.stubEnv("VITE_SOS_SIMULATED_LOCATION", "");
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (_ok: unknown, fail: PositionErrorCallback) =>
          fail({ code } as GeolocationPositionError),
      },
    });
    const warning = vi.fn();
    expect(await obtenerUbicacionSos(warning)).toBeUndefined();
    expect(warning).toHaveBeenCalledWith(expect.stringContaining(description));
  },
);

test("un resultado tardío no cambia el aviso ni la ubicación ya enviada", async () => {
  vi.useFakeTimers();
  vi.stubEnv("VITE_SOS_SIMULATED_LOCATION", "");
  let lateError!: PositionErrorCallback;
  vi.stubGlobal("navigator", {
    geolocation: {
      getCurrentPosition: (_ok: unknown, fail: PositionErrorCallback) => {
        lateError = fail;
      },
    },
  });
  const warning = vi.fn();
  const pending = obtenerUbicacionSos(warning);
  await vi.advanceTimersByTimeAsync(10_000);
  expect(await pending).toBeUndefined();
  lateError({ code: 2 } as GeolocationPositionError);
  expect(warning).toHaveBeenCalledTimes(1);
  expect(warning).toHaveBeenCalledWith(expect.stringContaining("10 segundos"));
});

describe("ubicación nativa Android", () => {
  beforeEach(() => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue("android");
    vi.stubEnv("VITE_SOS_SIMULATED_LOCATION", "");
    vi.mocked(Geolocation.checkPermissions).mockResolvedValue({
      location: "granted",
      coarseLocation: "granted",
    });
    vi.mocked(Geolocation.getCurrentPosition).mockResolvedValue({
      coords: { latitude: -33.4378, longitude: -70.6504 },
    } as Position);
  });

  test("usa el plugin con permisos concedidos, sin pedir ubicación en segundo plano", async () => {
    expect(await obtenerUbicacionSos()).toBe("-33.437800,-70.650400");
    expect(Geolocation.requestPermissions).not.toHaveBeenCalled();
    expect(Geolocation.getCurrentPosition).toHaveBeenCalledWith({
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 30_000,
    });
  });

  test("admite permiso aproximado sin forzar un nuevo diálogo de precisión", async () => {
    vi.mocked(Geolocation.checkPermissions).mockResolvedValue({
      location: "denied",
      coarseLocation: "granted",
    });
    expect(await obtenerUbicacionSos()).toBe("-33.437800,-70.650400");
    expect(Geolocation.requestPermissions).not.toHaveBeenCalled();
  });

  test("solicita permiso solo cuando Android lo permite", async () => {
    vi.mocked(Geolocation.checkPermissions).mockResolvedValue({
      location: "prompt",
      coarseLocation: "prompt",
    });
    vi.mocked(Geolocation.requestPermissions).mockResolvedValue({
      location: "granted",
      coarseLocation: "granted",
    });
    expect(await obtenerUbicacionSos()).toBe("-33.437800,-70.650400");
    expect(Geolocation.requestPermissions).toHaveBeenCalledWith({
      permissions: ["location"],
    });
  });

  test("denegación persistente indica Ajustes y permite continuar sin ubicación", async () => {
    vi.mocked(Geolocation.checkPermissions).mockResolvedValue({
      location: "denied",
      coarseLocation: "denied",
    });
    const warning = vi.fn();
    expect(await obtenerUbicacionSos(warning)).toBeUndefined();
    expect(warning).toHaveBeenCalledWith(expect.stringContaining("Ajustes"));
    expect(Geolocation.requestPermissions).not.toHaveBeenCalled();
    expect(Geolocation.getCurrentPosition).not.toHaveBeenCalled();
  });

  test.each([
    ["OS-PLUG-GLOC-0007", "desactivada"],
    ["OS-PLUG-GLOC-0010", "10 segundos"],
    ["OS-PLUG-GLOC-0015", "Google Play"],
  ])("maneja %s sin impedir el SOS", async (code, message) => {
    vi.mocked(Geolocation.checkPermissions).mockRejectedValue({ code });
    const warning = vi.fn();
    expect(await obtenerUbicacionSos(warning)).toBeUndefined();
    expect(warning).toHaveBeenCalledWith(expect.stringContaining(message));
  });

  test("limita también el diálogo de permisos y no inicia la captura después del timeout", async () => {
    vi.useFakeTimers();
    vi.mocked(Geolocation.checkPermissions).mockResolvedValue({
      location: "prompt",
      coarseLocation: "prompt",
    });
    let grant!: (permissions: {
      location: "granted";
      coarseLocation: "granted";
    }) => void;
    vi.mocked(Geolocation.requestPermissions).mockReturnValue(
      new Promise((resolve) => {
        grant = resolve;
      }),
    );
    const warning = vi.fn();
    const pending = obtenerUbicacionSos(warning);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(await pending).toBeUndefined();
    grant({ location: "granted", coarseLocation: "granted" });
    await Promise.resolve();
    expect(Geolocation.getCurrentPosition).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledTimes(1);
  });
});

test("la ruta web nunca solicita permisos nativos", async () => {
  vi.stubGlobal("navigator", {});
  await obtenerUbicacionSos();
  expect(Geolocation.checkPermissions).not.toHaveBeenCalled();
  expect(Geolocation.requestPermissions).not.toHaveBeenCalled();
});
