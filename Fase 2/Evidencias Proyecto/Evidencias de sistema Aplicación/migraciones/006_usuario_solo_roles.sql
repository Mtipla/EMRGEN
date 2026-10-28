-- Retira los campos descartados de USUARIO en bases que aplicaron la versión anterior del panel.
-- Conserva nombre_usuario, los roles y las demás tablas del modelo.
BEGIN;
ALTER TABLE public.usuario
    DROP COLUMN IF EXISTS nombre_completo,
    DROP COLUMN IF EXISTS telefono,
    DROP COLUMN IF EXISTS es_trabajador;
COMMIT;
