<!-- converted from BDD con tipos de datos.xlsx -->

## Sheet: USUARIO
| Tablas a usar y tipos de datos |
| --- |
| USUARIO |  |  |  | ROL (ESTRUCTURA DE TABLA) |  |  |  | CONTACTO_EMERGENCIA |  |  |  | ESTADO_USUARIO (ESTRUCTURA DE TABLA) |  |  |  | PIN |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |
| usuario_ID | integer (PK, identity) | NOT NULL |  | rol_ID | integer (PK, identity) | NOT NULL |  | contacto_emergencia_ID | integer (PK, identity) | NOT NULL |  | estado_ID | integer (PK, identity) | NOT NULL |  | PIN_ID | integer (PK, identity) | NOT NULL |
| nombre_usuario | varchar(50) | NOT NULL |  | nombre_rol | varchar(30) | NOT NULL |  | usuario_ID | integer (FK) | NOT NULL |  | desc_estado | varchar(30) | NOT NULL |  | PIN | VARCHAR(4)  | NOT NULL |
| correo_usuario | varchar(100) | NOT NULL |  |  |  |  |  | num_emergencia | VARCHAR(16) | NOT NULL |  |  |  |  |  |  |  |  |
| contra_usuario | VARCHAR(255) | NOT NULL |  |  |  |  |  | nombre_contacto | VARCHAR(20) | NOT NULL |  |  |  |  |  |  |  |  |
| rol_ID | integer (FK) | NOT NULL |  | Catálogo cerrado de ROL |  |  |  |  |  |  |  | Catálogo cerrado de ESTADO_USUARIO |  |  |  |  |  |  |
| PIN_ID | integer (FK) | NULL |  | rol_ID | nombre_rol |  |  |  |  |  |  | estado_ID | desc_estado |  |  |  |  |  |
| msj_personalizado_ID | integer (FK) | NULL |  | 1.0 | ADMINISTRADOR |  |  |  |  |  |  | 1.0 | Acceso_completo |  |  |  |  |  |
| prioridad_ID | integer (FK) | NULL |  | 2.0 | SOPORTE |  |  |  |  |  |  | 2.0 | Acceso_parcial |  |  |  |  |  |
| usuario_principal_ID | integer (FK) | NULL |  | 3.0 | USUARIO |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| USUARIO_MENSAJE_PERSONALIZADO |  |  |  | PRIORIDAD (ESTRUCTURA) |  |  |  | ANTECEDENTE_MEDICO |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |
| msj_personalizado_ID | integer (PK, identity) | NOT NULL |  | prioridad_ID | integer (PK, identity) | NOT NULL |  | antecedente_medico_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |
| mensaje | varchar(200) | NOT NULL |  | tipo_prioridad | varchar(20) | NOT NULL |  | tipo_sangre | text | NOT NULL |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  | alergias | text | NOT NULL |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  | enfermedades_cronicas | text | NOT NULL |  |  |  |  |  |  |  |  |
|  |  |  |  | Catálogo cerrado de PRIORIDAD |  |  |  | medicamentos_actuales | text | NOT NULL |  |  |  |  |  |  |
|  |  |  |  | prioridad_ID | tipo_prioridad |  |  | discapacidad_presente | text | NOT NULL |  |  |  |  |  |  |  |  |
|  |  |  |  | 1.0 | MEDICO |  |  | donante_organos | BOOLEAN | NOT NULL |  |  |  |  |  |  |  |  |
|  |  |  |  | 2.0 | URBANO |  |  | usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |
|  |  |  |  | 3.0 | EMERGENCIA |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  | 4.0 | ADULTO MAYOR |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: APLICACIÓN
| Tablas a usar y tipos de datos |
| --- |
|  |  |  |  |  |  |  |  | Estas tablas se utilizarán principalmente para la auditoria o detalle de ingreso de cuentas en SOPORTE |  |  |  |  |  |  |  |  |
| ACCESO_APLICACION |  |  |  | APLICACION |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| acceso_ID | integer (PK, identity) | NOT NULL |  | aplicacion_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| fecha_hora_acceso | timestamptz | NOT NULL |  | origen_aplicacion | VARCHAR(50) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| aplicacion_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: NOTIFICACIÓN
| Tablas a usar y tipos de datos |
| --- |
|  |  |  |  |  |  |  |  | Estas tablas se utilizarán principalmente para la auditoria o detalle de ingreso de cuentas en SOPORTE |  |  |  |  |  |  |  |  |
| NOTIFICACION_MOVIL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| notificacion_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| titulo_mensaje | VARCHAR(100) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| cuerpo_mensaje | VARCHAR(255) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| fecha_envio | timestamptz | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: VENTA
| Tablas a usar y tipos de datos |
| --- |
| VENTA |  |  |  | DETALLE_VENTA |  |  |  | METODO_PAGO |  |  |  | ESTADO_PAGO |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| venta_ID | integer (PK, identity) | NOT NULL |  | detalle_venta_ID | integer (PK, identity) | NOT NULL |  | metodo_pago_ID | integer (PK, identity) | NOT NULL |  | estado_pago_ID | integer (PK, identity) | NOT NULL |  |  |  |  |
| usuario_ID | integer (FK) | NULL |  | venta_ID | integer (FK) | NOT NULL |  | nombre_metodo | varchar(50) | NOT NULL |  | descripcion_estado | varchar(100) | NOT NULL |  |  |  |  |
| metodo_pago_ID | integer (FK) | NOT NULL |  | plan_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_pago_ID | integer (FK) | NOT NULL |  | tipo_compra | varchar(10) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| total_venta | integer | NOT NULL |  | cantidad | integer | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| fecha_venta | timestamptz | NOT NULL |  | precio_uni | integer | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  | cupos_otorgados | integer | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: PLANES
| Tablas a usar y tipos de datos |
| --- |
| PLAN |  |  |  | PLAN_USUARIO |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| plan_ID | integer (PK, identity) | NOT NULL |  | plan_usuario_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| nombre_plan | VARCHAR(50) | NOT NULL |  | usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| precio_actual | integer | NOT NULL |  | plan_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| limite_compra_max | integer | NOT NULL |  | cupos_apadrinados_adq | integer | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: ALERTAS
| Tablas a usar y tipos de datos |
| --- |
| ALERTA |  |  |  | UBICACIÓN_ALERTA |  |  |  | HISTORIAL_ALERTA |  |  |  | DETALLE_ALERTA |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |
| alerta_ID | integer (PK, identity) | NOT NULL |  | ubicacion_alerta_ID | integer (PK, identity) | NOT NULL |  | historial_alerta_ID | integer (PK, identity) | NOT NULL |  | detalle_alerta_ID | integer (PK, identity) | NOT NULL |  |  |  |  |
| estado_alerta | varchar(15) | NOT NULL |  | ubicacion | VARCHAR(150) | NOT NULL |  | alerta_ID | integer (FK) | NOT NULL |  | msj_personalizado_ID | integer (FK) | NULL |  |  |  |  |
| ubicacion_alerta_ID | integer (FK) | NULL |  | latitud | numeric(9,6) | NULL |  | detalle_alerta_ID | integer (FK) | NOT NULL |  | antecedente_medico_ID | integer (FK) | NULL |  |  |  |  |
| detalle_alerta_ID | integer (FK) | NOT NULL |  | longitud | numeric(9,6) | NULL |  | estado_anterior | varchar(15) | NULL |  | texto_mensaje | varchar(200) | NOT NULL |  |  |  |  |
| usuario_ID | integer (FK) | NULL |  | precision_m | numeric(7,1) | NULL |  | estado_actual | varchar(15) | NOT NULL |  |  |  |  |  |  |
| prioridad_ID | integer (FK) | NOT NULL |  | fecha_captura | timestamptz | NULL |  | fecha_cambio_estado | timestamptz | NOT NULL |  |  |  |  |  |  |  |  |
| clave_idempotencia | uuid (UNIQUE) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| fecha_creacion | timestamptz | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| fecha_cierre | timestamptz | NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| ENVIO_ALERTA |  |  |  | ENLACE_MEDICO |  |  |  | ESTADO_ENVIO (ESTRUCTURA DE TABLA) |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |
| envio_alerta_ID | integer (PK, identity) | NOT NULL |  | enlace_medico_ID  | integer (PK, identity) | NOT NULL |  | estado_envio_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |
| alerta_ID | integer (FK) | NOT NULL |  | alerta_ID  | integer (FK, UNIQUE) | NOT NULL |  | estado_envio | varchar(30) | NOT NULL |  |  |  |  |  |  |  |  |
| contacto_emergencia_ID | integer (FK) | NULL |  | token_hash  | varchar(64) (UNIQUE) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_envio_ID | integer (FK) | NOT NULL |  | fecha_generacion | timestamptz | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| fecha_registro | timestamptz | NOT NULL |  | fecha_expiracion | timestamptz | NOT NULL |  | Catálogo cerrado de ESTADO_ENVIO |  |  |  |  |  |  |  |  |
| fecha_envio | timestamptz | NULL |  | fecha_revocacion | timestamptz | NULL |  | estado_envio_ID | estado_envio |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  | 1.0 | PENDIENTE |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  | 2.0 | ENVIADO |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  | 3.0 | FALLIDO |  |  |  |  |  |  |  |  |  |
## Sheet: SOPORTE
| Tablas a usar y tipos de datos |
| --- |
| SOPORTE |  |  |  | TICKET_SOPORTE |  |  |  | CATEGORIA_SOPORTE |  |  |  | ESTADO_TICKET |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| soporte_ID | integer (PK, identity) | NOT NULL |  | ticket_soporte_ID | integer (PK, identity) | NOT NULL |  | categoria_soporte_ID | integer (PK, identity) | NOT NULL |  | estado_ticket_ID | integer (PK, identity) | NOT NULL |  |  |  |  |
| desc_caso | VARCHAR(500) | NOT NULL |  | desc_ticket | VARCHAR(500) | NOT NULL |  | nombre_categoria | varchar (50) | NOT NULL |  | estado_ticket | VARCHAR(50) | NOT NULL |  |  |  |  |
| solucion_caso | VARCHAR(500) | NULL |  | usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| ticket_soporte_ID | integer (FK) | NOT NULL |  | categoria_soporte_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  | estado_ticket_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |
## Sheet: CONTACTO
| Tablas a usar y tipos de datos |
| --- |
| MENSAJE_CONTACTO |  |  |  | TIPO_CONTACTO |  |  |  | ESTADO_CONTACTO |  |  |  | RESPUESTA_CONTACTO |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| mensaje_contacto_ID | integer (PK, identity) | NOT NULL |  | tipo_contacto_ID | integer (PK, identity) | NOT NULL |  | estado_contacto_ID | integer (PK, identity) | NOT NULL |  | respuesta_contacto_ID | integer (PK, identity) | NOT NULL |  |  |  |  |
| nombre_remitente | VARCHAR(100) | NOT NULL |  | nombre_tipo | varchar (50) | NOT NULL |  | nombre_estado | varchar (50) | NOT NULL |  | texto_respuesta | VARCHAR(500) | NOT NULL |  |  |  |  |
| correo_remitente | VARCHAR(100) | NOT NULL |  |  |  |  |  |  |  |  |  | fecha_respuesta | timestamptz | NOT NULL |  |  |  |  |
| mensaje | VARCHAR(500) | NOT NULL |  |  |  |  |  |  |  |  |  | mensaje_contacto_ID | integer (FK) | NOT NULL |  |  |  |  |
| fecha_contacto | timestamptz | NOT NULL |  |  |  |  |  |  |  |  |  | usuario_ID | integer (FK) | NULL |  |  |
| tipo_contacto_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_contacto_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: AUDITORIA
| Tablas a usar y tipos de datos |
| --- |
| BITACORA_SISTEMA |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| bitacora_sistema_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| accion_realizada | text | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| fecha_accion | timestamptz | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| aplicacion_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| rol_actor_ID | integer (FK) | NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| usuario_afectado_ID | integer (FK) | NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| tipo_accion | VARCHAR(20) | NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| entidad_afectada | VARCHAR(30) | NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| resultado | VARCHAR(10) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| cambios | JSONB | NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: ANEXO FUERA DE ALCANCE
| Tablas a usar y tipos de datos |
| --- |
| BODEGA |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| BODEGA |  |  |  | STOCK |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| bodega_ID | integer (PK) | NOT NULL |  | stock_ID | integer (PK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| nombre_bodega | VARCHAR(50) | NOT NULL |  | producto_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  | bodega_ID | integer (FK) |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  | cantidad | integer |  |  |  |  |  |  |  |  |  |  |  |  |  |
| ENVIO |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| ENVIO |  |  |  | HISTORIAL_ENVIO |  |  |  | ESTADO_ENVIO |  |  |  | REGION_ENVIO |  |  |  | COMUNA_ENVIO |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |
| envio_ID | integer (PK) | NOT NULL |  | historial_envio_ID | integer (PK) | NOT NULL |  | estado_envio_ID | integer (PK) | NOT NULL |  | region_envio_ID | integer (PK) | NOT NULL |  | comuna_envio_ID | integer (PK) | NOT NULL |
|  |  | NOT NULL |  |  |  | NOT NULL |  |  |  | NOT NULL |  |  |  | NOT NULL |  |  |  | NOT NULL |
| PRODUCTO |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| PRODUCTO |  |  |  | PRODUCTO_VINCULADO |  |  |  | SIMS_REGISTRADA |  |  |  | ESTADO_DISPOSITIVO |  |  |  | OPERADOR_MOVIL |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |
| producto_ID | integer (PK) | NOT NULL |  | producto_vinculado_ID | integer (PK) | NOT NULL |  | sims_registrada_ID | integer (PK) | NOT NULL |  | estado_dispositivo_ID | integer (PK) | NOT NULL |  | operadorID | integer (PK) | NOT NULL |
| estado_dispositivo_ID | integer (FK) | NOT NULL |  | id_usuario | integer (FK) | NOT NULL |  | id_usuario | integer (FK) | NOT NULL |  | producto_ID | integer (FK) | NOT NULL |  | operador | VARCHAR(100) | NOT NULL |
| nombre_producto | VARCHAR(100) | NOT NULL |  | esta_vinculado | boolean | NOT NULL |  | num_sim | VARCHAR(9) | NOT NULL |  | descripcion_estado | VARCHAR(200) | NOT NULL |  |  |  |  |
| descripcion_producto | VARCHAR(100) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| producto_vinculado_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| precio_producto | integer | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| ESTADO_SIM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_sim_ID | integer (PK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| sims_registradas_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet:  MEJORAAPARTADO PRODUCTO
| Tablas a usar y tipos de datos |
| --- |