import { loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import { publicApiUrls, checkApiReadiness } from "./api-environment.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const mode = process.argv[process.argv.indexOf("--mode") + 1];
if (
  !process.argv.includes("--mode") ||
  ![
    "development",
    "docker",
    "android-lan",
    "production",
    "android-production",
    "staging",
  ].includes(mode)
) {
  throw new Error(
    "Indica --mode development|docker|android-lan|production|android-production|staging.",
  );
}
try {
  const env = loadEnv(mode, root, "VITE_");
  const urls = publicApiUrls(env, mode);
  const hosted = ["production", "android-production", "staging"].includes(mode);
  const states = await checkApiReadiness(urls, {
    deployment:
      env.VITE_DEPLOYMENT_ID || (mode === "docker" ? "docker" : "local"),
    environment: hosted
      ? mode === "staging"
        ? "staging"
        : "production"
      : "development",
    origin: process.env.EMERGEN_CHECK_ORIGIN || "https://localhost",
    token: process.env.EMERGEN_CHECK_TOKEN,
  });
  console.log(
    `APROBADO: ${mode}; APIs, PostgreSQL, esquema, despliegue, CORS y WhatsApp disponibles.`,
  );
  for (const state of states)
    console.log(
      `${state.service}: ${state.deployment}; base de datos ${state.database}.`,
    );
  if (!process.env.EMERGEN_CHECK_TOKEN)
    console.log(
      "Falta verificar una sesión compartida: utiliza EMERGEN_CHECK_TOKEN para la comprobación autenticada de lectura.",
    );
  console.log(
    "No se crearon SOS ni se enviaron mensajes. Falta la prueba manual de recepción.",
  );
} catch (error) {
  console.error(`NO APTO PARA SOS: ${error.message}`);
  process.exitCode = 1;
}
