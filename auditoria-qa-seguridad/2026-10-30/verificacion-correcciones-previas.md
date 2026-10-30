# Verificación de las correcciones de seguridad previas (compañero)

Fecha: 2026-10-30. Las correcciones se identificaron con certeza: están en el commit `d1026df`
("Ajuste completo de ciberseguridad, accesos, variables y credenciales", Alonso, 2026-10-30) y
documentadas en `docs/FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md` (serie PRE-SEC-001…015 y H2–H5),
que responden al `LEVANTAMIENTO_CIBERSEGURIDAD_EMERGEN.md`.

Clasificación: **VERIFICADA** (prueba de regresión confirma el control), **INCOMPLETA** (control
presente en código pero con pendientes), **NO EFECTIVA** (el control no logra su objetivo),
**NO VERIFICABLE** (requiere entorno/datos no disponibles).

| ID | Qué pretendía resolver | Comportamiento actual comprobado | Clasificación | Evidencia |
|---|---|---|---|---|
| PRE-SEC-001 | Rutas genéricas `/payments/paypal` y `/reports` sin guarda; maps/indicators públicos | `/payments/paypal/orders` y `/reports` → **404** (retiradas); `/maps` e `/indicators` exigen **JWT** (401 sin token, 200 con token); `/compras/precio` sigue público | **VERIFICADA** | SEC-PRESEC001-01…04 |
| PRE-SEC-002 | Secretos en copias documentales Docker | Placeholders en el árbol (revisión); vigencia/rotación de valores históricos es acción del responsable (no se probaron credenciales) | INCOMPLETA (operativo) | revisión estática |
| PRE-SEC-003 | BD/jsReport expuestos en todas las interfaces | Compose local limita BD a loopback, pero **los contenedores en ejecución (imagen previa al fix) siguen publicando 0.0.0.0:3001/8000**; mitigación real en `docker-compose.production.yml` no aplicada | **INCOMPLETA** (no corregido en runtime) | docker ps, resultados-seguridad §2 |
| PRE-SEC-004 | Cierre SOS dependía de Node+subprocess+bcrypt ausente en imagen Python | `app/core/pin.py` usa `bcrypt` directo; FastAPI arranca y el **cierre de SOS con PIN funciona** (QA-HU14-01) y bloquea el inválido | **VERIFICADA** (fuente + arranque + cierre) | fastapi.log, QA-HU14-01/02, SEC-PIN |
| PRE-SEC-005 | Dependencia del PC / hosting | `docker-compose.production.yml` y runbooks preparados; decisión y operación de hosting pendientes | NO VERIFICABLE (sin hosting) | revisión estática |
| PRE-SEC-006 | Sin límites de cuerpo/estructura/tasa; reportes sin tope | 413/415/400 según corresponde; anti mass-assignment; rate-limit con 429+Retry-After; tope de reportes activo | **VERIFICADA** | SEC-LIM-*, SEC-RATE-01, SEC-MASSASSIGN-01 |
| PRE-SEC-007 | JWT sin revocación; validación de sesión | Expiración, firma e issuer/audience se validan (401). La **revocación individual** tras logout/cambio de contraseña sigue sin existir (token válido hasta `exp`, por defecto 2 h): decisión pendiente | INCOMPLETA (por diseño/decisión) | SEC-JWT-01/02/03 |
| PRE-SEC-008 | PIN con bloqueo; contadores | Bloqueo persistente por 3 intentos (Nest) confirmado; contadores con TTL/capacidad en FastAPI (revisión) | **VERIFICADA** (Nest) / INCOMPLETA (réplicas) | SEC-PIN-01 |
| PRE-SEC-009 | Confiabilidad del dispatcher (exactly-once) | No rediseñado; envío dentro de transacción conservado. No se probó entrega real (WhatsApp fuera de alcance) | NO VERIFICABLE | — |
| PRE-SEC-010 | Credencial BD compartida; hardening Compose | Propuesta de permisos (`docs/PERMISOS_BD_PROPUESTA.md`) y hardening en Compose de producción; no aplicados a BD/servicios reales | INCOMPLETA (operativo) | revisión estática |
| PRE-SEC-011 | Docs FastAPI on por defecto; cabeceras | Cabeceras de seguridad presentes en respuestas; `docs_enabled=false` en staging/production por `config.py` (verificado por configuración; en `test` siguen on, correcto) | **VERIFICADA** (test) / PREVENTIVO (CSP frontend) | SEC-HDR-01, SEC-DOCS-01 |
| PRE-SEC-012 | Seed con credenciales conocidas | Guarda `seed-safety.cjs` (6 casos puros pasan); documento de cuentas con placeholders. Exclusión de demos del destino es del responsable. Efecto lateral: las suites pytest dependían de ese seed | **VERIFICADA** (guarda) / INCOMPLETA (operativo) | reg-node-test-scripts.log |
| PRE-SEC-013 | Backup sin `existsSync`, sin ACL | Import corregido; prueba VM 2/2 pasa; cifrado/retención/restauración reales pendientes | **VERIFICADA** (defecto local) / INCOMPLETA (operativo) | reg-node-test-backup.log |
| PRE-SEC-014 | Dependencias vulnerables (Electron/Vite) | Vite 8.3.3 y Electron 44.9.1 fijados; lock Python con hashes. Auditoría transitiva/imágenes pendiente. **Nota:** el `.venv` local quedó en Python 3.14 sin bcrypt (QA-ENV-01) | INCOMPLETA | revisión estática, fastapi.log |
| PRE-SEC-015 | Electron renderer/FileProvider | `main.test.cjs` 3/3 (política de renderer); FileProvider restringido. Binario firmado/APK real pendiente | **VERIFICADA** (unidad) / INCOMPLETA (nativo) | reg-node-test-scripts.log |
| H2 | Guarda de seed/entorno | `seed-safety.test.cjs` 7/7 | **VERIFICADA** | reg-node-test-scripts.log |
| H3 | Orden CORS antes de boundedJson; 413/415 con ACAO | CORS + límites confirmados dinámicamente (SEC-CORS, SEC-LIM); `configureHttpBoundary` compartido con el arranque real | **VERIFICADA** (414 no probado) | SEC-CORS-*, SEC-LIM-* |
| H4 | PIN FastAPI con bcrypt / venv | bcrypt en uso; **venv del equipo desactualizado** (QA-ENV-01) | INCOMPLETA (venv local) | fastapi.log |
| H5 | Instalación limpia Electron / panel | Cubierto por suites Electron; no se validó binario en este host | NO VERIFICABLE (nativo) | — |

## Variantes de elusión probadas (y resultado)
- Falsificar rol en el JWT para escalar privilegios → **sin efecto** (servidor relee BD): `SEC-BOLA-04`.
- Falsear `usuario_id` ajeno en listados FastAPI → **forzado al propio**: `SEC-BOLA-03`.
- Acceder a objetos de otro usuario (contacto/ticket/alerta) → **404/403**: `SEC-IDOR-01…04`.
- Payload SQL en campos y filtros → **parametrizado / rechazado por allowlist**: `SEC-SQLI-*`.
- Reactivar vías genéricas retiradas → **404**: `SEC-PRESEC001-*`.

## Conclusión
El núcleo del fortalecimiento (rutas genéricas, límites, autorización por rol/propiedad, cifrado
médico, PIN, sesión, cabeceras) está **VERIFICADO** por regresión dinámica. Quedan **INCOMPLETAS**
por acción operativa/decisión: exposición en runtime (PRE-SEC-003), revocación de sesión
(PRE-SEC-007), permisos de BD y hosting (PRE-SEC-005/010), cadena de dependencias y venv
(PRE-SEC-014/QA-ENV-01). No se halló ninguna corrección **NO EFECTIVA**.
