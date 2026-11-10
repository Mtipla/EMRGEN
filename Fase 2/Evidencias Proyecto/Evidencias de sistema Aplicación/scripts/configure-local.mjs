import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { androidLanUrls } from "./android-lan-env.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== "--lan-ip")) {
  throw new Error("Uso: npm run local:configure -- [--lan-ip IPv4-del-PC]");
}
const addresses = Object.entries(networkInterfaces()).flatMap(([name, values]) =>
  /vEthernet|WSL|Docker|VirtualBox|VMware|Loopback/i.test(name)
    ? []
    : values.filter((v) => v.family === "IPv4" && !v.internal).map((v) => v.address),
);
const unique = [...new Set(addresses)];
const ip = args[1] || (unique.length === 1 ? unique[0] : undefined);
if (!ip || !Object.values(networkInterfaces()).flat().some((v) => v?.address === ip)) {
  throw new Error(`Indica --lan-ip con la IPv4 Wi-Fi/Ethernet de este PC. Candidatas: ${unique.join(", ") || "ninguna"}.`);
}
const deployment = "ejecucion-local";
const lan = {
  VITE_API_URL: `http://${ip}:3001`,
  VITE_INTERNAL_API_URL: `http://${ip}:8000`,
  VITE_DEPLOYMENT_ID: deployment,
};
androidLanUrls(lan);
const envFile = resolve(root, ".env");
const text = readFileSync(existsSync(envFile) ? envFile : resolve(root, "example.env"), "utf8");
const env = parseEnv(text);
const missing = (key) => !env[key]?.trim() || /<INSERT_|REEMPLAZAR|CHANGE_ME/.test(env[key]);
const overrides = {
  DB_HOST: "127.0.0.1",
  DB_PORT: "5433",
  DB_SSLMODE: "disable",
  PORT: "3000",
  HOST: "127.0.0.1",
  EMERGEN_ENVIRONMENT: "development",
  EMERGEN_DEPLOYMENT_ID: deployment,
  VITE_API_URL: "http://localhost:3001",
  VITE_INTERNAL_API_URL: "http://localhost:8000",
  VITE_DEPLOYMENT_ID: deployment,
  CORS_ORIGINS: [
    ...["localhost", "127.0.0.1", ip].flatMap((host) => [5173, 5174, 5175].map((port) => `http://${host}:${port}`)),
    "https://localhost", "capacitor://localhost", "emergen://panel",
  ].join(","),
};
// Conserva claves de cifrado, credenciales de una BD existente y la sesión de WhatsApp.
// Cambiar POSTGRES_PASSWORD en un .env no rota la contraseña de un volumen existente.
for (const [key, value] of Object.entries({
  DB_USER: "emergen_local",
  DB_NAME: "emergen_local",
  DB_PASSWORD: randomBytes(24).toString("base64url"),
  JWT_SECRET: randomBytes(48).toString("base64url"),
  MEDICAL_DATA_KEYS: `local1:${randomBytes(32).toString("base64")}`,
})) {
  if (missing(key)) overrides[key] = value;
}
let output = text;
for (const [key, value] of Object.entries(overrides)) {
  const pattern = new RegExp(`^${key}=.*$`, "m");
  output = pattern.test(output) ? output.replace(pattern, () => `${key}=${value}`) : `${output.trimEnd()}\n${key}=${value}\n`;
}
writeFileSync(envFile, output, { mode: 0o600 });
writeFileSync(resolve(root, ".env.android-lan.local"),
  "# Generado por local:configure; recompila el APK cuando cambie la IP del PC.\n" +
  Object.entries(lan).map(([key, value]) => `${key}=${value}`).join("\n") + "\n",
  { mode: 0o600 });
console.log(`Configuración local lista. PC: localhost; APK: ${ip}; despliegue: ${deployment}.`);
console.log("Puertos: web 5173, móvil navegador 5174, escritorio 5175, NestJS 3001, FastAPI 8000, PostgreSQL 5433.");
console.log("Credenciales privadas conservadas o creadas en .env. No se modificó la base de datos.");
