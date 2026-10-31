# Propuesta de permisos PostgreSQL para EMERGEN

Propuesta estática del 30-10-2026. No es una migración ni un script aplicado. No modifica init.sql, owners, roles, grants o datos existentes. Los privilegios efectivos del destino NO se inspeccionaron; su cierre requiere responsable BD, destino aislado y aceptación de los flujos.

## Separación propuesta

| Identidad | Uso | Restricciones |
|---|---|---|
| Bootstrap/administración | Provisionar instancia, restaurar y preparar roles | Credencial fuera de ambas APIs y de los clientes; no usarla en DB_USER de aplicación |
| Owner/migrador | DDL revisado y ownership de objetos de la aplicación | Cuenta/rol distinto, sin ejecución normal del servidor ni concesión automática de membresía al rol app |
| Aplicación compartida | Consultas NestJS/FastAPI, dispatcher y scheduler | LOGIN configurado privadamente; NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOREPLICATION, NOBYPASSRLS; sin ownership, CREATE, TRIGGER o TRUNCATE |
| Backup/recuperación | Snapshot/restauración bajo responsabilidad operativa | Separado de la aplicación; derechos concretos según pg_dump/proveedor, nunca añadirlos a la API para facilitar backup |

Un rol compartido por APIs no aísla filas por usuario: guards, propiedad/vínculo y parametrización siguen siendo necesarios. Cambiar POSTGRES_USER en un archivo no transforma permisos/owners de un volumen ya inicializado.

## Matriz candidata por objetos

S = SELECT; I = INSERT; U = UPDATE; D = DELETE. Se propone por dependencias actuales de SQL/TypeORM y triggers, no por «GRANT ALL». Las acciones automáticas de FK y los triggers pueden tener requisitos distintos: comprobarlos con rol candidato en staging sintético antes de aplicar.

| Objetos | Permisos candidatos | Recorrido que los necesita |
|---|---|---|
| rol, estado_usuario, prioridad, aplicacion, metodo_pago, estado_pago, plan, estado_envio, categoria_soporte, estado_ticket, tipo_contacto, estado_contacto | S | Catálogos de autorización, planes, formularios y estados; no hay gestión pública de catálogos |
| usuario, pin | S/I/U/D | Registro, PIN, perfil, roles administrativos y borrado/limpieza de credenciales |
| contacto_emergencia, usuario_mensaje_personalizado, antecedente_medico | S/I/U/D | Perfil/consentimiento y limpieza de datos huérfanos al borrar usuario |
| acceso_aplicacion | S/I | Registro de acceso y consultas/informes |
| plan_usuario | S/I/U | Asignación y compra de cupos/plan; borrado por FK debe verificarse sin conceder D indiscriminadamente |
| venta | S/I/U | Reserva, captura, conciliación y desasociación histórica del comprador |
| detalle_venta | S/I | Líneas de compra y lectura/integridad; verificar si futura edición autorizada exige U |
| reserva_cupos | S/I/U/D | Estados de lease/reserva; trigger de borrado elimina reservas terminales |
| alerta, detalle_alerta, envio_alerta | S/I/U | SOS/cierre, privacidad al borrar usuario y cola de envío; sin borrado público de históricos |
| historial_alerta | S/I | Historial de estados, incluido cierre desde trigger de borrado |
| ubicacion_alerta | S/I/D | Captura y eliminación de ubicación desasociada por trigger; no edición pública arbitraria |
| enlace_medico | S/U | Revocación por cierre/borrado en triggers; no se localizó endpoint vigente que justifique alta pública |
| ticket_soporte, soporte, mensaje_contacto | S/I/U | Tickets y respuesta del personal, contacto público y estados |
| respuesta_contacto | S/I/U | Respuesta y redacción de contenido al borrar autor en trigger |
| bitacora_sistema | S/I | Auditoría e informes; FK desasocia cuentas sin borrar historia |
| notificacion_movil | Sin grant inicial propuesto | Tabla presente, sin consumidor actual identificado en los recorridos revisados; si aparece, revalidar antes de conceder |

Evidencia: backend login/perfil/admin/compras/auditoria y servicios FastAPI alertas/contacto/tickets; init.sql:553–1000 y migración 20261026_whatsapp_finalizacion.sql. En particular init.sql:918 elimina reserva_cupos; :923–930 actualiza alerta/envio_alerta/enlace_medico/detalle_alerta e inserta historial; :932 elimina ubicacion_alerta; :938 actualiza respuesta_contacto; :945–956 limpia pin/mensaje/ficha. Omitir esas dependencias rompe borrados legítimos.

## Secuencias y funciones

Para tablas con I, contemplar USAGE solo sobre sus secuencias de identidad existentes; no conceder UPDATE/setval ni todas las secuencias del schema. Obtener el nombre real con pg_get_serial_sequence como metadato, sin leer filas. Columnas de referencia:

| Tabla | Columna de identidad |
|---|---|
| usuario / pin | usuario_id / pin_id |
| contacto_emergencia / usuario_mensaje_personalizado / antecedente_medico | contacto_emergencia_id / msj_personalizado_id / antecedente_medico_id |
| acceso_aplicacion / plan_usuario | acceso_id / plan_usuario_id |
| venta / detalle_venta | venta_id / detalle_venta_id |
| alerta / detalle_alerta / ubicacion_alerta | alerta_id / detalle_alerta_id / ubicacion_alerta_id |
| historial_alerta / envio_alerta | historial_alerta_id / envio_alerta_id |
| ticket_soporte / soporte | ticket_soporte_id / soporte_id |
| mensaje_contacto / respuesta_contacto / bitacora_sistema | mensaje_contacto_id / respuesta_contacto_id / bitacora_sistema_id |

reserva_cupos usa la venta como clave; no necesita secuencia propia. No se otorga secuencia de catálogos, notificacion_movil o enlace_medico mientras no se justifique I.

Las funciones revisadas no declaran SECURITY DEFINER; no convertirlas a ese modo para suplir permisos faltantes. El owner instala triggers; el rol aplicación no necesita crearlos. Revisar EXECUTE de helpers llamados por otras funciones, especialmente public.emergen_bloquear_usuario(integer) y public.emergen_comprobar_total_venta(integer), y dependencias de las funciones de vínculo, planes, contactos, historial, envíos, revocación, reservas y borrado. Revisar el EXECUTE heredado de PUBLIC antes de revocar, sin indiscriminadamente romper el recorrido del trigger. No se conceden por defecto EXECUTE sobre todas las funciones o privilegios de extensión.

## Esqueleto para revisión por el responsable

Los nombres de rol/BD son variables psql de identificador, no valores de contraseña. Este ejemplo solo ilustra concesiones exactas y necesita completarse conforme a la matriz, metadatos y owner del destino. No se ejecutó ni se certificó como conjunto mínimo efectivo.

    GRANT CONNECT ON DATABASE :"db_name" TO :"app_role";
    GRANT USAGE ON SCHEMA public TO :"app_role";
    GRANT SELECT ON public.rol, public.estado_usuario, public.prioridad,
        public.aplicacion, public.metodo_pago, public.estado_pago, public.plan,
        public.estado_envio, public.categoria_soporte, public.estado_ticket,
        public.tipo_contacto, public.estado_contacto TO :"app_role";
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuario, public.pin,
        public.contacto_emergencia, public.usuario_mensaje_personalizado,
        public.antecedente_medico, public.reserva_cupos TO :"app_role";
    GRANT SELECT, INSERT, UPDATE ON public.alerta, public.detalle_alerta,
        public.envio_alerta, public.plan_usuario, public.venta,
        public.ticket_soporte, public.soporte, public.mensaje_contacto,
        public.respuesta_contacto TO :"app_role";
    GRANT SELECT, INSERT ON public.acceso_aplicacion, public.detalle_venta,
        public.historial_alerta, public.bitacora_sistema TO :"app_role";
    GRANT SELECT, INSERT, DELETE ON public.ubicacion_alerta TO :"app_role";
    GRANT SELECT, UPDATE ON public.enlace_medico TO :"app_role";

No incluye CREATE ROLE, cambio de owner, revocación de PUBLIC ni habilitación LOGIN/contraseña: son decisiones y acciones operativas separadas. Para secuencias/helpers, usar únicamente los nombres reales resueltos y citados, con privilegio preciso. El rol app no debe heredar owner/admin por otra membresía; no dar CREATE en public para resolver un error.

## Criterio de aceptación, sin aplicación aquí

El responsable obtiene solo metadatos de roles/owners/grants/FK/functions; contrasta matriz y configura el rol candidato en una BD nueva con fixtures. Comprueba únicamente los flujos críticos necesarios: registro/PIN, perfil/contacto, alta/borrado vinculado, compra/reserva, SOS/cierre y auditoría/soporte, incluido trigger de limpieza. Verifica que no puede DDL/TRUNCATE o modificar catálogos con su identidad. Si requiere ampliar permisos, citar sentencia/función concreta antes de conceder.

No ejecutar esta revisión en la BD existente ni imprimir datos personales o conexión/secretos. Roles efectivos/TLS y prueba de la matriz quedan pendientes del responsable y no se declaran completados por este documento.

Referencias: [privilegios PostgreSQL 15](https://www.postgresql.org/docs/15/ddl-priv.html) y [GRANT PostgreSQL 15](https://www.postgresql.org/docs/15/sql-grant.html), consultadas el 30-10-2026. Sustentan la separación de owner, permisos de tabla/secuencia/función y alcance de las concesiones; no acreditan privilegios del destino.

