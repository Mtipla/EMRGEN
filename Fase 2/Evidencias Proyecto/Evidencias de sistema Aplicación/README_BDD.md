**COMANDOS PARA POBLAR LAS TABLAS DE BDD (TODO ESTO CON FINES DE PRUEBA Y DESARROLLO, NO REFLEJA LOS DATOS FINALES DEL PROYECTO)**

**PARA EVITAR ERRORES, ES IDEAL QUE SE EJECUTE BLOQUE POR BLOQUE DE CODIGO**

INSERT INTO ESTADO_USUARIO (estado_ID, desc_estado) VALUES 
(1, 'ACCESO COMPLETO'),
(2, 'ACCESO PARCIAL'),
(3, 'BLOQUEADO/INACTIVO');

INSERT INTO ROL (rol_ID, nombre_rol) VALUES 
(1, 'ADMINISTRADOR'),
(2, 'SOPORTE'),
(3, 'USUARIO');

INSERT INTO PIN (PIN_ID, PIN) VALUES 
(1, '1234'),
(2, '5678');

INSERT INTO USUARIO_SUSCRIPCION (suscripcion_ID, estado_suscripcion) VALUES 
(1, true);

INSERT INTO USUARIO_MENSAJE_PERSONALIZADO (msj_personalizado_ID, mensaje) VALUES 
(1, 'Necesito ayuda inmediata en mi ubicación.');

INSERT INTO PRIORIDAD (prioridad_ID, tipo_prioridad) VALUES 
(1, 'EMERGENCIA'),
(2, 'MEDICO'),
(3, 'URBANO'),
(4, 'ADULTO MAYOR');

INSERT INTO USUARIO (usuario_ID, nombre_usuario, correo_usuario, contra_usuario, rol_ID, PIN_ID, suscripcion_ID, msj_personalizado_ID, prioridad_ID, usuario_principal_ID, estado_ID) 
VALUES 
(1, 'Admin', 'admin@emergen.cl', 'admin123', 1, 1, 1, 1, 1, NULL, 1);

INSERT INTO USUARIO (usuario_ID, nombre_usuario, correo_usuario, contra_usuario, rol_ID, PIN_ID, suscripcion_ID, msj_personalizado_ID, prioridad_ID, usuario_principal_ID, estado_ID) 
VALUES 
(2, 'Juan Pérez', 'juan@correo.com', 'juan123', 3, 1, 1, 1, 1, NULL, 1);

INSERT INTO USUARIO (usuario_ID, nombre_usuario, correo_usuario, contra_usuario, rol_ID, PIN_ID, suscripcion_ID, msj_personalizado_ID, prioridad_ID, usuario_principal_ID, estado_ID) 
VALUES 
(3, 'Hijo de Juan', 'juan@correo.com', 'hijo123', 3, 2, 1, 1, 2, 2, 1);

INSERT INTO CONTACTO_EMERGENCIA (contacto_emergencia_ID, usuario_ID, num_emergencia) VALUES 
(1, 1, '998940264'), 
(2, 2, '912345678');