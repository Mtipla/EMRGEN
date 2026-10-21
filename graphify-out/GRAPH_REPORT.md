# Graph Report - EMRGEN  (2026-10-21)

## Corpus Check
- 249 files · ~175,276 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 39 file(s) not represented in the graph (top: (none) 26, .css 10, .pptx 1)

## Summary
- 2304 nodes · 4133 edges · 166 communities (129 shown, 37 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 188 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dbdf6137`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- auditoria.service.ts
- USUARIO Table
- ref_react
- eslint-config/package.json
- transaction
- backend/package.json
- compras.service.ts
- AuditoriaService
- mobile/package.json
- index.d.ts
- admin/api.ts
- routes/alertas.py
- Diagrama ER Actualizado (EMRGEN)
- google-maps.service.ts
- 001_compras_paypal.sql
- mindicador.service.ts
- CrearUsuarioDto
- init.sql
- USUARIO
- Team Workflow Guide (Claude Code + Graphify + Git)
- firebase-auth.service.ts
- EMERGEN: integración de APIs externas
- DevDeps Backend NestJS
- ComprasService
- desktop/package.json
- admin-views.tsx
- web/package.json
- Sistema EMERGEN (system boundary)
- AuditoriaService
- WhatsappController
- usuarios.service.ts
- scheduler.py
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
- dev.mjs
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
- public.alerta
- AppService
- devDependencies
- dependencies
- services/alertas.py
- Diagrama de Arquitectura
- api-client/package.json
- scripts
- mobile/src/App.tsx
- Evidencias de sistema Aplicación/package.json
- ui/package.json
- button.tsx
- AuthForm.tsx
- firebase-auth.ts
- BaileysLoggerAdapter
- devDependencies
- public.usuario
- http.ts
- usePremiumPurchase
- compilerOptions
- PublicSite.tsx
- Trello Sprint Board Screenshot (Fase 1)
- Sprint 4 (31/8/2026)
- public.venta
- dependencies
- conftest.py
- phone-number.ts
- PublicSite.tsx
- firebase-auth.service.ts
- dependencies
- manifest.json
- api-client/tsconfig.json
- jest.config.ts
- ui/tsconfig.json
- AuthForm
- .oxlintrc.json
- tsconfig.build.json
- init.sql
- scripts
- compilerOptions
- http.ts
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
- class-validator
- public.detalle_venta
- verify-excel.py
- services/tickets.py
- External APIs Integration Guide
- public.envio_alerta
- public.detalle_alerta
- ejecutar
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
- pg_temp.must_fail

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 64 edges
2. `public.usuario` - 34 edges
3. `WhatsappConnectionService` - 30 edges
4. `Usuario` - 29 edges
5. `LoginService` - 25 edges
6. `typeorm` - 23 edges
7. `ComprasService` - 23 edges
8. `AuditoriaService` - 22 edges
9. `UsuarioSesion` - 22 edges
10. `transaction()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Twilio` --semantically_similar_to--> `WhatsApp (Baileys) Emergency Notifications`  [INFERRED] [semantically similar]
  README.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/readme-apis.md
- `5.1 Para qué sirve` --references--> `MapView()`  [INFERRED]
  Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/readme-apis.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/packages/ui/src/map-view.tsx
- `MySQL Database (30 normalized tables)` --conceptually_related_to--> `db Service (postgres:15-alpine)`  [AMBIGUOUS]
  README.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/docker-compose.yml
- `Archivos principales` --references--> `readEnv()`  [INFERRED]
  Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/readme-apis.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/apps/backend/src/config/env.ts
- `Archivos principales` --references--> `requireEnv()`  [INFERRED]
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

## Communities (166 total, 37 thin omitted)

### Community 0 - "auditoria.service.ts"
Cohesion: 0.11
Nodes (22): ResumenUsuario, APLICACION, EntradaBitacora, EventoAuditado, FORMATO_CHILE, NOMBRE_ROL, NuevaEntradaBitacora, ResultadoAuditado (+14 more)

### Community 1 - "USUARIO Table"
Cohesion: 0.14
Nodes (16): emergen_whatsapp_auth Volume, AlertasService (example integration), HU-08 Emergency Alert User Story, HU-12 Medical Info Access While Emergency Active, WhatsApp (Baileys) Emergency Notifications, WhatsappAlertService, WhatsappAuthStateStore, WhatsappConnectionService (+8 more)

### Community 2 - "ref_react"
Cohesion: 0.11
Nodes (7): App(), savedUser, AuthenticatedUser, PinSetupForm(), PinSetupFormProps, UsersAdmin(), UsersAdminProps

### Community 3 - "eslint-config/package.json"
Cohesion: 0.07
Nodes (30): config, nextJsConfig, devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-only-warn, eslint-plugin-react-hooks (+22 more)

### Community 4 - "transaction"
Cohesion: 0.10
Nodes (23): connect(), get_db(), transaction(), run_once(), historical(), test_24_horas_recuperacion_y_carrera_job_manual(), manual(), test_sos_concurrente_unico_y_replay() (+15 more)

### Community 5 - "backend/package.json"
Cohesion: 0.05
Nodes (36): author, description, prettier, @repo/api-types, @types/node, typescript, license, name (+28 more)

### Community 6 - "compras.service.ts"
Cohesion: 0.09
Nodes (10): ABIERTAS, Reserva, DetalleVenta, Venta, codigoPostgres(), PG_UNIQUE_VIOLATION, PostgresExceptionFilter, transaction() (+2 more)

### Community 7 - "AuditoriaService"
Cohesion: 0.10
Nodes (4): AuditoriaController, AuditoriaService, ConsultarBitacoraDto, RenderedReport

### Community 8 - "mobile/package.json"
Cohesion: 0.05
Nodes (37): description, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, @ionic/react-router (+29 more)

### Community 9 - "index.d.ts"
Cohesion: 0.12
Nodes (5): CreatePaypalOrderDto, PaypalController, PaypalService, CapturePaypalOrderResponse, PaypalOrderResponse

### Community 10 - "admin/api.ts"
Cohesion: 0.13
Nodes (23): adminApi, API_URL, datos(), DatosPlan, DatosSoporte, EntradaBitacora, ESTADOS, Expediente (+15 more)

### Community 11 - "routes/alertas.py"
Cohesion: 0.14
Nodes (10): cerrar_alerta(), crear_alerta(), listar_alertas(), obtener_alerta(), solo_staff(), usuario_actual(), UsuarioSesion, Alerta (+2 more)

### Community 13 - "google-maps.service.ts"
Cohesion: 0.13
Nodes (6): GeocodeQueryDto, ReverseGeocodeQueryDto, GoogleMapsController, GoogleMapsService, GeocodeResult, class-transformer

### Community 15 - "mindicador.service.ts"
Cohesion: 0.12
Nodes (6): GenerateReportDto, JsreportController, InlineReportTemplate, JsreportService, GenerateReportRequest, 4.4 Endpoint

### Community 17 - "init.sql"
Cohesion: 0.11
Nodes (20): emergen_venta_identidad, ix_mensaje_contacto_estado_contacto_id, ix_mensaje_contacto_tipo_contacto_id, ix_notificacion_movil_usuario_id, ix_respuesta_contacto_mensaje_contacto_id, ix_respuesta_contacto_usuario_id, ix_soporte_ticket_soporte_id, ix_ticket_estado (+12 more)

### Community 18 - "USUARIO"
Cohesion: 0.08
Nodes (30): ACCESO_APLICACION, ALERTA, APLICACION, BITACORA_SISTEMA, CATEGORIA_SOPORTE, CONTACTO_EMERGENCIA, DETALLE_ALERTA, DETALLE_VENTA (+22 more)

### Community 19 - "Team Workflow Guide (Claude Code + Graphify + Git)"
Cohesion: 0.17
Nodes (18): Branch Architecture (main, graphify, alonso, diego, gabriel), GitHub branch protection rules, Claude Code, CLAUDE.md graphify section and PreToolUse hook, Conventional Commits message format, Daily cycle on individual branch (6.2), graph.json union merge driver (.gitattributes), graphify branch (+10 more)

### Community 20 - "firebase-auth.guard.ts"
Cohesion: 0.15
Nodes (8): FirebaseAuthController, FirebaseAuthGuard, FirebaseRequest, FirebaseAuthModule, FirebaseAuthService, FirebaseTokenPayload, FirebaseAuthUser, 3.3 Endpoint y piezas exportadas

### Community 21 - "EMERGEN: integración de APIs externas"
Cohesion: 0.05
Nodes (36): 1.1 Crear o completar el `.env`, 1.2 Referencia de variables, 1.3 Aplicar los cambios, 1. Configurar las variables de entorno, 2.1 Para qué sirve, 2.2 Obtener las credenciales, 2.3 Endpoints, 2.4 Ejemplos (+28 more)

### Community 22 - "DevDeps Backend NestJS"
Cohesion: 0.08
Nodes (25): devDependencies, jest, @nestjs/cli, @nestjs/mau, @nestjs/schematics, @nestjs/testing, oxlint, oxlint-tsgolint (+17 more)

### Community 23 - "ComprasService"
Cohesion: 0.06
Nodes (16): AdminController, ActualizarEstadoDto, clpAUsd(), ESTADO_PAGO, MAX_APADRINADOS, METODO_PAGO_PAYPAL, MONEDA_PAYPAL, nombreEstado() (+8 more)

### Community 24 - "desktop/package.json"
Cohesion: 0.08
Nodes (25): axios, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, react (+17 more)

### Community 25 - "admin-views.tsx"
Cohesion: 0.13
Nodes (24): acceso(), AdminCompras(), AdminComprasProps, AdminCuentas(), eliminar(), guardar(), AdminCuentasProps, AdminTrabajadores() (+16 more)

### Community 26 - "web/package.json"
Cohesion: 0.08
Nodes (25): axios, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, @ionic/react-router (+17 more)

### Community 27 - "Sistema EMERGEN (system boundary)"
Cohesion: 0.12
Nodes (24): Actor: Administrador, Use Case: Aumentar Usuarios Apadrinados, Actor: Contacto de Emergencia, Use Case: Crear PIN Usuario Apadrinado, Use Case: Enviar Mensaje Personalizado, Use Case: Enviar Ubicacion, Use Case: Generar Alerta, Use Case: Gestionar Compras (+16 more)

### Community 28 - "AdminService"
Cohesion: 0.18
Nodes (5): AdminService, diferencias(), ExpedienteUsuario, ActorAuditoria, PlanUsuario

### Community 29 - "WhatsappController"
Cohesion: 0.17
Nodes (3): WhatsappController, WhatsappPairingCodeResponse, WhatsappStatusResponse

### Community 30 - "usuarios.service.ts"
Cohesion: 0.13
Nodes (8): GuardarPlanDto, AppModule, Pin, MAX_APADRINADOS, createAppTestingModule(), bcrypt, @nestjs/testing, supertest

### Community 31 - "scheduler.py"
Cohesion: 0.13
Nodes (4): Settings, lifespan(), loop(), health()

### Community 32 - "db-dev.cjs"
Cohesion: 0.07
Nodes (26): file, bcrypt, { Client }, { createRequire }, { parseEnv }, { readFileSync, existsSync }, requireBackend, { resolve } (+18 more)

### Community 33 - "google-maps.ts"
Cohesion: 0.16
Nodes (17): addMarker(), createMap(), CreateMapOptions, GoogleMap, GoogleMapsNamespace, GoogleMarker, loadGoogleMaps(), MapsLibrary (+9 more)

### Community 34 - "Usuario"
Cohesion: 0.11
Nodes (3): LoginService, Usuario, UsuariosService

### Community 35 - "devDependencies"
Cohesion: 0.09
Nodes (22): devDependencies, @capacitor/cli, cypress, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+14 more)

### Community 36 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, bcrypt, class-transformer, class-validator, jsonwebtoken, jwks-rsa, @nestjs/common, @nestjs/config (+14 more)

### Community 37 - "tickets_soporte.py"
Cohesion: 0.20
Nodes (11): actualizar_ticket(), crear_ticket(), listar_categorias(), listar_estados(), listar_tickets(), obtener_ticket(), Categoria, Estado (+3 more)

### Community 38 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 39 - "@nestjs/common"
Cohesion: 0.11
Nodes (19): AdminModule, AuditoriaModule, ComprasModule, GoogleMapsModule, MindicadorModule, PaypalModule, JwtAuthGuard, SolicitudAutenticada (+11 more)

### Community 40 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 42 - "test_alertas.py"
Cohesion: 0.24
Nodes (15): token(), body(), close(), create(), test_borrado_lectura_historica_staff_left_join(), test_cierre_propio_pin_hash_otra_familia_repeticion(), test_parcial_pin_tutor_completo_pin_propio(), test_pin_limitado_persistente_y_configuracion_faltante() (+7 more)

### Community 43 - "errors.py"
Cohesion: 0.23
Nodes (6): _body(), _http_error(), _postgres_error(), register_error_handlers(), _unhandled_error(), _validation_error()

### Community 44 - "dev.mjs"
Cohesion: 0.17
Nodes (7): { app, BrowserWindow, shell }, path, argumentos, env, indiceModo, ventana, electron

### Community 45 - "send-emergency-alert.dto.ts"
Cohesion: 0.15
Nodes (6): EmergencyAlertLocationDto, EmergencyAlertMedicalInfoDto, SendEmergencyAlertDto, MAX_RECIPIENTS, EmergencyAlertLocation, EmergencyAlertMedicalInfo

### Community 46 - "Diagrama de Componentes"
Cohesion: 0.27
Nodes (19): Aplicación de Escritorio, Aplicación Móvil, Aplicación WEB, Backend (capa), Base de Datos, Capa de acceso a Datos, Control Principal, Diagrama de Componentes (+11 more)

### Community 47 - "whatsapp-alert.service.ts"
Cohesion: 0.21
Nodes (11): buildEmergencyAlertText(), buildLocationMessage(), googleMapsLink(), location, sleep(), withRetry(), RETRY_DELAYS_MS, alert (+3 more)

### Community 48 - "WhatsappConnectionService"
Cohesion: 0.17
Nodes (4): errorMessage(), statusCodeOf(), WhatsappConnectionService, WhatsappConnectionState

### Community 49 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+10 more)

### Community 50 - "whatsapp-connection.service.ts"
Cohesion: 0.17
Nodes (12): readEnv(), BaileysLib, loadBaileys(), MultiFileAuthStateStore, WhatsappAuthState, WhatsappAuthStateStore, defaultCountryCode(), INTEGRATION (+4 more)

### Community 51 - "mindicador.service.ts"
Cohesion: 0.13
Nodes (11): INDICATOR_CODES, IndicatorParamDto, IndicatorQueryDto, MindicadorController, MindicadorDaily, MindicadorSerie, MindicadorService, EconomicIndicator (+3 more)

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
Cohesion: 0.12
Nodes (15): Test Seed Data Commands, Dictamen y alcance, Diferencias consolidadas y contrato físico, Integración BDD EMERGEN — resultado del 21-10-2026, Línea base y entorno conservado, Pasos de aceptación manual pendientes, Pendientes y límites de la evidencia, Resultados ejecutados (+7 more)

### Community 57 - "public.alerta"
Cohesion: 0.12
Nodes (17): emergen_alerta, emergen_alerta_revoca, emergen_enlace, emergen_historial, ix_alerta_prioridad_id, ix_alerta_usuario_id, ix_historial_alerta_alerta_id, ix_historial_alerta_detalle_alerta_id (+9 more)

### Community 59 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, electron, electron-builder, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+7 more)

### Community 60 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @capacitor/app, @capacitor/core, @capacitor/haptics, @capacitor/keyboard, @capacitor/status-bar, @ionic/react, @ionic/react-router (+7 more)

### Community 61 - "services/alertas.py"
Cohesion: 0.24
Nodes (7): verify_pin(), cerrar(), crear(), _finalizar(), finalizar_vencidas(), listar(), obtener()

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
Cohesion: 0.20
Nodes (6): App(), ExploreContainer(), container, root, Home(), @testing-library/react

### Community 66 - "Evidencias de sistema Aplicación/package.json"
Cohesion: 0.06
Nodes (34): devDependencies, prettier, turbo, typescript, devEngines, packageManager, runtime, engines (+26 more)

### Community 67 - "ui/package.json"
Cohesion: 0.06
Nodes (30): dependencies, react, react-dom, @repo/api-client, devDependencies, eslint, @repo/eslint-config, @repo/typescript-config (+22 more)

### Community 69 - "AuthForm.tsx"
Cohesion: 0.20
Nodes (14): AuthForm(), completeRegistration(), describeError(), handleSubmit(), postUsuarios(), run(), startRegistration(), AuthFormProps (+6 more)

### Community 70 - "2026-10-21 — Roles, permisos, soporte y funcionalidades documentadas (bloque 2)"
Cohesion: 0.06
Nodes (33): 2026-10-21 — Roles, permisos, soporte y funcionalidades documentadas (bloque 2), 2026-10-21 — Rutas y UI base de los wireframes (bloque 1), 2026-10-21 — SOPORTE = "Trabajador" de documentos y mockups (bloque 3), Antes / después, Archivos, Archivos, Archivos, Cambios (+25 more)

### Community 71 - "BaileysLoggerAdapter"
Cohesion: 0.23
Nodes (4): BaileysLoggerAdapter, ILogger, Level, LEVELS

### Community 72 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/node, @types/react (+5 more)

### Community 73 - "public.usuario"
Cohesion: 0.13
Nodes (15): emergen_00_ultimo_admin, emergen_usuario_borrado, emergen_usuario_limpieza, emergen_usuario_vinculo, ix_usuario_estado_id, ix_usuario_msj_personalizado_id, ix_usuario_pin_id, ix_usuario_principal (+7 more)

### Community 74 - "Cambios Realizados (AUDITORIA CLAUDE)"
Cohesion: 0.18
Nodes (13): AUDIT-P04 Refresh token rotativo y revocable, Auditoría Técnica EMERGEN (05/10/2026), Cambios Realizados (AUDITORIA CLAUDE), Hallazgo I-05 Catálogo único de tipos de emergencia, Hallazgo I-08 Alcance de comunicación a servicios de emergencia, Hallazgo R-09 Dos proveedores de identidad (Firebase y JWT propio), Informe TEC (1.6), ISO/IEC/IEEE 29148:2018 (+5 more)

### Community 75 - "usePremiumPurchase"
Cohesion: 0.18
Nodes (14): api, errorMessage(), PurchaseModal, specificMessage(), usePremiumPurchase(), cancelPurchase(), confirm(), createOrder() (+6 more)

### Community 76 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, allowJs, jsx, module, moduleResolution, noEmit, plugins, extends (+2 more)

### Community 77 - "Archivos principales"
Cohesion: 0.20
Nodes (10): EmergenApi, PaypalButtons, PaypalButtonsOptions, PaypalNamespace, renderPaypalButtons(), RenderPaypalButtonsOptions, ButtonsOptions, CreatePaypalOrderRequest (+2 more)

### Community 78 - "Trello Sprint Board Screenshot (Fase 1)"
Cohesion: 0.24
Nodes (10): Daily Sprints (daily logs 10/8-21/8/2026), Scrum Weekly Sprint Cadence, Sprint 1 (10/8/2026), Sprint 1 Deliverables (Lean Canvas, Sprint Planning, Acta de Constitucion, RACI, Definicion Proyecto APT), Sprint 2 (17/8/2026), Sprint 2 Deliverables (Documento ERS, Product Backlog, Tabla maestra, Epicas e Historias de usuario), Sprint 3 (24/8/2026), Sprint 3 Deliverables (Wireframes/Mockups, Diagrama UML, Especificacion de Herramientas, Arquitectura) (+2 more)

### Community 79 - "Sprint 4 (31/8/2026)"
Cohesion: 0.27
Nodes (10): Cierre Sprint 3 (28/8/2026), Cierre Sprint 4 (14/9/2026), Creacion del repositorio de GitHub, Daily Sprint 3 (24-28/8/2026), Daily Sprint 4 (11 dailies), Daily Sprint 4 date inconsistency (1/8-11/8 after 31/8), 4.1 Diccionario de Datos / Modelo de Dominio, 4.4 Docker (+2 more)

### Community 80 - "public.venta"
Cohesion: 0.15
Nodes (14): emergen_reserva, emergen_venta_comprador, ix_reserva_usuario, ix_venta_estado_pago_id, ix_venta_metodo_pago_id, ix_venta_usuario_id, public.emergen_comprobar_total_venta(), public.emergen_validar_plan_usuario() (+6 more)

### Community 81 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, axios, @ionic/react, @ionic/react-router, ionicons, react, react-dom, react-router-dom (+2 more)

### Community 82 - "conftest.py"
Cohesion: 0.16
Nodes (3): client(), crear_usuario(), db()

### Community 83 - "phone-number.ts"
Cohesion: 0.24
Nodes (7): PairingCodeDto, maskPhoneNumber(), normalizePhoneNumber(), PHONE_NUMBER, toUserJid(), EmergencyAlertDelivery, WhatsappPairingCodeRequest

### Community 84 - "PublicSite.tsx"
Cohesion: 0.23
Nodes (12): renderPublicSite(), ImagePlaceholder(), Landing(), LoginRequiredModal(), LoginRequiredModalProps, PremiumInfo(), PremiumInfoProps, PublicNav() (+4 more)

### Community 85 - "firebase-auth.service.ts"
Cohesion: 0.24
Nodes (5): attacker, google, json(), paypalToken(), jsonwebtoken

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
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, strictNullChecks, exclude, extends, include, @repo/typescript-config/react-library.json

### Community 91 - "PremiumPurchase.tsx"
Cohesion: 0.27
Nodes (8): clp, PaypalCheckout(), PaypalCheckoutProps, PremiumPurchase(), PremiumPurchaseProps, ResultModal(), ResultModalProps, loadPaypalSdk()

### Community 92 - ".oxlintrc.json"
Cohesion: 0.29
Nodes (6): env, node, rules, typescript/no-explicit-any, typescript/no-floating-promises, $schema

### Community 93 - "tsconfig.build.json"
Cohesion: 0.29
Nodes (6): compilerOptions, rootDir, exclude, extends, include, ./tsconfig.json

### Community 94 - "init.sql"
Cohesion: 0.13
Nodes (16): ix_mensaje_contacto_estado_contacto_id, ix_mensaje_contacto_tipo_contacto_id, ix_respuesta_contacto_mensaje_contacto_id, ix_respuesta_contacto_usuario_id, ix_soporte_ticket_soporte_id, ix_ticket_estado, ix_ticket_soporte_categoria_soporte_id, ix_ticket_soporte_usuario_id (+8 more)

### Community 95 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test.e2e, test.unit

### Community 96 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, include

### Community 97 - "WhatsappAlertService"
Cohesion: 0.22
Nodes (7): WhatsappAlertService, WhatsappModule, 7.1 Para qué sirve, 7.2 Configurar, 7.3 Vincular el número emisor (una sola vez), 7.5 Usar el servicio desde otro módulo del backend, 7. WhatsApp (Baileys): notificaciones de emergencia

### Community 98 - "api-types/package.json"
Cohesion: 0.29
Nodes (6): description, exports, name, private, types, version

### Community 99 - "typescript-config/package.json"
Cohesion: 0.29
Nodes (6): license, name, private, publishConfig, access, version

### Community 100 - "backend Service (nestjs_emergen_backend)"
Cohesion: 0.30
Nodes (12): backend Service (evidence copy, without WhatsApp), db Service (postgres:15-alpine, evidence copy), EMERGEN docker-compose Configuration, backend Service (nestjs_emergen_backend), backend Service (nestjs_emergen_backend, 3001->3000), db Service (postgres:15-alpine), db Service (postgres_emergen_db, postgres:15-alpine, 5433), emergen_network Bridge Network (+4 more)

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
Cohesion: 0.36
Nodes (6): describirError(), setToken(), PanelAdmin(), cerrarSesion(), iniciarSesion(), App()

### Community 106 - "react-library.json"
Cohesion: 0.33
Nodes (5): compilerOptions, jsx, extends, ./base.json, $schema

### Community 107 - "paypal.service.ts"
Cohesion: 0.21
Nodes (10): requireEnv(), GeocodeApiResponse, ExternalRequestInit, logger, requestExternal(), requestExternalJson(), BASE_URLS, PaypalLink (+2 more)

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
Cohesion: 0.20
Nodes (10): EMERGEN Monorepo Dev Guide (Docker evidence copy), Desktop Admin Panel (Electron 44), Mobile App (Ionic 9 + Capacitor 8), EMERGEN Monorepo Dev Guide, Shared Packages (eslint-config, typescript-config, ui), Troubleshooting Table, Turborepo Monorepo, Web App (React 19 + Vite 8 + Ionic 9) (+2 more)

### Community 123 - "class-validator"
Cohesion: 0.17
Nodes (3): CrearPinDto, LoginDto, class-validator

### Community 124 - "public.detalle_venta"
Cohesion: 0.18
Nodes (12): emergen_detalle_compra, emergen_detalle_total, emergen_plan_usuario, emergen_venta_total, ix_detalle_venta_plan_id, ix_detalle_venta_venta_id, ix_plan_usuario_plan_id, public.detalle_venta (+4 more)

### Community 126 - "services/tickets.py"
Cohesion: 0.36
Nodes (8): actualizar(), categorias(), crear(), estado_canonico(), estados(), existe_categoria(), listar(), obtener()

### Community 127 - "External APIs Integration Guide"
Cohesion: 0.36
Nodes (10): @repo/api-client Package, @repo/api-types Package, External APIs Integration Guide, Firebase Authentication, FirebaseAuthGuard, Google Maps Platform (Maps JS + Geocoding), jsReport PDF Reports, mindicador API (Chile economic indicators) (+2 more)

### Community 128 - "public.envio_alerta"
Cohesion: 0.22
Nodes (9): emergen_contactos, emergen_envio, ix_contacto_emergencia_usuario_id, ix_envio_alerta_alerta_id, ix_envio_alerta_contacto_emergencia_id, ix_envio_alerta_estado_envio_id, public.contacto_emergencia, public.envio_alerta (+1 more)

### Community 129 - "public.detalle_alerta"
Cohesion: 0.22
Nodes (9): emergen_detalle_historico, emergen_medico_propietario, ix_detalle_alerta_antecedente_medico_id, ix_detalle_alerta_msj_personalizado_id, public.antecedente_medico, public.detalle_alerta, public.emergen_medico_propietario_fijo(), public.emergen_preparar_borrado_usuario() (+1 more)

### Community 130 - "ejecutar"
Cohesion: 0.32
Nodes (8): listar(), crear(), SeccionUsuarios(), accion(), listar(), verExpediente(), resumir(), ejecutar()

### Community 131 - "public.bitacora_sistema"
Cohesion: 0.25
Nodes (8): ix_acceso_aplicacion_aplicacion_id, ix_acceso_aplicacion_usuario_id, ix_bitacora_sistema_aplicacion_id, ix_bitacora_sistema_usuario_id, public.acceso_aplicacion, public.aplicacion, public.bitacora_sistema, public.rol

### Community 133 - "Desktop App React + TypeScript + Vite Template README"
Cohesion: 1.00
Nodes (3): Desktop App React + TypeScript + Vite Template README, Web App React + TypeScript + Vite Template README, @turbo/eslint-config Shared ESLint Configurations

### Community 141 - ".env Configuration (single root .env)"
Cohesion: 0.33
Nodes (5): No-secrets policy (.env, MySQL, PayPal, Twilio, Google Maps credentials), config/env.ts (readEnv/requireEnv), .env Configuration (single root .env), Environment Variables Template (.env.example), JWT_SECRET (HS256 access tokens)

### Community 143 - "Cuentas temporales de prueba (solo entorno local)"
Cohesion: 0.33
Nodes (5): 1. Cuentas, 2. Cómo usarlas, 3. Cómo volver a crearlas, 4. Cómo eliminarlas, Cuentas temporales de prueba (solo entorno local)

### Community 144 - "Team Rules (Reglas del equipo)"
Cohesion: 0.50
Nodes (3): CONTRIBUTING.md, graphify-out Knowledge Graph, Graphify Usage Rules

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1092 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `auditoria.service.ts`, `Usuario`, `backend/package.json`, `compras.service.ts`, `BaileysLoggerAdapter`, `index.d.ts`, `paypal.service.ts`, `google-maps.service.ts`, `mindicador.service.ts`, `whatsapp-alert.service.ts`, `whatsapp-connection.service.ts`, `mindicador.service.ts`, `firebase-auth.guard.ts`, `firebase-auth.service.ts`, `AppService`, `usuarios.service.ts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `@nestjs/passport`, `@nestjs/platform-express`, `@paypal/checkout-server-sdk` to the rest of the system?**
  _226 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auditoria.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10931174089068826 - nodes in this community are weakly interconnected._
- **Why does `@testing-library/react` connect `mobile/src/App.tsx` to `mobile/package.json`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `USUARIO Table` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `db Service (postgres:15-alpine)` and `MySQL Database (30 normalized tables)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `DETALLE_VENTA` and `USUARIO_SUSCRIPCION`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._