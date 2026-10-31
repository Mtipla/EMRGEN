import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const mobile = resolve(root, "apps/mobile");
const action = process.argv[2] ?? "prepare";
if (!["prepare", "open"].includes(action))
  throw new Error("Acción válida: prepare u open.");
const mode = process.argv[3] ?? "android-lan";
if (!["android-lan", "android-production"].includes(mode))
  throw new Error("Modo Android no válido.");

function run(script, args) {
  const result = spawnSync(process.execPath, [resolve(root, script), ...args], {
    cwd: mobile,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Siempre compila antes de copiar: no sincroniza dist de otra fecha o de otro modo de Vite.
// Rechaza la instancia equivocada aunque su HTTP/CORS respondan correctamente.
run("scripts/check-environment.mjs", ["--mode", mode]);
run("node_modules/typescript/bin/tsc", []);
run("node_modules/vite/bin/vite.js", [
  "build",
  "--config",
  "vite.config.ts",
  "--mode",
  mode,
]);
const metadata = JSON.parse(
  readFileSync(resolve(mobile, "dist/android-build.json"), "utf8"),
);
if (metadata.mode !== mode)
  throw new Error("Falta la compilación del modo Android seleccionado.");
if (!existsSync(resolve(mobile, "android"))) {
  run("node_modules/@capacitor/cli/bin/capacitor", ["add", "android"]);
}
run("node_modules/@capacitor/cli/bin/capacitor", ["sync", "android"]);
const nativeMetadata = JSON.parse(
  readFileSync(
    resolve(mobile, "android/app/src/main/assets/public/android-build.json"),
    "utf8",
  ),
);
if (JSON.stringify(metadata) !== JSON.stringify(nativeMetadata))
  throw new Error("Los assets Android no coinciden con dist.");
console.log(
  `Android ${mode} preparado: NestJS ${metadata.VITE_API_URL}; FastAPI ${metadata.VITE_INTERNAL_API_URL}; ${metadata.builtAt}`,
);
if (action === "open")
  run("node_modules/@capacitor/cli/bin/capacitor", ["open", "android"]);
