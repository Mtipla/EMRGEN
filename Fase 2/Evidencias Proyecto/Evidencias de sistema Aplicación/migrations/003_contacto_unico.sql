-- CA-03.1: un número no se repite en la lista de contactos de un mismo usuario.
-- Lleva una BD creada con un init.sql anterior a la misma restricción. Repetible.
-- Si ya hay duplicados, falla sin cambiar nada; encontrarlos con:
--   SELECT usuario_id, num_emergencia, count(*) FROM contacto_emergencia GROUP BY 1, 2 HAVING count(*) > 1;
--
--   Get-Content migraciones/003_contacto_unico.sql | docker exec -i postgres_emergen_db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'

BEGIN;
ALTER TABLE public.contacto_emergencia DROP CONSTRAINT IF EXISTS c_contacto_emergencia_03;
ALTER TABLE public.contacto_emergencia ADD CONSTRAINT c_contacto_emergencia_03 UNIQUE (usuario_id, num_emergencia);
COMMIT;
