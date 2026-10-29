import { isIP } from "node:net";
import { androidLanUrls } from "./android-lan-env.mjs";

const hostedModes = new Set(["production", "android-production", "staging"]);
export function publicApiUrls(env, mode) {
  if (mode === "android-lan") return androidLanUrls(env);
  const urls = {};
  for (const key of ["VITE_API_URL", "VITE_INTERNAL_API_URL"]) {
    let url;
    try {
      url = new URL(env[key]);
    } catch {
      throw new Error(
        `${key}: configura explícitamente la URL de la API (${mode}).`,
      );
    }
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    ) {
      throw new Error(
        `${key}: usa un origen HTTP(S) sin credenciales, rutas ni parámetros.`,
      );
    }
    if (
      hostedModes.has(mode) &&
      (url.protocol !== "https:" ||
        isIP(url.hostname) ||
        /(^|\.)(localhost|local|internal|test|example|invalid)$/.test(
          url.hostname,
        ) ||
        !url.hostname.includes(".") ||
        /REEMPLAZAR|INSERT_|CHANGE_ME|example\.(com|org|net)/i.test(
          url.hostname,
        ))
    ) {
      throw new Error(
        `${key}: un build de hosting requiere HTTPS y un dominio público real; no admite localhost ni direcciones IP.`,
      );
    }
    urls[key] = url.origin;
  }
  if (hostedModes.has(mode)) {
    if (!env.VITE_DEPLOYMENT_ID?.trim() || env.VITE_DEPLOYMENT_ID === "local") {
      throw new Error(
        "VITE_DEPLOYMENT_ID: identifica el mismo despliegue que EMERGEN_DEPLOYMENT_ID en las dos APIs.",
      );
    }
    if (env.VITE_SOS_SIMULATED_LOCATION?.trim())
      throw new Error("El build de hosting no admite ubicación simulada.");
  }
  return urls;
}

/** Solo lecturas/OPTIONS: no crea SOS, no vincula sesiones y no envía mensajes. */
export async function checkApiReadiness(urls, options = {}, request = fetch) {
  const deployment = options.deployment ?? "local";
  const snapshots = [];
  for (const [key, service] of [
    ["VITE_API_URL", "emergen-backend"],
    ["VITE_INTERNAL_API_URL", "emergen-internal-api"],
  ]) {
    const base = urls[key];
    let response;
    try {
      response = await request(`${base}/health/ready`, {
        signal: AbortSignal.timeout(5000),
        redirect: "error",
      });
    } catch {
      throw new Error(
        `${service}: no se pudo conectar con la URL configurada.`,
      );
    }
    let state;
    try {
      state = await response.json();
    } catch {
      throw new Error(
        `${service}: la URL no devuelve el contrato de disponibilidad de EMERGEN.`,
      );
    }
    if (!response.ok || state.service !== service || state.database !== "up") {
      throw new Error(
        `${service}: servicio, PostgreSQL o esquema SOS no disponibles. Comprueba la API seleccionada y las migraciones (docs/DESPLIEGUE.md).`,
      );
    }
    if (
      state.deployment !== deployment ||
      (options.environment && state.environment !== options.environment)
    ) {
      throw new Error(
        `${service}: el entorno/despliegue no coincide con el cliente. Revisa las URLs y EMERGEN_DEPLOYMENT_ID.`,
      );
    }
    if (service === "emergen-backend" && !state.sosReady) {
      throw new Error(
        `WhatsApp no está listo en el backend seleccionado (estado: ${state.whatsapp?.state ?? "desconocido"}). Habilita y vincula el emisor en esa instancia.`,
      );
    }
    if (options.origin) {
      for (const [path, method] of service === "emergen-backend"
        ? [
            ["/usuarios/login", "POST"],
            ["/usuarios/me/perfil", "PATCH"],
          ]
        : [
            ["/internal/v1/alertas", "POST"],
            ["/internal/v1/alertas/1/cerrar", "POST"],
            ["/internal/v1/tickets-soporte", "POST"],
          ]) {
        const preflight = await request(base + path, {
          method: "OPTIONS",
          signal: AbortSignal.timeout(5000),
          redirect: "error",
          headers: {
            Origin: options.origin,
            "Access-Control-Request-Method": method,
            "Access-Control-Request-Headers": "authorization,content-type",
          },
        });
        const allowed =
          preflight.headers
            .get("access-control-allow-headers")
            ?.toLowerCase() ?? "";
        if (
          !preflight.ok ||
          preflight.headers.get("access-control-allow-origin") !==
            options.origin ||
          !preflight.headers
            .get("access-control-allow-methods")
            ?.includes(method) ||
          !allowed.includes("authorization") ||
          !allowed.includes("content-type")
        ) {
          throw new Error(
            `${service}: CORS no permite ${method} ${path} desde el origen del cliente.`,
          );
        }
      }
    }
    if (options.token) {
      const path =
        service === "emergen-backend"
          ? "/usuarios/me"
          : "/internal/v1/alertas?limit=1";
      const authenticated = await request(base + path, {
        signal: AbortSignal.timeout(5000),
        redirect: "error",
        headers: { Authorization: `Bearer ${options.token}` },
      });
      if (!authenticated.ok)
        throw new Error(
          `${service}: la misma sesión no es válida en ambas APIs (JWT/usuario/permisos).`,
        );
    }
    snapshots.push(state);
  }
  return snapshots;
}
