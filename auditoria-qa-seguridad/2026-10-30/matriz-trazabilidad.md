# Matriz de trazabilidad — Requisito/HU → Criterio → Prueba → Resultado → Evidencia

Fecha: 2026-10-30. Estados: APROBADO / FALLIDO / BLOQUEADO / NO EJECUTADO / FUERA DE ALCANCE.
Las pruebas con prefijo `QA-`/`SEC-` las diseñó y ejecutó esta auditoría contra las APIs
aisladas; su evidencia por caso está en `evidencias/casos-api.jsonl` y
`evidencias/casos-seguridad.jsonl` (una línea JSON sanitizada por caso, con estado y respuesta
observada). Las filas "suite" corresponden a las pruebas automatizadas existentes del proyecto
reejecutadas (evidencia en `evidencias/reg-*.log`).

## A. Historias de usuario y requisitos funcionales

| HU / RF | Criterio | Caso(s) | Resultado | Evidencia |
|---|---|---|---|---|
| HU-01 / RF1 | CA-01.1 registro válido; formato y unicidad de correo | QA-HU01-01/02, SEC-REG-03 | APROBADO | casos-api.jsonl |
| HU-01 / RF1 | CA-01.2 contraseña ≥ 8, hash | QA-HU01-03 | APROBADO | casos-api.jsonl |
| HU-01 / RF3 | Registro exige Firebase verificado y correo coincidente | SEC-REG-01/02 | APROBADO | casos-api.jsonl |
| HU-02 / RF2 | CA-02.1 login con JWT; error genérico | QA-HU02-01/02/03 | APROBADO | casos-api.jsonl |
| HU-02 / RNF3 | No enumeración de usuarios (mismo mensaje) | SEC-ENUM-01 | APROBADO | casos-api.jsonl |
| HU-03 / RF6 | CA-03.1 contacto E.164, duplicado, formato | QA-HU03-01/02/03 | APROBADO | casos-api.jsonl |
| HU-04 / RF7 | Límite/propiedad de contactos | SEC-IDOR-01/02 | APROBADO | casos-api.jsonl |
| HU-05 / RF12 | CA-05.1 mensaje ≤ 160 (backend) | QA-HU05-01 | APROBADO | casos-api.jsonl |
| HU-06 / RF11 | SOS crea alerta, encola envíos, reglas plan/contacto | QA-HU06-01/04/05/06 | APROBADO | casos-api.jsonl |
| HU-07 / RF13 | CA-07.1 SOS sin GPS se acepta (fallback) | QA-HU07-01 | APROBADO | casos-api.jsonl |
| HU-08 / RF11 | CA-08.1 envío por contacto con estado (encolado) | QA-HU06-04 (whatsapp.pendientes≥1) | APROBADO | casos-api.jsonl |
| HU-10 / RF23 | CA-10.1 PIN 4 dígitos; bloqueo 3 intentos/5 min | QA-HU10-01/02, SEC-PIN-01 | APROBADO | casos-api.jsonl |
| HU-11 / RF10 | CA-11.1 ficha médica cifrada AES en reposo | QA-HU11-01, SEC-CRYPTO-01 | APROBADO | casos-api.jsonl |
| HU-13 / RF15,RF19 | CA-13.1 panel admin restringido por rol | SEC-AUTHZ-01…06 | APROBADO | casos-api.jsonl |
| HU-14 / RF14(ciclo) | CA-14.1 estados ACTIVA/FINALIZADA; cierre con PIN; idempotente | QA-HU14-01/02 | APROBADO | casos-api.jsonl |
| HU-15 / RF3 | CA-15.1 cambio de credenciales (recuperación Firebase) | cubierto por SEC-REG/flujo login | APROBADO (parcial) | casos-api.jsonl / resultados-qa.md |
| HU-16 / RF16 | CA-16.1 compra plan/cupos PayPal; precio servidor | QA-HU16-01/02/03, QA-HU16-PRICE | APROBADO | casos-api.jsonl |
| HU-17 / RF14 | Números oficiales 131/132/133 (solo UI móvil) | — | NO EJECUTADO (UI nativa) | resultados-qa.md |
| HU-18 / RF18 | CA-18.1 ticket y contacto público; validaciones | QA-HU18-01…04 | APROBADO | casos-api.jsonl |
| HU-19 / RF21,RF22 | CA-19.1 informe PDF/XLSX autorizado | QA-HU06/row reporte + suite | APROBADO (con reserva, ver QA-REG-01) | casos-api.jsonl / resultados-qa.md |
| HU-09 / RF8,RF25 | Vínculo/cupos apadrinados, máx. 5 | suite backend e2e (apadrinados) + QA-HU16 | APROBADO (unidad) | resultados-qa.md |

## B. Requisitos no funcionales (seguridad y calidad)

| RNF | Criterio | Caso(s) | Resultado | Evidencia |
|---|---|---|---|---|
| RNF3 | Protección de credenciales; errores sin fuga | SEC-ENUM-01, SEC-HDR-01 | APROBADO | casos-api/seguridad.jsonl |
| RNF4 | Control de acceso por rol en el servidor | SEC-AUTHZ-01…07, SEC-BOLA-01…04 | APROBADO | casos-seguridad.jsonl |
| RNF4 / CA-NF4-02 | Allowlist CORS | SEC-CORS-01/02 | APROBADO | casos-api.jsonl |
| RNF5 / CA-NF5-02 | IDOR/BOLA entre usuarios | SEC-IDOR-01…04, SEC-BOLA-03 | APROBADO | casos-api/seguridad.jsonl |
| RNF5 | Inyección SQL | SEC-SQLI-01/02/03 | APROBADO | casos-seguridad.jsonl |
| RNF5 | XSS almacenado / tipo de contenido | SEC-XSS-01/02 | APROBADO | casos-seguridad.jsonl |
| RNF8 | Cifrado de datos de salud (Ley 21.719) | SEC-CRYPTO-01 | APROBADO | casos-api.jsonl |
| RNF7 | Resiliencia ante caída de proveedor | SEC-RESIL-01/02 | APROBADO | casos-seguridad.jsonl |
| CA-NF8-01 | Electron: nodeIntegration off, contextIsolation on, CSP | suite `main.test.cjs` (3/3) + revisión estática | APROBADO (estático/unidad) | resultados-seguridad.md |
| RNF1 | Responsividad | pruebas de componentes Vitest | APROBADO (componentes) / UI viva BLOQUEADO | resultados-qa.md |
| RNF2 | Compatibilidad entre navegadores | — | NO EJECUTADO | resultados-qa.md |
| RNF6 | Latencia SOS < umbral / carga | — | NO EJECUTADO (carga fuera de alcance) | resultados-qa.md |
| RNF9/RNF10 | Borrado de datos al eliminar cuenta / WCAG | — | NO EJECUTADO | resultados-qa.md |

## C. Controles de seguridad del compañero (PRE-SEC / H)

| ID | Control | Caso(s) | Estado verificación | Evidencia |
|---|---|---|---|---|
| PRE-SEC-001 | Rutas genéricas PayPal/reports retiradas; maps/indicators con JWT | SEC-PRESEC001-01…04 | VERIFICADA | casos-api.jsonl |
| PRE-SEC-006 | Límites de cuerpo/estructura/tasa; tope de reportes | SEC-LIM-01/02/03, SEC-RATE-01, SEC-MASSASSIGN-01 | VERIFICADA | casos-api.jsonl |
| PRE-SEC-007 | Sesión: expiración, firma, issuer/audience | SEC-JWT-01/02/03 | VERIFICADA (parcial) | casos-api.jsonl |
| PRE-SEC-008 | PIN con bloqueo persistente | SEC-PIN-01 | VERIFICADA | casos-api.jsonl |
| PRE-SEC-011 | Cabeceras de seguridad; docs off en prod | SEC-HDR-01, SEC-DOCS-01 | VERIFICADA (test) | casos-api.jsonl |
| PRE-SEC-003 | BD/servicios no expuestos ampliamente | observación runtime | INCOMPLETA (runtime stale) | resultados-seguridad.md |
| PRE-SEC-004 | PIN FastAPI con bcrypt (sin Node/subprocess) | arranque FastAPI + SOS cierre | VERIFICADA (fuente/arranque) | fastapi.log, QA-HU14 |
| PRE-SEC-002/005/009/010/012/013/014/015 | Secretos, hosting, dispatcher, permisos BD, seed, backup, dependencias, Electron/Android | revisión estática / suites | Ver `verificacion-correcciones-previas.md` | — |

Detalle y reservas en `resultados-qa.md`, `resultados-seguridad.md` y
`verificacion-correcciones-previas.md`.
