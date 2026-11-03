BEGIN;
-- La verificación del administrador se representa únicamente con el estado EN PROCESO.
ALTER TABLE public.ticket_soporte DROP COLUMN IF EXISTS verificacion_solicitada;
COMMIT;
