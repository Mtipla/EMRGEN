**COMANDOS PARA POBLAR LAS TABLAS DE BDD (TODO ESTO CON FINES DE PRUEBA Y DESARROLLO, NO REFLEJA LOS DATOS FINALES DEL PROYECTO)**

**PARA EVITAR ERRORES, ES IDEAL QUE SE EJECUTE BLOQUE POR BLOQUE DE CODIGO**

Los catálogos ROL, ESTADO_USUARIO y APLICACION ya los crea `init.sql`: no se vuelven a insertar aquí.

`contra_usuario` guarda el hash bcrypt de la contraseña (el login lo compara con bcrypt). Contraseñas de estas cuentas de prueba, **solo para desarrollo local**:

| Cuenta | Correo | Contraseña |
|---|---|---|
| Admin (rol 1) | admin@emergen.cl | Admin12345 |
| Juan Pérez (rol 3) | juan@correo.com | Juan12345 |
| Hijo de Juan (apadrinado) | juan@correo.com | Hijo12345 |

Para generar el hash de otra contraseña (desde `apps/backend`):

```powershell
node -e "console.log(require('bcrypt').hashSync(process.argv[1], 12))" "MiContraseña123"
```

`usuario_ID` es autoincremental: no se indica en los INSERT, y el apadrinado busca el ID de su cuenta principal por correo.

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

INSERT INTO USUARIO (nombre_usuario, correo_usuario, contra_usuario, rol_ID, PIN_ID, suscripcion_ID, msj_personalizado_ID, prioridad_ID, usuario_principal_ID, estado_ID) 
VALUES 
('Admin', 'admin@emergen.cl', '$2b$12$AYQY95TScm0Cs7JTL34GwuumvbKntrX0ue/ac2jnYa6UFprHaSeja', 1, 1, 1, 1, 1, NULL, 1);

INSERT INTO USUARIO (nombre_usuario, correo_usuario, contra_usuario, rol_ID, PIN_ID, suscripcion_ID, msj_personalizado_ID, prioridad_ID, usuario_principal_ID, estado_ID) 
VALUES 
('Juan Pérez', 'juan@correo.com', '$2b$12$/kIMj1RrG0GUsQ2Gy6Qq.OoW1louPoqgS.WsNdM7.nwC2yr4oFMOu', 3, 1, 1, 1, 1, NULL, 1);

INSERT INTO USUARIO (nombre_usuario, correo_usuario, contra_usuario, rol_ID, PIN_ID, suscripcion_ID, msj_personalizado_ID, prioridad_ID, usuario_principal_ID, estado_ID) 
VALUES 
('Hijo de Juan', 'juan@correo.com', '$2b$12$mOCP8BHN2nA/bY3gxMSINOxGukXC/aEe0EAlbuo8zMgqUXKnQMwHW', 3, 2, 1, 1, 2,
 (SELECT usuario_ID FROM USUARIO WHERE correo_usuario = 'juan@correo.com' AND usuario_principal_ID IS NULL), 1);

INSERT INTO CONTACTO_EMERGENCIA (contacto_emergencia_ID, usuario_ID, num_emergencia) VALUES 
(1, (SELECT usuario_ID FROM USUARIO WHERE correo_usuario = 'admin@emergen.cl'), '998940264'), 
(2, (SELECT usuario_ID FROM USUARIO WHERE correo_usuario = 'juan@correo.com' AND usuario_principal_ID IS NULL), '912345678');
