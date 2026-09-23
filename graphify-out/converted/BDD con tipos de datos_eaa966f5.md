<!-- converted from BDD con tipos de datos.xlsx -->

## Sheet: USUARIO
| Tablas a usar y tipos de datos |
| --- |
| USUARIO |  |  |  | ROL |  |  |  | CONTACTO_EMERGENCIA |  |  |  | ESTADO_USUARIO |  |  |  | PIN |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |
| usuario_ID | int (PK) | NOT NULL |  | rol_ID | int (PK) | NOT NULL |  | contacto_emergencia_ID | int (PK) | NOT NULL |  | estado_ID | int (PK) | NOT NULL |  | PIN_ID | int (PK) | NOT NULL |
| nombre_usuario | nvarchar(50) | NOT NULL |  | nombre_rol | nvarchar(30) | NOT NULL |  | usuario_ID | nvarchar(9) | NOT NULL |  | desc_estado | nvarchar(30) | NOT NULL |  | PIN | int(4) | NOT NULL |
| correo_usuario | nvarchar(100) | NOT NULL |  |  |  |  |  | num_emergencia | nvarchar(9) | NOT NULL |  |  |  |
| contra_usuario | nvarchar(50) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| rol_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| PIN_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| suscripcion_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| msj_personalizado_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| prioridad_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| usuario_principal_ID | int (FK) | NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| USUARIO_SUSCRIPCION |  |  |  |  |  |  |  | PRIORIDAD |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | USUARIO_MENSAJE_PERSONALIZADO |  |  |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |
| suscripcion_ID | int (PK) | NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | prioridad_ID | int (PK) | NOT NULL |  |  |  |  |  |  |  |  |
| estado_suscripcion | boolean | NOT NULL |  | msj_personalizado_ID | int (PK) | NOT NULL |  | tipo_prioridad | nvarchar(30) | NOT NULL |  |  |  |  |  |  |  |  |
|  |  |  |  | mensaje | nvarchar(200) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: APLICACIÓN
| Tablas a usar y tipos de datos |
| --- |
|  |  |  |  |  |  |  |  | Estas tablas se utilizarán principalmente para la auditoria o detalle de ingreso de cuentas en SOPORTE |  |  |  |  |  |  |  |  |
| ACCESO_APLICACION |  |  |  | APLICACION |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| acceso_ID | int (PK) | NOT NULL |  | aplicacion_ID | int (PK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| fecha_hora_acceso | datetime | NOT NULL |  | origen_aplicacion | nvarchar | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| aplicacion_ID | int (PK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: NOTIFICACIÓN
| Tablas a usar y tipos de datos |
| --- |
|  |  |  |  |  |  |  |  | Estas tablas se utilizarán principalmente para la auditoria o detalle de ingreso de cuentas en SOPORTE |  |  |  |  |  |  |  |  |
| NOTIFICACION_MOVIL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| notificacion_ID | int (PK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| titulo_mensaje | nvarchar | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| cuerpo_mensaje | nvarchar | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| fecha_envio | date | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: VENTA
| Tablas a usar y tipos de datos |
| --- |
| VENTA |  |  |  | DETALLE_VENTA |  |  |  | METODO_PAGO |  |  |  | ESTADO_PAGO |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| venta_ID | int (PK) | NOT NULL |  | detalle_venta_ID | int (PK) | NOT NULL |  | metodo_pago_ID | int (PK) | NOT NULL |  | estado_pago_ID | int (ID) | NOT NULL |  |  |
| id_usuario | int (FK) | NOT NULL |  | venta_ID | int (FK) | NOT NULL |  | nombre_metodo | nvarchar(50) | NOT NULL |  | descripcion_estado | nvarchar(100) | NOT NULL |
| metodo_pago_ID | int (FK) | NOT NULL |  | suscripcion_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |
| estado_pago_ID | int (FK) | NOT NULL |  | max_apadrinados | int | NOT NULL |  |  |  |  |  |  |  |
| total_venta | int | NOT NULL |  | precio_uni | int | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| fecha_venta | date | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: PLANES
| Tablas a usar y tipos de datos |
| --- |
| PLAN |  |  |  | PLAN_USUARIO |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| plan_ID | int (PK) | NOT NULL |  | plan_usuario_ID | int (PK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| nombre_plan | nvarchar | NOT NULL |  | tiene_acceso_completo | boolean | NOT NULL |  |  |  |  |  |  |  |
| precio_actual | int | NOT NULL |  | cupos_apadrinados_adq | int | NOT NULL |  |  |  |  |  |  |
| limite_compra_max | int | NOT NULL |  | cupos_apadrinados_utili | int | NOT NULL |  |  |  |  |  |  |  |  |
| total_venta | int | NOT NULL |  | usuario_ID | int | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| fecha_venta | date | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: ALERTAS
| Tablas a usar y tipos de datos |
| --- |
| ALERTA |  |  |  | UBICACIÓN_ALERTA |  |  |  | HISTORIAL_ALERTA |  |  |  | DETALLE_ALERTA |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| alerta_ID | int (PK) | NOT NULL |  | ubicacion_alerta_ID | int (PK) | NOT NULL |  | historial_alerta_ID | int (PK) | NOT NULL |  | detalle_alerta_ID | int (PK) | NOT NULL |  |  |
| ubicacion_alerta_ID | int (FK) | NOT NULL |  | ubicacion |  | NOT NULL |  | alerta_ID | int (FK) | NOT NULL |  | msj_personalizado_ID | int (FK) | NOT NULL |
| detalle_alerta_ | int (FK) | NOT NULL |  |  |  |  |  | usuario_ID | int (FK) | NOT NULL |  |  |  |
| usuario_ID | int (FK) | NOT NULL |  |  |  |  |  | detalle_alerta_ID | int (FK) | NOT NULL |  |  |  |
## Sheet: SOPORTE
| Tablas a usar y tipos de datos |
| --- |
| SOPORTE |  |  |  | TICKET_SOPORTE |  |  |  | CATEGORIA_SOPORTE |  |  |  | ESTADO_TICKET |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| soporte_ID | int (PK) | NOT NULL |  | ticket_soporte_ID | int (PK) | NOT NULL |  | categoria_soporte_ID | int (PK) | NOT NULL |  | estado_ticket_ID | int (PK) | NOT NULL |  |  |
| desc_caso | nvarchar | NOT NULL |  | desc_ticket | nvarchar | NOT NULL |  | nombre_categoria | nvarchar | NOT NULL |  | estado_ticket | nvarchar | NOT NULL |
| estado_caso | nvarchar | NOT NULL |  | usuario_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |
| solucion_caso | nvarchar | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_ticket_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| categoria_soporte_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: CONTACTO
| Tablas a usar y tipos de datos |
| --- |
| MENSAJE_CONTACTO |  |  |  | TIPO_CONTACTO |  |  |  | ESTADO_CONTACTO |  |  |  | RESPUESTA_CONTACTO |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| mensaje_contacto_ID | int (PK) | NOT NULL |  | tipo_contacto_ID | int (PK) | NOT NULL |  | estado_contacto_ID | int (PK) | NOT NULL |  | respuesta_contacto_ID | int (PK) | NOT NULL |  |  |
| nombre_remitente | nvarchar | NOT NULL |  | nombre_tipo | nvarchar | NOT NULL |  | nombre_estado | nvarchar | NOT NULL |  | texto_respuesta | nvarchar | NOT NULL |
| correo_remitente | nvarchar | NOT NULL |  |  |  |  |  |  |  |  |  | fecha_respuesta | datetime | NOT NULL |
| mensaje | nvarchar | NOT NULL |  |  |  |  |  |  |  |  |  | mensaje_contacto_ID | int (FK) | NOT NULL |
| fecha_contacto | date | NOT NULL |  |  |  |  |  |  |  |  |  | usuario_ID | int (FK) | NOT NULL |  |  |
| tipo_contacto_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_contacto_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: AUDITORIA
| Tablas a usar y tipos de datos |
| --- |
| BITACORA_SISTEMA |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| bitacora_sistema_ID | int (PK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| acción_realizada | nvarchar | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| fecha_accion | date | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |
| aplicacion_ID | int (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
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