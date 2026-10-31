const { readFileSync, existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { parseEnv } = require("node:util");
const { client } = require("./db-dev.cjs");
const root = resolve(__dirname, "..");
const localFile = resolve(root, "apps/backend/.env.local");
const local = existsSync(localFile)
  ? parseEnv(readFileSync(localFile, "utf8"))
  : {};
const common = parseEnv(readFileSync(resolve(root, ".env"), "utf8"));
const medicalKeys =
  process.env.MEDICAL_DATA_KEYS ||
  local.MEDICAL_DATA_KEYS ||
  common.MEDICAL_DATA_KEYS;
if (!medicalKeys || medicalKeys.includes("<INSERT_"))
  throw new Error(
    "Faltan las MEDICAL_DATA_KEYS existentes. No generes otras para una base con fichas.",
  );
process.env.MEDICAL_DATA_KEYS = medicalKeys;
const compiled = resolve(root, "apps/backend/dist/perfil/cifrado-medico.js");
if (!existsSync(compiled))
  throw new Error("Compila primero: npm run build --workspace=backend");
const { descifrarFicha } = require(compiled);

(async () => {
  const db = client();
  await db.connect();
  try {
    await db.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const counts = {};
    for (const table of [
      "usuario",
      "contacto_emergencia",
      "antecedente_medico",
      "alerta",
      "envio_alerta",
    ]) {
      counts[table] = (
        await db.query(`SELECT count(*)::int AS total FROM ${table}`)
      ).rows[0].total;
    }
    let checked = 0,
      failed = 0,
      lastId = 0;
    while (true) {
      const rows = (
        await db.query(
          "SELECT * FROM antecedente_medico WHERE antecedente_medico_id>$1 ORDER BY antecedente_medico_id LIMIT 200",
          [lastId],
        )
      ).rows;
      if (!rows.length) break;
      for (const row of rows) {
        try {
          descifrarFicha(row.usuario_id, row);
          checked++;
        } catch {
          failed++;
        }
        lastId = row.antecedente_medico_id;
      }
    }
    const invalid = (
      await db.query(
        "SELECT count(*)::int AS total FROM pg_constraint WHERE connamespace='public'::regnamespace AND NOT convalidated",
      )
    ).rows[0].total;
    await db.query("ROLLBACK");
    console.log(
      JSON.stringify(
        {
          counts,
          medicalRecordsDecryptable: checked,
          medicalRecordsFailed: failed,
          unvalidatedConstraints: invalid,
          readOnly: true,
        },
        null,
        2,
      ),
    );
    if (failed || invalid)
      throw new Error(
        "Integridad no confirmada. Revisa las claves existentes y las restricciones antes de migrar.",
      );
  } finally {
    await db.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
