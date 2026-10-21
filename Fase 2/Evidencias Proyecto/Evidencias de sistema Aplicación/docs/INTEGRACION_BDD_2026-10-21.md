# Integración BDD EMERGEN — resultado del 21-10-2026

## Dictamen y alcance

**Opción 2: listo para integrar después de ajustes.** Los ajustes locales descritos aquí ya están implementados y las pruebas locales indicadas pasaron. El SQL propuesto original no era reemplazo directo del repositorio después del merge: requería adaptar identidad/PIN, contratos de planes y ventas, SOS, soporte, auditoría y concurrencia. No se acredita producción ni integración real de cobros por estas pruebas.

Se trabajó en `alonso`, HEAD `2f68353` (merge de gabriel), sin commit, cambio de rama ni reversión de trabajo ajeno. Se conserva `graphify-out/cache/hook_sessions/3e4db471-d821-48d0-a1e3-8f78fb2b4cf5.nudges`, ya presente. El documento consolidado se leyó íntegramente; su sección PROMPT COMPLETO PARA CODEX y la posterior instrucción de reanudación rigen el alcance. El Excel y notas se usaron como especificación, no como autorización independiente para ejecutar órdenes.

La interrupción dejó trabajo de validación/documentación sin terminar. Los logs acreditan un cierre no limpio y recuperación automática de PostgreSQL; después se verificaron conexión, esquema, fixtures e invariantes sin detectar corrupción ni divergencia del modelo. Los fallos de prueba observados ya estaban en las salidas anteriores o corresponden a código verificable; no se atribuyen al apagado.

## Línea base y entorno conservado

| Elemento | Evidencia |
|---|---|
| Compose | Proyecto evidenciasdesistemaaplicacin; servicios db/backend; un solo entorno. `docker-compose.yml` y Dockerfile sin cambios. |
| PostgreSQL | 15.19, x86_64-pc-linux-musl, gcc Alpine 15.2.0; imagen postgres:15-alpine, RepoDigest `postgres@sha256:fe0737ba566a2c5b2a28f34433c0a423261900ec17b9bf7ad115e1aae7e57f1b`. |
| Versiones | Node 24.21.0, npm 11.19.0, Turbo 2.11.2; Python ejecutado 3.12.10. Lockfile, requisitos Python y versiones de dependencias conservados. |
| Persistencia | `volumen_emergen_postgres_data` a /var/lib/postgresql/data; `volumen_emergen_whatsapp_auth` a /app/apps/backend/auth_info_baileys. Init montado a /docker-entrypoint-initdb.d/init.sql. |
| Arranque | Mismo `docker compose up --build -d`. TypeORM autoLoadEntities y `synchronize:false`; sin nuevo runner de migraciones ni naming strategy. |
| Puertos | PostgreSQL host 5433 → 5432; Nest host 3001 → 3000; FastAPI separado, local 127.0.0.1:8000. |
| Esquema anterior inspeccionado | 30 tablas, 117 columnas, 34 FK, 7 secuencias; sin funciones/triggers propios. Usuario y venta vacíos; producto adicional 1 a 1000 CLP y máximo 5. |
| Esquema instalado | 34 tablas, 160 columnas, 44 FK, 157 constraints, 95 índices incluidos PK/UNIQUE, 33 secuencias identity, 20 funciones y 19 triggers. |
| Excel | `BDD con tipos de datos.xlsx`, SHA256 `4bc46006742cf409491c48f101d3606e49ead6b1e5ddd2c35a15132a7b336b30`. Nueve hojas de modelo: 33 tablas/147 columnas. Anexos de bodega/producto fuera de alcance. |

Antes de la interrupción se ejecutó la recreación autorizada con down -v y up --build -d, y se cargaron los fixtures explícitos. **En la reanudación no se repitieron down -v, init.sql ni seed-dev**. Solo se reconstruyó el backend, conservando PostgreSQL/volúmenes. `.dockerignore` se amplió para excluir .venv, cachés y archivos de ejecución Python: una caché con acceso denegado bloqueaba el envío del contexto. No cambió la estrategia de construcción/arranque.

FastAPI se inició oculto con uvicorn, puerto 8000. Sus logs/PID locales están en `services/internal-api/.runtime/` (ignorado). El proceso debe permanecer encendido para cierres automáticos; después de apagar el equipo se inicia según su README y recupera las vencidas. Compose no incluye FastAPI y no se añadió un servicio nuevo.

## Diferencias consolidadas y contrato físico

`scripts/verify-excel.py` compara tipos, longitudes/precisión, nulabilidad, identity, PK/FK y UNIQUE explícitos de las 147 columnas con el PostgreSQL instalado. Coincidieron con las excepciones expresas siguientes. `scripts/verify-schema.cjs` verifica columnas ordenadas, cuerpos de funciones y nombres de triggers contra el init local. No es un sustituto de las pruebas de comportamiento.

| Tabla(s) | Cambio/diferencia e impacto |
|---|---|
| usuario | Sin suscripcion_id; principal NULL/hijo FK real; índice único de correo normalizado global. Login de hijos independiente; no cambio de perfil. Catálogo operativo de acceso 1/2. Alta de principal parcial hasta PIN; alta completa de hijo exige PIN propio. |
| usuario_suscripcion | Eliminada; no quedan consumidores activos. Una base antigua con datos requeriría resolver equivalencia con plan, no borrar información a ciegas. |
| rol, estado_usuario, prioridad | Catálogos cerrados: roles 1/2/3; acceso completo/parcial; prioridades 1 MEDICO, 2 URBANO, 3 EMERGENCIA, 4 ADULTO MAYOR. Último administrador protegido en cambio de rol y DELETE concurrentes. |
| pin | Excepción a Excel USUARIO!Q7:S7: PIN varchar(4) → pin_hash varchar(255), bcrypt costo 12. Dos columnas adicionales: intentos_fallidos integer 0–5/default 0, bloqueado_hasta timestamptz nullable. Compartir PIN entre filas sigue permitido por el modelo; el alta de hijo completo genera su hash propio. |
| contacto_emergencia | Nombre requerido, teléfono varchar(16) internacional, máximo cinco y protección del último. Fixtures rotulados ficticios +56, sin envío. |
| usuario_mensaje_personalizado | varchar(200), no vacío. SOS copia snapshot; editar la plantilla no cambia el pasado. Limpieza conserva plantillas/PIN aún referenciados. |
| antecedente_medico | Ocho columnas del Excel y propietario único; integridad SQL. No hay CRUD ni acceso clínico nuevo. |
| acceso_aplicacion, aplicacion | Fechas timestamptz, FK y catálogo WEB/MOVIL/ESCRITORIO conservado. No se añadió un registrador de accesos. |
| notificacion_movil | Tipos/longitudes y fecha timestamptz; tabla preservada sin nuevo servicio de notificación. |
| plan | Cuatro columnas. Producto 1 adicional a 1000 CLP, máximo 5, conservado del proyecto; sin total_venta/fecha_venta ficticios. Plan base 2 de demostración solo en fixture, valor 0 no comercial. |
| plan_usuario | Cuatro columnas, UNIQUE(usuario_id), plan_id requerido; capacidad 0–5 solo en principal. Ocupación/disponibilidad calculadas desde hijos. Los planes no acreditan aprobación de pago. |
| venta | Seis columnas del Excel más las cuatro capacidades existentes: orden_paypal_id varchar(36) UNIQUE nullable, captura_paypal_id varchar(36), monto_cobrado numeric(10,2), moneda_cobrada char(3), estas últimas nullable. Comprador histórico SET NULL y fecha timestamptz. |
| detalle_venta | Siete columnas exactas; plan_id físico corregido. PLAN implica cantidad=1; CUPOS implica cantidad=cupos_otorgados y plan vigente real. Total comprobado por constraint triggers diferidos; cabecera/detalle en una transacción. |
| metodo_pago, estado_pago | PAYPAL 1 y estados 1 PENDIENTE/2 PAGADO/3 RECHAZADO/4 CANCELADO/5 REVISION conservados de consumidores. |
| reserva_cupos | Tabla adicional de seis columnas: venta_id PK/FK, usuario_id FK, cupos, estado, actualizada_en, clave_operacion UUID UNIQUE. Reservas activas cuentan contra cinco antes de llamar a PayPal. CREANDO/CAPTURANDO coordinan llamadas, INCIERTA conserva capacidad; APLICADA/LIBERADA son terminales. No libera una incertidumbre por timeout. |
| alerta | Nueve columnas del Excel más huella_solicitud varchar(64) para comprobar que un UUID repetido corresponde al mismo payload. Estado, prioridad, UUID único, fechas con zona; ubicación y usuario históricos nullable. Un solo SOS activo; no falta PIN como precondición adicional para emitir. |
| ubicacion_alerta | Seis columnas, latitud/longitud emparejadas y rangos; ubicación opcional a nivel de alerta. Sin inferir ubicación ni inventarla. |
| detalle_alerta | Cuatro columnas, texto snapshot inmutable salvo depuración de borrado; plantilla/ficha nullable. |
| historial_alerta | Seis columnas; historial inicial y una transición final. Servicio escribe cierres normales; trigger escribe el cierre por borrado. No duplicación. |
| envio_alerta, estado_envio | Seis y dos columnas. Estado 1 PENDIENTE/2 ENVIADO/3 FALLIDO; fecha_envio solo al confirmar envío. Inserción bloquea la alerta y exige contacto del emisor. Tabla/catalogo listos; aplicación no fabrica envíos ni cambia transporte. |
| enlace_medico | Seis columnas; un enlace por alerta, hash único y vencimiento posterior a generación. Inserción/renovación bloquean la alerta; cierre revoca. Integridad probada con fixtures SQL, sin HTTP clínico ni token público. |
| ticket_soporte | Cinco columnas actualizadas del Excel: desc_ticket, usuario/categoría y estado_ticket_id requerido/default 1 ABIERTO; identity PK. El ID público ahora identifica esta tabla. |
| soporte | Cuatro columnas: sin estado; solución nullable/no vacía si presente, UNIQUE(ticket_soporte_id), relación ticket 1 → seguimiento 0..1. |
| categoria_soporte, estado_ticket | IDs/nombres importados del script vigente de catálogos; ya forman parte del init, no necesitan ejecución posterior. |
| mensaje_contacto, tipo_contacto, estado_contacto, respuesta_contacto | Siete/dos/dos/cinco columnas del Excel; FK, checks, instantes con zona y respuesta con actor histórico nullable. No se añadió un módulo HTTP. |
| bitacora_sistema | Once columnas del Excel: id, accion_realizada text, fecha_accion timestamptz, usuario_id, aplicacion_id, rol_actor_id, usuario_afectado_id, tipo_accion varchar(20), entidad_afectada varchar(30), resultado varchar(10), cambios jsonb. Excepción explícita AUDITORIA!C9: actor nullable para SET NULL, conforme al prompt consolidado. Aplicación/acción/fecha/resultado requeridos; resultado EXITOSA/FALLIDA. |

Las FK conservan RESTRICT de catálogos/principal con hijos, CASCADE de dependencias personales y SET NULL de referencias históricas. El borrado rechaza reservas inciertas, cierra alertas, revoca enlaces, marca pendientes de envío FALLIDO, depura snapshot/ubicación y conserva bitácora. No acredita anonimización completa de textos/JSON; no se promete.

## Trazabilidad ERROR 01–37

Abreviaturas de evidencia: **SQL** = pruebas_init.sql con psql/constraints forzados; **AUTH** = auth-admin.db.e2e-spec.ts; **COMPRA** = compras.db.e2e-spec.ts (PayPal/mindicador simulados, PostgreSQL real); **PY** = tests Python HTTP; **RACE** = test_concurrencia.py con conexiones reales; **HTTP** = smoke-internal.cjs contra Nest/Docker + uvicorn; **META** = verify-schema.cjs/verify-excel.py. Rutas relativas a la raíz de aplicación.

| ERROR | Decisión y archivos principales | Prueba/evidencia | Estado |
|---|---|---|---|
| 01 | Conservar versiones/Compose/synchronize; informe y .dockerignore para cachés | Inventario, logs, META, build Docker | No aplicable/verificado ya resuelto: configuración preservada |
| 02 | Datos de desarrollo recreados una vez; scripts/seed-dev.cjs | Seis fixtures; reanudación sin reset | Implementado y probado |
| 03 | Quitar suscripción; init.sql, usuarios.entity.ts/service.ts, README_BDD | META, búsqueda de consumidores, AUTH | Implementado y probado |
| 04 | Correo propio global y padre nullable; login.service.ts/usuarios.service.ts/admin.service.ts | AUTH: duplicado, login hijo, edición correo | Implementado y probado |
| 05 | Solo estados 1/2; DTO, guards, desktop/api.ts y pruebas | AUTH y PY permisos; rechazo de 3 | Implementado y probado |
| 06 | bcrypt PIN cadena; pin.entity.ts, login.service.ts, core/pin.py, scripts/pin-bcrypt.cjs | AUTH, PY y HTTP (0007, incorrecto, otra familia) | Implementado y probado |
| 07 | Prioridades definitivas en init; datos ficticios | META y fixtures | Implementado y probado |
| 08 | Contactos nombrados +56, límites SQL | SQL y RACE máximo/último | Implementado y probado |
| 09 | Catálogos necesarios en init; script previo histórico | SQL, PY tickets, login/compra | Implementado y probado |
| 10 | Producto adicional 1 conservado; plan base de desarrollo separado | Seed-dev y COMPRA referencia plan 2/precio 1000 | Implementado y probado; tarifa comercial final pendiente |
| 11 | Plan del principal y ocupación derivada; entidad/service/fixtures | AUTH y RACE último cupo | Implementado y probado |
| 12 | DTO/API/panel/cliente adaptados; web recuperación y desktop ocupación | Compilaciones; AUTH; cliente 32 pruebas | Implementado con validación pendiente: recorrido visual de UI |
| 13 | Cuatro columnas PayPal y UNIQUE orden; venta.entity.ts/init.sql | META y COMPRA | Implementado y probado localmente |
| 14 | Siete columnas detalle y semántica PLAN/CUPOS | META, SQL y COMPRA | Implementado y probado |
| 15 | Mapeo físico plan_id; detalle-venta.entity.ts | COMPRA inserta/lee detalle real | Implementado y probado |
| 16 | Transacción cabecera/detalles y total diferido | SQL SET CONSTRAINTS y RACE ventas/COMMIT | Implementado y probado |
| 17 | Capacidad final bajo bloqueo, sin UPSERT incremental | COMPRA concesión única, máximo cinco | Implementado y probado |
| 18 | Reserva durable, claves estables, conciliación y UI recuperación; compras.service/controller, paypal.service, api-client | Dos órdenes último cupo; captura concurrente; timeout; PENDING/REVISION; fallo local tras captura; lease de proceso | Implementado con validación pendiente: PayPal Sandbox real |
| 19 | SOS atómico UUID/prioridad/snapshot/IDs; FastAPI schemas/services/routes | PY, HTTP, RACE UUID | Implementado y probado |
| 20 | Lecturas LEFT JOIN/nullables, propiedad y personal | PY borrado/histórico con ubicación/actor NULL | Implementado y probado |
| 21 | No persistir transporte ni crear envíos automáticos | PY verifica cero envíos; servicio WhatsApp sin cambios | Diferido por alcance |
| 22 | Sin servicio/token/enlace clínico HTTP; integridad de tabla | SQL y RACE enlace/cierre | Diferido por alcance (SQL probado) |
| 23 | PIN efectivo, intentos, cierre real, job al arranque/30s; core/scheduler.py | PY carreras manual/job, 23h59/25h, HTTP recuperación real al arranque y en ciclo periódico | Implementado y probado |
| 24 | Estado en ticket, solución nullable y seguimiento único | META, SQL, PY | Implementado y probado |
| 25 | API usa ticket_soporte_id y LEFT JOIN soporte | PY y HTTP POST/GET/PATCH/roles | Implementado y probado |
| 26 | Once columnas/auditoría, actor nullable; entidad/service/init | META, SQL, AUTH; protección de campos de credenciales | Implementado y probado |
| 27 | Instantes timestamptz sin doble UTC; auditoria/venta | META; unidad formato Chile; PY sesión America/Santiago | Implementado y probado |
| 28 | Auditoría antes de borrar, trigger como dueño de limpieza | SQL y AUTH: conservación/desasociación, PIN compartido, hijos/capacidad | Implementado y probado |
| 29 | Identity/RETURNING, sin MAX+1 | META, SQL, PY/RACE | Implementado y probado |
| 30 | No alterar reintentos/dependencias WhatsApp | diff del directorio y dependencias conservados | Diferido por alcance |
| 31 | Bloqueo común alerta en validadores envio/enlace | RACE verifica espera Lock y rechazo tras cierre/borrado | Implementado y probado |
| 32 | Filtro PG y retry completo acotado; Nest config y Python core/db/errors | 12 pruebas Nest; 40001/40P01 reales en RACE; HTTP409 sin SQL | Implementado y probado |
| 33 | Corregir semilla inválida y marcar scripts históricos | migraciones/001_compras_paypal.sql; META; documentos | Implementado y probado en instalación; migración antigua no ejecutada |
| 34 | Administrador/PIN/contraseña hasheados desde fixture | Login Docker real, AUTH y HTTP | Implementado y probado |
| 35 | pruebas_init.sql + aplicación/concurrencia | Evidencia de comandos inferior | Implementado y probado |
| 36 | Un entorno, pruebas coordinadas, estado persistido | ESTADO_INTEGRACION_BDD, seis cuentas finales, sin reservas abiertas | Implementado y probado |
| 37 | Ficha médica solo tabla/integridad; sin CRUD/cifrado/servicio ficticio | META y ausencia de endpoints nuevos | Diferido por alcance |

## Resultados ejecutados

| Comando/validación | Resultado |
|---|---|
| npm ci --engine-strict=false --no-audit --no-fund | Dependencias restauradas con lockfile existente; sin cambio de versiones. La primera descarga aislada falló; repetición autorizada correcta. |
| npm run build --workspace=backend | Aprobado; también compiló dentro de Docker después de los cambios finales. |
| npm run build --workspace=web / desktop | Aprobados; desktop repetido tras mostrar ocupación. |
| npm run check-types --workspace=@repo/api-client | Aprobado. |
| npm test --workspace=backend -- --runInBand | **127 aprobadas**, 17 suites. |
| DB_E2E=1; npm run test:e2e --workspace=backend -- --runInBand | **56 aprobadas**, cuatro suites; **7 omitidas** de proveedores reales por LIVE_APIS desactivado. |
| npm test --workspace=@repo/api-client | **32 aprobadas**, cuatro archivos. |
| services/internal-api/.venv/Scripts/python.exe -m pytest -q | **29 aprobadas**. Advertencia de deprecación Starlette/httpx; no se actualizaron dependencias. |
| psql del contenedor -X -v ON_ERROR_STOP=1 < pruebas_init.sql | BEGIN, función temporal, DO, SET CONSTRAINTS, ROLLBACK: aprobado. También pasó el runner Node. |
| node scripts/verify-schema.cjs | Coinciden 34 tablas/160 columnas, 20 funciones y 19 triggers. |
| python scripts/verify-excel.py <Excel actualizado> | Coinciden 147 columnas de 33 tablas, incluidas las excepciones documentadas. |
| scripts/smoke-internal.cjs prepare/finish + uvicorn real | JWT compartido; recuperación de SOS vencido al arrancar; emisión sin PIN; configuración bcrypt en Nest/verificación Python; cierre; soporte y permisos. Repetida con alerta insertada después del arranque: el ciclo periódico la finalizó sin reiniciar. |
| Consulta final de invariantes | Seis usuarios fixture, un plan_usuario, un administrador; cero reservas abiertas, alertas activas, transacciones idle in transaction, contactos excedidos, capacidad inválida y ventas incoherentes. |
| git diff --check | Sin errores. Compose/Dockerfile/lockfile/requirements y synchronize preservados. |

Se corrigieron expectativas de pruebas antiguas (bloqueo/plan/auditoría, HTTP/ruta y monto PayPal con redondeo 1,06) sin relajar las reglas. El fixture temporal de Python se cambió a INSERT histórico porque fecha_creacion es inmutable. La prueba HTTP Node también usa INSERT…SELECT para conservar microsegundos de PostgreSQL al escribir historial; pasar por Date de JavaScript truncaba precisión.

El cliente HTTP inválido se verificó en archivo/prueba iguales a HEAD y se reprodujo: response.json() sin manejo devolvía SyntaxError. Se añadió traducción 502 sin contenido del proveedor. La prueba existente pasó. También se corrigió el DTO PayPal que admitía monto cero pese a prometer positivo; ahora rechaza antes del proveedor. No se tocaron el servicio ni dependencias de WhatsApp.

## Pendientes y límites de la evidencia

1. Validar el flujo completo con aprobación/captura **PayPal Sandbox real**, rechazo y estados pendientes del proveedor. Los dobles prueban lógica y concurrencia local, no la disponibilidad ni semántica de una cuenta Sandbox concreta. Las siete pruebas externas fueron omitidas deliberadamente; no se realizaron cobros ni envíos.
2. Recorrido visual de la web/panel con navegador/Electron, incluyendo retomar una orden y refrescar pendientes. Compilación y contratos HTTP están probados; no se afirma una prueba visual.
3. Definir catálogo/precio comercial del plan base y el procedimiento operativo para órdenes antiguas sin ID, capturas múltiples o importes discordantes. La reserva queda retenida; no hay liberación automática insegura ni concesión por estado incierto.
4. WhatsApp/envíos persistidos, enlace médico público, ficha médica/CRUD/cifrado siguen fuera del alcance acordado. No bloquean el arranque ni las pruebas del modelo.
5. FastAPI debe iniciarse nuevamente después de apagar el equipo; está separado del Compose por diseño. No se configuró servicio de Windows ni despliegue nuevo.

No se requiere una acción manual para completar las validaciones locales ya ejecutadas. Las pruebas externas y aceptación visual anteriores deben quedar explícitas antes de acreditar integración de producción.

## Si después deben conservarse datos de una base antigua

Reemplazar el archivo init no migra el volumen. Para una base anterior con datos: respaldo lógico y prueba de restauración en PostgreSQL 15.19; inventario real de filas/constraints/IDs; script de migración versionado y transaccional donde sea posible; plan de reversión por restauración. Resolver correos compartidos y contraseñas de hijos, conversión segura o reconfiguración de PIN, estado 3, remapeo de prioridades/estados de envío y derechos de suscripción a plan; no deducir pagos aprobados de banderas antiguas.

Migrar ventas preservando referencias PayPal, reconstruir detalles y comprobar totales sin inventar compras; resolver plan base real y capacidad frente a hijos. Migrar soporte manteniendo una correspondencia de IDs antiguos a ticket/seguimiento; adaptar enlaces de consumidores. Fechas timestamp antiguas requieren conocer la zona de origen antes de convertir a timestamptz. Snapshots/historiales ausentes requieren una política explícita de dato desconocido, no contenido clínico o eventos inventados. Conservar auditoría y aplicar nulabilidad/FK en el orden correcto.

Probar la migración sobre una copia aislada con esa imagen exacta, comparar conteos/referencias/sumas, ejecutar SQL/HTTP/carreras y ensayar rollback/restauración antes de un corte coordinado. **No se implementó ni ejecutó esa migración histórica**: en este entorno estaba autorizada la recreación de datos de prueba.

La política conservadora de cinco horas para recreación/captura con clave estable se apoya en la retención publicada para Orders (seis horas por defecto); requiere validación con la cuenta concreta y no permite reintentos indefinidos. Fuentes primarias: [PayPal Create order](https://developer.paypal.com/sdk/orders/v2/orders-create/) e [idempotencia](https://developer.paypal.com/api/rest/reference/idempotency/).

Se adaptó también el script manual de auditoría a estados 2/1 y credenciales ficticias vigentes; requiere PIN propio del objetivo. No se ejecutó su exportación PDF porque jsReport es ajeno al entorno de esta tarea.

## Pasos de aceptación manual pendientes

1. Confirmar PAYPAL_MODE=sandbox y configuración de comercio de pruebas en el entorno local, sin publicar sus secretos; preparar una cuenta de comprador Sandbox. Se necesita aprobación interactiva del comprador, que no sustituyen los dobles ni las credenciales de usuario de EMERGEN.
2. Con Docker y FastAPI existentes encendidos, abrir la web con `npm run dev --workspace=web -- --mode docker`, iniciar sesión como principal@emergen.test (contraseña local en README_BDD) y comprobar estado/precio. Para el panel, usar su modo Docker documentado; validar estados 1/2, plan_ID y ocupación/disponibilidad.
3. Aprobar un cupo en Sandbox; exigir PAGADO, captura externa conservada, detalle sobre plan base 2 y aumento de capacidad exactamente uno. Repetir «Verificar» y recargar la página: no debe otorgar otro cupo. Ante PENDING/REVISION o pérdida de respuesta, usar la compra pendiente; no abrir otra para sustituirla.
4. Registrar evidencia del proveedor y del estado local. Un resultado incierto conserva reserva; órdenes sin identificar fuera de ventana y capturas discrepantes requieren conciliación operativa. No probar con PayPal live ni enviar contactos ficticios a WhatsApp.

Estas acciones no requieren down -v ni un segundo entorno. El script de fixtures es explícito, no forma parte del arranque automático. Para una base distinta que conserve datos, seguir el plan de migración anterior.
