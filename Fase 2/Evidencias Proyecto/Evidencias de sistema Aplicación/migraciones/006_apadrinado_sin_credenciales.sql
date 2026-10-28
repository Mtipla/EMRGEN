-- Las cuentas apadrinadas son perfiles de la principal: entran con el correo y la contraseña
-- de la principal y su PIN. No guardan correo ni contraseña propios. Repetible.
--
--   Get-Content migraciones/006_apadrinado_sin_credenciales.sql | docker exec -i postgres_emergen_db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'

BEGIN;
ALTER TABLE public.usuario ALTER COLUMN correo_usuario DROP NOT NULL;
ALTER TABLE public.usuario ALTER COLUMN contra_usuario DROP NOT NULL;
-- Borra las credenciales que ya tuvieran los apadrinados: no se usaban para iniciar sesión.
UPDATE public.usuario SET correo_usuario = NULL, contra_usuario = NULL WHERE usuario_principal_id IS NOT NULL;
ALTER TABLE public.usuario DROP CONSTRAINT IF EXISTS c_usuario_05;
ALTER TABLE public.usuario ADD CONSTRAINT c_usuario_05 CHECK (
    (usuario_principal_id IS NULL) = (correo_usuario IS NOT NULL AND contra_usuario IS NOT NULL)
);
COMMIT;
