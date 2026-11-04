# Trazabilidad: documentación frente a implementación

Escrito para: estudiante que debe relacionar cada documento con el código y señalar diferencias.

**Alcance de esta revisión:**
- Leídos: `README.md` (raíz del aplicativo), `README_BDD.md`, `readme.apis.internas.md`, `readme-apis.md`, `services/internal-api/README.md` (cabecera), `apps/backend/README.md` (plantilla NestJS), `init.sql` (esquema) y los `migrations/`.
- **No leídos:** los documentos `.docx`, `.xlsx`, `.drawio`, `.pdf`, `.png`, `.bmpr` y los videos de `Evidencias de documentación/`. Sus propósitos de la tabla de abajo se deducen **solo del nombre del archivo**. Hay que leerlos antes de citarlos en la defensa.

## 1. Inventario de documentos

### 1.1 Documentos del proyecto (`Evidencias de documentación/`)

| Carpeta / archivo | Propósito (según el nombre) | Relación con el código | Estado de revisión |
|---|---|---|---|
| 1.1 Lean Canvas / Vision del Producto.docx | Propuesta de valor | Ninguna directa | No leído |
| 1.2 Sprint Planning / 1.2.1 Hoja de ruta, 1.2.2 y 1.2.3 Sprint | Planificación por fases | Ninguna directa | No leído |
| 1.2 Sprint Planning / Sprint 1 a 4 (.docx), Trello.json | Historial de sprints | Ninguna directa | No leído |
| 1.3 Acta de constitución | Constitución del proyecto | Ninguna directa | No leído |
| 1.4 Documento ERS / Informe ERS.docx | Especificación de requisitos | Requisitos funcionales y no funcionales | No leído |
| 1.5 RACI / Matriz RACI.xlsx | Responsabilidades | Ninguna directa | No leído |
| 1.6 Informe TEC | Horas por tarea | Ninguna directa | No leído |
| 2.1 Product Backlog | Backlog y puntos de historia | Ninguna directa | No leído |
| 2.2 Épicas e Historias de Usuario | Historias de usuario | Funcionalidades F1 a F12 | No leído |
| 2.3 Plan de Pruebas / Plan de pruebas.docx y Matriz de trazabilidad | Pruebas planificadas | Compararlo con las pruebas de la sección 8 de los README | No leído |
| 3.1 Criterios de Aceptación.xlsx | Criterios de aceptación | Las reglas de README_BDD (CA-03.1, CA-05.1, CA-11.1) citan "CA" | No leído |
| 3.2 Wireframes o Mockups (.bmpr, .pdf, videos) | Diseño de pantallas | Rutas de web, móvil y escritorio | No leído |
| 3.3 Diagrama UML (casos de uso, componentes, secuencia) | Modelado | Comparar con la sección 4 de [ARQUITECTURA.md](../01_arquitectura/ARQUITECTURA.md) | No leído |
| 4.1 Diccionario de Datos / BDD con tipos de datos.xlsx, Diagrama ER | Modelo de datos | `init.sql` (34 tablas) | No leído |
| 4.2 Especificación de Herramientas y Servicios.docx | Decisión de herramientas | Sección 5 del README | No leído |
| 4.3 Arquitectura / Diagrama de Arquitectura.drawio, .png | Arquitectura | [ARQUITECTURA.md](../01_arquitectura/ARQUITECTURA.md) | No leído |
| 4.4 Docker / docker-compose, Dockerfile, README | Despliegue | Archivos homónimos de la raíz | Comparar con la raíz |
| Auditoría de Cambios / *.docx y datos_agrupados_trazable | Seguimiento de hallazgos | Ver la memoria de trabajo del responsable | No leído |

### 1.2 Documentos de la aplicación (`Evidencias de sistema Aplicación/`)

| Documento | Propósito | Qué afirma | Contrastado con el código |
|---|---|---|---|
| `README.md` | Puesta en marcha, arquitectura, servicios, Android | Monorepo, servicios, pasos de instalación | Sí, por secciones (ver §2) |
| `README_BDD.md` | Base de datos y cuentas de desarrollo | Esquema vigente, reglas de cupos, SOS, PIN | Sí (ver §2) |
| `readme.apis.internas.md` | Contrato de APIs internas | Rutas de FastAPI y de administración | Sí: todas las rutas citadas existen |
| `readme-apis.md` | Guía de integraciones | Rutas de compras, WhatsApp, reportes, Google | Sí: todas las rutas citadas existen |
| `services/internal-api/README.md` | Operación de FastAPI | Configuración y uso | Solo cabecera leída |
| `apps/backend/README.md` | Plantilla de NestJS | Sin contenido propio | Irrelevante para la defensa |
| `init.sql` | Esquema y catálogos | 34 tablas | Fuente de verdad del esquema |
| `migrations/` (11 archivos) | Cambios posteriores al init | Ver README_BDD | Los nombres coinciden con el README |
| `CONTRIBUTING.md` (raíz del repositorio) | Reglas del equipo | No leído en esta sesión | Pendiente |

## 2. Matriz de trazabilidad

Formato: **Documento → Requisito o funcionalidad → Archivos de código → Rutas → Evidencia → Observación**.

| Documento | Requisito o funcionalidad | Archivos de código | Rutas | Evidencia | Observación |
|---|---|---|---|---|---|
| README §5 y `readme-apis.md` | Pagos con PayPal | `apps/backend/src/compras/`, `integrations/paypal/` | `/compras/*`, `/payments/paypal/*` | Rutas presentes | Las rutas `/payments/paypal/*` no tienen guard y no aparecen en la guía |
| README §5 | Mensajes de WhatsApp al SOS | `integrations/whatsapp/whatsapp-sos-dispatcher.service.ts` | `/notifications/whatsapp/*` | Lectura del dispatcher | Documentado como "no es API oficial" (Baileys). Correcto |
| README_BDD | Cupos de apadrinados, compra antes que captura | `compras/`, `reserva_cupos` | `/compras/apadrinados/ordenes`, `/captura`, `/conciliar` | Lectura del flujo | Coincide, salvo la ventana de 5 horas (ver §3.4) |
| README_BDD | SOS: plan y contacto necesarios, sin PIN para emitir | `services/alertas.py` `crear` | `POST /internal/v1/alertas` | Lectura de `crear` | Coincide |
| README_BDD | Cinco fallos de PIN bloquean 15 minutos | `services/alertas.py` `cerrar` (`:92`) | `POST /internal/v1/alertas/{id}/cerrar` | Lectura | Coincide para SOS. El PIN de login (NestJS) usa otra política (ver §3.3) |
| README_BDD | Cierre automático cada 30 segundos y a las 24 horas | `core/scheduler.py`, `core/config.py:32` | — | Lectura | Coincide |
| README_BDD | Estados 1 completo, 2 parcial; sin estado 3 | `usuario.estado_ID` | — | Lectura de `services/internal-api/app/dependencies/auth.py` (`UsuarioSesion.es_staff` exige `estado_id == 1`) | Coincide |
| readme.apis.internas.md | Contrato de SOS, soporte, ventas y auditoría | `api/routes/*.py`, `admin/*.controller.ts` | Ver la matriz | 100 % de rutas citadas encontradas | Coincide |
| readme-apis.md | Rutas de WhatsApp | `whatsapp.controller.ts` | `/notifications/whatsapp/*` | Lectura | Coincide |
| Regla de negocio de memoria (confirmada 2026-10-29) | Admin y soporte solo en escritorio; web y móvil rechazan su entrada | `login.service.ts:111`, `:145`; `apps/web/src/App.tsx:135` | `POST /usuarios/login` | Lectura | **No se cumple.** El login no distingue plataforma |

## 3. Diferencias y contradicciones

### 3.1 Documentos citados que no existen

El README cita estos archivos en `docs/`, y esa carpeta no existe en el árbol de trabajo ni en Git:

| Archivo citado | Dónde se cita | Efecto |
|---|---|---|
| `docs/DESPLIEGUE.md` | README (introducción) | El despliegue a hosting no tiene guía |
| `docs/WHATSAPP_SOS.md` | README §5 y §10 | La guía de vinculación de WhatsApp no está |
| `docs/PRUEBAS_SOS.md` | README §10 | Las pruebas de SOS no están documentadas |
| `docs/PRUEBAS_COMPRA_PLAN.md` | README_BDD y README §10 | Las pruebas de compra no están documentadas |
| `docs/INTEGRACION_BDD_2026-10-21.md` | README_BDD y README §10 | El informe de integración de la base no está |

Pueden existir en otra copia del proyecto o no haberse subido. Hay que confirmarlo antes de la defensa.

### 3.2 Documentos y rutas que sí existen

- `scripts/cifrar-fichas.cjs` (citado en README_BDD) existe.
- `readme.apis.internas.md`, `readme-apis.md` y `README_BDD.md` existen.
- `migrations/003`, `004`, `005_pin_temporal`, `006_apadrinado_sin_credenciales` existen (ver el listado de `migrations/`).

### 3.3 Dos políticas de bloqueo de PIN

| Dónde | Intentos antes de bloquear | Duración | Evidencia |
|---|---|---|---|
| NestJS, PIN de perfil al iniciar sesión | 3 | 5 minutos | `apps/backend/src/login/pin-principal.ts:6` y `:30`; prueba "el tercer fallo bloquea 5 minutos" |
| FastAPI, PIN para cerrar un SOS | 5 | 15 minutos | `services/internal-api/app/services/alertas.py:92` |

El README solo describe la de 15 minutos, referida a SOS. La de 5 minutos del login no aparece en la documentación. No es una contradicción directa, pero sí una diferencia que la comisión puede preguntar.

### 3.4 Ventana de 5 horas para compras pendientes

README_BDD dice que "tras cinco horas una creación sin ID externo requiere revisión manual con PayPal" y que "la ventana es una política conservadora de esta integración". No encontré un valor de 5 horas en el código del servicio de PayPal con búsqueda de texto. Puede estar implementada con otro nombre o en la web. Queda pendiente de verificar.

### 3.5 Regla de acceso por plataforma no implementada

La regla confirmada por el equipo (ver la nota de memoria del responsable) dice que administración y soporte solo entran por escritorio. El código de `iniciarSesion` no compara rol con plataforma y registra siempre `APLICACION.WEB`. Ver [PUNTOS_CRITICOS.md](../10_informes/PUNTOS_CRITICOS.md) para el detalle.

### 3.6 Documentación de rutas que no existen

No encontré ninguna ruta documentada que falte en el código. Sí encontré rutas que el código tiene y la documentación no menciona (39 rutas; ver [MATRIZ_RUTAS.md](../02_rutas/MATRIZ_RUTAS.md)).

## 4. Qué comprobar antes de la defensa

1. Leer los `.docx` de 1.4 (ERS) y 2.3 (Plan de pruebas) para cruzar requisitos con rutas.
2. Leer `4.1` (diccionario de datos) y comparar tipos con `init.sql`.
3. Leer `3.3` (diagramas UML) y comparar con la arquitectura real.
4. Confirmar si los cinco archivos de `docs/` existen en otra copia.
5. Revisar `CONTRIBUTING.md` de la raíz del repositorio.
