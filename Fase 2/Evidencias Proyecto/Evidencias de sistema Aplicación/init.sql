-- ==========================================
-- MÓDULO: USUARIO Y SEGURIDAD
-- ==========================================
CREATE TABLE ROL (
  rol_ID INT PRIMARY KEY NOT NULL,
  nombre_rol VARCHAR(30) NOT NULL
);

CREATE TABLE ESTADO_USUARIO (
  estado_ID INT PRIMARY KEY NOT NULL,
  desc_estado VARCHAR(30) NOT NULL
);

CREATE TABLE PIN (
  PIN_ID INT PRIMARY KEY NOT NULL,
  PIN VARCHAR(4) NOT NULL CHECK (PIN ~ '^\d{4}$')
);

CREATE TABLE USUARIO_SUSCRIPCION (
  suscripcion_ID INT PRIMARY KEY NOT NULL,
  estado_suscripcion BOOLEAN NOT NULL
);

CREATE TABLE USUARIO_MENSAJE_PERSONALIZADO (
  msj_personalizado_ID INT PRIMARY KEY NOT NULL,
  mensaje VARCHAR(200) NOT NULL
);

CREATE TABLE PRIORIDAD (
  prioridad_ID INT PRIMARY KEY NOT NULL,
  tipo_prioridad VARCHAR(30) NOT NULL
);

CREATE TABLE USUARIO (
  usuario_ID INT PRIMARY KEY NOT NULL,
  nombre_usuario VARCHAR(50) NOT NULL,
  correo_usuario VARCHAR(100) NOT NULL,
  contra_usuario VARCHAR(50) NOT NULL,
  rol_ID INT NOT NULL,
  PIN_ID INT NOT NULL,
  suscripcion_ID INT NOT NULL,
  msj_personalizado_ID INT NOT NULL,
  prioridad_ID INT NOT NULL,
  usuario_principal_ID INT,
  estado_ID INT NOT NULL
);

CREATE TABLE CONTACTO_EMERGENCIA (
  contacto_emergencia_ID INT PRIMARY KEY NOT NULL,
  usuario_ID INT NOT NULL,
  num_emergencia VARCHAR(9) NOT NULL
);

-- ==========================================
-- MÓDULO: APLICACIÓN Y ACCESOS
-- ==========================================
CREATE TABLE APLICACION (
  aplicacion_ID INT PRIMARY KEY NOT NULL,
  origen_aplicacion VARCHAR(50) NOT NULL
);

CREATE TABLE ACCESO_APLICACION (
  acceso_ID INT PRIMARY KEY NOT NULL,
  fecha_hora_acceso TIMESTAMP NOT NULL,
  usuario_ID INT NOT NULL,
  aplicacion_ID INT NOT NULL
);

CREATE TABLE NOTIFICACION_MOVIL (
  notificacion_ID INT PRIMARY KEY NOT NULL,
  titulo_mensaje VARCHAR(100) NOT NULL,
  cuerpo_mensaje VARCHAR(255) NOT NULL,
  fecha_envio TIMESTAMP NOT NULL,
  usuario_ID INT NOT NULL
);

-- ==========================================
-- MÓDULO: VENTAS Y PLANES
-- ==========================================
CREATE TABLE METODO_PAGO (
  metodo_pago_ID INT PRIMARY KEY NOT NULL,
  nombre_metodo VARCHAR(50) NOT NULL
);

CREATE TABLE ESTADO_PAGO (
  estado_pago_ID INT PRIMARY KEY NOT NULL,
  descripcion_estado VARCHAR(100) NOT NULL
);

CREATE TABLE VENTA (
  venta_ID INT PRIMARY KEY NOT NULL,
  id_usuario INT NOT NULL,
  metodo_pago_ID INT NOT NULL,
  estado_pago_ID INT NOT NULL,
  total_venta INT NOT NULL,
  fecha_venta TIMESTAMP NOT NULL
);

CREATE TABLE PLAN (
  plan_ID INT PRIMARY KEY NOT NULL,
  nombre_plan VARCHAR(50) NOT NULL,
  precio_actual INT NOT NULL,
  limite_compra_max INT NOT NULL,
  total_venta INT NOT NULL,
  fecha_venta TIMESTAMP NOT NULL
);

CREATE TABLE DETALLE_VENTA (
  detalle_venta_ID INT PRIMARY KEY NOT NULL,
  venta_ID INT NOT NULL,
  suscripcion_ID INT NOT NULL,
  max_apadrinados INT NOT NULL,
  precio_uni INT NOT NULL
);

CREATE TABLE PLAN_USUARIO (
  plan_usuario_ID INT PRIMARY KEY NOT NULL,
  tiene_acceso_completo BOOLEAN NOT NULL,
  cupos_apadrinados_adq INT NOT NULL,
  cupos_apadrinados_utili INT NOT NULL,
  usuario_ID INT NOT NULL
);

-- ==========================================
-- MÓDULO: ALERTAS
-- ==========================================
CREATE TABLE UBICACION_ALERTA (
  ubicacion_alerta_ID INT PRIMARY KEY NOT NULL,
  ubicacion VARCHAR(150) NOT NULL
);

CREATE TABLE DETALLE_ALERTA (
  detalle_alerta_ID INT PRIMARY KEY NOT NULL,
  msj_personalizado_ID INT NOT NULL
);

CREATE TABLE ALERTA (
  alerta_ID INT PRIMARY KEY NOT NULL,
  ubicacion_alerta_ID INT NOT NULL,
  detalle_alerta_ID INT NOT NULL,
  usuario_ID INT NOT NULL
);

CREATE TABLE HISTORIAL_ALERTA (
  historial_alerta_ID INT PRIMARY KEY NOT NULL,
  alerta_ID INT NOT NULL,
  usuario_ID INT NOT NULL,
  detalle_alerta_ID INT NOT NULL
);

-- ==========================================
-- MÓDULO: SOPORTE
-- ==========================================
CREATE TABLE SOPORTE (
  soporte_ID INT PRIMARY KEY NOT NULL,
  desc_caso VARCHAR(500) NOT NULL,
  estado_caso VARCHAR(50) NOT NULL,
  solucion_caso VARCHAR(500) NOT NULL,
  usuario_ID INT NOT NULL,
  categoria_soporte_ID INT NOT NULL
);

CREATE TABLE TICKET_SOPORTE (
  ticket_soporte_ID INT PRIMARY KEY NOT NULL,
  desc_ticket VARCHAR(500) NOT NULL,
  usuario_ID INT NOT NULL
);

CREATE TABLE CATEGORIA_SOPORTE (
  categoria_soporte_ID INT PRIMARY KEY NOT NULL,
  nombre_categoria VARCHAR(50) NOT NULL
);

CREATE TABLE ESTADO_TICKET (
  estado_ticket_ID INT PRIMARY KEY NOT NULL,
  estado_ticket VARCHAR(50) NOT NULL
);

-- ==========================================
-- MÓDULO: CONTACTO
-- ==========================================
CREATE TABLE TIPO_CONTACTO (
  tipo_contacto_ID INT PRIMARY KEY NOT NULL,
  nombre_tipo VARCHAR(50) NOT NULL
);

CREATE TABLE ESTADO_CONTACTO (
  estado_contacto_ID INT PRIMARY KEY NOT NULL,
  nombre_estado VARCHAR(50) NOT NULL
);

CREATE TABLE MENSAJE_CONTACTO (
  mensaje_contacto_ID INT PRIMARY KEY NOT NULL,
  nombre_remitente VARCHAR(100) NOT NULL,
  correo_remitente VARCHAR(100) NOT NULL,
  mensaje VARCHAR(500) NOT NULL,
  fecha_contacto TIMESTAMP NOT NULL,
  tipo_contacto_ID INT NOT NULL,
  estado_contacto_ID INT NOT NULL
);

CREATE TABLE RESPUESTA_CONTACTO (
  respuesta_contacto_ID INT PRIMARY KEY NOT NULL,
  texto_respuesta VARCHAR(500) NOT NULL,
  fecha_respuesta TIMESTAMP NOT NULL,
  mensaje_contacto_ID INT NOT NULL,
  usuario_ID INT NOT NULL
);

-- ==========================================
-- MÓDULO: AUDITORÍA
-- ==========================================
CREATE TABLE BITACORA_SISTEMA (
  bitacora_sistema_ID INT PRIMARY KEY NOT NULL,
  accion_realizada VARCHAR(150) NOT NULL,
  fecha_accion TIMESTAMP NOT NULL,
  usuario_ID INT NOT NULL,
  aplicacion_ID INT NOT NULL
);

-- ==========================================
-- RELACIONES (LLAVES FORÁNEAS)
-- ==========================================
ALTER TABLE USUARIO ADD CONSTRAINT fk_rol FOREIGN KEY (rol_ID) REFERENCES ROL(rol_ID);
ALTER TABLE USUARIO ADD CONSTRAINT fk_pin FOREIGN KEY (PIN_ID) REFERENCES PIN(PIN_ID);
ALTER TABLE USUARIO ADD CONSTRAINT fk_suscripcion FOREIGN KEY (suscripcion_ID) REFERENCES USUARIO_SUSCRIPCION(suscripcion_ID);
ALTER TABLE USUARIO ADD CONSTRAINT fk_msj_per FOREIGN KEY (msj_personalizado_ID) REFERENCES USUARIO_MENSAJE_PERSONALIZADO(msj_personalizado_ID);
ALTER TABLE USUARIO ADD CONSTRAINT fk_prioridad FOREIGN KEY (prioridad_ID) REFERENCES PRIORIDAD(prioridad_ID);
ALTER TABLE USUARIO ADD CONSTRAINT fk_usr_principal FOREIGN KEY (usuario_principal_ID) REFERENCES USUARIO(usuario_ID);
ALTER TABLE USUARIO ADD CONSTRAINT fk_estado FOREIGN KEY (estado_ID) REFERENCES ESTADO_USUARIO(estado_ID);
ALTER TABLE CONTACTO_EMERGENCIA ADD CONSTRAINT fk_ce_usr FOREIGN KEY (usuario_ID) REFERENCES USUARIO(usuario_ID);

ALTER TABLE ACCESO_APLICACION ADD CONSTRAINT fk_acc_usr FOREIGN KEY (usuario_ID) REFERENCES USUARIO(usuario_ID);
ALTER TABLE ACCESO_APLICACION ADD CONSTRAINT fk_acc_app FOREIGN KEY (aplicacion_ID) REFERENCES APLICACION(aplicacion_ID);
ALTER TABLE NOTIFICACION_MOVIL ADD CONSTRAINT fk_not_usr FOREIGN KEY (usuario_ID) REFERENCES USUARIO(usuario_ID);

ALTER TABLE VENTA ADD CONSTRAINT fk_ven_usr FOREIGN KEY (id_usuario) REFERENCES USUARIO(usuario_ID);
ALTER TABLE VENTA ADD CONSTRAINT fk_ven_met FOREIGN KEY (metodo_pago_ID) REFERENCES METODO_PAGO(metodo_pago_ID);
ALTER TABLE VENTA ADD CONSTRAINT fk_ven_est FOREIGN KEY (estado_pago_ID) REFERENCES ESTADO_PAGO(estado_pago_ID);
ALTER TABLE DETALLE_VENTA ADD CONSTRAINT fk_det_ven FOREIGN KEY (venta_ID) REFERENCES VENTA(venta_ID);
ALTER TABLE DETALLE_VENTA ADD CONSTRAINT fk_det_sus FOREIGN KEY (suscripcion_ID) REFERENCES PLAN(plan_ID);
ALTER TABLE PLAN_USUARIO ADD CONSTRAINT fk_plu_usr FOREIGN KEY (usuario_ID) REFERENCES USUARIO(usuario_ID);

ALTER TABLE ALERTA ADD CONSTRAINT fk_ale_ubi FOREIGN KEY (ubicacion_alerta_ID) REFERENCES UBICACION_ALERTA(ubicacion_alerta_ID);
ALTER TABLE ALERTA ADD CONSTRAINT fk_ale_det FOREIGN KEY (detalle_alerta_ID) REFERENCES DETALLE_ALERTA(detalle_alerta_ID);
ALTER TABLE ALERTA ADD CONSTRAINT fk_ale_usr FOREIGN KEY (usuario_ID) REFERENCES USUARIO(usuario_ID);
ALTER TABLE HISTORIAL_ALERTA ADD CONSTRAINT fk_hal_ale FOREIGN KEY (alerta_ID) REFERENCES ALERTA(alerta_ID);
ALTER TABLE HISTORIAL_ALERTA ADD CONSTRAINT fk_hal_usr FOREIGN KEY (usuario_ID) REFERENCES USUARIO(usuario_ID);
ALTER TABLE HISTORIAL_ALERTA ADD CONSTRAINT fk_hal_det FOREIGN KEY (detalle_alerta_ID) REFERENCES DETALLE_ALERTA(detalle_alerta_ID);
ALTER TABLE DETALLE_ALERTA ADD CONSTRAINT fk_dea_msj FOREIGN KEY (msj_personalizado_ID) REFERENCES USUARIO_MENSAJE_PERSONALIZADO(msj_personalizado_ID);

ALTER TABLE SOPORTE ADD CONSTRAINT fk_sop_usr FOREIGN KEY (usuario_ID) REFERENCES USUARIO(usuario_ID);
ALTER TABLE SOPORTE ADD CONSTRAINT fk_cat_sop FOREIGN KEY (categoria_soporte_ID) REFERENCES CATEGORIA_SOPORTE(categoria_soporte_ID);
ALTER TABLE TICKET_SOPORTE ADD CONSTRAINT fk_tic_usr FOREIGN KEY (usuario_ID) REFERENCES USUARIO(usuario_ID);

ALTER TABLE MENSAJE_CONTACTO ADD CONSTRAINT fk_msj_tip FOREIGN KEY (tipo_contacto_ID) REFERENCES TIPO_CONTACTO(tipo_contacto_ID);
ALTER TABLE MENSAJE_CONTACTO ADD CONSTRAINT fk_msj_est FOREIGN KEY (estado_contacto_ID) REFERENCES ESTADO_CONTACTO(estado_contacto_ID);
ALTER TABLE RESPUESTA_CONTACTO ADD CONSTRAINT fk_res_msj FOREIGN KEY (mensaje_contacto_ID) REFERENCES MENSAJE_CONTACTO(mensaje_contacto_ID);
ALTER TABLE RESPUESTA_CONTACTO ADD CONSTRAINT fk_res_usr FOREIGN KEY (usuario_ID) REFERENCES USUARIO(usuario_ID);

ALTER TABLE BITACORA_SISTEMA ADD CONSTRAINT fk_bit_usr FOREIGN KEY (usuario_ID) REFERENCES USUARIO(usuario_ID);
ALTER TABLE BITACORA_SISTEMA ADD CONSTRAINT fk_bit_app FOREIGN KEY (aplicacion_ID) REFERENCES APLICACION(aplicacion_ID);