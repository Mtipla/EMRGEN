import { vi } from "vitest";
import { apiFetch, errorText, internalFetch } from "./session";

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

test("un JWT vencido conserva el estado HTTP y explica cómo volver a ingresar", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ detail: "La sesión no es válida o expiró" }),
          { status: 401 },
        ),
      ),
  );
  await expect(internalFetch("/alertas")).rejects.toMatchObject({
    status: 401,
    message: expect.stringContaining("vuelve a iniciar sesión"),
  });
});

test("un error de credenciales de login conserva el mensaje del servidor", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: "Credenciales incorrectas" }), {
          status: 401,
        }),
      ),
  );
  await expect(
    apiFetch("/usuarios/login", { method: "POST" }),
  ).rejects.toMatchObject({ status: 401, message: "Credenciales incorrectas" });
});

test("la pérdida de red sigue siendo un error y no una confirmación del SOS", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  );
  await expect(
    internalFetch("/alertas", { method: "POST" }),
  ).rejects.toBeInstanceOf(TypeError);
  expect(errorText(new TypeError("Failed to fetch"))).toContain(
    "No se pudo conectar",
  );
});
