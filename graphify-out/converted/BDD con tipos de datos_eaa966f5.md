<!-- converted from BDD con tipos de datos.xlsx -->

## Sheet: USUARIO
| Tablas a usar y tipos de datos |
| --- |
| USUARIO |  |  |  | ROL |  |  |  | CONTACTO_EMERGENCIA |  |  |  | ESTADO_USUARIO |  |  |  | PIN |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |
| usuario_ID | integer (PK, identity) | NOT NULL |  | rol_ID | integer (PK, identity) | NOT NULL |  | contacto_emergencia_ID | integer (PK, identity) | NOT NULL |  | estado_ID | integer (PK, identity) | NOT NULL |  | PIN_ID | integer (PK, identity) | NOT NULL |
| nombre_usuario | varchar(50) | NOT NULL |  | nombre_rol | varchar(30) | NOT NULL |  | usuario_ID | integer (FK) | NOT NULL |  | desc_estado | varchar(30) | NOT NULL |  | PIN | integer (4) | NOT NULL |
| correo_usuario | varchar(100) | NOT NULL |  |  |  |  |  | num_emergencia | varchar(9) | NOT NULL |  |  |  |
| contra_usuario | varchar(50) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| rol_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| PIN_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| suscripcion_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| msj_personalizado_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| prioridad_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| usuario_principal_ID | integer (FK) | NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| USUARIO_SUSCRIPCION |  |  |  | USUARIO_MENSAJE_PERSONALIZADO |  |  |  | PRIORIDAD |  |  |  | ANTECEDENTE_MEDICO |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |
| suscripcion_ID | integer (PK, identity) | NOT NULL |  | msj_personalizado_ID | integer (PK, identity) | NOT NULL |  | prioridad_ID | integer (PK, identity) | NOT NULL |  | antecedente_medico_ID | integer (PK, identity) | NOT NULL |  |  |  |  |
| estado_suscripcion | boolean | NOT NULL |  | mensaje | varchar(200) | NOT NULL |  | tipo_prioridad | varchar(30) | NOT NULL |  | tipo_sangre | varchar(20) | NOT NULL |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  | alergias | varchar(250) | NOT NULL |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  | enfermedades_cronicas | varchar(250) | NOT NULL |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  | medicamentos_actuales | varchar(250) | NOT NULL |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  | discapacidad_presente | varchar(250) | NOT NULL |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  | donante_organos | BOOLEAN | NOT NULL |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  | usuario_ID | integer (FK) | NOT NULL |  |  |
## Sheet: APLICACIÓN
| Tablas a usar y tipos de datos |
| --- |
|  |  |  |  |  |  |  |  | Estas tablas se utilizarán principalmente para la auditoria o detalle de ingreso de cuentas en SOPORTE |  |  |  |  |  |  |  |  |
| ACCESO_APLICACION |  |  |  | APLICACION |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| acceso_ID | integer (PK, identity) | NOT NULL |  | aplicacion_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| fecha_hora_acceso | timestamptz | NOT NULL |  | origen_aplicacion | text | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| aplicacion_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: NOTIFICACIÓN
| Tablas a usar y tipos de datos |
| --- |
|  |  |  |  |  |  |  |  | Estas tablas se utilizarán principalmente para la auditoria o detalle de ingreso de cuentas en SOPORTE |  |  |  |  |  |  |  |  |
| NOTIFICACION_MOVIL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| notificacion_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| titulo_mensaje | text | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| cuerpo_mensaje | text | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| fecha_envio | date | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: VENTA
| Tablas a usar y tipos de datos |
| --- |
| VENTA |  |  |  | DETALLE_VENTA |  |  |  | METODO_PAGO |  |  |  | ESTADO_PAGO |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| venta_ID | integer (PK, identity) | NOT NULL |  | detalle_venta_ID | integer (PK, identity) | NOT NULL |  | metodo_pago_ID | integer (PK, identity) | NOT NULL |  | estado_pago_ID | integer (PK, identity) | NOT NULL |  |  |
| id_usuario | integer (FK) | NOT NULL |  | venta_ID | integer (FK) | NOT NULL |  | nombre_metodo | varchar(50) | NOT NULL |  | descripcion_estado | varchar(100) | NOT NULL |
| metodo_pago_ID | integer (FK) | NOT NULL |  | suscripcion_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |
| estado_pago_ID | integer (FK) | NOT NULL |  | max_apadrinados | integer | NOT NULL |  |  |  |  |  |  |  |
| total_venta | integer | NOT NULL |  | precio_uni | integer | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| fecha_venta | date | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: PLANES
| Tablas a usar y tipos de datos |
| --- |
| PLAN |  |  |  | PLAN_USUARIO |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| plan_ID | integer (PK, identity) | NOT NULL |  | plan_usuario_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| nombre_plan | text | NOT NULL |  | tiene_acceso_completo | boolean | NOT NULL |  |  |  |  |  |  |  |
| precio_actual | integer | NOT NULL |  | cupos_apadrinados_adq | integer | NOT NULL |  |  |  |  |  |  |
| limite_compra_max | integer | NOT NULL |  | cupos_apadrinados_utili | integer | NOT NULL |  |  |  |  |  |  |  |  |
| total_venta | integer | NOT NULL |  | usuario_ID | integer | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| fecha_venta | date | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |   |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: ALERTAS
| Tablas a usar y tipos de datos |
| --- |
| ALERTA |  |  |  | UBICACIÓN_ALERTA |  |  |  | HISTORIAL_ALERTA |  |  |  | DETALLE_ALERTA |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| alerta_ID | integer (PK, identity) | NOT NULL |  | ubicacion_alerta_ID | integer (PK, identity) | NOT NULL |  | historial_alerta_ID | integer (PK, identity) | NOT NULL |  | detalle_alerta_ID | integer (PK, identity) | NOT NULL |  |  |
| ubicacion_alerta_ID | integer (FK) | NOT NULL |  | ubicacion | text | NOT NULL |  | alerta_ID | integer (FK) | NOT NULL |  | msj_personalizado_ID | integer (FK) | NOT NULL |
| detalle_alerta_ID | integer (FK) | NOT NULL |  |  |  |  |  | usuario_ID | integer (FK) | NOT NULL |  | antecedente_medico_ID | integer (FK) | NULL |
| usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  | detalle_alerta_ID | integer (FK) | NOT NULL |  |  |  |
## Sheet: SOPORTE
| Tablas a usar y tipos de datos |
| --- |
| SOPORTE |  |  |  | TICKET_SOPORTE |  |  |  | CATEGORIA_SOPORTE |  |  |  | ESTADO_TICKET |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| soporte_ID | integer (PK, identity) | NOT NULL |  | ticket_soporte_ID | integer (PK, identity) | NOT NULL |  | categoria_soporte_ID | integer (PK, identity) | NOT NULL |  | estado_ticket_ID | integer (PK, identity) | NOT NULL |  |  |
| desc_caso | text | NOT NULL |  | desc_ticket | text | NOT NULL |  | nombre_categoria | varchar (50) | NOT NULL |  | estado_ticket | varchar (20) | NOT NULL |
| estado_caso | text | NOT NULL |  | usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |
| solucion_caso | text | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_ticket_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| categoria_soporte_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: CONTACTO
| Tablas a usar y tipos de datos |
| --- |
| MENSAJE_CONTACTO |  |  |  | TIPO_CONTACTO |  |  |  | ESTADO_CONTACTO |  |  |  | RESPUESTA_CONTACTO |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| mensaje_contacto_ID | integer (PK, identity) | NOT NULL |  | tipo_contacto_ID | integer (PK, identity) | NOT NULL |  | estado_contacto_ID | integer (PK, identity) | NOT NULL |  | respuesta_contacto_ID | integer (PK, identity) | NOT NULL |  |  |
| nombre_remitente | varchar (50) | NOT NULL |  | nombre_tipo | varchar (50) | NOT NULL |  | nombre_estado | varchar (50) | NOT NULL |  | texto_respuesta | text | NOT NULL |
| correo_remitente | nvarchar (120) | NOT NULL |  |  |  |  |  |  |  |  |  | fecha_respuesta | timestamptz | NOT NULL |
| mensaje | text | NOT NULL |  |  |  |  |  |  |  |  |  | mensaje_contacto_ID | integer (FK) | NOT NULL |
| fecha_contacto | date | NOT NULL |  |  |  |  |  |  |  |  |  | usuario_ID | integer (FK) | NOT NULL |  |  |
| tipo_contacto_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_contacto_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: AUDITORIA
| Tablas a usar y tipos de datos |
| --- |
| BITACORA_SISTEMA |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| bitacora_sistema_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| acción_realizada | text | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| fecha_accion | date | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| aplicacion_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: PROPUESTA DE MEJORA
| Tablas a usar y tipos de datos |
| --- |
| BODEGA |  |  |  |  |  |  |  |  |  |  |  |  |  |
| BODEGA |  |  |  | STOCK |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |
| bodega_ID | int (PK) | NOT NULL |  | stock_ID | int (PK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| nombre_bodega | nvarchar(50) | NOT NULL |  | producto_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  | bodega_ID | int (FK) |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  | cantidad | int |  |  |  |  |  |  |  |  |
| ENVIO |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| ENVIO |  |  |  | HISTORIAL_ENVIO |  |  |  | ESTADO_ENVIO |  |  |  | REGION_ENVIO |  |  |  | COMUNA_ENVIO |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |
| envio_ID | int (PK) | NOT NULL |  | historial_envio_ID | int (PK) | NOT NULL |  | estado_envio_ID | int (PK) | NOT NULL |  | region_envio_ID | int (PK) | NOT NULL |  | comuna_envio_ID | int (PK) | NOT NULL |
|  |  | NOT NULL |  |  |  | NOT NULL |  |  |  | NOT NULL |  |  |  | NOT NULL |  |  |  | NOT NULL |
| PRODUCTO |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| PRODUCTO |  |  |  | PRODUCTO_VINCULADO |  |  |  | SIMS_REGISTRADA |  |  |  | ESTADO_DISPOSITIVO |  |  |  | OPERADOR_MOVIL |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |
| producto_ID | int (PK) | NOT NULL |  | producto_vinculado_ID | int (PK) | NOT NULL |  | sims_registrada_ID | int (PK) | NOT NULL |  | estado_dispositivo_ID | int (PK) | NOT NULL |  | operadorID | int (PK) | NOT NULL |
| estado_dispositivo_ID | int (FK) | NOT NULL |  | id_usuario | int (FK) | NOT NULL |  | id_usuario | int (FK) | NOT NULL |  | producto_ID | int (FK) | NOT NULL |  | operador | nvarchar(100) | NOT NULL |
| nombre_producto | nvarchar(100) | NOT NULL |  | esta_vinculado | boolean | NOT NULL |  | num_sim | nvarchar(9) | NOT NULL |  | descripcion_estado | nvarchar(200) | NOT NULL |  |  |  |
| descripcion_producto | nvarchar(100) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| producto_vinculado_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| precio_producto | int | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| ESTADO_SIM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_sim_ID | int (PK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| sims_registradas_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet:  MEJORAAPARTADO PRODUCTO
| Tablas a usar y tipos de datos |
| --- |