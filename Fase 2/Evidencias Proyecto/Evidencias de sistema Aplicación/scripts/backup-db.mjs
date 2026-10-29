import { spawn } from "node:child_process";
import {
  createReadStream,
  openSync,
  closeSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const root = fileURLToPath(new URL("../", import.meta.url));
const env = {
  ...parseEnv(readFileSync(resolve(root, ".env"), "utf8")),
  ...process.env,
};
if (!env.DB_USER || !env.DB_NAME)
  throw new Error(
    "Configura DB_USER y DB_NAME del PostgreSQL Docker que se respaldará.",
  );
const directory = resolve(root, "backups");
mkdirSync(directory, { recursive: true });
const archive = resolve(
  directory,
  `emergen-${new Date().toISOString().replace(/[:.]/g, "-")}.dump`,
);
const partial = `${archive}.partial`;
function docker(args, stdio) {
  return new Promise((ok, fail) => {
    const child = spawn("docker", ["compose", "exec", "-T", "db", ...args], {
      cwd: root,
      stdio,
    });
    child.once("error", fail);
    child.once("exit", (code) =>
      code === 0
        ? ok()
        : fail(
            new Error(
              "La herramienta de respaldo/validación falló. No uses el archivo .partial.",
            ),
          ),
    );
  });
}
let descriptor = openSync(partial, "wx");
try {
  await docker(
    [
      "pg_dump",
      "-U",
      env.DB_USER,
      "-d",
      env.DB_NAME,
      "--format=custom",
      "--no-owner",
      "--no-acl",
    ],
    ["ignore", descriptor, "inherit"],
  );
} finally {
  closeSync(descriptor);
}
descriptor = openSync(partial, "r");
try {
  await docker(["pg_restore", "--list"], [descriptor, "ignore", "inherit"]);
} finally {
  closeSync(descriptor);
}
const hash = createHash("sha256");
for await (const chunk of createReadStream(partial)) hash.update(chunk);
renameSync(partial, archive);
writeFileSync(
  `${archive}.json`,
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      bytes: statSync(archive).size,
      sha256: hash.digest("hex"),
      archiveReadable: true,
      note: "Archivo validado con pg_restore --list. Falta restaurarlo y verificarlo en un destino aislado; no contiene las claves de cifrado externas.",
    },
    null,
    2,
  ),
  { flag: "wx" },
);
console.log(`Respaldo creado sin modificar la base: ${archive}`);
console.log(
  "No se sobrescribieron respaldos. Conserva también MEDICAL_DATA_KEYS de forma privada y prueba una restauración aislada.",
);
