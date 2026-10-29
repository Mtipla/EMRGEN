import { loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import { androidLanUrls } from "./android-lan-env.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const urls = androidLanUrls(loadEnv("android-lan", root, "VITE_"));
const origin = "https://localhost";
let failed = false;

async function check(label, fn) {
  try {
    await fn();
    console.log(`APROBADO: ${label}`);
  } catch (cause) {
    failed = true;
    console.error(`FALLÓ: ${label}: ${cause.message}`);
  }
}
for (const [key, health] of [
  ["VITE_API_URL", "/"],
  ["VITE_INTERNAL_API_URL", "/health"],
]) {
  const base = urls[key];
  await check(`GET ${base}${health}`, async () => {
    const response = await fetch(`${base}${health}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await response.text();
  });
  const routes =
    key === "VITE_API_URL"
      ? [
          ["/usuarios/login", "POST"],
          ["/usuarios/me/perfil", "PATCH"],
        ]
      : [
          ["/internal/v1/alertas", "POST"],
          ["/internal/v1/alertas/1/cerrar", "POST"],
          ["/internal/v1/tickets-soporte", "POST"],
        ];
  for (const [path, method] of routes) {
    await check(`CORS OPTIONS ${method} ${base}${path}`, async () => {
      const response = await fetch(`${base}${path}`, {
        method: "OPTIONS",
        signal: AbortSignal.timeout(5000),
        headers: {
          Origin: origin,
          "Access-Control-Request-Method": method,
          "Access-Control-Request-Headers": "authorization,content-type",
        },
      });
      const allowedHeaders =
        response.headers.get("access-control-allow-headers")?.toLowerCase() ??
        "";
      if (
        !response.ok ||
        response.headers.get("access-control-allow-origin") !== origin ||
        !response.headers
          .get("access-control-allow-methods")
          ?.includes(method) ||
        !allowedHeaders.includes("authorization") ||
        !allowedHeaders.includes("content-type")
      ) {
        throw new Error(
          `preflight HTTP ${response.status}; revisar CORS_ORIGINS / INTERNAL_API_CORS_ORIGINS`,
        );
      }
    });
  }
  await check(`origen ajeno sin autorización CORS en ${base}`, async () => {
    const response = await fetch(`${base}${health}`, {
      signal: AbortSignal.timeout(5000),
      headers: { Origin: "https://origen-no-permitido.example" },
    });
    if (response.headers.has("access-control-allow-origin"))
      throw new Error("El servidor permite un origen ajeno");
    await response.text();
  });
}
console.log(
  "Estas comprobaciones no crean SOS ni tickets, no inician sesión y no envían WhatsApp. Falta validar la WebView del teléfono.",
);
process.exitCode = failed ? 1 : 0;
