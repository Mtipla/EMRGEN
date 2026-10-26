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
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
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

Deja una sola definición de `JWT_SECRET` en el archivo. NestJS exige al menos 32 bytes para iniciar y emite tokens HS256 con duración de una hora, emisor `emergen-api` y audiencia `emergen-web`. FastAPI debe utilizar el mismo secreto para reconocer esas sesiones.

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

El backend también integra **WhatsApp mediante Baileys**. Este módulo mantiene la sesión de un número emisor y envía el mensaje de emergencia y la ubicación a entre uno y cinco contactos. El flujo actual excluye antecedentes médicos. Baileys no es una API oficial de WhatsApp. El módulo no procesa conversaciones entrantes.

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

Los comandos de móvil anteriores ejecutan la aplicación en el navegador. El empaquetado nativo requiere preparar la configuración y las plataformas de Capacitor. De igual forma, el script `build` de escritorio compila la interfaz; no genera por sí solo un instalador de Electron.

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
