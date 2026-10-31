/** Contrato del esquema base más las migraciones aditivas versionadas. No ejecuta SQL. */
const normalize = (text) => text.replace(/\s+/g, " ").trim();
function expectedSchema(base, migrations = []) {
  const tables = new Map(
    [...base.matchAll(/CREATE TABLE public\.(\w+) \(([\s\S]*?)^\);/gm)].map(
      (match) => [
        match[1],
        [
          ...match[2].matchAll(
            /^    (\w+) (?!KEY|CHECK|UNIQUE)(?:integer|varchar|text|boolean|timestamptz|numeric|char|uuid|jsonb)\b/gm,
          ),
        ].map((field) => field[1]),
      ],
    ),
  );
  const functions = new Map();
  const triggers = new Set();
  for (const sql of [base, ...migrations]) {
    for (const match of sql.matchAll(/ALTER TABLE public\.(\w+)([\s\S]*?);/g)) {
      for (const field of match[2].matchAll(
        /ADD COLUMN IF NOT EXISTS (\w+)\s/g,
      )) {
        const columns = tables.get(match[1]);
        if (!columns)
          throw new Error(`Migración de tabla desconocida: ${match[1]}`);
        if (!columns.includes(field[1])) columns.push(field[1]);
      }
    }
    for (const match of sql.matchAll(
      /CREATE(?: OR REPLACE)? FUNCTION public\.(\w+)\([\s\S]*?AS \$\$([\s\S]*?)\$\$/g,
    )) {
      functions.set(match[1], normalize(match[2]));
    }
    for (const match of sql.matchAll(
      /(DROP TRIGGER IF EXISTS|CREATE (?:CONSTRAINT )?TRIGGER) (\w+)/g,
    )) {
      if (match[1].startsWith("DROP")) triggers.delete(match[2]);
      else triggers.add(match[2]);
    }
  }
  return { tables, functions, triggers };
}
module.exports = { expectedSchema, normalize };
