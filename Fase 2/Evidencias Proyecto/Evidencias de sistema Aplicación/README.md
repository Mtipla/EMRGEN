# EMERGEN: Ecosistema Multiplataforma de Alertas

Monorepo del proyecto EMERGEN (Turborepo). Contiene la API backend, la web pública, la app móvil y el panel de escritorio.

Guía para el equipo de desarrollo: **Alonso, Gabriel y Diego**.

---

## ⚠️ Regla n.º 1: trabajar SIEMPRE dentro de esta carpeta

La raíz del repositorio Git **no** es la raíz del monorepo. Todo comando (`npm`, `npx turbo`, `docker compose`) debe ejecutarse dentro de:

```
Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/
```

Si ejecutas `npm install` en la raíz del repo o en `Fase 2/Evidencias Proyecto/`, se crea un `node_modules` o un `package-lock.json` en el lugar equivocado y aparecen errores de dependencias.

---

## 1. Requisitos (versiones exactas)

| Herramienta | Versión | Verificación |
|---|---|---|
| Node.js | **24.21.0 LTS** | `node -v` → `v24.21.0` |
| npm | **11.19.x** (viene incluido con Node 24.21.0) | `npm -v` → `11.19.0` |
| Docker Desktop | Reciente, con Docker Compose v2 | `docker compose version` |
| Git | Cualquiera reciente | `git --version` |
| VS Code | Extensiones: ESLint, Prettier | — |

- Descargar Node.js 24.21.0: <https://nodejs.org/dist/v24.21.0/> (instalador `.msi` para Windows). El archivo `.nvmrc` fija esta versión para quienes usen `nvm`/`fnm`.
- **No hace falta instalar nada global** (`turbo`, `@nestjs/cli`, `@ionic/cli`). El monorepo trae sus propias versiones fijadas; se usan con `npx`, por ejemplo `npx turbo ...` o `npx cap ...`. Si tienes un `turbo` global de otra versión, puede generar diferencias.

---

## 2. Estructura del monorepo

```
Evidencias de sistema Aplicación/
├── apps/
│   ├── backend/   → API REST NestJS 12 (CommonJS) + TypeORM + PostgreSQL. RBAC y seguridad.
│   ├── web/       → Web pública: React 19 + Vite 8 + Ionic 9.
│   ├── mobile/    → App móvil: Ionic 9 + React 19 + Capacitor 8 (GPS).
│   └── desktop/   → Panel administrativo: Electron 44 + React 19 + Vite 8.
├── packages/
│   ├── eslint-config/      → Configuración ESLint compartida.
│   ├── typescript-config/  → tsconfig base compartidos.
│   └── ui/                 → Componentes React compartidos.
├── Dockerfile          → Imagen del backend (multi-stage, node:24.21.0-alpine).
├── docker-compose.yml  → PostgreSQL 15 + backend.
├── init.sql            → Esquema inicial de la BD (se ejecuta al crear el volumen).
├── README_BDD.md       → Datos de prueba para poblar la BD.
├── .npmrc              → save-exact=true (las dependencias nuevas se guardan sin ^ ni ~).
└── .nvmrc              → 24.21.0
```

---

## 3. Política de versiones (léelo antes de agregar dependencias)

1. **Todas las versiones están fijadas exactas** (sin `^` ni `~`). Así, dos personas que instalen el mismo día o con meses de diferencia obtienen el mismo árbol de dependencias.
2. **Una sola versión por dependencia compartida.** Si `web` usa `react 19.2.8`, todas las apps usan `19.2.8`. Versiones unificadas actualmente:

   | Dependencia | Versión | Nota |
   |---|---|---|
   | typescript | 6.0.3 | **No subir a 7.x**: `typescript-eslint` exige `<6.1` y `ts-jest` exige `<7`. |
   | react / react-dom | 19.2.8 | Además forzado con `overrides` en el `package.json` raíz. |
   | @types/react / @types/react-dom | 19.2.18 / 19.2.5 | Forzado con `overrides`. |
   | @types/node | 24.13.6 | Coincide con Node 24. |
   | vite / @vitejs/plugin-react | 8.3.0 / 6.1.1 | |
   | eslint / @eslint/js / typescript-eslint | 10.11.0 / 10.0.1 / 8.70.1 | |
   | vitest | 4.1.11 | Primera línea 4.x compatible con Vite 8. |
   | turbo / eslint-plugin-turbo | 2.11.2 | |
   | @ionic/react | 9.0.4 | |
   | @capacitor/core / @capacitor/cli | 8.5.2 | |
   | electron / electron-builder | 44.4.3 / 26.15.3 | |
   | bcrypt | 6.0.0 | Módulo nativo. Trae binarios precompilados para Windows, Linux glibc y Alpine (musl). |
   | typeorm / pg | 1.1.1 / 8.23.0 | |

3. **Cómo agregar una dependencia** (siempre desde la raíz del monorepo, indicando el workspace):

   ```powershell
   npm install axios --workspace=web              # dependencia de producción
   npm install -D vitest --workspace=mobile       # dependencia de desarrollo
   ```

   Antes de elegir una versión, revisa si otra app ya usa esa librería y **usa la misma versión**. Luego haz commit de `package.json` **y** de `package-lock.json`.

4. Los `node_modules` de cada app no se versionan. `package-lock.json` es **único** y está en la raíz del monorepo; no deben existir lockfiles dentro de `apps/*` ni de `packages/*`.

---

## 4. Instalación desde cero

### 4.1 Clonar y ubicarse en la carpeta correcta (PowerShell)

```powershell
git clone https://github.com/Mtipla/EMRGEN.git
Set-Location -LiteralPath ".\EMRGEN\Fase 2\Evidencias Proyecto\Evidencias de sistema Aplicación"
```

### 4.2 Verificar versiones

```powershell
node -v   # debe mostrar v24.21.0
npm -v    # debe mostrar 11.19.x
```

Si aparece `npm warn EBADDEVENGINES`, tu Node o npm no coincide con la versión del proyecto. Es solo un aviso y no bloquea la instalación, pero instala Node 24.21.0 para evitar diferencias.

### 4.3 Crear el archivo `.env`

El `.env` **no se sube a Git**. Créalo en esta misma carpeta con las siguientes claves:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=3000
AUTH0_ISSUER_URL=
AUTH0_AUDIENCE=
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
SENDGRID_API_KEY=
GOOGLE_MAPS_API_KEY=
```

### 4.4 Instalar dependencias

```powershell
npm ci
```

`npm ci` instala **exactamente** lo que dice `package-lock.json`, sin modificarlo. Úsalo después de cada `git pull`. Usa `npm install` solo cuando agregues o cambies dependencias.

---

## 5. Limpieza profunda (cuando algo "se rompe" sin explicación)

Úsala si aparecen errores como `Cannot find module`, `ERESOLVE`, binarios nativos que no cargan, tipos duplicados de React, o después de cambiar de rama con dependencias distintas.

Pega el bloque completo en **PowerShell**, ubicado en la carpeta del monorepo (paso 4.1):

```powershell
# 0. Confirmar que estamos en la raíz del monorepo
if (-not (Test-Path .\turbo.json)) { throw "Ubícate en 'Fase 2\Evidencias Proyecto\Evidencias de sistema Aplicación' antes de continuar." }

# 1. Limpiar la caché global de npm
npm cache clean --force

# 2. Borrar node_modules, .turbo, dist y build en la raíz y en cada apps/* y packages/*
#    Se usa 'rmdir /s /q' a propósito: npm crea "junctions" de Windows hacia los workspaces
#    (node_modules\backend -> apps\backend), y Remove-Item -Recurse podría entrar en ellas y borrar código fuente.
$dirs = @('.') + (Get-ChildItem -Path apps, packages -Directory | ForEach-Object { Join-Path $_.Parent.Name $_.Name })
foreach ($d in $dirs) {
  foreach ($t in 'node_modules', '.turbo', 'dist', 'build') {
    $p = Join-Path $d $t
    if (Test-Path -LiteralPath $p) { Write-Output "Eliminando $p"; cmd /c rmdir /s /q "$p" }
  }
}

# 3. Borrar lockfiles (el de la raíz y cualquiera creado por error dentro de apps/packages)
Get-ChildItem -Path . , apps\*, packages\* -Filter package-lock.json -File | Remove-Item -Force

# 4. Regenerar un package-lock.json unificado y limpio
npm install

# 5. Verificar que todo compila
npx turbo run build
```

> **Importante sobre el paso 3:** al regenerar el lockfile, las dependencias directas quedan idénticas porque están fijadas, pero las dependencias *transitivas* pueden subir de versión. Si solo quieres reparar tu instalación local, **omite el paso 3 y cambia `npm install` por `npm ci`** en el paso 4. Regenera el lockfile solo cuando sea necesario, hazlo **una sola persona** y haz commit del nuevo `package-lock.json` para que los demás ejecuten `npm ci`.

---

## 6. Ejecutar las aplicaciones en desarrollo

Desde la raíz del monorepo:

| App | Comando | URL |
|---|---|---|
| Web | `npx turbo run dev --filter=web` | la que indique Vite (por defecto `http://localhost:5173`) |
| Móvil | `npx turbo run dev --filter=mobile` | la que indique Vite |
| Escritorio | `npx turbo run dev --filter=desktop` | la que indique Vite |
| Backend (sin Docker) | `npm run start:dev --workspace=backend` | `http://localhost:3000` |

Otros comandos útiles:

```powershell
npx turbo run build                       # compila todo
npx turbo run build --filter=backend      # compila solo una app
npx turbo run lint                        # lint de todo el monorepo
npm run test --workspace=backend          # tests unitarios del backend (Jest)
npm run test:e2e --workspace=backend      # tests e2e del backend
npx --workspace=mobile vitest run         # tests unitarios de la app móvil
```

---

## 7. Docker: base de datos + backend

Requiere Docker Desktop abierto y en ejecución. Todos los comandos se ejecutan desde la raíz del monorepo (donde está `docker-compose.yml`) y necesitan el `.env` del paso 4.3.

### 7.1 Levantar (o reconstruir tras cambios)

```powershell
docker compose up --build -d
```

### 7.2 Verificar

```powershell
docker compose ps                   # ambos contenedores deben estar "Up"
docker compose logs backend --tail 20
curl.exe http://localhost:3001      # debe responder: Hello World!
```

| Servicio | Contenedor | Puerto en tu PC |
|---|---|---|
| PostgreSQL 15 | `postgres_emergen_db` | `localhost:5433` |
| Backend NestJS | `nestjs_emergen_backend` | `localhost:3001` |

### 7.3 Apagar sin perder datos

```powershell
docker compose down
```

### 7.4 Reinicio LIMPIO: ⚠️ ELIMINA TODOS LOS DATOS DE LAS TABLAS

```powershell
docker compose down -v
docker compose up --build -d
```

Al recrear el volumen, `init.sql` vuelve a crear el esquema vacío. Para cargar datos de prueba, sigue [README_BDD.md](README_BDD.md).

Si modificas contenedores o volúmenes, sigue este orden: **bajar el contenedor → hacer los cambios → levantar el contenedor**.

### 7.5 Cómo está construida la imagen (para no romperla)

- Todas las etapas usan `node:24.21.0-alpine`, la misma versión de Node del entorno local. Esa imagen ya trae npm 11.19.0.
- `turbo prune backend --docker` copia a la imagen **solo** el backend y sus dependencias. Electron, Cypress y el resto de las apps no entran.
- La etapa final instala solo dependencias de producción (`npm ci --omit=dev`) y se ejecuta con el usuario `node`, que no es root.
- `.dockerignore` impide que el `node_modules` de Windows se copie al contenedor Linux. **No lo borres**: sin él, los binarios nativos (`bcrypt`, `turbo`, etc.) quedarían compilados para la plataforma equivocada.

---

## 8. Solución de problemas

| Síntoma | Causa | Solución |
|---|---|---|
| `npm warn EBADDEVENGINES` | Tu Node/npm no es 24.21.0 / 11.19.x | Es solo un aviso (`onFail: "warn"`). Instala Node 24.21.0. |
| Turbo: `devEngines.packageManager.version must only allow versions within one major version` | Alguien cambió el rango de npm a algo como `>=11.19.0` | Turborepo exige un rango dentro de una sola versión mayor. Déjalo en `^11.19.0`. |
| `npm warn install-scripts ... not yet covered by allowScripts` | Aviso informativo de npm 11 | No bloquea: los scripts se ejecutan igual. Se puede ignorar. |
| `ERESOLVE could not resolve` | Una dependencia nueva choca con otra versión del árbol | Usa la misma versión que ya usan las demás apps (sección 3). **No uses** `--force` ni `--legacy-peer-deps`. |
| Muchos errores de tipos de React / "Invalid hook call" | Hay dos copias de React | Ejecuta la limpieza profunda (sección 5). |
| Cypress: `binary not installed` | Falta el binario en `%LOCALAPPDATA%\Cypress` | `npx --workspace=mobile cypress install` |
| El backend en Docker no arranca | Falta `.env` o los puertos 3001/5433 están ocupados | Revisa `docker compose logs backend` y el paso 4.3. |
| Algo sigue fallando tras `git pull` | `node_modules` desactualizado | `npm ci`. Si no basta, limpieza profunda (sección 5). |




# =====================================================================
# EMERGEN: plantilla de variables de entorno
# Copia este archivo como .env (si es que no esta creada en el equipo) y reemplaza los
# marcadores <INSERT_...>. El .env NO se sube a Git.
# Guía completa de cada API: readme-apis.md
# =====================================================================

# ---------- Base de datos (PostgreSQL en Docker) ----------
DB_HOST=localhost
DB_PORT=5433
DB_USER=<INSERT_YOUR_DB_USER_HERE>
DB_PASSWORD=<INSERT_YOUR_DB_PASSWORD_HERE>
DB_NAME=<INSERT_YOUR_DB_NAME_HERE>

# ---------- Backend ----------
PORT=3000
# Orígenes de los frontends autorizados a llamar al backend (separados por coma).
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175

# ---------- Auth0 ----------
AUTH0_ISSUER_URL=<INSERT_YOUR_AUTH0_ISSUER_URL_HERE>
AUTH0_AUDIENCE=<INSERT_YOUR_AUTH0_AUDIENCE_HERE>

# =====================================================================
# SECRETOS DE BACKEND: nunca usar el prefijo VITE_ con estas variables
# =====================================================================

# ---------- 1. PayPal REST API ----------
# "sandbox" para pruebas, "live" para cobros reales.
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=<INSERT_YOUR_PAYPAL_CLIENT_ID_HERE>
PAYPAL_SECRET=<INSERT_YOUR_PAYPAL_SECRET_HERE>

# ---------- 2. Twilio SendGrid Email Validation ----------
# Key con permiso "Email Address Validation". Si se deja vacía se usa SENDGRID_API_KEY.
SENDGRID_VALIDATION_API_KEY=<INSERT_YOUR_SENDGRID_EMAIL_VALIDATION_API_KEY_HERE>
# Key general de SendGrid (envío de correos con @sendgrid/mail).
SENDGRID_API_KEY=<INSERT_YOUR_SENDGRID_API_KEY_HERE>

# ---------- 3. jsReport ----------
# Backend fuera de Docker (npm run start:dev):
JSREPORT_URL=http://localhost:5488
# Backend dentro de Docker (docker compose); "localhost" sería el propio contenedor:
JSREPORT_URL_DOCKER=http://host.docker.internal:5488
# Solo si el servidor jsReport tiene la autenticación activada.
JSREPORT_USERNAME=<INSERT_YOUR_JSREPORT_USERNAME_HERE>
JSREPORT_PASSWORD=<INSERT_YOUR_JSREPORT_PASSWORD_HERE>

# ---------- 4. Google Maps Platform (key de SERVIDOR: Geocoding API) ----------
GOOGLE_MAPS_API_KEY=<INSERT_YOUR_GOOGLE_MAPS_SERVER_API_KEY_HERE>

# =====================================================================
# VARIABLES PÚBLICAS DE FRONTEND (web, mobile, desktop)
# Todo lo que empieza con VITE_ queda visible en el navegador.
# =====================================================================
VITE_API_URL=http://localhost:3000
# El Client ID de PayPal es público (el SECRET no).
VITE_PAYPAL_CLIENT_ID=<INSERT_YOUR_PAYPAL_CLIENT_ID_HERE>
# Key de NAVEGADOR, restringida por dominio (distinta de la key de servidor).
VITE_GOOGLE_MAPS_API_KEY=<INSERT_YOUR_GOOGLE_MAPS_BROWSER_API_KEY_HERE>
# Map ID de Google Cloud (opcional; si falta se usa DEMO_MAP_ID).
VITE_GOOGLE_MAPS_MAP_ID=<INSERT_YOUR_GOOGLE_MAPS_MAP_ID_HERE>