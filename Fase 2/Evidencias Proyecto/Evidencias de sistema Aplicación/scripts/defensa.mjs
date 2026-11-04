// Despliegue para la defensa: web en Firebase Hosting y el resto en este PC con túneles temporales.
// Usa su propio proyecto Compose y volúmenes; no toca el stack ni los datos de desarrollo.
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const root = fileURLToPath(new URL("../", import.meta.url));
const envFile = resolve(root, "deploy/production.env");
const DEPLOYMENT = "emergen-defensa";
const FIREBASE_PROJECT = "emergen-9667c";
const ORIGINS = `https://${FIREBASE_PROJECT}.web.app,https://${FIREBASE_PROJECT}.firebaseapp.com,https://localhost`;
const compose = ["compose", "-p", DEPLOYMENT, "--env-file", envFile, "-f", resolve(root, "docker-compose.production.yml")];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: options.capture || options.input !== undefined ? ["pipe", "pipe", "inherit"] : "inherit",
    shell: options.shell ?? false,
    input: options.input,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Falló: ${command} ${args[0]}`);
  return result.stdout ?? "";
}
const docker = (args, options) => run("docker", args, options);
const secret = () => randomBytes(32).toString("hex");
const psql = (sql, flags = []) =>
  docker([...compose, "exec", "-T", "db", "sh", "-c", `psql -v ON_ERROR_STOP=1 -q ${flags.join(" ")} -U "$POSTGRES_USER" -d "$POSTGRES_DB"`], { input: sql });

function writePrivateEnv() {
  if (existsSync(envFile)) return console.log("deploy/production.env ya existe: se conserva.");
  const dev = parseEnv(readFileSync(resolve(root, ".env"), "utf8"));
  const values = {
    BACKEND_IMAGE: "emergen-backend:defensa",
    INTERNAL_API_IMAGE: "emergen-internal-api:defensa",
    EMERGEN_DEPLOYMENT_ID: DEPLOYMENT,
    DB_BOOTSTRAP_USER: "emergen_owner",
    DB_BOOTSTRAP_PASSWORD: secret(),
    DB_NAME: "emergen",
    APP_DB_USER: "emergen_app",
    APP_DB_PASSWORD: secret(),
    DB_SSLMODE: "disable",
    CA_DIRECTORY: "./deploy/ca-publica",
    PRODUCTION_DB_VOLUME: "emergen_defensa_db",
    PRODUCTION_WHATSAPP_VOLUME: "emergen_defensa_whatsapp",
    JWT_SECRET: secret(),
    MEDICAL_DATA_KEYS: `k1:${randomBytes(32).toString("base64")}`,
    CORS_ORIGINS: ORIGINS,
    JSREPORT_USERNAME: "emergen_reports",
    JSREPORT_PASSWORD: secret(),
    JSREPORT_COOKIE_SECRET: secret(),
    WHATSAPP_SENDER_PHONE: dev.WHATSAPP_SENDER_PHONE,
    FIREBASE_PROJECT_ID: dev.FIREBASE_PROJECT_ID,
    GOOGLE_MAPS_API_KEY: dev.GOOGLE_MAPS_API_KEY ?? "",
    PAYPAL_MODE: dev.PAYPAL_MODE,
    PAYPAL_CLIENT_ID: dev.PAYPAL_CLIENT_ID ?? "",
    PAYPAL_SECRET: dev.PAYPAL_SECRET ?? "",
    DOLAR_CLP_RESPALDO: dev.DOLAR_CLP_RESPALDO ?? "",
  };
  const body = Object.entries(values).map(([key, value]) => `${key}='${value ?? ""}'`).join("\n");
  writeFileSync(envFile, `# Generado por scripts/defensa.mjs. Privado: no versionar.\n${body}\n`);
  console.log("deploy/production.env creado con secretos nuevos.");
}

function provisionDatabase() {
  docker([...compose, "up", "-d", "--wait", "db"]);
  const hasSchema = psql("SELECT to_regclass('public.usuario') IS NOT NULL;", ["-At"]).trim() === "t";
  if (hasSchema) return console.log("La base ya tiene esquema: no se modifica.");
  for (const file of ["init.sql", "migrations/20261026_whatsapp_finalizacion.sql", "migrations/20261028_contactos_antecedentes.sql", "migrations/20261028_tickets_responsable.sql"])
    psql(readFileSync(resolve(root, file), "utf8"));
  const env = parseEnv(readFileSync(envFile, "utf8"));
  psql(`CREATE ROLE ${env.APP_DB_USER} LOGIN PASSWORD '${env.APP_DB_PASSWORD}';
GRANT USAGE ON SCHEMA public TO ${env.APP_DB_USER};
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${env.APP_DB_USER};
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO ${env.APP_DB_USER};
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ${env.APP_DB_USER};`);
  console.log("Base vacía creada: esquema, catálogos y rol de aplicación.");
}

function tunnelUrl(service) {
  // Solo los logs del arranque actual: los anteriores conservan URLs que ya no funcionan.
  const id = docker([...compose, "ps", "-q", service], { capture: true }).trim();
  const startedAt = docker(["inspect", "-f", "{{.State.StartedAt}}", id], { capture: true }).trim();
  for (let attempt = 0; attempt < 30; attempt++) {
    const logs = docker([...compose, "logs", "--no-log-prefix", "--since", startedAt, service], { capture: true });
    const url = [...logs.matchAll(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/g)].map((m) => m[0]).filter((u) => !u.startsWith("https://api.")).at(-1);
    if (url) return url;
    spawnSync(process.execPath, ["-e", "setTimeout(()=>{},2000)"]);
  }
  throw new Error(`${service}: el túnel no entregó una URL.`);
}

function writeClientEnv() {
  const content = `# Generado por scripts/defensa.mjs: cambia si se recrea un túnel.\nVITE_API_URL=${tunnelUrl("cloudflared-api")}\nVITE_INTERNAL_API_URL=${tunnelUrl("cloudflared-internal")}\nVITE_DEPLOYMENT_ID=${DEPLOYMENT}\n`;
  const file = resolve(root, ".env.production.local");
  const changed = !existsSync(file) || readFileSync(file, "utf8") !== content;
  writeFileSync(file, content);
  writeFileSync(resolve(root, ".env.android-production.local"), content);
  console.log(content);
  if (changed) console.log("URLs nuevas: ejecuta 'publicar' y vuelve a generar el APK.");
}

const commands = {
  preparar() {
    mkdirSync(resolve(root, "deploy/ca-publica"), { recursive: true });
    writePrivateEnv();
    const env = parseEnv(readFileSync(envFile, "utf8"));
    if (!env.WHATSAPP_SENDER_PHONE)
      throw new Error("Completa WHATSAPP_SENDER_PHONE en deploy/production.env (número emisor, ej. +569XXXXXXXX) y repite 'preparar'.");
    for (const volume of [env.PRODUCTION_DB_VOLUME, env.PRODUCTION_WHATSAPP_VOLUME]) docker(["volume", "create", volume], { capture: true });
    docker(["build", "-t", env.BACKEND_IMAGE, "."]);
    docker(["build", "-t", env.INTERNAL_API_IMAGE, "services/internal-api"]);
    provisionDatabase();
  },
  iniciar() {
    docker([...compose, "up", "-d", "--wait"]);
    writeClientEnv();
  },
  publicar() {
    writeClientEnv();
    run("npx", ["turbo", "run", "build", "--filter=web", "--filter=desktop"], { shell: true });
    // El panel se publica bajo el origen de la web porque file:// no es un origen CORS admitido.
    const panel = resolve(root, "apps/web/dist/panel");
    rmSync(panel, { recursive: true, force: true });
    cpSync(resolve(root, "apps/desktop/dist"), panel, { recursive: true });
    run("firebase", ["deploy", "--only", "hosting", "--project", FIREBASE_PROJECT], { shell: true });
  },
  admin(correo) {
    if (!/^[^\s@']+@[^\s@']+$/.test(correo ?? "")) throw new Error("Uso: node scripts/defensa.mjs admin <correo-ya-registrado>");
    const updated = psql(`UPDATE usuario SET rol_id = 1, estado_id = 1 WHERE correo_usuario = '${correo}' RETURNING usuario_id;`, ["-At"]);
    if (!updated.trim()) throw new Error("No existe una cuenta con ese correo: regístrala primero en la web.");
    console.log("Cuenta promovida a ADMINISTRADOR. Cierra sesión y vuelve a entrar.");
  },
  panel() {
    const env = { ...process.env, NODE_ENV: "development", ELECTRON_RENDERER_URL: `https://${FIREBASE_PROJECT}.web.app/panel/` };
    delete env.ELECTRON_RUN_AS_NODE;
    const result = spawnSync(resolve(root, "node_modules/electron/dist/electron.exe"), [resolve(root, "apps/desktop")], { cwd: root, env, stdio: "inherit" });
    if (result.error) throw result.error;
  },
  estado() {
    docker([...compose, "ps"]);
    for (const service of ["cloudflared-api", "cloudflared-internal"]) console.log(`${tunnelUrl(service)}/health/ready`);
  },
  detener() {
    docker([...compose, "stop"]);
    console.log("Detenido sin borrar datos. Al iniciar de nuevo, los túneles pueden cambiar de URL.");
  },
};

const [command, ...args] = process.argv.slice(2);
if (!commands[command]) {
  console.error(`Uso: node scripts/defensa.mjs ${Object.keys(commands).join("|")}`);
  process.exit(1);
}
try {
  commands[command](...args);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
