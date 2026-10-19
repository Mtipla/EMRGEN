-- Lleva una base de datos YA CREADA al esquema de auditoría de init.sql sin perder datos.
-- init.sql solo se ejecuta al crear el volumen de Docker; quien tenga un volumen anterior
-- aplica este script una vez (se puede repetir: no cambia nada si ya está aplicado).
--
-- PowerShell, desde la raíz del monorepo:
--   Get-Content -Raw .\actualizar-bitacora-auditoria.sql | docker exec -i postgres_emergen_db sh -c 'psql -v ON_ERROR_STOP=1 -U $POSTGRES_USER -d $POSTGRES_DB'

BEGIN;

ALTER TABLE BITACORA_SISTEMA
  ADD COLUMN IF NOT EXISTS rol_actor_ID INT,
  ADD COLUMN IF NOT EXISTS usuario_afectado_ID INT,
  ADD COLUMN IF NOT EXISTS tipo_accion VARCHAR(20),
  ADD COLUMN IF NOT EXISTS entidad_afectada VARCHAR(30),
  ADD COLUMN IF NOT EXISTS resultado VARCHAR(10) NOT NULL DEFAULT 'EXITOSA',
  ADD COLUMN IF NOT EXISTS cambios JSONB;

ALTER TABLE BITACORA_SISTEMA DROP CONSTRAINT IF EXISTS ck_bit_resultado;
ALTER TABLE BITACORA_SISTEMA
  ADD CONSTRAINT ck_bit_resultado CHECK (resultado IN ('EXITOSA', 'FALLIDA'));

ALTER TABLE BITACORA_SISTEMA DROP CONSTRAINT IF EXISTS fk_bit_rol;
ALTER TABLE BITACORA_SISTEMA
  ADD CONSTRAINT fk_bit_rol FOREIGN KEY (rol_actor_ID) REFERENCES ROL(rol_ID);

COMMIT;
