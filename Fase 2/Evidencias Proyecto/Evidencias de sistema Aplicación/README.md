# EMERGEN: plataforma de alertas de emergencia

EMERGEN reúne una web, una aplicación móvil y un panel de escritorio para gestionar cuentas, planes, contactos de emergencia y alertas SOS. Este README explica cómo preparar el entorno de desarrollo, ejecutar las aplicaciones y trabajar con los servicios que utiliza el proyecto.

El equipo está integrado por **Alonso González, Gabriel Valencia y Diego Plaza**.

Las aplicaciones comparten código en un monorepo administrado con **npm workspaces y Turborepo**. El backend principal está desarrollado en NestJS; un servicio separado en FastAPI se encarga del registro y cierre de SOS y de los tickets de soporte. Ambos utilizan la misma base de datos PostgreSQL.

## Antes de comenzar: ubicación de los comandos

La carpeta de la aplicación está dentro del repositorio Git. Salvo que un bloque indique otra ubicación, ejecuta los comandos desde:

```text
EMRGEN/Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/
```

Aquí se encuentran `package.json`, `package-lock.json`, `turbo.json` y `docker-compose.yml`. Instalar dependencias desde otra carpeta puede crear archivos fuera del monorepo y dificultar la resolución de paquetes.

Los ejemplos de terminal están escritos para **PowerShell en Windows**.

## 1. Herramientas y requisitos

Estas son las versiones declaradas en los archivos de configuración del proyecto. Para preparar un equipo nuevo, usa Node.js y npm con las versiones de referencia indicadas.

| Herramienta    | Versión o requisito                                                       | Cómo comprobarlo         |
| -------------- | ------------------------------------------------------------------------- | ------------------------ |
| Node.js        | `24.21.0`, fijada en `.nvmrc` y en el Dockerfile                          | `node --version`         |
| npm            | `11.19.0` como referencia; `package.json` admite `^11.19.0`               | `npm --version`          |
| Python         | `3.12+` para FastAPI; el servicio documenta la verificación con `3.12.10` | `python --version`       |
| Docker Desktop | En ejecución, con soporte para Docker Compose v2                          | `docker compose version` |
| Git            | Instalado para clonar y actualizar el repositorio                         | `git --version`          |
| Editor         | VS Code con ESLint y Prettier es la opción usada por el equipo            | —                        |

La base tecnológica de las aplicaciones es la siguiente:

| Componente              | Tecnologías y versiones declaradas                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| Lenguaje principal      | TypeScript `6.0.3`                                                                            |
| Backend principal       | NestJS `12.0.4`, TypeORM `1.1.1`, `pg` `8.23.0` y bcrypt `6.0.0`                              |
| Interfaces              | React y React DOM `19.2.8`, Ionic React `9.0.4` y Vite `8.3.0`                                |
| Aplicación móvil        | Capacitor `8.5.2` como base para la integración nativa                                        |
| Escritorio              | Electron `44.4.3`; `electron-builder` `26.15.3` está declarado como dependencia de desarrollo |
| Monorepo                | Turborepo `2.11.2`                                                                            |
| API de SOS y soporte    | Python, FastAPI `0.156.2`, Uvicorn `0.54.0` y psycopg `3.3.6`                                 |
| Base de datos           | Imagen `postgres:15-alpine`                                                                   |
| Integración de WhatsApp | `@whiskeysockets/baileys` `7.0.0-rc14`                                                        |

Las dependencias de Node se detallan en los `package.json` y en el único `package-lock.json` del monorepo. Las de Python están fijadas en [requirements.txt](services/internal-api/requirements.txt).

Las herramientas de Node se ejecutan con los scripts del proyecto o con `npx`; no es necesario instalar Turbo, Nest CLI o Ionic CLI de forma global para seguir esta guía.

## 2. Cómo está organizado el proyecto

```text
Evidencias de sistema Aplicación/
├── apps/
│   ├── backend/          API NestJS: usuarios, permisos, planes, compras y administración
│   ├── web/              Sitio público y área de cuenta
│   ├── mobile/           Aplicación móvil con Ionic React y Capacitor
│   └── desktop/          Panel administrativo con React y Electron
├── packages/
│   ├── api-client/       Cliente HTTP e integración de SDK de navegador
│   ├── api-types/        Tipos compartidos de solicitudes y respuestas
│   ├── ui/               Componentes React compartidos
│   ├── eslint-config/    Configuración compartida de ESLint
│   └── typescript-config/ Configuración compartida de TypeScript
├── services/
│   └── internal-api/     FastAPI: alertas SOS y tickets de soporte
├── scripts/              Carga de datos de desarrollo y comprobaciones de base de datos
├── docs/                 Guías de pruebas e informes de integración
├── Dockerfile            Construcción de la imagen del backend NestJS
├── docker-compose.yml    PostgreSQL y backend NestJS
├── init.sql              Esquema y catálogos para una base de datos nueva
├── example.env           Referencia para preparar la configuración local
├── .env.docker           URL pública de NestJS para el modo docker de Vite
└── README_BDD.md          Preparación y validación de la base de datos
```

La web, el móvil y el escritorio tienen puntos de entrada independientes. Comparten los paquetes de `packages/`; el panel administrativo se ejecuta en `apps/desktop`.

## 3. Dependencias y versiones compartidas

El proyecto guarda las dependencias externas de Node con versiones exactas. La opción `save-exact=true` de `.npmrc` mantiene esa política al instalar paquetes nuevos. Las referencias `*` de los paquetes internos, como `@repo/ui`, corresponden a workspaces del propio monorepo.

Usa `npm ci` para reproducir la instalación del lockfile. Cuando agregues o cambies una dependencia, usa `npm install` indicando el workspace y conserva los cambios tanto del manifiesto como de `package-lock.json`.

```powershell
# Ejemplos con versiones ya utilizadas en el monorepo.
npm install axios@1.20.0 --workspace=web
npm install -D vitest@4.1.11 --workspace=mobile
```

Antes de elegir una versión, revisa si otra aplicación ya utiliza ese paquete. React, React DOM y sus tipos también se unifican mediante `overrides` en el `package.json` raíz. Mantén un solo lockfile en esta carpeta; los workspaces no necesitan lockfiles propios.

## 4. Preparar el entorno por primera vez

### 4.1 Clonar el repositorio

```powershell
git clone https://github.com/Mtipla/EMRGEN.git
Set-Location -LiteralPath ".\EMRGEN\Fase 2\Evidencias Proyecto\Evidencias de sistema Aplicación"
```

Si ya tienes el repositorio, ubícate en esa carpeta sin volver a clonarlo. Comprueba las herramientas antes de instalar:

```powershell
node --version
npm --version
python --version
docker compose version
```

### 4.2 Crear o completar `.env`

La configuración principal se guarda en un archivo `.env` en la raíz del monorepo. Puedes tomar [example.env](example.env) como referencia. Si todavía no tienes un archivo local, este bloque lo crea sin sobrescribir uno existente:

```powershell
if (-not (Test-Path -LiteralPath .env)) {
    Copy-Item -LiteralPath example.env -Destination .env
}
```

Revisa los valores copiados y reemplaza las credenciales por las de tu entorno. Para conectarte desde Windows al PostgreSQL de Docker, usa esta configuración de conexión y de puertos; completa el usuario, la contraseña y el secreto JWT:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=<INSERT_YOUR_DB_USER_HERE>
DB_PASSWORD=<INSERT_YOUR_DB_PASSWORD_HERE>
DB_NAME=EMERGEN_BDD
PORT=3000
JWT_SECRET=<INSERT_YOUR_JWT_SECRET_HERE>
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,https://localhost
VITE_API_URL=http://localhost:3000
VITE_INTERNAL_API_URL=http://localhost:8000
WHATSAPP_ENABLED=false
WHATSAPP_DEFAULT_COUNTRY_CODE=56
```

Docker Compose establece `DB_HOST=db` y `DB_PORT=5432` dentro del contenedor del backend. Por eso los valores locales anteriores también permiten utilizar el backend en Docker.

Genera tu propio `JWT_SECRET` con este comando y copia el resultado en `.env`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(64).toString('base64url'))"
```

Deja una sola definición de `JWT_SECRET` en el archivo. NestJS exige al menos 32 bytes para iniciar y emite tokens HS256 con emisor `emergen-api` y audiencia `emergen-web`. FastAPI debe utilizar el mismo secreto para reconocer esas sesiones. La duración se configura con `JWT_SESSION_HOURS=2`: acepta horas enteras de 1 a 168 y usa **2 horas** por defecto. Reinicia NestJS al cambiarla; con Docker usa `docker compose up -d --build backend`. El cambio se aplica al próximo inicio de sesión, en web, APK y panel; los JWT ya emitidos conservan su vencimiento.

Los archivos `.env` y `.env.local` están excluidos de Git. Las variables con prefijo `VITE_` se incluyen en el código que recibe el navegador: reserva ese prefijo para configuración pública, como las URL y los identificadores de cliente.

### 4.3 Instalar las dependencias de Node

```powershell
npm ci
```

Esta instalación incluye todos los workspaces de `apps/` y `packages/`. Después de actualizar el repositorio, repítela si cambió el lockfile. La instalación de Python se explica en la sección 6.4.

### 4.4 Qué archivo de configuración lee cada servicio

| Proceso                 | Configuración que utiliza                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| NestJS local            | Desde `apps/backend`, carga `.env.local`, `.env` y `../../.env`, en ese orden; la primera definición tiene prioridad.              |
| NestJS en Docker        | Recibe las variables declaradas en `docker-compose.yml`, que toma sus valores del `.env` raíz.                                     |
| Web, móvil y escritorio | Vite lee el `.env` raíz mediante `envDir: '../../'`; el modo `docker` añade `.env.docker`.                                         |
| FastAPI                 | Lee el `.env` raíz, `apps/backend/.env.local` y `services/internal-api/.env`; el último archivo puede sobrescribir los anteriores. |

En todos los casos, las variables ya definidas en el entorno del proceso tienen prioridad. Si conservas `DB_HOST=db` en el `.env` raíz, configura `DB_HOST=localhost` y `DB_PORT=5433` en los archivos locales de los servicios que ejecutes fuera de Docker.

## 5. Servicios e integraciones del proyecto

Los cinco servicios externos descritos en la especificación de herramientas cumplen estas funciones:

| Servicio                | Uso en el proyecto                                                                                                                  | Configuración principal                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| PayPal REST API         | Compra de planes y cupos de apadrinados; pruebas con sandbox.                                                                       | `PAYPAL_MODE`, `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET` y `VITE_PAYPAL_CLIENT_ID`.                                        |
| Firebase Authentication | Verificación del correo durante el registro y herramientas de recuperación de contraseña. Las sesiones de EMERGEN las emite NestJS. | `FIREBASE_PROJECT_ID` y configuración pública `VITE_FIREBASE_*`.                                                     |
| jsReport                | Generación de reportes PDF y Excel de ventas y bitácora administrativa.                                                             | `JSREPORT_URL`, `JSREPORT_URL_DOCKER` y credenciales si el servidor las requiere.                                    |
| Google Maps Platform    | Visualización de mapas y conversión de coordenadas en direcciones mediante Geocoding.                                               | `GOOGLE_MAPS_API_KEY` para servidor, `VITE_GOOGLE_MAPS_API_KEY` para navegador y `VITE_GOOGLE_MAPS_MAP_ID` opcional. |
| mindicador.cl           | Consulta de indicadores y del dólar para convertir los precios en CLP a USD en el flujo de PayPal.                                  | `MINDICADOR_API_URL`; `DOLAR_CLP_RESPALDO` permite configurar un valor de respaldo.                                  |

El backend también integra **WhatsApp mediante Baileys**. Este módulo mantiene la sesión de un número emisor y envía el tipo de emergencia, el mensaje, la ubicación y los antecedentes médicos a entre uno y cinco contactos. La ficha se descifra en NestJS mediante la configuración `MEDICAL_DATA_KEYS` incorporada por el módulo de perfil. Baileys no es una API oficial de WhatsApp. El módulo no procesa conversaciones entrantes.

Para habilitarlo, define `WHATSAPP_ENABLED=true`, reinicia el backend y vincula el número mediante QR o código de emparejamiento. Las rutas de gestión y envío manual están bajo `/notifications/whatsapp` y requieren una sesión de administrador. El procedimiento completo está en [la guía de integraciones](readme-apis.md).

**El registro de SOS está conectado al envío por WhatsApp.** FastAPI registra la alerta y un `ENVIO_ALERTA` pendiente por contacto en la misma transacción. NestJS consume esa cola con la sesión del emisor vinculada y envía el tipo de emergencia, el mensaje y la ubicación. Al pasar a `FINALIZADA`, se encola un aviso de cierre por contacto, tanto con PIN como en el cierre automático. El móvil muestra los envíos de activación pendientes, enviados y fallidos. Las instalaciones existentes requieren la migración descrita en la [guía de SOS por WhatsApp](docs/WHATSAPP_SOS.md).

Puedes iniciar el backend sin configurar todos los proveedores. Las integraciones que requieren credenciales validan su configuración al usarse y pueden responder `503` si faltan valores. El registro público necesita Firebase configurado; para las pruebas locales puedes usar los datos de desarrollo de la sección 6.3.

## 6. Ejecutar las aplicaciones en desarrollo

Elige dónde ejecutar NestJS antes de abrir un frontend. Con Docker puedes iniciar juntos el backend y PostgreSQL:

```powershell
docker compose up --build -d
```

Para desarrollar NestJS con recarga automática, inicia solo PostgreSQL y ejecuta el backend local en una terminal que permanezca abierta:

```powershell
docker compose up -d db
npm run start:dev --workspace=backend
```

Si el backend de Docker ya estaba encendido, puedes detenerlo con `docker compose stop backend`. Ambos backends pueden acceder a la misma base, pero conviene tener claro cuál consume cada aplicación. Mantén una sola instancia con la misma sesión de WhatsApp activa.

### 6.1 Puertos y selección del backend

| Componente               | Dirección desde tu equipo                                       | Puerto dentro de Docker         |
| ------------------------ | --------------------------------------------------------------- | ------------------------------- |
| NestJS local             | `http://localhost:3000` (`PORT` del entorno local)              | —                               |
| NestJS en Docker         | `http://localhost:3001`                                         | `3000`                          |
| PostgreSQL en Docker     | `localhost:5433`                                                | `5432`                          |
| FastAPI                  | `http://localhost:8000`                                         | Se ejecuta por separado         |
| Web y móvil en Vite      | Habitualmente `http://localhost:5173` y `http://localhost:5174` | —                               |
| Escritorio en desarrollo | Vite en `http://localhost:5175` y ventana de Electron           | —                               |
| jsReport local           | `http://localhost:5488`                                         | `5488`, en su propio contenedor |

Abre cada frontend en una terminal diferente, desde la raíz del monorepo:

| Aplicación         | Con NestJS local, puerto 3000        | Con NestJS en Docker, puerto 3001                    |
| ------------------ | ------------------------------------ | ---------------------------------------------------- |
| Web                | `npx turbo run dev --filter=web`     | `npx turbo run dev --filter=web -- --mode docker`    |
| Móvil en navegador | `npx turbo run dev --filter=mobile`  | `npx turbo run dev --filter=mobile -- --mode docker` |
| Escritorio         | `npx turbo run dev --filter=desktop` | `npx turbo run dev:docker --filter=desktop`          |

El modo `docker` de Vite toma `VITE_API_URL=http://localhost:3001` de `.env.docker`. Ese archivo está versionado y contiene configuración pública del frontend; Docker Compose no lo lee. `VITE_INTERNAL_API_URL` sigue apuntando a FastAPI en el puerto 8000 en ambos modos.

Web y móvil usan el primer puerto libre de Vite; comprueba la dirección que imprime la terminal. El escritorio fija el puerto 5175 y se detiene si está ocupado. Al abrir el panel, la interfaz indica la API y el modo seleccionados.

Los comandos de móvil anteriores ejecutan la aplicación en el navegador. Para generar el APK con los archivos empaquetados, sigue la sección 11. De igual forma, el script `build` de escritorio compila la interfaz; no genera por sí solo un instalador de Electron.

### 6.2 Permisos de acceso desde el navegador: CORS

NestJS utiliza `CORS_ORIGINS`, una lista separada por comas. Si no hay un valor configurado, permite `http://localhost:5173`, `http://localhost:5174` y `http://localhost:5175`. FastAPI reutiliza esa variable, salvo que definas `INTERNAL_API_CORS_ORIGINS` para darle una lista propia.

Si usas otra dirección o puerto, agrega el origen correspondiente y reinicia el servicio. En Docker, los cambios de variables se aplican con `docker compose up -d backend`; los cambios de código necesitan reconstruir la imagen con `docker compose up --build -d backend`. Reinicia también Vite al cambiar sus variables.

En un teléfono físico, `localhost` se refiere al propio teléfono. Para una prueba desde la red local, configura las URL de NestJS y FastAPI con la IP de tu equipo, permite el origen del cliente y expón los servidores en una interfaz accesible desde esa red. FastAPI iniciado con `--host localhost` solo atiende desde el equipo de desarrollo.

### 6.3 Datos de desarrollo y panel administrativo

Una base nueva contiene el esquema y los catálogos, pero no usuarios. Con PostgreSQL disponible y las dependencias de Node instaladas, puedes cargar las cuentas de demostración:

```powershell
node scripts/seed-dev.cjs
```

El script crea las cuentas faltantes y conserva las existentes; no restablece sus contraseñas ni sus compras. También asegura el precio de demostración del plan base. Las cuentas, contraseñas de prueba y condiciones de uso están en [README_BDD.md](README_BDD.md#fixtures-explícitos-de-desarrollo).

En el panel, inicia sesión con la cuenta de administrador de esos datos de desarrollo. Las rutas administrativas requieren el rol `ADMINISTRADOR` con acceso completo. El panel consulta usuarios, compras, SOS y bitácora a través de NestJS. Los listados de SOS leen PostgreSQL y pueden consultarse aunque FastAPI esté detenido; crear y cerrar SOS sí requiere FastAPI.

Las secciones de compras y bitácora permiten descargar PDF o Excel mediante jsReport. Los reportes se solicitan a `GET /admin/ventas/reporte` y `GET /admin/auditoria/reporte`, con `formato=pdf` o `formato=xlsx`. Sus plantillas están en el código del backend.

### 6.4 Iniciar FastAPI para SOS y soporte

Este servicio se ejecuta fuera de Compose y necesita PostgreSQL, las dependencias del monorepo y el mismo `JWT_SECRET` de NestJS. Su verificación de PIN utiliza el bcrypt del backend mediante un script de Node.

Para crear el entorno virtual e instalar las dependencias por primera vez, ejecuta desde la raíz del monorepo:

```powershell
python -m venv services/internal-api/.venv
.\services\internal-api\.venv\Scripts\python.exe -m pip install -r services/internal-api/requirements.txt
```

Después, abre otra terminal y arráncalo desde su carpeta. Las variables de conexión siguientes se aplican solo a esa terminal:

```powershell
Set-Location -LiteralPath services/internal-api
$env:DB_HOST = 'localhost'
$env:DB_PORT = '5433'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host localhost --port 8000
```

Mantén esa terminal abierta. Desde otra terminal puedes comprobar el proceso:

```powershell
curl.exe http://localhost:8000/health
```

La respuesta esperada es `{"status":"ok"}`. Esta ruta comprueba que el proceso responde; una petición autenticada verifica además el acceso a la base de datos. La documentación interactiva está en `http://localhost:8000/docs`, salvo que desactives `INTERNAL_API_DOCS_ENABLED`.

FastAPI expone `/internal/v1/alertas` y `/internal/v1/tickets-soporte`. También cierra los SOS que llevan 24 horas activos: revisa al arrancar y, por defecto, cada 30 segundos. Ese cierre automático necesita que el servicio permanezca encendido; al reiniciarse recupera las alertas vencidas. Más detalles en [el README del servicio](services/internal-api/README.md).

## 7. Trabajar con Docker y jsReport

### 7.1 Iniciar y comprobar NestJS y PostgreSQL

Con Docker Desktop en ejecución y `.env` configurado:

```powershell
docker compose up --build -d
docker compose ps
docker compose logs --tail 30 db backend
curl.exe http://localhost:3001
```

Los contenedores son `postgres_emergen_db` y `nestjs_emergen_backend`. La ruta raíz de NestJS responde `Hello World!`. Si no responde, revisa los logs antes de iniciar los frontends.

El Dockerfile construye el backend en varias etapas con `node:24.21.0-alpine`. `turbo prune backend --docker` selecciona sus dependencias y la imagen final conserva las de producción, ejecutándose con el usuario `node`. Mantén `.dockerignore`: excluye dependencias del equipo, entornos virtuales y archivos privados del contexto de construcción.

### 7.2 Iniciar jsReport

jsReport se ejecuta en un contenedor independiente. Para crearlo por primera vez:

```powershell
docker run -d --name jsreport -p 5488:5488 jsreport/jsreport
```

Si el contenedor ya existe y está detenido:

```powershell
docker start jsreport
```

El editor queda en `http://localhost:5488`. En `.env`, utiliza `JSREPORT_URL=http://localhost:5488` para NestJS local y `JSREPORT_URL_DOCKER=http://host.docker.internal:5488` para NestJS en Docker. Compose pasa esta última dirección al contenedor. Deja `JSREPORT_USERNAME` y `JSREPORT_PASSWORD` vacíos si tu servidor no tiene autenticación activada.

### 7.3 Detener los servicios y conservar los datos

```powershell
docker compose down
```

Este comando conserva el volumen de PostgreSQL (`volumen_emergen_postgres_data`) y el de la sesión de WhatsApp (`volumen_emergen_whatsapp_auth`). jsReport se detiene por separado con `docker stop jsreport`; FastAPI y los procesos locales se detienen con `Ctrl+C` en sus terminales.

### 7.4 Inicialización y recreación de la base de datos

PostgreSQL ejecuta `init.sql` solo al inicializar un volumen vacío. Modificar ese archivo o reconstruir el backend no actualiza una base ya creada. TypeORM utiliza `synchronize: false`, por lo que tampoco modifica automáticamente las tablas.

Si necesitas conservar datos de una versión anterior, prepara una migración y un respaldo siguiendo [README_BDD.md](README_BDD.md). Los scripts SQL históricos no forman una secuencia de migración que deba ejecutarse completa sobre el esquema actual.

Para recrear un entorno de desarrollo cuyos datos puedas descartar:

> **`docker compose down -v` elimina la base de datos y la sesión de WhatsApp guardada en los volúmenes de este Compose.** Después tendrás que volver a cargar las cuentas de desarrollo y vincular el número emisor si utilizabas esa integración.

```powershell
docker compose down -v
docker compose up --build -d
node scripts/seed-dev.cjs
```

La recreación no afecta al contenedor independiente de jsReport ni a sus plantillas.

## 8. Compilación, calidad y pruebas

Ejecuta estos comandos desde la raíz del monorepo, una vez instaladas las dependencias:

| Tarea                                              | Comando                                               |
| -------------------------------------------------- | ----------------------------------------------------- |
| Compilar las aplicaciones Node                     | `npm run build`                                       |
| Compilar solo NestJS                               | `npx turbo run build --filter=backend`                |
| Revisar código con los linters configurados        | `npm run lint`                                        |
| Revisar tipos de los paquetes que tienen esa tarea | `npm run check-types`                                 |
| Pruebas unitarias de NestJS, con Jest              | `npm test --workspace=backend -- --runInBand`         |
| Pruebas HTTP de NestJS                             | `npm run test:e2e --workspace=backend -- --runInBand` |
| Pruebas del cliente compartido, con Vitest         | `npm test --workspace=@repo/api-client`               |
| Pruebas de la web, con Vitest                      | `npm test --workspace=web`                            |
| Pruebas unitarias del móvil, sin modo observación  | `npm run test.unit --workspace=mobile -- --run`       |
| Pruebas de navegador del móvil, con Cypress        | `npm run test.e2e --workspace=mobile`                 |
| Revisar el formato de este README                  | `npx prettier README.md --check`                      |

El backend usa **oxlint `1.85.0` con información de tipos**; las interfaces usan **ESLint `10.11.0`**. El formato se mantiene con **Prettier `3.9.6`**. Las suites de Node utilizan Jest `30.5.2`, Vitest `4.1.11` y Cypress `13.17.0`, según el workspace. El escritorio no tiene un script de pruebas propio declarado actualmente.

Las pruebas de Cypress apuntan a `http://localhost:5173`, según `apps/mobile/cypress.config.ts`: inicia el frontend móvil en ese puerto o ajusta `baseUrl` para que coincida con su dirección. Las pruebas de FastAPI requieren PostgreSQL y los datos de desarrollo; ejecútalas desde `services/internal-api`:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

Las suites de NestJS que prueban la base real se habilitan con `DB_E2E=1`; las de proveedores reales, con `LIVE_APIS=1`. Los comandos habituales no habilitan esas suites por sí solos. Para verificar el esquema, las transacciones y la integración completa, sigue el procedimiento de [README_BDD.md](README_BDD.md#validación-reproducible). Ejecuta las suites que modifican la base de datos de forma secuencial, sin utilizar el panel durante las pruebas que cambian temporalmente los roles.

## 9. Resolver problemas habituales

| Problema                                                   | Qué revisar o hacer                                                                                                                                               |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aviso de versiones de Node o npm (`EBADDEVENGINES`)        | Comprueba `.nvmrc` y `package.json`. Los avisos de `devEngines` están configurados con `onFail: "warn"`; usa las versiones de referencia para evitar diferencias. |
| Dependencias ausentes después de actualizar el repositorio | Ejecuta `npm ci` desde la raíz del monorepo. Conserva el lockfile para reproducir las versiones del equipo.                                                       |
| Conflicto de dependencias (`ERESOLVE`)                     | Revisa la versión del paquete y sus requisitos. Usa la versión compartida por las otras aplicaciones; evita resolverlo forzando la instalación.                   |
| NestJS no inicia por `JWT_SECRET`                          | Genera un secreto propio de al menos 32 bytes y deja una sola definición en la configuración efectiva.                                                            |
| El backend local intenta conectarse a `db:5432`            | Usa `localhost:5433` fuera de Docker y revisa si `apps/backend/.env.local` está sobrescribiendo el `.env` raíz.                                                   |
| El frontend apunta al backend equivocado                   | Comprueba el modo de Vite: desarrollo local para 3000 y modo `docker` para 3001.                                                                                  |
| Error de CORS o «sin respuesta del backend»                | Verifica que la API responda, comprueba el origen de Vite y agrégalo a la lista CORS del servicio correspondiente.                                                |
| Puerto 5175 ocupado                                        | Cierra el proceso que lo utiliza antes de abrir el escritorio. El panel no cambia de puerto automáticamente.                                                      |
| La web abre, pero SOS o soporte no responden               | Inicia FastAPI en 8000 y revisa `VITE_INTERNAL_API_URL`. Compose no inicia ese servicio.                                                                          |
| FastAPI responde, pero rechaza la sesión                   | Comprueba el vencimiento del JWT y que NestJS y FastAPI usen el mismo `JWT_SECRET` y la misma base de datos.                                                      |
| Fallan las descargas de reportes                           | Comprueba jsReport en 5488, la URL vista desde NestJS y las credenciales si hay autenticación.                                                                    |
| WhatsApp queda en `waiting_for_link`                       | Vincula el número emisor por QR o código. Si la sesión está abierta en otra instancia, deja una sola activa.                                                      |
| Cypress indica que falta su binario                        | Ejecuta `npx --workspace=mobile cypress install`.                                                                                                                 |
| Los cambios de `init.sql` no aparecen en PostgreSQL        | El volumen ya estaba inicializado. Revisa el procedimiento de migración o recreación de la sección 7.4.                                                           |

Para reparar una instalación local, comienza por `npm ci`. Si npm informa errores de caché, puedes comprobarla con `npm cache verify` y volver a instalar. Regenerar `package-lock.json` es un cambio de dependencias que debe revisarse y compartirse con el equipo; no es parte de la limpieza habitual.

## 10. Documentación de apoyo

- [SOS por WhatsApp](docs/WHATSAPP_SOS.md): vinculación del emisor, mensaje y ubicación, prueba móvil y estados de envío.

- [Especificación de Herramientas y Servicios del Proyecto](<../Evidencias de documentación/4.2 Especificación de Herramientas y Servicios del Proyecto/Especificación de Herramientas y Servicios del Proyecto.docx>): decisiones de herramientas, servicios y responsabilidades previstas.
- [README_BDD.md](README_BDD.md): esquema vigente, cuentas de demostración y validación de la base de datos.
- [Contrato de APIs internas](readme.apis.internas.md): rutas y reglas de SOS, soporte, ventas y auditoría.
- [README de FastAPI](services/internal-api/README.md): configuración y operación del servicio de SOS y soporte.
- [Guía de integraciones](readme-apis.md): credenciales, vinculación de WhatsApp y uso de los clientes de servicios. Para las sesiones de EMERGEN, usa el flujo JWT de NestJS descrito en este README y en el contrato interno.
- [Pruebas de SOS](docs/PRUEBAS_SOS.md) y [pruebas de compra de planes](docs/PRUEBAS_COMPRA_PLAN.md): recorridos para comprobar las funciones principales.
- [Informe de integración de la base de datos](docs/INTEGRACION_BDD_2026-10-21.md) y [estado de integración](ESTADO_INTEGRACION_BDD.md): decisiones y evidencias de la integración.

Este README toma la especificación como contexto y describe el uso que reflejan el código, los scripts y la configuración actual del proyecto.

## 11. APK Android de depuración: preparación local y pruebas en red LAN

Para preparar el equipo de otro integrante con una IA, copia el [prompt actualizado para Claude Code](docs/PROMPT_CLAUDE_CODE_ANDROID_LAN.md). Incluye el entorno LAN, instalación, permisos, secuencia física de volumen, segundo plano y sesión de dos horas. El prompt utiliza los scripts existentes y deja los envíos reales a cargo del integrante.

### 11.1 Alcance y versiones

Esta entrega prueba las funciones existentes **con la app abierta**: login, PIN, perfil, cuentas, contactos, soporte, SOS con ubicación disponible y finalización con PIN. FastAPI registra el SOS; NestJS procesa los envíos de WhatsApp en el servidor. No se necesita Vite para abrir el APK: los archivos compilados están dentro de la aplicación.

Desde `0.2.0`, la secuencia utiliza **teclas físicas de volumen**, se guarda en el dispositivo por perfil y permite activar/desactivar un servicio nativo desde la app. Requiere habilitar Accesibilidad para esas teclas y mantener una notificación del servicio. El código nativo consulta la prioridad guardada y registra el SOS sin confirmación adicional. El usuario confirmó el funcionamiento de `0.2.1`, incluida ubicación y uso con pantalla apagada tras retirar la app de Recientes. `0.2.2` organiza la tarjeta en cuatro secciones, simplifica los textos y establece dos horas de sesión por defecto. Los pasos y límites están en [SOS por volumen](docs/SOS_VOLUMEN_ANDROID.md). Las notificaciones push y una cola de SOS sin conexión siguen pendientes. Los ajustes de batería e inicio automático pueden limitar la recuperación del servicio. Forzar detención o reiniciar el teléfono requiere activarlo de nuevo.

Versiones comprobadas durante esta preparación (28-10-2026):

| Elemento                                         | Versión/configuración                                     |
| ------------------------------------------------ | --------------------------------------------------------- |
| Node / npm                                       | `24.21.0` / `11.19.0`                                     |
| Android Studio instalado                         | Rabbit 1, `2026.2.1`, build `262.9437.185.2621.16467767`  |
| Java del IDE                                     | JBR `25.0.3`; ejecuta Studio, **no este Gradle**          |
| JDK seleccionado para Gradle y Kotlin            | Eclipse Temurin `21.0.12.1+1-LTS`                         |
| Capacitor core / CLI / Android                   | `8.5.2`                                                   |
| Capacitor Geolocation                            | `8.2.4`                                                   |
| Gradle Wrapper / Android Gradle Plugin           | `8.14.3` / `8.13.0`                                       |
| SDK para compilar / target / mínimo del teléfono | `36` / `36` / `24` (Android 7)                            |
| Android SDK Build-Tools                          | `36.0.0`                                                  |
| ADB verificado                                   | Platform-Tools `37.0.1`, protocolo `1.0.41`               |
| Teléfono de referencia                           | Redmi Note 13 Pro, modelo `2312DRA50G`, Android 16/API 36 |

El teléfono necesita Android compatible, WebView actualizado y acceso a la misma LAN que el servidor. Instalar Platform 36 en el PC no exige que el teléfono tenga exactamente Android 16: el mínimo lo fija `minSdkVersion`. Tener solo Platform 37 instalada tampoco sustituye Platform 36 para esta plantilla.

La identidad provisional estable es `com.emergen.mobile`. La variante debug se identifica como **EMERGEN LAN**, versión `0.2.2-lan-debug`, `versionCode 5`. Incluye secuencia física de volumen, ubicación fusionada y recuperación del servicio, con la tarjeta reorganizada y textos breves; conserva la corrección de soporte de `0.1.1`. Mantén el identificador para futuras actualizaciones; incrementa `versionCode` al distribuir versiones sucesivas. La fecha de construcción y las dos URL públicas están en `assets/public/android-build.json` dentro del APK. El hash SHA-256 del archivo identifica exactamente el artefacto probado.

### 11.2 SDK, JDK y rutas locales

Instala Android Studio compatible con Capacitor 8 (mínimo 2025.2.1). En **Tools > SDK Manager**, confirma la ruta del SDK e instala **Android SDK Platform 36**, **Build-Tools 36.0.0** (Show Package Details), **Platform-Tools** y **Command-line Tools** si vas a administrar el SDK por terminal. No necesitas emulador ni NDK para compilar esta app y usar un teléfono físico.

Usa **JDK 21**. Java 8 no compila esta plantilla; Java 25 exige otro Gradle y no es la solución para el Wrapper 8.14.3. Puedes descargar JDK 21 desde el selector **Download JDK** del IDE o instalar una distribución compatible. No actualices AGP/Gradle con el Upgrade Assistant para resolver esta selección.

Desde la raíz del monorepo, copia la plantilla de rutas y reemplaza ambos valores con las rutas reales de tu PC:

```powershell
if (-not (Test-Path -LiteralPath .android.local.json)) {
    Copy-Item -LiteralPath .android.local.example.json -Destination .android.local.json
}
```

`.android.local.json` está ignorado. El JDK portátil de esta preparación se conserva en `.android-tools/`, también ignorado, fuera de `node_modules` para que `npm ci` no lo elimine. Cada integrante puede elegir otra instalación de JDK 21 y declarar su ruta. El script da prioridad a parámetros `-JdkPath`/`-SdkPath`, luego al archivo local, luego a `JAVA_HOME`/`ANDROID_HOME`; para el SDK admite finalmente la ubicación habitual de Windows. Activa el entorno **en cada terminal nueva**, usando punto y espacio para que las variables permanezcan en ella:

```powershell
. .\scripts\android-env.ps1
node --version
npm --version
java -version
adb version
$env:JAVA_HOME
$env:ANDROID_HOME
```

El script comprueba JDK 21, Platform 36, Build-Tools y ADB; agrega `bin` del JDK y `platform-tools` al PATH de esa terminal. Cuando existe `apps/mobile/android`, escribe `local.properties` con `sdk.dir` y `.gradle/config.properties` con `java.home`, ambos ignorados. Si el proyecto aún no tiene `.idea/gradle.xml`, crea la selección local `GRADLE_LOCAL_JAVA_HOME`; no sobrescribe una configuración del IDE existente.

En Android Studio abre **Settings > Build, Execution, Deployment > Build Tools > Gradle** y verifica **Gradle JDK = GRADLE_LOCAL_JAVA_HOME**, o selecciona explícitamente el mismo JDK 21. El JBR que ejecuta el IDE es independiente. Esta plantilla no fija criterios de JVM del daemon en un archivo versionado: si Studio propone otros criterios, conserva Java 21 y comprueba el resultado. Después de generar Android:

```powershell
Push-Location -LiteralPath ".\apps\mobile\android"
.\gradlew.bat --version
Pop-Location
```

`Launcher JVM` y `Daemon JVM` deben indicar Java 21. Usa siempre este Wrapper, sin instalar Gradle global. Si cambiaste de JDK, cierra/reabre la terminal y ejecuta `gradlew.bat --stop` antes de repetir. Las descargas iniciales de Gradle, Maven y SDK necesitan conexión a Internet.

### 11.3 Configurar ambas URL y su precedencia

Instala las dependencias **desde la raíz del monorepo**, donde está el único lockfile:

```powershell
npm ci
if (-not (Test-Path -LiteralPath .env.android-lan.local)) {
    Copy-Item -LiteralPath .env.android-lan.example -Destination .env.android-lan.local
}
ipconfig
```

En `ipconfig`, elige la IPv4 del adaptador Wi-Fi/Ethernet con acceso a la misma red que el teléfono. Evita WSL, Docker, VPN y direcciones `169.254.*`. Reemplaza `REEMPLAZAR_IP_LAN` en `.env.android-lan.local`. Ejemplo público ilustrativo:

```env
VITE_API_URL=http://192.168.1.20:3000
VITE_INTERNAL_API_URL=http://192.168.1.20:8000
```

La modalidad principal de esta guía es **NestJS local 3000 + FastAPI 8000 + PostgreSQL en Docker**. Si eliges NestJS de Docker, cambia solo la primera URL a puerto **3001** y configura/reinicia ese contenedor. No mezcles una URL 3001 con instrucciones que solo arrancan NestJS local.

Vite lee desde la raíz mediante `envDir: '../../'`. En modo `android-lan`, de menor a mayor prioridad: `.env`, `.env.local`, `.env.android-lan`, `.env.android-lan.local`, variables ya presentes en el proceso. Solo la plantilla `.env.android-lan.example` está versionada; no se carga automáticamente. Firebase público se hereda del `.env` principal. Elimina valores `VITE_API_URL`/`VITE_INTERNAL_API_URL` antiguos de la terminal si están sobrescribiendo tu archivo local.

El build LAN exige dos URL explícitas con IPv4 privada y rechaza localhost, ejemplos sin reemplazar, credenciales embebidas y `VITE_SOS_SIMULATED_LOCATION`. Un debug nativo **no** implica `import.meta.env.DEV=true`: esta compilación de Vite sigue siendo de producción y usa coordenadas reales. Las variables `VITE_*` son públicas: no contienen secretos del servidor.

`capacitor.config.ts` no depende de variables de entorno y no necesita cargar los `.env` de Vite. No tiene `server.url`: abre los assets empaquetados con origen **`https://localhost`**. Ese origen identifica la interfaz de la WebView; las URL `192.168.*:puerto` identifican las APIs.

### 11.4 Preparar datos y arrancar los servicios

Completa antes `.env` según la sección 4, incluido el cifrado médico y las integraciones que necesites. Conserva la base y las sesiones existentes. Para una instalación nueva o una base pendiente de migración, utiliza los scripts existentes; **no ejecutes de nuevo init.sql ni elimines volúmenes**. Con NestJS/FastAPI detenidos para migrar:

```powershell
docker compose up -d db
node scripts/migrate-whatsapp.cjs
node scripts/migrate-contactos-antecedentes.cjs
node scripts/migrate-tickets-responsable.cjs
# Solo después de configurar MEDICAL_DATA_KEYS; conserva/cifra los datos existentes.
node scripts/cifrar-fichas.cjs
# Opcional: crea fixtures faltantes; no reemplaza las cuentas ya existentes.
node scripts/seed-dev.cjs
```

Consulta [README_BDD.md](README_BDD.md) y [SOS por WhatsApp](docs/WHATSAPP_SOS.md) antes de preparar una base anterior. No vuelvas a cargar fixtures sobre una cuenta personal para intentar corregir su plan o PIN. `verify-schema.cjs` compara estrictamente con `init.sql`: actualmente puede informar columnas adicionales legítimas de las migraciones de contactos y responsables de soporte. Esa diferencia no se resuelve recreando la base ni cambiando el archivo protegido.

En `.env` raíz conserva los orígenes web y agrega el origen Android:

```env
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,https://localhost
```

Comprueba que `apps/backend/.env.local`, `services/internal-api/.env` o el entorno del proceso no reemplacen esa lista. FastAPI reutiliza `CORS_ORIGINS`; si tiene `INTERNAL_API_CORS_ORIGINS`, agrega allí también `https://localhost` conservando los orígenes necesarios.

Arranque principal, desde la raíz, en terminales separadas:

```powershell
# Terminal 1: omite stop si no existe backend de Docker en ejecución.
docker compose stop backend
docker compose up -d db
$env:HOST = '0.0.0.0'
npm run start:dev --workspace=backend
```

```powershell
# Terminal 2: instalación Python solo la primera vez.
python -m venv services/internal-api/.venv
.\services\internal-api\.venv\Scripts\python.exe -m pip install -r services/internal-api/requirements.txt
Push-Location -LiteralPath ".\services\internal-api"
$env:DB_HOST = 'localhost'
$env:DB_PORT = '5433'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
Pop-Location
```

Si la API interna ya fue iniciada por el script del panel, puedes reiniciar **esa instancia identificada** con `.\scripts\restart-panel-internal-api.ps1 -ListenHost 0.0.0.0`. No inicies otra en el mismo puerto. NestJS ahora escucha explícitamente en `HOST` o `0.0.0.0`. Esta dirección es de **escucha**, nunca la pongas como URL del teléfono.

Alternativa Docker: después de preparar la base y la configuración, `docker compose up --build -d backend` publica NestJS en 3001; no ejecutes además el NestJS local para esta modalidad. FastAPI continúa ejecutándose fuera de Compose en 8000. Mantén **una sola instancia** utilizando una misma sesión emisora de WhatsApp.

WhatsApp requiere `WHATSAPP_ENABLED=true` y una sesión realmente vinculada y abierta. Desde el panel o una consulta autenticada de administrador, comprueba `GET /notifications/whatsapp/status`; habilitar la variable no demuestra conexión. Nunca copies tokens, PIN, claves médicas ni `auth_info_baileys` a la documentación, al APK o a Git. Las pruebas automáticas de esta preparación no crean SOS ni envían mensajes a contactos.

La cuenta de prueba necesita autenticación, PIN configurado, plan efectivo conforme a las reglas actuales, contactos válidos propios y ausencia de otro SOS activo. Los pagos siguen realizándose en la web. Usa contactos destinados a pruebas; el responsable del teléfono realiza los envíos manualmente.

### 11.5 Red, firewall y permisos Android

PC y teléfono deben comunicarse en la misma LAN. Evita la red de invitados/aislamiento de clientes; revisa VPN y suspensión del PC. Si DHCP cambia la IP, actualiza el archivo LAN y reconstruye el APK. Cada integrante puede ejecutar sus servicios y generar su APK con su IP, o todos pueden usar un APK generado hacia un PC compartido accesible. Distribuir el APK **no** cambia la dirección que lleva incorporada. El PC compartido y sus dependencias deben permanecer encendidos.

En una red de confianza, abre PowerShell **como administrador** y, desde la raíz, ejecuta:

```powershell
.\scripts\android-lan-firewall.ps1 -InterfaceAlias 'Wi-Fi' -BackendPort 3000
```

Sustituye el alias si usas Ethernet; con NestJS de Docker usa `-BackendPort 3001`. El script marca ese perfil como Privado y crea reglas TCP para ese backend y 8000, solo perfil Privado y `LocalSubnet`. No desactiva el firewall ni abre PostgreSQL. El mapeo de PostgreSQL que ya existe en Compose es para los servicios del PC: el teléfono nunca debe conectarse directamente a 5433. Puedes retirar las reglas específicas cuando terminen las pruebas con `Remove-NetFirewallRule -Name 'EMERGEN-APK-LAN-3000','EMERGEN-APK-LAN-8000'` desde una consola administrativa.

Desde la raíz, comprueba conectividad y preflight reales (sin cambios de datos):

```powershell
node scripts/check-android-lan.mjs
```

El script comprueba ambas APIs por su IP LAN, origen permitido exacto, rechazo de origen ajeno y cabeceras `Authorization`/`Content-Type` para los métodos utilizados. Desde el navegador del teléfono abre `http://IP_DEL_PC:3000/` y `http://IP_DEL_PC:8000/health` (o 3001 para Docker). Esto prueba acceso desde otro dispositivo, pero **no sustituye** las peticiones de la WebView instalada.

Los controles Android son independientes:

| Control         | Implementación y comprobación                                                                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CORS            | Ambas APIs permiten explícitamente `https://localhost`; se mantienen los orígenes web, sin `*`.                                                                                                                                        |
| INTERNET        | Declarado en el manifest principal.                                                                                                                                                                                                    |
| HTTP sin cifrar | Principal: `usesCleartextTraffic=false`; solo `src/debug/AndroidManifest.xml` lo cambia a `true`.                                                                                                                                      |
| Contenido mixto | Configuración Capacitor: `allowMixedContent=false`; MainActivity habilita HTTP desde el origen HTTPS únicamente si `BuildConfig.DEBUG`. Release usa `MIXED_CONTENT_NEVER_ALLOW`.                                                       |
| Ubicación       | COARSE/FINE para el SOS manual y al activar SOS por volumen. Este último mantiene ubicación mediante un servicio en primer plano; no solicita `ACCESS_BACKGROUND_LOCATION`. Si falta una posición reciente, el SOS omite la ubicación. |
| Acceso a LAN    | El target real es 36; no se declara ni solicita `ACCESS_LOCAL_NETWORK`. Android 16 tiene protección LAN optativa; al migrar realmente a target 37+ hay que revisar las reglas de Android 17.                                           |

Para verificar el límite de las excepciones, desde `apps/mobile/android` ejecuta `gradlew.bat processDebugMainManifest processReleaseMainManifest` e inspecciona los manifests fusionados bajo `app/build/intermediates/merged_manifests/`. Debug debe permitir cleartext; release debe conservarlo desactivado. El origen efectivo se comprueba con `location.origin` en DevTools de la WebView. Una futura release requiere assets compilados hacia APIs HTTPS y configuración apropiada de producción; no utilices el modo LAN para publicarla.

### 11.6 Primera preparación y actualizaciones

Desde la raíz del monorepo:

```powershell
. .\scripts\android-env.ps1
npm run android:prepare --workspace=mobile
# Vuelve a escribir las rutas locales si android/ acaba de crearse.
. .\scripts\android-env.ps1
npm run android:open --workspace=mobile
```

`android:prepare` ejecuta TypeScript, Vite con `--config vite.config.ts --mode android-lan`, genera Android **solo si falta** y ejecuta `cap sync android`. Comprueba que `dist/android-build.json` coincide con el copiado a Android. `android:open` repite esa preparación y abre Android Studio. Se usa explícitamente la configuración TypeScript para no seleccionar el antiguo `vite.config.js` generado que también existe en el repositorio.

Las fuentes nativas, manifests, recursos, archivos Gradle y Wrapper (incluido su JAR) deben compartirse en Git. Assets copiados, plugins Cordova generados, `local.properties`, `.idea`, `.gradle`, builds, APK, archivos locales y llaves de firma están ignorados. Un clon limpio reproduce los generados mediante `npm ci` y `android:prepare`; no necesita regenerar una carpeta Android ya versionada.

Para **construir el APK actualizado completo**:

```powershell
npm run android:apk --workspace=mobile
```

Este script prepara el entorno, reconstruye la web en modo LAN, sincroniza Capacitor, muestra la JVM real del Wrapper y ejecuta `assembleDebug`. Ante un fallo se detiene: no continúa con un `dist` anterior. Imprime la ruta y el SHA-256 del APK.

Alternativa manual, después de `android:prepare` y de activar el entorno:

```powershell
Push-Location -LiteralPath ".\apps\mobile\android"
.\gradlew.bat --version
.\gradlew.bat assembleDebug
Pop-Location
```

Salida estándar comprobable:

```text
apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

Cambiar las URL o cualquier variable `VITE_*`, código React o paquetes exige **build web + sync + compilación nativa + instalación actualizada**. Cambiar plugins exige también sync. Un cambio exclusivamente nativo necesita recompilación. Cambiar CORS, escucha de APIs, secretos o vinculación de WhatsApp requiere reiniciar/reconfigurar esos servicios; no recompilar el APK mientras sus URL no cambien.

### 11.7 Android Studio, instalación y depuración

1. Abre **`apps/mobile/android`**, espera Gradle Sync y comprueba Gradle JDK 21. Elige el módulo `app` y variante **debug** en Build Variants. No aceptes una actualización mayor de AGP como requisito para abrirlo.
2. En el teléfono activa Opciones de desarrollador y Depuración USB; conecta un cable de datos, desbloquea el teléfono y acepta la autorización RSA. En Redmi/HyperOS puede ser necesario habilitar también **Instalar vía USB** si el sistema bloquea la instalación. Comprueba `adb devices -l`: debe mostrar `device`, no `unauthorized`.
3. Selecciona el Redmi en el desplegable de dispositivos y pulsa **Run** para instalar/depurar. Logcat permite filtrar por `com.emergen.mobile`. En Chrome del PC, `chrome://inspect/#devices` permite inspeccionar la WebView debug y comprobar `location.origin`, Network y errores de consola. No compartas cabeceras Authorization ni datos personales de esas herramientas.
4. Para obtener un **APK compartible**, usa **Build > Generate Bundle(s) / APK(s) > Generate APK(s)** o su acción equivalente en tu versión. En versiones anteriores aparece como **Build Bundle(s) / APK(s) > Build APK(s)**. No te limites al botón Run.
5. Usa **Locate** en la notificación de compilación o abre la ruta de salida anterior. Comprueba fecha, versión y hash antes de distribuirlo. También puedes usar `assembleDebug` para obtener el APK.

Instalación/actualización desde PowerShell, en la raíz y con el entorno activado:

```powershell
adb devices -l
adb install -r ".\apps\mobile\android\app\build\outputs\apk\debug\app-debug.apk"
```

También puedes transferir el archivo al teléfono y permitir la instalación desde la fuente utilizada. Usar Wi-Fi para conectarse a las APIs **no exige** depuración inalámbrica de ADB. Abre **EMERGEN LAN** desde el icono, sin Vite, y realiza las pruebas siguientes.

El APK debug ya tiene firma automática de desarrollo. **Distintos PCs pueden usar firmas debug diferentes**: actualizar el mismo `appId` con otra firma produce `INSTALL_FAILED_UPDATE_INCOMPATIBLE`. Compara los certificados con `apksigner verify --print-certs` y decide cómo conservar los datos; no desinstales automáticamente la app para resolverlo. Comparte el mismo APK de pruebas o usa una estrategia acordada de firma de desarrollo.

Una futura exportación release usa **Build > Generate Signed Bundle / APK > APK** y una clave de producción que el equipo debe custodiar. AAB es un formato para distribución mediante tiendas y no se instala directamente como este APK. Esta tarea no crea claves de producción ni publica releases.

USB con `adb reverse` es solo una alternativa de diagnóstico: exige una compilación separada con URL `http://localhost:PUERTO`, redirigir **ambos** puertos efectivos (`adb reverse tcp:3000 tcp:3000` y `adb reverse tcp:8000 tcp:8000`, o 3001 para NestJS Docker) y conservar las excepciones debug/CORS. El validador `android-lan` rechaza localhost intencionalmente: no lo desactives para sustituir el flujo principal por LAN.

### 11.8 Geolocalización, sesión y pruebas funcionales

El SOS manual de Android utiliza `@capacitor/geolocation`; el navegador conserva `navigator.geolocation` y nunca llama a `requestPermissions` del plugin. Se solicita alta precisión, pero se acepta permiso solo aproximado. La espera total, incluido el diálogo, está limitada a 10 segundos; se admite una ubicación de hasta 30 segundos. El código gestiona rechazo persistente, GPS desactivado, timeout y fallos del proveedor, y permite continuar **sin ubicación** con un aviso. Las respuestas tardías no cambian una ubicación ya utilizada para el envío. El servicio de volumen usa `FusedLocationProviderClient`, como el proveedor del plugin manual, con GPS/red de Android como respaldo: actualiza ubicación mientras está activado y emplea una posición de hasta 60 segundos, sin esperar un GPS nuevo al completar la secuencia. La tarjeta muestra si hay ubicación reciente y su precisión estimada; si aún está buscando, el SOS puede registrarse sin coordenadas. Su activación requiere al menos permiso de ubicación aproximada para iniciar el servicio de tipo `location`; no solicita `ACCESS_BACKGROUND_LOCATION`.

El SOS solo se presenta como registrado después de la confirmación de FastAPI. El mismo intento conserva UUID y contenido para reintentar sin duplicar. Distingue **registro**, **pendiente**, **despacho registrado** y **recepción comprobada por el contacto**: el contador «enviado» no confirma entrega ni lectura. Comprueba físicamente que el mensaje y el pin/enlace contengan las coordenadas reales.

El JWT de NestJS dura **2 horas por defecto**, configurables con `JWT_SESSION_HOURS` (1 a 168 horas). El plazo empieza al iniciar sesión, no al activar segundo plano; la tarjeta muestra el vencimiento del JWT real. Una sesión antigua mantiene su plazo anterior: vuelve a iniciar sesión para recibir la nueva duración. Una respuesta 401 de una operación protegida indica cómo cerrar sesión desde el menú y volver a ingresar. El almacenamiento local no renueva el JWT. No se implementa renovación automática ni una cola offline en esta etapa; perder la red conserva el error y permite un reintento controlado del SOS en la pantalla existente.

Desde `0.1.1-lan-debug`, soporte vuelve a consultar el estado y la solución de las solicitudes cada tres segundos mientras esa pantalla está visible y la app está en primer plano. También actualiza al regresar a la pantalla, recuperar el foco o reanudar la app; **Actualizar** permite consultar inmediatamente. Se conservan el borrador y el detalle desplegado. Al salir de soporte o pasar a segundo plano se cancelan las consultas; si la red falla, se conserva el listado con un aviso hasta recuperar la conexión.

Antes de los recorridos manuales, ejecuta desde la raíz:

```powershell
node --test scripts/android-lan-env.test.mjs
npm run test.unit --workspace=mobile -- --run
node scripts/check-android-lan.mjs
```

Registra por separado **ambiente preparado**, **APK debug compilado** y **pruebas en teléfono aprobadas**. La preparación inicial está en [APK_DEBUG_LAN_2026-10-28.md](docs/APK_DEBUG_LAN_2026-10-28.md); la implementación y las comprobaciones actuales de volumen y segundo plano están en [SOS_VOLUMEN_ANDROID.md](docs/SOS_VOLUMEN_ANDROID.md). Las pruebas unitarias simulan permisos/proveedor/red; no certifican GPS real ni WhatsApp recibido. No ejecutes automáticamente scripts de SOS sobre contactos personales.

Para verificar el reconocedor y la vigencia de ubicación sin generar SOS, usa `.\scripts\test-volume-native.ps1`. Compila las clases y ejecuta JUnit directamente, evitando el fallo de carga observado en el worker de Gradle en la ruta Windows de referencia.

#### Configuración del SOS por volumen en cada teléfono

1. Inicia sesión con un perfil de prueba, plan efectivo, contactos propios y prioridad guardada.
2. En **Configurar alerta**, graba de 3 a 12 pulsaciones físicas, incluyendo ambos botones de volumen, y completa las dos comprobaciones del asistente. No envían alertas. Deja como máximo dos segundos entre pulsaciones.
3. Habilita manualmente **EMERGEN · Secuencia de volumen** en Accesibilidad. Si Android muestra un bloqueo para este APK, revisa **Permitir ajustes restringidos** en la información de la app; no desactives protecciones generales ni automatices el permiso mediante ADB.
4. Vuelve a la app y pulsa **Activar segundo plano**, concediendo ubicación y notificaciones. Comprueba **ACTIVADO**, la notificación y **Ubicación reciente disponible para el SOS**. Revisa batería y actividad en segundo plano según el fabricante.
5. El responsable del teléfono ejecuta la combinación real, primero con la app minimizada y luego, tras cerrar la alerta con PIN, retirándola de Recientes y apagando la pantalla. Confirma recepción y coordenadas en el contacto de prueba. Cada teléfono requiere su propia validación.

La detección usa la prioridad del perfil activo y no funciona con sesión vencida. La secuencia se guarda por perfil y dispositivo. Cerrar sesión o cambiar de perfil desactiva la detección anterior. Tras actualizar el APK, comprueba el estado y vuelve a activarla si corresponde; si Accesibilidad quedó habilitada pero desconectada, desactívala y actívala de nuevo en Ajustes. **Forzar detención** o reiniciar el teléfono requiere volver a abrir la app y activar la detección; no hay autoarranque tras reinicio. Las notificaciones push y el envío automático offline siguen pendientes.

#### Usuarios apadrinados en el APK

El apadrinado entra con el correo y contraseña de la principal, elige su perfil y utiliza su PIN. Tiene **sus propios contactos, prioridad, mensaje y antecedentes médicos**; el plan efectivo se obtiene de la cuenta principal. Un plan compartido no copia los datos de emergencia ni la secuencia de volumen de otro perfil.

| Función                                               | Apadrinado con acceso completo                        | Apadrinado con acceso parcial                                                                |
| ----------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| SOS manual, ubicación y WhatsApp                      | Sí, con plan de la principal y contactos propios      | Sí, con los mismos requisitos; usa el mensaje configurado                                    |
| Secuencia de volumen y segundo plano                  | Sí, con prioridad guardada y permisos del dispositivo | Sí, si su prioridad y contactos ya están configurados; no puede editar libremente esos datos |
| Consultar alertas y solicitar soporte                 | Sí, de su propio perfil                               | Sí, de su propio perfil                                                                      |
| Editar prioridad, contactos, mensaje y ficha médica   | Sí, de su propio perfil                               | No; estas escrituras requieren acceso completo                                               |
| Cambiar su nombre                                     | Sí                                                    | Requiere autorización con el PIN de la principal                                             |
| Finalizar SOS                                         | PIN del apadrinado                                    | PIN de la cuenta principal                                                                   |
| Administrar otras cuentas apadrinadas o comprar cupos | No                                                    | No                                                                                           |

El apadrinado no tiene correo ni contraseña independientes. Estas diferencias proceden de las validaciones actuales de permisos y de las APIs; la revisión para documentarlas fue de solo lectura y no cambió el comportamiento del proyecto.

### 11.9 Solución de problemas Android/LAN

| Síntoma                                                      | Acción concreta                                                                                                                                                                                                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Java 8, `invalid source release: 21`, o Java 25 incompatible | Configura JDK 21 en `.android.local.json`, activa `android-env.ps1`, comprueba `gradlew --version` y el Gradle JDK del IDE.                                                                                                                      |
| SDK no encontrado / falta `android-36`                       | Instala Platform 36 y Build-Tools 36.0.0 en SDK Manager; revisa `sdkPath`, `ANDROID_HOME` y `local.properties`.                                                                                                                                  |
| AGP rechaza la ruta por caracteres no ASCII                  | El monorepo contiene «Aplicación»; `android.overridePathCheck=true` conserva esa ruta. El helper escapa Unicode en las propiedades locales de Java. Si otra herramienta falla por la ruta, revisa ese error concreto antes de mover el proyecto. |
| Dispositivo `unauthorized`                                   | Desbloquea, acepta RSA, reconecta el cable; si persiste, revoca autorizaciones USB en el teléfono y autoriza de nuevo. Si no aparece, revisa cable de datos y controlador OEM/ADB en Windows.                                                    |
| API inaccesible / URLs localhost                             | Revisa ambas URL de `dist/android-build.json`, IP correcta, escucha en 0.0.0.0, puertos 3000/8000 o 3001/8000, perfil Privado, firewall, VPN y aislamiento Wi-Fi. Reconstruye si cambió una URL.                                                 |
| CORS en la WebView                                           | Confirma `location.origin`, lista exacta `https://localhost`, preflight y reinicio de ambas APIs; un navegador que abre /health no demuestra CORS.                                                                                               |
| `ERR_CLEARTEXT_NOT_PERMITTED`                                | Confirma variante debug y manifest fusionado `usesCleartextTraffic=true`; no cambies la configuración de release.                                                                                                                                |
| `Mixed Content`                                              | Recompila la MainActivity actual en debug; CORS y permiso INTERNET no habilitan contenido mixto.                                                                                                                                                 |
| Plugin «not implemented»                                     | `npm ci`, `android:prepare`, Gradle Sync y recompilación/instalación; confirma Geolocation en los plugins sincronizados.                                                                                                                         |
| Ubicación denegada o sin posición                            | Ajustes > Aplicaciones > EMERGEN LAN > Permisos > Ubicación; activa ubicación del teléfono. Aproximada es válida. Tras 10 s se puede registrar sin ella; no lo cuentes como GPS aprobado.                                                        |
| Sesión vencida / 401                                         | Menú > Cerrar sesión, vuelve a iniciar sesión y repite la operación con el estado actual del servidor.                                                                                                                                           |
| WhatsApp pendiente o desconectado                            | Comprueba estado autenticado del emisor en NestJS, conexión y sesión correcta, una sola instancia, número del contacto y contadores. Registro no equivale a recepción.                                                                           |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE`                         | Compara la firma del APK y de la instalación anterior; no borres datos automáticamente.                                                                                                                                                          |

Referencias oficiales: [entorno Capacitor](https://capacitorjs.com/docs/getting-started/environment-setup), [Capacitor 8 y Android](https://capacitorjs.com/docs/updating/8-0), [geolocalización](https://capacitorjs.com/docs/apis/geolocation), [configuración](https://capacitorjs.com/docs/config), [variables de Vite](https://vite.dev/guide/env-and-mode), [JDK y Gradle en Android Studio](https://developer.android.com/build/jdks), [compatibilidad Java/Gradle](https://docs.gradle.org/current/userguide/compatibility.html), [generación desde Android Studio](https://developer.android.com/build/build-for-release), [compilación por terminal](https://developer.android.com/build/building-cmdline) y [permisos de red local](https://developer.android.com/privacy-and-security/local-network-permission).
