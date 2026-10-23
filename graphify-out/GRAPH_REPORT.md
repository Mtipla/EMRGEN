# Graph Report - EMRGEN  (2026-10-23)

## Corpus Check
- 287 files · ~195,240 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 41 file(s) not represented in the graph (top: (none) 26, .css 12, .pptx 1)

## Summary
- 2686 nodes · 5250 edges · 173 communities (133 shown, 40 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 221 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f6e2e66c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ActualizarPerfilDto
- USUARIO Table
- ref_react
- eslint-config/package.json
- CuentaPages.tsx
- backend/package.json
- LoginController
- ApadrinadosController
- mobile/package.json
- index.d.ts
- AdminService
- readEnv
- Diagrama ER Actualizado (EMRGEN)
- jsreport.service.ts
- 001_compras_paypal.sql
- mindicador.service.ts
- perfil-form.tsx
- emergency-alert.message.ts
- USUARIO
- Team Workflow Guide (Claude Code + Graphify + Git)
- firebase-auth.service.ts
- EMERGEN: integración de APIs externas
- DevDeps Backend NestJS
- ComprasService
- desktop/package.json
- wireframe.tsx
- web/package.json
- Sistema EMERGEN (system boundary)
- AdminService
- WhatsappController
- PremiumPurchase.tsx
- Integración BDD EMERGEN — resultado del 21-10-2026
- db-dev.cjs
- google-maps.ts
- Usuario
- devDependencies
- dependencies
- tickets_soporte.py
- compilerOptions
- @nestjs/common
- compilerOptions
- compilerOptions
- test_alertas.py
- errors.py
- GuardarPlanDto
- send-emergency-alert.dto.ts
- Diagrama de Componentes
- whatsapp-alert.service.ts
- WhatsappConnectionService
- compilerOptions
- whatsapp-connection.service.ts
- mindicador.service.ts
- tasks
- compilerOptions
- compilerOptions
- compilerOptions
- Integración BDD EMERGEN — resultado del 21-10-2026
- AppService
- devDependencies
- dependencies
- Diagrama de Arquitectura
- api-client/package.json
- scripts
- mobile/src/App.tsx
- Evidencias de sistema Aplicación/package.json
- ui/package.json
- firebase-auth.ts
- BaileysLoggerAdapter
- devDependencies
- usePremiumPurchase
- compilerOptions
- Archivos principales
- Trello Sprint Board Screenshot (Fase 1)
- Sprint 4 (31/8/2026)
- public.venta
- dependencies
- conftest.py
- PublicSite.tsx
- routes/alertas.py
- dependencies
- manifest.json
- api-client/tsconfig.json
- jest.config.ts
- ui/tsconfig.json
- avisar
- .oxlintrc.json
- tsconfig.build.json
- init.sql
- scripts
- compilerOptions
- WhatsappAlertService
- api-types/package.json
- typescript-config/package.json
- backend Service (nestjs_emergen_backend)
- obj_cl_Gestionar_Compras : Clase
- obj_cl_Gestionar_Usuario_Apadrinado : Clase
- obj_cl_Gestionar_Compras : Clase
- nest-cli.json
- PanelAdmin
- react-library.json
- paypal.service.ts
- obj_cl_Gestionar_Usuario : Clase
- obj_c_Gestionar_Usuario : Controlador
- obj_cl_enviar_mensaje : Clase
- obj_cl_Generar_Alerta : Clase
- obj_c_Contacto_Emergencia : Controlador
- obj_c_Gestionar_Credenciales : Controlador
- obj_c_Mensaje_Emergencia : Controlador
- obj_cl_Tipo_Emergencia : Clase
- obj_cl_Gestionar_Trabajadores : Clase
- obj_c_PIN : Controlador
- obj_cl_Iniciar Sesión : Clase
- obj_cl_ubicacion : Clase
- scripts
- scripts
- Turborepo Monorepo
- public.detalle_alerta
- public.bitacora_sistema
- CLAUDE.md
- Desktop App React + TypeScript + Vite Template README
- desktop/tsconfig.json
- cypress.config.ts
- web/tsconfig.json
- db (postgres:15-alpine) Service
- Backend NestJS Starter README
- @testing-library/jest-dom
- .env Configuration (single root .env)
- ActualizarMiUsuarioDto
- Cuentas temporales de prueba (solo entorno local)
- Team Rules (Reglas del equipo)
- Scrum Methodology
- Mobile App Favicon
- 4.4 Docker docker-compose Configuration
- Desktop App index.html Entry Point
- Social/Docs Icon Sprite (Bluesky, Discord, GitHub, X, docs) - desktop
- React Logo (desktop template asset)
- Vite Logo (desktop template asset)
- Mobile App index.html Entry Point (Ionic PWA)
- Web App index.html Entry Point
- Favicon Icon (Desktop App)
- Desktop App Hero Image
- actualizar-bitacora-auditoria.sql
- 20261006_pin_identity.sql
- 001_catalogos_soporte.sql
- pin
- External APIs Integration Guide
- ConfigurarAlerta.tsx
- public.venta
- db Service (postgres:15-alpine)
- ref_vite
- compras.service.ts
- public.detalle_venta
- index.ts
- verify-excel.py
- Test Seed Data Commands
- public.envio_alerta
- public.detalle_alerta
- scheduler.py
- public.bitacora_sistema
- pg_temp.must_fail
- css.d.ts

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 71 edges
2. `UsuarioSesion` - 40 edges
3. `Usuario` - 34 edges
4. `public.usuario` - 34 edges
5. `WhatsappConnectionService` - 30 edges
6. `LoginService` - 30 edges
7. `avisar()` - 30 edges
8. `typeorm` - 26 edges
9. `App()` - 26 edges
10. `ComprasService` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Twilio` --semantically_similar_to--> `WhatsApp (Baileys) Emergency Notifications`  [INFERRED] [semantically similar]
  README.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/readme-apis.md
- `5.1 Para qué sirve` --references--> `MapView()`  [INFERRED]
  Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/readme-apis.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/packages/ui/src/map-view.tsx
- `Cambios` --references--> `PerfilForm()`  [INFERRED]
  Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/CHANGELOG_DESARROLLO.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/packages/ui/src/perfil-form.tsx
- `MySQL Database (30 normalized tables)` --conceptually_related_to--> `db Service (postgres:15-alpine)`  [AMBIGUOUS]
  README.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/docker-compose.yml
- `Archivos principales` --references--> `readEnv()`  [INFERRED]
  Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/readme-apis.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/apps/backend/src/config/env.ts

## Import Cycles
- None detected.

## Communities (173 total, 40 thin omitted)

### Community 0 - "ActualizarPerfilDto"
Cohesion: 0.08
Nodes (5): ActualizarPerfilDto, ContactoDto, FichaMedicaDto, PerfilController, PerfilService

### Community 1 - "USUARIO Table"
Cohesion: 0.24
Nodes (8): Desktop Admin Panel (Electron 44), Mobile App (Ionic 9 + Capacitor 8), Shared Packages (eslint-config, typescript-config, ui), Troubleshooting Table, Turborepo Monorepo, Web App (React 19 + Vite 8 + Ionic 9), Solution Architecture (microservices + Turborepo), Twilio

### Community 2 - "ref_react"
Cohesion: 0.10
Nodes (31): AdminAlertasPage(), AdminCuentasPage(), AdminTicketsPage(), AdminTrabajadoresPage(), useAdminUsuarios(), aCatalogo(), AccountsPage(), SoportePage() (+23 more)

### Community 3 - "eslint-config/package.json"
Cohesion: 0.07
Nodes (30): config, nextJsConfig, devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-only-warn, eslint-plugin-react-hooks (+22 more)

### Community 4 - "CuentaPages.tsx"
Cohesion: 0.13
Nodes (27): AppShell(), AppShellProps, MENU, apadrinados, CuentasVinculadas(), HomePage(), perfilDatos, ProfilePage() (+19 more)

### Community 5 - "backend/package.json"
Cohesion: 0.05
Nodes (36): author, description, prettier, @repo/api-types, @types/node, typescript, license, name (+28 more)

### Community 8 - "mobile/package.json"
Cohesion: 0.05
Nodes (37): description, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, @ionic/react-router (+29 more)

### Community 9 - "index.d.ts"
Cohesion: 0.11
Nodes (9): CreatePaypalOrderDto, PaypalController, BASE_URLS, PaypalLink, PaypalOrder, PaypalService, CapturePaypalOrderResponse, CreatePaypalOrderRequest (+1 more)

### Community 10 - "AdminService"
Cohesion: 0.31
Nodes (3): AdminService, diferencias(), ActorAuditoria

### Community 11 - "readEnv"
Cohesion: 0.29
Nodes (7): readEnv(), requireEnv(), defaultCountryCode(), INTEGRATION, whatsappAuthDir(), bootstrap(), @nestjs/core

### Community 13 - "jsreport.service.ts"
Cohesion: 0.11
Nodes (9): ExternalRequestInit, logger, requestExternal(), requestExternalJson(), GenerateReportDto, JsreportController, InlineReportTemplate, JsreportService (+1 more)

### Community 15 - "mindicador.service.ts"
Cohesion: 0.11
Nodes (22): connect(), get_db(), transaction(), run_once(), historical(), test_24_horas_recuperacion_y_carrera_job_manual(), manual(), test_sos_concurrente_unico_y_replay() (+14 more)

### Community 16 - "perfil-form.tsx"
Cohesion: 0.08
Nodes (34): mensajeError(), CompraAdmin, CuentaApadrinada, CuentaVinculada, ESTADOS_PAGO, MAX_CONTACTOS, MOCK_COMPRAS, MOCK_CUENTAS_APADRINADAS (+26 more)

### Community 17 - "emergency-alert.message.ts"
Cohesion: 0.31
Nodes (7): buildEmergencyAlertText(), buildLocationMessage(), googleMapsLink(), location, EmergencyAlertResult, SendEmergencyAlertRequest, 7.4 Endpoints

### Community 18 - "USUARIO"
Cohesion: 0.08
Nodes (30): ACCESO_APLICACION, ALERTA, APLICACION, BITACORA_SISTEMA, CATEGORIA_SOPORTE, CONTACTO_EMERGENCIA, DETALLE_ALERTA, DETALLE_VENTA (+22 more)

### Community 19 - "Team Workflow Guide (Claude Code + Graphify + Git)"
Cohesion: 0.14
Nodes (21): CONTRIBUTING.md, graphify-out Knowledge Graph, Graphify Usage Rules, Branch Architecture (main, graphify, alonso, diego, gabriel), GitHub branch protection rules, Claude Code, CLAUDE.md graphify section and PreToolUse hook, Conventional Commits message format (+13 more)

### Community 20 - "firebase-auth.service.ts"
Cohesion: 0.15
Nodes (8): FirebaseAuthController, FirebaseAuthGuard, FirebaseRequest, FirebaseAuthModule, FirebaseAuthService, FirebaseTokenPayload, FirebaseAuthUser, 3.3 Endpoint y piezas exportadas

### Community 21 - "EMERGEN: integración de APIs externas"
Cohesion: 0.05
Nodes (37): 1.1 Crear o completar el `.env`, 1.2 Referencia de variables, 1.3 Aplicar los cambios, 1. Configurar las variables de entorno, 2.1 Para qué sirve, 2.2 Obtener las credenciales, 2.3 Endpoints, 2.4 Ejemplos (+29 more)

### Community 22 - "DevDeps Backend NestJS"
Cohesion: 0.08
Nodes (25): devDependencies, jest, @nestjs/cli, @nestjs/mau, @nestjs/schematics, @nestjs/testing, oxlint, oxlint-tsgolint (+17 more)

### Community 23 - "ComprasService"
Cohesion: 0.12
Nodes (7): GeocodeQueryDto, ReverseGeocodeQueryDto, GoogleMapsController, GoogleMapsModule, GoogleMapsService, GeocodeResult, jwks-rsa

### Community 24 - "desktop/package.json"
Cohesion: 0.08
Nodes (25): axios, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, react (+17 more)

### Community 25 - "wireframe.tsx"
Cohesion: 0.08
Nodes (43): Registro(), Antes / después, acceso(), AdminCompras(), AdminComprasProps, AdminCuentas(), eliminar(), guardar() (+35 more)

### Community 26 - "web/package.json"
Cohesion: 0.08
Nodes (25): axios, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, @ionic/react-router (+17 more)

### Community 27 - "Sistema EMERGEN (system boundary)"
Cohesion: 0.12
Nodes (24): Actor: Administrador, Use Case: Aumentar Usuarios Apadrinados, Actor: Contacto de Emergencia, Use Case: Crear PIN Usuario Apadrinado, Use Case: Enviar Mensaje Personalizado, Use Case: Enviar Ubicacion, Use Case: Generar Alerta, Use Case: Gestionar Compras (+16 more)

### Community 28 - "AdminService"
Cohesion: 0.10
Nodes (4): AuditoriaController, AuditoriaService, ConsultarBitacoraDto, RenderedReport

### Community 29 - "WhatsappController"
Cohesion: 0.17
Nodes (3): WhatsappController, WhatsappPairingCodeResponse, WhatsappStatusResponse

### Community 30 - "PremiumPurchase.tsx"
Cohesion: 0.27
Nodes (8): clp, PaypalCheckout(), PaypalCheckoutProps, PremiumPurchase(), PremiumPurchaseProps, ResultModal(), ResultModalProps, loadPaypalSdk()

### Community 31 - "Integración BDD EMERGEN — resultado del 21-10-2026"
Cohesion: 0.22
Nodes (9): Dictamen y alcance, Diferencias consolidadas y contrato físico, Integración BDD EMERGEN — resultado del 21-10-2026, Línea base y entorno conservado, Pasos de aceptación manual pendientes, Pendientes y límites de la evidencia, Resultados ejecutados, Si después deben conservarse datos de una base antigua (+1 more)

### Community 32 - "db-dev.cjs"
Cohesion: 0.06
Nodes (28): file, { app, BrowserWindow, shell }, path, bcrypt, { Client }, { createRequire }, { parseEnv }, { readFileSync, existsSync } (+20 more)

### Community 33 - "google-maps.ts"
Cohesion: 0.15
Nodes (12): EmergenApi, loadGoogleMaps(), loadScript(), pending, PaypalButtons, PaypalButtonsOptions, PaypalNamespace, renderPaypalButtons() (+4 more)

### Community 34 - "Usuario"
Cohesion: 0.09
Nodes (3): ActualizarMiUsuarioDto, LoginService, Usuario

### Community 35 - "devDependencies"
Cohesion: 0.09
Nodes (22): devDependencies, @capacitor/cli, cypress, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+14 more)

### Community 36 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, bcrypt, class-transformer, class-validator, jsonwebtoken, jwks-rsa, @nestjs/common, @nestjs/config (+14 more)

### Community 37 - "tickets_soporte.py"
Cohesion: 0.13
Nodes (14): AdminModule, ApadrinadosModule, AuditoriaModule, ComprasModule, JsreportModule, MindicadorModule, PaypalModule, LoginModule (+6 more)

### Community 38 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 39 - "@nestjs/common"
Cohesion: 0.07
Nodes (15): ActualizarEstadoDto, Solicitud, CrearApadrinadoDto, CambiarPasswordDto, CrearPinDto, CrearUsuarioDto, LoginDto, JwtAuthGuard (+7 more)

### Community 40 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 42 - "test_alertas.py"
Cohesion: 0.15
Nodes (14): CuentaVinculada, codigoPostgres(), PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION, PostgresExceptionFilter, transaction(), HASH_FICTICIO, UsuarioPublico (+6 more)

### Community 43 - "errors.py"
Cohesion: 0.14
Nodes (3): AdminController, ApadrinadosService, UsuarioSesion

### Community 45 - "send-emergency-alert.dto.ts"
Cohesion: 0.11
Nodes (12): PairingCodeDto, EmergencyAlertLocationDto, EmergencyAlertMedicalInfoDto, SendEmergencyAlertDto, PHONE_NUMBER, MAX_RECIPIENTS, EmergencyAlertDeliveryStatus, EmergencyAlertLocation (+4 more)

### Community 46 - "Diagrama de Componentes"
Cohesion: 0.27
Nodes (19): Aplicación de Escritorio, Aplicación Móvil, Aplicación WEB, Backend (capa), Base de Datos, Capa de acceso a Datos, Control Principal, Diagrama de Componentes (+11 more)

### Community 47 - "whatsapp-alert.service.ts"
Cohesion: 0.29
Nodes (7): maskPhoneNumber(), normalizePhoneNumber(), toUserJid(), sleep(), withRetry(), RETRY_DELAYS_MS, EmergencyAlertDelivery

### Community 48 - "WhatsappConnectionService"
Cohesion: 0.20
Nodes (4): errorMessage(), WhatsappConnectionService, isWhatsappEnabled(), WhatsappConnectionState

### Community 49 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+10 more)

### Community 50 - "whatsapp-connection.service.ts"
Cohesion: 0.20
Nodes (7): BaileysLib, loadBaileys(), MultiFileAuthStateStore, WhatsappAuthState, WhatsappAuthStateStore, statusCodeOf(), @whiskeysockets/baileys

### Community 51 - "mindicador.service.ts"
Cohesion: 0.13
Nodes (9): INDICATOR_CODES, IndicatorParamDto, IndicatorQueryDto, MindicadorController, MindicadorDaily, MindicadorSerie, MindicadorService, EconomicIndicator (+1 more)

### Community 52 - "tasks"
Cohesion: 0.09
Nodes (21): dependsOn, env, inputs, outputs, dependsOn, cache, cache, persistent (+13 more)

### Community 53 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 54 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 55 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib, module (+8 more)

### Community 56 - "Integración BDD EMERGEN — resultado del 21-10-2026"
Cohesion: 0.16
Nodes (7): _body(), _http_error(), _postgres_error(), register_error_handlers(), _unhandled_error(), _validation_error(), health()

### Community 59 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, electron, electron-builder, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+7 more)

### Community 60 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @capacitor/app, @capacitor/core, @capacitor/haptics, @capacitor/keyboard, @capacitor/status-bar, @ionic/react, @ionic/react-router (+7 more)

### Community 62 - "Diagrama de Arquitectura"
Cohesion: 0.26
Nodes (14): Diagrama de Arquitectura, APIs REST Backend (Node.js + Nest.js), Aplicacion de Escritorio (Electron), Aplicacion Movil (Ionic), Aplicacion WEB (PC o Dispositivo Movil), Archivos Estaticos (React / Angular) - Hosting Web, Base de Datos PostgreSQL, Firebase Authentication (Autenticacion/JWT) (+6 more)

### Community 63 - "api-client/package.json"
Cohesion: 0.09
Nodes (21): dependencies, firebase, description, devDependencies, jsdom, @repo/api-types, @repo/typescript-config, typescript (+13 more)

### Community 64 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 65 - "mobile/src/App.tsx"
Cohesion: 0.15
Nodes (25): App(), Privada(), Alerta, AlertaSos(), enviar(), Paso, apiFetch(), clearSession() (+17 more)

### Community 66 - "Evidencias de sistema Aplicación/package.json"
Cohesion: 0.06
Nodes (34): devDependencies, prettier, turbo, typescript, devEngines, packageManager, runtime, engines (+26 more)

### Community 67 - "ui/package.json"
Cohesion: 0.06
Nodes (30): dependencies, react, react-dom, @repo/api-client, devDependencies, eslint, @repo/eslint-config, @repo/typescript-config (+22 more)

### Community 70 - "firebase-auth.ts"
Cohesion: 0.04
Nodes (45): 2026-10-21 — Auditoría y corrección de rutas del Trabajador/SOPORTE (bloque 4), 2026-10-21 — Roles, permisos, soporte y funcionalidades documentadas (bloque 2), 2026-10-21 — Rutas y UI base de los wireframes (bloque 1), 2026-10-21 — SOPORTE = "Trabajador" de documentos y mockups (bloque 3), Antes / después, Antes / después, Antes / después, Archivos (+37 more)

### Community 71 - "BaileysLoggerAdapter"
Cohesion: 0.23
Nodes (4): BaileysLoggerAdapter, ILogger, Level, LEVELS

### Community 72 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/node, @types/react (+5 more)

### Community 75 - "usePremiumPurchase"
Cohesion: 0.26
Nodes (10): errorMessage(), specificMessage(), usePremiumPurchase(), cancelPurchase(), confirm(), createOrder(), load(), paymentCancelled() (+2 more)

### Community 76 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, allowJs, jsx, module, moduleResolution, noEmit, plugins, extends (+2 more)

### Community 77 - "Archivos principales"
Cohesion: 0.21
Nodes (13): renderPublicSite(), clp, ImagePlaceholder(), Landing(), LoginRequiredModal(), LoginRequiredModalProps, PremiumInfo(), PremiumInfoProps (+5 more)

### Community 78 - "Trello Sprint Board Screenshot (Fase 1)"
Cohesion: 0.24
Nodes (10): Daily Sprints (daily logs 10/8-21/8/2026), Scrum Weekly Sprint Cadence, Sprint 1 (10/8/2026), Sprint 1 Deliverables (Lean Canvas, Sprint Planning, Acta de Constitucion, RACI, Definicion Proyecto APT), Sprint 2 (17/8/2026), Sprint 2 Deliverables (Documento ERS, Product Backlog, Tabla maestra, Epicas e Historias de usuario), Sprint 3 (24/8/2026), Sprint 3 Deliverables (Wireframes/Mockups, Diagrama UML, Especificacion de Herramientas, Arquitectura) (+2 more)

### Community 79 - "Sprint 4 (31/8/2026)"
Cohesion: 0.27
Nodes (10): Cierre Sprint 3 (28/8/2026), Cierre Sprint 4 (14/9/2026), Creacion del repositorio de GitHub, Daily Sprint 3 (24-28/8/2026), Daily Sprint 4 (11 dailies), Daily Sprint 4 date inconsistency (1/8-11/8 after 31/8), 4.1 Diccionario de Datos / Modelo de Dominio, 4.4 Docker (+2 more)

### Community 80 - "public.venta"
Cohesion: 0.18
Nodes (15): GeocodeApiResponse, addMarker(), createMap(), CreateMapOptions, GoogleMap, GoogleMapsNamespace, GoogleMarker, MapsLibrary (+7 more)

### Community 81 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, axios, @ionic/react, @ionic/react-router, ionicons, react, react-dom, react-router-dom (+2 more)

### Community 82 - "conftest.py"
Cohesion: 0.18
Nodes (15): listar_alertas(), obtener_alerta(), actualizar_ticket(), crear_ticket(), listar_categorias(), listar_estados(), listar_tickets(), obtener_ticket() (+7 more)

### Community 84 - "PublicSite.tsx"
Cohesion: 0.12
Nodes (21): ExpedienteUsuario, ResumenUsuario, APLICACION, EntradaBitacora, EventoAuditado, FORMATO_CHILE, NOMBRE_ROL, NuevaEntradaBitacora (+13 more)

### Community 85 - "routes/alertas.py"
Cohesion: 0.15
Nodes (6): cerrar_alerta(), crear_alerta(), usuario_actual(), Alerta, AlertaCerrar, AlertaCrear

### Community 86 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, axios, @ionic/react, react, react-dom, react-router-dom, @repo/api-client, @repo/ui

### Community 87 - "manifest.json"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 88 - "api-client/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, module, moduleResolution, noEmit, extends, include, @repo/typescript-config/base.json

### Community 89 - "jest.config.ts"
Cohesion: 0.33
Nodes (4): config, { config: tsconfig }, jest, ts-jest

### Community 90 - "ui/tsconfig.json"
Cohesion: 0.22
Nodes (8): compilerOptions, outDir, rootDir, strictNullChecks, exclude, extends, include, @repo/typescript-config/react-library.json

### Community 91 - "avisar"
Cohesion: 0.10
Nodes (33): App(), closeSession(), handleAuthenticated(), handlePinCreated(), privatePage(), refreshSession(), AuthForm(), completeRegistration() (+25 more)

### Community 92 - ".oxlintrc.json"
Cohesion: 0.29
Nodes (6): env, node, rules, typescript/no-explicit-any, typescript/no-floating-promises, $schema

### Community 93 - "tsconfig.build.json"
Cohesion: 0.29
Nodes (6): compilerOptions, rootDir, exclude, extends, include, ./tsconfig.json

### Community 94 - "init.sql"
Cohesion: 0.11
Nodes (20): emergen_venta_identidad, ix_mensaje_contacto_estado_contacto_id, ix_mensaje_contacto_tipo_contacto_id, ix_notificacion_movil_usuario_id, ix_respuesta_contacto_mensaje_contacto_id, ix_respuesta_contacto_usuario_id, ix_soporte_ticket_soporte_id, ix_ticket_estado (+12 more)

### Community 95 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test.e2e, test.unit

### Community 96 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, include

### Community 97 - "WhatsappAlertService"
Cohesion: 0.18
Nodes (11): api, PurchaseModal, bearer(), createEmergenApi(), ApiError, createHttpClient(), send(), HttpClient (+3 more)

### Community 98 - "api-types/package.json"
Cohesion: 0.29
Nodes (6): description, exports, name, private, types, version

### Community 99 - "typescript-config/package.json"
Cohesion: 0.29
Nodes (6): license, name, private, publishConfig, access, version

### Community 100 - "backend Service (nestjs_emergen_backend)"
Cohesion: 0.24
Nodes (15): token(), body(), close(), create(), test_borrado_lectura_historica_staff_left_join(), test_cierre_propio_pin_hash_otra_familia_repeticion(), test_parcial_pin_tutor_completo_pin_propio(), test_pin_limitado_persistente_y_configuracion_faltante() (+7 more)

### Community 101 - "obj_cl_Gestionar_Compras : Clase"
Cohesion: 0.33
Nodes (6): obj_cl_Gestionar_Compras : Clase, obj_c_Gestionar_Compras : Controlador, obj_db_Plan : BD, obj_db_Venta : BD, Soporte : Usuario (actor), obj_v_Gestionar_Compras : Vista

### Community 102 - "obj_cl_Gestionar_Usuario_Apadrinado : Clase"
Cohesion: 0.33
Nodes (6): obj_c_Gestionar_Usuario_Apadrinado : Controlador, obj_cl_Gestionar_Usuario_Apadrinado : Clase, obj_db_Plan : BD, obj_db_Usuario : BD, obj_v_Gestionar_Usuario_Apadrinado : Vista, Usuario Principal : Usuario

### Community 103 - "obj_cl_Gestionar_Compras : Clase"
Cohesion: 0.33
Nodes (6): obj_c_Gestionar_Compras : Controlador, obj_cl_Gestionar_Compras : Clase, obj_db_Alerta : BD, obj_db_Usuarios : BD, obj_v_Gestionar_Compras : Vista, Soporte : Usuario (Actor)

### Community 104 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 105 - "PanelAdmin"
Cohesion: 0.07
Nodes (50): adminApi, API_URL, datos(), DatosPlan, DatosSoporte, describirError(), EntradaBitacora, ESTADOS (+42 more)

### Community 106 - "react-library.json"
Cohesion: 0.33
Nodes (5): compilerOptions, jsx, extends, ./base.json, $schema

### Community 107 - "paypal.service.ts"
Cohesion: 0.33
Nodes (5): 1. Cuentas, 2. Cómo usarlas, 3. Cómo volver a crearlas, 4. Cómo eliminarlas, Cuentas temporales de prueba (solo entorno local)

### Community 108 - "obj_cl_Gestionar_Usuario : Clase"
Cohesion: 0.40
Nodes (5): obj_db_Gestionar_Usuario : BD, obj_cl_Gestionar_Usuario : Clase, obj_c_Gestionar_Usuario : Controlador, Usuario Principal : Usuario, obj_v_Gestionar_Usuario : Vista

### Community 109 - "obj_c_Gestionar_Usuario : Controlador"
Cohesion: 0.40
Nodes (5): obj_c_Gestionar_Usuario : Controlador, obj_cl_Gestionar_Usuario : Clase, obj_db_Gestionar_Usuario : BD, obj_v_Gestionar_Usuario : Vista, Usuario Principal : Usuario

### Community 110 - "obj_cl_enviar_mensaje : Clase"
Cohesion: 0.40
Nodes (5): obj_bd_alerta : BD, obj_cl_enviar_mensaje : Clase, obj_c_enviar_mensaje : Controlador, Usuario : Usuario, obj_v_enviar_mensaje : Vista

### Community 111 - "obj_cl_Generar_Alerta : Clase"
Cohesion: 0.40
Nodes (5): obj_db_Alerta : BD, obj_cl_Generar_Alerta : Clase, obj_c_Generar_Alerta : Controlador, Usuario : Usuario, obj_v_Generar_Alerta : Vista

### Community 112 - "obj_c_Contacto_Emergencia : Controlador"
Cohesion: 0.40
Nodes (5): obj_c_Contacto_Emergencia : Controlador, obj_cl_Contacto_Emergencia : Clase, obj_db_Contacto_Emergencia : BD, obj_v_Contacto_Emergencia : Vista, Usuario : Usuario

### Community 113 - "obj_c_Gestionar_Credenciales : Controlador"
Cohesion: 0.40
Nodes (5): obj_c_Gestionar_Credenciales : Controlador, obj_cl_Gestionar_Credenciales : Clase, obj_db_Gestionar_Credenciales : BD, obj_v_Gestionar_Credenciales : Vista, Usuario : Usuario

### Community 114 - "obj_c_Mensaje_Emergencia : Controlador"
Cohesion: 0.40
Nodes (5): obj_c_Mensaje_Emergencia : Controlador, obj_cl_Mensaje_Emergencia : Clase, obj_db_Mensaje_Emergencia : BD, obj_v_Mensaje_Emergencia : Vista, Usuario : Usuario

### Community 115 - "obj_cl_Tipo_Emergencia : Clase"
Cohesion: 0.40
Nodes (5): obj_db_Tipo_Emergencia : BD, obj_cl_Tipo_Emergencia : Clase, obj_c_Tipo_Emergencia : Controlador, Usuario : Usuario, obj_v_Tipo_Emergencia : Vista

### Community 116 - "obj_cl_Gestionar_Trabajadores : Clase"
Cohesion: 0.40
Nodes (5): Administrador : Usuario, obj_db_Usuario : BD, obj_cl_Gestionar_Trabajadores : Clase, obj_c_Gestionar_Trabajadores : Controlador, obj_v_Gestionar_Trabajadores : Vista

### Community 117 - "obj_c_PIN : Controlador"
Cohesion: 0.40
Nodes (5): obj_c_PIN : Controlador, obj_cl_PIN : Clase, obj_db_PIN : BD, obj_v_PIN : Vista, Usuario

### Community 118 - "obj_cl_Iniciar Sesión : Clase"
Cohesion: 0.40
Nodes (5): obj_db_Iniciar Sesión : BD, obj_cl_Iniciar Sesión : Clase, obj_c_Iniciar Sesión : Controlador, Usuario : Usuario, obj_v_Iniciar Sesión : Vista

### Community 119 - "obj_cl_ubicacion : Clase"
Cohesion: 0.40
Nodes (5): obj_db_alerta : BD, obj_cl_ubicacion : Clase, obj_c_ubicacion : Controlador, Usuario (Actor), obj_v_ubicacion : Vista

### Community 120 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, dev:docker, dev:web, lint, preview

### Community 121 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 122 - "Turborepo Monorepo"
Cohesion: 0.18
Nodes (8): alert, WhatsappAlertService, WhatsappModule, 7.1 Para qué sirve, 7.2 Configurar, 7.3 Vincular el número emisor (una sola vez), 7.5 Usar el servicio desde otro módulo del backend, 7. WhatsApp (Baileys): notificaciones de emergencia

### Community 129 - "public.detalle_alerta"
Cohesion: 0.07
Nodes (20): container, root, savedUser, AuthenticatedUser, AuthFormProps, FIREBASE_ERRORS, firebaseErrorMessage(), FirebaseSession (+12 more)

### Community 131 - "public.bitacora_sistema"
Cohesion: 0.13
Nodes (15): emergen_00_ultimo_admin, emergen_usuario_borrado, emergen_usuario_limpieza, emergen_usuario_vinculo, ix_usuario_estado_id, ix_usuario_msj_personalizado_id, ix_usuario_pin_id, ix_usuario_principal (+7 more)

### Community 133 - "Desktop App React + TypeScript + Vite Template README"
Cohesion: 1.00
Nodes (3): Desktop App React + TypeScript + Vite Template README, Web App React + TypeScript + Vite Template README, @turbo/eslint-config Shared ESLint Configurations

### Community 141 - ".env Configuration (single root .env)"
Cohesion: 0.16
Nodes (3): client(), crear_usuario(), db()

### Community 142 - "ActualizarMiUsuarioDto"
Cohesion: 0.12
Nodes (17): emergen_alerta, emergen_alerta_revoca, emergen_enlace, emergen_historial, ix_alerta_prioridad_id, ix_alerta_usuario_id, ix_historial_alerta_alerta_id, ix_historial_alerta_detalle_alerta_id (+9 more)

### Community 143 - "Cuentas temporales de prueba (solo entorno local)"
Cohesion: 0.36
Nodes (8): actualizar(), categorias(), crear(), estado_canonico(), estados(), existe_categoria(), listar(), obtener()

### Community 144 - "Team Rules (Reglas del equipo)"
Cohesion: 0.25
Nodes (5): argumentos, env, indiceModo, ventana, electron

### Community 161 - "actualizar-bitacora-auditoria.sql"
Cohesion: 0.18
Nodes (9): AppModule, attacker, google, createAppTestingModule(), json(), paypalToken(), jsonwebtoken, @nestjs/testing (+1 more)

### Community 162 - "20261006_pin_identity.sql"
Cohesion: 0.15
Nodes (15): emergen_whatsapp_auth Volume, AlertasService (example integration), HU-08 Emergency Alert User Story, HU-12 Medical Info Access While Emergency Active, WhatsApp (Baileys) Emergency Notifications, WhatsappAlertService, WhatsappAuthStateStore, WhatsappConnectionService (+7 more)

### Community 164 - "001_catalogos_soporte.sql"
Cohesion: 0.22
Nodes (8): verify_pin(), cerrar(), crear(), _finalizar(), finalizar_vencidas(), listar(), obtener(), test_insert_antes_de_cierre_revoca_enlace()

### Community 165 - "pin"
Cohesion: 0.24
Nodes (9): No-secrets policy (.env, MySQL, PayPal, Twilio, Google Maps credentials), backend Service (nestjs_emergen_backend), config/env.ts (readEnv/requireEnv), Backend App (NestJS 12 + TypeORM + PostgreSQL), Backend Dockerfile (multi-stage, turbo prune), .env Configuration (single root .env), Environment Variables Template (.env.example), JWT_SECRET (HS256 access tokens) (+1 more)

### Community 166 - "External APIs Integration Guide"
Cohesion: 0.36
Nodes (10): @repo/api-client Package, @repo/api-types Package, External APIs Integration Guide, Firebase Authentication, FirebaseAuthGuard, Google Maps Platform (Maps JS + Geocoding), jsReport PDF Reports, mindicador API (Chile economic indicators) (+2 more)

### Community 168 - "ConfigurarAlerta.tsx"
Cohesion: 0.43
Nodes (6): ConfigurarAlerta(), comprobar(), Paso, BOTONES_ALERTA, mismaSecuencia(), PRUEBAS_REQUERIDAS

### Community 172 - "public.venta"
Cohesion: 0.15
Nodes (14): emergen_reserva, emergen_venta_comprador, ix_reserva_usuario, ix_venta_estado_pago_id, ix_venta_metodo_pago_id, ix_venta_usuario_id, public.emergen_comprobar_total_venta(), public.emergen_validar_plan_usuario() (+6 more)

### Community 173 - "db Service (postgres:15-alpine)"
Cohesion: 0.39
Nodes (9): backend Service (evidence copy, without WhatsApp), db Service (postgres:15-alpine, evidence copy), EMERGEN docker-compose Configuration, backend Service (nestjs_emergen_backend, 3001->3000), db Service (postgres:15-alpine), db Service (postgres_emergen_db, postgres:15-alpine, 5433), emergen_network Bridge Network, emergen_postgres_data Volume (+1 more)

### Community 176 - "compras.service.ts"
Cohesion: 0.06
Nodes (18): clpAUsd(), ESTADO_PAGO, MAX_APADRINADOS, METODO_PAGO_PAYPAL, MONEDA_PAYPAL, nombreEstado(), PLAN_CUENTA_APADRINADA, ComprasController (+10 more)

### Community 177 - "public.detalle_venta"
Cohesion: 0.18
Nodes (12): emergen_detalle_compra, emergen_detalle_total, emergen_plan_usuario, emergen_venta_total, ix_detalle_venta_plan_id, ix_detalle_venta_venta_id, ix_plan_usuario_plan_id, public.detalle_venta (+4 more)

### Community 179 - "index.ts"
Cohesion: 0.11
Nodes (19): api, env, firebase, firebaseAuth, api, env, firebase, firebaseAuth (+11 more)

### Community 182 - "Test Seed Data Commands"
Cohesion: 0.22
Nodes (8): EMERGEN Monorepo Dev Guide (Docker evidence copy), Test Seed Data Commands, EMERGEN Monorepo Dev Guide, Archivos afectados y reparaciones, Comandos y resultados, Estado de integración BDD — 2026-10-21, Estado real después de la reanudación, Pendientes y siguiente paso exacto

### Community 185 - "public.envio_alerta"
Cohesion: 0.22
Nodes (9): emergen_contactos, emergen_envio, ix_contacto_emergencia_usuario_id, ix_envio_alerta_alerta_id, ix_envio_alerta_contacto_emergencia_id, ix_envio_alerta_estado_envio_id, public.contacto_emergencia, public.envio_alerta (+1 more)

### Community 186 - "public.detalle_alerta"
Cohesion: 0.22
Nodes (9): emergen_detalle_historico, emergen_medico_propietario, ix_detalle_alerta_antecedente_medico_id, ix_detalle_alerta_msj_personalizado_id, public.antecedente_medico, public.detalle_alerta, public.emergen_medico_propietario_fijo(), public.emergen_preparar_borrado_usuario() (+1 more)

### Community 189 - "scheduler.py"
Cohesion: 0.16
Nodes (3): Settings, lifespan(), loop()

### Community 190 - "public.bitacora_sistema"
Cohesion: 0.25
Nodes (8): ix_acceso_aplicacion_aplicacion_id, ix_acceso_aplicacion_usuario_id, ix_bitacora_sistema_aplicacion_id, ix_bitacora_sistema_usuario_id, public.acceso_aplicacion, public.aplicacion, public.bitacora_sistema, public.rol

## Ambiguous Edges - Review These
- `db Service (postgres:15-alpine)` → `MySQL Database (30 normalized tables)`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `DETALLE_VENTA` → `USUARIO_SUSCRIPCION`  [AMBIGUOUS]
  Fase 2/Evidencias Proyecto/Evidencias de documentación/4.1 Diccionario de Datos - Modelo de Dominio/Diagrama ER.png · relation: references
- `Use Case: Gestionar Perfil` → `Actor: Usuario Apadrinado`  [AMBIGUOUS]
  Fase 2/Evidencias Proyecto/Evidencias de documentación/3.3 Diagrama UML/Caso de Uso/Caso de Uso.png · relation: references
- `Daily Sprint 4 (11 dailies)` → `Daily Sprint 4 date inconsistency (1/8-11/8 after 31/8)`  [AMBIGUOUS]
  Fase 2/Evidencias Proyecto/Evidencias de documentación/1.2 Sprint Planning/Evidencias de Sprints,Daily Sprints Fase 1 (Captura 2).png · relation: references

## Knowledge Gaps
- **226 isolated node(s):** `@nestjs/passport`, `@nestjs/platform-express`, `@paypal/checkout-server-sdk`, `passport`, `passport-jwt` (+221 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1218 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **40 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `tickets_soporte.py` to `actualizar-bitacora-auditoria.sql`, `backend/package.json`, `Turborepo Monorepo`, `@nestjs/common`, `BaileysLoggerAdapter`, `index.d.ts`, `test_alertas.py`, `readEnv`, `jsreport.service.ts`, `whatsapp-alert.service.ts`, `compras.service.ts`, `whatsapp-connection.service.ts`, `mindicador.service.ts`, `PublicSite.tsx`, `firebase-auth.service.ts`, `ComprasService`, `AppService`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **What connects `@nestjs/passport`, `@nestjs/platform-express`, `@paypal/checkout-server-sdk` to the rest of the system?**
  _226 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ActualizarPerfilDto` be split into smaller, more focused modules?**
  _Cohesion score 0.08362369337979095 - nodes in this community are weakly interconnected._
- **Why does `EMERGEN: integración de APIs externas` connect `EMERGEN: integración de APIs externas` to `public.venta`, `Turborepo Monorepo`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.09759759759759759 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `db Service (postgres:15-alpine)` and `MySQL Database (30 normalized tables)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `DETALLE_VENTA` and `USUARIO_SUSCRIPCION`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._