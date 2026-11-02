-- PIN temporal de primer ingreso: la principal lo define para su apadrinado y este debe
-- cambiarlo en su primer inicio de sesión. Repetible.
--
--   Get-Content migraciones/005_pin_temporal.sql | docker exec -i postgres_emergen_db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'

BEGIN;
ALTER TABLE public.pin ADD COLUMN IF NOT EXISTS pin_temporal boolean NOT NULL DEFAULT false;
COMMIT;
