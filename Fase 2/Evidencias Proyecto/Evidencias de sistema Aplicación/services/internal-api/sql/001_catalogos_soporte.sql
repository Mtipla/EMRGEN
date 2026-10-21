-- HISTORICO: no ejecutar sobre el init integrado 2026-10-21. Ver README_BDD.md.
-- Catálogos que init.sql crea vacíos y que necesita la API de tickets de soporte.
-- Solo inserta filas (no cambia tablas) y se puede ejecutar varias veces.
-- Desde la raíz del monorepo (PowerShell):
--   Get-Content -Raw .\services\internal-api\sql\001_catalogos_soporte.sql | docker exec -i postgres_emergen_db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
BEGIN;

-- El estado con ID más bajo es el inicial de todo ticket nuevo.
INSERT INTO ESTADO_TICKET (estado_ticket_ID, estado_ticket) VALUES
(1, 'ABIERTO'),
(2, 'EN PROCESO'),
(3, 'RESUELTO'),
(4, 'CERRADO')
ON CONFLICT (estado_ticket_ID) DO NOTHING;

INSERT INTO CATEGORIA_SOPORTE (categoria_soporte_ID, nombre_categoria) VALUES
(1, 'CUENTA Y ACCESO'),
(2, 'PAGOS Y PLANES'),
(3, 'ALERTAS'),
(4, 'APLICACION'),
(5, 'OTRO')
ON CONFLICT (categoria_soporte_ID) DO NOTHING;

COMMIT;
