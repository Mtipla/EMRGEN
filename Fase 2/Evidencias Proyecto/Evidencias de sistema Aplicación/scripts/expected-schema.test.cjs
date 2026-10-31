const { test } = require("node:test");
const assert = require("node:assert/strict");
const { expectedSchema } = require("./expected-schema.cjs");
test("incluye columnas de migraciones sin exigir reescribir init.sql ni duplicar campos existentes", () => {
  const base =
    "CREATE TABLE public.contacto (\n    id integer,\n    nombre varchar(30)\n);";
  const addition =
    "ALTER TABLE public.contacto ADD COLUMN IF NOT EXISTS permiso boolean, ADD COLUMN IF NOT EXISTS correo varchar(255);";
  assert.deepEqual(
    expectedSchema(base, [addition, addition]).tables.get("contacto"),
    ["id", "nombre", "permiso", "correo"],
  );
});
test("la última función migrada sustituye a la base y respeta recreaciones de triggers", () => {
  const base =
    "CREATE FUNCTION public.f() RETURNS trigger AS $$ BEGIN RETURN NEW; END $$; CREATE TRIGGER t AFTER UPDATE ON public.a;";
  const migration =
    "CREATE OR REPLACE FUNCTION public.f() RETURNS trigger AS $$ BEGIN RETURN OLD; END $$; DROP TRIGGER IF EXISTS t ON public.a; CREATE TRIGGER t AFTER UPDATE ON public.a;";
  const expected = expectedSchema(base, [migration]);
  assert.equal(expected.functions.get("f"), "BEGIN RETURN OLD; END");
  assert.deepEqual([...expected.triggers], ["t"]);
});
