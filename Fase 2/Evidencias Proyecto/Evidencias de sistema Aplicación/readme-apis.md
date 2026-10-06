# EMERGEN: integración de APIs externas

Guía para el equipo sobre las seis integraciones externas del proyecto: para qué sirve cada una, cómo conseguir las credenciales, cómo configurarlas y cómo usar los servicios ya implementados.

| # | API | Uso en EMERGEN | Dónde vive el código |
|---|---|---|---|
| 1 | **PayPal REST API** (Orders v2) | Cobro de planes y suscripciones | `apps/backend/src/integrations/paypal/` |
| 2 | **Firebase Authentication** | Registro e inicio de sesión; el backend verifica el ID token | `apps/backend/src/integrations/firebase-auth/` y `packages/api-client/src/firebase-auth.ts` |
| 3 | **jsReport** | Generar reportes PDF (alertas, ventas, bitácora) | `apps/backend/src/integrations/jsreport/` |
| 4 | **Google Maps Platform** | Mostrar mapas y convertir coordenadas GPS en direcciones | `apps/backend/src/integrations/google-maps/` y `packages/api-client/` |
| 5 | **mindicador API** | Indicadores económicos de Chile (UF, dólar) para mostrar precios en CLP | `apps/backend/src/integrations/mindicador/` |
| 6 | **WhatsApp (Baileys)** | Notificaciones de emergencia a los contactos: mensaje, ubicación e información médica | `apps/backend/src/integrations/whatsapp/` |

> Todos los comandos se ejecutan en la raíz del monorepo (`Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/`), igual que en el [README principal](README.md).

---

### Archivos principales

| Paquete / carpeta | Contenido |
|---|---|
| `packages/api-types` | Contratos (solo tipos) de requests y responses. |
| `packages/api-client` | `createEmergenApi()` (cliente del backend), `downloadBlob()`, `createMap()`/`addMarker()` (Google Maps) y `renderPaypalButtons()` (PayPal JS SDK) y `createFirebaseAuth()` (Firebase Auth REST). |
| `packages/ui` | Componentes React `MapView` y `PaypalButton`. |
| `apps/{web,mobile,desktop}/src/lib/api.ts` | Instancia `api` y objeto `env` con las variables `VITE_*` de cada app. |
| `apps/backend/src/config/env.ts` | Carga del `.env` y helpers `readEnv()`/`requireEnv()`. |
| `.env.example` | Plantilla con todas las variables y marcadores `<INSERT_..._HERE>`. |

---

## 1. Configurar las variables de entorno

Hay **un solo `.env`**, en la raíz del monorepo. Lo leen:

- el backend con `npm run start:dev --workspace=backend` (`main.ts` busca `../../.env`);
- Docker Compose, que pasa las variables al contenedor del backend;
- Vite (web, mobile, desktop) gracias a `envDir: '../../'`. **Vite solo expone las variables que empiezan con `VITE_`.**

### 1.1 Crear o completar el `.env`

Si todavía no tienes `.env`:

```powershell
Copy-Item .env.example .env
```

Si ya tienes uno, **no lo sobrescribas**. Abre `.env.example` y copia a tu `.env` las claves que te falten (`PAYPAL_MODE`, `FIREBASE_PROJECT_ID`, `JSREPORT_*`, `MINDICADOR_API_URL`, `CORS_ORIGINS`, `WHATSAPP_*`, `VITE_*`).

Luego reemplaza cada marcador `<INSERT_..._HERE>` por el valor real (secciones 2 a 6). Si un valor se deja con el marcador, se trata igual que una variable vacía: la integración responde `503` en vez de enviar el texto del marcador al proveedor.

### 1.2 Referencia de variables

| Variable | Dónde se usa | ¿Secreta? | Descripción |
|---|---|---|---|
| `PAYPAL_MODE` | backend | no | `sandbox` (pruebas) o `live` (cobros reales). |
| `PAYPAL_CLIENT_ID` | backend | no* | Client ID de la app de PayPal. |
| `PAYPAL_SECRET` | backend | **sí** | Secret de la app de PayPal. |
| `FIREBASE_PROJECT_ID` | backend | no | ID del proyecto Firebase; se usa para verificar los ID tokens. |
| `JSREPORT_URL` | backend (local) | no | URL del servidor jsReport. Por defecto `http://localhost:5488`. |
| `JSREPORT_URL_DOCKER` | backend (Docker) | no | URL de jsReport vista desde el contenedor. Por defecto `http://host.docker.internal:5488`. |
| `JSREPORT_USERNAME` / `JSREPORT_PASSWORD` | backend | **sí** | Solo si jsReport tiene la autenticación activada. |
| `GOOGLE_MAPS_API_KEY` | backend | **sí** | Key de **servidor** (Geocoding API). |
| `MINDICADOR_API_URL` | backend | no | Opcional. Por defecto `https://mindicador.cl/api` (sin key). |
| `CORS_ORIGINS` | backend | no | Orígenes de los frontends, separados por coma. |
| `WHATSAPP_ENABLED` | backend | no | `true` conecta WhatsApp al arrancar. Por defecto `false` (la integración responde `503`). |
| `WHATSAPP_AUTH_DIR` | backend (local) | **la carpeta sí** | Carpeta de la sesión. Por defecto `auth_info_baileys` (en `apps/backend/`). En Docker es un volumen. |
| `WHATSAPP_DEFAULT_COUNTRY_CODE` | backend | no | Código de país para números sin `+` de 9 dígitos o menos. Por defecto `56` (Chile). |
| `VITE_API_URL` | frontends | no | URL del backend: `http://localhost:3000` local, `http://localhost:3001` Docker. |
| `VITE_PAYPAL_CLIENT_ID` | frontends | no | Mismo Client ID de PayPal (es público). |
| `VITE_GOOGLE_MAPS_API_KEY` | frontends | no* | Key de **navegador**, restringida por dominio. |
| `VITE_GOOGLE_MAPS_MAP_ID` | frontends | no | Map ID (opcional; por defecto `DEMO_MAP_ID`). |
| `VITE_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID`, `_MEASUREMENT_ID` | frontends | no* | Config web de Firebase (Consola → Configuración del proyecto → Tus apps). |

\* Son públicas por diseño, pero igual se configuran por entorno y no se escriben en el código.

>  **Nunca pongas el prefijo `VITE_` a un secreto** (`PAYPAL_SECRET`, key de servidor de Google). Todo lo que tiene `VITE_` queda dentro del JavaScript que descarga el navegador.

### 1.3 Aplicar los cambios

- **Backend local:** reinicia `npm run start:dev --workspace=backend`.
- **Backend en Docker:** `docker compose up -d` recrea el contenedor con las variables nuevas. No hace falta `--build` si solo cambiaste el `.env`.
- **Frontends:** reinicia `npx turbo run dev --filter=web` (o `mobile` / `desktop`). Vite lee el `.env` solo al arrancar.
- Después de hacer `git pull` de estos cambios, ejecuta `npm ci`: hay dos workspaces nuevos (`@repo/api-types` y `@repo/api-client`).

---

## 2. PayPal REST API

### 2.1 Para qué sirve

Cobra los planes de EMERGEN (tablas `PLAN`, `VENTA` y `DETALLE_VENTA`). El flujo es el estándar de PayPal Checkout:

1. El frontend muestra los botones de PayPal (`PaypalButton`).
2. Al hacer clic, el frontend llama a `POST /payments/paypal/orders` y **el backend crea la orden** con el secret.
3. El comprador aprueba el pago en la ventana de PayPal.
4. El frontend llama a `POST /payments/paypal/orders/:orderId/capture` y **el backend captura el cobro**. Una respuesta con `status: "COMPLETED"` confirma el pago.

### 2.2 Obtener las credenciales

1. Entra a <https://developer.paypal.com> e inicia sesión con una cuenta PayPal (sirve una cuenta personal para el sandbox).
2. Ve a **Apps & Credentials** y deja el selector en **Sandbox**.
3. Haz clic en **Create App**, ponle un nombre (ej. `EMERGEN`) y elige tipo **Merchant**.
4. Copia el **Client ID** y el **Secret**.
5. En **Testing Tools → Sandbox Accounts** están las cuentas de prueba: usa la cuenta *Personal* para "comprar" en el sandbox.
6. Para producción, cambia el selector a **Live** (requiere una cuenta PayPal Business verificada), crea otra app y usa `PAYPAL_MODE=live`.

```env
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=<INSERT_YOUR_PAYPAL_CLIENT_ID_HERE>
PAYPAL_SECRET=<INSERT_YOUR_PAYPAL_SECRET_HERE>
VITE_PAYPAL_CLIENT_ID=<INSERT_YOUR_PAYPAL_CLIENT_ID_HERE>
```

> **Moneda:** PayPal **no admite pesos chilenos (CLP)**. Los precios deben cobrarse en una moneda soportada (por defecto `USD`).

### 2.3 Endpoints

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| `POST` | `/payments/paypal/orders` | `{ amount: "9.99", currency?: "USD", description?, referenceId? }` | `{ id, status, approveUrl }` |
| `POST` | `/payments/paypal/orders/:orderId/capture` | — | `{ orderId, status, captureId, amount, payerEmail }` |

### 2.4 Ejemplos

**Frontend con componente (web, mobile o desktop):**

```tsx
import { PaypalButton } from '@repo/ui/paypal-button'
import { api, env } from './lib/api'

<PaypalButton
  api={api}
  clientId={env.paypalClientId}
  order={{ amount: '9.99', currency: 'USD', description: 'Plan Premium mensual', referenceId: 'plan-2' }}
  onPaid={(result) => {
    if (result.status === 'COMPLETED') console.log('Pago confirmado', result.captureId)
  }}
  onError={(err) => console.error(err)}
/>
```

**Frontend sin componente:**

```ts
const order = await api.paypal.createOrder({ amount: '9.99' })
window.location.href = order.approveUrl!          // el comprador aprueba en PayPal
// ...al volver:
const result = await api.paypal.captureOrder(order.id)
```

**Probar el backend (PowerShell):**

```powershell
curl.exe -X POST http://localhost:3000/payments/paypal/orders -H "Content-Type: application/json" -d '{\"amount\":\"9.99\"}'
```

> 🔒 **Pendiente antes de producción:** hoy el monto llega desde el cliente. Cuando existan las entidades TypeORM, `PaypalService.createOrder` debe recibir el `plan_ID` y leer el precio desde la tabla `PLAN` (ver el `TODO` en `paypal.service.ts`). Después de capturar el pago, registra la venta en `VENTA`.

---

## 3. Firebase Authentication

### 3.1 Para qué sirve

Registro e inicio de sesión de usuarios con correo y contraseña. El frontend obtiene un **ID token** (JWT, dura 1 hora) de Firebase y lo envía al backend en `Authorization: Bearer <idToken>`. El backend lo verifica con las claves públicas de Google (sin `firebase-admin` ni cuenta de servicio) y así sabe qué usuario hace cada petición.

### 3.2 Obtener las credenciales

1. Entra a <https://console.firebase.google.com> y crea un proyecto (ej. `emergen`).
2. **Build → Authentication → Comenzar** y habilita el proveedor **Correo electrónico/contraseña**.
3. **Configuración del proyecto (⚙️) → General**: copia el **ID del proyecto** y la **Clave de API web**.
4. En **Authentication → Configuración → Dominios autorizados** agrega los dominios de los frontends.

```env
FIREBASE_PROJECT_ID=<INSERT_YOUR_FIREBASE_PROJECT_ID_HERE>          # backend
VITE_FIREBASE_API_KEY=<INSERT_YOUR_FIREBASE_API_KEY_HERE>
VITE_FIREBASE_AUTH_DOMAIN=<INSERT_YOUR_FIREBASE_AUTH_DOMAIN_HERE>
VITE_FIREBASE_PROJECT_ID=<INSERT_YOUR_FIREBASE_PROJECT_ID_HERE>
VITE_FIREBASE_STORAGE_BUCKET=<INSERT_YOUR_FIREBASE_STORAGE_BUCKET_HERE>
VITE_FIREBASE_MESSAGING_SENDER_ID=<INSERT_YOUR_FIREBASE_MESSAGING_SENDER_ID_HERE>
VITE_FIREBASE_APP_ID=<INSERT_YOUR_FIREBASE_APP_ID_HERE>
VITE_FIREBASE_MEASUREMENT_ID=<INSERT_YOUR_FIREBASE_MEASUREMENT_ID_HERE>
```

### 3.3 Endpoint y piezas exportadas

| Método | Ruta | Header | Respuesta |
|---|---|---|---|
| `GET` | `/auth/me` | `Authorization: Bearer <idToken>` | `{ uid, email?, emailVerified, name?, signInProvider? }` o `401` |

| Dónde | Export | Uso |
|---|---|---|
| backend | `FirebaseAuthModule`, `FirebaseAuthService.verifyIdToken()`, `FirebaseAuthGuard` | Proteger endpoints propios. |
| `@repo/api-client` | `createFirebaseAuth(apiKey)` → `signUp`, `signIn`, `sendPasswordReset`, `refresh`; `FirebaseAuthError` | Login desde web, mobile y desktop (API REST de Firebase, sin instalar el SDK). |
| `@repo/api-client` | `initFirebase(config)` → `{ app, auth }`, `initFirebaseAnalytics(app)` | SDK oficial `firebase` (Auth de `firebase/auth`, Analytics). |
| `apps/*/src/lib/api.ts` | `firebase` (`firebase.auth`), `firebaseAuth`, `api.auth.me()` | Instancias listas para usar. |

### 3.4 Ejemplos

**Con el SDK oficial (`firebase`):**

```ts
import { signInWithEmailAndPassword } from 'firebase/auth'
import { api, firebase } from './lib/api'

const { user } = await signInWithEmailAndPassword(firebase.auth, email, password)
const me = await api.auth.me(await user.getIdToken())
```

**Frontend (login):**

```ts
import { FirebaseAuthError } from '@repo/api-client'
import { api, firebaseAuth } from './lib/api'

try {
  const session = await firebaseAuth.signIn(email, password)
  const user = await api.auth.me(session.idToken)   // verificado por el backend
} catch (e) {
  if (e instanceof FirebaseAuthError && e.code === 'INVALID_LOGIN_CREDENTIALS') setError('Credenciales inválidas')
}
```

**Proteger un endpoint del backend:**

```ts
// alertas.module.ts
@Module({ imports: [FirebaseAuthModule], controllers: [AlertasController] })

// alertas.controller.ts
@Get('mias')
@UseGuards(FirebaseAuthGuard)
mias(@Req() req: FirebaseRequest) {
  return this.alertas.porUsuario(req.firebaseUser!.uid)
}
```

**Probar (PowerShell):**

```powershell
curl.exe http://localhost:3000/auth/me -H "Authorization: Bearer <ID_TOKEN>"
```

---


## 4. jsReport

### 4.1 Para qué sirve

Genera reportes PDF a partir de plantillas HTML (Handlebars) y datos JSON. Por ejemplo: historial de alertas de un usuario, resumen mensual de ventas o bitácora del sistema para el panel administrativo (desktop). Las plantillas se diseñan en **jsReport Studio**, un editor web, sin tocar el código del backend.

### 4.2 Obtener el servidor y las credenciales

jsReport **no es un servicio con API key**: es un servidor que se ejecuta aparte. Hay dos opciones:

**Opción A: local con Docker (recomendada para desarrollo, gratis):**

```powershell
docker run -d --name jsreport -p 5488:5488 jsreport/jsreport
```

Abre <http://localhost:5488> (jsReport Studio). Por defecto no pide usuario ni contraseña.

**Opción B: jsreportonline (nube):**

1. Crea una cuenta en <https://jsreportonline.net>. El plan gratuito incluye una cantidad limitada de reportes al mes.
2. Tu servidor queda en `https://<tu-cuenta>.jsreportonline.net`. Usa el correo y la contraseña de la cuenta como credenciales.

```env
JSREPORT_URL=http://localhost:5488                       # o https://<tu-cuenta>.jsreportonline.net
JSREPORT_URL_DOCKER=http://host.docker.internal:5488     # backend en Docker + jsReport en tu PC
JSREPORT_USERNAME=<INSERT_YOUR_JSREPORT_USERNAME_HERE>   # solo si hay autenticación
JSREPORT_PASSWORD=<INSERT_YOUR_JSREPORT_PASSWORD_HERE>
```

### 4.3 Crear una plantilla

1. En Studio: **New → Template** y nómbrala, por ejemplo, `alertas-mensual`.
2. Engine: **handlebars**. Recipe: **chrome-pdf**.
3. Contenido de ejemplo:

   ```html
   <h1>Alertas de {{usuario}}</h1>
   <table>
     {{#each alertas}}
       <tr><td>{{fecha}}</td><td>{{ubicacion}}</td><td>{{prioridad}}</td></tr>
     {{/each}}
   </table>
   ```

4. Guarda. El backend la invoca por su nombre (`templateName`).

### 4.4 Endpoint

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| `POST` | `/reports` | `{ templateName: "alertas-mensual", data: {...}, fileName?: "alertas-marzo" }` | Archivo PDF (`Content-Disposition: attachment`) |

Por seguridad, el endpoint público **solo acepta nombres de plantillas ya guardadas en jsReport**, nunca HTML enviado por el cliente. Para plantillas escritas en el código, usa `JsreportService.renderInline()` desde el backend.

### 4.5 Ejemplos

**Frontend (web / desktop):**

```ts
import { downloadBlob } from '@repo/api-client'
import { api } from './lib/api'

const pdf = await api.reports.generate({
  templateName: 'alertas-mensual',
  data: { usuario: 'Ana', alertas: [{ fecha: '2026-09-01', ubicacion: 'Santiago', prioridad: 'Alta' }] },
})
downloadBlob(pdf, 'alertas-septiembre.pdf')
```

**Desde el backend:**

```ts
constructor(private readonly jsreport: JsreportService) {}

const { content } = await this.jsreport.renderTemplate('alertas-mensual', datos);
// content es un Buffer con el PDF: se puede adjuntar a un correo o guardar
```

**Probar (PowerShell):**

```powershell
curl.exe -X POST http://localhost:3000/reports -H "Content-Type: application/json" -d '{\"templateName\":\"alertas-mensual\",\"data\":{\"usuario\":\"Ana\",\"alertas\":[]}}' -o reporte.pdf
```

---

## 5. Google Maps Platform

### 5.1 Para qué sirve

- **Maps JavaScript API (frontend):** muestra en un mapa la ubicación de las alertas (`MapView`).
- **Geocoding API (backend):** convierte las coordenadas GPS que envía la app móvil (Capacitor) en una dirección legible para `UBICACION_ALERTA.ubicacion` (*reverse geocoding*), y convierte direcciones escritas en coordenadas.

Se usan **dos keys distintas**, porque se restringen de forma diferente:

| Key | Variable | Restricción de aplicación | Restricción de API |
|---|---|---|---|
| Servidor | `GOOGLE_MAPS_API_KEY` | Direcciones IP (la IP del servidor) | Geocoding API |
| Navegador | `VITE_GOOGLE_MAPS_API_KEY` | Referentes HTTP (dominios) | Maps JavaScript API |

### 5.2 Obtener las credenciales

1. Entra a <https://console.cloud.google.com> y crea un proyecto (ej. `emergen`).
2. **Activa la facturación** del proyecto. Google la exige aunque el uso quede dentro del crédito mensual gratuito.
3. En **APIs y servicios → Biblioteca**, habilita **Maps JavaScript API** y **Geocoding API**.
4. En **APIs y servicios → Credenciales → Crear credenciales → Clave de API**, crea **dos** keys:
   - **Key de servidor:** en *Restricciones de API*, deja solo **Geocoding API**. En *Restricciones de aplicación* elige **Direcciones IP** y agrega la IP del servidor (en desarrollo puedes dejarla sin restricción de aplicación temporalmente).
   - **Key de navegador:** en *Restricciones de API*, deja solo **Maps JavaScript API**. En *Restricciones de aplicación* elige **Sitios web** y agrega:
     - `http://localhost:5173/*` (y los demás puertos de Vite que uses);
     - el dominio de producción de la web;
     - para la app móvil compilada con Capacitor: `https://localhost/*` (Android) y `capacitor://localhost/*` (iOS).
5. (Opcional) En **Google Maps Platform → Administración de mapas** crea un **Map ID** de tipo JavaScript. Es necesario para los marcadores avanzados en producción; en desarrollo se usa `DEMO_MAP_ID`.

```env
GOOGLE_MAPS_API_KEY=<INSERT_YOUR_GOOGLE_MAPS_SERVER_API_KEY_HERE>
VITE_GOOGLE_MAPS_API_KEY=<INSERT_YOUR_GOOGLE_MAPS_BROWSER_API_KEY_HERE>
VITE_GOOGLE_MAPS_MAP_ID=<INSERT_YOUR_GOOGLE_MAPS_MAP_ID_HERE>
```

### 5.3 Endpoints (backend)

| Método | Ruta | Query | Respuesta |
|---|---|---|---|
| `GET` | `/maps/geocode` | `address=Plaza de Armas, Santiago` | `[{ formattedAddress, location: { lat, lng }, placeId }]` |
| `GET` | `/maps/reverse-geocode` | `lat=-33.4378&lng=-70.6504` | `[{ formattedAddress, location, placeId }]` |

Los resultados vienen en español y con preferencia por Chile (`language=es`, `region=cl`). Si no hay resultados se devuelve `[]`.

### 5.4 Ejemplos

**Mapa con marcadores (web, mobile o desktop):**

```tsx
import { MapView } from '@repo/ui/map-view'
import { SANTIAGO } from '@repo/api-client'
import { env } from './lib/api'

<MapView
  apiKey={env.googleMapsApiKey}
  mapId={env.googleMapsMapId}
  center={SANTIAGO}
  markers={[{ lat: -33.4378, lng: -70.6504, title: 'Alerta #12' }]}
  style={{ height: 300 }}
/>
```

**Dirección a partir del GPS (app móvil):**

```ts
import { api } from './lib/api'

const [lugar] = await api.maps.reverseGeocode({ lat: -33.4378, lng: -70.6504 })
console.log(lugar?.formattedAddress)   // "Plaza de Armas, Santiago, Región Metropolitana, Chile"
```

**Probar (PowerShell):**

```powershell
curl.exe "http://localhost:3000/maps/reverse-geocode?lat=-33.4378&lng=-70.6504"
```

---

## 6. mindicador API

### 6.1 Para qué sirve

<https://mindicador.cl> entrega los indicadores económicos de Chile (UF, dólar, euro, UTM, IPC, etc.). Sirve para mostrar el equivalente en CLP de los planes que PayPal cobra en USD (PayPal no admite CLP).

### 6.2 Credenciales

**No requiere API key.** La URL es configurable (opcional):

```env
MINDICADOR_API_URL=https://mindicador.cl/api
```

### 6.3 Endpoints (backend)

| Método | Ruta | Query | Respuesta |
|---|---|---|---|
| `GET` | `/indicators` | — | `[{ code, name, unit, series: [{ date, value }] }]` (valor del día) |
| `GET` | `/indicators/:code` | `date=24-09-2026` (opcional, `dd-mm-yyyy`) | `{ code, name, unit, series }` (último mes o el día pedido) |

Códigos válidos: `uf`, `ivp`, `dolar`, `dolar_intercambio`, `euro`, `ipc`, `utm`, `imacec`, `tpm`, `libra_cobre`, `tasa_desempleo`, `bitcoin`.

### 6.4 Ejemplos

**Frontend:**

```ts
import { api } from './lib/api'

const dolar = await api.indicators.get('dolar')
const precioClp = Math.round(9.99 * dolar.series[0].value)
```

**Desde el backend:**

```ts
@Module({ imports: [MindicadorModule], providers: [PlanesService] })

constructor(private readonly mindicador: MindicadorService) {}
const uf = await this.mindicador.get('uf');
```

**Probar (PowerShell):**

```powershell
curl.exe http://localhost:3000/indicators/uf
```

---

## 7. WhatsApp (Baileys): notificaciones de emergencia

### 7.1 Para qué sirve

Envía la alerta de emergencia (HU-08) por WhatsApp a los contactos del usuario (1 a 5), con:

- el **mensaje personalizado** del usuario;
- la **ubicación**: dirección, link de Google Maps y un pin de ubicación nativo de WhatsApp;
- la **información médica** (opcional): un resumen breve y/o un enlace a la ficha médica.

Usa [Baileys](https://github.com/WhiskeySockets/Baileys) (`@whiskeysockets/baileys`), que se conecta a WhatsApp por WebSocket como un "dispositivo vinculado" de un número normal. No necesita navegador ni API key: **la credencial es la sesión del número emisor**.

El módulo tiene tres piezas, cada una con una sola responsabilidad:

| Pieza | Archivo | Responsabilidad |
|---|---|---|
| `WhatsappConnectionService` | `whatsapp-connection.service.ts` | Sesión: conexión en segundo plano, QR / código de emparejamiento, reconexión con backoff, envío de bajo nivel. |
| `WhatsappAlertService` | `whatsapp-alert.service.ts` | **API pública para el resto del backend**: arma y envía la alerta a todos los contactos en paralelo, con reintentos (CA-08.1). |
| `WhatsappAuthStateStore` | `whatsapp-auth-state.store.ts` | Dónde se guarda la sesión. Hoy en archivos (`MultiFileAuthStateStore`); se puede cambiar por PostgreSQL sin tocar lo demás. |

> ⚠️ **Baileys no es una API oficial de WhatsApp.** Usa un **número dedicado** a EMERGEN (no uno personal): WhatsApp puede bloquear números que envían mensajes automáticos.

> 🔒 **La carpeta `auth_info_baileys/` equivale a la contraseña del número emisor.** Está en `.gitignore` y `.dockerignore`: nunca la subas al repositorio ni la compartas.

### 7.2 Configurar

```env
WHATSAPP_ENABLED=true
# Opcionales:
WHATSAPP_AUTH_DIR=auth_info_baileys
WHATSAPP_DEFAULT_COUNTRY_CODE=56
```

Con `WHATSAPP_ENABLED` distinto de `true`, el backend arranca igual y los endpoints responden `503`, como las demás integraciones sin configurar.

**La conexión no bloquea el arranque:** el backend levanta la API REST de inmediato y negocia la sesión de WhatsApp en segundo plano. Si WhatsApp se cae, reconecta solo (1 s, 2 s, 4 s… hasta 30 s).

### 7.3 Vincular el número emisor (una sola vez)

1. Arranca el backend con `WHATSAPP_ENABLED=true`. En el log aparece:
   `Sin sesión: escanea el QR (GET /notifications/whatsapp/qr) o pide un código (POST /notifications/whatsapp/pairing-code).`
2. Inicia sesión como **Administrador** para obtener un JWT (`POST /usuarios/login`).
3. Elige una opción:
   - **QR:** descarga `GET /notifications/whatsapp/qr` (PNG) y escanéalo desde el teléfono emisor: *WhatsApp → Dispositivos vinculados → Vincular un dispositivo*. El QR **cambia cada ~20 s**: si expira, vuelve a pedirlo.
   - **Código de emparejamiento** (sin cámara): `POST /notifications/whatsapp/pairing-code` con `{ "phoneNumber": "+569XXXXXXXX" }` (el número emisor). En el teléfono: *Dispositivos vinculados → Vincular con número de teléfono* e ingresa el código de 8 caracteres.
4. Confirma con `GET /notifications/whatsapp/status` → `"state": "open"`.

La sesión queda guardada y **sobrevive a los reinicios**: no hay que volver a escanear.

| Dónde corre el backend | Dónde queda la sesión |
|---|---|
| Local (`npm run start:dev --workspace=backend`) | `apps/backend/auth_info_baileys/` |
| Docker Compose | Volumen `volumen_emergen_whatsapp_auth`. Para desvincular a mano: `docker compose down` + `docker volume rm volumen_emergen_whatsapp_auth` |

Para **cambiar el número emisor**, usa `POST /notifications/whatsapp/logout`: borra la sesión y genera un QR nuevo. Si el número se desvincula desde el teléfono, el backend lo detecta, borra la sesión y también genera un QR nuevo.

### 7.4 Endpoints

Todos exigen `Authorization: Bearer <JWT>` de un usuario con rol **Administrador**.

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| `GET` | `/notifications/whatsapp/status` | — | `{ enabled, state, qrAvailable, phoneNumber?, lastError? }` |
| `GET` | `/notifications/whatsapp/qr` | — | PNG del QR, o `404` si no hay vinculación pendiente |
| `POST` | `/notifications/whatsapp/pairing-code` | `{ phoneNumber }` | `{ code }` |
| `POST` | `/notifications/whatsapp/logout` | — | Estado tras desvincular |
| `POST` | `/notifications/whatsapp/alerts` | `SendEmergencyAlertRequest` (abajo) | `201` con `EmergencyAlertResult` |

Estados (`state`): `disabled` · `connecting` · `waiting_for_link` (falta escanear el QR) · `open` (lista) · `closed` (detenida: sesión abierta en otra instancia o número bloqueado; revisar y reiniciar el backend).

**Body de una alerta** (tipos en `@repo/api-types`):

```jsonc
{
  "recipients": ["912345678", "+56987654321"],   // 1 a 5; 9 dígitos sin "+" → se antepone 56
  "senderName": "Ana Pérez",                     // opcional
  "message": "Me caí y no puedo levantarme",     // máx. 200 (USUARIO_MENSAJE_PERSONALIZADO)
  "location": { "lat": -33.4378, "lng": -70.6504, "address": "Plaza de Armas, Santiago" },
  "medicalInfo": {                               // opcional
    "summary": "Diabética tipo 1. Alergia a la penicilina.",
    "url": "https://emergen.cl/ficha/abc123"     // solo https
  }
}
```

**Respuesta:** un resultado por contacto. Si **un** contacto falla, los demás se envían igual:

```json
{
  "sentAt": "2026-10-06T19:40:00.000Z",
  "sent": 1,
  "failed": 1,
  "deliveries": [
    { "phoneNumber": "912345678", "status": "sent", "messageIds": ["3EB0A1...", "3EB0A2..."] },
    { "phoneNumber": "+56987654321", "status": "not_on_whatsapp", "messageIds": [] }
  ]
}
```

`status`: `sent` · `not_on_whatsapp` (el número no tiene WhatsApp) · `invalid_number` · `failed` (falló tras 3 intentos).

Cada contacto recibe dos mensajes: el texto de la alerta (que ya trae el link de Maps) y el pin de ubicación. Si solo falla el pin, el contacto igual cuenta como `sent`.

> 🩺 **Información médica:** todo lo que va en `summary` queda guardado en el chat del contacto y **no se puede revocar**. Para cumplir HU-12 (acceso solo mientras la emergencia está activa), prefiere enviar solo `url` con un enlace temporal y deja `summary` para datos mínimos que el usuario acepte compartir.

### 7.5 Usar el servicio desde otro módulo del backend

Así se integra en el flujo "Generar Alerta" (el futuro módulo de alertas). Se importa `WhatsappModule` y se inyecta `WhatsappAlertService`; no hace falta tocar la conexión:

```ts
// alertas.module.ts
import { WhatsappModule } from '../integrations/whatsapp/whatsapp.module';

@Module({ imports: [WhatsappModule /*, TypeOrmModule.forFeature([...]) */], providers: [AlertasService] })
export class AlertasModule {}
```

```ts
// alertas.service.ts
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { WhatsappAlertService } from '../integrations/whatsapp/whatsapp-alert.service';

@Injectable()
export class AlertasService {
  private readonly logger = new Logger(AlertasService.name);

  constructor(private readonly whatsapp: WhatsappAlertService) {}

  async notificarContactos(alertaId: number) {
    // 1. Leer de la BD: números de CONTACTO_EMERGENCIA, mensaje, ubicación y ficha médica.
    const contactos = ['912345678', '987654321']; // CONTACTO_EMERGENCIA.num_emergencia

    try {
      const resultado = await this.whatsapp.sendEmergencyAlert({
        recipients: contactos,
        senderName: 'Ana Pérez',
        message: 'Me caí y no puedo levantarme',
        location: { lat: -33.4378, lng: -70.6504, address: 'Plaza de Armas, Santiago' },
        medicalInfo: { url: `https://emergen.cl/ficha/${alertaId}` },
      });

      // 2. Registrar en BITACORA_SISTEMA los envíos fallidos (CA-08.1).
      for (const envio of resultado.deliveries.filter((d) => d.status !== 'sent'))
        this.logger.warn(`Alerta ${alertaId}: ${envio.phoneNumber} → ${envio.status}`);
      return resultado;
    } catch (error) {
      // 503: WhatsApp deshabilitado o sin sesión → usar el respaldo por SMS (HU-08).
      if (error instanceof ServiceUnavailableException) { /* fallback */ }
      throw error;
    }
  }
}
```

**Desde el panel de administración** (desktop/web), con `@repo/api-client`:

```ts
import { api } from './lib/api'

const estado = await api.whatsapp.status(jwt)
if (estado.state === 'waiting_for_link') {
  const qr = await api.whatsapp.qr(jwt)                 // Blob PNG
  imgElement.src = URL.createObjectURL(qr)             // volver a pedirlo cada ~20 s
}

// Alerta de prueba:
const resultado = await api.whatsapp.sendAlert(jwt, {
  recipients: ['912345678'],
  message: 'Prueba de alerta EMERGEN',
  location: { lat: -33.4378, lng: -70.6504 },
})
```

**Probar (PowerShell):**

```powershell
$jwt = "<JWT_DE_ADMINISTRADOR>"
curl.exe http://localhost:3000/notifications/whatsapp/status -H "Authorization: Bearer $jwt"
curl.exe http://localhost:3000/notifications/whatsapp/qr -H "Authorization: Bearer $jwt" -o qr.png
curl.exe -X POST http://localhost:3000/notifications/whatsapp/alerts -H "Authorization: Bearer $jwt" -H "Content-Type: application/json" -d '{\"recipients\":[\"912345678\"],\"message\":\"Prueba\",\"location\":{\"lat\":-33.4378,\"lng\":-70.6504}}'
```

---


## 8. Errores comunes

| Respuesta / síntoma | Causa | Solución |
|---|---|---|
| `503` "… no está configurado: define X en el archivo .env" | Falta la variable o todavía tiene el marcador `<INSERT_…>` | Completa el `.env` y reinicia el backend (sección 1.3). |
| `502` "… rechazó la solicitud (HTTP 401/403)" | Credencial incorrecta, vencida o sin permisos | Revisa el log del backend (`docker compose logs backend`), que muestra el detalle del proveedor. |
| `502` "jsReport: no se pudo contactar al proveedor" | El servidor jsReport no está corriendo o la URL es incorrecta | Levanta jsReport (sección 4.2). Si el backend corre en Docker, revisa `JSREPORT_URL_DOCKER`. |
| `502` "Google Maps rechazó la solicitud (REQUEST_DENIED)" | Geocoding API no habilitada, sin facturación o key restringida a otra IP | Revisa los pasos 2 a 4 de la sección 5.2. |
| `400` con lista de mensajes | El body no cumple el DTO (monto, código de indicador, fecha, etc.) | Corrige el request; el mensaje indica el campo. |
| `401` "ID token de Firebase inválido o expirado" | Token vencido (1 h) o de otro proyecto | Llama `firebaseAuth.refresh(refreshToken)` y revisa `FIREBASE_PROJECT_ID`. |
| Error de CORS en la consola del navegador | El origen del frontend no está en `CORS_ORIGINS` | Agrega la URL de Vite (ej. `http://localhost:5174`) y reinicia el backend. |
| El mapa muestra "This page can't load Google Maps correctly" | Key de navegador sin el dominio/puerto actual en los referentes | Agrega el origen en la consola de Google (sección 5.2, paso 4). |
| La app móvil en el teléfono no llega al backend | `localhost` en el teléfono es el propio teléfono | Usa `VITE_API_URL=http://<IP-de-tu-PC>:3000`. |
| `503` "WhatsApp no está conectado (estado: waiting_for_link)" | El número emisor no está vinculado | Vincúlalo con el QR o el código de emparejamiento (sección 7.3). |
| `404` en `/notifications/whatsapp/qr` | No hay QR pendiente: ya está vinculado (`open`) o todavía conectando | Revisa `GET /notifications/whatsapp/status`. |
| `state: "closed"` y log "Conexión detenida (código 440)" | La misma sesión se abrió en otra instancia (ej. backend local y Docker a la vez) | Deja una sola instancia con WhatsApp habilitado y reinicia el backend. |
| `state: "closed"` con código `403` | WhatsApp bloqueó el número emisor | Usa otro número dedicado y vuelve a vincular. |
| Docker: `EACCES` al guardar la sesión | El volumen se creó antes de existir la carpeta en la imagen | `docker compose build backend` y luego `docker volume rm volumen_emergen_whatsapp_auth`. |

---

## 9. Tests

Los tests simulan `fetch`, así que **no necesitan credenciales reales**:

```powershell
npm run test                                  # todo: backend (Jest) + packages/api-client (Vitest)
npm run test --workspace=backend              # servicios, http-client, Firebase y WhatsApp (unitarios)
npm run test:e2e --workspace=backend          # endpoints por HTTP: códigos 200/201/400/401/502/503
npm run test --workspace=@repo/api-client     # cliente del frontend, Firebase REST y botones PayPal
```

Para probar contra los proveedores **reales** con las credenciales del `.env` (PayPal solo en sandbox y sin capturar; jsReport tiene que estar corriendo):

```powershell
$env:LIVE_APIS=1; npm run test:e2e --workspace=backend -- integrations.live; Remove-Item Env:LIVE_APIS
```
