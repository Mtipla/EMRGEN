# Cuentas temporales de prueba (solo entorno local)

> **Temporal y local.** Estas cuentas existen únicamente en la base de datos de desarrollo de
> Docker (`postgres_emergen_db`) de la máquina donde se crearon. Los datos son ficticios (dominio
> reservado `.test`) y las contraseñas son exclusivas para pruebas locales: **no las reutilices
> en ningún otro entorno**. Nada las crea de forma automática: no están en `init.sql`, ni en
> `docker-compose.yml`, ni en ningún script de arranque, así que no pueden aparecer en producción.
> Cuando ya no se necesiten, elimínalas (sección 4) y borra este archivo.

## 1. Cuentas

Creadas y verificadas el 13-10-2026 (rol y hash bcrypt comprobados con una consulta directa a la
base de datos; inicio de sesión comprobado contra el backend local y el de Docker).

| Nombre de la cuenta | Correo de acceso | Contraseña temporal | Rol (en la BD) | Finalidad | Estado |
|---|---|---|---|---|---|
| Admin Pruebas | `admin.pruebas@emergen.test` | `AdminPruebas2026` | `ADMINISTRADOR` (rol 1) | Entrar al panel de escritorio y ejecutar la gestión de usuarios, planes, cupos y la bitácora. | Creada y verificada |
| Usuario Uno Editado | `usuario1.pruebas@emergen.test` | `UsuarioUno2026` | `USUARIO` (rol 3) | Usuario objetivo: datos, plan y cupos modificados por el administrador. | Creada y verificada |
| Usuario Dos Pruebas | `usuario2.pruebas@emergen.test` | `UsuarioDos2026` | `USUARIO` (rol 3) | Segundo usuario objetivo (plan y cupos asignados desde el backend de Docker). | Creada y verificada |
| Soporte Pruebas | `soporte.pruebas@emergen.test` | `SoportePruebas2026` | `SOPORTE` (rol 2) | Consultar cuentas y compras en solo lectura, y responder tickets de usuarios. Las escrituras de cuentas y los reportes administrativos devuelven 403. | Creada y verificada |

Los `usuario_ID` son autoincrementales y cambian si se vuelven a crear; al momento de la
verificación eran 16 (admin), 17, 18 y 19 (soporte). Consulta los actuales con «Listar usuarios»
en el panel.

Estado en que quedaron tras la validación:

- La cuenta de `usuario1` se llamaba «Usuario Uno Pruebas»; se renombró a «Usuario Uno Editado»
  desde el panel y tiene un plan con acceso completo y 3 cupos.
- `usuario2` tiene un plan con acceso completo y 2 cupos.
- La bitácora (`BITACORA_SISTEMA`) conserva las acciones de esas pruebas a nombre de «Admin Pruebas».

## 2. Cómo usarlas

1. Levanta la base de datos, jsReport y un backend (ver `README.md`, secciones 6 y 7).
2. Abre el panel: `npx turbo run dev --filter=desktop` (backend local, puerto 3000) o
   `npx turbo run dev:docker --filter=desktop` (backend de Docker, puerto 3001).
3. Inicia sesión con **Admin Pruebas**.
4. En «Gestión de usuarios»: «Listar usuarios», escribe el ID de un usuario de prueba y usa
   «Ver expediente», «Guardar datos», «Guardar plan y cupos» o «Cambiar estado».
5. En «Bitácora / auditoría»: filtra por «ID usuario afectado», «Listar bitácora» y
   «Descargar PDF/Excel».

## 3. Cómo volver a crearlas

Solo si la base de datos se recreó (`docker compose down -v`). Usa los mismos mecanismos del
proyecto: el registro público (hashea la contraseña con bcrypt), una actualización del rol para
el administrador (no existe un endpoint que cree administradores) y el endpoint del
administrador para la cuenta de SOPORTE. Con el backend local arriba, en PowerShell desde la raíz
del monorepo:

```powershell
$api = 'http://localhost:3000'
function Registrar($nombre, $correo, $clave) {
  Invoke-RestMethod -Method Post -Uri "$api/usuarios/registro" -ContentType 'application/json; charset=utf-8' -Body (@{ nombre_usuario = $nombre; correo_usuario = $correo; password = $clave } | ConvertTo-Json)
}
Registrar 'Admin Pruebas' 'admin.pruebas@emergen.test' 'AdminPruebas2026'
Registrar 'Usuario Uno Pruebas' 'usuario1.pruebas@emergen.test' 'UsuarioUno2026'
Registrar 'Usuario Dos Pruebas' 'usuario2.pruebas@emergen.test' 'UsuarioDos2026'

# El registro crea cuentas con rol USUARIO: el administrador se promueve en la BD.
"UPDATE usuario SET rol_id = 1 WHERE correo_usuario = 'admin.pruebas@emergen.test' AND usuario_principal_id IS NULL;" | docker exec -i postgres_emergen_db sh -c 'psql -v ON_ERROR_STOP=1 -U $POSTGRES_USER -d $POSTGRES_DB'

# La cuenta de SOPORTE la crea el administrador (queda registrada en la bitácora).
$token = (Invoke-RestMethod -Method Post -Uri "$api/usuarios/login" -ContentType 'application/json' -Body (@{ correo_usuario = 'admin.pruebas@emergen.test'; password = 'AdminPruebas2026' } | ConvertTo-Json)).access_token
Invoke-RestMethod -Method Post -Uri "$api/admin/usuarios/soporte" -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json; charset=utf-8' -Body (@{ nombre_usuario = 'Soporte Pruebas'; correo_usuario = 'soporte.pruebas@emergen.test'; password = 'SoportePruebas2026' } | ConvertTo-Json)
```

Verificación (debe mostrar las cuatro cuentas con su rol):

```powershell
"SELECT u.usuario_id, u.correo_usuario, r.nombre_rol FROM usuario u JOIN rol r ON r.rol_id = u.rol_id WHERE u.correo_usuario LIKE '%.pruebas@emergen.test' ORDER BY 1;" | docker exec -i postgres_emergen_db sh -c 'psql -U $POSTGRES_USER -d $POSTGRES_DB'
```

## 4. Cómo eliminarlas

Borra primero lo que las referencia (planes y bitácora) y luego las cuentas. Afecta solo a los
correos `*.pruebas@emergen.test`:

```powershell
@"
BEGIN;
DELETE FROM plan_usuario WHERE usuario_id IN (SELECT usuario_id FROM usuario WHERE correo_usuario LIKE '%.pruebas@emergen.test');
DELETE FROM bitacora_sistema WHERE usuario_id IN (SELECT usuario_id FROM usuario WHERE correo_usuario LIKE '%.pruebas@emergen.test');
DELETE FROM usuario WHERE correo_usuario LIKE '%.pruebas@emergen.test';
COMMIT;
"@ | docker exec -i postgres_emergen_db sh -c 'psql -v ON_ERROR_STOP=1 -U $POSTGRES_USER -d $POSTGRES_DB'
```
