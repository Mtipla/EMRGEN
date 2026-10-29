BEGIN;

-- Mantiene el comportamiento de los contactos existentes sin modificar init.sql.
ALTER TABLE public.contacto_emergencia
  ADD COLUMN IF NOT EXISTS compartir_antecedentes boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.contacto_emergencia.compartir_antecedentes IS
  'Permiso del titular para incluir sus antecedentes médicos en el WhatsApp de este contacto.';

COMMIT;
