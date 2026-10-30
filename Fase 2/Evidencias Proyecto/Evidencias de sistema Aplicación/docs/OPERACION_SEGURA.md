# Operación y despliegue seguro de EMERGEN

Referencia preparada el 30-10-2026. Ningún comando de aplicación o rollback de este documento se ejecutó durante el fortalecimiento. El responsable debe aprobar destino, ventana y pasos concretos antes de aplicarlos. El resultado de las comprobaciones está en FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md.

## Alcance y condiciones previas

La referencia docker-compose.production.yml es independiente del Compose local. Modela PostgreSQL propio en red privada y APIs publicadas en loopback para un ingreso HTTPS del host. No configura certificados del proveedor ni el servidor PostgreSQL TLS. Si el destino usa BD gestionada, ingreso en contenedores u otra topología, adaptar y revisar las conexiones/redes antes de usarla; no asumir DB_HOST=db fuera de esa referencia. FastAPI también debe ser accesible a los clientes mediante su origen autorizado.

Antes de operar deben estar definidos proveedor/dominios, terminación y renovación TLS, ingreso IPv4/IPv6, staging, escala, responsables, datos reales, RPO/RTO, retención y custodia de secretos. Registrar SHA revisado y huella del delta sin commit, imágenes por digest, esquema/migraciones y build del cliente. Los bundles security-check contienen configuración sintética: no distribuirlos.

Estado actualizado en la reanudación del 30-10-2026: H2–H5 confirmados. Se recuperó la evidencia de instalación limpia en copia independiente Windows x64: npm ci, lock intacto, Electron 44.9.1 adquirido explícitamente con checksums oficiales, builds backend/desktop, CORS 6/6 y panel nativo 6/6 con APIs simuladas. Los 568 archivos del snapshot coincidían al reanudar. El bloqueo EBUSY estaba cerrado y no se repitió su reparación. Instalación en cada equipo, otras plataformas, empaquetado/firma, aceptación con servicios reales y publicación siguen pendientes; consultar el cierre vigente de [FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md](FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md).

## Preparación local tras incorporar H2–H5

En una copia inactiva o aislada, desde A: `npm ci --no-audit --no-fund` y después `node node_modules/electron/install.js`. Paquete y ejecutable son pasos distintos; el instalador local resuelto conserva los checksums incluidos y descarga desde releases oficiales. La adquisición requiere red/proxy autorizado; las pruebas posteriores bloquean egreso a proveedores. No reemplazar dependencias en uso ni cerrar aplicaciones automáticamente.

Actualizar también el venv propio Windows/Python 3.12 con `.\services\internal-api\.venv\Scripts\python.exe -m pip install -r services/internal-api/requirements.txt` desde A; crearlo solo si falta según README §6.4. PIN usa bcrypt Python 5.0.0. El lock con hashes Linux/Python 3.12 es solo para ese runtime, no para Windows. H2 conserva el guard: BD existente sin seed; demo opcional únicamente en nueva BD dev/test, siguiendo las seis variables y el destino independiente del README §6.3. No renombrar datos ni usar down -v.

El bootstrap Nest comparte configureHttpBoundary con los tests: registra CORS antes de boundedJson y conserva allowlist, límites y contratos. Seis escenarios HTTP cubren 413/415/400, respuesta válida, preflight y origen ajeno; 414 y CORS real file:// / Origin:null siguen sin aceptación específica. El panel usa APIs simuladas y no cierra ese pendiente. El [prompt por integrante](PROMPT_CLAUDE_ACTUALIZACION_EQUIPO_POSTMERGE.md) distingue instalación, pruebas y servicios propios que requieren autorización expresa de reinicio.

H1 permanece excluido por decisión del usuario; el inventario operativo inferior describe trabajo futuro de los responsables. No se rotaron/revocaron credenciales ni se saneó historia. Ese pendiente debe resolverse antes de hosting. La reanudación no cerró, reinstaló, reinició o reconstruyó los servicios que el usuario informó activos; tampoco comprobó qué fuentes ejecutan.

## Políticas HTTP vigentes

| Entrada | Política/consumidor | Continuidad |
|---|---|---|
| POST /payments/paypal/orders y /payments/paypal/orders/:orderId/capture | Sin registro HTTP en todos los entornos; sin flag de bypass | /compras conserva precio servidor, propiedad, reserva, captura/conciliación y cupos. Wrappers api.paypal obsoletos rechazan localmente con 410 |
| POST /reports | Sin registro HTTP; no permite plantilla/data genéricas | Reportes personales y de administración llaman al servicio interno; wrapper api.reports rechaza con 410 |
| GET /maps/geocode, /maps/reverse-geocode | JWT propio de Nest, también para perfil parcial permitido; cuota auxiliar por usuario | api.maps recibe accessToken como primer argumento. Maps JavaScript de navegador es una integración distinta con configuración pública restringida |
| GET /indicators y /indicators/:code | JWT propio; cuota y caché por proceso de datos económicos no sensibles, TTL 60 s/capacidad 128 | api.indicators recibe accessToken como primer argumento; ComprasService utiliza el servicio interno |
| Registro/validación/login/recuperación | Conservan sus mecanismos: Firebase ID token solo donde corresponde y JWT propio para APIs | Sin guarda de autenticación universal. Cuotas por operación, no bloqueo de cuenta por correo |
| Precio público, contacto público, health y preflight | Conservados con sus contratos; precio y contacto tienen presupuestos propios | El prefijo /internal/v1 no vuelve privada a FastAPI |
| SOS y cierre | Sesión propia/vínculo/PIN efectivo y controles de negocio existentes | No comparten una cuota global agotable con login, integraciones, precio o exportaciones |

Las búsquedas de consumidores reales no encontraron pantallas que llamaran las APIs genéricas retiradas. Si aparece un consumidor externo, migrarlo al flujo autorizado; no reactivar bypasses. Los reportes completos rechazan 413 cuando superan el máximo, sin presentar una página truncada como un informe completo. Ventas admite filtros de fecha/búsqueda; para otros históricos grandes se requiere exportación operativa o diseño de paginación posterior.

## Variables y límites

Configurar valores privados en el gestor del proveedor o archivo operativo protegido, nunca en VITE_*, ejemplos, salida de consola o Git. deploy/production.env.example es una plantilla de servidor; .env.production.example sigue siendo la plantilla pública de Vite. No sobrescribir un .env existente copiando ejemplos.

| Variables | Finalidad/entorno | Valor inicial o condición |
|---|---|---|
| EMERGEN_ENVIRONMENT / EMERGEN_DEPLOYMENT_ID | APIs en hosting, idéntico deployment ID en clientes | production o staging explícito; identificador acordado |
| BACKEND_IMAGE / INTERNAL_API_IMAGE | Referencia producción | Imágenes revisadas por digest/SHA; ninguna actualización implícita de contenedores activos |
| DB_BOOTSTRAP_USER / DB_BOOTSTRAP_PASSWORD / DB_NAME | Inicialización administrativa de PostgreSQL propio | Identidad privada, separada de aplicación; no cambia roles/owners de un volumen ya existente |
| APP_DB_USER / APP_DB_PASSWORD | Ambas APIs en referencia de producción | Rol restringido previamente provisionado por responsable; ver PERMISOS_BD_PROPUESTA.md |
| DB_USER / DB_PASSWORD / DB_HOST / DB_PORT | Configuración efectiva de cada API fuera de esa referencia | Ambas APIs contra el mismo destino; no son valores públicos del frontend |
| DB_SSLMODE / DB_SSL_CA_FILE / CA_DIRECTORY | Política TLS explícita en ambas APIs | verify-full con CA/hostname válidos; disable solo como decisión documentada de la red concreta, sin afirmar cifrado. Archivo público CA bajo /run/emergen-ca |
| JWT_SECRET / JWT_SESSION_HOURS | Sesión propia compartida | Secreto de al menos 32 bytes; duración 2 h por defecto, 1–168 h. Borrado local no revoca JWT |
| MEDICAL_DATA_KEYS | AES-GCM y recuperación histórica | Conservar todas las claves actuales. Primera clave cifra; las demás permiten descifrar registros previos |
| CORS_ORIGINS / TRUSTED_PROXY_CIDRS / FORWARDED_ALLOW_IPS | Orígenes y confianza de proxy | Orígenes HTTPS exactos y origen nativo; proxies IP/CIDR explícitos o vacío. Nunca confiar globalmente en X-Forwarded-For |
| JSREPORT_URL / JSREPORT_USERNAME / JSREPORT_PASSWORD | Servicio de reportes | HTTPS administrado independiente del PC en staging/production; no publicar Studio al público |
| WHATSAPP_ENABLED / WHATSAPP_AUTH_DIR / WHATSAPP_SENDER_PHONE | Emisor persistente | Producción exige habilitación, ruta absoluta persistente y emisor configurado privadamente; un único dueño de sesión |
| PRODUCTION_DB_VOLUME / PRODUCTION_WHATSAPP_VOLUME | Volúmenes externos de producción | Nombres comprobados por responsable; sin defaults a datos del equipo. No crearlos, sustituirlos o borrarlos para corregir una conexión |
| API_MAX_BODY_BYTES / INTERNAL_API_MAX_BODY_BYTES | Límite real de stream JSON en cada API | 16384 bytes; máximo configurable 1048576. Compose producción comparte API_MAX_BODY_BYTES |
| API_LOGIN_PER_MINUTE / API_IDENTITY_PER_15_MINUTES | Login por peer / registro-recuperación por peer | 10 / 10; parámetros provisionales |
| API_AUX_PER_MINUTE / API_PURCHASE_PER_MINUTE / API_PUBLIC_PRICE_PER_MINUTE | Integraciones por usuario, compras por usuario, precio público por peer | 30 / 20 / 60; presupuestos separados |
| API_EXPORT_PER_MINUTE / API_EXPORT_CONCURRENCY / API_REPORT_MAX_ROWS | Reportes por usuario, concurrencia del proceso y filas completas | 4 / 2 / 2000; exceso explícito, no truncamiento |
| DB_POOL_MAX / DB_STATEMENT_TIMEOUT_MS | Nest pool/tiempo SQL; timeout también en Python | 10 / 30000 ms; no timeout global del envío SOS. Ajustar con evidencia del destino |
| INTERNAL_API_DB_REGULAR_CONNECTIONS / INTERNAL_API_DB_SOS_CONNECTIONS | Slots de conexión Python separados | 8 / 4 por proceso, más tarea periódica; no protección distribuida ni pool reutilizable |
| INTERNAL_API_TICKETS_PER_15_MINUTES | Tickets por sesión | 10 por proceso |
| INTERNAL_API_DOCS_ENABLED | Swagger, ReDoc, OpenAPI y auxiliar | false por defecto en distribución; explícito según política. Desarrollo conserva documentación |
| EMERGEN_SEED_EXPECTED_DB | Confirmación de seed exclusivamente local/test | Debe coincidir con DB_NAME sufijo _dev/_test, peer loopback y entorno coherente. No ejecutar seeds en hosting |
| VITE_API_URL / VITE_INTERNAL_API_URL / VITE_DEPLOYMENT_ID | Configuración pública incorporada en clientes | HTTPS de ambos servicios y deployment ID real; cambios de servidor no actualizan APK instalado |

Estructura JSON: profundidad máxima 8, 1024 nodos y 128 claves/100 elementos por contenedor, además de DTO y bytes. Solicitudes no JSON con cuerpo se rechazan 415. Errores conservan statusCode/message/error. Respuesta externa JSON máxima 512 KiB y archivo jsReport 16 MiB. Los tiempos HTTP salientes y reintentos existentes siguen acotados; no se añadió reintento automático de transacción con envío externo.

Las cuotas/TTL son por proceso. El contador de contacto conserva 5/IP/15 min y 3/correo/h en BD; su mapa tiene capacidad 10000 y caduca claves. PIN mantiene tres fallos/5 min en Nest y cinco/15 min en cierre FastAPI sobre la misma fila: el efecto cruzado requiere decisión funcional, no se rediseñó. Varias réplicas requieren un contador compartido o una mitigación de ingreso expresamente comprobada. No declarar protección distribuida por multiplicar workers. Los límites CPU/memoria/PIDs/logs de Compose son iniciales, no capacidad probada.

## Runbook de aplicación: solo para el responsable autorizado

1. Revisar el delta, dependencias y pruebas; registrar SHA+huella de fuentes sin commit e imágenes. Preparar artefactos release con configuración real; no utilizar los de security-check. No habilitar LIVE_APIS ni un emisor real durante pruebas.
2. Inventariar destino y servicio correcto con metadatos filtrados. Para la discrepancia local conocida, consultar nombres/imagen/puertos de postgres_emergen_db, nestjs_emergen_backend y jsreport, y etiquetas Compose de proyecto/config_files si existen. No deducir procedencia por el nombre. No imprimir inspect completo, entorno, logs o configuración resuelta.
3. Confirmar nombre y destino de cada volumen; custodiar copia de sesión WhatsApp cifrada y todas las claves médicas por separado. Preparar respaldo y restauración de prueba antes del traslado. El script npm run backup:db corresponde al Compose local/default: no usarlo como si seleccionara automáticamente docker-compose.production.yml o una BD gestionada.
4. El backup actual produce archivo nuevo, usa pg_restore --list y manifiesto SHA-256; eso no acredita restauración. Una única tarea de backup debe operar a la vez. Para otro destino, el responsable seleccionará pg_dump o mecanismo del proveedor con conexión explícita/TLS/CA y nombre de archivo nuevo comprobado; credenciales por mecanismo privado. No usar redirección binaria de PowerShell 5 para capturar un dump. Retención, cifrado, ACL Windows, offsite, RPO/RTO y custodios quedan acordados antes de copiar datos reales.
5. Aprovisionar rol de aplicación y migración con propuesta revisada, sin modificar init.sql. Mantener synchronize=false. Restaurar solo en destino vacío creado para ello y verificar esquema, constraints, secuencias y descifrado. No ejecutar init.sql sobre una restauración; ningún seed.
6. Completar la plantilla privada y CA del destino. Para una referencia de producción ya revisada, el comando de comprobación es docker compose --env-file <ARCHIVO_PRIVADO> -f docker-compose.production.yml config --quiet. No imprimir config sin --quiet. Los placeholders no constituyen una configuración desplegable.
7. Configurar ingreso HTTPS de ambas APIs, firewall IPv4/IPv6 y permisos del emisor. APIs en loopback no sustituyen firewall; BD y Studio sin publicación pública. En esta referencia DB_SSLMODE=verify-full exige que el servidor real esté configurado para TLS y certificado válido, no solo montar la CA del cliente.
8. Solo en ventana autorizada, con backup y volúmenes confirmados, aplicar las imágenes/configuración mediante docker compose --env-file <ARCHIVO_PRIVADO> -f docker-compose.production.yml up -d --no-build backend internal-api, y db solo si corresponde al plan revisado. Este comando NO se ejecutó aquí. No mezclar automáticamente el Compose local con el de producción. Una reconciliación del PostgreSQL existente puede requerir recreación controlada del servicio manteniendo exactamente su volumen; no está autorizada para este agente.
9. WhatsApp tiene un único proceso dueño. El responsable coordina el relevo del emisor previo y el nuevo; no iniciar dos sesiones sobre el mismo estado. Revisar cola restaurada y estados ambiguos antes de activarla para evitar reenvíos. Ningún resultado ENVIADO se deduce de un error de red.
10. Verificar health/ready e identidad/deployment, y health/sos según el entorno autorizado. Las pruebas de aceptación iniciales usan dobles y datos sintéticos. La aprobación de recepción, cobro o identidad real requiere otro procedimiento explícitamente autorizado.
11. Publicar clientes solo después de cerrar los P1 operativos y verificar la versión de Electron/APK. GPS, permisos, servicio en segundo plano y volumen necesitan dispositivo apropiado; cambios móviles requieren sync/build/instalación del artefacto actualizado por su responsable, nunca automática por este encargo.

Cabeceras: las APIs añaden nosniff, no-referrer, DENY y no-store, y HSTS solo cuando la solicitud se reconoce HTTPS. La política del servidor de archivos/ingreso debe imponerse en esa capa: API headers no protegen el HTML del frontend. CSP compatible con los SDK Firebase/Maps/PayPal, nonces y la capa concreta de hosting queda pendiente de configuración y comprobación allí; no se propone un comodín o unsafe-eval para silenciar errores.

## Rotación/revocación y exclusión de demostración

| Tipo / uso | Ubicación histórica o actual, sin valores | Dependencias y efecto / responsable |
|---|---|---|
| Clave JWT de APIs | Copias documentales D/.env y D/example.env; valores retirados | Responsable backend debe coordinar ambas APIs. Una clave nueva invalida JWT previos, también la copia nativa del SOS; prever reingreso. No usar la clave comprometida en rollback |
| DB_PASSWORD / credenciales de bootstrap y aplicación | Copias documentales y gestor privado | Responsable BD identifica consumidores/rol real, provisiona y prueba reemplazo en ventana; no cambia datos/owners por limpiar un archivo |
| PayPal secret | Copias documentales; backend | Responsable cuenta comercial revoca en proveedor, comprueba modo sandbox/live y actualiza backend; no se probó vigencia ni se realizó un cobro |
| jsReport usuario/clave | Copias documentales; render interno | Responsable reportes revoca, restringe red/Studio y coordina backend. Plantillas no son entrada pública |
| Maps servidor / configuración pública VITE | Copias documentales; backend y bundles | Responsable proyecto Google restringe APIs, origen/plataforma y cuotas. Firebase web config y PayPal client ID son públicos por diseño, no equivalen al secreto privado de servidor |
| Claves médicas | Gestor privado, no copiadas a informe | Responsable de datos conserva claves antiguas. Rotar añadiendo identificador nuevo y preservando descifrado; cualquier recifrado exige plan propio, sin reemplazar claves existentes |
| Sesión Baileys / firma Android | Volumen/ruta privada y custodia de release | Responsable emisor/firma controla ACL, persistencia y respaldo. No se leyó, rotó o empaquetó material real |
| Cuentas demo de seed/documentación | scripts/seed-dev.cjs y documentación histórica | Responsable verifica en destino, con información local, cuáles son sintéticas y planifica exclusión. No ejecutar seed, consultar/borrar usuarios reales o promover roles para esta revisión |

Limpiar el árbol y agregar .gitignore no elimina historia ni revoca nada. Índice/historia Git quedan a cargo del usuario. No copiar valores expuestos a otro archivo o a una incidencia para inventariarlos: registrar solo tipo, ubicación, responsable y estado de revocación.

## Rollback y contingencia

1. Conservar el manifiesto privado anterior, digests y compatibilidad de esquema antes de aplicar. No revertir el árbol de trabajo del usuario ni hacer reset/checkout/clean.
2. Si falla un control o función legítima, detener únicamente el despliegue nuevo bajo autorización del responsable y escoger una imagen compatible revisada. Un rollback no reabre /payments/paypal o /reports genéricos, no omite propiedad/roles, no desactiva TLS y no devuelve secretos comprometidos.
3. Cambiar solo referencias/configuración necesarias y aplicar en ventana; preservar nombres/montajes de datos y sesión. Nunca down -v, volume rm, limpieza global o creación silenciosa de volumen vacío para solucionar disponibilidad.
4. No restaurar una BD con datos posteriores sobre otra como paso normal de rollback. Recuperación de datos exige decisión propia, snapshot, destino aislado y RPO/RTO; los dumps no incluyen claves médicas.
5. Si el nuevo emisor llegó a enviar, conciliar los estados ambiguos antes de retomar el previo; no repetir automáticamente transacciones con efectos externos. No se promete entrega exactamente una vez.
6. Revalidar contratos afectados y health con datos sintéticos. Registrar resultado y pendiente sin atribuir al rollback confirmación de proveedores o dispositivo.

## Pendientes de arquitectura y traspaso de pruebas

Revocación individual común a Nest/FastAPI requiere política de logout/reset/pérdida y posiblemente esquema (versión de sesión/denylist); este trabajo solo conserva expiración y limpieza local. Unificar el contador PIN exige decisión sobre bloqueo cruzado y emergencias. Mover envío fuera de transacción requiere leases/outbox/recuperación y quizá esquema: no se aplicó un rediseño ni un retry global.

El otro integrante recibirá superficie y deltas: rutas genéricas retiradas, JWT en auxiliares, parsers/cuotas/slots, reportes completos acotados, proxies/TLS, roles propuestos, sesiones/puentes y dispatcher. Sus ataques/carga/resiliencia amplios necesitan staging autorizado, cuentas sintéticas, capacidad y ventana definidas. Las pruebas de este encargo no sustituyen ese trabajo.

