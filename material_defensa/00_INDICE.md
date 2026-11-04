# Material de defensa: EMERGEN

Escrito para: la persona que prepara la defensa del proyecto, para estudiarlo por su cuenta.

Todas las rutas de archivo de este material son relativas a la carpeta `Evidencias de sistema Aplicación/` (la que contiene `package.json`, `apps/`, `services/` e `init.sql`). Los números de línea se verificaron leyendo el código en esta sesión.

## Cómo estudiar (orden recomendado)

1. [Resumen rápido](07_guias_estudio/RESUMEN_RAPIDO.md): una lectura de 20 minutos con lo esencial.
2. [Arquitectura](01_arquitectura/ARQUITECTURA.md): cómo se conectan las piezas, con diagramas.
3. [Matriz de rutas](02_rutas/MATRIZ_RUTAS.md) y [mapa de rutas](02_rutas/MAPA_DE_RUTAS.md): dónde está cada endpoint y qué protege.
4. [Funcionalidades](03_funcionalidades/FUNCIONALIDADES.md): recorrido de cada funcionalidad de extremo a extremo.
5. [Guía completa](07_guias_estudio/GUIA_COMPLETA_DEFENSA.md): el documento principal, con los 11 capítulos.
6. [Puntos críticos](10_informes/PUNTOS_CRITICOS.md): lo que debes conocer antes de que te lo pregunten.
7. [Preguntas de defensa](08_preguntas_defensa/PREGUNTAS_DEFENSA.md) y [simulador](08_preguntas_defensa/SIMULADOR_DEFENSA.md) para practicar.
8. [Guion de presentación](09_guiones/GUION_PRESENTACION.md) para la exposición oral de 10 a 15 minutos.

## Carpetas

| Carpeta | Contenido | Estado |
|---|---|---|
| [01_arquitectura](01_arquitectura/) | [ARQUITECTURA.md](01_arquitectura/ARQUITECTURA.md) | Entregado |
| [02_rutas](02_rutas/) | [MATRIZ_RUTAS.md](02_rutas/MATRIZ_RUTAS.md), [MAPA_DE_RUTAS.md](02_rutas/MAPA_DE_RUTAS.md) | Entregado |
| [03_funcionalidades](03_funcionalidades/) | [FUNCIONALIDADES.md](03_funcionalidades/FUNCIONALIDADES.md) | Entregado |
| [04_documentacion](04_documentacion/) | [TRAZABILIDAD_DOCUMENTACION.md](04_documentacion/TRAZABILIDAD_DOCUMENTACION.md) | Entregado, con documentos binarios pendientes de lectura |
| [05_code_walkthrough](05_code_walkthrough/) | [README.md](05_code_walkthrough/README.md): estado de la skill y del servidor | Skill y servidor instalados; sin walkthrough HTML. Resaltados solo en el estudio, no en los videos |
| [06_videos](06_videos/) | [README.md](06_videos/README.md) y [INDICE_VIDEOS.md](06_videos/INDICE_VIDEOS.md): los 10 videos MP4 y su storyboard | **10 videos producidos** (1920×1080, narración, subtítulos y capítulos) |
| [07_guias_estudio](07_guias_estudio/) | [GUIA_COMPLETA_DEFENSA.md](07_guias_estudio/GUIA_COMPLETA_DEFENSA.md), [GLOSARIO_TECNICO.md](07_guias_estudio/GLOSARIO_TECNICO.md), [RESUMEN_RAPIDO.md](07_guias_estudio/RESUMEN_RAPIDO.md) | Entregado |
| [08_preguntas_defensa](08_preguntas_defensa/) | [PREGUNTAS_DEFENSA.md](08_preguntas_defensa/PREGUNTAS_DEFENSA.md) (67 preguntas), [SIMULADOR_DEFENSA.md](08_preguntas_defensa/SIMULADOR_DEFENSA.md) | Entregado |
| [09_guiones](09_guiones/) | [GUION_PRESENTACION.md](09_guiones/GUION_PRESENTACION.md) | Entregado |
| [10_informes](10_informes/) | [INFORME_COBERTURA.md](10_informes/INFORME_COBERTURA.md), [PUNTOS_CRITICOS.md](10_informes/PUNTOS_CRITICOS.md) | Entregado |

## Lo más importante que encontré

1. **La regla de acceso por plataforma no está implementada en el login.** El equipo la confirmó en una sesión de QA (según la nota de memoria de trabajo del responsable): administración y soporte solo en escritorio, y web y móvil deben rechazar su entrada. `iniciarSesion` no compara rol con plataforma y siempre registra `APLICACION.WEB` (`apps/backend/src/login/login.service.ts:111`, `:145`). En la web solo se ocultan dos rutas al personal (`apps/web/src/App.tsx:135`, `:214-215`).
2. **Tres endpoints no tienen guard de autenticación:** `POST /reports` (jsReport), `POST /payments/paypal/orders` y `POST /payments/paypal/orders/:orderId/capture`. Sus módulos están registrados en `AppModule` y los frontends no los llaman. Ver [PUNTOS_CRITICOS.md](10_informes/PUNTOS_CRITICOS.md).
3. **Dos políticas de bloqueo de PIN distintas:** NestJS bloquea 5 minutos tras 3 fallos (`apps/backend/src/login/pin-principal.ts:6`, `:30`); FastAPI bloquea 15 minutos tras 5 fallos al cerrar un SOS (`services/internal-api/app/services/alertas.py:92`). El README solo menciona la segunda.
4. **Faltan 5 documentos citados por el README** (`docs/DESPLIEGUE.md`, `docs/PRUEBAS_SOS.md`, `docs/PRUEBAS_COMPRA_PLAN.md`, `docs/INTEGRACION_BDD_2026-10-21.md`, `docs/WHATSAPP_SOS.md`). La carpeta `docs/` no existe ni en disco ni en Git.
5. **Videos:** se produjeron los 10 videos de [06_videos](06_videos/) con Screencast MCP (grabación de VS Code, narración con la voz Helena, subtítulos, tarjetas de título y capítulos). No llevan resaltado de Code Walkthrough: su servidor vive en otra ventana de VS Code, y la grabación limpia no lo muestra. Ver [06_videos/README.md](06_videos/README.md).
6. **Code Walkthrough:** la skill y el servidor MCP están instalados y conectados, pero no se generó un walkthrough HTML.

## Verificaciones realizadas

| Tipo | Qué | Resultado |
|---|---|---|
| Ejecución | `npm test -- src/login/login-pin.spec.ts` en `apps/backend` (pruebas con mocks, sin base de datos) | 9 de 9 pasaron |
| Lectura de código | Todos los controladores NestJS y routers FastAPI, guards, `AppModule`, `init.sql`, `main.ts`, `main.py` | Completa |
| Cruce documental | Rutas que citan `readme.apis.internas.md`, `readme-apis.md` y `README.md` frente a las del código | Todas las rutas documentadas existen; ver la matriz |
| No ejecutadas | Pruebas de FastAPI (`services/internal-api/tests`, requieren PostgreSQL), pruebas de web, móvil y escritorio, y pruebas e2e | No se ejecutaron. No afirmo resultados de estas |

## Restricciones respetadas

- No se modificó código fuente, configuración, documentación original ni base de datos.
- No se instaló ninguna dependencia ni se ejecutó ninguna migración.
- No se hizo commit, merge, push ni cambio de rama. Esta carpeta queda sin versionar.
- No se leyeron `.env`, `.env.*.local` ni `.android.local.json`, porque contienen secretos. No se copió ninguna contraseña, token ni PIN de los README.
- Los archivos binarios (`.docx`, `.xlsx`, `.drawio`, `.png`, `.bmpr`) no se leyeron; ver [TRAZABILIDAD_DOCUMENTACION.md](04_documentacion/TRAZABILIDAD_DOCUMENTACION.md).
