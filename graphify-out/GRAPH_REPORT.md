# Graph Report - EMRGEN  (2026-10-26)

## Corpus Check
- 335 files · ~278,586 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 46 file(s) not represented in the graph (top: (none) 28, .css 14, .env 2)

## Summary
- 2986 nodes · 6007 edges · 198 communities (147 shown, 51 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 247 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `89f96be6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- avisar
- Turborepo Monorepo
- perfil-form.tsx
- eslint-config/package.json
- AlertaSos.tsx
- backend/package.json
- routes/alertas.py
- readEnv
- mobile/package.json
- index.d.ts
- soporte.tsx
- Test Seed Data Commands
- Diagrama ER Actualizado (EMRGEN)
- compra.test.tsx
- 001_compras_paypal.sql
- transaction
- admin-views.tsx
- test-whatsapp-sos.cjs
- USUARIO
- Team Workflow Guide (Claude Code + Graphify + Git)
- firebase-auth.service.ts
- EMERGEN: integración de APIs externas
- DevDeps Backend NestJS
- google-maps.service.ts
- desktop/package.json
- ActualizarPerfilDto
- web/package.json
- Sistema EMERGEN (system boundary)
- cifrar-fichas.cjs
- WhatsappController
- Envío de SOS por WhatsApp
- smoke-internal.cjs
- db-dev.cjs
- paypal-sdk.ts
- auditoria.service.ts
- devDependencies
- dependencies
- app.module.ts
- compilerOptions
- index.d.ts
- compilerOptions
- compilerOptions
- login.service.ts
- AdminController
- 20261026_whatsapp_finalizacion.sql
- send-emergency-alert.dto.ts
- Diagrama de Componentes
- WhatsappAlertService
- WhatsappConnectionService
- compilerOptions
- whatsapp-connection.service.ts
- mindicador.service.ts
- tasks
- compilerOptions
- compilerOptions
- compilerOptions
- errors.py
- @nestjs/common
- ComprasService
- devDependencies
- dependencies
- 4. jsReport
- Diagrama de Arquitectura
- api-client/package.json
- scripts
- mobile/src/App.tsx
- Evidencias de sistema Aplicación/package.json
- ui/package.json
- AuditoriaService
- Contrato de APIs internas — 2026-10-21
- 2026-10-21 — Roles, permisos, soporte y funcionalidades documentadas (bloque 2)
- BaileysLoggerAdapter
- devDependencies
- ref_node_path
- verify-schema.cjs
- PremiumPurchase.tsx
- compilerOptions
- migrate-whatsapp.cjs
- Trello Sprint Board Screenshot (Fase 1)
- Sprint 4 (31/8/2026)
- google-maps.ts
- dependencies
- tickets_soporte.py
- @nestjs/common
- app.module.ts
- class-validator
- dependencies
- manifest.json
- api-client/tsconfig.json
- Usuario
- ui/tsconfig.json
- UsuarioSesion
- .oxlintrc.json
- tsconfig.build.json
- ref_node_fs
- scripts
- compilerOptions
- http.ts
- api-types/package.json
- typescript-config/package.json
- test_alertas.py
- obj_cl_Gestionar_Compras : Clase
- obj_cl_Gestionar_Usuario_Apadrinado : Clase
- obj_cl_Gestionar_Compras : Clase
- nest-cli.json
- ref_react
- react-library.json
- Cuentas temporales de prueba (solo entorno local)
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
- LoginController
- AdminVentasService
- web/src/App.tsx
- public.usuario
- CLAUDE.md
- Desktop App React + TypeScript + Vite Template README
- desktop/tsconfig.json
- cypress.config.ts
- web/tsconfig.json
- db (postgres:15-alpine) Service
- Backend NestJS Starter README
- @testing-library/jest-dom
- conftest.py
- public.alerta
- services/tickets.py
- dev.mjs
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
- AuthForm.tsx
- USUARIO Table
- services/alertas.py
- AppService
- External APIs Integration Guide
- FiltrosVentasDto
- WhatsappAlertService
- public.venta
- db Service (postgres:15-alpine)
- ConsultarAlertasDto
- ComprasController
- public.detalle_venta
- config.py
- Integración BDD EMERGEN — resultado del 21-10-2026
- phone-number.ts
- init.sql
- public.detalle_alerta
- Consultar y probar la API de alertas SOS
- admin-ventas.service.ts
- public.bitacora_sistema
- pg_temp.must_fail
- css.d.ts
- firebase-auth.ts
- ref_vite
- .constructor
- public.ticket_soporte
- Estado de integración BDD — 2026-10-21
- jest.config.ts
- ConsultarBitacoraDto
- AuditoriaController

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 85 edges
2. `UsuarioSesion` - 42 edges
3. `typeorm` - 36 edges
4. `WhatsappConnectionService` - 34 edges
5. `Usuario` - 34 edges
6. `public.usuario` - 34 edges
7. `avisar()` - 32 edges
8. `PerfilForm()` - 32 edges
9. `LoginService` - 30 edges
10. `App()` - 28 edges

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

## Hyperedges (group relationships)
- **Clientes frontend consumen la interfaz del Control Principal** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_aplicacion_web, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_aplicacion_movil, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_aplicacion_de_escritorio, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_control_principal [EXTRACTED 1.00]
- **EMERGEN Docker Backend + DB Stack** — fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_db_service, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_backend_service, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_emergen_network, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_emergen_postgres_data, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_init_sql [EXTRACTED 1.00]
- **Docker Compose Stack (db + backend + volumes)** — fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_db, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_backend, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_emergen_postgres_data, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_emergen_whatsapp_auth, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_init_sql [EXTRACTED 1.00]
- **Emergency Alert Notification Flow** — fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_apis_alertasservice, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_apis_whatsappalertservice, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_bdd_contacto_emergencia_table, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_bdd_usuario_mensaje_personalizado_table, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_apis_hu_08_emergency_alert [EXTRACTED 1.00]
- **Clientes multiplataforma consumen API REST** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_aplicacion_web, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_aplicacion_movil, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_aplicacion_escritorio, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_apis_rest_backend [EXTRACTED 1.00]
- **Compra de planes con conversion de divisas** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_apis_rest_backend, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_mindicador, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_paypal [EXTRACTED 1.00]
- **Flujo de alertas: gestor de alertas con mensajería y geolocalización** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_control_principal, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_gestor_de_alertas_y_emergencias, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_servicio_mensajeria, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_servicio_geolocalizacion [EXTRACTED 1.00]
- **Flujo comercial: pagos y conversión de divisas** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_gestor_comercial, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_pasarela_de_pago, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_servicio_conversion_de_divisas [EXTRACTED 1.00]
- **Graphify Shared-Graph Git Workflow** — contributing_graphify_branch, contributing_main_branch, contributing_individual_branches, contributing_graph_update_procedure, contributing_graph_json_merge_driver, contributing_graphify_skip_hook [EXTRACTED 1.00]
- **Graphify shared-graph branch workflow** — contributing_graphify_branch, contributing_shared_graph_graphify_out, contributing_graphify_update_procedure, contributing_graph_json_merge_driver, contributing_graphify_skip_hook [EXTRACTED 1.00]
- **Scrum sprint lifecycle in Fase 1 (sprints, dailies, closure)** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_1__sprint_1, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_1__daily_sprints, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_1__sprint_review_retrospective, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_1__sprint_2, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_1__sprint_3 [EXTRACTED 1.00]
- **Plan Payment and CLP Pricing** — fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_apis_paypal_integration, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_apis_mindicador, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_apis_api_client_package [INFERRED 0.85]
- **Sprint 4 Scrum cycle (planning, dailies, closure)** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_2__sprint_4, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_2__daily_sprint_4, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_2__cierre_sprint_4 [INFERRED 0.85]

## Communities (198 total, 51 thin omitted)

### Community 0 - "avisar"
Cohesion: 0.06
Nodes (45): closeSession(), handleAuthenticated(), handlePinCreated(), refreshPurchasedUser(), refreshSession(), PinSetupForm(), handleSubmit(), PinSetupFormProps (+37 more)

### Community 1 - "Turborepo Monorepo"
Cohesion: 0.16
Nodes (12): No-secrets policy (.env, MySQL, PayPal, Twilio, Google Maps credentials), EMERGEN Monorepo Dev Guide (Docker evidence copy), Desktop Admin Panel (Electron 44), Mobile App (Ionic 9 + Capacitor 8), EMERGEN Monorepo Dev Guide, Shared Packages (eslint-config, typescript-config, ui), Troubleshooting Table, Turborepo Monorepo (+4 more)

### Community 2 - "perfil-form.tsx"
Cohesion: 0.09
Nodes (31): mama, montar(), papa, mama, montar(), perfil, montar(), perfil (+23 more)

### Community 3 - "eslint-config/package.json"
Cohesion: 0.07
Nodes (30): config, nextJsConfig, devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-only-warn, eslint-plugin-react-hooks (+22 more)

### Community 4 - "AlertaSos.tsx"
Cohesion: 0.24
Nodes (18): AlertasActivas(), consultar(), AlertaSos(), enviar(), alerta, internalFetch(), Alerta, consultarSos() (+10 more)

### Community 5 - "backend/package.json"
Cohesion: 0.05
Nodes (37): author, description, libphonenumber-js, prettier, @repo/api-types, @types/node, typescript, license (+29 more)

### Community 6 - "routes/alertas.py"
Cohesion: 0.15
Nodes (7): cerrar_alerta(), crear_alerta(), usuario_actual(), Alerta, AlertaCerrar, AlertaCrear, EstadoWhatsapp

### Community 7 - "readEnv"
Cohesion: 0.18
Nodes (11): readEnv(), requireEnv(), ExternalRequestInit, logger, requestExternal(), requestExternalJson(), BASE_URLS, PaypalLink (+3 more)

### Community 8 - "mobile/package.json"
Cohesion: 0.05
Nodes (36): description, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, @ionic/react-router (+28 more)

### Community 9 - "index.d.ts"
Cohesion: 0.13
Nodes (6): CreatePaypalOrderDto, PaypalController, PaypalService, CapturePaypalOrderResponse, CreatePaypalOrderRequest, PaypalOrderResponse

### Community 10 - "soporte.tsx"
Cohesion: 0.19
Nodes (12): Alerta, AlertasTabla(), Carga, Catalogo, columnasTicket, EstadoCarga(), fecha(), GestionTickets() (+4 more)

### Community 11 - "Test Seed Data Commands"
Cohesion: 0.23
Nodes (5): Test Seed Data Commands, API y pruebas automáticas, Compra de plan Premium y cupos, Comprobación en la web, internal-api (FastAPI)

### Community 13 - "compra.test.tsx"
Cohesion: 0.18
Nodes (7): abrir(), abrirUsuarios(), fetchMock, Ruta(), fetchMock, usuario, loadPaypalSdk()

### Community 15 - "transaction"
Cohesion: 0.09
Nodes (25): connect(), get_db(), transaction(), lifespan(), loop(), run_once(), historical(), test_24_horas_recuperacion_y_carrera_job_manual() (+17 more)

### Community 16 - "admin-views.tsx"
Cohesion: 0.08
Nodes (46): ConfigurarAlerta(), comprobar(), Paso, BOTONES_ALERTA, mismaSecuencia(), PRUEBAS_REQUERIDAS, acceso(), AdminCompras() (+38 more)

### Community 17 - "test-whatsapp-sos.cjs"
Cohesion: 0.20
Nodes (6): assert, { client }, main(), { randomUUID }, { WhatsappAlertService }, { WhatsappSosDispatcher }

### Community 18 - "USUARIO"
Cohesion: 0.08
Nodes (30): ACCESO_APLICACION, ALERTA, APLICACION, BITACORA_SISTEMA, CATEGORIA_SOPORTE, CONTACTO_EMERGENCIA, DETALLE_ALERTA, DETALLE_VENTA (+22 more)

### Community 19 - "Team Workflow Guide (Claude Code + Graphify + Git)"
Cohesion: 0.14
Nodes (21): CONTRIBUTING.md, graphify-out Knowledge Graph, Graphify Usage Rules, Branch Architecture (main, graphify, alonso, diego, gabriel), GitHub branch protection rules, Claude Code, CLAUDE.md graphify section and PreToolUse hook, Conventional Commits message format (+13 more)

### Community 20 - "firebase-auth.service.ts"
Cohesion: 0.11
Nodes (11): FirebaseAuthController, FirebaseAuthGuard, FirebaseRequest, FirebaseAuthModule, FirebaseAuthService, FirebaseTokenPayload, attacker, google (+3 more)

### Community 21 - "EMERGEN: integración de APIs externas"
Cohesion: 0.08
Nodes (26): 1.1 Crear o completar el `.env`, 1.2 Referencia de variables, 1.3 Aplicar los cambios, 1. Configurar las variables de entorno, 2.1 Para qué sirve, 2.2 Obtener las credenciales, 2.3 Endpoints, 2.4 Ejemplos (+18 more)

### Community 22 - "DevDeps Backend NestJS"
Cohesion: 0.08
Nodes (25): devDependencies, jest, @nestjs/cli, @nestjs/mau, @nestjs/schematics, @nestjs/testing, oxlint, oxlint-tsgolint (+17 more)

### Community 23 - "google-maps.service.ts"
Cohesion: 0.14
Nodes (5): GeocodeQueryDto, ReverseGeocodeQueryDto, GoogleMapsController, GoogleMapsService, GeocodeResult

### Community 24 - "desktop/package.json"
Cohesion: 0.08
Nodes (25): axios, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, react (+17 more)

### Community 25 - "ActualizarPerfilDto"
Cohesion: 0.06
Nodes (17): aad(), Campo, CAMPOS_FICHA, cifrar(), cifrarFicha(), claves(), descifrar(), descifrarFicha() (+9 more)

### Community 26 - "web/package.json"
Cohesion: 0.07
Nodes (28): axios, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, @ionic/react-router (+20 more)

### Community 27 - "Sistema EMERGEN (system boundary)"
Cohesion: 0.12
Nodes (24): Actor: Administrador, Use Case: Aumentar Usuarios Apadrinados, Actor: Contacto de Emergencia, Use Case: Crear PIN Usuario Apadrinado, Use Case: Enviar Mensaje Personalizado, Use Case: Enviar Ubicacion, Use Case: Generar Alerta, Use Case: Gestionar Compras (+16 more)

### Community 28 - "cifrar-fichas.cjs"
Cohesion: 0.27
Nodes (9): CAMPOS, cifrar(), claves(), { createCipheriv, randomBytes }, main(), { parseEnv }, { readFileSync }, { resolve } (+1 more)

### Community 29 - "WhatsappController"
Cohesion: 0.17
Nodes (3): WhatsappController, WhatsappPairingCodeResponse, WhatsappStatusResponse

### Community 30 - "Envío de SOS por WhatsApp"
Cohesion: 0.22
Nodes (9): Actualizar una base de datos existente, Cambiar el número emisor, Cambio de emisor y segunda verificación, Configuración y vinculación del emisor, Envío de SOS por WhatsApp, Estados y recuperación, Prueba desde el móvil, Tipo de emergencia y aviso de finalización (+1 more)

### Community 31 - "smoke-internal.cjs"
Cohesion: 0.22
Nodes (6): assert, {client}, path, {randomUUID}, {readFileSync,writeFileSync,mkdirSync,existsSync}, {resolve}

### Community 32 - "db-dev.cjs"
Cohesion: 0.20
Nodes (9): bcrypt, { Client }, { createRequire }, { parseEnv }, { readFileSync, existsSync }, requireBackend, { resolve }, root (+1 more)

### Community 33 - "paypal-sdk.ts"
Cohesion: 0.19
Nodes (10): EmergenApi, PaypalButtons, PaypalButtonsOptions, PaypalNamespace, renderPaypalButtons(), RenderPaypalButtonsOptions, ButtonsOptions, PaypalButton() (+2 more)

### Community 34 - "auditoria.service.ts"
Cohesion: 0.13
Nodes (20): ResumenUsuario, GuardarPlanDto, EntradaBitacora, EventoAuditado, FORMATO_CHILE, NOMBRE_ROL, NuevaEntradaBitacora, ResultadoAuditado (+12 more)

### Community 35 - "devDependencies"
Cohesion: 0.09
Nodes (22): devDependencies, @capacitor/cli, cypress, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+14 more)

### Community 36 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, bcrypt, class-transformer, class-validator, jsonwebtoken, jwks-rsa, libphonenumber-js, @nestjs/common (+15 more)

### Community 37 - "app.module.ts"
Cohesion: 0.23
Nodes (7): AppModule, createAppTestingModule(), json(), paypalToken(), file, @nestjs/testing, supertest

### Community 38 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 39 - "index.d.ts"
Cohesion: 0.10
Nodes (22): clpAUsd(), ESTADO_PAGO, MAX_APADRINADOS, METODO_PAGO_PAYPAL, MONEDA_PAYPAL, nombreEstado(), PLAN_BASE, PLAN_CUENTA_APADRINADA (+14 more)

### Community 40 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 42 - "login.service.ts"
Cohesion: 0.14
Nodes (14): CuentaVinculada, APLICACION, codigoPostgres(), PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION, PostgresExceptionFilter, transaction(), HASH_FICTICIO (+6 more)

### Community 45 - "send-emergency-alert.dto.ts"
Cohesion: 0.13
Nodes (5): EmergencyAlertLocationDto, EmergencyAlertMedicalInfoDto, SendEmergencyAlertDto, EmergencyAlertLocation, EmergencyAlertMedicalInfo

### Community 46 - "Diagrama de Componentes"
Cohesion: 0.27
Nodes (19): Aplicación de Escritorio, Aplicación Móvil, Aplicación WEB, Backend (capa), Base de Datos, Capa de acceso a Datos, Control Principal, Diagrama de Componentes (+11 more)

### Community 47 - "WhatsappAlertService"
Cohesion: 0.14
Nodes (12): buildEmergencyAlertText(), buildFinalizedAlertText(), buildLocationMessage(), googleMapsLink(), parseAlertLocation(), location, WhatsappAlertService, PendingDelivery (+4 more)

### Community 48 - "WhatsappConnectionService"
Cohesion: 0.21
Nodes (4): errorMessage(), WhatsappConnectionService, isWhatsappEnabled(), WhatsappConnectionState

### Community 49 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+10 more)

### Community 50 - "whatsapp-connection.service.ts"
Cohesion: 0.15
Nodes (11): BaileysLib, loadBaileys(), MultiFileAuthStateStore, WhatsappAuthState, WhatsappAuthStateStore, statusCodeOf(), defaultCountryCode(), INTEGRATION (+3 more)

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

### Community 56 - "errors.py"
Cohesion: 0.16
Nodes (7): _body(), _http_error(), _postgres_error(), register_error_handlers(), _unhandled_error(), _validation_error(), health()

### Community 57 - "@nestjs/common"
Cohesion: 0.13
Nodes (15): AdminAlertasController, AdminAlertasService, AlertaAdmin, PaginaAlertas, Solicitud, JwtAuthGuard, SolicitudAutenticada, ACCESO (+7 more)

### Community 58 - "ComprasService"
Cohesion: 0.23
Nodes (3): ComprasService, OrdenCompraResponse, ResultadoCompraResponse

### Community 59 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, electron, electron-builder, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+7 more)

### Community 60 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @capacitor/app, @capacitor/core, @capacitor/haptics, @capacitor/keyboard, @capacitor/status-bar, @ionic/react, @ionic/react-router (+7 more)

### Community 61 - "4. jsReport"
Cohesion: 0.33
Nodes (6): 4.1 Para qué sirve, 4.2 Obtener el servidor y las credenciales, 4.3 Crear una plantilla, 4.4 Endpoint, 4.5 Ejemplos, 4. jsReport

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
Cohesion: 0.10
Nodes (24): App(), App(), Privada(), apiFetch(), clearSession(), errorText(), getUser(), saveSession() (+16 more)

### Community 66 - "Evidencias de sistema Aplicación/package.json"
Cohesion: 0.06
Nodes (34): devDependencies, prettier, turbo, typescript, devEngines, packageManager, runtime, engines (+26 more)

### Community 67 - "ui/package.json"
Cohesion: 0.06
Nodes (32): dependencies, libphonenumber-js, react, react-dom, @repo/api-client, devDependencies, eslint, @repo/eslint-config (+24 more)

### Community 69 - "Contrato de APIs internas — 2026-10-21"
Cohesion: 0.33
Nodes (6): Contrato de APIs internas — 2026-10-21, Errores y responsabilidades, Reportes de bitácora (NestJS), Soporte, SOS, Ventas del panel administrativo (NestJS)

### Community 70 - "2026-10-21 — Roles, permisos, soporte y funcionalidades documentadas (bloque 2)"
Cohesion: 0.04
Nodes (45): 2026-10-21 — Auditoría y corrección de rutas del Trabajador/SOPORTE (bloque 4), 2026-10-21 — Roles, permisos, soporte y funcionalidades documentadas (bloque 2), 2026-10-21 — Rutas y UI base de los wireframes (bloque 1), 2026-10-21 — SOPORTE = "Trabajador" de documentos y mockups (bloque 3), Antes / después, Antes / después, Antes / después, Archivos (+37 more)

### Community 71 - "BaileysLoggerAdapter"
Cohesion: 0.23
Nodes (4): BaileysLoggerAdapter, ILogger, Level, LEVELS

### Community 72 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, @testing-library/react (+8 more)

### Community 73 - "ref_node_path"
Cohesion: 0.33
Nodes (3): bcrypt, { createRequire }, { resolve }

### Community 74 - "verify-schema.cjs"
Cohesion: 0.33
Nodes (4): { client }, { readFileSync }, { resolve }, sql

### Community 75 - "PremiumPurchase.tsx"
Cohesion: 0.08
Nodes (32): renderPublicSite(), token(), clp, PaypalCheckout(), PaypalCheckoutProps, PremiumPurchase(), PremiumPurchaseProps, ResultModal() (+24 more)

### Community 76 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, allowJs, jsx, module, moduleResolution, noEmit, plugins, extends (+2 more)

### Community 77 - "migrate-whatsapp.cjs"
Cohesion: 0.40
Nodes (3): { client }, { readFileSync }, { resolve }

### Community 78 - "Trello Sprint Board Screenshot (Fase 1)"
Cohesion: 0.24
Nodes (10): Daily Sprints (daily logs 10/8-21/8/2026), Scrum Weekly Sprint Cadence, Sprint 1 (10/8/2026), Sprint 1 Deliverables (Lean Canvas, Sprint Planning, Acta de Constitucion, RACI, Definicion Proyecto APT), Sprint 2 (17/8/2026), Sprint 2 Deliverables (Documento ERS, Product Backlog, Tabla maestra, Epicas e Historias de usuario), Sprint 3 (24/8/2026), Sprint 3 Deliverables (Wireframes/Mockups, Diagrama UML, Especificacion de Herramientas, Arquitectura) (+2 more)

### Community 79 - "Sprint 4 (31/8/2026)"
Cohesion: 0.27
Nodes (10): Cierre Sprint 3 (28/8/2026), Cierre Sprint 4 (14/9/2026), Creacion del repositorio de GitHub, Daily Sprint 3 (24-28/8/2026), Daily Sprint 4 (11 dailies), Daily Sprint 4 date inconsistency (1/8-11/8 after 31/8), 4.1 Diccionario de Datos / Modelo de Dominio, 4.4 Docker (+2 more)

### Community 80 - "google-maps.ts"
Cohesion: 0.16
Nodes (16): GeocodeApiResponse, addMarker(), createMap(), CreateMapOptions, GoogleMap, GoogleMapsNamespace, GoogleMarker, loadGoogleMaps() (+8 more)

### Community 81 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, axios, @ionic/react, @ionic/react-router, ionicons, react, react-dom, react-router-dom (+2 more)

### Community 82 - "tickets_soporte.py"
Cohesion: 0.18
Nodes (15): listar_alertas(), obtener_alerta(), actualizar_ticket(), crear_ticket(), listar_categorias(), listar_estados(), listar_tickets(), obtener_ticket() (+7 more)

### Community 83 - "@nestjs/common"
Cohesion: 0.13
Nodes (4): GenerateReportDto, JsreportController, JsreportService, GenerateReportRequest

### Community 84 - "app.module.ts"
Cohesion: 0.10
Nodes (14): AdminModule, ApadrinadosModule, AuditoriaModule, ComprasModule, GoogleMapsModule, JsreportModule, MindicadorModule, PaypalModule (+6 more)

### Community 85 - "class-validator"
Cohesion: 0.07
Nodes (11): ActualizarEstadoDto, CrearApadrinadoDto, CambiarAccesoApadrinadoDto, DefinirPinApadrinadoDto, MENSAJE, ActualizarMiUsuarioDto, ActualizarMiUsuarioPropioDto, CrearPinDto (+3 more)

### Community 86 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, axios, @ionic/react, react, react-dom, react-router-dom, @repo/api-client, @repo/ui

### Community 87 - "manifest.json"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 88 - "api-client/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, module, moduleResolution, noEmit, extends, include, @repo/typescript-config/base.json

### Community 89 - "Usuario"
Cohesion: 0.09
Nodes (7): AdminService, diferencias(), ExpedienteUsuario, ActorAuditoria, LoginService, PlanUsuario, Usuario

### Community 90 - "ui/tsconfig.json"
Cohesion: 0.22
Nodes (8): compilerOptions, outDir, rootDir, strictNullChecks, exclude, extends, include, @repo/typescript-config/react-library.json

### Community 91 - "UsuarioSesion"
Cohesion: 0.16
Nodes (4): ApadrinadosController, ApadrinadosService, PinPrincipalDto, UsuarioSesion

### Community 92 - ".oxlintrc.json"
Cohesion: 0.29
Nodes (6): env, node, rules, typescript/no-explicit-any, typescript/no-floating-promises, $schema

### Community 93 - "tsconfig.build.json"
Cohesion: 0.29
Nodes (6): compilerOptions, rootDir, exclude, extends, include, ./tsconfig.json

### Community 94 - "ref_node_fs"
Cohesion: 0.40
Nodes (3): { client }, { readFileSync }, { resolve }

### Community 95 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test.e2e, test.unit

### Community 96 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, include

### Community 97 - "http.ts"
Cohesion: 0.23
Nodes (7): bearer(), createEmergenApi(), ApiError, createHttpClient(), send(), HttpClient, ApiErrorResponse

### Community 98 - "api-types/package.json"
Cohesion: 0.29
Nodes (6): description, exports, name, private, types, version

### Community 99 - "typescript-config/package.json"
Cohesion: 0.29
Nodes (6): license, name, private, publishConfig, access, version

### Community 100 - "test_alertas.py"
Cohesion: 0.20
Nodes (20): token(), body(), close(), create(), test_borrado_lectura_historica_staff_left_join(), test_borrar_usuario_no_deja_avisos_de_cierre_pendientes(), test_cierre_automatico_encola_y_rollback_no_confirma_avisos(), test_cierre_encola_un_aviso_por_contacto_y_no_duplica_al_repetir() (+12 more)

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

### Community 105 - "ref_react"
Cohesion: 0.05
Nodes (65): adminApi, AlertaAdmin, API_URL, datos(), DatosPlan, DatosSoporte, describirError(), EntradaBitacora (+57 more)

### Community 106 - "react-library.json"
Cohesion: 0.33
Nodes (5): compilerOptions, jsx, extends, ./base.json, $schema

### Community 107 - "Cuentas temporales de prueba (solo entorno local)"
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
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

### Community 129 - "web/src/App.tsx"
Cohesion: 0.08
Nodes (52): App(), privatePage(), savedUser, AdminAlertasPage(), AdminComprasPage(), AdminCuentasPage(), AdminTicketsPage(), AdminTrabajadoresPage() (+44 more)

### Community 131 - "public.usuario"
Cohesion: 0.11
Nodes (19): emergen_00_ultimo_admin, emergen_reserva, emergen_usuario_borrado, emergen_usuario_limpieza, emergen_usuario_vinculo, ix_reserva_usuario, ix_usuario_estado_id, ix_usuario_msj_personalizado_id (+11 more)

### Community 133 - "Desktop App React + TypeScript + Vite Template README"
Cohesion: 1.00
Nodes (3): Desktop App React + TypeScript + Vite Template README, Web App React + TypeScript + Vite Template README, @turbo/eslint-config Shared ESLint Configurations

### Community 141 - "conftest.py"
Cohesion: 0.16
Nodes (3): client(), crear_usuario(), db()

### Community 142 - "public.alerta"
Cohesion: 0.13
Nodes (16): emergen_alerta, emergen_alerta_notifica_cierre, emergen_alerta_revoca, emergen_historial, ix_alerta_prioridad_id, ix_alerta_usuario_id, ix_historial_alerta_alerta_id, ix_historial_alerta_detalle_alerta_id (+8 more)

### Community 143 - "services/tickets.py"
Cohesion: 0.36
Nodes (8): actualizar(), categorias(), crear(), estado_canonico(), estados(), existe_categoria(), listar(), obtener()

### Community 144 - "dev.mjs"
Cohesion: 0.17
Nodes (7): { app, BrowserWindow, shell }, path, argumentos, env, indiceModo, ventana, electron

### Community 161 - "AuthForm.tsx"
Cohesion: 0.12
Nodes (22): AuthForm(), completeRegistration(), describeError(), handleSubmit(), informar(), postUsuarios(), run(), startRegistration() (+14 more)

### Community 162 - "USUARIO Table"
Cohesion: 0.15
Nodes (15): emergen_whatsapp_auth Volume, AlertasService (example integration), HU-08 Emergency Alert User Story, HU-12 Medical Info Access While Emergency Active, WhatsApp (Baileys) Emergency Notifications, WhatsappAlertService, WhatsappAuthStateStore, WhatsappConnectionService (+7 more)

### Community 164 - "services/alertas.py"
Cohesion: 0.24
Nodes (7): verify_pin(), cerrar(), crear(), _finalizar(), finalizar_vencidas(), listar(), obtener()

### Community 166 - "External APIs Integration Guide"
Cohesion: 0.21
Nodes (14): @repo/api-client Package, @repo/api-types Package, config/env.ts (readEnv/requireEnv), External APIs Integration Guide, Firebase Authentication, FirebaseAuthGuard, Google Maps Platform (Maps JS + Geocoding), jsReport PDF Reports (+6 more)

### Community 168 - "FiltrosVentasDto"
Cohesion: 0.18
Nodes (3): ConsultarVentasDto, FiltrosVentasDto, ReporteVentasDto

### Community 170 - "WhatsappAlertService"
Cohesion: 0.29
Nodes (6): WhatsappModule, 7.1 Para qué sirve, 7.2 Configurar, 7.3 Vincular el número emisor (una sola vez), 7.5 Usar el servicio desde otro módulo del backend, 7. WhatsApp (Baileys): notificaciones de emergencia

### Community 172 - "public.venta"
Cohesion: 0.18
Nodes (11): emergen_venta_comprador, emergen_venta_identidad, ix_venta_estado_pago_id, ix_venta_metodo_pago_id, ix_venta_usuario_id, public.emergen_comprobar_total_venta(), public.emergen_proteger_comprador_historico(), public.emergen_venta_comprador() (+3 more)

### Community 173 - "db Service (postgres:15-alpine)"
Cohesion: 0.30
Nodes (12): backend Service (evidence copy, without WhatsApp), db Service (postgres:15-alpine, evidence copy), EMERGEN docker-compose Configuration, backend Service (nestjs_emergen_backend), backend Service (nestjs_emergen_backend, 3001->3000), db Service (postgres:15-alpine), db Service (postgres_emergen_db, postgres:15-alpine, 5433), emergen_network Bridge Network (+4 more)

### Community 177 - "public.detalle_venta"
Cohesion: 0.18
Nodes (12): emergen_detalle_compra, emergen_detalle_total, emergen_plan_usuario, emergen_venta_total, ix_detalle_venta_plan_id, ix_detalle_venta_venta_id, ix_plan_usuario_plan_id, public.detalle_venta (+4 more)

### Community 181 - "config.py"
Cohesion: 0.11
Nodes (4): physical(), Settings, test_origenes_de_desarrollo_por_defecto(), test_reutiliza_origenes_del_backend_y_permite_configuracion_propia()

### Community 182 - "Integración BDD EMERGEN — resultado del 21-10-2026"
Cohesion: 0.22
Nodes (9): Dictamen y alcance, Diferencias consolidadas y contrato físico, Integración BDD EMERGEN — resultado del 21-10-2026, Línea base y entorno conservado, Pasos de aceptación manual pendientes, Pendientes y límites de la evidencia, Resultados ejecutados, Si después deben conservarse datos de una base antigua (+1 more)

### Community 184 - "phone-number.ts"
Cohesion: 0.24
Nodes (8): maskPhoneNumber(), normalizePhoneNumber(), toUserJid(), sleep(), withRetry(), RETRY_DELAYS_MS, alert, EmergencyAlertDelivery

### Community 185 - "init.sql"
Cohesion: 0.11
Nodes (23): emergen_contactos, emergen_enlace, emergen_envio, ix_contacto_emergencia_usuario_id, ix_envio_alerta_alerta_id, ix_envio_alerta_contacto_emergencia_id, ix_envio_alerta_estado_envio_id, ix_mensaje_contacto_estado_contacto_id (+15 more)

### Community 186 - "public.detalle_alerta"
Cohesion: 0.22
Nodes (9): emergen_detalle_historico, emergen_medico_propietario, ix_detalle_alerta_antecedente_medico_id, ix_detalle_alerta_msj_personalizado_id, public.antecedente_medico, public.detalle_alerta, public.emergen_medico_propietario_fijo(), public.emergen_preparar_borrado_usuario() (+1 more)

### Community 187 - "Consultar y probar la API de alertas SOS"
Cohesion: 0.29
Nodes (7): 1. Consultar alertas como administrador, 2. Registrar una alerta en una futura prueba, 3. Finalizar la alerta para repetir el ensayo, Casos para futuras pruebas, Consultar y probar la API de alertas SOS, Ver alertas desde el panel administrativo, Visualizar el contrato

### Community 188 - "admin-ventas.service.ts"
Cohesion: 0.18
Nodes (12): CLP, DetalleVentaAdmin, ESTADOS, FECHA_CHILE, PaginaVentas, VentaAdmin, PLANTILLA_VENTAS, PLANTILLA_VENTAS_EXCEL (+4 more)

### Community 190 - "public.bitacora_sistema"
Cohesion: 0.25
Nodes (8): ix_acceso_aplicacion_aplicacion_id, ix_acceso_aplicacion_usuario_id, ix_bitacora_sistema_aplicacion_id, ix_bitacora_sistema_usuario_id, public.acceso_aplicacion, public.aplicacion, public.bitacora_sistema, public.rol

### Community 196 - "firebase-auth.ts"
Cohesion: 0.11
Nodes (20): api, env, firebase, firebaseAuth, api, env, firebase, firebaseAuth (+12 more)

### Community 198 - ".constructor"
Cohesion: 0.17
Nodes (3): DetalleVenta, Venta, Plan

### Community 199 - "public.ticket_soporte"
Cohesion: 0.25
Nodes (8): ix_soporte_ticket_soporte_id, ix_ticket_estado, ix_ticket_soporte_categoria_soporte_id, ix_ticket_soporte_usuario_id, public.categoria_soporte, public.estado_ticket, public.soporte, public.ticket_soporte

### Community 201 - "Estado de integración BDD — 2026-10-21"
Cohesion: 0.40
Nodes (5): Archivos afectados y reparaciones, Comandos y resultados, Estado de integración BDD — 2026-10-21, Estado real después de la reanudación, Pendientes y siguiente paso exacto

### Community 207 - "jest.config.ts"
Cohesion: 0.33
Nodes (4): config, { config: tsconfig }, jest, ts-jest

### Community 221 - "ConsultarBitacoraDto"
Cohesion: 0.21
Nodes (3): ConsultarBitacoraDto, ReporteBitacoraDto, FormatoReporte

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
- **230 isolated node(s):** `@nestjs/passport`, `@nestjs/platform-express`, `@paypal/checkout-server-sdk`, `libphonenumber-js`, `passport` (+225 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1341 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `backend/package.json`, `readEnv`, `index.d.ts`, `firebase-auth.service.ts`, `google-maps.service.ts`, `ActualizarPerfilDto`, `auditoria.service.ts`, `AppService`, `app.module.ts`, `index.d.ts`, `login.service.ts`, `WhatsappAlertService`, `whatsapp-connection.service.ts`, `mindicador.service.ts`, `phone-number.ts`, `admin-ventas.service.ts`, `BaileysLoggerAdapter`, `@nestjs/common`, `app.module.ts`, `Usuario`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `@nestjs/passport`, `@nestjs/platform-express`, `@paypal/checkout-server-sdk` to the rest of the system?**
  _230 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `avisar` be split into smaller, more focused modules?**
  _Cohesion score 0.05803921568627451 - nodes in this community are weakly interconnected._
- **Why does `EMERGEN: integración de APIs externas` connect `EMERGEN: integración de APIs externas` to `paypal-sdk.ts`, `WhatsappAlertService`, `Test Seed Data Commands`, `4. jsReport`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `perfil-form.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08771929824561403 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `db Service (postgres:15-alpine)` and `MySQL Database (30 normalized tables)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `DETALLE_VENTA` and `USUARIO_SUSCRIPCION`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._