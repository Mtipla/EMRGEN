# Graph Report - EMRGEN  (2026-10-20)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2341 nodes · 3961 edges · 150 communities (120 shown, 30 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 315 edges (avg confidence: 0.85)
- Token cost: 72,120 input · 3,203 output

## Graph Freshness
- Built from commit: `1139f626`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Guia Estudiante Fase 1: Definicion Proyecto APT (EMERGEN)
- backend Service (nestjs_emergen_backend)
- App Bootstrap
- eslint-config/package.json
- Alonso Fabian Gonzalez Jara
- backend/package.json
- Matriz RACI
- Matriz de trazabilidad de Pruebas
- mobile/package.json
- index.d.ts
- Product Backlog Sprint
- Scrum Framework Methodology
- BDD con tipos de datos
- google-maps.service.ts
- init.sql
- mindicador.service.ts
- LoginService
- TD-04: Especificar requisitos funcionales y no funcionales
- USUARIO
- Team Workflow Guide (Claude Code + Graphify + Git)
- firebase-auth.guard.ts
- EMERGEN: integración de APIs externas
- DevDeps Backend NestJS
- Purchase Constants
- desktop/package.json
- index.ts
- web/package.json
- Sistema EMERGEN (system boundary)
- AdminService
- WhatsappController
- Historias de Usuario con Criterios de Aceptación
- Reporte de Auditoría de Errores (datos_agrupados_trazable)
- integrations.live.e2e-spec.ts
- google-maps.ts
- User Management
- devDependencies
- dependencies
- Payment Processing API
- compilerOptions
- whatsapp.controller.ts
- compilerOptions
- compilerOptions
- emergen-api.ts
- Project Governance Requirements
- Cambios Realizados
- send-emergency-alert.dto.ts
- Diagrama de Componentes
- whatsapp-alert.service.ts
- WhatsappConnectionService
- compilerOptions
- whatsapp-connection.service.ts
- Indicator Query API
- tasks
- compilerOptions
- compilerOptions
- compilerOptions
- Product Backlog del Proyecto Emergen
- Sprint 3: Diseñar la solución y decidir las tecnologías de implementación (24–28 ago 2026)
- @nestjs/common
- devDependencies
- dependencies
- Technical Audit Report
- Diagrama de Arquitectura
- api-client/package.json
- scripts
- Infrastructure Architecture
- Evidencias de sistema Aplicación/package.json
- ui/package.json
- Purchase Payment Testing
- Sprint Backlog con estimación de horas (88 h)
- Account Linking Testing
- BaileysLoggerAdapter
- devDependencies
- Especificación de Herramientas y Servicios del Proyecto (4.2)
- http.ts
- Premium Checkout Flow
- compilerOptions
- Security Testing
- Trello Sprint Board Screenshot (Fase 1)
- Sprint 4 (31/8/2026)
- Emergency Alert DTOs
- dependencies
- 2.1.1 Product Backlog
- Informe ERS
- firebase-auth.service.ts
- dependencies
- manifest.json
- api-client/tsconfig.json
- jest.config.ts
- ui/tsconfig.json
- .oxlintrc.json
- tsconfig.build.json
- ref_vite
- scripts
- compilerOptions
- WhatsApp Notifications
- api-types/package.json
- typescript-config/package.json
- HU-01: Registro de usuarios (Nest.js /Registro, encriptación, UI React+Ionic)
- obj_cl_Gestionar_Compras : Clase
- obj_cl_Gestionar_Usuario_Apadrinado : Clase
- obj_cl_Gestionar_Compras : Clase
- nest-cli.json
- react-library.json
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
- RF13: Ubicación en emergencia
- Data Separation Testing
- RNF6-RNF10 (latencia SOS, tolerancia a fallos, Ley 21.719, retención, WCAG 2.1 AA)
- Informe Técnico de Recursos (TEC)
- HU-11: Cifrado AES-256 de datos médicos
- RF6: Mínimo un contacto de emergencia
- RF7: Máximo cinco contactos
- RF8: Máximo cinco apadrinados
- CLAUDE.md
- Desktop App React + TypeScript + Vite Template README
- desktop/tsconfig.json
- cypress.config.ts
- web/tsconfig.json
- db (postgres:15-alpine) Service
- Backend NestJS Starter README
- @testing-library/jest-dom
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
- Automatizacion

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 58 edges
2. `Product Backlog del Proyecto Emergen` - 44 edges
3. `Tabla Maestra de Product Backlog` - 39 edges
4. `Matriz de trazabilidad de Pruebas` - 39 edges
5. `Acta de Constitución EMERGEN` - 37 edges
6. `BDD con tipos de datos` - 34 edges
7. `Diagrama ER Actualizado (EMRGEN)` - 31 edges
8. `WhatsappConnectionService` - 30 edges
9. `Matriz RACI` - 27 edges
10. `Usuario` - 24 edges

## Surprising Connections (you probably didn't know these)
- `AUDIT-P05 Seguridad de ventana Electron` --references--> `electron`  [INFERRED]
  graphify-out/converted/Cambios Pendientes_3bad4c54.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/apps/desktop/package.json
- `TH-13.1 Panel admin y empaquetado Electron` --references--> `electron`  [INFERRED]
  graphify-out/converted/Horas hombre en relación a Tareas_c7bcb968.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/apps/desktop/package.json
- `Twilio` --semantically_similar_to--> `WhatsApp (Baileys) Emergency Notifications`  [INFERRED] [semantically similar]
  README.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/readme-apis.md
- `5.1 Para qué sirve` --references--> `MapView()`  [INFERRED]
  Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/readme-apis.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/packages/ui/src/map-view.tsx
- `Especificación de Herramientas y Servicios del Proyecto (4.2)` --references--> `typeorm`  [EXTRACTED]
  graphify-out/converted/Especificación de Herramientas y Servicios del Proyecto_55e759a4.md → Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/apps/backend/package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Stack técnico EMERGEN (TypeScript, NestJS, React/Ionic, Capacitor, Electron, Turborepo, PostgreSQL, Docker)** — fase_2_evidencias_proyecto_evidencias_de_sistema_aplicación_apps_web_package_json_ref_typescript, graphify_out_converted_especificaci_n_de_herramientas_y_servicios_del_proyecto_55e759a4_nestjs, graphify_out_converted_cambios_realizados_5790297f_react_ionic, graphify_out_converted_especificaci_n_de_herramientas_y_servicios_del_proyecto_55e759a4_capacitor, ref_electron, graphify_out_converted_cambios_realizados_5790297f_turborepo, graphify_out_converted_cambios_realizados__auditoria_claude__838a87ca_postgresql, graphify_out_converted_especificaci_n_de_herramientas_y_servicios_del_proyecto_55e759a4_docker_desktop [EXTRACTED 0.95]
- **Alineación del alcance RF14 / I-08 entre Visión, Acta y ERS** — graphify_out_converted_cambios_realizados__auditoria_claude__838a87ca_hallazgo_i_08, graphify_out_converted_cambios_realizados__auditoria_claude__838a87ca_rf14_numeros_oficiales, graphify_out_converted_informe_ers_e14e1806_rf14, graphify_out_converted_cambios_pendientes_3bad4c54_alcance_rf14, graphify_out_converted_cambios_realizados__auditoria_claude__838a87ca_vision_producto [EXTRACTED 0.95]
- **Modelo de datos de alertas** — graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_alerta, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_ubicacion_alerta, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_detalle_alerta, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_historial_alerta [EXTRACTED 1.00]
- **Six self-rated profile competencies shared by both team members** — graphify_out_converted_gonzalez_alonso_1_1_apt122_autoevaluacioncompetenciasfase1_011da5b8_arquitectura_de_software, graphify_out_converted_gonzalez_alonso_1_1_apt122_autoevaluacioncompetenciasfase1_011da5b8_diseno_aplicaciones_web, graphify_out_converted_gonzalez_alonso_1_1_apt122_autoevaluacioncompetenciasfase1_011da5b8_diseno_aplicaciones_moviles, graphify_out_converted_gonzalez_alonso_1_1_apt122_autoevaluacioncompetenciasfase1_011da5b8_diseno_aplicaciones_escritorio, graphify_out_converted_gonzalez_alonso_1_1_apt122_autoevaluacioncompetenciasfase1_011da5b8_base_de_datos, graphify_out_converted_gonzalez_alonso_1_1_apt122_autoevaluacioncompetenciasfase1_011da5b8_documentacion [EXTRACTED 1.00]
- **RA1 Achievement Indicators (IL 1.1-1.5) of the Phase 1 APT rubric** — graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_ra1_propuesta_proyecto, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_il_1_1_fundamentacion, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_il_1_2_objetivos_metodologia, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_il_1_3_plan_trabajo_evidencias, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_il_1_4_aspectos_formales, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_il_1_5_indicadores_calidad [EXTRACTED 1.00]
- **Graduate-profile competencies with disciplinary quality indicators** — graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_competencia_pruebas_certificacion, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_competencia_gestionar_proyectos, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_competencia_modelos_de_datos, graphify_out_converted_gonzalez_alonso_1_3_apt122_autoevaluaci_nfase1_87e9dd67_competencia_solucion_software [EXTRACTED 1.00]
- **RA1 Indicadores de Logro IL 1.1-1.5 (rubrica Fase 1)** — graphify_out_converted_1_4_apt122_formativafase1_decb3081_ra1, graphify_out_converted_1_4_apt122_formativafase1_decb3081_il_1_1, graphify_out_converted_diego_plaza_1_3_apt122_autoevaluaci_nfase1_389fe0e5_il_1_2, graphify_out_converted_diego_plaza_1_3_apt122_autoevaluaci_nfase1_389fe0e5_il_1_3, graphify_out_converted_diego_plaza_1_3_apt122_autoevaluaci_nfase1_389fe0e5_il_1_4, graphify_out_converted_1_4_apt122_formativafase1_decb3081_il_1_5 [EXTRACTED 1.00]
- **Auditoría documental ERR/AUDIT y verificación cruzada** — graphify_out_converted_datos_agrupados_trazable_e88c0e2d_reporte_auditoria_errores, graphify_out_converted_matriz_de_verificaci_n_cruzada_a9560c86_matriz_verificacion_cruzada, graphify_out_converted_datos_agrupados_trazable_e88c0e2d_cambios_realizados_auditoria_claude, graphify_out_converted_datos_agrupados_trazable_e88c0e2d_cambios_pendientes, graphify_out_converted_datos_agrupados_trazable_e88c0e2d_convencion_trazabilidad_err_audit [EXTRACTED 1.00]
- **Clientes frontend consumen la interfaz del Control Principal** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_aplicacion_web, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_aplicacion_movil, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_aplicacion_de_escritorio, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_control_principal [EXTRACTED 1.00]
- **EMERGEN Docker Backend + DB Stack** — fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_db_service, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_backend_service, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_emergen_network, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_emergen_postgres_data, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_init_sql [EXTRACTED 1.00]
- **Docker Compose Stack (db + backend + volumes)** — fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_db, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_backend, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_emergen_postgres_data, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_docker_compose_emergen_whatsapp_auth, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_init_sql [EXTRACTED 1.00]
- **Emergency Alert Notification Flow** — fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_apis_alertasservice, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_apis_whatsappalertservice, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_bdd_contacto_emergencia_table, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_bdd_usuario_mensaje_personalizado_table, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_apis_hu_08_emergency_alert [EXTRACTED 1.00]
- **EMERGEN solucion multiplataforma (web, escritorio, movil, BD)** — graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_emergen, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_aplicacion_web, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_aplicacion_de_escritorio, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_aplicacion_movil, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_base_de_datos [EXTRACTED 1.00]
- **Marco SCRUM de EMERGEN (roles, artefactos, eventos)** — graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_metodologia_scrum, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_sprint, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_product_backlog, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_sprint_backlog, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_incremento_de_software, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_rol_product_owner, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_rol_scrum_master, graphify_out_converted_1_5_guiaestudiante_fase_1_definicion_proyecto_apt_65aca024_rol_equipo_de_desarrollo [EXTRACTED 1.00]
- **Flujo de alerta de emergencia** — graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_usuario, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_alerta, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_detalle_alerta, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_ubicacion_alerta, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_historial_alerta, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_antecedente_medico, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_usuario_mensaje_personalizado [EXTRACTED 1.00]
- **Flujo de venta de planes** — graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_venta, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_detalle_venta, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_plan, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_metodo_pago, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_estado_pago, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_usuario [EXTRACTED 1.00]
- **Sprints de documentación Fase 1** — graphify_out_converted_1_2_2_sprint_fase1_65e58cac_sprint_1, graphify_out_converted_1_2_2_sprint_fase1_65e58cac_sprint_2, graphify_out_converted_1_2_2_sprint_fase1_65e58cac_sprint_3, graphify_out_converted_1_2_2_sprint_fase1_65e58cac_sprint_4 [EXTRACTED 1.00]
- **Clientes multiplataforma consumen API REST** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_aplicacion_web, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_aplicacion_movil, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_aplicacion_escritorio, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_apis_rest_backend [EXTRACTED 1.00]
- **Compra de planes con conversion de divisas** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_apis_rest_backend, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_mindicador, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_4_3_arquitectura_diagrama_de_arquitectura_paypal [EXTRACTED 1.00]
- **Flujo de alertas: gestor de alertas con mensajería y geolocalización** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_control_principal, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_gestor_de_alertas_y_emergencias, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_servicio_mensajeria, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_servicio_geolocalizacion [EXTRACTED 1.00]
- **Flujo comercial: pagos y conversión de divisas** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_gestor_comercial, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_pasarela_de_pago, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_3_3_diagrama_uml_diagrama_de_componentes_diagrama_de_componentes_servicio_conversion_de_divisas [EXTRACTED 1.00]
- **Graphify Shared-Graph Git Workflow** — contributing_graphify_branch, contributing_main_branch, contributing_individual_branches, contributing_graph_update_procedure, contributing_graph_json_merge_driver, contributing_graphify_skip_hook [EXTRACTED 1.00]
- **Graphify shared-graph branch workflow** — contributing_graphify_branch, contributing_shared_graph_graphify_out, contributing_graphify_update_procedure, contributing_graph_json_merge_driver, contributing_graphify_skip_hook [EXTRACTED 1.00]
- **Scrum sprint lifecycle in Fase 1 (sprints, dailies, closure)** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_1__sprint_1, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_1__daily_sprints, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_1__sprint_review_retrospective, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_1__sprint_2, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_1__sprint_3 [EXTRACTED 1.00]
- **Flujo de contacto y soporte** — graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_mensaje_contacto, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_respuesta_contacto, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_tipo_contacto, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_estado_contacto, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_soporte, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_categoria_soporte, graphify_out_converted_bdd_con_tipos_de_datos_eaa966f5_table_estado_ticket [INFERRED 0.75]
- **Flujo de despacho de alertas (HU-08, CA-08.1, Servicio Mensajería, AUDIT-P01)** — graphify_out_converted_cambios_realizados_5790297f_hu_08, graphify_out_converted_cambios_realizados_5790297f_ca_08_1, graphify_out_converted_especificaci_n_de_herramientas_y_servicios_del_proyecto_55e759a4_servicio_mensajeria_whatsapp, graphify_out_converted_cambios_pendientes_3bad4c54_audit_p01, graphify_out_converted_horas_hombre_en_relaci_n_a_tareas_c7bcb968_th_8_1 [INFERRED 0.85]
- **Cadena de trazabilidad HU -> Requisito -> Caso de prueba -> Plan de pruebas** — graphify_out_converted_sprint_backlog_actividades_horas_8a7c50c3_sprint_backlog, graphify_out_converted_acta_de_constituci_n_3d7db4ee_rf1, graphify_out_converted_matriz_de_trazabilidad_de_pruebas_1d0421cd_cp_rf1_01, graphify_out_converted_matriz_de_trazabilidad_de_pruebas_1d0421cd_matriz_trazabilidad_pruebas, graphify_out_converted_plan_de_pruebas_3e777254_plan_de_pruebas [INFERRED 0.85]
- **Plan Payment and CLP Pricing** — fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_apis_paypal_integration, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_apis_mindicador, fase_2_evidencias_proyecto_evidencias_de_sistema_aplicaci_n_readme_apis_api_client_package [INFERRED 0.85]
- **Flujo MVP de alerta SOS geolocalizada** — graphify_out_converted_2_1_1_product_backlog_b8d86969_hu_03, graphify_out_converted_2_1_1_product_backlog_b8d86969_hu_05, graphify_out_converted_cambios_realizados_5790297f_hu_06, graphify_out_converted_2_1_1_product_backlog_b8d86969_hu_07, graphify_out_converted_cambios_realizados_5790297f_hu_08 [INFERRED 0.85]
- **Reglas de límite de contactos/apadrinados** — graphify_out_converted_sprint_backlog_actividades_horas_8a7c50c3_regla_max_5_contactos, graphify_out_converted_sprint_backlog_actividades_horas_8a7c50c3_regla_min_1_contacto, graphify_out_converted_sprint_backlog_actividades_horas_8a7c50c3_regla_max_5_secundarios, graphify_out_converted_matriz_de_trazabilidad_de_pruebas_1d0421cd_rf6, graphify_out_converted_matriz_de_trazabilidad_de_pruebas_1d0421cd_rf7, graphify_out_converted_matriz_de_trazabilidad_de_pruebas_1d0421cd_rf8 [INFERRED 0.85]
- **Sprint 4 Scrum cycle (planning, dailies, closure)** — fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_2__sprint_4, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_2__daily_sprint_4, fase_2_evidencias_proyecto_evidencias_de_documentaci_n_1_2_sprint_planning_evidencias_de_sprints_daily_sprints_fase_1__captura_2__cierre_sprint_4 [INFERRED 0.85]

## Communities (150 total, 30 thin omitted)

### Community 0 - "Guia Estudiante Fase 1: Definicion Proyecto APT (EMERGEN)"
Cohesion: 0.05
Nodes (75): Formativa Definicion Proyecto APT (Evaluacion Fase 1), Competencia: Construir modelos de datos escalables, Competencia: Desarrollar solucion de software sistematizada, Competencia: Gestionar proyectos informaticos, Competencia: Realizar pruebas de certificacion de productos y procesos, Formato informe tecnico (portada, indice, abstract, desarrollo, conclusiones, reflexiones; Arial/Verdana/Calibri 11-12), Heteroevaluacion formativa en equipos de 2-3, semana 2, 40 minutos, 0% ponderacion, IL 1.1 Fundamenta el Proyecto APT (intereses, competencias, factibilidad, relevancia) (+67 more)

### Community 1 - "backend Service (nestjs_emergen_backend)"
Cohesion: 0.06
Nodes (54): No-secrets policy (.env, MySQL, PayPal, Twilio, Google Maps credentials), backend Service (evidence copy, without WhatsApp), db Service (postgres:15-alpine, evidence copy), EMERGEN Monorepo Dev Guide (Docker evidence copy), EMERGEN docker-compose Configuration, backend Service (nestjs_emergen_backend), backend Service (nestjs_emergen_backend, 3001->3000), db Service (postgres:15-alpine) (+46 more)

### Community 2 - "App Bootstrap"
Cohesion: 0.06
Nodes (17): App(), App(), ContainerProps, ExploreContainer(), container, root, Home(), App() (+9 more)

### Community 3 - "eslint-config/package.json"
Cohesion: 0.07
Nodes (30): config, nextJsConfig, devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-only-warn, eslint-plugin-react-hooks (+22 more)

### Community 4 - "Alonso Fabian Gonzalez Jara"
Cohesion: 0.06
Nodes (40): Alonso Fabian Gonzalez Jara, Competencia: Arquitectura de Software, Autoevaluacion de Competencias Fase 1 (Alonso Gonzalez), Competencia: Base de Datos, Competencia: Diseno de Aplicaciones Escritorio, Competencia: Diseno de Aplicaciones Moviles, Competencia: Diseno de Aplicaciones Web, Competencia: Documentacion (+32 more)

### Community 5 - "backend/package.json"
Cohesion: 0.05
Nodes (36): author, description, prettier, @repo/api-types, @types/node, typescript, license, name (+28 more)

### Community 6 - "Matriz RACI"
Cohesion: 0.10
Nodes (39): Rol Product Owner, [ERR-10] Errores de pruebas y trazabilidad (QA), Actividad RACI: Definición de Requisitos Funcionales/No Funcionales, Actividad RACI: Desarrollo Aplicación de Escritorio, Actividad RACI: Desarrollo de Aplicación Móvil, Actividad RACI: Desarrollo de Aplicación Web, Actividad RACI: Diseño y Definición de Software/Herramientas, Actividad RACI: Documentación Inicial, Definición del Proyecto y Metodología (+31 more)

### Community 7 - "Matriz de trazabilidad de Pruebas"
Cohesion: 0.05
Nodes (37): RF3: Modificar credenciales, Clasificación de alcance MVP/Post-MVP/Condicionado/Futuro/Aclarar, Caso de prueba CP-RF12-01, Caso de prueba CP-RF14-01, Caso de prueba CP-RF17-01, Caso de prueba CP-RF18-01, Caso de prueba CP-RF20-01, Caso de prueba CP-RF21-01 (+29 more)

### Community 8 - "mobile/package.json"
Cohesion: 0.05
Nodes (36): description, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, @ionic/react-router (+28 more)

### Community 9 - "index.d.ts"
Cohesion: 0.13
Nodes (5): CreatePaypalOrderDto, PaypalController, PaypalService, CreatePaypalOrderRequest, PaypalOrderResponse

### Community 10 - "Product Backlog Sprint"
Cohesion: 0.09
Nodes (44): Trabajo en paralelo HU-04 y HU-05, Sprint 6 (28 sep-9 oct 2026): Autenticación JWT, Cifrado AES-256 de datos sensibles, HU-01: Registro de Usuario en el Sistema, HU-02: Autenticación de Usuario (Login JWT), HU-03: Registrar Contacto de Emergencia, HU-04: Editar y Eliminar Contacto de Emergencia, HU-05: Configurar Tipo de Emergencia y Mensaje (+36 more)

### Community 11 - "Scrum Framework Methodology"
Cohesion: 0.12
Nodes (23): Hoja de ruta del proyecto, Historias de alto riesgo HU-07/HU-08, Rubin (2012) Essential Scrum, Eventos Scrum (Planning, Review, Retrospectiva, Daily), Consumo de APIs externas, Cohn (2004) User Stories Applied, HU-07: Obtener y Adjuntar Geolocalización GPS, HU-12: Visualización Restringida de Datos Médicos en Emergencia (+15 more)

### Community 12 - "BDD con tipos de datos"
Cohesion: 0.18
Nodes (34): Diagrama ER Actualizado (EMRGEN), BDD con tipos de datos, Propuesta de mejora (BODEGA, STOCK, ENVIO, PRODUCTO, SIMS), Tabla ACCESO_APLICACION, Tabla ALERTA, Tabla ANTECEDENTE_MEDICO, Tabla APLICACION, Tabla BITACORA_SISTEMA (+26 more)

### Community 13 - "google-maps.service.ts"
Cohesion: 0.12
Nodes (8): GeocodeQueryDto, ReverseGeocodeQueryDto, GoogleMapsController, GoogleMapsModule, GoogleMapsService, GeocodeResult, class-transformer, class-validator

### Community 14 - "init.sql"
Cohesion: 0.11
Nodes (33): ACCESO_APLICACION, ALERTA, APLICACION, BITACORA_SISTEMA, CATEGORIA_SOPORTE, CONTACTO_EMERGENCIA, DETALLE_ALERTA, DETALLE_VENTA (+25 more)

### Community 15 - "mindicador.service.ts"
Cohesion: 0.11
Nodes (10): ExternalRequestInit, logger, requestExternal(), requestExternalJson(), JsreportController, JsreportModule, InlineReportTemplate, JsreportService (+2 more)

### Community 17 - "TD-04: Especificar requisitos funcionales y no funcionales"
Cohesion: 0.09
Nodes (31): Sprints Planning de la Fase 1, F1-01: Problema, alcance, objetivos e interesados, F1-02: Acta de Constitución, F1-03: Roles, eventos, artefactos y Definition of Done, F1-10: Repositorio y entorno base, F1-11: Modelo de datos y diccionario inicial, Sprint 1 (10-14 ago 2026): Definir proyecto y marco Scrum, Sprint 4 (31 ago-14 sep 2026): Línea base para Fase 2 (+23 more)

### Community 18 - "USUARIO"
Cohesion: 0.08
Nodes (30): ACCESO_APLICACION, ALERTA, APLICACION, BITACORA_SISTEMA, CATEGORIA_SOPORTE, CONTACTO_EMERGENCIA, DETALLE_ALERTA, DETALLE_VENTA (+22 more)

### Community 19 - "Team Workflow Guide (Claude Code + Graphify + Git)"
Cohesion: 0.14
Nodes (21): CONTRIBUTING.md, graphify-out Knowledge Graph, Graphify Usage Rules, Branch Architecture (main, graphify, alonso, diego, gabriel), GitHub branch protection rules, Claude Code, CLAUDE.md graphify section and PreToolUse hook, Conventional Commits message format (+13 more)

### Community 20 - "firebase-auth.guard.ts"
Cohesion: 0.11
Nodes (12): requireEnv(), FirebaseAuthController, FirebaseAuthGuard, FirebaseRequest, FirebaseAuthModule, FirebaseAuthService, FirebaseTokenPayload, attacker (+4 more)

### Community 21 - "EMERGEN: integración de APIs externas"
Cohesion: 0.06
Nodes (30): 1.1 Crear o completar el `.env`, 1.2 Referencia de variables, 1.3 Aplicar los cambios, 1. Configurar las variables de entorno, 2.2 Obtener las credenciales, 2.3 Endpoints, 2.4 Ejemplos, 2. PayPal REST API (+22 more)

### Community 22 - "DevDeps Backend NestJS"
Cohesion: 0.08
Nodes (25): devDependencies, jest, @nestjs/cli, @nestjs/mau, @nestjs/schematics, @nestjs/testing, oxlint, oxlint-tsgolint (+17 more)

### Community 23 - "Purchase Constants"
Cohesion: 0.08
Nodes (15): clpAUsd(), ESTADO_PAGO, MAX_APADRINADOS, METODO_PAGO_PAYPAL, MONEDA_PAYPAL, nombreEstado(), PLAN_CUENTA_APADRINADA, ComprasService (+7 more)

### Community 24 - "desktop/package.json"
Cohesion: 0.08
Nodes (24): axios, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, react (+16 more)

### Community 25 - "index.ts"
Cohesion: 0.09
Nodes (23): api, env, firebase, firebaseAuth, api, env, firebase, firebaseAuth (+15 more)

### Community 26 - "web/package.json"
Cohesion: 0.08
Nodes (24): axios, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @ionic/react, @ionic/react-router (+16 more)

### Community 27 - "Sistema EMERGEN (system boundary)"
Cohesion: 0.12
Nodes (24): Actor: Administrador, Use Case: Aumentar Usuarios Apadrinados, Actor: Contacto de Emergencia, Use Case: Crear PIN Usuario Apadrinado, Use Case: Enviar Mensaje Personalizado, Use Case: Enviar Ubicacion, Use Case: Generar Alerta, Use Case: Gestionar Compras (+16 more)

### Community 28 - "AdminService"
Cohesion: 0.08
Nodes (5): AdminController, AdminService, ActualizarEstadoDto, BitacoraSistema, PlanUsuario

### Community 29 - "WhatsappController"
Cohesion: 0.17
Nodes (3): WhatsappController, WhatsappPairingCodeResponse, WhatsappStatusResponse

### Community 30 - "Historias de Usuario con Criterios de Aceptación"
Cohesion: 0.12
Nodes (41): Product Backlog del Proyecto Emergen, Emergen (plataforma multiplataforma de emergencias), Product Goal, TD-12 (referenciado en tabla Sprint 4, no definido), Verheyen (2019) Scrum: A Pocket Guide, Historias de Usuario con Criterios de Aceptación, CRUD de usuarios, apadrinados y datos de compra, Validación de mensaje vacío y límite de caracteres (+33 more)

### Community 31 - "Reporte de Auditoría de Errores (datos_agrupados_trazable)"
Cohesion: 0.11
Nodes (21): Cambios Pendientes (AUDIT-P01 a P13), Bitácora Cambios Realizados (AUDITORIA CLAUDE, 208 acciones), [ERR-01] Errores de tipeo, [ERR-02] Poca especificación en el texto, [ERR-03] Falta de información legal, [ERR-04] Errores de antecedentes médicos, [ERR-05] Errores técnicos, [ERR-07] Errores de APIs (+13 more)

### Community 33 - "google-maps.ts"
Cohesion: 0.18
Nodes (16): GeocodeApiResponse, addMarker(), createMap(), CreateMapOptions, GoogleMap, GoogleMapsNamespace, GoogleMarker, loadGoogleMaps() (+8 more)

### Community 34 - "User Management"
Cohesion: 0.13
Nodes (4): UsuariosController, Usuario, UsuariosService, @nestjs/typeorm

### Community 35 - "devDependencies"
Cohesion: 0.09
Nodes (22): devDependencies, @capacitor/cli, cypress, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+14 more)

### Community 36 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, bcrypt, class-transformer, class-validator, jsonwebtoken, jwks-rsa, @nestjs/common, @nestjs/core (+13 more)

### Community 37 - "Payment Processing API"
Cohesion: 0.18
Nodes (3): ComprasController, CrearOrdenCompraDto, UsuarioSesion

### Community 38 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 39 - "whatsapp.controller.ts"
Cohesion: 0.09
Nodes (15): ActualizarMiUsuarioDto, CrearUsuarioDto, LoginDto, JwtAuthGuard, SolicitudAutenticada, LoginModule, HASH_FICTICIO, UsuarioPublico (+7 more)

### Community 40 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 42 - "emergen-api.ts"
Cohesion: 0.14
Nodes (14): EmergenApi, loadScript(), pending, loadPaypalSdk(), PaypalButtons, PaypalButtonsOptions, PaypalNamespace, renderPaypalButtons() (+6 more)

### Community 43 - "Project Governance Requirements"
Cohesion: 0.12
Nodes (21): HU-13: Panel de Administración de Usuarios (Web/Desktop), ROLE_ADMIN, Acta de Constitución EMERGEN, Duoc UC, Tipos de emergencia (Urbano, Emergencia, Médico, Adulto Mayor), Hito N°2 (20-11-2026), Hito N°3 (04-12-2026), Modelo de calidad ISO/IEC 25010 (+13 more)

### Community 44 - "Cambios Realizados"
Cohesion: 0.14
Nodes (16): AUDIT-P05 Seguridad de ventana Electron, React 19 + Ionic React, Informe TEC (1.6), Capacitor, Horas hombre en relación a Tareas, Resumen de Costos por Responsable, TH-11.1 Cifrado AES-256 de datos médicos, TH-13.1 Panel admin y empaquetado Electron (+8 more)

### Community 45 - "send-emergency-alert.dto.ts"
Cohesion: 0.15
Nodes (6): EmergencyAlertLocationDto, EmergencyAlertMedicalInfoDto, SendEmergencyAlertDto, MAX_RECIPIENTS, EmergencyAlertLocation, EmergencyAlertMedicalInfo

### Community 46 - "Diagrama de Componentes"
Cohesion: 0.27
Nodes (19): Aplicación de Escritorio, Aplicación Móvil, Aplicación WEB, Backend (capa), Base de Datos, Capa de acceso a Datos, Control Principal, Diagrama de Componentes (+11 more)

### Community 47 - "whatsapp-alert.service.ts"
Cohesion: 0.14
Nodes (16): buildEmergencyAlertText(), buildLocationMessage(), googleMapsLink(), location, maskPhoneNumber(), normalizePhoneNumber(), toUserJid(), sleep() (+8 more)

### Community 48 - "WhatsappConnectionService"
Cohesion: 0.22
Nodes (3): errorMessage(), WhatsappConnectionService, WhatsappConnectionState

### Community 49 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+10 more)

### Community 50 - "whatsapp-connection.service.ts"
Cohesion: 0.15
Nodes (12): readEnv(), BaileysLib, loadBaileys(), MultiFileAuthStateStore, WhatsappAuthState, WhatsappAuthStateStore, statusCodeOf(), defaultCountryCode() (+4 more)

### Community 51 - "Indicator Query API"
Cohesion: 0.14
Nodes (9): INDICATOR_CODES, IndicatorParamDto, IndicatorQueryDto, MindicadorController, MindicadorDaily, MindicadorSerie, MindicadorService, EconomicIndicator (+1 more)

### Community 52 - "tasks"
Cohesion: 0.11
Nodes (17): dependsOn, inputs, outputs, dependsOn, cache, persistent, dependsOn, $schema (+9 more)

### Community 53 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 54 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 55 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib, module (+8 more)

### Community 56 - "Product Backlog del Proyecto Emergen"
Cohesion: 0.15
Nodes (14): Alcance de RF14 (notificación automática vs números oficiales), Alonso González, AUDIT-P07 Perfil qa, CI, hosting y respaldo Fase 3, AUDIT-P12 HU Could Have de seguridad personal (PIN de coacción), AUDIT-P13 Entrada vacía en la Hoja de ruta, Diagrama de Arquitectura conserva caja React / Angular, Cambios Pendientes, Horizonte de 5 semanas de la Fase 1 (+6 more)

### Community 57 - "Sprint 3: Diseñar la solución y decidir las tecnologías de implementación (24–28 ago 2026)"
Cohesion: 0.13
Nodes (22): F1-04: Requisitos funcionales y no funcionales, F1-05: Product Backlog priorizado y estimado, F1-06: Matriz de trazabilidad, F1-07: Arquitectura y componentes, F1-08: Mockups y flujo de emergencia, F1-09: Selección de tecnologías, Sprint 2 (17-21 ago 2026): Requisitos y trazabilidad, Sprint 3 (24-28 ago 2026): Diseño y tecnologías (+14 more)

### Community 58 - "@nestjs/common"
Cohesion: 0.13
Nodes (7): AdminModule, AppController, AppService, ComprasModule, MindicadorModule, PaypalModule, UsuariosModule

### Community 59 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, electron, electron-builder, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+7 more)

### Community 60 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @capacitor/app, @capacitor/core, @capacitor/haptics, @capacitor/keyboard, @capacitor/status-bar, @ionic/react, @ionic/react-router (+7 more)

### Community 61 - "Technical Audit Report"
Cohesion: 0.15
Nodes (15): Julio Tapia (Product Owner), AUDIT-P02 Migración del esquema a init.sql y TypeORM, AUDIT-P04 Refresh token rotativo y revocable, AUDIT-P09 Rebalanceo RACI de Alonso, Auditoría Técnica EMERGEN (05/10/2026), BDD con tipos de datos (4.1), Cambios Realizados (AUDITORIA CLAUDE), Hallazgo I-05 Catálogo único de tipos de emergencia (+7 more)

### Community 62 - "Diagrama de Arquitectura"
Cohesion: 0.26
Nodes (14): Diagrama de Arquitectura, APIs REST Backend (Node.js + Nest.js), Aplicacion de Escritorio (Electron), Aplicacion Movil (Ionic), Aplicacion WEB (PC o Dispositivo Movil), Archivos Estaticos (React / Angular) - Hosting Web, Base de Datos PostgreSQL, Firebase Authentication (Autenticacion/JWT) (+6 more)

### Community 63 - "api-client/package.json"
Cohesion: 0.09
Nodes (21): dependencies, firebase, description, devDependencies, jsdom, @repo/api-types, @repo/typescript-config, typescript (+13 more)

### Community 64 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 65 - "Infrastructure Architecture"
Cohesion: 0.17
Nodes (13): AUDIT-P01 Canal y proveedor de despacho de alertas, AUDIT-P06 Ecosistema del monorepo (Node 24.21.0, turbo.json, .env), CA-03.1 Validación de teléfono E.164, CA-06.1 Confirmación SOS, Cambios Realizados, ISO/IEC 25010 en Objetivos de Calidad, RF5 pulsación sostenida 5 s (perfil personas mayores), Servicio Mensajería (integración WhatsApp/Baileys) (+5 more)

### Community 66 - "Evidencias de sistema Aplicación/package.json"
Cohesion: 0.06
Nodes (34): devDependencies, prettier, turbo, typescript, devEngines, packageManager, runtime, engines (+26 more)

### Community 67 - "ui/package.json"
Cohesion: 0.06
Nodes (30): dependencies, react, react-dom, @repo/api-client, devDependencies, eslint, @repo/eslint-config, @repo/typescript-config (+22 more)

### Community 69 - "Sprint Backlog con estimación de horas (88 h)"
Cohesion: 0.15
Nodes (13): [ERR-06] Errores de historias de usuario, [ERR-12] Errores de planificación, Caso de prueba CP-RF11-01, Caso de prueba CP-RF23-01, RF11: Envío de alerta a contactos, RF23: PIN vinculado a cuenta principal, HU-05: Mensaje y tipo de emergencia (160 caracteres), HU-06: Botón SOS y endpoint /Alertas (+5 more)

### Community 71 - "BaileysLoggerAdapter"
Cohesion: 0.23
Nodes (4): BaileysLoggerAdapter, ILogger, Level, LEVELS

### Community 72 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/node, @types/react (+5 more)

### Community 73 - "Especificación de Herramientas y Servicios del Proyecto (4.2)"
Cohesion: 0.18
Nodes (14): typescript, CA-08.1 Registro de intento de envío por contacto, API Integrada de Alertas, API Integrada de Usuarios, Baileys (@whiskeysockets/baileys), Docker Desktop, Especificación de Herramientas y Servicios del Proyecto (4.2), Google Maps Platform API (+6 more)

### Community 74 - "http.ts"
Cohesion: 0.23
Nodes (8): bearer(), createEmergenApi(), downloadBlob(), ApiError, createHttpClient(), send(), HttpClient, ApiErrorResponse

### Community 75 - "Premium Checkout Flow"
Cohesion: 0.12
Nodes (17): clp, PaypalCheckout(), PaypalCheckoutProps, PremiumPurchase(), PremiumPurchaseProps, ResultModal(), ResultModalProps, api (+9 more)

### Community 76 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, allowJs, jsx, module, moduleResolution, noEmit, plugins, extends (+2 more)

### Community 78 - "Trello Sprint Board Screenshot (Fase 1)"
Cohesion: 0.24
Nodes (10): Daily Sprints (daily logs 10/8-21/8/2026), Scrum Weekly Sprint Cadence, Sprint 1 (10/8/2026), Sprint 1 Deliverables (Lean Canvas, Sprint Planning, Acta de Constitucion, RACI, Definicion Proyecto APT), Sprint 2 (17/8/2026), Sprint 2 Deliverables (Documento ERS, Product Backlog, Tabla maestra, Epicas e Historias de usuario), Sprint 3 (24/8/2026), Sprint 3 Deliverables (Wireframes/Mockups, Diagrama UML, Especificacion de Herramientas, Arquitectura) (+2 more)

### Community 79 - "Sprint 4 (31/8/2026)"
Cohesion: 0.27
Nodes (10): Cierre Sprint 3 (28/8/2026), Cierre Sprint 4 (14/9/2026), Creacion del repositorio de GitHub, Daily Sprint 3 (24-28/8/2026), Daily Sprint 4 (11 dailies), Daily Sprint 4 date inconsistency (1/8-11/8 after 31/8), 4.1 Diccionario de Datos / Modelo de Dominio, 4.4 Docker (+2 more)

### Community 80 - "Emergency Alert DTOs"
Cohesion: 0.19
Nodes (7): GenerateReportDto, PairingCodeDto, PHONE_NUMBER, EmergencyAlertDeliveryStatus, GenerateReportRequest, IndicatorValue, WhatsappPairingCodeRequest

### Community 81 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, axios, @ionic/react, @ionic/react-router, ionicons, react, react-dom, react-router-dom (+2 more)

### Community 82 - "2.1.1 Product Backlog"
Cohesion: 0.22
Nodes (10): AUDIT-P08 Estimación HU-14 a HU-19, AUDIT-P11 Diagramas ER y secuencia Generar Alerta sin actualizar, F05.3 Finalización y expiración de la emergencia, F07.3 Adquisición de planes y cupos, F09.3 Solicitudes de soporte desde web, HU-12 Acceso a ficha médica durante emergencia ACTIVA, HU-13 Panel de Administración de Usuarios, 2.1.1 Product Backlog (+2 more)

### Community 83 - "Informe ERS"
Cohesion: 0.13
Nodes (17): AUDIT-P03 Worker outbox ENVIO_ALERTA y pruebas IDOR, Hallazgo R-01/A-04 RBAC con verificación de propiedad (IDOR), 1.2.1 Hoja de ruta del proyecto, MVP de 9 HU (HU-01 a HU-08 y HU-14), RF20 Escritorio opera solo vía API, Carta Gantt (documento externo), Informe ERS, Gabriel Valencia (Scrum Master) (+9 more)

### Community 85 - "firebase-auth.service.ts"
Cohesion: 0.13
Nodes (12): AppModule, loadEnvFile(), BASE_URLS, PaypalLink, PaypalOrder, bootstrap(), createAppTestingModule(), json() (+4 more)

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

### Community 92 - ".oxlintrc.json"
Cohesion: 0.29
Nodes (6): env, node, rules, typescript/no-explicit-any, typescript/no-floating-promises, $schema

### Community 93 - "tsconfig.build.json"
Cohesion: 0.29
Nodes (6): compilerOptions, rootDir, exclude, extends, include, ./tsconfig.json

### Community 95 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test.e2e, test.unit

### Community 96 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, include

### Community 97 - "WhatsApp Notifications"
Cohesion: 0.29
Nodes (6): WhatsappModule, 7.1 Para qué sirve, 7.2 Configurar, 7.3 Vincular el número emisor (una sola vez), 7.5 Usar el servicio desde otro módulo del backend, 7. WhatsApp (Baileys): notificaciones de emergencia

### Community 98 - "api-types/package.json"
Cohesion: 0.29
Nodes (6): description, exports, name, private, types, version

### Community 99 - "typescript-config/package.json"
Cohesion: 0.29
Nodes (6): license, name, private, publishConfig, access, version

### Community 100 - "HU-01: Registro de usuarios (Nest.js /Registro, encriptación, UI React+Ionic)"
Cohesion: 0.29
Nodes (7): Caso de prueba CP-RF2-01, RF2: Inicio de sesión, HU-01: Registro de usuarios (Nest.js /Registro, encriptación, UI React+Ionic), HU-02: Login con JWT, JWT, Nest.js, React + Ionic

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

### Community 106 - "react-library.json"
Cohesion: 0.33
Nodes (5): compilerOptions, jsx, extends, ./base.json, $schema

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
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 121 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 123 - "RF13: Ubicación en emergencia"
Cohesion: 0.40
Nodes (5): Caso de prueba CP-RF13-01, Caso de prueba CP-RF13-02 (sin ubicación / fallback), RF13: Ubicación en emergencia, Plugin de geolocalización Capacitor, HU-07: Geolocalización Capacitor con fallback

### Community 126 - "RNF6-RNF10 (latencia SOS, tolerancia a fallos, Ley 21.719, retención, WCAG 2.1 AA)"
Cohesion: 0.50
Nodes (4): AUDIT-P10 Privacidad y retención (Ley 21.719), RNF6-RNF10 agregados al Acta, Ley 21.719 (datos personales sensibles), RNF6-RNF10 (latencia SOS, tolerancia a fallos, Ley 21.719, retención, WCAG 2.1 AA)

### Community 127 - "Informe Técnico de Recursos (TEC)"
Cohesion: 0.67
Nodes (3): Informe Técnico de Recursos (TEC), Asignación de Responsabilidades y Roles, Tarifas y Valorización de Horas (Junior Freelance)

### Community 128 - "HU-11: Cifrado AES-256 de datos médicos"
Cohesion: 0.50
Nodes (4): Caso de prueba CP-RF10-01, RF10: Acceso restringido a información médica, Cifrado AES-256, HU-11: Cifrado AES-256 de datos médicos

### Community 129 - "RF6: Mínimo un contacto de emergencia"
Cohesion: 0.67
Nodes (3): Caso de prueba CP-RF6-01, RF6: Mínimo un contacto de emergencia, HU-04: Gestión de contactos (mín. 1)

### Community 130 - "RF7: Máximo cinco contactos"
Cohesion: 0.67
Nodes (3): Caso de prueba CP-RF7-01, RF7: Máximo cinco contactos, HU-03: Registro de contactos (máx. 5)

### Community 131 - "RF8: Máximo cinco apadrinados"
Cohesion: 0.67
Nodes (3): Caso de prueba CP-RF8-01, RF8: Máximo cinco apadrinados, HU-09: Cuentas secundarias (máx. 5)

### Community 133 - "Desktop App React + TypeScript + Vite Template README"
Cohesion: 1.00
Nodes (3): Desktop App React + TypeScript + Vite Template README, Web App React + TypeScript + Vite Template README, @turbo/eslint-config Shared ESLint Configurations

## Ambiguous Edges - Review These
- `Diego Plaza (Dev team; FullStack, Arquitectura, Documentacion)` → `Por fortalecer: documentacion de proyectos y calidad de software (pruebas, validaciones)`  [AMBIGUOUS]
  graphify-out/converted/1.5_GuiaEstudiante_Fase 1_Definicion Proyecto APT_65aca024.md · relation: conceptually_related_to
- `EMERGEN (aplicativo de seguridad / alerta de emergencias)` → `Rol Product Owner`  [AMBIGUOUS]
  graphify-out/converted/1.5_GuiaEstudiante_Fase 1_Definicion Proyecto APT_65aca024.md · relation: conceptually_related_to
- `Actividad: Testing QA, confeccion y ejecucion de pruebas` → `Por fortalecer: documentacion de proyectos y calidad de software (pruebas, validaciones)`  [AMBIGUOUS]
  graphify-out/converted/1.5_GuiaEstudiante_Fase 1_Definicion Proyecto APT_65aca024.md · relation: conceptually_related_to
- `db Service (postgres:15-alpine)` → `MySQL Database (30 normalized tables)`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Tabla PLAN` → `Tabla PLAN_USUARIO`  [AMBIGUOUS]
  Fase 2/Evidencias Proyecto/Evidencias de documentación/4.1 Diccionario de Datos - Modelo de Dominio/Diagrama ER Actualizado.drawio.png · relation: conceptually_related_to
- `DETALLE_VENTA` → `USUARIO_SUSCRIPCION`  [AMBIGUOUS]
  Fase 2/Evidencias Proyecto/Evidencias de documentación/4.1 Diccionario de Datos - Modelo de Dominio/Diagrama ER.png · relation: references
- `Use Case: Gestionar Perfil` → `Actor: Usuario Apadrinado`  [AMBIGUOUS]
  Fase 2/Evidencias Proyecto/Evidencias de documentación/3.3 Diagrama UML/Caso de Uso/Caso de Uso.png · relation: references
- `HU-05: Seleccionar tipo de emergencia y personalizar mensaje` → `HU-11: Ingresar ficha de datos de salud`  [AMBIGUOUS]
  graphify-out/converted/Historias Usuario con instructivo_fa506d1a.md · relation: conceptually_related_to
- `TH-6.1 Botón SOS con confirmación de 2 s` → `CA-06.1 Confirmación SOS`  [AMBIGUOUS]
  graphify-out/converted/Horas hombre en relación a Tareas_c7bcb968.md · relation: conceptually_related_to
- `TD-12 (referenciado en tabla Sprint 4, no definido)` → `Product Backlog del Proyecto Emergen`  [AMBIGUOUS]
  graphify-out/converted/2.1.1 PRODUCT BACKLOG_b8d86969.md · relation: references
- `Daily Sprint 4 (11 dailies)` → `Daily Sprint 4 date inconsistency (1/8-11/8 after 31/8)`  [AMBIGUOUS]
  Fase 2/Evidencias Proyecto/Evidencias de documentación/1.2 Sprint Planning/Evidencias de Sprints,Daily Sprints Fase 1 (Captura 2).png · relation: references

## Knowledge Gaps
- **347 isolated node(s):** `Apadrinamiento de cuentas (descuentos; max 5 usuarios por cuenta)`, `Aviso a redes de seguridad cercanas (numeros de emergencia)`, `Compartir ultima ubicacion con contactos de emergencia`, `Diseno UI/UX (Mockups/Wireframes, modelos de datos)`, `Documentacion de requisitos y alcance (Caso de Negocio, Acta de Constitucion, ERS, Casos de Uso, Matriz de Trazabilidad)` (+342 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1044 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Especificación de Herramientas y Servicios del Proyecto (4.2)` connect `Especificación de Herramientas y Servicios del Proyecto (4.2)` to `Infrastructure Architecture`, `Cambios Realizados`, `backend Service (nestjs_emergen_backend)`, `Purchase Constants`?**
  _High betweenness centrality (0.289) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Acta de Constitución EMERGEN` (e.g. with `F1-02: Acta de Constitución` and `TD-02: Elaborar y validar el Acta de Constitución`) actually correct?**
  _`Acta de Constitución EMERGEN` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Apadrinamiento de cuentas (descuentos; max 5 usuarios por cuenta)`, `Aviso a redes de seguridad cercanas (numeros de emergencia)`, `Compartir ultima ubicacion con contactos de emergencia` to the rest of the system?**
  _347 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Guia Estudiante Fase 1: Definicion Proyecto APT (EMERGEN)` be split into smaller, more focused modules?**
  _Cohesion score 0.05087719298245614 - nodes in this community are weakly interconnected._
- **Why does `typeorm` connect `Purchase Constants` to `User Management`, `backend/package.json`, `whatsapp.controller.ts`, `Especificación de Herramientas y Servicios del Proyecto (4.2)`, `firebase-auth.service.ts`, `AdminService`?**
  _High betweenness centrality (0.273) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Diego Plaza (Dev team; FullStack, Arquitectura, Documentacion)` and `Por fortalecer: documentacion de proyectos y calidad de software (pruebas, validaciones)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `EMERGEN (aplicativo de seguridad / alerta de emergencias)` and `Rol Product Owner`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._