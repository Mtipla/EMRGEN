# Levantamiento de ciberseguridad de EMERGEN

Fecha: 29-10-2026, zona de referencia America/Santiago. Etapa: levantamiento estático previo al fortalecimiento.

## 1. Resumen y alcance real

Este documento describe evidencia de implementación y configuración; no acredita seguridad, resistencia a ataques ni aptitud para producción. No se ejecutaron pruebas HTTP, suites, escáneres, consultas a datos de usuarios, instalaciones, builds, migraciones, seeds ni envíos. No se iniciaron, detuvieron o reiniciaron servicios. La única escritura de esta revisión es este informe.

| Dato | Snapshot |
|---|---|
| Repositorio | C:/Users/gonza/EMRGEN |
| Rama | alonso |
| HEAD completo | 6c228e6566487c265231c0f99dcc12de7a305557 |
| Cambios iniciales | Sin modificaciones de archivos versionados; sin seguimiento: A/docs/INFORME_REVALIDACION_QA_2026-10-29.md y A/docs/qa/ |
| Interpretación | HEAD más esos archivos locales; el informe QA local se consultó como antecedente, no como prueba ejecutada por esta revisión |
| Instrucciones | AGENTS.md:1–19; init.sql protegido, sin commits, push, merges ni cambio de rama |
| Escritura autorizada | LEVANTAMIENTO_CIBERSEGURIDAD_EMERGEN.md, nuevo en la raíz; no existía al iniciar |
| Acceso de ejecución | Solo versiones de herramientas y docker ps con campos filtrados; no se inspeccionaron entornos, logs de ejecución, contenido de volúmenes ni bases |
| Privacidad | El informe omite valores de secretos, hashes de usuarios, identidades, teléfonos y coordenadas. Una salida intermedia mostró por error literales de demostración de seed-dev.cjs; se corrigió el filtro y no se reprodujeron aquí |

Convención de referencias, todas relativas a la raíz del repositorio:

- A = Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación.
- B = A/apps/backend/src.
- I = A/services/internal-api.
- C = A/packages/api-client/src.
- U = A/packages/ui/src.
- D = Fase 2/Evidencias Proyecto/Evidencias de documentación/4.4 Docker.
- En las tablas de rutas, los archivos sin B o I explícitos se identifican mediante estas mismas bases.

Estados: **Observado** = archivo o metadato leído directamente; **Inferido** = consecuencia razonada cuya base se cita; **No verificado** = falta ejecución o información externa; **No aplica** = mecanismo ajeno al flujo revisado, con justificación. Un control observado en código no se considera probado en el servicio en ejecución.

Se revisaron manifiestos, lockfile de forma selectiva, los controladores NestJS, routers FastAPI y sus registros, guards, DTO/schemas, servicios sensibles, configuración de clientes y plataformas, Docker y documentos vigentes de despliegue. Las búsquedas generales excluyeron dependencias, builds y artefactos; solo se consultaron versiones de package.json instalados y metadatos Python, y puntualmente la declaración instalada de una ruta de documentación FastAPI. No se revisó exhaustivamente el historial Git, binarios/APK/AAB, mapas de fuentes ni todos los documentos históricos. El directorio documental Docker se revisó para distinguir copias antiguas y posibles secretos.

Comandos seguros ejecutados y alcance:

| Comando/inventario | Resultado resumido |
|---|---|
| git branch --show-current; git rev-parse HEAD; git status --porcelain=v1 | Snapshot anterior; sin checkout o modificación Git |
| rg --files con exclusiones; git ls-files con patrones específicos | Ubicación de fuentes, configuraciones, instrucciones y archivos versionados; la primera enumeración fue demasiado amplia y se acotó al monorepo A |
| Lecturas Python por rangos, expresiones y metadatos | Código, líneas de evidencia y clasificación de posibles secretos sin copiar sus valores al informe; ningún módulo del proyecto se importó |
| node --version; npm --version; python --version | 24.21.0; 11.19.0; 3.12.10 |
| docker --version; docker compose version | Docker CLI 29.9.2; Compose v5.6.1; no acredita versión del daemon |
| docker ps --format '{{.Names}}\|{{.Image}}\|{{.Ports}}\|{{.Status}}' | Consulta inicialmente bloqueada por sandbox; repetida con permiso. Tres contenedores activos; detalle en sección 2 |

No se ejecutaron npm audit, pip-audit, análisis de imágenes ni consultas de CVE: las versiones no implican ausencia o presencia de vulnerabilidades conocidas. No se envió código privado a analizadores externos.

## 2. Mapa de arquitectura y exposición

### 2.1. Flujos y tecnologías confirmadas

Flujo principal: web React/Vite, móvil Ionic/Capacitor y panel Electron → dos orígenes HTTP de API configurados al compilar → NestJS o FastAPI → autenticación/autoridad y validación → PostgreSQL compartido. Un proxy/TLS público todavía no está implementado en los archivos de despliegue revisados.

Flujo SOS: móvil → FastAPI → transacción de alerta y filas de envío en PostgreSQL → dispatcher NestJS cada 2 segundos → Baileys/WhatsApp. FastAPI también finaliza alertas vencidas mediante una tarea periódica. No se observó un broker externo. Evidencia: I/app/services/alertas.py:27–65, I/app/core/scheduler.py:16–24, B/integrations/whatsapp/whatsapp-sos-dispatcher.service.ts:46–49,73–131.

Registro/recuperación: cliente → Firebase Authentication; NestJS verifica ID token RS256 con JWKS y emite una sesión propia HS256 al hacer login contra su base. Son credenciales distintas. Los apadrinados eligen perfil y PIN tras la contraseña de su principal; no hacen login independiente por correo. Evidencia: C/firebase-auth.ts:54–101, B/integrations/firebase-auth/firebase-auth.service.ts:28–73, B/login/login.service.ts:127–204.

| Capa | Versiones y procesos | Evidencia |
|---|---|---|
| Monorepo | npm workspaces, Turborepo 2.11.2, TypeScript 6.0.3; engines Node ^24.21.0/npm ^11.19.0 | A/package.json:4–21,29–31; A/turbo.json:4–27 |
| API principal | NestJS 12.0.4, adaptador Express; TypeORM 1.1.1, pg 8.23.0, bcrypt 6.0.0, jsonwebtoken 9.0.3 | A/apps/backend/package.json:23–45; B/main.ts:12–28 |
| API SOS/soporte | Python 3.12, FastAPI 0.156.2, uvicorn 0.54.0, Pydantic 2.14.1, pydantic-settings 2.16.1, psycopg 3.3.6, PyJWT 2.15.1 | I/requirements-runtime.txt:1–6; I/run.py:1–7 |
| Clientes | React 19.2.8, Ionic 9.0.4, Vite 8.3.0; desktop Electron 44.4.3; Android/Capacitor 8.5.2, geolocation 8.2.4 | A/apps/{web,mobile,desktop}/package.json, bloques dependencies/devDependencies |
| Compartidos | api-client, api-types, ui, configuraciones ESLint/TypeScript; Firebase cliente 12.19.0 | A/package.json workspaces; A/packages/api-client/package.json |
| Integraciones | PayPal Orders v2; Google Maps; Firebase/JWKS; mindicador; jsReport HTTP; Baileys 7.0.0-rc14 | B/app.module.ts:69–80; servicios B/integrations y A/apps/backend/package.json:23–45 |
| Contenedores declarados | Node 24.21.0-alpine; Python 3.12-slim; PostgreSQL 15-alpine | A/Dockerfile:2,6,32; I/Dockerfile:1; A/docker-compose.yml:3 |

Las versiones Node de la tabla coinciden entre manifiestos, lockfile y package.json instalados inspeccionados. Referencias selectivas de A/package-lock.json:2151 (Capacitor Android), 5674 (Nest core), 9218 (Baileys), 10171 (bcrypt), 11964 (Electron), 13260 (Firebase), 15859 (jsonwebtoken), 18086 (pg), 19028 (React), 21152 (Turbo), 21269 (TypeORM), 21514 (TypeScript), 21897 (Vite). No se auditó todo el grafo. Los metadatos I/.venv/Lib/site-packages/*-*.dist-info/METADATA coinciden con requirements-runtime para los seis paquetes; además se localizaron Starlette 1.9.0, pytest 9.1.1 y httpx 0.28.1. Esto no identifica los paquetes efectivos dentro de cada proceso/imagen activa. Python no tiene aquí un lock transitivo con hashes comparable a package-lock.json.

### 2.2. Topología declarada frente a la observada

| Servicio | Configuración actual del repositorio | Metadatos observados, sin probar conectividad |
|---|---|---|
| PostgreSQL | Contenedor 5432; publicación 127.0.0.1:5433; volumen persistente emergen_postgres_data; init.sql montado para inicialización | postgres_emergen_db, postgres:15-alpine, activo; **0.0.0.0:5433 y [::]:5433 → 5432** |
| NestJS | HOST=0.0.0.0, 3000 dentro; host 3001; volumen de sesión WhatsApp | nestjs_emergen_backend, identificador de imagen local 8549c9c7bc1c, activo; 3001 en todas las interfaces IPv4/IPv6 |
| FastAPI | HOST=0.0.0.0, publicación host 8000 → 8000; misma red y BD | No apareció contenedor FastAPI en docker ps. No se investigaron procesos locales; no implica que FastAPI no esté ejecutándose |
| jsReport | JSREPORT_URL_DOCKER apunta por defecto al equipo host, puerto 5488; no hay servicio jsReport en este Compose | jsreport, imagen jsreport/jsreport sin versión visible en la etiqueta, activo; 5488 en todas las interfaces IPv4/IPv6 |
| Red | Una bridge emergen_network compartida por BD y APIs; no marcada internal | No se consultó configuración de las redes activas |
| Proxy/TLS | No servicio inverso, CDN/WAF, certificado o regla de ingreso en Compose revisado | No se verificaron reglas de host, router, firewall, Internet o proveedor |

Evidencia declarada: A/docker-compose.yml:2–21,23–86,88–133. EXPOSE en A/Dockerfile:44 e I/Dockerfile:10 documenta el puerto del contenedor y no publica por sí solo el puerto al host. La diferencia real de PostgreSQL exige reconciliar el despliegue; no se recreó nada. docker ps no permite atribuir el contenedor a este HEAD ni conocer su configuración de aplicación.

El documento local A/docs/INFORME_REVALIDACION_QA_2026-10-29.md:18–23 también describe una diferencia entre backend local y Docker respecto de /health/ready. Se registra como antecedente ajeno, sin repetir aquellas solicitudes ni confirmar su resultado ahora.

### 2.3. Configuración de clientes y distribución

VITE_API_URL y VITE_INTERNAL_API_URL quedan incorporadas al bundle; cambiarlas solo en el backend no actualiza un APK instalado. Web/móvil/desktop conservan fallbacks de desarrollo a HTTP localhost, y el panel usa un segundo cliente para /internal/v1. Evidencia: A/apps/{web,mobile,desktop}/src/lib/api.ts:7–18; A/apps/web/src/features/cuenta/session.ts:4–16; A/apps/mobile/src/lib/session.ts:7–10; A/apps/desktop/src/admin/api.ts:20–38.

Existe un control de build para production/android-production/staging: exige ambos orígenes HTTPS con dominio, sin IP/local/credenciales/ruta/query, deployment ID y sin ubicación simulada. Está conectado a las configuraciones Vite de los tres clientes. Evidencia: A/scripts/api-environment.mjs:4–56; A/apps/web/vite.config.ts:6–12; A/apps/mobile/vite.config.ts:9–18; A/apps/desktop/vite.config.ts:6–15. No se compilaron artefactos ni se verificó qué modo se usó para los distribuidos; un build explícito en modo de desarrollo no es de distribución.

Android principal: HTTPS local de WebView, cleartext y contenido mixto deshabilitados; allowBackup=false. Solo debug permite HTTP y añade sufijo LAN. Hay ubicación, servicio foreground, notificaciones y wake lock; el servicio de accesibilidad exportado exige BIND_ACCESSIBILITY_SERVICE. No se observó deep link HTTP de aplicación en el manifest principal. Firma y distribución release siguen pendientes en documentación. Evidencia: A/apps/mobile/capacitor.config.ts:8–15; A/apps/mobile/android/app/src/main/AndroidManifest.xml:5–6,18–43,50–57; src/debug/AndroidManifest.xml:4–6; app/build.gradle:23–30; A/docs/DESPLIEGUE.md:89–91.

Electron: nodeIntegration=false, contextIsolation=true, sandbox=true; sin preload o IPC observado en el main revisado. Se bloquea navegación a otro origen y ventanas nuevas; enlaces HTTPS pueden abrirse en navegador externo. ELECTRON_RENDERER_URL permite un renderer remoto cuando está definido, sin una restricción explícita por modo de distribución. Evidencia: A/apps/desktop/electron/main.cjs:6–35. Empaquetado, firma, actualización y artefacto instalado: no verificados.

### 2.4. Hosting y dependencias operativas

Proveedor, dominio, CDN/WAF, firewall, terminación/renovación TLS, staging, escala, responsables y presupuesto de disponibilidad **no están definidos por evidencia suficiente**. A/docs/DESPLIEGUE.md:13–17,89–91 los deja pendientes. La implantación necesita Node y Python y un proceso WhatsApp persistente; un hosting solo estático o que suspenda ese proceso no cubre este diseño. jsReport debe dejar de depender del equipo de desarrollo o tener un destino externo administrado.

Hay preparación de configuración, no un manifiesto de producción completo: EMERGEN_ENVIRONMENT controla validaciones, carga de .env y orígenes; Compose usa development por defecto incluso cuando la imagen Node tiene NODE_ENV=production. DB_SSLMODE/DB_SSL_CA_FILE se soportan en ambas APIs, pero no se inyectan ni montan en el Compose revisado. INTERNAL_API_DOCS_ENABLED usa true por defecto en Compose. Evidencia: A/Dockerfile:34; A/docker-compose.yml:37–60,93–107; B/config/runtime-config.ts:16–120; B/app.module.ts:32–66; I/app/core/config.py:21–81.

## 3. Inventario de APIs y otras entradas

Conteo estático: **64 rutas NestJS; 16 rutas de negocio FastAPI y 2 de salud**. Se resolvieron los prefijos de los dos controladores de compras y /internal/v1; los parámetros :id/{id} son segmentos declarados, no rutas generadas sin resolver. No se usó OpenAPI contra servicios vivos. Las rutas reales de una imagen antigua o del proxy pueden diferir.

Convenciones de la tabla:

- W/M/E = web/móvil/escritorio; C = wrapper del paquete api-client, que no demuestra uso por una pantalla activa.
- J = JWT propio HS256, issuer emergen-api/audience emergen-web, lectura del usuario en BD en cada petición; F = ID token Firebase RS256. J no exige universalmente estado=1: el acceso parcial es funcional y los servicios restringen operaciones.
- A = administrador con acceso completo; S = administrador o soporte completos. Propio/vínculo se deriva de la sesión y se comprueba en servicio.
- V = ValidationPipe global de Nest, whitelist + forbidNonWhitelisted + transform; P = schema Pydantic con extra=forbid donde recibe cuerpo. Los límites de campo indicados no equivalen a límite de bytes o tasa.
- La fuente de acceso esperado es el controlador/servicio citado salvo indicación «decidir». No hay guarda global Nest en B/main.ts/B/app.module.ts revisados. CORS no autentica.
- Referencias abreviadas de controladores: L=B/login/login.controller.ts; AP=B/apadrinados/apadrinados.controller.ts; PE=B/perfil/perfil.controller.ts; AD=B/admin/admin.controller.ts; CO=B/compras/compras.controller.ts; WA=B/integrations/whatsapp/whatsapp.controller.ts; AL=I/app/api/routes/alertas.py; MC=I/app/api/routes/mensajes_contacto.py; TS=I/app/api/routes/tickets_soporte.py.

### 3.1. NestJS: identidad y recursos de cuenta

| Método/canal | Ruta | Consumidor | Acceso esperado y fuente | Autenticación implementada | Autorización rol/propietario/vínculo | Validación y límites | Efecto/datos sensibles | Evidencia |
|---|---|---|---|---|---|---|---|---|
| POST | /usuarios/registro/validar | W/M | Público, L | Sin guarda | Sin sesión; validación de registro | V; nombre 2–50, correo ≤100, contraseña 8–72 y bytes bcrypt | Disponibilidad de correo; datos de registro | L:35–38; B/login/login.service.ts:64–70 |
| POST | /usuarios/registro | W/M | Cuenta Firebase verificada, L | F | Correo del token coincide; servidor fija rol/estado/principal | V; CrearUsuarioDto | Alta de principal; hash de contraseña | L:41–44; B/login/login.service.ts:75–100; B/usuarios/usuarios.service.ts:27–32 |
| POST | /usuarios/password/firebase | W/M | Titular con identidad reciente, L | F | Correo verificado, auth_time <5 min; principal completo | V; contraseña 8–72 y límite de bytes | Actualiza hash local | L:49–52; B/login/login.service.ts:306–323 |
| POST | /usuarios/login | W/M/E | Principal/personal y perfil válido, L | Contraseña bcrypt; PIN para perfiles configurados | perfil_ID debe ser de la familia autenticada | V; contraseña 8–72; PIN 4 dígitos; bloqueo PIN, sin limitador general localizado | Perfiles o emisión de JWT; acceso registrado | L:55–57; B/login/login.service.ts:127–204 |
| POST | /usuarios/me/pin | W/M | Principal sin PIN, L | J | sub propio; rechaza hijo/PIN ya existente | V; PIN 4 dígitos | Configura PIN inicial y acceso | L:60–66; B/login/login.service.ts:209–230 |
| GET | /usuarios/me | W/M/E | Sesión propia, L | J | sub | Sin cuerpo | Cuenta propia y plan | L:69–72 |
| GET | /usuarios | W/C | A, L | J | RolesGuard A | Sin paginación explícita | Lista de cuentas | L:75–79; B/login/login.service.ts:244–254 |
| PATCH | /usuarios/me | W/M/E | Propio con reglas de acceso, L | J | Campos distintos por personal; parcial hijo exige PIN principal | V; nombre/correo/PIN permitidos; lista explícita en servicio | Identidad y eventualmente PIN | L:82–88; B/login/login.service.ts:257–294 |
| PATCH | /usuarios/me/password | W/M | Principal completo, L | J + contraseña actual | Rechaza personal e hijos sin contraseña | V; contraseña 8–72/bytes | Cambio de hash; no revocación de JWT localizada | L:92–98; B/login/login.service.ts:328–351 |
| DELETE | /usuarios/:id | W/C | A, L | J | A; no autoeliminación; servicio/triggers | V + ParseIntPipe | Borrado y auditoría | L:101–111; B/login/login.service.ts:416–429 |
| GET | /usuarios/me/vinculadas | W/M | Propia familia, AP | J | Principal ve sus hijos; hijo solo nombres de familia | Sin cuerpo; máximo funcional de hijos 5 | Relaciones familiares | AP:16–18; B/apadrinados/apadrinados.service.ts:132–160 |
| GET | /usuarios/me/informe | W/C | Propio, AP | J | Principal incluye hijos; hijo solo su cuenta | V; pdf/xlsx; histórico sin tope localizado | Informe con actividad/alertas | AP:21–28; B/apadrinados/apadrinados.service.ts:61–124 |
| POST | /usuarios/me/apadrinados | W/M | Principal completo, AP | J | exigirPrincipal; cupos/BD | V; nombre 2–50, bool, PIN 4 dígitos; máximo 5 | Crea cuenta vinculada | AP:31–34; B/apadrinados/apadrinados.service.ts:164–175; B/usuarios/usuarios.service.ts:39–50 |
| PUT | /usuarios/me/apadrinados/:id/pin | W/M | Principal dueño, AP | J + PIN principal | exigirPropio y fila vinculada | V + ParseIntPipe; PIN nuevo y principal 4 dígitos | Restablece PIN de hijo | AP:37–43; B/apadrinados/apadrinados.service.ts:185–204 |
| PUT | /usuarios/me/apadrinados/:id/estado | W/M | Principal dueño, AP | J + PIN principal | exigirPropio | V + ParseIntPipe; estado 1/2 | Cambia acceso/PIN temporal | AP:46–52; B/apadrinados/apadrinados.service.ts:210–219 |
| DELETE | /usuarios/me/apadrinados/:id | W/M | Principal dueño, AP | J + PIN principal | exigirPropio | V + ParseIntPipe; PIN 4 dígitos | Borrado de hijo | AP:55–61; B/apadrinados/apadrinados.service.ts:222–246 |
| GET | /usuarios/me/perfil | W/M/nativo | Propio, PE | J | sub propio | Sin cuerpo | Contactos, mensaje, ficha médica descifrada | PE:14–16; B/perfil/perfil.service.ts:37–55 |
| PUT | /usuarios/me/perfil | W/M | Propio completo, PE | J | exigirAccesoCompleto | V; prioridad 1–4, mensaje ≤160, ficha anidada con longitudes | Configuración SOS y ficha cifrada | PE:19–21; B/perfil/perfil.service.ts:58–109,165–168 |
| POST | /usuarios/me/contactos | W/M | Propio completo, PE | J | sub; reglas de BD | V; nombre ≤20, E.164, bool; límite funcional de contactos en BD | Teléfono y permiso de compartir antecedentes | PE:24–26; B/perfil/perfil.service.ts:112–124 |
| PUT | /usuarios/me/contactos/:id | W/M | Propio completo, PE | J | WHERE contacto_id + usuario_id | V + ParseIntPipe; ContactoDto | Actualiza contacto | PE:29–31; B/perfil/perfil.service.ts:127–143 |
| DELETE | /usuarios/me/contactos/:id | W/M | Propio completo, PE | J | WHERE contacto_id + usuario_id | ParseIntPipe; restricciones BD | Elimina contacto | PE:34–36; B/perfil/perfil.service.ts:147–159 |

### 3.2. NestJS: administración y compras

| Método/canal | Ruta | Consumidor | Acceso esperado y fuente | Autenticación implementada | Autorización rol/propietario/vínculo | Validación y límites | Efecto/datos sensibles | Evidencia |
|---|---|---|---|---|---|---|---|---|
| GET | /admin/usuarios | E/W | S, AD | J | RolesGuard S | Sin paginación explícita | Lista global | AD:14–23; B/admin/admin.service.ts:109–116 |
| GET | /admin/usuarios/planes | E | A, AD | J | A | Sin paginación; catálogo | Planes | AD:26–28 |
| GET | /admin/usuarios/trabajadores | E | A, AD | J | A | Sin paginación | Personal y roles | AD:31–33; B/admin/admin.service.ts:124–137 |
| POST | /admin/usuarios/soporte | E | A, AD | J | A; rol decidido por servicio | V; CrearUsuarioDto | Alta de personal | AD:37–42 |
| GET | /admin/usuarios/:id | E/W | S, AD | J | S; consulta global auditada | ParseIntPipe | Expediente, contactos y alertas | AD:45–51; B/admin/admin.service.ts:143–180 |
| PATCH | /admin/usuarios/trabajadores/:id | E | A, AD | J | A; servicio comprueba tipo de cuenta | V + ParseIntPipe; rol permitido soporte/usuario | Correo, PIN o rol de trabajador | AD:54–60; B/admin/dto/actualizar-trabajador.dto.ts:10–22 |
| DELETE | /admin/usuarios/trabajadores/:id | E | A, AD | J | A; reglas de trabajador | ParseIntPipe | Borrado y bitácora | AD:63–68 |
| PATCH | /admin/usuarios/:id | E/W | A, AD | J | A; no editar otro administrador por esta vía | V + ParseIntPipe; nombre/correo | Edición auditada | AD:71–77; B/admin/admin.service.ts:187–217 |
| PUT | /admin/usuarios/:id/plan | E | A, AD | J | A; principal y ocupación de cupos comprobados | V + ParseIntPipe; cupos 0–5 | Plan/cupos | AD:80–86; B/admin/admin.service.ts:265–319 |
| PUT | /admin/usuarios/:id/estado | E | A, AD | J | A; no propio; habilitar usuario exige PIN | V + ParseIntPipe; estado 1/2 | Permiso de acceso | AD:89–95; B/admin/admin.service.ts:228–257 |
| DELETE | /admin/usuarios/apadrinado/:id | E | A, AD | J | A; exige cuenta hija | ParseIntPipe | Borrado | AD:98–103; B/admin/admin.service.ts:326–332 |
| DELETE | /admin/usuarios/soporte/:id | E | A, AD | J | A; exige soporte | ParseIntPipe | Borrado | AD:106–111; B/admin/admin.service.ts:335–340 |
| GET | /admin/alertas | E | A, controlador | J | A | V; limit 1–100, offset≥0, estado/usuario | Ubicaciones y alertas globales | B/admin/admin-alertas.controller.ts:8–17; dto/consultar-alertas.dto.ts:4–24 |
| GET | /admin/tickets/reporte | E/W | A, controlador | J | A | V; pdf/xlsx; todos los tickets cerrados | Texto de soporte y autor | B/admin/admin-tickets.controller.ts:15–23; admin-tickets.service.ts:41–55 |
| GET | /admin/ventas | E/W | S, controlador | J | S, excepción a A de clase | V; búsqueda ≤100, fechas, estado, limit≤100 | Compras globales | B/admin/admin-ventas.controller.ts:18–27; dto/consultar-ventas.dto.ts:15–51 |
| GET | /admin/ventas/reporte | E/W | A, controlador | J | A | V; filtros/formato; exportación sin tope de filas | Ventas/identidades de comprador | B/admin/admin-ventas.controller.ts:31–33; admin-ventas.service.ts:132–138 |
| GET | /admin/auditoria | E | A, controlador | J | A | V; fechas/IDs; por defecto 100, máximo 1000 | Bitácora de usuarios | B/auditoria/auditoria.controller.ts:10–19; auditoria.service.ts:173–223 |
| GET | /admin/auditoria/reporte | E | A, controlador | J | A; exportación auditada | V; pdf/xlsx y límite de bitácora | Exportación de cambios | B/auditoria/auditoria.controller.ts:23–30; auditoria.service.ts:236–276 |
| GET | /compras/precio | W pública | Público, CO | Sin guarda | Precio decidido en servidor | Sin cuerpo | Precio de catálogo | CO:17–23; B/compras/compras.service.ts:47–56 |
| GET | /compras/apadrinados | W | Principal completo, CO | J | titular y plan | Sin cuerpo | Cupos/precios propios | CO:28–35; B/compras/compras.service.ts:33–43,73–79 |
| GET | /compras/resumen | W | Principal completo, CO | J | titular; permite no tener plan todavía | Sin cuerpo | Resumen de compra | CO:38–40; B/compras/compras.service.ts:64–70 |
| GET | /compras/apadrinados/ventas/pendientes | W | Principal completo, CO | J | usuario de sesión | LIMIT 100 fijo | Órdenes propias | CO:43–44; B/compras/compras.service.ts:82–89 |
| POST | /compras/apadrinados/ordenes | W | Principal completo, CO | J | titular; reserva en BD, precio servidor | V; PLAN/CUPOS, cantidad 1–5; PLAN=1 | Crea venta/reserva y orden PayPal | CO:46–51; B/compras/compras.service.ts:92–137 |
| POST | /compras/apadrinados/ordenes/:orderId/captura | W | Dueño de venta, CO | J | venta por usuario_id + orderId | orderId string; autorización en consulta; lease/idempotencia de operación | Captura externa y cupos | CO:54–60; B/compras/compras.service.ts:151–179,257–259 |
| POST | /compras/apadrinados/ventas/:ventaId/conciliar | W | Dueño, CO | J | sub y venta en servicio | ParseIntPipe; estado de reserva | Consulta/conciliación de pago | CO:63–66; B/compras/compras.service.ts, método conciliar |
| POST | /compras/apadrinados/ordenes/:orderId/cancelar | W | Dueño de venta, CO | J | ventaDelUsuario; no libera reserva incierta | String de ruta; regla de estado | Cancela reserva | CO:69–75; B/compras/compras.service.ts:235–240,257–259 |

### 3.3. NestJS: integraciones y diagnóstico

| Método/canal | Ruta | Consumidor | Acceso esperado y fuente | Autenticación implementada | Autorización rol/propietario/vínculo | Validación y límites | Efecto/datos sensibles | Evidencia |
|---|---|---|---|---|---|---|---|---|
| GET | / | Técnico | Público según controlador; decidir publicación | Sin guarda | Ninguna | Sin cuerpo | Respuesta base | B/app.controller.ts:4–10 |
| GET | /health | Healthcheck | Público según controlador | Sin guarda | Ninguna | Sin cuerpo | Vida del proceso | B/health/health.controller.ts:13–15 |
| GET | /health/ready | Operación/build | Público según controlador; decidir detalle público | Sin guarda | Ninguna | Consulta SELECT de esquema LIMIT 0 | Entorno/deployment/estado BD y WhatsApp | B/health/health.controller.ts:19–40 |
| GET | /health/sos | Monitor/build | Público según controlador; decidir publicación | Sin guarda | Ninguna | Misma comprobación; 503 si SOS no disponible | Estado operativo | B/health/health.controller.ts:44–48 |
| GET | /auth/me | C | Identidad Firebase | F | Identidad del token | Bearer | Identidad verificada | B/integrations/firebase-auth/firebase-auth.controller.ts:5–11 |
| GET | /maps/geocode | C/W/M | Wrapper público; política de consumo por decidir | Sin guarda | Ninguna | V; dirección 3–200 | Consume clave/cuota del servidor Google | B/integrations/google-maps/google-maps.controller.ts:9–15; dto/geocode-query.dto.ts:4–7 |
| GET | /maps/reverse-geocode | C/W/M | Igual decisión, contrato propio | Sin guarda | Ninguna | V; latitude/longitude tipadas/rangos | Ubicación enviada a Google | B/integrations/google-maps/google-maps.controller.ts:18–23; dto/geocode-query.dto.ts:10–17 |
| POST | /reports | C; uso de pantalla sin confirmar | Render por nombre; política de acceso por decidir | Sin guarda | No allowlist de plantillas por usuario localizada | V; nombre regex ≤100; data solo IsObject, sin esquema/profundidad propios | Consume jsReport y entrega archivo | B/integrations/jsreport/jsreport.controller.ts:11–26; dto/generate-report.dto.ts:4–18 |
| GET | /indicators | C/W | Público según wrapper; decidir cuota | Sin guarda | Ninguna | Sin cuerpo; sin caché localizada en servicio | Consulta mindicador | B/integrations/mindicador/mindicador.controller.ts:9–15; mindicador.service.ts:32–45 |
| GET | /indicators/:code | C/W | Público según wrapper; decidir cuota | Sin guarda | Ninguna | V; code allowlist; fecha regex | Consulta serie externa | B/integrations/mindicador/mindicador.controller.ts:18–23; dto/indicator-query.dto.ts:19–30 |
| POST | /payments/paypal/orders | C legado; compra vigente usa /compras | Política de exposición por decidir | Sin guarda | Sin titular ni reserva local en este controlador | V; importe positivo con formato, moneda 3 letras, longitudes | Crea orden PayPal con importe del solicitante | B/integrations/paypal/paypal.controller.ts:18–24; dto/create-paypal-order.dto.ts:4–25 |
| POST | /payments/paypal/orders/:orderId/capture | C legado | Política de exposición por decidir | Sin guarda | No propiedad de orden localizada en esta vía | Regex orderId 5–36 alfanuméricos mayúsculos | Solicita captura PayPal; no demuestra asignación de cupos | B/integrations/paypal/paypal.controller.ts:27–33 |
| GET | /notifications/whatsapp/status | C/administración | A, WA | J | A | Sin cuerpo | Estado/sesión de emisor | WA:29–41 |
| GET | /notifications/whatsapp/qr | C/administración | A, WA | J | A | Sin cuerpo; entrega imagen | Material de vinculación sensible | WA:44–54 |
| POST | /notifications/whatsapp/pairing-code | C/administración | A, WA | J | A | V; teléfono patrón | Vincula emisor | WA:57–62; dto/pairing-code.dto.ts:5–9 |
| POST | /notifications/whatsapp/logout | C/administración | A, WA | J | A | Sin cuerpo | Desvincula WhatsApp; afecta SOS | WA:65–69 |
| POST | /notifications/whatsapp/alerts | C/administración | A, WA | J | A; destinatarios aportados por administrador | V; 1–5 destinatarios, mensaje≤200, DTO anidados | Envío real posible a terceros | WA:73–75; dto/send-emergency-alert.dto.ts:58–109; whatsapp.constants.ts:6 |

Las rutas genéricas /reports y /payments/paypal no heredan los controles de los reportes administrativos o /compras. Que exista un wrapper no demuestra que se necesite mantener públicamente esa entrada.

### 3.4. FastAPI

Todas las rutas de negocio siguientes tienen prefijo /internal/v1. «Interna» describe el nombre: los clientes las consumen directamente y Compose publica 8000. No se presupone una barrera de red.

| Método/canal | Ruta | Consumidor | Acceso esperado y fuente | Autenticación implementada | Autorización rol/propietario/vínculo | Validación y límites | Efecto/datos sensibles | Evidencia |
|---|---|---|---|---|---|---|---|---|
| POST | /internal/v1/alertas | M/nativo | Emisor propio, AL | J | ID de sesión; exige plan del titular/contacto; parcial no personaliza texto | P; UUID idempotencia, prioridad 1–4, ubicación≤150, mensaje≤160; una activa | Guarda SOS y encola WhatsApp | AL:13–19; I/app/services/alertas.py:27–65 |
| POST | /internal/v1/alertas/{alerta_id}/cerrar | M | Emisor o principal vinculado, AL | J + PIN efectivo | Actor propio/principal; hijo parcial usa PIN de principal | P; PIN 4 dígitos; contador en BD 5 fallos/15 min | Cierre y notificación vía cola | AL:22–28; I/app/services/alertas.py:74–98 |
| GET | /internal/v1/alertas | M/personal | Propio; S global, AL | J | No staff ignora usuario_id externo y fuerza propio | Estado enum; limit 1–100, offset≥0 | Historial/ubicación/estado de envíos | AL:31–42 |
| GET | /internal/v1/alertas/{alerta_id} | M | Propio o S, AL | J | 404 para objeto ajeno | Entero de ruta | Detalle sensible | AL:45–55 |
| GET | /internal/v1/tickets-soporte/categorias | W/M/E | Sesión, TS | J | Cualquier sesión; no exige staff | Catálogo | Categorías | TS:13–15 |
| GET | /internal/v1/tickets-soporte/estados | W/M/E | Sesión, TS | J | Cualquier sesión | Catálogo | Estados | TS:18–20 |
| POST | /internal/v1/tickets-soporte | W/M | Solicitante propio, TS | J | Usuario autor sale de sesión; categoría existente | P; descripción 1–500, categoría>0 | Ticket de usuario | TS:23–31 |
| GET | /internal/v1/tickets-soporte | W/M/E | Propio o S global, TS | J | No staff fuerza ID propio | Estado≤50; limit 1–100, offset≥0 | Lista de soporte | TS:34–44 |
| GET | /internal/v1/tickets-soporte/{ticket_id} | W/M/E | Propio o S, TS | J | 404 para ajeno | Entero | Ticket/solución | TS:47–56 |
| PATCH | /internal/v1/tickets-soporte/{ticket_id} | E | S con reglas de transición, TS | J | solo_staff; EN PROCESO/CERRADO solo A; verificación solo soporte | P; estado≤50, solución≤500, bool estrictos; confirma cierre | Respuesta y autor de sesión preservado | TS:59–69; I/app/services/tickets.py:44–78 |
| GET | /internal/v1/mensajes-contacto/tipos | W visitante | Público explícito, MC | Sin sesión | Ninguna | Catálogo | Tipos de contacto | MC:14–20 |
| POST | /internal/v1/mensajes-contacto | W visitante | Público explícito, MC | Sin sesión | Solo crea y recibe ID; no consulta luego | P; nombre≤100, correo≤100/patrón, mensaje≤500; 5/IP/15 min en proceso, 3/correo/h en BD | Datos de remitente/texto | MC:23–35; I/app/services/contacto.py:34–46 |
| GET | /internal/v1/mensajes-contacto/estados | E | S, MC | J | solo_staff | Catálogo | Estados | MC:38–40 |
| GET | /internal/v1/mensajes-contacto | E | S, MC | J | solo_staff | Estado≤50; limit 1–100, offset≥0 | Bandeja global y respuestas | MC:43–51 |
| GET | /internal/v1/mensajes-contacto/{mensaje_id} | E | S, MC | J | solo_staff | Entero | Remitente/respuestas | MC:54–59 |
| PATCH | /internal/v1/mensajes-contacto/{mensaje_id} | E | S, MC | J | solo_staff; autor desde sesión | P; estado≤50, respuesta≤500; al menos un campo | Respuesta/cambio de estado | MC:62–70; I/app/schemas/contacto.py:24–34 |
| GET | /health | Operación | Público, main | Sin sesión | Ninguna | Sin cuerpo | Vida | I/app/main.py:33–35 |
| GET | /health/ready | Operación/build | Público, health | Sin sesión | Ninguna | Comprobación de BD/esquema | Estado/identidad de despliegue | I/app/api/health.py:9 en adelante |
| GET | /docs | Desarrollo | Condicional por configuración; desactivar o proteger en hosting | Sin sesión | Ninguna sobre la UI de docs | docs_enabled | Inventario/Swagger | I/app/main.py:14–22; I/app/core/config.py:42 |
| GET | /redoc | Desarrollo | Igual decisión; UI distinta | Sin sesión | Ninguna | docs_enabled | Esquema legible | I/app/main.py:21 |
| GET | /openapi.json | Desarrollo | Igual decisión; esquema | Sin sesión | Describe seguridad, no la sustituye | docs_enabled | Contratos de rutas | I/app/main.py:22 |
| GET | /docs/oauth2-redirect | Swagger | Ruta del framework, condicional | Sin sesión | Auxiliar de Swagger | Registro condicionado por docs | Página auxiliar | Declaración local FastAPI instalada: applications.py:469–481,1154; no invocada |

Entradas no HTTP: tarea de vencimiento FastAPI; dispatcher NestJS y conexión saliente Baileys, con eventos del proveedor; permisos/plugins nativos de volumen SOS y marcador telefónico; archivos de sesión WhatsApp; scripts manuales de administración y backups. No se localizaron WebSocket de aplicación, webhook entrante de PayPal, upload multipart ni endpoint de métricas en controladores/routers y búsquedas de B, I/app, C y clientes. Esto no cubre plugins del servicio jsReport ni rutas añadidas por infraestructura ajena.

La respuesta CORS OPTIONS es middleware, no una operación de negocio adicional: B/main.ts:18 e I/app/main.py:25–26. Los recursos estáticos y la política de fallback del servidor web de hosting quedan pendientes porque ese servidor no está definido.

## 4. Matriz de controles

| Área | Control localizado y alcance | Evidencia | Estado de verificación | Incógnita/prueba posterior |
|---|---|---|---|---|
| Registro/identidad | Firebase RS256 con audience/issuer y JWKS; registro exige email verificado/coincidente; rol principal fijado en servidor | B/integrations/firebase-auth/firebase-auth.service.ts:28–73; B/login/login.service.ts:75–100; B/usuarios/usuarios.service.ts:27–32 | Observado en fuente | Revocación Firebase/MFA/políticas del proyecto no verificados; no se leyó consola del proveedor |
| Contraseñas/PIN | bcrypt coste 12; contraseñas ≤72 bytes además del DTO; hash ficticio para correo inexistente | B/login/login.service.ts:44–47,110–141; B/login/pin-principal.ts:17–43 | Observado | No se extrajeron hashes. Revisar política de cuentas demo y coste operativo antes de cambiar parámetros |
| Sesión propia | Firma HS256, secreto mínimo 32 bytes; exp configurable 1–168 h, por defecto 2 h; issuer/audience; lectura de cuenta vigente por petición | B/login/login.module.ts:22–37; B/config/session.ts:2–9; B/login/jwt-auth.guard.ts:26–61; I/app/dependencies/auth.py:43–74 | Observado | Logout local/cambio de contraseña no revocan por sí mismos JWT ya emitidos; no se localizó refresh/denylist/versionado de sesión en esos módulos |
| Estado de cuenta | Guards cargan rol/estado actuales; RolesGuard/solo_staff requieren estado=1; acceso parcial estado=2 tiene capacidades de usuario | B/login/login.service.ts:410–413; B/login/roles.guard.ts:17–25; I/app/dependencies/auth.py:38–40,68–79 | Observado | El nombre buscarActivo y mensajes no equivalen a filtro de cuenta activa; aclarar suspensión total si se necesita, sin romper acceso parcial |
| Rol y propiedades | A/S en servidor; DTO rechaza campos extra; usuarios no eligen libremente rol/principal en alta | B/main.ts:19–24; B/login/roles.guard.ts:17–25; B/usuarios/usuarios.service.ts:27–32; B/admin/dto/actualizar-trabajador.dto.ts:20–22 | Observado | Verificar decisiones por operación al cambiar DTO, especialmente rutas de personal |
| Propiedad/familia | Propietario desde sub, contacto por ID+usuario, hijo por principal; 404 para alerta/ticket ajenos | B/perfil/perfil.service.ts:127–159; B/apadrinados/apadrinados.service.ts:235–246; AL:40–55; TS:43–55 | Observado | Cobertura puntual disponible, no acreditada para toda operación ni ejecución |
| Reautenticación PIN | Nest usa 3 fallos/5 min; cierre SOS FastAPI 5 fallos/15 min, sobre la misma fila PIN | B/login/pin-principal.ts:6–14,17–43; I/app/services/alertas.py:85–96 | Observado | Política compartida inconsistente por operación; evitar que un bloqueo impida acciones críticas legítimas |
| Cliente/sesión | W/M guardan JWT en localStorage; panel admin mantiene token en memoria; SOS Android guarda copia cifrada AES-GCM con Android Keystore | A/apps/web/src/features/cuenta/session.ts:9–16; A/apps/mobile/src/lib/session.ts:26–54; A/apps/desktop/src/admin/api.ts:30–38; VolumeSosStore.java:18–42,59–66 bajo A/apps/mobile/android/app/src/main/java/com/emergen/mobile | Observado | La copia nativa cifrada no protege la copia JS de XSS; comprobar borrado y expiración de ambas ante cambios |
| CORS/CSRF/proxy | Orígenes explícitos; staging/production exige HTTPS exacto; Bearer manual en clientes | B/main.ts:14–18; B/config/runtime-config.ts:100–118; I/app/main.py:25–26; I/app/core/config.py:74–81 | Observado | No se localizaron sesiones por cookie: CSRF clásico de cookie no aplica a ese mecanismo; reevaluar si se introducen cookies. Confianza de proxy/IP efectiva no comprobada |
| Validación | Nest whitelist/rechazo extra/transform; Pydantic extra=forbid en cuerpos; IDs enteros y campos acotados en gran parte del inventario | B/main.ts:19–24; B/perfil/dto/perfil.dto.ts:31–78; I/app/schemas/{alertas,contacto,tickets}.py | Observado | /reports.data solo es objeto; límites globales de bytes, profundidad, cantidad de claves, query y formularios no configurados explícitamente en arranques revisados |
| Antiabuso | Contacto público 5/IP/15 min en memoria y 3/correo/h en BD con advisory lock; PIN persistente | MC:23–35; I/app/core/limite.py:7–24; I/app/services/contacto.py:34–43 | Observado | No equivale a limitador de login/registro/pagos/mapas/reportes. Contador por IP se divide entre workers/réplicas y no elimina claves antiguas del diccionario |
| Paginación/coste | Alertas/ventas/listas FastAPI ≤100; bitácora por defecto 100 y máximo 1000 | B/admin/dto/consultar-alertas.dto.ts:15–24; B/admin/dto/consultar-ventas.dto.ts:41–51; B/auditoria/auditoria.service.ts:32,198–200; AL:35–36 | Observado | Usuarios/trabajadores y varios reportes no tienen tope; offsets sin máximo; no estimado coste de consultas/COUNT/agregados |
| SQL | Valores parametrizados en TypeORM, consultas $n y psycopg %s; fragmentos dinámicos revisados son constantes | B/login/login.service.ts:132–136; B/perfil/perfil.service.ts:130–138; I/app/services/alertas.py:28–65; B/admin/admin.service.ts:79–86,128 | Observado por recorridos representativos | No se certificó ausencia global de inyección; trazas de BD/privilegios efectivos no inspeccionados |
| Integridad/operaciones | Transacciones con retry solo 40001/40P01; locks y restricciones; synchronize=false; idempotencia y una alerta activa | B/config/transaction.ts; I/app/core/db.py:25–35; A/init.sql:252,481; I/app/services/alertas.py:28–42; B/app.module.ts:64–66 | Observado en fuente/esquema | No se aplicaron constraints ni se comprobó esquema vivo. Reintentar transacción con efecto externo necesita análisis específico |
| Compras | Precio servidor en /compras, propiedad de venta, reserva durable, claves PayPal estables y lease de 60 s | B/compras/compras.service.ts:92–137,151–179,235–259 | Observado | Rutas genéricas /payments/paypal no tienen esos mismos controles; pago real/sandbox completo no verificado aquí |
| SOS/cola | Idempotencia UUID+huella, plan/contacto, envío en misma transacción; worker limita lote y usa SKIP LOCKED | I/app/services/alertas.py:27–65; B/integrations/whatsapp/whatsapp-sos-dispatcher.service.ts:73–131 | Observado | Envío externo ocurre dentro de transacción y locks; un fallo tras enviar puede dejar evidencia ambigua/repetición. No hay demostración de exactly-once |
| Timeouts/conexiones | HTTP saliente 15 s; jsReport 60 s; conexión psycopg 5 s por dependencia; subprocess PIN 10 s; Android 4/6 s y respuesta máxima 262144 bytes | B/integrations/http-client.ts:19–25; jsreport.service.ts:61–71; I/app/core/db.py:11–23; I/app/core/pin.py:9–11; VolumeSosSender.java:23–45 | Observado | No pool explícito FastAPI ni statement_timeout/límite de concurrencia; TypeORM deja pool a sus valores implícitos. No se asumen límites efectivos del stack |
| Datos médicos | AES-256-GCM, IV aleatorio de 12 bytes, AAD usuario+columna, identificador de clave; permiso por contacto al despachar | B/perfil/cifrado-medico.ts:18–57; B/integrations/whatsapp/whatsapp-sos-dispatcher.service.ts:85–95,118–119,136–147 | Observado | Contactos, ubicación, texto y otros datos no cubiertos por ese cifrado de campos; claves/retención/respaldo externo pendientes |
| Errores/logs | PG devuelve mensajes genéricos; validación FastAPI omite inputs; WhatsApp enmascara teléfono en log | B/config/postgres-exception.filter.ts:5–16; I/app/core/errors.py:30–50; B/integrations/whatsapp/whatsapp-alert.service.ts:117–118 | Observado | HTTP externo registra hasta 500 caracteres del cuerpo de error; excepciones no controladas pueden llevar detalles a logs. No se leyeron logs ni acreditó redacción integral |
| Auditoría | Cambios administrativos y de usuario; bloquea claves de credenciales en cambios de bitácora; atribución del responsable de ticket desde sesión | B/auditoria/auditoria.service.ts:110–159; B/auditoria/actividad-usuario.ts; I/app/services/tickets.py:68–77 | Observado | No se acreditan auditoría de toda lectura sensible, correlación, protección de logs, retención, alertado y responsables |
| XSS/archivos/SSRF | React y plantillas Handlebars; búsquedas de sinks no localizaron HTML arbitrario/eval en alcance revisado; URLs salientes fijas o del entorno | B/auditoria/plantilla-bitacora.ts:1–4; B/integrations/google-maps/google-maps.service.ts:7,37–49; B/integrations/mindicador/mindicador.service.ts:32–61 | Observado limitado / inferido | No hay demostración de XSS o SSRF explotable. Investigar recursos remotos permitidos a jsReport y plantillas externas; no se inspeccionó su configuración |
| Contenedores | Nest runner USER node y etapas/pruning; FastAPI USER emergen; secretos/env/cachés excluidos del contexto; healthchecks/restart/volúmenes | A/Dockerfile:10–45; I/Dockerfile:1–11; A/.dockerignore:1–28; I/.dockerignore:1–6; A/docker-compose.yml | Observado declarado | Sin límites explícitos CPU/memoria/PIDs/logs, read_only, cap_drop o no-new-privileges en Compose revisado. No se observó privileged ni socket Docker montado |
| Cabeceras/docs | No Helmet/CSP/HSTS configurados en B/main.ts, I/app/main.py ni CSP meta en los tres index.html revisados; docs FastAPI configurables | B/main.ts:11–28; I/app/main.py:14–30; A/apps/{web,mobile,desktop}/index.html | Observado limitado | Podrían imponerse por infraestructura aún no definida; revisar CSP con Firebase/Maps/PayPal y script inline de desktop sin romperlos |
| Backups/dependencias | pg_dump custom + pg_restore --list + SHA-256; .gitignore excluye backups; npm lock v3 y pins Python | A/scripts/backup-db.mjs:26–86; A/.gitignore:11–19; A/docs/DESPLIEGUE.md:93–111 | Observado | Sin cifrado/retención/ACL explícitos en script; restauración no ejecutada. No se localizaron pipelines CI/CD, dependabot/renovate/gitleaks/trivy en rutas Git inventariadas |

### 4.1. Recorridos SQL y privilegios

| Entrada → consulta | Evidencia concreta | Interpretación limitada |
|---|---|---|
| correo de login → QueryBuilder.where con parámetro correo → búsqueda | B/login/login.service.ts:131–139 | Valor separado de SQL; no concatenación del correo en el fragmento revisado |
| ID de contacto + sub → UPDATE/DELETE WHERE contacto_emergencia_id=$1 AND usuario_id=$2 | B/perfil/perfil.service.ts:130–138,150–159 | Parametrización y propiedad en la misma consulta |
| alerta POST → sub/UUID/ubicación/mensaje → psycopg parámetros %s | I/app/services/alertas.py:28–65 | Valores de entrada enlazados, no identificadores de tabla aportados por cliente |
| filtros de ventas → consulta fija LIMIT $5 OFFSET $6 | B/admin/admin-ventas.service.ts:81–126 | Parámetros de filtro; ORDER BY fijo. La exportación pasa limit null y elimina el tope |
| filtros bitácora → andWhere con parámetros nombrados y orden fijo | B/auditoria/auditoria.service.ts:198–223 | No se localizó un sort/columna libre del cliente |
| filtro de trabajadores interpolado → fragmento construido con constantes ROL | B/admin/admin.service.ts:79–86,124–137 | Interpolación presente, pero no originada en usuario en ese recorrido |
| SQL dinámico de secuencias → format %I/%L con tabla/columna de VALUES fijo | A/init.sql:544–547 | Identificadores tratados como identificadores y procedencia fija; no motivo para editar init.sql |

No se encontró SQL dinámico de entrada no confiable en estos recorridos. No se concluye que todo el repositorio esté libre de SQL injection. Un ORM no elimina el riesgo en consultas crudas; los valores se parametrizan y los identificadores dinámicos necesitan una lista permitida. Docker no impide SQL injection.

Las dos APIs usan el mismo DB_USER/DB_PASSWORD/DB_NAME que Compose suministra al inicializar PostgreSQL; no se observó separación declarada de rol de aplicación y migrador. Evidencia: A/docker-compose.yml:6–9,30–34,94–99. La posible amplitud de privilegios es **inferida**; no se consultaron roles, owners, grants, pg_hba, TLS o RLS vivos. DB_SSLMODE=verify-full existe en código, pero el Compose actual no pasa las variables/CA necesarias. No se asume cifrado de la red bridge.

### 4.2. Otros límites de confianza

La verificación PIN FastAPI usa subprocess.run con lista fija, JSON por stdin, sin shell y timeout: no se observó inyección de comandos en ese recorrido (I/app/core/pin.py:6–14). Los scripts administrativos no son endpoints web; no se ejecutaron.

No se identificó una URL arbitraria del usuario usada por fetch del backend en los servicios de Maps/mindicador/PayPal revisados; los destinos son constantes o configuración de servidor. /reports permite seleccionar plantilla por nombre y data arbitraria de objeto: hace falta conocer las plantillas y capacidades efectivas de jsReport antes de concluir sobre lectura de archivos, ejecución, HTML o SSRF. No se entró a jsReport Studio ni se consultaron plantillas.

FileProvider Android no se exporta, pero file_paths.xml permite rutas amplias external-path y cache-path con path punto. La concesión de URI y los consumidores no se analizaron exhaustivamente; es revisión pendiente, no lectura arbitraria demostrada. Evidencia: A/apps/mobile/android/app/src/main/AndroidManifest.xml:38–44 y res/xml/file_paths.xml:2–4.

La copia nativa de sesión se cifra, desactiva redirecciones HTTP y limita respuesta; permanecen permisos/plugins privilegiados y la copia de localStorage. No se extrajeron preferencias del teléfono, APK ni credenciales de firma. Configuración pública VITE de Firebase/Maps/PayPal no se clasifica automáticamente como secreto: sus restricciones de dominio/API, cuotas y permisos deben verificarse en el proveedor.

## 5. Señales de riesgo preliminares

Prioridades provisionales: P1 = revisar antes de publicar el componente afectado; P2 = mejora relevante; P3 = seguimiento. «Candidato a bloqueo» es una condición pendiente de resolver/descartar y no un dictamen de vulnerabilidad explotable ni de seguridad global.

### 5.1. Candidatos a bloqueo de publicación

| ID / prioridad / confianza | Componente y condición observada | Impacto potencial | Evidencia | Controles compensatorios | Qué confirma o descarta |
|---|---|---|---|---|---|
| PRE-SEC-001 / P1 / alta sobre código, explotación no verificada | /reports, /payments/paypal y /maps carecen de guarda; no hay guarda global en arranque. La vía PayPal genérica no comprueba propietario ni reserva, a diferencia de /compras | Uso de credenciales/cuotas del servidor, captura solicitada sin vínculo local, render costoso o acceso a plantillas no previstas | B/integrations/{jsreport,paypal,google-maps}/*.controller.ts; B/main.ts:11–28; B/app.module.ts:27–85; C/emergen-api.ts:35–49,90–100 | DTO, timeout, regex de orderId; /compras sí protege propiedad/precio. El proveedor puede rechazar operaciones | Inventario de consumidores y política pública; retirar/restringir vías genéricas o aplicar controles equivalentes; comprobación aislada de rechazo y cero llamadas externas |
| PRE-SEC-002 / P1 / alta como candidatos versionados; vigencia desconocida | Copias D/.env y D/example.env tienen literales no vacíos de DB_PASSWORD, JWT_SECRET, PAYPAL_SECRET y JSREPORT_PASSWORD; también claves Maps y configuración Firebase pública | Si siguen válidos: acceso a integraciones/BD o firma de sesiones; expansión del alcance por historia Git | D/.env:5,13,25,39,42,53,63,68; D/example.env:5,13,25,39,42,56,66,71; git ls-files confirmó seguimiento | .env activa y sesión WhatsApp ignoradas; contextos Docker actuales excluyen .env | Propietario debe clasificar cada valor sin exponerlo, revisar alcance y rotación/revocación. Retirar del archivo no demuestra que dejó de ser utilizable; no se probaron credenciales |
| PRE-SEC-003 / P1 / alta en metadatos | PostgreSQL activo publica 5433 en todas las interfaces, mientras Compose actual lo limita a loopback; jsReport activo publica 5488 de forma amplia | Exposición accidental de BD/administración y desalineación del despliegue | docker ps filtrado, sección 2.2; A/docker-compose.yml:10–14,52–55 | Autenticación de servicios y firewall podrían limitar alcance; no verificados | Alinear manifiesto y contenedores, definir interfaz/red permitida y reglas IPv4/IPv6; revisar configuración efectiva sin leer secretos. No se probó acceso desde otra red |
| PRE-SEC-004 / P1 / alta en archivos, fallo inferido | Cierre SOS depende de Node + scripts/pin-bcrypt.cjs + bcrypt; Dockerfile FastAPI solo instala Python y copia app/run.py | En una imagen construida así, la verificación PIN puede devolver 503 e impedir finalizar un SOS legítimo | I/app/core/pin.py:6–14; I/app/core/config.py:8–10; I/Dockerfile:1–11; I/README.md:5 | Local con Node/monorepo instalado puede funcionar; existen pruebas locales | Empaquetar un verificador consistente y comprobar 1 PIN válido/1 inválido en contenedor aislado; no se construyó/ejecutó esa imagen ahora |
| PRE-SEC-005 / P1 / alta en diseño; hosting no verificado | jsReport depende por defecto de host.docker.internal; WhatsApp requiere proceso/disco persistentes; hosting, TLS y red pública pendientes | Traslado incompleto: reportes dependen del PC o el emisor pierde sesión/disponibilidad | A/docker-compose.yml:52–64; A/docs/DESPLIEGUE.md:13–17,89–91; B/integrations/whatsapp/whatsapp.module.ts:17–20 | Configuración por entorno, volumen de sesión, health/sos y validación de arranque | Diseño aprobado del hosting; rutas privadas a BD/jsReport; persistencia/uptime WhatsApp; contrato health y artefacto asociado a SHA. No reiniciar servicios existentes para demostrarlo |
| PRE-SEC-006 / P1 / media-alta en alcance revisado | Sin limitador explícito de login/registro y varias integraciones; sin límite global de cuerpo/concurrencia/tiempo SQL localizado; reportes con resultados sin tope | Agotamiento de CPU bcrypt, conexiones, memoria, costos o indisponibilidad de SOS por abuso de otra operación | B/main.ts:11–28; B/login/login.service.ts:127–139; B/integrations/jsreport/dto/generate-report.dto.ts:11–12; B/admin/admin-ventas.service.ts:132–138; I/app/core/db.py:11–23; A/docker-compose.yml | Campos DTO, algunas paginaciones, timeouts salientes; reglas de SOS e idempotencia | Definir presupuestos por operación y límites de infraestructura; evidencia de configuración + casos mínimos con reloj/mocks. Resistencia bajo carga queda para otro integrante |

### 5.2. Mejoras y decisiones pendientes

| ID / prioridad / confianza | Condición y componente | Impacto potencial / evidencia | Compensatorios | Confirmación o decisión necesaria |
|---|---|---|---|---|
| PRE-SEC-007 / P2 / alta | JWT sin revocación individual localizada; W/M localStorage; cambio/reset de contraseña no modifica versión de sesión | Token extraído podría seguir válido hasta exp; B/login/login.service.ts:306–353; B/login/login.module.ts:30–37; clientes de sección 4 | Exp por defecto 2 h; usuario/rol/estado releídos; token de panel en memoria y copia Android cifrada | Decidir cierre de sesiones, pérdida del dispositivo y suspensión total; prueba aislada de semántica tras cambio/reset/logout |
| PRE-SEC-008 / P2 / alta | PIN de Nest 3/5 min y de cierre SOS 5/15 min comparten fila; antispam IP vive en proceso y confía en client.host | Bloqueo cruzado, cuotas inconsistentes entre réplicas o usuarios detrás de proxy; B/login/pin-principal.ts:6–14; I/app/services/alertas.py:85–96; MC:23–32; I/app/core/limite.py:8–24 | Contadores PIN en BD; límite por correo en BD con lock | Unificar o documentar política por finalidad; IP solo desde proxy autorizado; expiración de claves y almacenamiento compartido según escala |
| PRE-SEC-009 / P2 / alta | Worker envía dentro de transacción con locks; reintentos WhatsApp y marcas de envío no prueban exactamente una entrega | Locks prolongados, duplicado o pérdida ambigua si red/commit falla; B/integrations/whatsapp/whatsapp-sos-dispatcher.service.ts:80–125; whatsapp-alert.service.ts:17–18,104–118 | Lotes ≤5, SKIP LOCKED, no concurrencia interna de ciclos, unicidad de cola | Política de recuperación/confirmación y reintento; prueba unitaria con fallo simulado, sin mensaje real; ampliación de resiliencia por responsable posterior |
| PRE-SEC-010 / P2 / alta en declaración | BD comparte credencial bootstrap/apps; Compose sin límites de recursos/endurecimiento explícitos; DB TLS no conectado en Compose | Mayor alcance de una intrusión y consumo no acotado; A/docker-compose.yml:6–9,30–60,94–107,126–133; B/app.module.ts:54–63 | Usuarios no root en APIs, multietapa, .dockerignore, synchronize=false, red bridge | Rol mínimo por tarea, decisión de TLS privado/gestionado, límites compatibles con SOS y permisos/retención de volúmenes; privilegios vivos no inspeccionados |
| PRE-SEC-011 / P2 / media-alta | Docs FastAPI activadas por defecto; cabeceras no localizadas; logs externos guardan parte del cuerpo de error | Mayor información expuesta o datos sensibles en logs; I/app/main.py:14–22; A/docker-compose.yml:103; B/integrations/http-client.ts:38–39 | Errores HTTP/SQL genéricos; auth declarada en OpenAPI; teléfono enmascarado | Desactivar/proteger docs según público; CSP/cabeceras en capa definida; logs con campos permitidos y retención; revisar usando datos sintéticos |
| PRE-SEC-012 / P1 si hay cuentas demo en destino; P2 mientras no se confirme / media | Seed de desarrollo contiene credenciales conocidas y roles de demostración; no se localizó una guarda de entorno en ese script | Si se ejecuta o migra a producción: acceso indebido; A/scripts/seed-dev.cjs:9–20,32–42; A/docs/cuentas-temporales-pruebas.md:1–12 | Script manual; no se ejecutó; hash bcrypt no elimina el riesgo de contraseña conocida | Identificar cuentas sintéticas mediante procedimiento del propietario, excluirlas del destino y bloquear seeds fuera de test/dev. No consultar registros personales para este levantamiento |
| PRE-SEC-013 / P2 / media | Respaldo local custom validado solo por listado; sin cifrado/ACL/retención explícitos; datos médicos necesitan claves externas | Fuga de backup o recuperación incompleta; A/scripts/backup-db.mjs:26–86; A/docs/DESPLIEGUE.md:107–111 | Archivo nuevo sin sobrescribir, SHA-256, backups ignorados, documentación advierte restauración pendiente | Política de acceso/cifrado/offsite/RPO/RTO y restauración aislada por responsable; preservar claves existentes, no reemplazarlas al desplegar |
| PRE-SEC-014 / P2 / media | Python con dependencias transitivas sin lock/hashes; imágenes de tags móviles y Baileys RC; no pipeline de revisión localizado | Reproducibilidad y problemas conocidos sin evaluación; I/requirements-runtime.txt:1–6; A/Dockerfile:2–6; A/docker-compose.yml:3; A/apps/backend/package.json | package-lock v3; versiones directas exactas; Docker multietapa | Revisar advisories/SBOM/escaneo de imágenes de forma separada de ataques; fijar política de actualización y procedencia sin reparar automáticamente |
| PRE-SEC-015 / P3 / media | ELECTRON_RENDERER_URL no acotada por modo y FileProvider Android amplio; artefactos release sin inspección | Ampliación de confianza si distribución conserva configuración de desarrollo o concede URIs impropias | Sandbox Electron, aislamiento de contexto, cleartext prohibido en main Android; A/apps/desktop/electron/main.cjs:6–35; Android res/xml/file_paths.xml:2–4 | Revisar empaquetado, firma, enlaces/navegación y necesidad de rutas FileProvider; no se demostró explotación |

Estas señales no son CVE ni resultados de pentest. No se propone modificar init.sql: cualquier necesidad de cambio propio en ese archivo se presentará al usuario como sugerencia, salvo autorización expresa posterior.

## 6. Base para el fortalecimiento siguiente

### 6.1. Archivos prioritarios y criterios de aceptación

| Archivos/área | Motivo | Criterio concreto para el siguiente encargo |
|---|---|---|
| B/main.ts, B/app.module.ts; controladores B/integrations/jsreport, paypal, google-maps; C/emergen-api.ts | Resolver PRE-SEC-001/006 manteniendo consumidores | Cada entrada tiene una política explícita: pública con cuota y datos limitados o autenticada/autorizada. Una vía pública no puede saltarse propiedad/precio/estado exigidos por la compra vigente. Render limitado a plantillas/datos autorizados |
| D/.env, D/example.env; A/example.env; scripts/seed-dev.cjs | Secretos históricos y cuentas conocidas | Solo nombres/placeholders en ejemplos/documentos; propietario evalúa revocación de valores privados. Seeds no pueden actuar sobre staging/producción y las cuentas de demostración quedan excluidas del destino. No pedir credenciales en el chat |
| A/docker-compose.yml, Dockerfile; I/Dockerfile; I/app/core/pin.py | Publicación real, recursos y cierre SOS | BD/jsReport accesibles solo desde redes definidas; FastAPI contiene todos los requisitos del verificador PIN. Configuración y artefacto se vinculan a SHA; DB_SSLMODE/CA funcionan en ambos servicios cuando corresponda |
| B/config/runtime-config.ts; I/app/core/config.py; A/scripts/api-environment.mjs; configuraciones Vite | Evitar desarrollo en distribución | Entorno explícito, secretos solo en servidor, APIs HTTPS correctas y deployment ID coincidente; docs/cabeceras/errores con política del hosting; no IP LAN, HTTP ni ubicación simulada en builds de distribución |
| B/login; I/app/dependencies/auth.py; clientes session; VolumeSosStore.java | Sesiones/roles/acceso parcial | Política de expiración, logout, reset y pérdida del dispositivo definida; rol/propietario siempre del servidor; acceso parcial sigue pudiendo emitir SOS y solo cambia lo autorizado |
| I/app/core/limite.py; MC; B/main.ts; servicios de reportes/SQL | Presupuestos de recursos por operación | Límites finitos de bytes/estructura, paginación/exportación, coste login/terceros y conexiones/tiempos SQL; identidad IP solo desde proxy confiable. No bloquear SOS legítimo por cuota global compartida con operaciones costosas |
| B/integrations/whatsapp/{whatsapp-sos-dispatcher.service.ts,whatsapp-alert.service.ts,whatsapp-auth-state.store.ts}; I/app/services/alertas.py | Confiabilidad, privacidad y continuidad | Preservar idempotencia, activación/finalización, consentimiento médico y persistencia de sesión. Documentar estados ambiguos de entrega y recuperación sin reenvíos automáticos masivos |
| A/scripts/backup-db.mjs; docs/DESPLIEGUE.md; configuración del proveedor | Recuperación y operación | Respaldo con acceso/retención/cifrado definidos, claves médicas conservadas aparte y restauración aislada demostrable; responsables, alertado y RPO/RTO acordados |
| A/init.sql y migraciones | Integridad y reglas protegidas | Mantener synchronize=false. No editar init.sql; si hace falta un cambio propio, entregar sugerencia al usuario. Migraciones futuras solo en el encargo autorizado y entorno aislado, nunca aplicar ahora |

Antes de cualquier comprobación futura que arranque aplicación: usar EMERGEN_ENVIRONMENT=test, una base y volumen nuevos con datos sintéticos, sin montar .env, backups ni auth_info_baileys reales. Sustituir transporte WhatsApp, PayPal, Firebase, Maps, mindicador y jsReport por dobles de prueba **antes del bootstrap**. WHATSAPP_ENABLED=false por sí solo no sustituye impedir todo egreso de red. Bloquear salida a terceros y verificar que los dobles registran cero llamadas cuando se rechaza una operación. No usar staging real para simular envíos si su validación exige WhatsApp activo; mantener configuración test aislada.

Funciones a preservar: registro/verificación/recuperación; login por contraseña del principal + perfil/PIN y PIN temporal; personal A/S y acceso parcial; gestión de máximo cinco apadrinados y plan/cupos; contactos y consentimiento de antecedentes; ficha médica cifrada con claves existentes; SOS sin ubicación cuando no se obtiene GPS, ubicación real solo con permiso, activación y cierre con PIN efectivo, expiración/idempotencia; secuencia nativa de volumen; tickets y transiciones; formulario público de contacto; reportes autorizados; conciliación de pagos; arranque, health y persistencia de servicios. Las pruebas deben conservar mensajes y estados esperados, sin convertir un rechazo de red o proveedor en confirmación de entrega.

### 6.2. Pruebas existentes y herramientas disponibles

Localizadas, **no ejecutadas**: 28 archivos unitarios .spec en B, 11 archivos e2e en A/apps/backend/test, 9 test_*.py en I/tests, 15 pruebas en web/src, 9 en mobile/src y 4 en api-client/src. Estos son archivos, no casos aprobados.

| Cobertura real que describe el código de prueba | Evidencia | Limitación/prerrequisito |
|---|---|---|
| Permisos A/S, usuario común, estado parcial, relectura de rol | B/admin/admin-acceso.spec.ts:79–148 | Prueba localizada; no valida despliegue, proxy ni todas las rutas de integración |
| Selección de perfil propio/ajeno, PIN temporal y bloqueo | B/login/login-pin.spec.ts:61–105; A/apps/backend/test/apadrinados-pin.db.e2e-spec.ts | La suite de BD requiere DB_E2E; crea/borrar fixtures |
| JWT vencido/audiencia/emisor; propietario SOS y PIN efectivo; idempotencia | I/tests/test_auth.py:5–25; test_alertas.py:20–115 | I/tests/conftest.py:12 fija localhost:5433; no asegura una base separada por su nombre. Hay INSERT/DELETE y pruebas concurrentes |
| Propiedad y consentimiento de contactos/ficha; integridad de compras | A/apps/backend/test/contactos-duplicados.db.e2e-spec.ts; ficha-medica.db.e2e-spec.ts; compras.db.e2e-spec.ts | Crear entorno y transporte aislados antes de ejecutar; no usar configuración actual de desarrollo |
| Antispam y estados de soporte; Swagger/CORS/configuración | I/tests/test_mensajes_contacto.py:19–78; test_tickets_soporte.py:62–163; test_deployment_config.py:12–35; test_swagger_auth.py:6–30 | No acredita tasa distribuida ni resistencia; tests pueden modificar BD |
| Cifrado AES-GCM y contratos/errores HTTP de proveedores simulados | B/perfil/cifrado-medico.spec.ts; B/integrations/http-client.spec.ts; A/apps/backend/test/integrations.e2e-spec.ts | Verificar dobles antes del bootstrap; no equivale a proveedor real |
| Consentimiento médico y retry del envío; sesión/errores SOS del móvil | B/integrations/whatsapp/emergency-alert.message.spec.ts:15–116; whatsapp-alert.service.spec.ts:40–133; A/apps/mobile/src/lib/session.test.ts:9–43 | Mocks/fakes; no acreditan entrega telefónica, radio/GPS o disponibilidad real |
| Carreras y constraints | I/tests/test_concurrencia.py; A/pruebas_init.sql | Existen pero se reservan según el cambio/etapa; no lanzar la batería concurrente en fortalecimiento por defecto |

Versiones disponibles: Git 2.54.0.windows.1, Node 24.21.0, npm 11.19.0, Python 3.12.10, Docker CLI 29.9.2 y Compose v5.6.1. En dependencias instaladas se localizaron Jest/Vitest, pytest 9.1.1 y httpx 0.28.1. Get-Command no localizó psql, pip-audit, trivy, gitleaks o semgrep en PATH; no demuestra ausencia en otros entornos. No se instalaron herramientas.

Comandos **documentados o declarados**, no ejecutados en esta etapa; seleccionar solo los pertinentes a cambios posteriores:

| Propósito | Comando y prerequisito |
|---|---|
| Build API | npm run build --workspace=backend; Node/npm/dependencias ya preparadas |
| Build cliente afectado | npm run build --workspace=web o desktop; móvil npm run build --workspace=mobile; seleccionar el modo de entorno correcto |
| Unitarias Nest concretas | npm test --workspace=backend -- --runInBand <archivo.spec.ts>; elegir caso/proveedor simulado |
| Unitarias cliente | npm test --workspace=@repo/api-client -- <archivo>; móvil npm run test.unit --workspace=mobile -- --run <archivo> |
| Integración Nest concreta | npm run test:e2e --workspace=backend -- --runInBand <archivo>; DB_E2E solo tras aislar BD, LIVE_APIS desactivado |
| Python concreta | Desde I: .venv/Scripts/python.exe -m pytest tests/<archivo>.py -k <caso>; adaptar primero fixtures para apuntar exclusivamente a BD aislada |
| Preparación hosting | npm run check:environment -- --mode production; npm run build:hosting; validan disponibilidad y pueden hacer lecturas/OPTIONS. Usar solo entorno autorizado, no ejecutados aquí |
| Arranque documentado | docker compose up -d --build backend internal-api; backend start:dev o start:prod; FastAPI python run.py. Son operaciones futuras, no parte de este levantamiento |
| Copia/traslado documentados | npm run backup:db y migrate:deployment; no son pruebas de seguridad ni deben ejecutarse por defecto al fortalecer código |

Fuentes de comandos: A/package.json:4–16; A/apps/backend/package.json:8–21; A/apps/{web,mobile,desktop}/package.json, scripts; I/README.md:5–29; A/docs/DESPLIEGUE.md:19–25,58–109. LIVE_APIS habilita proveedores reales (A/apps/backend/test/integrations.live.e2e-spec.ts:16–19); conservarlo desactivado. No ejecutar comandos que solo aparecen en documentos antiguos para reconstruir cuentas.

### 6.3. Pequeñas comprobaciones propuestas, condicionales a una corrección concreta

No constituyen una campaña. Ejecutar únicamente la fila necesaria para un cambio aplicado, con el mínimo de casos. Todos los casos secuenciales, sin carga, concurrencia, fuerza bruta, fuzzing ni explotación encadenada; cero solicitudes a terceros y cero datos reales.

| ID / motivo y control | Entorno y datos sintéticos | Alcance mínimo y máximo | Resultado esperado |
|---|---|---|---|
| T1: comprobar la guarda de una ruta modificada de integración | App in-process, JWT de prueba A y usuario común; servicios externos falsos | Por handler: sin sesión y sesión permitida; añadir rol prohibido solo si corresponde. Máximo 3 casos/solicitudes por handler y 6 por corrección | 401/403 antes de llamar al proveedor; el permiso válido conserva respuesta. No inferir cobertura de rutas no probadas |
| T2: preservar propiedad al cambiar servicio/consulta | Dos usuarios de prueba, un recurso propio y uno ajeno en BD desechable; dispatcher desactivado/sustituido | 2 casos, máximo 2 solicitudes | Propio funciona; ajeno 404/403, sin modificación ni notificación. Elegir solo el recurso afectado por la corrección |
| T3: verificar limitador sin repetir intentos | Unidad con reloj falso y contador precargado al umbral; IP/usuario sintéticos | 3 llamadas de función, 0 HTTP: bajo umbral, agotado, ventana vencida | Permite/rechaza/libera según contrato; cuota SOS separada de una operación costosa. No medir resistencia con este caso |
| T4: comprobar esquema/tamaño nuevo | Parser/DTO in-process; umbral pequeño de prueba, objeto sintético sin contenido sensible | Máximo 3 casos: válido, campo extra o profundidad indebida, bytes límite+1 | Acepta válido, rechaza antes de negocio/proveedor; no construir un cuerpo grande para saturar |
| T5: conservar parametrización al modificar SQL | Mock de driver/repositorio y dos valores de texto, uno con apóstrofo; identificador de orden permitido fijo | 2 casos unitarios, 0 HTTP y 0 consultas de producción | Estructura SQL constante y valores separados; un identificador no permitido se rechaza si ese selector fue modificado. Sin payload de explotación |
| T6: resolver empaquetado PIN de FastAPI | Contenedor nuevo/aislado sin red a terceros, hash generado solo para prueba; usuario/PIN sintéticos | 2 casos secuenciales del verificador: válido e inválido; como máximo 2 solicitudes de cierre si se necesita integrar | Verificador disponible; cierre propio válido, rechazo del inválido sin cerrar. Ningún 503 por dependencia omitida; transporte falso |
| T7: comprobar una política nueva de sesión | JWT de firma test, cuenta ficticia; almacenamiento cliente descartable | 2 casos unitarios/in-process, máximo 2 solicitudes: antes/después del evento elegido (logout/reset/revocación) | Sesión posterior refleja política acordada; no revocar por accidente el acceso parcial o SOS permitido |
| T8: preservar cola/consentimiento tras cambiar dispatcher | Doble WhatsApp, una fila sintética y reloj falso; sin sesión Baileys real | Máximo 3 casos unitarios, 0 HTTP: éxito, fallo simulado, consentimiento médico desactivado | Estado coherente, reintentos acotados y datos médicos omitidos cuando corresponde; no atribuir entrega real |

Las comprobaciones de configuración, acceso de rol DB, artefactos y cabeceras deben preferir inspección y assertions de configuración. Si una demostración requiere reconfigurar servicios existentes, envío real, ensayo masivo o riesgo operativo, registrar el vacío y dejarla para su responsable. La revisión de vulnerabilidades de dependencias/imágenes es una tarea de fortalecimiento separada, usando advisories oficiales y versiones resueltas; no actualizar automáticamente ni atribuir CVE a partir del nombre del paquete.

### 6.4. Ataques y pruebas amplias para el otro integrante

Pendientes, sin desarrollar ni ejecutar en este encargo o como requisito de cierre del fortalecimiento:

- Evaluación ofensiva de API/roles/objetos sobre el despliegue autorizado: necesita catálogo final, cuentas sintéticas por rol/familia y objetivos públicos definidos.
- Fuerza bruta, abuso automatizado y resistencia bajo carga/saturación: necesitan umbrales de emergencia y capacidad esperada, presupuesto, ventana y monitoreo. T3 no sustituye esa evidencia.
- Evaluación amplia de SQL injection, XSS/SSRF y motor jsReport: necesita roles mínimos, plantillas efectivas, rutas realmente publicadas y destino de prueba; los recorridos estáticos no la completan.
- Resiliencia distribuida y fallos encadenados de cola, red, réplicas, pagos y sesiones: necesita staging representativo, política de recuperación y evidencia de entrega sintética.
- Evaluación del perímetro, TLS/red IPv4/IPv6, segmentación y exposición desde fuera: necesita dominio/proveedor/firewall y autorización específica; docker ps no demuestra acceso externo.
- Revisión de artefactos Android/Electron, navegación/puentes/almacenamiento y cadena de actualización: necesita builds release firmados de prueba, hashes y configuración final, sin claves privadas.
- Revisión amplia de proveedores/webhooks si se agregan, recuperación e incidentes: necesita contratos, responsables y procedimientos. No dar por validado un webhook que no se encontró implementado.

### 6.5. Referencias de cobertura consultadas

Consulta: 29-10-2026. Se usaron como guías de lectura, no como certificación ni cobertura completa:

- [OWASP API Security Top 10, edición 2023](https://owasp.org/www-project-api-security/): acceso por objeto/propiedad y función se relaciona con guards, propietario y DTO; autenticación con JWT/PIN; recursos y flujos con reportes, login y SOS; configuración/inventario con Compose y contenedores; SSRF/consumo externo con jsReport y clientes HTTP. PRE-SEC-001,006–011 cubren señales relacionadas, no pruebas de los diez riesgos.
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html), guía viva sin versión fijada: motivó separar parámetros de valores, identificadores y privilegios en 4.1. No demuestra seguridad por usar TypeORM ni contenedores.
- [OWASP Docker Security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html), guía viva: se aplicó a usuario, capabilities, recursos, volúmenes/contexto y secretos; PRE-SEC-003/010/013/014. No se transfieren al host Windows afirmaciones específicas de iptables/UFW.
- [Docker, publicación de puertos](https://docs.docker.com/engine/network/port-publishing/), documentación viva, contraste con CLI local 29.9.2: diferencia publicación host y puerto del contenedor en 2.2; no sustituye revisar firewall efectivo.
- [NestJS, ValidationPipe](https://docs.nestjs.com/techniques/validation), documentación viva consultada para el stack Nest 12.0.4: contraste de whitelist/transform con B/main.ts. La evidencia de activación procede del registro local y no de la mera dependencia instalada.

No se verificaron comportamientos dependientes de versión por ensayo. La ruta auxiliar de Swagger se corroboró solo en la declaración del FastAPI 0.156.2 instalado, no en el servidor.

## 7. Preguntas y decisiones pendientes

No requieren entregar contraseñas, tokens, claves, archivos .env o datos de usuarios al chat.

1. **Despliegue y perímetro:** ¿qué proveedor, dominios y público tendrá cada origen? ¿Quién administra proxy, TLS/renovación, firewall IPv4/IPv6 y las reglas de BD/jsReport? Definir si las APIs reciben tráfico directo o solo desde ingreso controlado.
2. **Datos y secretos:** ¿el destino migrará datos reales? ¿Quién inventaría y revoca los posibles secretos históricos, excluye cuentas demo y custodia las claves médicas y sesión WhatsApp? La vigencia de los literales hallados no se resolvió.
3. **Continuidad SOS:** ¿qué disponibilidad y retraso máximo son aceptables, quién monitorea /health/sos y quién atiende fallos del emisor/cola? ¿Se garantiza un proceso y disco persistentes y un único dueño de la sesión WhatsApp?
4. **Política de APIs:** ¿se necesitan públicamente /reports y /payments/paypal, o solo las vías de negocio protegidas? ¿Qué cuotas, plantillas y consumidores legítimos deben conservarse? ¿Mapas/indicadores requieren acceso anónimo?
5. **Identidad y recuperación:** ¿qué significa suspender una cuenta frente a acceso parcial? ¿Qué sesiones deben revocarse al cambiar/restablecer contraseña o perder el dispositivo? ¿MFA se exige para personal y en qué proveedor? ¿Cómo se mantiene consistente un cambio de correo entre BD/Firebase?
6. **Escala y recursos:** ¿usuarios/alertas simultáneos previstos, réplicas, cuotas de terceros y costo máximo aceptable? ¿Cómo distinguir repetición accidental, abuso y SOS legítimo sin un bloqueo global? Estos datos determinan contadores/pool/límites; no se asumieron cifras.
7. **Staging y pruebas:** ¿quién provee un entorno aislado sin datos reales ni salida a integraciones y quién hará los ataques/pruebas amplias posteriores? Confirmar alcance/ventana autorizados aparte.
8. **Recuperación y privacidad:** ¿RPO/RTO, retención de ubicaciones, mensajes, bitácora y backups; cifrado, acceso y restauración? ¿Quién conserva/rota claves sin volver ilegibles fichas históricas? No se asumieron obligaciones normativas específicas.
9. **Distribución:** ¿quién firma/publica APK y Electron y mantiene actualizaciones? ¿Qué build/SHA está instalado y cuál se desplegará? Debug LAN no acredita distribución release.
10. **Operación continua:** ¿responsables de actualizaciones, advisories, incidentes, presupuesto de proveedores y revisión de accesos? ¿Quién valida tarifas comerciales y pagos Sandbox completos? La documentación de integración antigua no acredita el estado actual.

## 8. Bloque de traspaso a otra IA

Objetivo del siguiente encargo: fortalecer EMERGEN según su implementación real, corregir controles prioritarios y preservar sus funciones, sin convertir el trabajo en una campaña de ataques.

Snapshot: C:/Users/gonza/EMRGEN, rama alonso, HEAD 6c228e6566487c265231c0f99dcc12de7a305557; al comenzar solo estaban sin seguimiento A/docs/INFORME_REVALIDACION_QA_2026-10-29.md y A/docs/qa/. A significa Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación. Levantamiento del 29-10-2026, America/Santiago; solo estática y metadatos Docker. Este documento es la única escritura. No se ejecutó ninguna prueba ni se confirmó seguridad para producción.

Stack confirmado: Node 24.21.0/npm 11.19.0, Turbo 2.11.2, NestJS 12.0.4, TypeORM 1.1.1/pg 8.23.0, PostgreSQL declarado 15-alpine, FastAPI 0.156.2/Python 3.12, React 19.2.8/Vite 8.3.0/Ionic 9.0.4, Capacitor Android 8.5.2/geolocation 8.2.4, Electron 44.4.3. Versiones de paquetes seleccionados coinciden con lock/metadatos instalados; no se consultaron CVE ni se atribuyeron a imágenes activas.

Arquitectura: clientes llaman directamente a NestJS y FastAPI. Ambas aceptan JWT HS256 emitido por NestJS con issuer/audience y releen usuario de PostgreSQL. Firebase verifica registro/recuperación mediante ID tokens RS256, pero no es el JWT propio de API. FastAPI crea alerta y cola en transacción; NestJS despacha por Baileys a WhatsApp con disco persistente. jsReport, PayPal, Maps y mindicador son integraciones salientes. No se localizó proxy de producción; hosting, dominio, TLS, firewall, escala y responsables siguen pendientes.

Controles a conservar: DTO global whitelist/rechazo extra, Pydantic extra=forbid, roles A/S en servidor, propiedad por sesión y vínculo, bcrypt coste 12, PIN con bloqueo persistente, idempotencia SOS/una alerta activa, reservas e idempotencia de compra, synchronize=false, AES-256-GCM con AAD y consentimiento médico por contacto, usuarios no root y .dockerignore. El acceso parcial es funcional: no debe rechazarse universalmente. El flujo actual es contraseña del principal → selección de perfil → PIN, no login independiente del apadrinado.

Prioridades: PRE-SEC-001 rutas genéricas de PayPal/reportes/Maps sin guardas; PRE-SEC-002 posibles secretos privados versionados en copias documentales Docker, valores deliberadamente omitidos; PRE-SEC-003 BD activa publica 5433 en todas las interfaces aunque Compose actual declara loopback, y jsReport publica 5488; PRE-SEC-004 verificador PIN FastAPI depende de Node/helper/bcrypt ausentes del Dockerfile Python; PRE-SEC-005 dependencia del PC/persistencia y topología de hosting; PRE-SEC-006 presupuestos de recursos/antiabuso insuficientemente definidos. También revisar sesiones/almacenamiento, contadores compartidos, cola, privilegios, logs/docs, seeds, backups y cadena de dependencias.

No asumir que los contenedores ejecutan este HEAD: docker ps mostró NestJS, PostgreSQL y jsReport, sin contenedor FastAPI. No se inspeccionaron procesos locales, entornos, privilegios/filas de BD, logs ni artefactos release. La tabla contiene 64 rutas NestJS, 16 FastAPI de negocio y 2 de salud, más documentación; las rutas efectivas de servicios viejos/proxy no se comprobaron.

Restricciones: respetar AGENTS.md; no editar, regenerar o reformatear init.sql por iniciativa propia; si hace falta, presentar sugerencias y esperar autorización específica. Commits/push/publicación corresponden al usuario. No exponer secretos, hashes, datos personales, teléfonos ni coordenadas. No sustituir claves médicas existentes ni borrar volúmenes. Cambios del fortalecimiento solo bajo el nuevo encargo, no aplicar migraciones/seed/instalaciones implícitamente sobre servicios existentes.

Preservar login y recuperación, PIN temporal/parcial, vínculos y cupos, administración/soporte, perfil/antecedentes/contactos, alertas con/sin GPS, activación/finalización/volumen, pagos/conciliación, reportes y arranque. Evitar envíos reales mediante dobles instalados antes de bootstrap, DB/volúmenes sintéticos y salida de red bloqueada. Las suites existentes pueden escribir/borrar datos y algunas apuntan a localhost:5433; aislar fixtures antes de ejecutarlas.

La siguiente etapa solo debe incluir pequeñas comprobaciones justificadas por cada corrección importante: unitarias/integración focalizada, datos sintéticos, entorno aislado, casos/solicitudes finitos y secuenciales con los máximos de 6.3. No ejecutar toda la batería por defecto ni interpretar el rechazo de un caso como validación integral. **Otro integrante realizará los ataques y pruebas amplias en una etapa posterior**; fuerza bruta, fuzzing, explotación, carga/saturación, evaluación ofensiva extensa y fallos encadenados no forman parte del fortalecimiento ni fueron realizados aquí.

