# Graph Report - EMRGEN  (2026-09-23)

## Corpus Check
- 147 files · ~114,651 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 27 file(s) not represented in the graph (top: (none) 16, .css 7, .bmpr 2)

## Summary
- 1501 nodes · 2376 edges · 99 communities (82 shown, 17 thin omitted)
- Extraction: 86% EXTRACTED · 13% INFERRED · 1% AMBIGUOUS · INFERRED: 318 edges (avg confidence: 0.85)
- Token cost: 477,169 input · 0 output

## Community Hubs (Navigation)
- Requirements & Quality Goals
- Phase 1 Rubric & Competencies
- Git & Graphify Workflow
- ESLint Shared Config
- Alonso Self-Assessment
- Admin Platform Epic (EP-09)
- Backend Package Manifest
- Product Backlog & Sprints
- Desktop App UI
- Test Cases & Traceability
- Mobile Package Manifest
- Monorepo Root Config
- init.sql Schema Tables
- Data Dictionary Tables
- Shared UI Package
- Use Case Model
- Desktop Package Manifest
- Web Package Manifest
- Backend Dev Tooling
- Mobile Dev Tooling
- Phase 1 Sprint Plan (F1 tasks)
- Backend TS Config
- Desktop TS App Config
- Web TS App Config
- Backend Runtime Deps (NestJS)
- Mobile TS Config
- Auth & Accounts Epics
- NestJS App Module
- HLD Component Architecture
- Desktop TS Node Config
- Web TS Node Config
- Shared TS Base Config
- Sprint Roadmap & Scrum
- Project Charter People & Budget
- Emergency Contacts Epic
- SOS & Notifications Epics
- Medical Data & Security Epics
- Charter Stakeholders & Risks
- Deployment Architecture
- Desktop Electron Tooling
- Turborepo Pipeline
- Desktop Admin & Payments
- Backend npm Scripts
- RACI & Team Roles
- Mobile Capacitor Deps
- Web Dev Tooling
- Dependent Users & PIN Epic
- Next.js TS Preset
- Test Plan
- Emergency Types Epic
- PWA Manifest
- Web Runtime Deps
- UI TS Config
- Oxlint Rules
- Backend Build TS Config
- Mobile npm Scripts
- Mobile TS Node Config
- TS Config Package
- Docker Compose Deployment
- Seq: Purchases (Plan/Venta)
- Seq: Sponsored Users
- Seq: Purchases (Alerts)
- Jest Config
- Nest CLI Config
- Desktop Runtime Deps
- Vite Configs
- React Library TS Preset
- Design Sprint Deliverables
- Seq: Manage User (A)
- Seq: Manage User (B)
- Seq: Send Message
- Seq: Generate Alert
- Seq: Emergency Contact
- Seq: Manage Credentials
- Seq: Emergency Message
- Seq: Emergency Type
- Seq: Manage Workers
- Seq: PIN
- Seq: Login
- Seq: Location
- Desktop npm Scripts
- Web npm Scripts
- NestJS Bootstrap
- Desktop TS References
- Cypress Config
- Web TS References
- Social Icon Sprites
- Vite Logos
- Jest DOM Setup
- Mobile Favicon
- Web Favicon
- Web Hero Image
- Desktop React Logo
- Desktop Favicon
- Desktop Hero Image
- Web React Logo

## God Nodes (most connected - your core abstractions)
1. `Matriz de Trazabilidad de Pruebas` - 64 edges
2. `Product Backlog Emergen` - 48 edges
3. `Tabla Maestra de Product Backlog` - 42 edges
4. `Modelo de Datos / Diccionario (BDD con tipos de datos)` - 42 edges
5. `Acta de Constitución` - 30 edges
6. `Sprint Backlog con estimación de tareas (88 h)` - 29 edges
7. `Horas hombre en relación a Tareas` - 29 edges
8. `Historias de Usuario con Criterios de Aceptación` - 22 edges
9. `Tabla USUARIO` - 22 edges
10. `Especificación de Herramientas y Servicios del Proyecto` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Graphify (graphifyy 0.9.65, pinned)` --semantically_similar_to--> `Exact Version Pinning Policy (save-exact, single version per shared dep)`  [INFERRED] [semantically similar]
  CONTRIBUTING.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/README.md
- `Turborepo Monorepo Architecture` --semantically_similar_to--> `Turborepo Tooling (turbo 2.11.2 via npx)`  [INFERRED] [semantically similar]
  README.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/README.md
- `Nest.js Backend REST API` --semantically_similar_to--> `apps/backend NestJS 12 API (TypeORM + PostgreSQL, RBAC)`  [INFERRED] [semantically similar]
  README.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/README.md
- `React / Angular + Ionic Web Frontend` --semantically_similar_to--> `apps/web React 19 + Vite 8 + Ionic 9 Public Web`  [INFERRED] [semantically similar]
  README.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/README.md
- `Electron Desktop Admin App` --semantically_similar_to--> `apps/desktop Electron 44 + React 19 Admin Panel`  [INFERRED] [semantically similar]
  README.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Shared Docker-based Postgres + Node Infrastructure Pattern** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_4_docker_readme_docker_deployment_strategy, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_4_docker_docker_compose, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_4_docker_readme_postgresql [INFERRED 0.80]
- **Graphify Shared-Graph Git Workflow** — contributing_graphify_branch, contributing_main_branch, contributing_individual_branches, contributing_graph_update_procedure, contributing_graph_json_merge_driver, contributing_graphify_skip_hook [EXTRACTED 1.00]
- **EMERGEN Docker Backend + DB Stack** — fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_db_service, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_backend_service, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_emergen_network, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_postgres_volume, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_init_sql, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_backend_dockerfile [EXTRACTED 1.00]
- **EMERGEN Presentation Layer Clients (Web, Mobile, Desktop)** — readme_react_angular_ionic_frontend, readme_capacitor_mobile, readme_electron_desktop, readme_nestjs_backend [EXTRACTED 1.00]
- **Flujo de alerta SOS: activación, geolocalización y despacho** — graphify_out_converted_épicas_e_historias_de_usuario_69002674_hu_06, graphify_out_converted_épicas_e_historias_de_usuario_69002674_hu_07, graphify_out_converted_épicas_e_historias_de_usuario_69002674_hu_08, graphify_out_converted_sprint_backlog_actividades_horas_8a7c50c3_th_6_2, graphify_out_converted_sprint_backlog_actividades_horas_8a7c50c3_th_7_1, graphify_out_converted_sprint_backlog_actividades_horas_8a7c50c3_th_7_2, graphify_out_converted_sprint_backlog_actividades_horas_8a7c50c3_th_8_1, graphify_out_converted_especificación_de_herramientas_y_servicios_del_proyecto_55e759a4_api_integrada_de_alertas, graphify_out_converted_historias_usuario_con_instructivo_fa506d1a_sms_fallback_sin_conexion, graphify_out_converted_historias_usuario_con_instructivo_fa506d1a_reintento_envio_encolado [INFERRED 0.85]
- **Stack tecnológico unificado TypeScript en Monorepo** — graphify_out_converted_especificación_de_herramientas_y_servicios_del_proyecto_55e759a4_typescript, graphify_out_converted_especificación_de_herramientas_y_servicios_del_proyecto_55e759a4_node_js, graphify_out_converted_especificación_de_herramientas_y_servicios_del_proyecto_55e759a4_nest_js, graphify_out_converted_especificación_de_herramientas_y_servicios_del_proyecto_55e759a4_react_angular, graphify_out_converted_especificación_de_herramientas_y_servicios_del_proyecto_55e759a4_ionic, graphify_out_converted_especificación_de_herramientas_y_servicios_del_proyecto_55e759a4_capacitor, graphify_out_converted_especificación_de_herramientas_y_servicios_del_proyecto_55e759a4_electron, graphify_out_converted_especificación_de_herramientas_y_servicios_del_proyecto_55e759a4_turborepo, graphify_out_converted_especificación_de_herramientas_y_servicios_del_proyecto_55e759a4_mysql [EXTRACTED 1.00]
- **Historias de Usuario del MVP (épicas Must Have + autenticación)** — graphify_out_converted_épicas_e_historias_de_usuario_69002674_hu_01, graphify_out_converted_épicas_e_historias_de_usuario_69002674_hu_02, graphify_out_converted_épicas_e_historias_de_usuario_69002674_hu_03, graphify_out_converted_épicas_e_historias_de_usuario_69002674_hu_04, graphify_out_converted_épicas_e_historias_de_usuario_69002674_hu_05, graphify_out_converted_épicas_e_historias_de_usuario_69002674_hu_06, graphify_out_converted_épicas_e_historias_de_usuario_69002674_hu_07, graphify_out_converted_épicas_e_historias_de_usuario_69002674_hu_08, graphify_out_converted_1_2_1_hoja_de_ruta_del_proyecto_bee4036b_mvp [INFERRED 0.75]
- **MVP emergency communication core (HU-01..HU-08)** — graphify_out_converted_2_1_1_product_backlog_b8d86969_hu_01, graphify_out_converted_2_1_1_product_backlog_b8d86969_hu_02, graphify_out_converted_2_1_1_product_backlog_b8d86969_hu_03, graphify_out_converted_2_1_1_product_backlog_b8d86969_hu_04, graphify_out_converted_2_1_1_product_backlog_b8d86969_hu_05, graphify_out_converted_2_1_1_product_backlog_b8d86969_hu_06, graphify_out_converted_2_1_1_product_backlog_b8d86969_hu_07, graphify_out_converted_2_1_1_product_backlog_b8d86969_hu_08, graphify_out_converted_2_1_1_product_backlog_b8d86969_mvp [EXTRACTED 1.00]
- **SOS alert persistence tables** — graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_alerta, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_ubicacion_alerta, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_detalle_alerta, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_historial_alerta, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_usuario_mensaje_personalizado, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_notificacion_movil [INFERRED 0.85]
- **Emergen test strategy (test types)** — graphify_out_converted_plan_de_pruebas_3e777254_pruebas_funcionales, graphify_out_converted_plan_de_pruebas_3e777254_pruebas_unitarias, graphify_out_converted_plan_de_pruebas_3e777254_pruebas_integracion, graphify_out_converted_plan_de_pruebas_3e777254_pruebas_interfaz_responsividad, graphify_out_converted_plan_de_pruebas_3e777254_pruebas_seguridad, graphify_out_converted_plan_de_pruebas_3e777254_pruebas_privacidad_confidencialidad, graphify_out_converted_plan_de_pruebas_3e777254_pruebas_usabilidad, graphify_out_converted_plan_de_pruebas_3e777254_plan_de_pruebas [EXTRACTED 1.00]
- **RA1 Indicadores de Logro IL 1.1-1.5 (rubrica Fase 1)** — graphify_out_converted_1_4_apt122_formativafase1_decb3081_ra1, graphify_out_converted_1_4_apt122_formativafase1_decb3081_il_1_1, graphify_out_converted_diego_plaza_1_3_apt122_autoevaluaci_nfase1_389fe0e5_il_1_2, graphify_out_converted_diego_plaza_1_3_apt122_autoevaluaci_nfase1_389fe0e5_il_1_3, graphify_out_converted_diego_plaza_1_3_apt122_autoevaluaci_nfase1_389fe0e5_il_1_4, graphify_out_converted_1_4_apt122_formativafase1_decb3081_il_1_5 [EXTRACTED 1.00]
- **EMERGEN solucion multiplataforma (web, escritorio, movil, BD)** — graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_emergen, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_aplicacion_web, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_aplicacion_de_escritorio, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_aplicacion_movil, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_base_de_datos [EXTRACTED 1.00]
- **Marco SCRUM de EMERGEN (roles, artefactos, eventos)** — graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_metodologia_scrum, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_sprint, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_product_backlog, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_sprint_backlog, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_incremento_de_software, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_rol_product_owner, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_rol_scrum_master, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_rol_equipo_de_desarrollo [EXTRACTED 1.00]
- **RA1 Achievement Indicators (IL 1.1-1.5) of the Phase 1 APT rubric** — graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_ra1_propuesta_proyecto, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_il_1_1_fundamentacion, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_il_1_2_objetivos_metodologia, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_il_1_3_plan_trabajo_evidencias, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_il_1_4_aspectos_formales, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_il_1_5_indicadores_calidad [EXTRACTED 1.00]
- **Graduate-profile competencies with disciplinary quality indicators** — graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_competencia_pruebas_certificacion, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_competencia_gestionar_proyectos, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_competencia_modelos_de_datos, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_competencia_solucion_software [EXTRACTED 1.00]
- **Six self-rated profile competencies shared by both team members** — graphify_out_converted_gonzalez_alonso_1_1_apt122_autoevaluacioncompetenciasfase1_011da5b8_arquitectura_de_software, graphify_out_converted_gonzalez_alonso_1_1_apt122_autoevaluacioncompetenciasfase1_011da5b8_diseno_aplicaciones_web, graphify_out_converted_gonzalez_alonso_1_1_apt122_autoevaluacioncompetenciasfase1_011da5b8_diseno_aplicaciones_moviles, graphify_out_converted_gonzalez_alonso_1_1_apt122_autoevaluacioncompetenciasfase1_011da5b8_diseno_aplicaciones_escritorio, graphify_out_converted_gonzalez_alonso_1_1_apt122_autoevaluacioncompetenciasfase1_011da5b8_base_de_datos, graphify_out_converted_gonzalez_alonso_1_1_apt122_autoevaluacioncompetenciasfase1_011da5b8_documentacion [EXTRACTED 1.00]

## Communities (99 total, 17 thin omitted)

### Community 0 - "Requirements & Quality Goals"
Cohesion: 0.06
Nodes (83): Análisis crítico de historias (riesgo y trabajo en paralelo), Objetivos de Calidad (ISO 9126 / ISO 25001), Google Maps Platform API, Twilio SendGrid Email Validation, Historias de Usuario con Criterios de Aceptación, Validación de mensaje vacío y límite de caracteres, Regla: mínimo 1 contacto de emergencia registrado, PIN con o sin acceso completo (control del tutor) (+75 more)

### Community 1 - "Phase 1 Rubric & Competencies"
Cohesion: 0.05
Nodes (81): Formativa Definicion Proyecto APT (Evaluacion Fase 1), Competencia: Construir modelos de datos escalables, Competencia: Desarrollar solucion de software sistematizada, Competencia: Gestionar proyectos informaticos, Competencia: Realizar pruebas de certificacion de productos y procesos, Formato informe tecnico (portada, indice, abstract, desarrollo, conclusiones, reflexiones; Arial/Verdana/Calibri 11-12), Heteroevaluacion formativa en equipos de 2-3, semana 2, 40 minutos, 0% ponderacion, IL 1.1 Fundamenta el Proyecto APT (intereses, competencias, factibilidad, relevancia) (+73 more)

### Community 2 - "Git & Graphify Workflow"
Cohesion: 0.05
Nodes (72): GitHub branch protection rules, Claude Code, Clone outside synced folders (OneDrive/Dropbox), Conventional Commits message format, graph.json union merge driver (.gitattributes), Shared graph update procedure (post-PR, by PR author), graphify branch (shared graph data), GRAPHIFY_SKIP_HOOK environment variable (+64 more)

### Community 3 - "ESLint Shared Config"
Cohesion: 0.07
Nodes (36): config, nextJsConfig, devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-only-warn, eslint-plugin-react-hooks (+28 more)

### Community 4 - "Alonso Self-Assessment"
Cohesion: 0.09
Nodes (43): Alonso Fabian Gonzalez Jara, Competencia: Arquitectura de Software, Autoevaluacion de Competencias Fase 1 (Alonso Gonzalez), Competencia: Base de Datos, Competencia: Diseno de Aplicaciones Escritorio, Competencia: Diseno de Aplicaciones Moviles, Competencia: Diseno de Aplicaciones Web, Competencia: Documentacion (+35 more)

### Community 5 - "Admin Platform Epic (EP-09)"
Cohesion: 0.10
Nodes (42): EP-09: Plataforma Administrativa Web/Desktop, F09.1: Panel de supervision de cuentas y usuarios Web/Desktop, F09.2: Emision de informes administrativos e historial de emergencias, HU-13: Panel de Administracion de Usuarios (Web/Desktop), Modelo de Datos / Diccionario (BDD con tipos de datos), Tabla ACCESO_APLICACION, Tabla ALERTA, Tabla APLICACION (+34 more)

### Community 6 - "Backend Package Manifest"
Cohesion: 0.05
Nodes (39): author, description, prettier, @types/node, typescript, license, name, private (+31 more)

### Community 7 - "Product Backlog & Sprints"
Cohesion: 0.13
Nodes (40): Cohn (2004) User Stories Applied, Definition of Done Fase 1, Fase 1 Sprint 1: Definir el proyecto y su marco de trabajo, Fase 1 Sprint 2: Establecer requisitos y trazabilidad, Fase 1 Sprint 3: Disenar la solucion y seleccionar tecnologias, Fase 1 Sprint 4: Preparar el inicio de la construccion, Product Backlog Emergen, Retrospectiva (+32 more)

### Community 8 - "Desktop App UI"
Cohesion: 0.07
Nodes (24): App(), fase_2_evidencias_proyecto_evidencias_de_sistema_aplicación_apps_desktop_src_assets_hero, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicación_apps_desktop_src_assets_react, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicación_apps_desktop_src_assets_vite, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicación_apps_desktop_src_index, App(), ContainerProps, ExploreContainer() (+16 more)

### Community 9 - "Test Cases & Traceability"
Cohesion: 0.08
Nodes (39): F02.2: Modificacion de perfil y actualizacion de credenciales, CP-RF13-01: Envio de ubicacion durante emergencia, CP-RF13-02: Comportamiento sin ubicacion actual (fallback), CP-RF14-01: Numeros oficiales de emergencia, CP-RF15-01: Funciones administrativas de escritorio, CP-RF16-01: Venta de cuenta desde web, CP-RF17-01: Descuentos por apadrinamiento, CP-RF18-01: Solicitud de soporte web (+31 more)

### Community 10 - "Mobile Package Manifest"
Cohesion: 0.06
Nodes (34): description, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, @ionic/react-router (+26 more)

### Community 11 - "Monorepo Root Config"
Cohesion: 0.06
Nodes (33): devDependencies, prettier, turbo, typescript, devEngines, packageManager, runtime, engines (+25 more)

### Community 12 - "init.sql Schema Tables"
Cohesion: 0.13
Nodes (30): ACCESO_APLICACION, ALERTA, APLICACION, BITACORA_SISTEMA, CATEGORIA_SOPORTE, CONTACTO_EMERGENCIA, DETALLE_ALERTA, DETALLE_VENTA (+22 more)

### Community 13 - "Data Dictionary Tables"
Cohesion: 0.08
Nodes (30): ACCESO_APLICACION, ALERTA, APLICACION, BITACORA_SISTEMA, CATEGORIA_SOPORTE, CONTACTO_EMERGENCIA, DETALLE_ALERTA, DETALLE_VENTA (+22 more)

### Community 14 - "Shared UI Package"
Cohesion: 0.07
Nodes (28): dependencies, react, react-dom, devDependencies, eslint, @repo/eslint-config, @repo/typescript-config, @types/node (+20 more)

### Community 15 - "Use Case Model"
Cohesion: 0.12
Nodes (24): Actor: Administrador, Use Case: Aumentar Usuarios Apadrinados, Actor: Contacto de Emergencia, Use Case: Crear PIN Usuario Apadrinado, Use Case: Enviar Mensaje Personalizado, Use Case: Enviar Ubicacion, Use Case: Generar Alerta, Use Case: Gestionar Compras (+16 more)

### Community 16 - "Desktop Package Manifest"
Cohesion: 0.08
Nodes (23): axios, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, react (+15 more)

### Community 17 - "Web Package Manifest"
Cohesion: 0.08
Nodes (23): axios, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, @ionic/react-router (+15 more)

### Community 18 - "Backend Dev Tooling"
Cohesion: 0.09
Nodes (22): devDependencies, jest, @nestjs/cli, @nestjs/mau, @nestjs/schematics, @nestjs/testing, oxlint, oxlint-tsgolint (+14 more)

### Community 19 - "Mobile Dev Tooling"
Cohesion: 0.09
Nodes (22): devDependencies, @capacitor/cli, cypress, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+14 more)

### Community 20 - "Phase 1 Sprint Plan (F1 tasks)"
Cohesion: 0.19
Nodes (22): Definition of Done, Sprints Planning de la Fase 1, F1-01: Problema, alcance, objetivos e interesados, F1-02: Acta de Constitución, F1-03: Roles, eventos, artefactos y Definition of Done, F1-04: Requisitos funcionales y no funcionales, F1-05: Product Backlog priorizado y estimado, F1-06: Matriz de trazabilidad (+14 more)

### Community 21 - "Backend TS Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 22 - "Desktop TS App Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 23 - "Web TS App Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 24 - "Backend Runtime Deps (NestJS)"
Cohesion: 0.11
Nodes (19): dependencies, bcrypt, class-transformer, class-validator, jwks-rsa, @nestjs/common, @nestjs/core, @nestjs/jwt (+11 more)

### Community 25 - "Mobile TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+10 more)

### Community 26 - "Auth & Accounts Epics"
Cohesion: 0.15
Nodes (19): EP-01: Arquitectura y Inicio usuario, EP-02: Gestion de Cuentas y Usuarios Base, F01.1: Autenticacion de usuarios mediante credenciales (JWT), F01.2: Cifrado y resguardo de contrasenas, F02.1: Registro de usuario e inicio de sesion, HU-01: Registro de Usuario en el Sistema, HU-02: Autenticacion de Usuario (Login JWT), JWT (JSON Web Token) (+11 more)

### Community 27 - "NestJS App Module"
Cohesion: 0.20
Nodes (10): Controller, AppController, AppModule, AppService, Get, Injectable, Module, @nestjs/common (+2 more)

### Community 28 - "HLD Component Architecture"
Cohesion: 0.13
Nodes (17): Aplicación de Escritorio, Aplicación Móvil, Aplicación WEB, Base de Datos, Capa de acceso a Datos, Control Principal, Gestor de Admin. y Reportes, Gestor de Alertas y Emergencias (+9 more)

### Community 29 - "Desktop TS Node Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 30 - "Web TS Node Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 31 - "Shared TS Base Config"
Cohesion: 0.12
Nodes (16): compilerOptions, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib, module (+8 more)

### Community 32 - "Sprint Roadmap & Scrum"
Cohesion: 0.20
Nodes (17): Hoja de ruta del proyecto (Planificación de Sprints), Cohn (2004) User Stories Applied, Criterios para asignar historias a Sprints, Definition of Ready (DoR), Eventos Scrum (Sprint Planning, Daily Scrum, Sprint Review, Retrospectiva), Producto Mínimo Viable (MVP, 8 HU), Rubin (2012) Essential Scrum, Schwaber & Sutherland (2020) La Guía de Scrum (+9 more)

### Community 33 - "Project Charter People & Budget"
Cohesion: 0.23
Nodes (17): F1-09: Selección de tecnologías, Alonso González (Desarrollo web, móvil y BDD), Diego Plaza (Desarrollo Full Stack), EMERGEN (Proyecto), Julio Tapia (Product Owner / Profesor guía), Presupuesto estimado $1.411.050 CLP, Tipos de Emergencia (Urbano, Médico, Adulto Mayor), Resumen de Costos por Responsable (88 h, $1.032.000 CLP) (+9 more)

### Community 34 - "Emergency Contacts Epic"
Cohesion: 0.16
Nodes (17): EP-03: Red de Contactos de Emergencia, F03.1: CRUD de contactos de emergencia, F03.2: Validacion de limites de contactos (min 1, max 5), HU-03: Registrar Contacto de Emergencia, HU-04: Editar y Eliminar Contacto de Emergencia, ROLE_ADMIN, Tabla CONTACTO_EMERGENCIA, CA-03.1: Validacion de formato de numero telefonico (+9 more)

### Community 35 - "SOS & Notifications Epics"
Cohesion: 0.17
Nodes (17): EP-05: Motor de Activacion SOS y Geolocalizacion, EP-06: Motor de Notificaciones y Distribucion de Alertas, F05.1: Boton de activacion de emergencia SOS en App Movil, F05.2: Captura de coordenadas GPS en tiempo real y ultima ubicacion, F06.1: Emision automatizada de alertas a la red de contactos, F06.2: Registro de estado y confirmacion de recepcion de alertas, Fallback a ultima ubicacion conocida (GPS 3s), HU-06: Disparar Alerta de Emergencia SOS (+9 more)

### Community 36 - "Medical Data & Security Epics"
Cohesion: 0.16
Nodes (16): Cifrado AES-256, EP-08: Gestion de Informacion Medica Controlada, EP-10: Seguridad Avanzada, Auditoria y Calidad, F08.1: Registro de ficha medica del usuario, F08.2: Acceso restringido a datos medicos solo en emergencia activa, F10.1: Cifrado AES-256 para datos sensibles, F10.2: Generacion de logs de auditoria del sistema, HU-11: Registrar Ficha de Informacion Medica (+8 more)

### Community 37 - "Charter Stakeholders & Risks"
Cohesion: 0.24
Nodes (16): Acta de Constitución, Duoc UC, Premisas y Restricciones, Riesgos iniciales de alto nivel, Lista de Interesados (Armando Casas, Samuel de Luque, Mario Castañeda), Especificación de Herramientas y Servicios del Proyecto, API Integrada de Alertas, API Integrada de Usuarios (+8 more)

### Community 38 - "Deployment Architecture"
Cohesion: 0.19
Nodes (15): APIs REST BACKEND (Node.js + Nest.js), Aplicación de Escritorio (Ejecutable Electron), Aplicación Móvil (Aplicación de Ionic), Aplicación WEB (PC o Dispositivo Móvil), Aplicaciones, Archivos Estáticos (React / Angular), Auth0 (Autenticación/JWT), Base de Datos SQL (+7 more)

### Community 39 - "Desktop Electron Tooling"
Cohesion: 0.13
Nodes (15): devDependencies, electron, electron-builder, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+7 more)

### Community 40 - "Turborepo Pipeline"
Cohesion: 0.13
Nodes (14): dependsOn, inputs, outputs, dependsOn, cache, persistent, dependsOn, $schema (+6 more)

### Community 41 - "Desktop Admin & Payments"
Cohesion: 0.18
Nodes (15): Aplicación de Escritorio, Electron, jsReport API, PayPal REST API, CRUD de usuarios, apadrinados y datos de compra, RF15: Aplicación de escritorio administra el software, RF16: Venta de cuentas en la aplicación web, RF17: Descuentos por apadrinar cuentas (+7 more)

### Community 42 - "Backend npm Scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 43 - "RACI & Team Roles"
Cohesion: 0.16
Nodes (14): Aplicación Móvil, Aplicación Web, Fase 2: Desarrollo Web, Móvil, Escritorio y QA (Semanas 5–15), Matriz RACI, Especialista en Arquitectura de Software, Especialista en Base de Datos, Especialista en Programación FullStack, Especialista en Metodologías y Documentación (+6 more)

### Community 44 - "Mobile Capacitor Deps"
Cohesion: 0.15
Nodes (13): dependencies, @capacitor/app, @capacitor/core, @capacitor/haptics, @capacitor/keyboard, @capacitor/status-bar, @ionic/react, @ionic/react-router (+5 more)

### Community 45 - "Web Dev Tooling"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/node, @types/react (+5 more)

### Community 46 - "Dependent Users & PIN Epic"
Cohesion: 0.23
Nodes (12): EP-07: Cuentas Vinculadas, Dependientes y PIN, F07.1: Creacion y vinculacion de hasta 5 usuarios dependientes, F07.2: Validacion y gestion de PIN de seguridad de la cuenta principal, HU-09: Crear y Vincular Usuario Dependiente, HU-10: Configurar y Validar PIN de Seguridad, Tabla PIN, CA-09.1: Limite de 5 cuentas dependientes, CA-10.1: PIN de 4 digitos, bloqueo 5 min tras 3 fallos (+4 more)

### Community 47 - "Next.js TS Preset"
Cohesion: 0.18
Nodes (10): compilerOptions, allowJs, jsx, module, moduleResolution, noEmit, plugins, extends (+2 more)

### Community 48 - "Test Plan"
Cohesion: 0.18
Nodes (11): Emergen - Plataforma Multiplataforma de Emergencias, Product Goal, Sprint Review (clase semanal), Criterios de entrada/salida de pruebas, Julio Tapia (Docente), Plan de Pruebas Emergen, Pruebas Funcionales, Pruebas de Integracion (+3 more)

### Community 49 - "Emergency Types Epic"
Cohesion: 0.22
Nodes (10): EP-04: Parametrizacion y Contextos de Emergencia, F04.1: Definicion de tipos de emergencia (Medica, Urbana, General), F04.2: Edicion de mensajes personalizados por defecto, HU-05: Configurar Tipo de Emergencia y Mensaje, Tabla PRIORIDAD, CA-05.1: Mensaje limitado a 160 caracteres, CP-RF12-01: Mensajes segun finalidad, CP-RF4-01: Modificacion de finalidad / tipo de usuario (+2 more)

### Community 50 - "PWA Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 51 - "Web Runtime Deps"
Cohesion: 0.25
Nodes (8): dependencies, axios, @ionic/react, @ionic/react-router, ionicons, react, react-dom, react-router-dom

### Community 52 - "UI TS Config"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, strictNullChecks, exclude, extends, include, @repo/typescript-config/react-library.json

### Community 53 - "Oxlint Rules"
Cohesion: 0.29
Nodes (6): env, node, rules, typescript/no-explicit-any, typescript/no-floating-promises, $schema

### Community 54 - "Backend Build TS Config"
Cohesion: 0.29
Nodes (6): compilerOptions, rootDir, exclude, extends, include, ./tsconfig.json

### Community 55 - "Mobile npm Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test.e2e, test.unit

### Community 56 - "Mobile TS Node Config"
Cohesion: 0.29
Nodes (6): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, include

### Community 57 - "TS Config Package"
Cohesion: 0.29
Nodes (6): license, name, private, publishConfig, access, version

### Community 58 - "Docker Compose Deployment"
Cohesion: 0.33
Nodes (6): 4.4 Docker docker-compose Configuration, db (postgres:15-alpine) Service, workspace (dev_workspace) Service, Docker-based Deployment Strategy for EMERGEN, Node.js Monorepo Workspace Container, PostgreSQL Relational Database Engine

### Community 59 - "Seq: Purchases (Plan/Venta)"
Cohesion: 0.33
Nodes (6): obj_cl_Gestionar_Compras : Clase, obj_c_Gestionar_Compras : Controlador, obj_db_Plan : BD, obj_db_Venta : BD, Soporte : Usuario (actor), obj_v_Gestionar_Compras : Vista

### Community 60 - "Seq: Sponsored Users"
Cohesion: 0.33
Nodes (6): obj_c_Gestionar_Usuario_Apadrinado : Controlador, obj_cl_Gestionar_Usuario_Apadrinado : Clase, obj_db_Plan : BD, obj_db_Usuario : BD, obj_v_Gestionar_Usuario_Apadrinado : Vista, Usuario Principal : Usuario

### Community 61 - "Seq: Purchases (Alerts)"
Cohesion: 0.33
Nodes (6): obj_c_Gestionar_Compras : Controlador, obj_cl_Gestionar_Compras : Clase, obj_db_Alerta : BD, obj_db_Usuarios : BD, obj_v_Gestionar_Compras : Vista, Soporte : Usuario (Actor)

### Community 62 - "Jest Config"
Cohesion: 0.33
Nodes (5): config, { config: tsconfig }, jest, ts-jest, ref_typescript

### Community 63 - "Nest CLI Config"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 64 - "Desktop Runtime Deps"
Cohesion: 0.33
Nodes (6): dependencies, axios, @ionic/react, react, react-dom, react-router-dom

### Community 65 - "Vite Configs"
Cohesion: 0.47
Nodes (3): ref_vite, @vitejs/plugin-legacy, ref_vitejs_plugin_react

### Community 66 - "React Library TS Preset"
Cohesion: 0.33
Nodes (5): compilerOptions, jsx, extends, ./base.json, $schema

### Community 67 - "Design Sprint Deliverables"
Cohesion: 0.47
Nodes (6): F1-07: Arquitectura y componentes, F1-08: Mockups y flujo de emergencia, Diagrama UML, Documento de Arquitectura, Wireframes / Mockups del flujo crítico, Sprint 3: Diseñar la solución y decidir las tecnologías de implementación (24–28 ago 2026)

### Community 68 - "Seq: Manage User (A)"
Cohesion: 0.40
Nodes (5): obj_db_Gestionar_Usuario : BD, obj_cl_Gestionar_Usuario : Clase, obj_c_Gestionar_Usuario : Controlador, Usuario Principal : Usuario, obj_v_Gestionar_Usuario : Vista

### Community 69 - "Seq: Manage User (B)"
Cohesion: 0.40
Nodes (5): obj_c_Gestionar_Usuario : Controlador, obj_cl_Gestionar_Usuario : Clase, obj_db_Gestionar_Usuario : BD, obj_v_Gestionar_Usuario : Vista, Usuario Principal : Usuario

### Community 70 - "Seq: Send Message"
Cohesion: 0.40
Nodes (5): obj_bd_alerta : BD, obj_cl_enviar_mensaje : Clase, obj_c_enviar_mensaje : Controlador, Usuario : Usuario, obj_v_enviar_mensaje : Vista

### Community 71 - "Seq: Generate Alert"
Cohesion: 0.40
Nodes (5): obj_db_Alerta : BD, obj_cl_Generar_Alerta : Clase, obj_c_Generar_Alerta : Controlador, Usuario : Usuario, obj_v_Generar_Alerta : Vista

### Community 72 - "Seq: Emergency Contact"
Cohesion: 0.40
Nodes (5): obj_c_Contacto_Emergencia : Controlador, obj_cl_Contacto_Emergencia : Clase, obj_db_Contacto_Emergencia : BD, obj_v_Contacto_Emergencia : Vista, Usuario : Usuario

### Community 73 - "Seq: Manage Credentials"
Cohesion: 0.40
Nodes (5): obj_c_Gestionar_Credenciales : Controlador, obj_cl_Gestionar_Credenciales : Clase, obj_db_Gestionar_Credenciales : BD, obj_v_Gestionar_Credenciales : Vista, Usuario : Usuario

### Community 74 - "Seq: Emergency Message"
Cohesion: 0.40
Nodes (5): obj_c_Mensaje_Emergencia : Controlador, obj_cl_Mensaje_Emergencia : Clase, obj_db_Mensaje_Emergencia : BD, obj_v_Mensaje_Emergencia : Vista, Usuario : Usuario

### Community 75 - "Seq: Emergency Type"
Cohesion: 0.40
Nodes (5): obj_db_Tipo_Emergencia : BD, obj_cl_Tipo_Emergencia : Clase, obj_c_Tipo_Emergencia : Controlador, Usuario : Usuario, obj_v_Tipo_Emergencia : Vista

### Community 76 - "Seq: Manage Workers"
Cohesion: 0.40
Nodes (5): Administrador : Usuario, obj_db_Usuario : BD, obj_cl_Gestionar_Trabajadores : Clase, obj_c_Gestionar_Trabajadores : Controlador, obj_v_Gestionar_Trabajadores : Vista

### Community 77 - "Seq: PIN"
Cohesion: 0.40
Nodes (5): obj_c_PIN : Controlador, obj_cl_PIN : Clase, obj_db_PIN : BD, obj_v_PIN : Vista, Usuario

### Community 78 - "Seq: Login"
Cohesion: 0.40
Nodes (5): obj_db_Iniciar Sesión : BD, obj_cl_Iniciar Sesión : Clase, obj_c_Iniciar Sesión : Controlador, Usuario : Usuario, obj_v_Iniciar Sesión : Vista

### Community 79 - "Seq: Location"
Cohesion: 0.40
Nodes (5): obj_db_alerta : BD, obj_cl_ubicacion : Clase, obj_c_ubicacion : Controlador, Usuario (Actor), obj_v_ubicacion : Vista

### Community 80 - "Desktop npm Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 81 - "Web npm Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

## Ambiguous Edges - Review These
- `Actor: Usuario Apadrinado` → `Use Case: Gestionar Perfil`  [AMBIGUOUS]
  Fase 2/Evidencias Proyecto/Evidencias de documentación/3.3 Diagrama UML/Caso de Uso/Caso de Uso.png · relation: references
- `USUARIO_SUSCRIPCION` → `DETALLE_VENTA`  [AMBIGUOUS]
  Fase 2/Evidencias Proyecto/Evidencias de documentación/4.1 Diccionario de Datos - Modelo de Dominio/Diagrama ER.png · relation: references
- `USUARIO` → `USUARIO`  [AMBIGUOUS]
  Fase 2/Evidencias Proyecto/Evidencias de documentación/4.1 Diccionario de Datos - Modelo de Dominio/Diagrama ER.png · relation: references
- `MySQL Database (30 normalized tables)` → `PostgreSQL 15`  [AMBIGUOUS]
  Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/README.md · relation: conceptually_related_to
- `Microservices + Monorepo Layered Architecture` → `EMERGEN Monorepo Developer Guide (Evidencias de sistema Aplicación)`  [AMBIGUOUS]
  Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/README.md · relation: conceptually_related_to
- `Presupuesto estimado $1.411.050 CLP` → `Resumen Financiero: presupuesto total $1.496.400 CLP`  [AMBIGUOUS]
  graphify-out/converted/Informe TEC_8faa1e0c.md · relation: conceptually_related_to
- `Premisas y Restricciones` → `MySQL (30 tablas normalizadas)`  [AMBIGUOUS]
  graphify-out/converted/Acta de constitución_3d7db4ee.md · relation: conceptually_related_to
- `Premisas y Restricciones` → `TypeScript`  [AMBIGUOUS]
  graphify-out/converted/Acta de constitución_3d7db4ee.md · relation: conceptually_related_to
- `HU-05: Seleccionar tipo de emergencia y personalizar mensaje` → `HU-11: Ingresar ficha de datos de salud`  [AMBIGUOUS]
  graphify-out/converted/Historias Usuario con instructivo_fa506d1a.md · relation: conceptually_related_to
- `Producto Mínimo Viable (MVP, 8 HU)` → `Sprint 4: Dejar preparada y verificable la línea base para iniciar la Fase 2 (31 ago–14 sep 2026)`  [AMBIGUOUS]
  graphify-out/converted/1.2.1 Hoja de ruta del proyecto_bee4036b.md · relation: conceptually_related_to
- `TD-12 (sin definir)` → `Fase 1 Sprint 4: Preparar el inicio de la construccion`  [AMBIGUOUS]
  graphify-out/converted/2.1.1 PRODUCT BACKLOG_b8d86969.md · relation: references
- `F04.1: Definicion de tipos de emergencia (Medica, Urbana, General)` → `Tabla PRIORIDAD`  [AMBIGUOUS]
  graphify-out/converted/BDD con tipos de datos_eaa966f5.md · relation: shares_data_with
- `HU-09: Crear y Vincular Usuario Dependiente` → `HU-10: Configurar y Validar PIN de Seguridad`  [AMBIGUOUS]
  graphify-out/converted/2.1.1 PRODUCT BACKLOG_b8d86969.md · relation: references
- `HU-11: Registrar Ficha de Informacion Medica` → `Modelo de Datos / Diccionario (BDD con tipos de datos)`  [AMBIGUOUS]
  graphify-out/converted/BDD con tipos de datos_eaa966f5.md · relation: references
- `EMERGEN (aplicativo de seguridad / alerta de emergencias)` → `Rol Product Owner`  [AMBIGUOUS]
  graphify-out/converted/1.5_GuiaEstudiante_Fase 1_Definicion Proyecto APT_65aca024.md · relation: conceptually_related_to
- `Diego Plaza (Dev team; FullStack, Arquitectura, Documentacion)` → `Por fortalecer: documentacion de proyectos y calidad de software (pruebas, validaciones)`  [AMBIGUOUS]
  graphify-out/converted/1.5_GuiaEstudiante_Fase 1_Definicion Proyecto APT_65aca024.md · relation: conceptually_related_to
- `Actividad: Testing QA, confeccion y ejecucion de pruebas` → `Por fortalecer: documentacion de proyectos y calidad de software (pruebas, validaciones)`  [AMBIGUOUS]
  graphify-out/converted/1.5_GuiaEstudiante_Fase 1_Definicion Proyecto APT_65aca024.md · relation: conceptually_related_to

## Knowledge Gaps
- **645 isolated node(s):** `$schema`, `typescript/no-explicit-any`, `typescript/no-floating-promises`, `node`, `{ config: tsconfig }` (+640 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 674 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Actor: Usuario Apadrinado` and `Use Case: Gestionar Perfil`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `USUARIO_SUSCRIPCION` and `DETALLE_VENTA`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `USUARIO` and `USUARIO`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `MySQL Database (30 normalized tables)` and `PostgreSQL 15`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Microservices + Monorepo Layered Architecture` and `EMERGEN Monorepo Developer Guide (Evidencias de sistema Aplicación)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Presupuesto estimado $1.411.050 CLP` and `Resumen Financiero: presupuesto total $1.496.400 CLP`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Premisas y Restricciones` and `MySQL (30 tablas normalizadas)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._