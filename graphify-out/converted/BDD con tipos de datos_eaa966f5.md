<!-- converted from BDD con tipos de datos.xlsx -->

## Sheet: USUARIO
| Tablas a usar y tipos de datos |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| USUARIO |  |  |  | ROL |  |  |  | CONTACTO_EMERGENCIA |  |  |  | ESTADO_USUARIO |  |  |  | PIN |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |
| usuario_ID | integer (PK, identity) | NOT NULL |  | rol_ID | integer (PK, identity) | NOT NULL |  | contacto_emergencia_ID | integer (PK, identity) | NOT NULL |  | estado_ID | integer (PK, identity) | NOT NULL |  | PIN_ID | integer (PK, identity) | NOT NULL |
| nombre_usuario | varchar(50) | NOT NULL |  | nombre_rol | varchar(30) | NOT NULL |  | usuario_ID | integer (FK) | NOT NULL |  | desc_estado | varchar(30) | NOT NULL |  | PIN | VARCHAR(4) | NOT NULL |
| correo_usuario | varchar(100) | NOT NULL |  |  |  |  |  | num_emergencia | VARCHAR(16) | NOT NULL |  |  |  |  |  |  |  |  |
| contra_usuario | VARCHAR(255) | NOT NULL |  |  |  |  |  | nombre_contacto | VARCHAR(n) por definir | por definir |  |  |  |  |  |  |  |  |
| rol_ID | integer (FK) | NOT NULL |  | Catálogo cerrado de ROL (código: roles.decorator.ts) |  |  |  | parentesco | VARCHAR(n) por definir | por definir |  |  |  |  |  |  |  |  |
| PIN_ID | integer (FK) | NULL |  | rol_ID | nombre_rol |  |  |  |  |  |  |  |  |  |  |  |  |  |
| suscripcion_ID | integer (FK) | NULL |  | 1 | ADMINISTRADOR |  |  |  |  |  |  |  |  |  |  |  |  |  |
| msj_personalizado_ID | integer (FK) | NULL |  | 2 | SOPORTE |  |  |  |  |  |  |  |  |  |  |  |  |  |
| prioridad_ID | integer (FK) | NULL |  | 3 | USUARIO |  |  |  |  |  |  |  |  |  |  |  |  |  |
| usuario_principal_ID | integer (FK) | NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| USUARIO_SUSCRIPCION |  |  |  | USUARIO_MENSAJE_PERSONALIZADO |  |  |  | PRIORIDAD |  |  |  | ANTECEDENTE_MEDICO |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |
| suscripcion_ID | integer (PK, identity) | NOT NULL |  | msj_personalizado_ID | integer (PK, identity) | NOT NULL |  | prioridad_ID | integer (PK, identity) | NOT NULL |  | antecedente_medico_ID | integer (PK, identity) | NOT NULL |  |  |  |  |
| estado_suscripcion | boolean | NOT NULL |  | mensaje | varchar(200) | NOT NULL |  | tipo_prioridad | varchar(30) | NOT NULL |  | tipo_sangre | varchar(20) | NOT NULL |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  | alergias | varchar(250) | NOT NULL |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  | enfermedades_cronicas | varchar(250) | NOT NULL |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  | medicamentos_actuales | varchar(250) | NOT NULL |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  | discapacidad_presente | varchar(250) | NOT NULL |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  | donante_organos | BOOLEAN | NOT NULL |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  | usuario_ID | integer (FK) | NOT NULL |  |  |  |  |
## Sheet: APLICACIÓN
| Tablas a usar y tipos de datos |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  | Estas tablas se utilizarán principalmente para la auditoria o detalle de ingreso de cuentas en SOPORTE |  |  |  |  |  |  |  |  |  |  |
| ACCESO_APLICACION |  |  |  | APLICACION |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| acceso_ID | integer (PK, identity) | NOT NULL |  | aplicacion_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| fecha_hora_acceso | TIMESTAMP | NOT NULL |  | origen_aplicacion | VARCHAR(50) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| aplicacion_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: NOTIFICACIÓN
| Tablas a usar y tipos de datos |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  | Estas tablas se utilizarán principalmente para la auditoria o detalle de ingreso de cuentas en SOPORTE |  |  |  |  |  |  |  |  |  |  |
| NOTIFICACION_MOVIL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| notificacion_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| titulo_mensaje | VARCHAR(100) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| cuerpo_mensaje | VARCHAR(255) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| fecha_envio | TIMESTAMP | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: VENTA
| Tablas a usar y tipos de datos |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VENTA |  |  |  | DETALLE_VENTA |  |  |  | METODO_PAGO |  |  |  | ESTADO_PAGO |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| venta_ID | integer (PK, identity) | NOT NULL |  | detalle_venta_ID | integer (PK, identity) | NOT NULL |  | metodo_pago_ID | integer (PK, identity) | NOT NULL |  | estado_pago_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| id_usuario | integer (FK) | NOT NULL |  | venta_ID | integer (FK) | NOT NULL |  | nombre_metodo | varchar(50) | NOT NULL |  | descripcion_estado | varchar(100) | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| metodo_pago_ID | integer (FK) | NOT NULL |  | suscripcion_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_pago_ID | integer (FK) | NOT NULL |  | max_apadrinados | integer | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| total_venta | integer | NOT NULL |  | precio_uni | integer | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| fecha_venta | TIMESTAMP | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: PLANES
| Tablas a usar y tipos de datos |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PLAN |  |  |  | PLAN_USUARIO |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| plan_ID | integer (PK, identity) | NOT NULL |  | plan_usuario_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| nombre_plan | VARCHAR(50) | NOT NULL |  | tiene_acceso_completo | boolean | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| precio_actual | integer | NOT NULL |  | cupos_apadrinados_adq | integer | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| limite_compra_max | integer | NOT NULL |  | cupos_apadrinados_utili | integer | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| total_venta | integer | NOT NULL |  | usuario_ID | integer | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| fecha_venta | TIMESTAMP | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |   |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: ALERTAS
| Tablas a usar y tipos de datos |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ALERTA |  |  |  | UBICACIÓN_ALERTA |  |  |  | HISTORIAL_ALERTA |  |  |  | DETALLE_ALERTA |  |  |  |  |  |  |  | UBICACION_ALERTA (campos añadidos, AUDIT-187) |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |
| alerta_ID | integer (PK, identity) | NOT NULL |  | ubicacion_alerta_ID | integer (PK, identity) | NOT NULL |  | historial_alerta_ID | integer (PK, identity) | NOT NULL |  | detalle_alerta_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  | latitud | DECIMAL(9,6) (propuesto) | por definir |  |  |
| ubicacion_alerta_ID | integer (FK) | NOT NULL |  | ubicacion | VARCHAR(150) | NOT NULL |  | alerta_ID | integer (FK) | NOT NULL |  | msj_personalizado_ID | integer (FK) | NOT NULL |  |  |  |  |  | longitud | DECIMAL(9,6) (propuesto) | por definir |  |  |
| detalle_alerta_ID | integer (FK) | NOT NULL |  |  |  |  |  | usuario_ID | integer (FK) | NOT NULL |  | antecedente_medico_ID | integer (FK) | NULL |  |  |  |  |  | precision | DECIMAL(8,2) (propuesto) | por definir |  |  |
| usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  | detalle_alerta_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  | fuente | VARCHAR(30) (propuesto) | por definir |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | hora_captura | TIMESTAMP (propuesto) | por definir |  |  |
## Sheet: SOPORTE
| Tablas a usar y tipos de datos |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SOPORTE |  |  |  | TICKET_SOPORTE |  |  |  | CATEGORIA_SOPORTE |  |  |  | ESTADO_TICKET |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| soporte_ID | integer (PK, identity) | NOT NULL |  | ticket_soporte_ID | integer (PK, identity) | NOT NULL |  | categoria_soporte_ID | integer (PK, identity) | NOT NULL |  | estado_ticket_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| desc_caso | VARCHAR(500) | NOT NULL |  | desc_ticket | VARCHAR(500) | NOT NULL |  | nombre_categoria | varchar (50) | NOT NULL |  | estado_ticket | VARCHAR(50) | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| estado_caso | VARCHAR(50) | NOT NULL |  | usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| solucion_caso | VARCHAR(500) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_ticket_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| categoria_soporte_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: CONTACTO
| Tablas a usar y tipos de datos |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MENSAJE_CONTACTO |  |  |  | TIPO_CONTACTO |  |  |  | ESTADO_CONTACTO |  |  |  | RESPUESTA_CONTACTO |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |
| mensaje_contacto_ID | integer (PK, identity) | NOT NULL |  | tipo_contacto_ID | integer (PK, identity) | NOT NULL |  | estado_contacto_ID | integer (PK, identity) | NOT NULL |  | respuesta_contacto_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| nombre_remitente | VARCHAR(100) | NOT NULL |  | nombre_tipo | varchar (50) | NOT NULL |  | nombre_estado | varchar (50) | NOT NULL |  | texto_respuesta | VARCHAR(500) | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| correo_remitente | VARCHAR(100) | NOT NULL |  |  |  |  |  |  |  |  |  | fecha_respuesta | TIMESTAMP | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| mensaje | VARCHAR(500) | NOT NULL |  |  |  |  |  |  |  |  |  | mensaje_contacto_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| fecha_contacto | TIMESTAMP | NOT NULL |  |  |  |  |  |  |  |  |  | usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |
| tipo_contacto_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_contacto_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: AUDITORIA
| Tablas a usar y tipos de datos |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BITACORA_SISTEMA |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| bitacora_sistema_ID | integer (PK, identity) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| accion_realizada | VARCHAR(150) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| fecha_accion | TIMESTAMP | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| usuario_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| aplicacion_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet: ANEXO FUERA DE ALCANCE
| Tablas a usar y tipos de datos |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BODEGA |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| BODEGA |  |  |  | STOCK |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  | Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
| bodega_ID | integer (PK) | NOT NULL |  | stock_ID | integer (PK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |
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
| ESTADO_SIM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Nombre Variable | Tipo de dato | NULL/NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| estado_sim_ID | integer (PK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| sims_registradas_ID | integer (FK) | NOT NULL |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
## Sheet:  MEJORAAPARTADO PRODUCTO
| Tablas a usar y tipos de datos |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |