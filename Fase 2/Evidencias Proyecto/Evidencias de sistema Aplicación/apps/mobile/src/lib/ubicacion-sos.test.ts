import { vi } from 'vitest';
import { obtenerUbicacionSos } from './ubicacion-sos';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

test('no espera indefinidamente si el permiso queda sin respuesta', async () => {
  vi.useFakeTimers();
  vi.stubEnv('VITE_SOS_SIMULATED_LOCATION', '');
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: vi.fn() } });
  const location = obtenerUbicacionSos();
  await vi.advanceTimersByTimeAsync(10_000);
  expect(await location).toBeUndefined();
});

test('captura las coordenadas del dispositivo', async () => {
  vi.stubEnv('VITE_SOS_SIMULATED_LOCATION', '');
  vi.stubGlobal('navigator', {
    geolocation: {
      getCurrentPosition: (ok: PositionCallback) =>
        ok({
          coords: { latitude: -33.4378, longitude: -70.6504 },
        } as GeolocationPosition),
    },
  });
  expect(await obtenerUbicacionSos()).toBe('-33.437800,-70.650400');
});

test('la denegación de GPS no impide registrar la emergencia', async () => {
  vi.stubEnv('VITE_SOS_SIMULATED_LOCATION', '');
  vi.stubGlobal('navigator', {
    geolocation: {
      getCurrentPosition: (_ok: unknown, error: () => void) => error(),
    },
  });
  expect(await obtenerUbicacionSos()).toBeUndefined();
});

test('solo permite una ubicación simulada en desarrollo y la identifica', async () => {
  vi.stubEnv('DEV', true);
  vi.stubEnv('VITE_SOS_SIMULATED_LOCATION', '-33.4378,-70.6504');
  expect(await obtenerUbicacionSos()).toBe('SIMULADA: -33.4378,-70.6504');
  vi.stubEnv('DEV', false);
  vi.stubGlobal('navigator', {});
  expect(await obtenerUbicacionSos()).toBeUndefined();
});

test.each([
  [1, 'bloqueado'],
  [2, 'no pudo determinar'],
  [3, '10 segundos'],
])('explica el error de ubicación %s sin impedir el SOS', async (code, description) => {
  vi.stubEnv('VITE_SOS_SIMULATED_LOCATION', '');
  vi.stubGlobal('navigator', {
    geolocation: {
      getCurrentPosition: (_ok: unknown, fail: PositionErrorCallback) =>
        fail({ code } as GeolocationPositionError),
    },
  });
  const warning = vi.fn();
  expect(await obtenerUbicacionSos(warning)).toBeUndefined();
  expect(warning).toHaveBeenCalledWith(expect.stringContaining(description));
});

test('un resultado tardío no cambia el aviso ni la ubicación ya enviada', async () => {
  vi.useFakeTimers();
  vi.stubEnv('VITE_SOS_SIMULATED_LOCATION', '');
  let lateError!: PositionErrorCallback;
  vi.stubGlobal('navigator', {
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
  expect(warning).toHaveBeenCalledWith(expect.stringContaining('10 segundos'));
});
