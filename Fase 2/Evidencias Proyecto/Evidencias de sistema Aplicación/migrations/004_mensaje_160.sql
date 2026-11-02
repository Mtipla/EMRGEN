-- CA-05.1: el mensaje personalizado admite como máximo 160 caracteres (la columna sigue
-- siendo varchar(200), como en el diccionario de datos). Repetible.
-- Si ya hay mensajes más largos, falla sin cambiar nada; encontrarlos con:
--   SELECT msj_personalizado_id, char_length(mensaje) FROM usuario_mensaje_personalizado WHERE char_length(mensaje) > 160;
--
--   Get-Content migraciones/004_mensaje_160.sql | docker exec -i postgres_emergen_db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'

BEGIN;
ALTER TABLE public.usuario_mensaje_personalizado DROP CONSTRAINT IF EXISTS c_usuario_mensaje_personalizado_02;
ALTER TABLE public.usuario_mensaje_personalizado ADD CONSTRAINT c_usuario_mensaje_personalizado_02 CHECK (char_length(mensaje) <= 160);
COMMIT;
