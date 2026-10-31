# Fortalecimiento de ciberseguridad EMERGEN

Registro acumulativo, iniciado el 29-10-2026. Snapshot: rama alonso, HEAD 6c228e6566487c265231c0f99dcc12de7a305557. Sin cambios versionados iniciales; documentos QA e informe de levantamiento sin seguimiento, preservados. No commits, staging, push ni operaciones sobre servicios existentes. init.sql protegido; SHA-256 inicial d4e71a576baaab8192e9482eb7304d9f69bacc82d3c1be361830cee0c8e78f68.

## Alcance y lotes

1. Revalidación y línea base sintética; rutas genéricas y empaquetado PIN.
2. Limpieza de copias documentales y guarda fail-closed de seed.
3. Límites de entrada/operación y recursos, sin cuota global de SOS.
4. Configuración de producción, logs/docs/distribución y runbooks.
5. Verificación funcional mínima y matriz PRE-SEC-001…015.

Solo pruebas focalizadas, secuenciales, sin servicios/proveedores reales; como máximo seis casos por corrección. Integridad funcional y acciones operativas se informarán por separado. No se interpretará una configuración preparada como aplicada a contenedores activos.

## Continuidad

Revalidado el snapshot y los módulos/controladores afectados. La búsqueda dirigida de consumidores en fuentes de web/móvil/desktop/ui no encontró usos de api.paypal, api.reports, api.maps o api.indicators; sí existen wrappers y pruebas de integración. El flujo comercial efectivo usa /compras. Pendiente: línea base aislada antes de cambios funcionales, cerrar política de esos wrappers, comparar bcrypt Python con hash sintético Nest dentro de imagen independiente.

## Evidencia ejecutada

- Solo inspección hasta este punto: rama/SHA/status, instrucciones, secciones prioritarias del levantamiento, módulos y consumidores. Ninguna prueba o build ejecutados todavía.
- Referencia criptográfica consultada: https://pypi.org/project/bcrypt/ y https://github.com/pyca/bcrypt/ (29-10-2026). La compatibilidad se comprobará con hash sintético, no por el nombre de la biblioteca.

## Pendientes externos

Hosting/ingreso/dominios/TLS, escala, responsables de rotación y recuperación, semántica de revocación/PIN compartido y aplicación de configuración a contenedores. No definidos ni asumidos.

## Lotes 1 y 2: continuidad

- Línea base: security-run.mjs ejecutó cinco casos existentes de selector/PIN completo/parcial y AES-GCM/AAD; pasan. Sin BD ni .env y con guardrail de red.
- Retirado el registro HTTP de PayPal y jsReport genéricos, sin flag de bypass; servicios internos conservados. Wrappers obsoletos fallan con 410 sin red. Mapas/indicadores requieren JWT propio; wrappers y pruebas de contrato adaptados.
- PIN: bcrypt Python 5.0.0 sustituye Node/subprocess. Imagen nueva emergen-internal-security:20261029 construida sin operar servicios activos. check-pin-image.mjs verificó 2/2 casos con hash Nest coste 12, stdin, red none, sin montajes/puertos.
- D/.env y D/example.env son plantillas; .env operativo intacto. Historia/rotación siguen abiertas.
- Seed protegido antes de importar cliente/leer .env: entorno development/test coherente, loopback, DB sufijo _dev/_test y EMERGEN_SEED_EXPECTED_DB coincidente. Seis comprobaciones puras pasan; seed/conexión no ejecutados.
- docker ps filtrado muestra los mismos tres servicios: BD 5433 amplia, Nest 3001 amplia, jsReport 5488 amplia. No se aplicó configuración.
- Lote 3 en curso: límites reales de stream/estructura, presupuestos por operación, conexiones FastAPI reservadas para SOS y contadores TTL/capacidad. Falta compilar y comprobar antes de cerrar.

Siguiente paso: terminar caché y pruebas de límites; validar TypeScript/HTTP aislado; preparar Compose de producción y runbook. Ningún componente declarado listo para publicar.

## Continuidad del lote 3 y verificación funcional

- Backend compila; api-client pasa typecheck. Cinco comprobaciones puras de stream/profundidad/cuota/reporte pasan. Seis solicitudes HTTP representativas de registro de rutas/JWT pasan; los primeros intentos fueron bloqueados por un error del guardrail de argumentos normalizados de Socket, corregido sin abrir destinos externos.
- Cinco casos api-client seleccionados pasan: retiro local de wrappers, JWT Firebase, mapas e indicadores. La búsqueda no encontró pantallas afectadas por el cambio de firma; se conserva /compras como consumidor comercial.
- security-db-check.mjs creó exclusivamente PostgreSQL temporal con nombre aleatorio emergen-security-test-*, tmpfs y puerto loopback 55439. Copió esquema/catalogos init.sql y tres migraciones a esa BD NUEVA; no ejecutó seeds ni migró la base existente. Eliminó únicamente su contenedor al terminar, sin volúmenes persistentes.
- Verificación nominal: cinco casos Nest con registro/verificación/recuperación falsos, perfil/PIN, A/S/usuario, perfil/contacto/AES-GCM, reserva/captura/conciliación/cupos y vínculo, reporte autorizado/mapa/indicador/health: pasan.
- FastAPI sobre esa misma BD sintética: seis solicitudes SOS (ubicación, replay, segunda activa, cierre, parcial sin GPS y PIN efectivo), seis de soporte/contacto/health/docs, una expiración histórica, tres casos de input y tres llamadas de contador con reloj falso: pasan. JWT compartido de firma test aceptado en ambas APIs. Cola sintética solamente, sin emisor.
- Incidencias del harness, resueltas: socketpair privado de asyncio Windows, huella de fixture histórica con longitud errónea y pg_isready confundiendo el servidor temporal de inicialización con el final TCP. No se relajaron controles de la aplicación para hacer pasar las pruebas.
- Python bcrypt 5.0.0 instalado sin dependencias adicionales en .venv para la comprobación local; descarga PyPI, separada de la red de la aplicación. Lock runtime Linux/Python 3.12 generado con pip-tools 7.5.2 en contenedor, hashes reales del registro; pendiente validar la imagen final con ese lock.
- Compose de producción separado preparado, sin ejecutar: volúmenes externos explícitos, bootstrap separado de aplicación, BD privada, APIs loopback para ingreso autorizado, jsReport HTTPS externo al PC, TLS/CA en ambas APIs y recursos iniciales configurables. Falta validación estática y runbook de reconciliación; sigue sin aplicarse a servicios existentes.

Siguiente paso exacto: finalizar logs/docs/configuración y runbooks, construir imagen FastAPI final con lock y repetir únicamente PIN empaquetado, ejecutar builds de los tres clientes en modo security-check sin .env; completar matrices de controles e integridad y verificar init.sql/status.

## Reconciliación tras interrupción — 30-10-2026

Este apartado es el estado conciliado vigente, cerrado con fecha 30-10-2026 según el contexto de fecha actualizado durante el encargo; el trabajo previo comenzó el 29-10-2026. Las secciones anteriores se conservan como registro cronológico: sus «pendientes» iniciales no deben interpretarse como resultado actual. Por instrucción del nuevo encargo se suspendieron las correcciones; en esta pasada solo se inspeccionó, se realizaron comprobaciones sin servicios nuevos y se actualizó este documento. No se repararon los fallos detectados.

### Snapshot y fuentes disponibles

- Rama alonso; HEAD completo 6c228e6566487c265231c0f99dcc12de7a305557, sin checkout, merge, staging, commit ni push.
- git status mostró 51 entradas versionadas modificadas sin preparar y 21 entradas sin seguimiento, una de ellas el directorio docs/qa/. git diff --stat contó 50 archivos con diferencias textuales, 334 inserciones y 421 eliminaciones; no incluye archivos nuevos. El índice no contiene cambios. La entrada adicional de test_deployment_config.py no aparece como diferencia textual en esas estadísticas; no atribuirle una corrección por figurar modificada.
- Fuentes consultadas: AGENTS.md vigente; LEVANTAMIENTO_CIBERSEGURIDAD_EMERGEN.md; este registro; archivos afectados y resultados concretos aún disponibles de la sesión.
- No se localizó EMERGEN_prompt_fortalecimiento_ciberseguridad.md mediante búsqueda dirigida de ese nombre en el workspace. El prompt completo con sección 7.1 y aclaración de APK/teléfono sí está en el adjunto previo: C:/Users/gonza/.codex/attachments/c94523e6-f0bf-405b-aed1-0de84f03af63/Pasted text.txt. No se creó una copia nueva: la única escritura autorizada ahora es este informe.
- Bases de referencias: A = Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación; B = A/apps/backend/src; I = A/services/internal-api; C = A/packages/api-client/src; D = Fase 2/Evidencias Proyecto/Evidencias de documentación/4.4 Docker. Las rutas cortas scripts/, docs/ y docker-compose* son relativas a A.
- Origen identificado: las correcciones descritas aquí se corresponden con acciones y archivos del fortalecimiento disponibles en el historial. El levantamiento y los documentos QA ya estaban sin seguimiento al comenzar; se preservaron. No se atribuye autoría ajena por el mero estado Git.
- No se encontraron conflictos sin resolver, marcadores de merge o archivos versionados cambiados inesperadamente vacíos en el alcance revisado. Esto no acredita ausencia de otros errores.
- init.sql conserva SHA-256 d4e71a576baaab8192e9482eb7304d9f69bacc82d3c1be361830cee0c8e78f68. package-lock.json no cambió. No hay cambios propios de esquema aplicados a la BD existente, ni operaciones registradas sobre claves médicas, volúmenes persistentes o sesión WhatsApp real.

### Comandos recuperados y límites de evidencia

| Comando/estado | Evidencia disponible y alcance |
|---|---|
| Línea base, completada | security-run.mjs jest, selección de cinco casos en login-pin.spec.ts y cifrado-medico.spec.ts: cinco aprobados. Son perfiles/PIN temporal/parcial y AES-GCM/AAD. No existe línea base funcional completa de todas las familias |
| Política HTTP, completada | security-boundaries.e2e-spec.ts: seis casos aprobados; PayPal genérico creación/captura y render genérico no registrados, mapas sin JWT/inválido rechazados, JWT de perfil parcial admitido. No demuestra toda la superficie |
| Límites, completada | security.spec.ts: cinco casos aprobados de stream real, profundidad, contador con reloj falso y rechazo de reporte excesivo |
| Seed, completada | node --test scripts/seed-safety.test.cjs: seis comprobaciones puras aprobadas; no se ejecutó seed ni se conectó a BD |
| Cliente compartido, completada | api-client typecheck y cinco casos seleccionados de C/emergen-api.test.ts aprobados: wrappers retirados, identidad Firebase, mapas e indicadores |
| Imagen PIN anterior, completada | Sesión de build 25059 terminó exit 0; check-pin-image.mjs aprobó PIN válido/incorrecto de hash Nest coste 12, sin red/montajes. Fue la imagen previa al cambio del Dockerfile a lock y a cambios posteriores de fuentes. No repetir esta evidencia como si validara el artefacto final |
| Resolución Python, completada | Sesión 75196 terminó exit 0: pip-tools 7.5.2 generó locks/requirements-linux-py312.lock en Linux/Python 3.12. Inspección actual: 25 paquetes fijados y coincidencia de las siete dependencias directas; no se revisaron advisories |
| Integración sintética, completada | Última ejecución exit 0 de security-db-check.mjs: cinco casos Nest; FastAPI seis solicitudes SOS, seis soporte/contacto/health/docs; una expiración histórica, tres casos de input y tres llamadas de contador con reloj falso. Proveedores dobles y firma JWT test común, únicamente PostgreSQL nuevo/tmpfs/loopback:55439 |
| Incidencias anteriores, cerradas en el harness | Normalización de Socket Node, socketpair asyncio, fixture histórica de huella y readiness TCP. Hubo intentos fallidos y repetición corregida. No fueron pruebas ofensivas ni se debilitó autorización/TLS para aprobar |
| Backend build previo, completado | nest build terminó correctamente antes de los últimos cambios de logging. No acredita que dist contenga esos cambios finales |
| Builds web/desktop/móvil, completados | Web y desktop exit 0; sesión móvil 24268 recuperada ahora con exit 0. Los tres usaron security-check, variables sintéticas y envDir deshabilitado; no son artefactos de distribución. Advertencias de tamaño de chunks y CSS Ionic en móvil; no se atribuyen a la pausa sin comparación |
| Procesos pendientes | Los tres identificadores de sesión disponibles —25059, 75196 y 24268— tienen resultado final. Los demás comandos citados devolvieron resultado final. No quedó un comando relevante con resultado desconocido en esos identificadores; esto no afirma que no existan otros procesos del usuario |
| Metadatos actuales, completada | docker ps filtrado: siguen NestJS, PostgreSQL y jsReport con los mismos nombres/imágenes y publicaciones amplias IPv4/IPv6 de 3001, 5433 y 5488. No aparece contenedor de prueba activo; no se iniciaron/detuvieron servicios en esta conciliación |

El runner de integración previo creó y retiró únicamente sus contenedores aleatorios de prueba. La copia de init.sql y tres migraciones se aplicó solo a esa base nueva y sintética; no modificó los archivos protegidos ni aplicó migraciones a la base existente. No se deben repetir instalaciones o ese runner durante esta conciliación.

Comprobaciones nuevas de esta pasada, justificadas por incertidumbres concretas:

1. git status/diff estadístico, índice/conflictos, referencias y hash protegido: lectura únicamente; git diff --check sin errores de whitespace, con avisos LF/CRLF.
2. node node_modules/typescript/bin/tsc -p apps/backend/tsconfig.build.json --noEmit --incremental false: exit 0, verifica las fuentes actuales del backend tras los cambios tardíos de logging; excluye test y spec según tsconfig.build.json:6–7. No genera build ni acredita comportamiento.
3. Una función de prueba existente, test_production_requires_explicit_configuration, ejecutada directamente con entorno test limpio, -B y sin pytest/conftest, BD, .env o red: falla con ValidationError. La fixture no declara DB_SSLMODE mientras el validador nuevo lo exige. Dos intentos anteriores del pequeño harness fallaron por omitir SYSTEMROOT al filtrar el entorno Windows; corregido solo en el comando temporal de diagnóstico, sin editar archivos. No se confunden esos errores del harness con el resultado de la prueba.
4. docker compose --env-file NUL -f docker-compose.production.yml config --quiet, mediante entorno temporal con las 21 variables requeridas sintéticas: exit 0. No se imprimió configuración resuelta ni se contactaron APIs, levantaron servicios o aplicaron cambios. Solo valida esquema/interpolación, no TLS, rutas montadas, permisos, capacidad o funcionamiento del hosting.

No se repitieron suites completas, instalaciones, builds, migraciones, verificadores contra destinos reales ni pruebas que usan localhost:5433.

### Inconsistencias concretas; no reparadas en este encargo

| Hallazgo | Evidencia actual | Origen y consecuencia | Siguiente corrección, fuera de esta conciliación |
|---|---|---|---|
| Backup referencia función inexistente | scripts/backup-db.mjs:77 llama existsSync; imports de node:fs en :2–11 no la incluyen ni hay definición local. Git diff confirma que esa llamada es nueva | Asociado al cambio identificado del fortalecimiento. Al llegar a ese punto produciría ReferenceError, antes del rename/manifest; no se ejecutó un backup para demostrarlo y no debe probarse con backups reales | Incorporar la importación correcta y comprobar colisión/no sobrescritura con filesystem temporal y dobles de Docker; no debilitar la salvaguarda |
| Fixture positiva de configuración FastAPI desactualizada | I/app/core/config.py:70–74 exige política explícita; I/tests/test_deployment_config.py:6–19 no la declara. Ejecución pura actual falla | Incoherencia asociada al contrato nuevo de configuración, no prueba de rotura del SOS. No causada demostrablemente por una interrupción | Adaptar fixture al contrato explícito y repetir únicamente la prueba pura; conservar validación de TLS |
| Imagen final pendiente | I/Dockerfile:4–5 usa ahora lock con hashes; build/PIN recuperados corresponden al Dockerfile anterior y a fuentes anteriores | No puede darse por verificado el artefacto que se desplegaría | Construir una imagen nueva identificada con snapshot de trabajo y ejecutar solo PIN válido/incorrecto, sin host mounts ni red de aplicación |
| Documentación y expectativas aún no conciliadas | I/README.md:5 sigue indicando helper Node; readme-apis.md:91–93,117–118,295 describe rutas genéricas retiradas. Docs de despliegue/ejemplos no documentan todos los controles nuevos | Implementación avanzó más que documentación/runbooks. No hay inventario final de variables/políticas ni procedimiento de permisos | Actualizar documentación vigente y pruebas pertinentes; no ejecutar LIVE_APIS ni reactivar rutas retiradas para satisfacer pruebas antiguas |
| Cambios tardíos con evidencia parcial | Logging HTTP/Baileys, manejo de errores, limpieza de token al cambiar identidad, renderer Electron y FileProvider | Typecheck/builds o lectura disponibles, pero sin comprobación específica de todos los contratos nuevos. Assertions existentes de logging/lastError requieren revisión, no se declaran fallidas sin ejecutarlas | Seleccionar solo los casos necesarios, con dobles y sin dispositivo/proveedor real; mantener redacción y autorización |

### Matriz de conciliación PRE-SEC-001…015

Los estados de código se refieren al árbol local. Los contenedores existentes no se actualizaron ni se acreditó su correspondencia con HEAD; no asumir que ya aplican las nuevas guardas o límites.

| ID | Cambio/evidencia actual | Estado de implementación | Verificación disponible | Pendiente | Próximo paso |
|---|---|---|---|---|---|
| PRE-SEC-001 | B/integrations/paypal/paypal.module.ts:5–7 y jsreport/jsreport.module.ts:5–7 no registran controladores genéricos; mapas/indicadores usan JwtAuthGuard; wrappers C adaptados | Comprobado de forma acotada; documentación parcial | Seis HTTP, cinco api-client y compras/reportes nominales con dobles aprobados | No todas las rutas probadas; consumidores externos no inspeccionados; docs antiguas | Actualizar tabla de políticas/documentación y revisar expectativas existentes, sin restaurar bypass |
| PRE-SEC-002 | D/.env y D/example.env reemplazados por placeholders; D/.gitignore nuevo; .env operativo no sobrescrito | Limpieza implementada; pendiente operativo | Sustitución e inspección registradas; no se validó vigencia | Historia Git y rotación/revocación, inventario de responsables y procedimiento | Documentar tipos/dependencias/efectos y acciones del responsable; no rotar ni reescribir historia automáticamente |
| PRE-SEC-003 | Compose local ya limita BD a loopback; runtime sigue publicando 5433/5488 ampliamente | Pendiente operativo; no corregido en runtime | Metadatos filtrados actuales; producción pasa parseo | Procedencia/configuración efectiva e ingreso/firewall | Preparar reconciliación segura con volúmenes/respaldos preservados; no aplicarla |
| PRE-SEC-004 | I/app/core/pin.py reemplaza subprocess por bcrypt 5.0.0; dependencia directa/lock/Dockerfile conectados | Implementado; comprobado en imagen anterior y entorno local, artefacto final pendiente | Dos PIN en imagen anterior; cierres SOS sintéticos actuales aprobados | Imagen actual con lock/fuentes finales | Nuevo build aislado y dos casos de compatibilidad; no usar imagen antigua como evidencia final |
| PRE-SEC-005 | docker-compose.production.yml exige imágenes, volúmenes y jsReport HTTPS independientes del PC; WhatsApp persistente | Parcial; pendiente decisión y operación | Parseo con variables sintéticas aprobado; runtime no alterado | Proveedor, dominios, ingreso/TLS, persistencia/uptime y runbook | Acordar topología y completar instrucciones de aplicación/rollback, sin desplegar |
| PRE-SEC-006 | B/config/security.ts:14–140, I/app/core/security.py:25–84, caps de reportes, pool/slots y timeouts | Comprobado de forma acotada; contención parcial | Casos de cuerpo/estructura/cuota/reportes y nominales aprobados | Valores provisionales, escalado, casos de rechazos no cubiertos y documentación de variables | Completar criterios/casos estrictamente pertinentes y límites configurables; carga queda para otro integrante |
| PRE-SEC-007 | Mobile session.ts:38 evita heredar token al cambiar identidad sin credencial nueva; logout JS/nativo conservado | Parcial; pendiente decisión | Build móvil aprobado; flujo de login nominal con JWT propio | Comprobación específica de cambio de identidad/logout; revocación coherente en ambas APIs sin esquema aplicado | Verificar limpieza con dobles nativos; documentar alternativas de revocación y efecto en SOS, sin confundir borrado local con revocación |
| PRE-SEC-008 | Contador FastAPI tiene capacidad/TTL; confianza proxy explícita; cuotas separadas y slots SOS reservados; políticas PIN originales conservadas | Parcial; pendiente decisión | Tres llamadas con reloj falso y SOS permitido aprobados; lectura de exclusión de cuota global | Contadores por proceso/réplica; efecto compartido de PIN 3/5 min y 5/15 min | Documentar política/escala y propuesta si requiere esquema; no cambiar semántica PIN arbitrariamente |
| PRE-SEC-009 | Dispatcher mantiene envío dentro de transacción y reintentos actuales; solo se redactó logging tardío | Corrección de confiabilidad no iniciada; decisión pendiente | Inspección; no prueba nueva de fallo/commit del dispatcher | Estados ambiguos, timeouts/leases y recuperación; ninguna garantía exactly-once | Diseñar alternativa acotada y como máximo casos sintéticos de fallo necesarios; no retry global con efectos externos |
| PRE-SEC-010 | Compose APIs con capabilities eliminadas/no-new-privileges/recursos/logs; TLS/CA conectado y rol bootstrap separado en referencia de producción | Parcial; implementación de permisos no iniciada; pendiente operativo | Typecheck/parseo, no permisos efectivos | Propuesta mínima de grants/owners/secuencias/funciones, CA, permisos de volúmenes y capacidad | Preparar matriz y propuesta independiente de init.sql; nunca ejecutar GRANT/REVOKE contra BD existente |
| PRE-SEC-011 | Allowlist de logs HTTP/Baileys; cuerpos externos limitados; docs por defecto desactivadas en distribución; cabeceras en APIs | Parcial; algunos cambios sin comprobación específica | Typecheck actual; docs sin rutas registradas verificadas en app test con docs desactivadas | Prueba del default de producción, logging actualizado, CSP/cabeceras del servidor de frontend aún no definido | Resolver fixture TLS, revisar tests focalizados y definir capa real de headers; no atribuir CSP del frontend a API |
| PRE-SEC-012 | scripts/seed-safety.cjs comprueba entorno/destino antes de importar cliente/leer .env; seed-dev lo llama primero | Comprobado de forma acotada; pendiente operativo | Seis casos puros aprobados; sin seed ejecutado | Inventario/exclusión de cuentas demo del destino por responsable | Completar procedimiento redactado y documentar EMERGEN_SEED_EXPECTED_DB; no consultar/borrar usuarios reales |
| PRE-SEC-013 | Backup tiene modos iniciales 0700/0600 y nuevo rechazo de destino existente, pero falta import existsSync | Parcial con defecto identificado | Inspección confirma referencia nueva sin importación; no backup ejecutado | Corregir defecto, prueba temporal, ACL Windows/cifrado/retención/RPO/RTO/restauración y custodios | Primer paso de implementación al retomar: corregir import y verificar sin backup/DB reales |
| PRE-SEC-014 | Siete versiones directas Python coinciden con lock Linux/Python 3.12 de 25 paquetes con hashes generados; npm lock sin cambiar | Parcial; sin comprobación final de artefacto/advisories | Resolver terminó; consistencia directa inspeccionada | Instalar ese lock en imagen final; avisos oficiales y aplicabilidad; política de imágenes | Revisar advisories con metadatos, sin fuentes/secretos ni actualizaciones masivas; conservar resolución reproducible |
| PRE-SEC-015 | Renderer remoto Electron solo desarrollo explícito/no empaquetado; script dev coordinado; FileProvider restringido a shared/ | Implementado sin comprobación nativa completa | Builds desktop/móvil aprobados; rastreo estático de consumidores FileProvider | Arranque Electron específico, emulador/teléfono, release/firma y artefactos | Casos de configuración y validación nativa controlada después; no instalar APK automáticamente |

### Matriz de integridad funcional exigida por 7.1

La evidencia nominal con dobles verifica contratos simulados y DB sintética, no identidad, cobro o entrega externos reales. No existe comparación antes/después global. La línea base de cinco unidades no fue repetida con selección idéntica tras todos los cambios; la integración posterior es evidencia distinta.

| Función | Cliente/API afectada y resultado esperado | Evidencia previa | Evidencia posterior disponible | Estado | Cobertura faltante |
|---|---|---|---|---|---|
| Identidad, sesión y PIN | W/M/E → Nest; registro verificado/recuperación con Firebase falso, perfil/PIN, JWT propio para ambas APIs | Unidades iniciales de selector y PIN temporal/parcial | security-functional.e2e-spec.ts, primer caso; JWT test aceptado en FastAPI; baseline de servicio distinto | Parcial, nominal aprobado | Repetición idéntica de baseline si nuevos cambios la justifican; logout/cambio de identidad nativo; proveedor real no probado |
| Roles y apadrinados | A/S pueden lecturas permitidas; usuario común rechazado; vínculo/cupos y acceso parcial conservados | Unidades de PIN completo/parcial | Casos de roles, compra/cupos/alta de hijo y SOS parcial; guardas HTTP | Parcial, nominal aprobado | No cubre todas las operaciones, límite cinco en esta corrida ni toda transición de PIN/rol |
| Perfil, contactos, antecedentes | Lectura/edición propia y ciphertext AES-GCM con clave test; consentimiento | Unidades iniciales AES-GCM/AAD | Caso de perfil/contacto y chequeo de ciphertext en DB sintética | Parcial, nominal aprobado | No acceso a dato ajeno en esta corrida; envío real/consentimiento del dispatcher solo pruebas previas localizadas, no repetidas aquí |
| SOS | Con ubicación, sin GPS, idempotencia, una activa, cierre PIN efectivo, expiración; sin bloqueo por otras cuotas | Sin baseline funcional de esta etapa | Seis solicitudes secuenciales y fixture histórica de expiración aprobadas; parcial permitido; cola sintética | Parcial, contrato aprobado | La ubicación fue texto sintético; sin GPS físico, transporte real, resiliencia de dispatcher ni carga; no prueba agotamiento de otros presupuestos |
| Compras | Precio servidor, reserva, captura/conciliación y cupos; vía /compras | Sin baseline funcional de esta etapa | Caso completo con PayPal falso y PostgreSQL nuevo; genéricas no registradas | Parcial, nominal aprobado | Proveedor Sandbox, errores/estados ambiguos y todas las reglas de propiedad no probados de nuevo |
| Soporte/contacto | Ticket propio, transición de soporte permitida y contacto anónimo | Sin baseline funcional de esta etapa | Solicitudes FastAPI sintéticas aprobadas | Parcial, nominal aprobado | Resto de transiciones/denegaciones y cuotas distribuidas no cubiertos |
| Reportes y auxiliares | Reporte de negocio autorizado, maps/indicators consumibles con JWT; sin truncar silenciosamente | Sin baseline de esta etapa | Reporte autorizado/mapa/indicador con dobles, cinco unidades cliente y rechazo explícito de filas excesivas | Parcial, representativo aprobado | No todos los reportes o contenido PDF/XLSX; documentación/expectativas viejas; plantillas/jsReport real no inspeccionados |
| Clientes/paquetes | Compilar W/M/E y tipos comunes; propagación de sesión/URLs/errores | No builds previos a los cambios como baseline | Tres builds security-check y api-client typecheck/cinco casos aprobados; typecheck backend actual | Parcial, compilación aprobada | Sin navegación/aceptación visual completa; estos bundles contienen destinos sintéticos y no deben distribuirse |
| Arranque/configuración | Bootstrap/health aislado; variables/TLS explícitas; imagen autocontenida | No baseline de distribución | Nest con DB sintética y health de ambas APIs; Compose parsea; imagen PIN anterior | Parcial con prueba positiva de configuración fallida | Fixture TLS FastAPI debe actualizarse; imagen final, ingress, TLS/CA real, permisos, runbook y arranque release no verificados |
| Android nativo | Sin herencia de credencial ajena; permisos/GPS/volumen y FileProvider limitados | Evidencia previa ajena al fortalecimiento, sin repetir | Build web móvil y revisión estática JS/XML | Pendiente nativo | Sin sync/build nativo, instalación o teléfono. APK anterior no contiene los cambios actuales |

Para una futura prueba manual Android: primero disponer de artefacto actualizado identificado con SHA y delta local revisado; sincronizar/recompilar según cambios JS/XML y usar un backend de prueba con transporte falso y sin destinos reales. Comprobar permisos/GPS, logout/cambio de perfil, activación de volumen y acceso solo a shared/ con resultados esperados documentados. No conectar un APK antiguo al emisor real para demostrar estos cambios ni enviar SOS real. No se requiere teléfono para retomar edición y pruebas in-process.

### Diferencias frente al último punto de continuidad y siguiente paso

Hecho después de la última entrada anterior y ahora recuperado: cambios de logging/error, endurecimiento de backup, restricción de FileProvider y tres builds cliente terminados. El tipo del backend actual pasa; la imagen final aún no se construyó. No se ejecutaron consultas de advisories, escaneos, permisos DB ni runbooks operativos. La documentación general y el inventario final de variables todavía están incompletos.

Orden para el siguiente encargo, no ejecutado ahora:

1. **Implementación inmediata:** reparar únicamente el import faltante de existsSync en scripts/backup-db.mjs y comprobar sin Docker real ni backups reales; conciliar la fixture I/tests/test_deployment_config.py con la exigencia DB_SSLMODE explícita y repetir la función pura. No ejecutar backup:db o el pytest/conftest local para conseguir evidencia.
2. **Verificación aislada:** revisar expectativas de logging/lastError afectadas y seleccionar solo casos pertinentes; construir la imagen FastAPI final con lock y ejecutar PIN válido/incorrecto sintéticos, sin mounts/secretos/red de aplicación. Los servicios activos no se reconstruyen.
3. **Implementación/documentación:** inventario de variables y políticas de endpoints, guías vigentes de PIN/rutas, runbook de aplicación/rollback y propuesta mínima de permisos por tabla/secuencia/función sin tocar init.sql ni aplicar grants. Completar lectura dirigida de dispatcher, sesiones y avisos oficiales pendientes.
4. **Acción operativa del responsable:** rotación/revocación y exclusión demo; reconciliación de publicaciones DB/jsReport; CA, secretos, volúmenes, WhatsApp persistente y artefactos. Preparar pasos concretos y revisables; no ejecutar sobre el despliegue existente.
5. **Decisiones externas:** hosting/dominios/ingreso y TLS; escala/réplicas y presupuestos; política de revocación/PIN; responsables de incidentes, datos reales, backup/retención/RPO/RTO. Bloquean afirmaciones de preparación para publicar, pero no impiden las correcciones independientes anteriores.
6. **Etapa posterior:** Android release y proveedores solo en condiciones autorizadas, y ataques/pruebas amplias por el otro integrante. No forman parte de esta conciliación.

Instrucción breve para pegar al continuar:

> Retoma el prompt original de fortalecimiento con sección 7.1, usando primero la «Reconciliación tras interrupción — 30-10-2026» de docs/FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md. Confirma snapshot y preserva cambios; no repitas lo que ya tiene evidencia válida. Empieza por el import existsSync del backup y la fixture TLS FastAPI, con comprobaciones puras/temporales y máximo seis casos por corrección. Después verifica la imagen final y completa documentación/runbooks y pendientes independientes. No cambies init.sql, datos, claves, volúmenes o servicios existentes; sin seeds, commits, staging, push, publicación, proveedores reales ni ataques. Actualiza este registro al cerrar cada lote y distingue código preparado, evidencia acotada y acción operativa pendiente.

Conclusión de esta pasada: **estado conciliado para retomar**. El fortalecimiento está parcial y tiene defectos concretos pendientes; no se autoriza publicación ni se confirma integridad total.

## Continuación del fortalecimiento — 30-10-2026

Reactivada la autorización de correcciones por el adjunto de reanudación. La suspensión temporal anterior terminó; se mantienen las restricciones de datos, servicios, secretos, init.sql y Git. Snapshot confirmado: alonso, HEAD 6c228e6566487c265231c0f99dcc12de7a305557; índice vacío. La huella agregada de las 70 fuentes/documentos afectados coincide con la reconciliación, por lo que se reutilizan sus resultados sin repetir las suites. QA y todo cambio previo se preservan.

Orden de este lote: import del backup con temporales/dobles, fixture TLS y caso puro, imagen final PIN con huellas, comprobaciones focalizadas de logging/sesión, documentación vigente y runbooks/propuestas de permisos. Las matrices de la reconciliación son históricas; al cierre se agregará su estado actualizado. No se ha ejecutado todavía ninguna comprobación nueva de esta continuación.

### Punto de continuidad del lote reanudado

- Backup: import existsSync reparado; dos casos VM con filesystem temporal y Docker/env falsos pasan (nominal y colisión). Ningún backup real ejecutado.
- Fixture TLS reparada sin cambiar el validador; python-config ejecutó dos pruebas puras/seis construcciones Settings, todas aprobadas, sin conftest, BD o .env.
- Imagen final Linux/amd64 construida con lock y hashes. ID sha256:1235a7b2d5e21ff1a531df7fa9ff9ecc490ec6a777567111bbc8bb90608502f8; PIN válido/incorrecto sintéticos aprobados contra ese ID, red none y sin montajes. Huella agregada de 26 entradas: cf2f21d8f2fa89a5da415acc5eba63b2efee07deabbe321c44d8ed0f8683f698.
- Logging: seis casos de allowlist HTTP/Baileys/conexión/dispatcher/entrega pasan. Respuestas salientes: dos casos con bytes reales y cancelación pasan. Sesión móvil: tres casos con puente Capacitor falso pasan (no herencia, refresco propio y logout). El primer comando Vitest usó ruta de config duplicada; se corrigió el comando, sin cambiar código para aprobar.
- Avisos oficiales: consulta GitHub reviewed de 17 versiones npm y 25 Python encontró rangos afectados para Electron/Vite; Python no devolvió coincidencias para esas versiones. No equivale a auditoría completa/transitiva/npm ni de imágenes.
- Vite 8.3.0 → 8.3.3 instalado en W/M/E; builds security-check de los tres pasan. Lock ajusta también Rolldown y sus bindings de plataforma, y tipos oxc asociados; sin cambio de versión mayor. npm dejó un directorio temporal de binding en uso: no se forzó limpieza ni se cerró proceso.
- Electron 44.4.3 → 44.9.1 preparado en manifiesto y lock tras EBUSY al intentar instalar archivos en uso. node_modules/electron sigue en 44.4.3; no se detuvo Electron ni se forzó reemplazo. Instalar/verificar binario corregido y release queda pendiente operativo. No afirmar mitigación aplicada al ejecutable actual.
- Siguiente paso: prueba pura del main Electron, cerrar documentación/políticas/variables y runbooks/propuesta de permisos; después actualizar matrices y comprobar la huella final de fuentes. No repetir las integraciones sintéticas por cambios exclusivamente documentales/de test.


### Cierre vigente de esta continuación — 30-10-2026

Este cierre reemplaza los pendientes de las entradas históricas cuando se refieren al mismo archivo/control. Se completaron las correcciones y verificaciones locales siguientes; persisten bloqueos operativos y decisiones expresamente indicados. Las entradas anteriores, incluida la reconciliación y el punto de continuidad, se conservan con su alcance temporal.

#### Correcciones y documentación realizadas

| Tarea y archivos/líneas actuales | Acción | Estado y evidencia |
|---|---|---|
| scripts/backup-db.mjs:4,78; scripts/backup-db.test.mjs:12–68 | Añadida la importación de existsSync conservando rechazo de colisión y manifiesto exclusivo. El módulo se ejecuta en VM con Docker/env falsos y archivos temporales nuevos | Corregido y comprobado de forma acotada: 2/2. No backup real, pg_dump real, archivo previo ni volumen procesado |
| I/tests/test_deployment_config.py:7,19,28; scripts/security-run.mjs:23–43 | Fixture positiva declara DB_SSLMODE=disable como política sintética explícita. Agregado rechazo sin política TLS. Ejecución directa sin pytest/conftest y con conexión bloqueada | Corregido: dos funciones/seis construcciones Settings aprobadas. No se modificó el validador ni se permitió omitir TLS en producción |
| I/Dockerfile:1–13, requirements-runtime.txt, locks/requirements-linux-py312.lock y app/core/pin.py | Construida nueva imagen final Linux/amd64 con lock/hashes y todas las fuentes vigentes. Ejecutado verificador contra su ID exacto, hash Nest bcrypt 6/coste 12 y PIN aleatorios exclusivamente sintéticos | Comprobado en artefacto final: válido e incorrecto, 2/2 secuenciales. Red none, sin mounts, sin variables/BD/secretos del host. No cambio de algoritmo, hashes existentes o semántica PIN |
| B/integrations/security-logging.spec.ts:13–69 | Dobles HTTP, loader Baileys, DB, emisor y retry; asserts de allowlist, error genérico y estado failed sin datos del proveedor | 6/6 casos de privacidad aprobados; no se emitió mensaje ni se rediseñó dispatcher |
| B/integrations/security-logging.spec.ts:72–86 | Control distinto: respuesta externa pequeña válida y stream excesivo con umbral 8 bytes/cancelación | 2/2 aprobados; no consulta a proveedor ni prueba de carga. Son dos casos del control de bytes, separados de los seis de logging |
| apps/mobile/src/lib/session-security.test.ts:8,14,20; session.ts:36–59 | Cambio de identidad sin heredar JWT, refresco del mismo perfil, logout y llamada al puente Capacitor falso | 3/3 aprobados; no prueba dispositivo, almacenamiento nativo efectivo ni revocación del JWT en servidor |
| apps/desktop/electron/main.test.cjs:8–33; main.cjs:7–17 | VM sin GUI: desarrollo explícito admite renderer local; empaquetado o producción usan archivo; sandbox/isolation/nodeIntegration comprobados | 3/3 aprobados; política de selección de renderer, no arranque de binario nuevo |
| docker-compose.production.yml:78,117; example.env; deploy/production.env.example; deploy/.gitignore; .dockerignore | Completado reenvío de presupuestos precio público/tickets, plantilla privada de servidor con las 21 variables obligatorias, exclusiones de archivos privados de deploy y de claves de firma en build Node | Implementado; Compose final parsea con entorno sintético; sin claves duplicadas ni variables obligatorias ausentes en plantilla. No configuración aplicada |
| docs/OPERACION_SEGURA.md:5–104 | Políticas HTTP, inventario de variables, capacidad provisional, aplicación y rollback, rotación, backup, custodia WhatsApp/médica y traspaso de pruebas | Preparado y revisable; pasos operativos NO ejecutados. Distingue Compose local, referencia PostgreSQL propio y adaptación a BD gestionada |
| docs/PERMISOS_BD_PROPUESTA.md:5–90 | Matriz candidata tabla/secuencia/función, bootstrap/owner/app/backup separados, SQL ilustrativo con identificadores psql; dependencias de triggers contrastadas estáticamente | Propuesta, no permisos efectivos. Ningún GRANT/REVOKE/DDL ni cambio de init.sql; necesita metadatos y validación con rol candidato en staging |
| docs/DESPLIEGUE.md:3; readme-apis.md:53–162,254–298,337–386,445; readme.apis.internas.md:1–70; I/README.md | Referencias vigentes de rutas protegidas, wrappers JWT, compras/reportes internos, rechazo 413 completo, bcrypt Python, lock, TLS/docs y runbook. Retiradas instrucciones activas de rutas genéricas | Actualización dirigida completada; enlaces locales nuevos verificados. No se ejecutaron ejemplos ni LIVE_APIS |
| docs/cuentas-temporales-pruebas.md:1–28 | Sustituida tabla histórica de identidades/credenciales locales por placeholders y procedimiento de fixtures/datos sintéticos; retirado procedimiento de promoción directa de cuentas | Limpieza del árbol, no revocación ni eliminación de historia. Archivo no tenía cambios al comenzar esta sustitución; cuentas existentes no consultadas/modificadas |

#### Comandos ejecutados y resultados nuevos

Rutas relativas a A. Ejecuciones de pruebas secuenciales, con dobles/entorno de prueba antes de importar la aplicación; ningún destino localhost:5433. Cada corrección tiene como máximo seis casos dirigidos. No se repitió la integración completa por cambios exclusivamente documentales o de tests.

| Comando real | Resultado / alcance |
|---|---|
| node --experimental-vm-modules --test scripts/backup-db.test.mjs | exit 0; 2/2, VM y temporales |
| node scripts/security-run.mjs python-config | exit 0; dos funciones/seis casos, sin conftest, env real o BD |
| docker build --pull=false --platform linux/amd64 --iidfile node_modules/.cache/security-pin-cf2f21d8f2fa.id -t emergen-internal-security:20261030-cf2f21d8f2fa -f services/internal-api/Dockerfile services/internal-api | exit 0, sesión 45206 completada. Imagen NUEVA; no compose build/up/restart de servicios |
| node scripts/check-pin-image.mjs sha256:1235a7b2d5e21ff1a531df7fa9ff9ecc490ec6a777567111bbc8bb90608502f8 | exit 0; 2/2 en esa imagen, egreso bloqueado |
| docker image inspect emergen-internal-security:20261030-cf2f21d8f2fa --format '{{.Id}} {{.Os}}/{{.Architecture}} {{.Config.User}}' | ID coincide; linux/amd64, usuario emergen. Solo esos metadatos, no inspect completo |
| node scripts/security-run.mjs jest --runTestsByPath src/integrations/security-logging.spec.ts | exit 0; 6 logging + 2 del control separado de bytes, todos aprobados |
| node scripts/security-run.mjs vitest --root apps/mobile --config vite.config.ts --mode security-check --maxWorkers 1 --no-file-parallelism src/lib/session-security.test.ts | exit 0; 3/3 con puente falso |
| node --test apps/desktop/electron/main.test.cjs | exit 0; 3/3 sin lanzar Electron/GUI |
| node scripts/check-security-advisories.mjs | Dos consultas terminadas exit 0, cada una de 17 versiones npm seleccionadas y 25 Python fijadas; detalle abajo |
| npm install --workspace=web --workspace=mobile --workspace=desktop --save-dev --save-exact vite@8.3.3 --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=15000 | exit 0 tras autorizar registro; Vite instalado. Aviso EPERM al limpiar binding antiguo en uso: no se forzó borrado ni cierre |
| npm install --workspace=desktop --save-dev --save-exact electron@44.9.1 --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=15000 | Falló EBUSY por default_app.asar en uso. No se cerró proceso ni se forzó reemplazo. Es bloqueo de instalación, no prueba funcional fallida |
| npm install --package-lock-only --workspace=desktop --save-dev --save-exact electron@44.9.1 --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=15000 | exit 0; manifiesto y lock preparados, instalación/binario pendientes |
| node scripts/security-run.mjs build web; build mobile; build desktop, como tres comandos separados | Los tres exit 0 con Vite 8.3.3. Se repitieron porque cambió herramienta compartida; modo security-check/no .env. Warnings de chunks e Ionic CSS no bloqueantes. No son release/APK/ejecutable nuevo |
| docker compose --env-file NUL -f docker-compose.production.yml config --quiet | exit 0 tras los dos reenvíos nuevos, proceso con 21 variables requeridas sintéticas y COMPOSE_DISABLE_ENV_FILE=1. CLI emitió aviso de acceso denegado a configuración Docker del usuario; el parseo terminó, sin leer/imprimir configuración privada, conectar servicios ni acreditar operación |
| git status/diff de nombres/estadística, índice/conflictos, hashes, versiones, variables y enlaces | Lecturas filtradas; resultado de cierre al final de esta sección |

Incidencias del harness: el primer Vitest tuvo ruta de configuración duplicada y no ejecutó casos; se corrigió solo el comando. La primera consulta de advisories y operaciones Docker/registro afectadas por sandbox se reejecutaron con la aprobación correspondiente. No se alteraron controles de la aplicación para hacerlas pasar.

#### Procedencia del artefacto PIN final

- Tag: emergen-internal-security:20261030-cf2f21d8f2fa.
- ID comprobado: sha256:1235a7b2d5e21ff1a531df7fa9ff9ecc490ec6a777567111bbc8bb90608502f8.
- Base realmente resuelta por el build: python:3.12-slim@sha256:aa943ce411423c7582288f18707ff66eddcbaeb510502d747a72aeb34f30d159.
- SHA-256 agregado de 26 entradas: cf2f21d8f2fa89a5da415acc5eba63b2efee07deabbe321c44d8ed0f8683f698. Método: mapa ruta-relativa→SHA256 de Dockerfile, .dockerignore, lock, requirements-runtime.txt, run.py y todos app/**/*.py; serialización JSON ordenada, separadores coma/dos puntos y SHA-256. Recalculado al cierre: coincide, ninguna entrada cambió tras build/prueba. Tests/README no se copian al runtime.
- Esa prueba acredita empaquetado e interoperabilidad PIN de dos casos en la imagen identificada, no todo su arranque, proveedores, capacidad, TLS o despliegue.

| Entrada relevante | SHA-256 de archivo, no credencial/hash de usuario |
|---|---|
| I/Dockerfile | 76aa7849ef2fd1dea1d5d1a7f42954f0f02e51d7c5822d16a7701f75cdf9b6c5 |
| I/.dockerignore | 2b2a6b5c7502974479a1ac0982606a067e30c166a2dfaaed90aba7685434247a |
| I/locks/requirements-linux-py312.lock | 5b00e94d5119d073ffaf3e9154f90a258d402ada22d8d3231f9aa6bdeb27067f |
| I/requirements-runtime.txt | 233a99cce20bb2a03e41ce7705c3c1949bdcadbd03c14306c8f8aa2d215e1e7f |
| I/run.py | 56298fabc5926cea2bca0f6cfe58eaea4353a6d2f69887e5e4ab36daf7c1a2ec |
| I/app/core/pin.py | 3a76ff2e32e66b32642b110f73ef5e1f93a88e6526561db6f2fe397252e58571 |

#### Advisories y cambio mínimo de dependencias

Consulta pública GitHub reviewed del 30-10-2026, 03:22:44 UTC: ocho avisos devolvieron rangos aplicables a Electron 44.4.3/Vite 8.3.0. Se enviaron solo nombres/versiones públicas, nunca código privado, credenciales o tokens. La [documentación de global advisories](https://docs.github.com/en/rest/security-advisories/global-advisories?apiVersion=2022-11-28) describe los filtros utilizados por scripts/check-security-advisories.mjs.

| Aviso oficial | Aplicabilidad a versión del lock inicial | Corrección en la rama actual / límite |
|---|---|---|
| [GHSA-jr5w-w6x2-84p9](https://github.com/electron/electron/security/advisories/GHSA-jr5w-w6x2-84p9), alta | Electron 44: anterior a 44.9.1; mitigación de certificados intermedios comprometidos | 44.9.1 fijada; binario NO actualizado |
| [GHSA-x562-297c-g43g](https://github.com/advisories/GHSA-x562-297c-g43g), media | Electron 44 anterior a 44.5.0; atribución de permiso pointer lock | Incluida por 44.9.1 preparada; ver bloqueo EBUSY |
| [GHSA-9jrq-w75r-8gcw](https://github.com/vitejs/vite/security/advisories/GHSA-9jrq-w75r-8gcw), baja | Vite 8.3.0–8.3.2; middleware personalizado | 8.3.3 instalada y compilaciones aprobadas |
| [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22), media | Vite 8.3.0–8.3.2; archivos fuera del allowlist en rutas no Windows | 8.3.3; desarrollo/preview no se publican |
| [GHSA-vfpm-58rq-9qcg](https://github.com/advisories/GHSA-vfpm-58rq-9qcg), media | Vite 8.3.0–8.3.2; prefijo de archivos vía wasm | 8.3.3 |
| [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw), media | Vite 8.3.0–8.3.2 y launch-editor indicado por el aviso; interpretación de flags | Vite 8.3.3; no afirmar auditoría de todos los consumidores transitivos |
| [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm), alta | Vite 8.3.0–8.3.2; comprobación de archivo launch-editor en Windows | Vite 8.3.3 |
| [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv), media | Vite 8.3.0–8.3.2; escape de argumentos Windows | Vite 8.3.3 |

[Release oficial Electron 44.9.1](https://github.com/electron/electron/releases/tag/v44.9.1) consultada. El delta de versiones del lock frente a la copia previa del lote contiene 19 entradas: Vite 8.3.3, Electron 44.9.1, Rolldown 1.2.10→1.2.16 con sus 15 bindings de plataforma y @oxc-project/types 0.151.0→0.156.0. Sin actualización masiva de otras familias/versiones mayores. La instalación con scripts desactivados no acredita descarga/empaquetado del runtime Electron.

Reconsulta completada a las 03:30:06 UTC: sin coincidencias reviewed para las 17 versiones npm del NUEVO lock y las 25 Python fijadas, sin página adicional. El listado Python no devolvió coincidencias tampoco antes. No es inventario transitivo npm completo, escaneo de imágenes/OS ni garantía de ausencia de vulnerabilidades. node_modules/electron/package.json y dist/version siguen en 44.4.3; por tanto el aviso aplicable al ejecutable local NO queda cerrado por consultar el lock nuevo. La versión instalada de Vite y sus tres manifiestos sí coinciden en 8.3.3.

#### Matriz PRE-SEC-001…015 vigente al cierre

| ID | Corrección / verificación acotada vigente | Estado | Condición de cierre restante |
|---|---|---|---|
| PRE-SEC-001 | Genéricos retirados, JWT auxiliares, wrappers y contratos protegidos con evidencia anterior válida; docs/políticas actualizadas ahora | Corregido y comprobado acotadamente en fuentes; runtime pendiente | Revisar/aplicar artefacto autorizado y aceptación de consumidores del destino; no todas las rutas tienen prueba |
| PRE-SEC-002 | Placeholders en D y limpieza adicional de documento de cuentas; inventario/runbook sin valores | Parcial: árbol limpio en esas ubicaciones, pendiente operativo | Responsable revoca/rota lo expuesto y comprueba exclusión/historia según política; limpiar Git no revoca |
| PRE-SEC-003 | Referencias loopback/red privada preparadas; runbook de reconciliación de publicaciones y volumen | Pendiente operativo | Última observación de runtime en reconciliación mantiene DB/jsReport expuestos ampliamente. No se actualizó ni volvió a acreditar aquí; responsable corrige ingreso/firewall/configuración sin perder volumen |
| PRE-SEC-004 | bcrypt Python/lock; imagen final y ambos PIN aprobados con ID/huellas actuales | Corregido y comprobado en artefacto de prueba final | Integrar imagen release revisada; no atribuir prueba PIN a todo el servicio desplegado |
| PRE-SEC-005 | Compose de referencia, plantilla, inventario y runbooks terminados; parseo sintético final aprobado | Parcial; decisión y operación pendientes | Hosting/dominios/ingreso TLS, servidor PostgreSQL TLS, jsReport independiente, persistencia/uptime y volúmenes/CA del destino |
| PRE-SEC-006 | Parsers, recursos y reportes acotados con evidencia reutilizada; respuesta externa 2/2 nueva; variables documentadas | Comprobado de forma acotada; contención parcial | Ajustar capacidad/valores por destino; paginación/exportación para históricos grandes y validación amplia posterior |
| PRE-SEC-007 | No herencia de JWT, refresco y logout JS/puente falso 3/3 | Parcial; pendiente decisión/nativo | Revocación común a ambas APIs necesita política y posiblemente esquema; comprobar almacenamiento/puente nativo. Borrado local no revoca servidor |
| PRE-SEC-008 | TTL/capacidad/proxies/slots separados; contadores y SOS sintéticos previos válidos; política compartida documentada | Parcial; pendiente decisión | Réplicas requieren cuota compartida; resolver efecto cruzado de bloqueo PIN sin cambiar semántica ni excluir SOS por cuota global |
| PRE-SEC-009 | Allowlist y estado failed comprobados con dobles; diseño de envío dentro de transacción conservado | Confiabilidad pendiente de decisión; no rediseñada | Diseñar tratamiento de envíos ambiguos/leases/recuperación con alcance y esquema autorizados; no hay garantía exactly-once |
| PRE-SEC-010 | Hardening/configuración local ya existente más propuesta de roles/grants y dependencias de triggers preparada | Parcial; propuesta sin aplicar | Responsable valida metadatos, rol candidato y TLS/CA efectivos en staging; permisos de volúmenes/recursos/owner reales sin comprobar |
| PRE-SEC-011 | Logging Node 6/6, cuerpos 2/2 y docs producción/configuración aprobadas; cabeceras API conservadas | Parcial, comprobado acotadamente | Logging Python revisado estáticamente; servidor frontend/ingreso debe definir y comprobar CSP/cabeceras y reconocimiento HTTPS, sin comodines |
| PRE-SEC-012 | Guardia seed 6 casos anteriores reutilizados; documento de cuentas sustituido por fixtures/procedimiento | Comprobado acotadamente; operativo pendiente | Responsable inventaría/excluye cuentas demo reales del destino, sin seed/promoción/borrado por este agente |
| PRE-SEC-013 | existsSync reparado y backup sintético/colisión 2/2; runbook de custodia/rollback | Defecto local cerrado; operativo pendiente | ACL Windows, cifrado/retención/offsite, exclusión mutua de tarea, restauración real aislada, RPO/RTO y custodios |
| PRE-SEC-014 | Lock Python instalado en imagen final; advisories consultados; Vite 8.3.3 instalada con tres builds; Electron 44.9.1 declarada | Parcial con bloqueo concreto de instalación | EBUSY deja runtime Electron 44.4.3; instalar/verificar artefacto corregido en ventana. Auditoría transitiva/imágenes y fijación/promoción por digest pendientes |
| PRE-SEC-015 | Renderer Electron 3/3 en VM; sesión móvil 3/3; FileProvider restringido y build móvil actual | Comprobado en JS/configuración; nativo pendiente | Binario Electron nuevo y APK firmado/actualizado; GPS/permisos/servicio/volumen/FileProvider en dispositivo. No instalar automáticamente |

Ninguna fila acredita por sí sola seguridad total o autorización de publicación. «Pendiente operativo» significa que se preparó una acción revisable y falta ejecutarla por su responsable; «pendiente decisión» no se sustituyó por una política inventada. No se descartaron nuevas señales como falsos positivos en este lote.

#### Matriz de integridad funcional vigente

| Función y esperado | Evidencia anterior reutilizada | Evidencia posterior de esta continuación | Estado y cobertura pendiente |
|---|---|---|---|
| W/M/E identidad: contraseña principal → perfil → PIN temporal/efectivo, JWT de APIs y Firebase con fin distinto | Cinco unidades iniciales y caso nominal de identidad/recuperación con proveedores falsos y DB nueva | Imagen final PIN 2/2; cambio de identidad/refresco/logout 3/3 con puente falso | Parcial aprobado en contratos simulados. No comparación global antes/después ni revocación servidor/proveedor/nativo real |
| Roles/vínculo/apadrinados/cupos, máximo cinco y acceso parcial autorizado | Integración sintética de roles, compra/cupos/hijo y SOS parcial; guardas HTTP | Fuentes de negocio sin cambio adicional en este lote; no se repitió suite | Parcial nominal; límite cinco y todas transiciones/denegaciones no probados de nuevo |
| Perfil/contactos/consentimiento y AES-GCM con claves existentes | Unidades AAD/cifrado y caso de perfil/contacto/ciphertext en DB sintética | Sin cambios de claves/esquema o lógica de perfil | Parcial; no se leyó dato real ni se probó envío médico real/consentimiento completo del emisor |
| SOS con/sin GPS, idempotencia, cierre PIN y expiración sin cuota global | Seis solicitudes y fixture histórica de expiración; JWT común y perfil parcial; cola simulada | Empaquetado PIN final 2/2 y logging/fallo con transporte falso | Parcial; coordenadas simuladas. Sin GPS/dispositivo, entrega WhatsApp real, contingencia de dispatcher ni carga/agotamiento de otros presupuestos |
| Compra/precio servidor/reserva/captura/conciliación/cupos | Caso nominal con PayPal falso/DB nueva; genéricos retirados | Documentación corregida; negocio y contratos sin cambio adicional | Parcial; sin cobro o Sandbox real ni todas las transiciones ambiguas |
| Soporte/contacto público, transiciones y privacidad | Seis solicitudes y contadores/input sintéticos de la etapa anterior | Variable de presupuesto y guías completadas; sin cambio de negocio | Parcial; no toda transición/denegación o cuota distribuida cubierta |
| Reportes completos por negocio, JWT en maps/indicators | Nominal con dobles, unidades cliente y rechazo 413 con umbral pequeño | Documentación y contratos de wrappers conciliados; byte cap saliente 2/2 | Parcial representativo; plantillas/PDF/XLSX/jsReport real y todas las familias no probadas |
| Clientes/paquetes W/M/E, tipos y propagación de sesión/configuración | api-client typecheck/cinco unidades; backend tsc --noEmit tras logging, preservados por no cambiar esas fuentes de producción | Tres builds security-check repetidos con Vite 8.3.3; sesión móvil 3/3; renderer Electron 3/3 | Compilación y contratos focalizados aprobados. Sin navegación completa ni release nuevo; bundles sintéticos no distribuibles |
| Configuración/arranque/health e imagen autocontenida | Bootstrap/health de ambas APIs con DB sintética y dobles | Fixture TLS reparada: 6 Settings; Compose final parsea; imagen PIN final | Parcial aprobado en alcance indicado. No arranque real de imagen completa, TLS/roles/ingreso del hosting o servicios existentes conciliados |
| Android nativo: credenciales/permisos/GPS/volumen SOS/FileProvider | Revisión JS/XML y build web móvil anterior | Prueba JS con puente falso y build web móvil nuevo | Pendiente de sync/build/APK actualizado firmado y pruebas físicas. APK anterior no acredita estos cambios |
| Backup sin sobrescribir ni operar sobre copia real | Defecto existsSync estático confirmado | 2/2 VM con temporales, manifiesto/colisión | Corrección aprobada localmente; restauración/recuperación operativa pendiente |

La integridad sigue **verificada parcialmente**. Los dos defectos concretos recuperados quedaron resueltos y no fallaron los casos focalizados finales. EBUSY bloqueó instalación Electron; no se presentó como regresión de negocio ni como dependencia ya aplicada. No se ejecutó pentest, fuzzing, fuerza bruta, carga o prueba de resiliencia extensa.

#### Bloqueos, siguiente paso exacto y traspaso

1. **Antes de publicar:** el responsable coordina ventana para Electron, instala lo fijado sin cierres forzosos y comprueba versión/artefacto release nuevo. Debe además decidir/aplicar hosting, secretos revocados, cuentas demo excluidas, TLS/ingreso/privilegios efectivos, volúmenes/WhatsApp y recuperación. Las publicaciones amplias observadas no se cerraron cambiando solo YAML.
2. **Decisiones que siguen abiertas:** revocación común y política PIN; dispatcher y entregas ambiguas; presupuestos/escala. El documento de operación explica dependencias. Contadores por proceso requieren solución compartida antes de varias réplicas; paginación y rediseño no se declararon implementados.
3. **Otro integrante de pruebas:** entregar esta matriz, superficie/rutas/políticas y huellas de artefactos. Preparar staging autorizado con fixtures y proveedores falsos para ataques/carga/resiliencia; no usar la BD/WhatsApp/servicios actuales. Sus pruebas amplias no se ejecutaron aquí ni quedan sustituidas por builds.
4. **Validación de distribución:** generar clientes con configuración real revisada, no reutilizar security-check; release Electron actualizado y APK nuevo. Pruebas de GPS/volumen/FileProvider y aceptación de proveedores requieren su entorno y autorización, sin emisión automática por este encargo.

Punto de reanudación breve:

> Leer primero este «Cierre vigente de esta continuación — 30-10-2026». Los dos defectos locales están corregidos; imagen PIN final y huellas están arriba. No repetir suites por la pausa. Próximo paso operativo: responsable cierra la aplicación Electron en ventana, instala la 44.9.1 fijada y verifica el artefacto; el runtime local sigue 44.4.3 por EBUSY. Preparar/aplicar hosting únicamente con plan de secretos/TLS/roles/volúmenes/backup revisado y autorización nueva. Mantener init.sql, datos, claves médicas, sesión WhatsApp y servicios activos; sin staging/commits/push, seeds, proveedores reales o pruebas amplias automáticas.

Dictamen limitado: **fortalecimiento parcial por bloqueos concretos**. El trabajo local independiente de esta continuación está completado y comprobado en el alcance descrito; instalación/release Electron, operaciones y decisiones pendientes impiden afirmar preparación para publicación.

#### Verificaciones finales del árbol local

- Rama alonso, HEAD 6c228e6566487c265231c0f99dcc12de7a305557, índice vacío y sin conflictos. Estado observado: 62 entradas versionadas modificadas y 30 archivos sin seguimiento (incluye QA/levantamiento anteriores; no se atribuyen todos a este lote). Ningún staging/commit/push.
- init.sql mantiene SHA-256 d4e71a576baaab8192e9482eb7304d9f69bacc82d3c1be361830cee0c8e78f68; no hay init.sql o migraciones cambiados. B/app.module.ts:67 mantiene synchronize: false.
- Huella de las 26 entradas del artefacto PIN coincide al cierre. Vite 8.3.3 manifiestos/lock/instalado; Electron 44.9.1 manifiesto/lock frente a 44.4.3 en paquete y archivo dist/version local, leído sin ejecutar binario.
- git diff --check: exit 0, sin defectos de whitespace; diez avisos de conversión LF/CRLF de Git. Documentos nuevos/modificados revisados sin escapes de salto accidentales, whitespace final o enlaces locales rotos; matriz final contiene las 15 señales una vez.
- No claves duplicadas en example.env ni variables obligatorias ausentes en plantilla de servidor. .dockerignore excluye deploy/ y claves de firma. No se modificó el .env operativo.
- No acciones sobre datos, roles, contraseñas, claves médicas, volúmenes, backups, sesiones WhatsApp o servicios existentes. Las verificaciones nuevas se limitaron a dobles/temporales y a la imagen de prueba aislada identificada arriba; no se publicó ni contactó proveedor real.

## Cierre vigente: Electron actualizado y panel nativo comprobado — 30-10-2026

Este cierre actualiza el bloqueo local de Electron y la evidencia de escritorio de los apartados anteriores. El usuario autorizó ahora liberar el archivo, instalar la versión fijada, comprobar el panel y actualizar documentación/prompts. Las menciones anteriores a runtime 44.4.3/EBUSY son históricas. Las demás señales, decisiones y pendientes de hosting conservan su estado: no se ejecutaron nuevos ensayos de TLS PostgreSQL, permisos, revocación o restauración.

### Liberación e instalación efectiva

- Se identificó por ruta exacta de ejecutable, PID, parentesco, helper y fecha de creación el árbol de qa-atencion-ui.cjs: 14620 → 2212 → 33192/27708/20276. Todos usaban node_modules/electron/dist/electron.exe de este proyecto y carecían de ventana principal visible. CloseMainWindow no pudo solicitar cierre. Se terminaron únicamente 33192, 27708, 20276 y 2212 tras revalidar identidad; la protección interrumpió la última terminación prevista por identidad distinta/no disponible. No se terminó un PID con identidad cambiada. Consulta posterior: cero procesos del ejecutable del proyecto; apertura exclusiva de default_app.asar aprobada. No se cerraron aplicaciones genéricas por nombre, otros Node/Electron, VS Code, ChatGPT, Docker o servicios.
- npm inicialmente respondió up to date: node_modules/.package-lock.json ya declaraba 44.9.1 mientras el paquete real seguía en 44.4.3. Se apartó solamente node_modules/electron a node_modules/.cache/electron-44.4.3-before-upgrade-20261030, verificando previamente ambos destinos absolutos dentro de node_modules y el desbloqueo del archivo. Ese respaldo de paquete queda ignorado, sin usarse como runtime ni incluirse en el candidato.
- Se repitió la instalación dirigida desde A: npm install --workspace=desktop --save-dev --save-exact electron@44.9.1 --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=15000. Resultado: added 1 package, exit 0. El uso inicial de ignore-scripts permitió revisar el instalador antes de ejecutarlo; no se presentó como instalación binaria completa.
- El install.js de 44.9.1 es idéntico al instalador previamente leído. Se ejecutó después node node_modules/electron/install.js mediante un proceso con entorno filtrado, sin mirrors/overrides/skip/checksums remotos y con cache de descarga propia del proyecto. La primera descarga restringida falló; se autorizó la descarga oficial y terminó exit 0. Se conservaron los checksums incluidos; sin force o desactivación de integridad.
- Origen por defecto confirmado en @electron/get: https://github.com/electron/electron/releases/download/v44.9.1/electron-v44.9.1-win32-x64.zip. SHA-256 de ese ZIP descargado: **41bd7900bd42d0f49110a81617876137041fbbf473466920248ddb076349ef91**, coincide con node_modules/electron/checksums.json.
- Comparación posterior con snapshot previo: package.json raíz, package-lock.json y manifiestos desktop/web/móvil conservan sus bytes; cero cambios de versiones del lock en este lote. npm ls electron --workspace=desktop --depth=0 termina exit 0 y resuelve electron@44.9.1.

| Capa comprobada | Resultado efectivo |
|---|---|
| Manifiesto desktop / lock | 44.9.1 / 44.9.1 |
| node_modules/electron/package.json / dist/version | 44.9.1 / 44.9.1 |
| Ejecutable real consultado en modo Node y usado por la prueba | Electron 44.9.1, Windows win32/x64; Chromium 152.0.7977.167; Node embebido 24.22.0 |
| Herramientas de instalación del monorepo | Node 24.21.0 y npm 11.19.0; no confundir con Node embebido |
| Ruta relativa del ejecutable | node_modules/electron/dist/electron.exe |
| SHA-256 del ejecutable, no hash de usuario | 1432afee01d6a788f11cb6649efd271923e1e490beef688c24d31f47965013aa |

### Comprobación posterior y alcance funcional

Se añadieron scripts/check-electron-panel.mjs y scripts/electron-panel-fixture.cjs para reproducir la comprobación sin servicios existentes. El runner comprueba versiones del paquete/lock/dist y consulta el ejecutable exacto. El helper carga el main.cjs y renderer compilado reales, solo adapta visibilidad/perfil/sesión de prueba, intercepta HTTP/HTTPS con respuestas en memoria y deniega WebSockets/permisos. Entorno filtrado, lectura de .env bloqueada, emisor/BD/API reales ausentes. No requiere credenciales del autor ni usa el perfil de escritorio normal. El perfil nuevo se elimina únicamente tras verificar ruta/marker propios dentro de la cache del proyecto.

| Comando/archivo | Resultado |
|---|---|
| node scripts/security-run.mjs build desktop | exit 0, TypeScript + Vite 8.3.3, modo security-check con destinos sintéticos. Warning de chunk >500 kB; sin fallo |
| node --check scripts/check-electron-panel.mjs y node --check scripts/electron-panel-fixture.cjs | exit 0 ambos |
| node scripts/check-electron-panel.mjs | exit 0 final, **6/6**, registro 2026-10-30T05:07:18.836Z. Siete peticiones de aplicación atendidas en memoria, secuenciales, sin contactar servicios |
| node --test apps/desktop/electron/main.test.cjs | exit 0, **3/3** de la política distinta de selección de renderer/configuración |
| Consulta filtrada de procesos al terminar | Cero procesos del ejecutable Electron del proyecto; prueba cerrada, ningún panel/emisor dejado activo |

| Caso nativo dirigido | Resultado esperado y observado |
|---|---|
| 1. Arranque y aislamiento | Pantalla de login renderizada por Chromium nuevo; sandbox/contextIsolation activos, nodeIntegration deshabilitado y sin require/process en renderer |
| 2. Credencial sintética inválida | Respuesta simulada 401, mensaje de rechazo y navegación administrativa ausente |
| 3. Login administrador y auditoría | Sesión sintética aceptada, autorización transmitida y fila de auditoría simulada visible |
| 4. Monitor SOS | Navegación y lectura de una alerta sintética; sin crear, cerrar o enviar SOS |
| 5. Tickets / segunda API | Consulta autorizada a FastAPI simulada, catálogo/lista renderizados y captura revisada visualmente |
| 6. Logout y recarga | Vuelta al formulario y navegación de sesión ausente incluso tras recargar |

El primer arranque gráfico en sandbox del host terminó sin emitir resultado; se repitió con permiso fuera de esa restricción y pasó, conservando sandbox=true del renderer. La primera captura escondida conservaba un fotograma anterior pese a los asserts DOM aprobados; se ajustó únicamente la espera de dos frames en el helper, repitieron los mismos seis casos y se revisó la captura final. No se relajó autenticación/TLS ni se modificó el producto para aprobar.

Evidencia sintética ignorada: node_modules/.cache/electron-panel-check-latest.json y electron-panel-check.png. Huellas observadas: main.cjs SHA-256 b8eb2475e07631d820be51528848db27e15e5d0d2d750df016c5e4cec87c986b; dist/index.html SHA-256 f9974cc515d7f8020618d75cf44cfb6b22ef844dec8963a5f0b98cfb0e0f0491. La captura no contiene datos reales. Los helpers son fuentes revisables; binarios, respaldos de módulos, perfiles, ZIP y capturas no se incorporan a Git.

### Delta de las matrices vigentes

| Señal/función | Estado actualizado | Límite o pendiente |
|---|---|---|
| PRE-SEC-014 / Electron | **Bloqueo de instalación local cerrado**: 44.9.1 efectiva y seis casos nativos aprobados | Instalación completa desde árbol limpio del candidato y reproducibilidad en otros equipos/plataformas pendientes; no auditoría global de dependencias/imágenes |
| PRE-SEC-015 / escritorio | Selección renderer 3/3 reutilizada/repetida y panel real 6/6 sobre ejecutable actualizado | Empaquetado/firma/release y todos los roles/transiciones con backend real pendientes; Android no probado de nuevo |
| Integridad desktop | Arranque, rechazo/login, auditoría, lecturas SOS/tickets, logout/recarga comprobados con dobles en runtime real | No garantiza todos los flujos legítimos, proveedores, pagos, entrega o backend real |
| Integridad web/móvil/paquetes | Fuentes funcionales y manifiestos/lock no cambiaron por esta instalación; evidencia previa vinculada conservada | No se repitieron builds web/móvil por un reemplazo local exclusivo de Electron; no aceptación visual/nativa completa o APK nuevo |

El resto de la matriz PRE-SEC-001…015 y de integridad sigue en el cierre anterior. La integridad global permanece parcialmente verificada. TLS/roles efectivos del destino, revocaciones, recuperación y decisiones de sesión/PIN/dispatcher siguen pendientes; esta autorización no ejecutó el prompt operativo amplio de prehosting.

### Documentación, candidato y siguiente paso

Actualizados README.md de A (versiones Vite/Electron y resultado), apps/desktop/README.md (guía real y comprobación), OPERACION_SEGURA.md (EBUSY cerrado), este registro, PROMPT_CLAUDE_REVISION_PRECOMMIT_EQUIPO.md y MANIFIESTO_CANDIDATO_PRECOMMIT.json. La copia del prompt en Descargas se mantiene sincronizada mediante comprobación de huellas. El manifiesto se regenera después del resto de documentación y excluye su propio archivo y el prompt para evitar autorreferencia; conserva la referencia del inventario previo y no se presenta como allowlist automática.

Próximo paso: revisión independiente de Claude del candidato completo, instalación desde copia limpia con locks y comparación de ramas/destino realmente disponibles; después correcciones pertinentes y commit por el usuario. No repetir este desbloqueo salvo una evidencia nueva. Hosting, aceptación real y pruebas amplias conservan sus responsables.

Dictamen de este lote: **actualización local de Electron completada y comprobada de forma acotada**. No constituye aprobación de publicación ni garantía de funcionamiento total de todas las aplicaciones.

Comprobaciones finales del lote: git diff --check exit 0; Node/npm y manifiestos/lock conservados; init.sql conserva SHA-256 d4e71a576baaab8192e9482eb7304d9f69bacc82d3c1be361830cee0c8e78f68 y synchronize=false. Índice vacío, sin conflictos, staging/commit/push o cambios de BD/migraciones. Binario, ZIP, respaldo del módulo y evidencia gráfica/JSON están ignorados. La implementación de aislamiento usa las APIs por sesión [protocol.handle](https://www.electronjs.org/docs/latest/api/protocol) y [webRequest](https://www.electronjs.org/docs/latest/api/web-request); sus documentos no sustituyen la evidencia ejecutada de los seis casos.


## Cierre vigente H2–H5 y reanudación tras cuota — 30-10-2026

**Estado vigente:** H2–H5 confirmados; cierre local preparado para revisión y commit del usuario con pendientes externos. Este apartado sustituye los pendientes de H2–H5 y de instalación limpia de los cierres anteriores; conserva aquellos registros y la revisión independiente de Claude como historia. No equivale a aprobación de hosting ni a integridad funcional completa.

### Estado recuperado y procedencia

La ejecución se había detenido **después de implementar y comprobar H2–H5, antes de crear el prompt por integrante y actualizar cierre/manifiesto**. El prompt nuevo no existía y el manifiesto todavía declaraba la huella histórica d0f70f5aabc9fd5da13d47432766b231497446adaca30757638d079bd26f4da1. No se detectó una escritura parcial en los archivos pertinentes ni evidencia para atribuir un defecto al apagado.

Reanudación del **30-10-2026**: rama alonso, HEAD 6c228e6566487c265231c0f99dcc12de7a305557, índice vacío y sin conflictos. Al recuperar había 65 M, 3 D y 38 ?? (106 rutas con archivos nuevos expandidos). Las tres D y dos ?? bajo graphify-out/cache/hook_sessions son cachés ajenas al candidato; se preservan. El fortalecimiento previo sigue sin commit. Se distinguen sus cambios anteriores, las correcciones H2–H5 identificadas abajo y la documentación completada ahora; no se atribuye todo el delta a esta reanudación.

Se recuperaron físicamente la copia independiente y sus JSON/logs bajo `.emergen-h2-h5-7a4d6dbd50f8486495d9d3d3c1b7d09a/`, ignorada mediante su propio .gitignore. **568/568 archivos** de source-snapshot.json coincidían tanto con las fuentes actuales como con clean/ al reanudar; también coincidió la huella canónica del mapa:

`22538f28dff20a730ac2e2ecd2b480360a17fb5349bf53d1458a32b23c966000`.

Ese snapshot incluye los cambios sin commit y archivos nuevos pertinentes, no solo HEAD. No contiene .env, dependencias/venv del autor, sesiones, backups o QA previa. No hay node_modules en sus directorios ancestros. La instalación npm tuvo 1485 paquetes y usó caché pública adquirida durante este mismo encargo, no dependencias del autor. La descarga del binario usó una caché propia inicialmente vacía. Los intentos preliminares fallidos no se presentan como instalación aprobada.

Lock de A y copia probada, sin cambio de bytes: `2bcdf7d4d414a4b12a73ba862bda191344a2502946e35bfdf56b62918f78ebbf`. El entorno Python nuevo comprobado se conserva por separado bajo `node_modules/.cache/h2-h5-ed9bada28eda45298ebbf013baf61bd0/clean/services/internal-api/.venv`, también ignorado. No se copió ese venv entre instalaciones.

El usuario informó que reinició las aplicaciones/APIs/backend. Esta reanudación no cerró, instaló sobre, reinició, reconstruyó ni probó contra esos servicios. Su presencia no demuestra que ejecuten las fuentes actuales. No se esperaron sesiones de ejecución antiguas ni se repitieron instalaciones por el reinicio.

### Conciliación H2–H5

Rutas/líneas relativas a A; comandos desde A de la copia aislada.

| Hallazgo | Cambio localizado | Evidencia disponible y vigencia | Estado | Paso restante |
|---|---|---|---|---|
| H2 | README.md:254 (§6.3), README_BDD.md, comentarios de example.env y scripts/seed-safety.test.cjs:14. Guard de seed-safety.cjs conservado; BD existente sin seed, demo solo en nueva BD dev/test independiente, seis variables y confirmación exacta | Prueba pura previa reportada 7/7; ahora recuperada mediante nueva ejecución 7/7, con los mismos bytes. Último test: destino dev válido; EMERGEN_BDD, staging, production, confirmación ausente o distinta rechazados | Confirmado | Ninguna corrección local; demo voluntaria futura en destino nuevo, no ejecutada aquí |
| H3 | apps/backend/src/main.ts:21 usa config/http-boundary.ts:5; enableCors antecede boundedJson. test/security-boundaries.e2e-spec.ts:24/:50 comparte la configuración real de arranque | JSON/log CORS del 30-10-2026T06:43:27Z recuperados; 6 aprobados/6 omitidos. Todos los archivos coinciden con snapshot probado. Build backend exit 0 | Confirmado | 414 y aceptación de CORS nativo real file:// / Origin:null sin ejecutar |
| H4 | README.md:288 (§6.4) y services/internal-api/README.md:5/:13. bcrypt Python 5.0.0, actualización obligatoria del venv propio; manifiesto local Windows distinto de lock runtime Linux | Instalación requirements.txt en venv nuevo exit 0 (06:34:40Z); PIN sintético válido/incorrecto 2/2 (06:38:25Z), sin BD/red/.env. Fuentes y requisitos coinciden | Confirmado | Actualizar el venv de cada integrante; no aceptación integral de FastAPI |
| H5 | README.md:157 (§4.3), apps/desktop/README.md y scripts/check-electron-panel.mjs:22. npm ci seguido del install.js local explícito, diagnóstico útil si falta binario | npm ci limpio exit 0; ausencia de dist y mensaje esperado exit 1 acreditados; instalación oficial exit 0, paquete/ejecutable 44.9.1 y panel nativo 6/6. Registros recuperados, mismas fuentes/lock | Confirmado | Reproducción en cada equipo/otras plataformas; release firmado y backend real pendientes |

H2 no amplía nombres permitidos ni cambia defaults globales. El bloque documentado se ejecuta desde la copia de demo, con EMERGEN_ENVIRONMENT=development, NODE_ENV=development, DB_HOST=127.0.0.1, DB_PORT=55432, DB_NAME=emergen_dev y EMERGEN_SEED_EXPECTED_DB=emergen_dev; sin DATABASE_URL heredada y con deployment local/test si existe. Las credenciales se mantienen privadas. DB_HOST=db usa 5432 dentro de Docker; loopback usa el puerto publicado del destino nuevo. No se renombró ninguna BD ni se ejecutó seed/migración.

H3 conserva allowlist, JWT, cuotas, límites y cuerpos statusCode/message/error. Los seis escenarios HTTP son rechazo 413, 415 y 400 con ACAO/cuerpo intactos y sin invocar proveedor; respuesta válida con JWT parcial; preflight permitido; y origen no permitido sin ACAO. Se usa AppModule con dobles y la misma configureHttpBoundary del bootstrap. El límite pequeño de prueba es 64 bytes, sin carga. **No se ejecutó 414**. El panel nativo intercepta APIs que devuelven ACAO *; eso no prueba el CORS del backend con origen nativo y no autoriza abrir la allowlist.

H4 no añade ni actualiza versiones: bcrypt ya estaba declarado. scripts/pin-bcrypt.cjs se conserva como legado sin consumidores de código hallados. requirements.txt incluye runtime y pruebas locales Windows/Python 3.12; locks/requirements-linux-py312.lock contiene el runtime Linux/Python 3.12 con hashes y no se instaló en Windows.

### Comprobaciones anteriores recuperadas y comprobaciones nuevas

| Procedencia | Comando / comprobación | Resultado y registro |
|---|---|---|
| Anterior, recuperada | `npm ci --no-audit --no-fund` | exit 0, 1485 paquetes; lock intacto. npm-ci.json, 2026-10-30T06:41:12Z. Nueve scripts de dependencias omitidos por política npm; no se habilitaron globalmente |
| Anterior, recuperada | `node scripts/check-electron-panel.mjs` antes de instalar dist | exit 1 esperado y sugerencia de install.js verificada, sin ENOENT opaco. missing-electron.json, 06:41:41Z |
| Anterior, recuperada | `node node_modules/electron/install.js` | exit 0, paquete local resuelto 44.9.1, ZIP oficial con checksums incluidos y caché nueva. electron-install.json, 06:42:20Z |
| Anterior, recuperada | `node scripts/security-run.mjs build backend` | exit 0, build-backend.json, 06:42:51Z |
| Anterior, recuperada | `node scripts/security-run.mjs jest --config test/jest-e2e.json --runTestsByPath test/security-boundaries.e2e-spec.ts --testNamePattern CORS` | exit 0, 6 aprobados y otros 6 omitidos por selector. cors.json/log, 06:43:27Z |
| Anterior, recuperada | `node scripts/security-run.mjs build desktop` | exit 0, TypeScript/Vite 8.3.3; aviso de chunk >500 kB. build-desktop.json, 06:45:07Z |
| Anterior, recuperada | `node scripts/check-electron-panel.mjs` después de preparar binario/build | exit 0, 6/6; panel.json y clean/node_modules/.cache/electron-panel-check-latest.json, 2026-10-30T06:45:26.319Z |
| Anterior, recuperada | Venv nuevo y `python -m pip install -r requirements.txt` desde services/internal-api de esa copia; verificador PIN con socket bloqueado | exit 0 ambos; python-install.json/log y python-pin.json/log en la copia Python indicada; bcrypt 5.0.0, 2 casos sintéticos, sin conftest/BD/.env |
| Nueva, reanudación | Reconciliación SHA-256 de 568 fuentes, JSON/logs y lock | Coincidencia completa previa a completar solo documentación. resume-state.json, 2026-10-30T12:47:40Z; no nueva prueba funcional |
| Nueva, reanudación | `node --test scripts/seed-safety.test.cjs` en la copia aislada | 7/7, exit 0; seed-guard.json/log, 2026-10-30T12:47:40Z. Se repitió solo para dejar evidencia persistida del guard puro |
| Nueva, reanudación | Recalcular entradas de imagen PIN, integridad documental/manifiesto, `git diff --check`, índice/protegidos | Sin cambio de entradas ejecutables; verificaciones de cierre, sin instalaciones o servicios nuevos |

Las marcas 06:xxZ conservan la fecha de la ejecución anterior; no se atribuyen a la reanudación. El resultado previo 7/7 del guard constaba en el hilo pero no tenía JSON/log recuperable en esta copia: se distingue del nuevo registro, sin reconstruir una salida antigua. Las restantes salidas indicadas sí se recuperaron.

El ejecutable usado por el panel es Windows x64, Electron 44.9.1 / Chromium 152.0.7977.167 / Node embebido 24.22.0. Herramientas de instalación: Node 24.21.0 y npm 11.19.0. ZIP oficial electron-v44.9.1-win32-x64.zip SHA-256 `41bd7900bd42d0f49110a81617876137041fbbf473466920248ddb076349ef91`; ejecutable `1432afee01d6a788f11cb6649efd271923e1e490beef688c24d31f47965013aa`; main.cjs `b8eb2475e07631d820be51528848db27e15e5d0d2d750df016c5e4cec87c986b`; renderer index.html `f9974cc515d7f8020618d75cf44cfb6b22ef844dec8963a5f0b98cfb0e0f0491`. Se repitió entonces el panel por la instalación independiente nueva, no por EBUSY. Seis casos: runtime/login, login inválido, administrador/auditoría, monitor SOS de lectura, tickets/segunda API y logout/recarga; siete peticiones en memoria, HTTP/HTTPS interceptados y WebSockets denegados.

Las **26 entradas** de la imagen PIN final mantienen la huella `cf2f21d8f2fa89a5da415acc5eba63b2efee07deabbe321c44d8ed0f8683f698`, recalculada ahora. Se reutiliza el resultado previo 2/2 de la imagen `sha256:1235a7b2d5e21ff1a531df7fa9ff9ecc490ec6a777567111bbc8bb90608502f8`; no se reconstruyó/arrancó una imagen ni se presenta como prueba nueva. Los builds/pruebas previos web, móvil, cliente API y demás controles conservan únicamente su alcance histórico, con fuentes pertinentes sin cambio; no se relanzó la batería completa.

### Entregables completados y candidato

Completados ahora: README.md (referencia a instalación limpia), OPERACION_SEGURA.md (preparación H2–H5 y servicios activos), este cierre, la marca histórica de PROMPT_CLAUDE_REVISION_PRECOMMIT_EQUIPO.md, **[PROMPT_CLAUDE_ACTUALIZACION_EQUIPO_POSTMERGE.md](PROMPT_CLAUDE_ACTUALIZACION_EQUIPO_POSTMERGE.md)** y MANIFIESTO_CANDIDATO_PRECOMMIT.json. README_BDD, example.env, README desktop/Python y los cinco archivos de código/tests señalados ya contenían la corrección anterior y no se reimplementaron.

El prompt nuevo está listo para entregar tras el commit revisado del usuario. Indica obtener **el SHA real** que incluya el fortalecimiento cuando exista; el HEAD antiguo no lo sustituye. Identifica rama/dirección, evita un merge repetido, conserva cambios/privados, prepara Node/Electron/venv propios, permite arreglos mínimos atribuibles y exige matriz funcional y reporte por integrante. Aclaración expresa del usuario del 30-10-2026: **rama del integrante → alonso**, como excepción para esta integración al flujo general hacia main de CONTRIBUTING. El prompt registra ese destino sin cambiar las reglas generales ni ejecutar Git. Recibir trabajo de otra rama en alonso no incorpora automáticamente el fortalecimiento de alonso en la rama personal del integrante; se distingue la copia/rama que se validará. Git asignará el SHA al crear el commit; se comunica después o se consulta en el repositorio, sin intentar autorreferenciarlo dentro del mismo commit. Integración y publicación no se ejecutan automáticamente.

El manifiesto actual es la fuente de la **huella vigente** y de las listas explícitas de archivos modificados/nuevos revisables, con tres entregables compañeros fuera de la huella para evitar autorreferencia. Mantiene el método SHA-256 del arreglo files como JSON UTF-8, ensure_ascii=false, claves ordenadas y separadores coma/dos puntos. La huella d0f70f5a… queda en previous_snapshots como histórica. No se inserta la nueva huella en este cierre, que se incluye en ese inventario.

Las entradas de .env documental/QA previa se mantienen solo como metadatos sin hash ni exportación; el levantamiento raíz queda para revisión aparte. La revisión independiente de Claude y los cinco cambios Graphify se excluyen del candidato. Se conservan intactos: la revisión histórica mantiene SHA-256 `409b26625c93b5a52ff235c9a639a6691fe8359c010bb72dd57911aec949e399`. También quedan fuera node_modules, venv, directorios aislados, binarios/ZIP, capturas/perfiles, secretos, backups, sesiones, APK y bundles sintéticos. El manifiesto **no autoriza incluir automáticamente el delta** ni hace staging.

El snapshot original y sus salidas se conservan; los cambios finales son documentales. final-source-snapshot.json registra la superposición documental final en la copia y su relación con el snapshot probado, sin presentar documentos nuevos como fuentes funcionales reprobadas.

### Delta de matrices y pendientes

| Señal / función | Estado vigente de este cierre | Límite conservado |
|---|---|---|
| PRE-SEC-014 / Electron | Instalación limpia del delta y adquisición explícita oficial confirmadas en Windows x64; lock intacto | Instalación de cada integrante, Linux/macOS, auditoría global transitiva/imágenes y promoción por digest no cerradas |
| PRE-SEC-015 / desktop | Panel nativo 6/6 en la copia independiente con mismas fuentes/runtime; selección renderer previa conservada | Empaquetado/firma, todos los roles/transiciones y aceptación con backend real pendientes |
| HTTP/CORS | Orden real compartido y seis casos dirigidos confirmados | 414, Origin:null/file:// frente a backend real y configuración del destino no aceptados |
| Python/PIN | Venv Windows propio con bcrypt 5.0.0 y PIN sintético 2/2; evidencia Linux final anterior reutilizada | Servicio completo, PIN cruzado y política de sesión común pendientes |
| Integridad global | **Parcialmente verificada**; matriz funcional anterior conservada salvo estos deltas | No todas las funciones, plataformas o ramas del equipo se probaron; build no equivale a aceptación |

El resto de PRE-SEC-001…015 y las filas de integridad no cambian por este cierre. **H1 excluido expresamente**, sin rotaciones/revocaciones, cambios de historia o nuevos saneamientos; sigue pendiente antes de hosting. No se implementaron H6–H11. Persisten TLS/ingreso/CSP y permisos efectivos del destino, backup/restauración/descifrado, decisiones de sesión/PIN, cuotas entre réplicas y dispatcher/entregas ambiguas. Android físico (GPS/permisos/volumen/segundo plano/FileProvider), APK actualizado, proveedores y release firmado requieren responsables y aceptación propios.

init.sql conserva SHA-256 `d4e71a576baaab8192e9482eb7304d9f69bacc82d3c1be361830cee0c8e78f68`; synchronize=false. Sin cambios a esquema/migraciones, datos, BD/roles/volúmenes, claves, sesión Baileys o servicios existentes. Sin staging/commit/merge/push, cambios de rama o despliegue.

Siguiente paso: revisión del delta/listas y commit por el usuario; identificar luego su SHA real y seguir el prompt por integrante conforme al flujo del equipo. H2–H5 no tienen bloqueo local restante; los pendientes externos limitan testing/hosting/publicación.

