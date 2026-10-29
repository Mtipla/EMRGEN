BEGIN;

-- Registra al autor de la última solución sin modificar init.sql ni atribuir casos antiguos.
ALTER TABLE public.soporte
  ADD COLUMN IF NOT EXISTS trabajador_id integer REFERENCES public.usuario(usuario_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS trabajador_nombre varchar(100),
  ADD COLUMN IF NOT EXISTS trabajador_correo varchar(255);

COMMENT ON COLUMN public.soporte.trabajador_id IS
  'Usuario autenticado que guardó la última solución. No cambia por modificar solo el estado.';
COMMENT ON COLUMN public.soporte.trabajador_nombre IS
  'Nombre al responder; se conserva aunque el trabajador cambie su cuenta o sea eliminado.';
COMMENT ON COLUMN public.soporte.trabajador_correo IS
  'Correo al responder; se conserva para identificar al autor de la solución.';

COMMIT;
