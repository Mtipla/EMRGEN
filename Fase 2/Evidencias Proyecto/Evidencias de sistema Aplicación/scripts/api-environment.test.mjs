import { test } from "node:test";
import assert from "node:assert/strict";
import { publicApiUrls, checkApiReadiness } from "./api-environment.mjs";

const urls = {
  VITE_API_URL: "https://api.emergen.cl",
  VITE_INTERNAL_API_URL: "https://sos.emergen.cl",
};
const env = { ...urls, VITE_DEPLOYMENT_ID: "emergen-prod" };
function mockRequest(overrides = {}, options = {}) {
  const responses = {
    "emergen-backend": {
      status: "ready",
      service: "emergen-backend",
      deployment: "emergen-prod",
      environment: "production",
      database: "up",
      sosReady: true,
      whatsapp: { enabled: true, state: "open" },
    },
    "emergen-internal-api": {
      status: "ready",
      service: "emergen-internal-api",
      deployment: "emergen-prod",
      environment: "production",
      database: "up",
    },
  };
  for (const [service, changes] of Object.entries(overrides))
    Object.assign(responses[service], changes);
  return async (url, init = {}) => {
    if (init.method === "OPTIONS")
      return new Response(null, {
        status: 200,
        headers: options.badCors
          ? {}
          : {
              "access-control-allow-origin": "https://localhost",
              "access-control-allow-methods": "GET,POST,PATCH",
              "access-control-allow-headers": "Authorization,Content-Type",
            },
      });
    if (!url.endsWith("/health/ready"))
      return new Response("{}", { status: options.badToken ? 401 : 200 });
    const service = url.startsWith(urls.VITE_API_URL)
      ? "emergen-backend"
      : "emergen-internal-api";
    return Response.json(responses[service]);
  };
}
const expected = {
  deployment: "emergen-prod",
  environment: "production",
  origin: "https://localhost",
};

test("hosting acepta solo URLs explícitas HTTPS con un despliegue identificado", () => {
  assert.deepEqual(publicApiUrls(env, "production"), urls);
  for (const mode of ["production", "android-production", "staging"]) {
    for (const bad of [
      "http://api.emergen.cl",
      "https://localhost",
      "https://192.168.0.4",
      "https://127.0.0.1",
      "https://api.internal",
      "https://REEMPLAZAR_DOMINIO",
      "https://api.example.com",
      undefined,
    ]) {
      assert.throws(
        () => publicApiUrls({ ...env, VITE_API_URL: bad }, mode),
        /VITE_API_URL/,
      );
    }
  }
  assert.throws(
    () => publicApiUrls({ ...env, VITE_DEPLOYMENT_ID: "" }, "production"),
    /VITE_DEPLOYMENT_ID/,
  );
  assert.throws(
    () =>
      publicApiUrls(
        { ...env, VITE_SOS_SIMULATED_LOCATION: "-33,-70" },
        "production",
      ),
    /simulada/,
  );
});
test("mantiene los modos local/Docker explícitos para builds de prueba", () => {
  const local = {
    VITE_API_URL: "http://localhost:3001",
    VITE_INTERNAL_API_URL: "http://localhost:8000",
  };
  assert.deepEqual(publicApiUrls(local, "docker"), local);
});
test("reproduce la regresión: HTTP disponible pero WhatsApp deshabilitado no permite preparar SOS", async () => {
  await assert.rejects(
    checkApiReadiness(
      urls,
      expected,
      mockRequest({
        "emergen-backend": {
          sosReady: false,
          whatsapp: { enabled: false, state: "disabled" },
        },
      }),
    ),
    /WhatsApp no está listo/,
  );
});
test("rechaza URLs intercambiadas o una instancia de otro despliegue", async () => {
  await assert.rejects(
    checkApiReadiness(
      urls,
      expected,
      mockRequest({ "emergen-backend": { service: "emergen-internal-api" } }),
    ),
    /servicio/,
  );
  await assert.rejects(
    checkApiReadiness(
      urls,
      expected,
      mockRequest({ "emergen-internal-api": { deployment: "docker" } }),
    ),
    /despliegue/,
  );
  await assert.rejects(
    checkApiReadiness(
      urls,
      expected,
      mockRequest({ "emergen-internal-api": { environment: "development" } }),
    ),
    /entorno/,
  );
});
test("rechaza un esquema o conexión DB no disponibles aunque el proceso siga vivo", async () => {
  await assert.rejects(
    checkApiReadiness(
      urls,
      expected,
      mockRequest({ "emergen-internal-api": { database: "down" } }),
    ),
    /PostgreSQL/,
  );
});
test("verifica CORS y una misma sesión en ambas APIs sin enviar SOS", async () => {
  assert.equal(
    (
      await checkApiReadiness(
        urls,
        { ...expected, token: "solo-test" },
        mockRequest(),
      )
    ).length,
    2,
  );
  await assert.rejects(
    checkApiReadiness(urls, expected, mockRequest({}, { badCors: true })),
    /CORS/,
  );
  await assert.rejects(
    checkApiReadiness(
      urls,
      { ...expected, token: "solo-test" },
      mockRequest({}, { badToken: true }),
    ),
    /sesión/,
  );
});
