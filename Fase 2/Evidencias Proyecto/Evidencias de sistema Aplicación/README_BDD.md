# Base de datos de desarrollo — contrato integrado

El modelo vigente es `init.sql`, basado en el SQL propuesto y el Excel actualizado, con las decisiones consolidadas del 21-10-2026. El informe y las pruebas están en [docs/INTEGRACION_BDD_2026-10-21.md](docs/INTEGRACION_BDD_2026-10-21.md); el avance de la reanudación, en [ESTADO_INTEGRACION_BDD.md](ESTADO_INTEGRACION_BDD.md).

## Arranque y conservación de datos

Desde esta carpeta se mantiene:

```powershell
docker compose up --build -d
```

PostgreSQL se publica en localhost:5433 y Nest en localhost:3001. Se conserva PostgreSQL 15-alpine (versión verificada 15.19), Node 24.21.0, npm 11.19.0 y TypeORM con `synchronize: false`. FastAPI sigue separado en localhost:8000.

El entrypoint ejecuta `init.sql` solamente al crear un volumen vacío. Cambiar este archivo no actualiza un volumen existente. El script rechaza una base que ya tenga tablas del modelo. No ejecutar los scripts históricos de `migraciones/`, `apps/backend/migrations/` o el catálogo Python sobre esta instalación.

La recreación de desarrollo fue autorizada y ejecutada una vez. La reanudación conservó los volúmenes; no requiere volver a ejecutar `down -v`. Para cualquier base anterior cuyos datos deban conservarse se necesita una migración explícita y un respaldo verificado; este init no es esa migración.

## Fixtures explícitos de desarrollo

Una instalación nueva tiene catálogos y el producto adicional 1 (1000 CLP, máximo 5), pero no usuarios. Después de instalar las dependencias exactas con `npm ci --engine-strict=false`, el procedimiento de desarrollo es:

```powershell
node scripts/seed-dev.cjs
```

El script usa bcrypt 12 para contraseña y PIN, IDs del motor y una transacción. Inserta cuentas faltantes y conserva las existentes; no restablece contraseñas, compras ni cupos de cuentas ya existentes. Para regenerar hashes de fixtures, usarlo en una instalación de desarrollo vacía expresamente autorizada; no borrar volúmenes con datos que se deban preservar.

| Correo ficticio | Rol / acceso | Plan y PIN de desarrollo |
|---|---|---|
| admin@emergen.test | Administrador completo | PIN 0007; sin plan de consumo |
| soporte@emergen.test | Soporte completo | PIN 0007; sin plan de consumo |
| principal@emergen.test | Usuario completo | Plan base 2, capacidad 3; PIN 0007 |
| sinplan@emergen.test | Usuario completo | Sin plan; PIN 0007; SOS rechazado por falta de plan |
| completo@emergen.test | Apadrinado completo del principal | PIN propio 1234; usa plan del principal |
| parcial@emergen.test | Apadrinado parcial del principal | Sin PIN propio; cierre con PIN del principal 0007 |

**Contraseña común exclusivamente de estas cuentas locales: `EmergenDev123!`.** Son valores de prueba, no secretos externos de configuración. Los contactos se rotulan ficticios y tienen formato internacional +56; las pruebas no envían mensajes. El plan base 2 “PLAN BASE DEMOSTRACION”, valor 0, existe solo como fixture administrativo: no representa una tarifa comercial ni se vende por PayPal.

Login real:

```powershell
$sesion = Invoke-RestMethod -Method Post -Uri http://localhost:3001/usuarios/login -ContentType application/json -Body '{"correo_usuario":"principal@emergen.test","password":"EmergenDev123!"}'
$auth = @{ Authorization = "Bearer " + $sesion.access_token }
Invoke-RestMethod -Uri http://localhost:3001/usuarios/me -Headers $auth
```

El registro público conserva la verificación de correo Firebase. Los apadrinados tienen correo y contraseña propios y pueden iniciar sesión; no existe login global solo por PIN ni cambio de perfil. Una cuenta principal recién registrada queda parcial hasta configurar su PIN mediante `POST /usuarios/me/pin` con `{"PIN":"0007"}`. No se admiten números que pierdan ceros iniciales. La creación interna de apadrinados completos exige PIN propio y lo hashea; no se añadió una nueva UI de alta de apadrinados.

## Reglas operativas

- Estados de usuario: 1 completo, 2 parcial. No existe bloqueo por estado 3. Rol, propiedad y acceso siguen verificándose en servidor; las acciones de personal requieren acceso completo.
- `PLAN_USUARIO` guarda `plan_id` y capacidad adquirida 0–5 solo para el principal. Ocupación y disponibilidad se derivan de los hijos. El administrador usa `PUT /admin/usuarios/:id/plan` con `plan_ID` y `cupos_apadrinados_adq`. Eliminar hijos libera ocupación, no reduce capacidad comprada.
- Venta y detalles se confirman juntos; el total diferido debe coincidir con la suma. El producto adicional 1 determina el precio, pero la línea CUPOS referencia el plan base real del comprador.
- Las reservas de compra se persisten antes de llamar a PayPal. No hay llamadas externas dentro de transacciones reintentables. Una captura confirmada concede cupos una sola vez; un resultado incierto conserva la reserva y su referencia externa.
- La web recupera compras pendientes desde `GET /compras/apadrinados/ventas/pendientes`; `POST /compras/apadrinados/ventas/:id/conciliar` consulta/reconcilia su resultado. Tras cinco horas una creación sin ID externo requiere revisión manual con PayPal; no se recrea ni libera automáticamente. La ventana es una política conservadora de esta integración, no una garantía universal del proveedor.
- SOS exige plan efectivo y contacto propio, no PIN para emitirlo. El cierre manual usa PIN propio o del principal vinculado si el emisor es apadrinado parcial. Cinco fallos bloquean la verificación de ese PIN durante 15 minutos; falta de PIN devuelve 409. El job de FastAPI recupera al arrancar y cada 30 segundos las alertas con 24 horas transcurridas, incluso sin PIN; cierra a FINALIZADA con hora real. EXPIRADA queda reservado.
- SQL conserva integridad, históricos y limpieza; no autentica, aprueba pagos, cifra fichas ni envía mensajes. ENVIO_ALERTA, ENLACE_MEDICO y ANTECEDENTE_MEDICO se prueban solo a nivel SQL; transporte y servicios médicos siguen diferidos.
- Bitácora conserva once columnas, instante con zona y actor/afectado anulables al borrar. El evento se registra antes del borrado, en la misma transacción; las FK mantienen rol histórico. SET NULL no anonimiza textos libres.

## Validación reproducible

Ejecutar las suites de base **secuencialmente**, en el único entorno de desarrollo con fixtures ya existentes. Las pruebas usan cuentas temporales, hacen COMMIT en carreras reales y limpian sus cuentas; algunas evidencias históricas/auditorías de prueba permanecen por diseño. La prueba de último administrador cambia transitoriamente roles de fixtures y los restaura en finally: no ejecutarla mientras se usa el panel.

```powershell
node scripts/verify-schema.cjs
node scripts/test-sql.cjs
npm test --workspace=backend -- --runInBand
$env:DB_E2E = '1'
npm run test:e2e --workspace=backend -- --runInBand
npm test --workspace=@repo/api-client
Set-Location -LiteralPath services/internal-api
.\.venv\Scripts\python.exe -m pytest -q
```

`pruebas_init.sql` también admite psql del contenedor con `-X -v ON_ERROR_STOP=1`. Fuerza `SET CONSTRAINTS ALL IMMEDIATE` antes de ROLLBACK. Las pruebas Python no omiten una BD inaccesible. Las siete pruebas de proveedores reales requieren `LIVE_APIS=1` y no se acreditan por los dobles; no son necesarias para arrancar este entorno.

Para verificar recuperación al arranque: con FastAPI detenido, `node scripts/smoke-internal.cjs prepare`, iniciar FastAPI según su README y ejecutar `node scripts/smoke-internal.cjs finish`. Crea y limpia un usuario temporal; verifica por HTTP el mismo JWT, hash bcrypt, cierre y soporte. No ejecutar prepare indiscriminadamente con datos pendientes de otro ensayo.
