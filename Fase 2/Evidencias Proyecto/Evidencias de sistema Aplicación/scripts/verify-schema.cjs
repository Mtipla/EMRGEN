const { readFileSync, readdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { client } = require("./db-dev.cjs");
const sql = readFileSync(resolve(__dirname, "../init.sql"), "utf8");
const { expectedSchema, normalize } = require("./expected-schema.cjs");
const migrationDir = resolve(__dirname, "../migrations");
const migrationNames = readdirSync(migrationDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();
const schema = expectedSchema(
  sql,
  migrationNames.map((name) =>
    readFileSync(resolve(migrationDir, name), "utf8"),
  ),
);
(async () => {
  const db = client();
  await db.connect();
  try {
    const expected = schema.tables;
    const columns = (
      await db.query(
        "SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position",
      )
    ).rows;
    const actual = new Map();
    for (const r of columns)
      actual.set(r.table_name, [
        ...(actual.get(r.table_name) ?? []),
        r.column_name,
      ]);
    if (
      JSON.stringify([...expected.keys()].sort()) !==
      JSON.stringify([...actual.keys()].sort())
    )
      throw new Error("Tablas difieren");
    for (const [name, fields] of expected)
      if (
        JSON.stringify([...fields].sort()) !==
        JSON.stringify([...(actual.get(name) ?? [])].sort())
      )
        throw new Error("Columnas difieren: " + name);
    const functions = (
      await db.query(
        "SELECT proname,prosrc FROM pg_proc WHERE pronamespace='public'::regnamespace",
      )
    ).rows;
    const bodies = schema.functions;
    if (functions.length !== bodies.size)
      throw new Error("Cantidad de funciones difiere");
    for (const f of functions)
      if (normalize(f.prosrc) !== bodies.get(f.proname))
        throw new Error("Función instalada difiere: " + f.proname);
    const triggers = (
      await db.query(
        "SELECT tgname FROM pg_trigger WHERE NOT tgisinternal AND tgrelid IN (SELECT oid FROM pg_class WHERE relnamespace='public'::regnamespace)",
      )
    ).rows
      .map((r) => r.tgname)
      .sort();
    const names = [...schema.triggers].sort();
    if (JSON.stringify(triggers) !== JSON.stringify(names))
      throw new Error("Triggers difieren");
    console.log(
      JSON.stringify({
        tables: actual.size,
        columns: columns.length,
        functions: functions.length,
        triggers: triggers.length,
        migrations: migrationNames,
        comparison:
          "init.sql más migraciones coinciden en nombres de columnas, cuerpos de funciones y nombres de triggers; sin cambios en la base",
      }),
    );
  } finally {
    await db.end();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
