# Estado de integración BDD — 2026-10-21

**Integración local implementada y validada.** Rama alonso, HEAD 2f68353; cambios sin commit. Informe completo, tabla ERROR 01–37 y diferencias de esquema: [docs/INTEGRACION_BDD_2026-10-21.md](docs/INTEGRACION_BDD_2026-10-21.md).

## Estado real después de la reanudación

- PostgreSQL registró cierre no limpio, completó recuperación automática y acepta conexiones. No se detectaron corrupción, drift de columnas/funciones/triggers ni pérdida de los seis fixtures.
- No se repitieron down -v, init.sql ni seed-dev. Se reconstruyó solo Nest, conservando ambos volúmenes. PostgreSQL 15.19 y Node 24.21.0 verificados; Compose, Dockerfile, lockfile, requisitos Python, puertos y synchronize:false conservados.
- Nest activo en 3001, PostgreSQL en 5433 y FastAPI en 127.0.0.1:8000. FastAPI se inició oculto; logs/PID en services/internal-api/.runtime/ (ignorado). No queda una suite de pruebas ejecutándose.
- Estado consultado: seis cuentas fixture, un plan del principal, un administrador; cero reservas abiertas, alertas activas, transacciones idle in transaction, cupos/contactos excedidos o totales de venta incoherentes.
- El archivo ajeno graphify-out/cache/hook_sessions/3e4db471-d821-48d0-a1e3-8f78fb2b4cf5.nudges se conservó. Sin conflictos ni errores de git diff --check.

## Archivos afectados y reparaciones

- init.sql; entidades/DTO/servicios de usuarios, login, permisos, planes, compras y auditoría en apps/backend/src; cliente PayPal.
- FastAPI: schemas/services/routes de alertas y tickets, core/db/errors/pin/scheduler, auth y main.
- apps/desktop/src/admin/api.ts y SeccionUsuarios.tsx; apps/web/src/features/compra; packages/api-types y api-client.
- Auxiliares nuevos: config/transaction y postgres-exception.filter (con pruebas), scripts de fixtures/PIN/SQL/verificación Excel/esquema/HTTP; pruebas_init.sql y tests de concurrencia.
- Documentos: README_BDD, README general, readme.apis.internas, README de FastAPI e informe. Scripts SQL anteriores marcados históricos; script manual de auditoría adaptado a estados 2/1.
- Se corrigieron pruebas antiguas de contratos, HTTP/ruta/monto PayPal (1,06 USD por redondeo vigente), y preparación de fechas históricas sin modificar timestamps inmutables. No eran daños producidos por el apagado.
- Fallo HTTP previo reproducido y confirmado contra HEAD: JSON inválido ahora devuelve 502. El DTO PayPal rechaza cero antes del proveedor.
- Recuperación de compras ampliada a listado autenticado y botones para retomar/verificar tras reinicio; referencias externas y reserva conservadas ante fallo local.
- .dockerignore excluye entornos/cachés Python y archivos de ejecución: una caché con acceso denegado impedía construir. Sin cambios de estrategia Docker ni permisos de carpetas del usuario.

## Comandos y resultados

| Comprobación | Resultado |
|---|---|
| build backend, web, desktop; check-types api-client | Aprobados; backend también construido en Docker |
| npm test --workspace=backend -- --runInBand | 127 aprobadas / 17 suites |
| DB_E2E=1; npm run test:e2e --workspace=backend -- --runInBand | 56 aprobadas; 7 externas omitidas (LIVE_APIS desactivado) |
| npm test --workspace=@repo/api-client | 32 aprobadas |
| .venv/Scripts/python.exe -m pytest -q desde internal-api | 29 aprobadas; advertencia Starlette/httpx, sin actualizar versiones |
| psql -X -v ON_ERROR_STOP=1, pruebas_init.sql | Aprobado; SET CONSTRAINTS forzado antes de ROLLBACK |
| node scripts/verify-schema.cjs | 34 tablas/160 columnas, 20 funciones y 19 triggers coinciden |
| verify-excel.py sobre Excel actualizado | 147 columnas/33 tablas conformes, con excepciones expresas documentadas |
| scripts/smoke-internal.cjs y uvicorn real | JWT compartido, PIN bcrypt Nest→Python, SOS, cierre, tickets; recuperación al arranque y periódica |
| Carreras PostgreSQL reales | Cupos/contactos, dos bajas/cambios de rol admin, SOS, manual/job, enlaces/envíos contra cierre/borrado, ventas y retry 40001/40P01 |

## Pendientes y siguiente paso exacto

No hay bloqueo local. Faltan aceptación visual en navegador/Electron y pago completo con comprador PayPal Sandbox; las pruebas locales no acreditan al proveedor real. Las tarifas comerciales del plan base y la resolución operativa de órdenes antiguas siguen pendientes de decisión. WhatsApp/transporte y servicios médicos continúan diferidos.

Siguiente paso de aceptación: abrir la web en modo Docker, iniciar sesión con el principal de README_BDD y comprobar retomar/verificar compras; completar una compra con un comprador Sandbox y contrastar venta, captura y una sola concesión de cupos. El informe incluye pasos y límites. No volver a recrear la base para ello.

Después de apagar el equipo: iniciar Docker/Compose sin borrar volúmenes y ejecutar FastAPI con los comandos de services/internal-api/README.md para restablecer el job. No se añadió un servicio de inicio automático de Windows.
