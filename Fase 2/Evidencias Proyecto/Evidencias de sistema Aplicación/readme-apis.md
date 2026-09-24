# EMERGEN: integración de APIs externas

Guía para el equipo sobre las cuatro APIs externas del proyecto: para qué sirve cada una, cómo conseguir las credenciales, cómo configurarlas y cómo usar los servicios ya implementados.

| # | API | Uso en EMERGEN | Dónde vive el código |
|---|---|---|---|
| 1 | **PayPal REST API** (Orders v2) | Cobro de planes y suscripciones | `apps/backend/src/integrations/paypal/` |
| 2 | **Twilio SendGrid Email Validation** | Verificar que un correo existe antes de guardarlo | `apps/backend/src/integrations/sendgrid/` |
| 3 | **jsReport** | Generar reportes PDF (alertas, ventas, bitácora) | `apps/backend/src/integrations/jsreport/` |
| 4 | **Google Maps Platform** | Mostrar mapas y convertir coordenadas GPS en direcciones | `apps/backend/src/integrations/google-maps/` y `packages/api-client/` |

> Todos los comandos se ejecutan en la raíz del monorepo (`Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/`), igual que en el [README principal](README.md).

---

### Archivos principales

| Paquete / carpeta | Contenido |
|---|---|
| `packages/api-types` | Contratos (solo tipos) de requests y responses. |
| `packages/api-client` | `createEmergenApi()` (cliente del backend), `downloadBlob()`, `createMap()`/`addMarker()` (Google Maps) y `renderPaypalButtons()` (PayPal JS SDK). |
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

Si ya tienes uno, **no lo sobrescribas**. Abre `.env.example` y copia a tu `.env` las claves que te falten (`PAYPAL_MODE`, `SENDGRID_VALIDATION_API_KEY`, `JSREPORT_*`, `CORS_ORIGINS`, `VITE_*`).

Luego reemplaza cada marcador `<INSERT_..._HERE>` por el valor real (secciones 3 a 6). Si un valor se deja con el marcador, se trata igual que una variable vacía: la integración responde `503` en vez de enviar el texto del marcador al proveedor.

### 1.2 Referencia de variables

| Variable | Dónde se usa | ¿Secreta? | Descripción |
|---|---|---|---|
| `PAYPAL_MODE` | backend | no | `sandbox` (pruebas) o `live` (cobros reales). |
| `PAYPAL_CLIENT_ID` | backend | no* | Client ID de la app de PayPal. |
| `PAYPAL_SECRET` | backend | **sí** | Secret de la app de PayPal. |
| `SENDGRID_VALIDATION_API_KEY` | backend | **sí** | Key con permiso *Email Address Validation*. Si falta, se usa `SENDGRID_API_KEY`. |
| `SENDGRID_API_KEY` | backend | **sí** | Key general de SendGrid (envío de correos). |
| `JSREPORT_URL` | backend (local) | no | URL del servidor jsReport. Por defecto `http://localhost:5488`. |
| `JSREPORT_URL_DOCKER` | backend (Docker) | no | URL de jsReport vista desde el contenedor. Por defecto `http://host.docker.internal:5488`. |
| `JSREPORT_USERNAME` / `JSREPORT_PASSWORD` | backend | **sí** | Solo si jsReport tiene la autenticación activada. |
| `GOOGLE_MAPS_API_KEY` | backend | **sí** | Key de **servidor** (Geocoding API). |
| `CORS_ORIGINS` | backend | no | Orígenes de los frontends, separados por coma. |
| `VITE_API_URL` | frontends | no | URL del backend: `http://localhost:3000` local, `http://localhost:3001` Docker. |
| `VITE_PAYPAL_CLIENT_ID` | frontends | no | Mismo Client ID de PayPal (es público). |
| `VITE_GOOGLE_MAPS_API_KEY` | frontends | no* | Key de **navegador**, restringida por dominio. |
| `VITE_GOOGLE_MAPS_MAP_ID` | frontends | no | Map ID (opcional; por defecto `DEMO_MAP_ID`). |

\* Son públicas por diseño, pero igual se configuran por entorno y no se escriben en el código.

>  **Nunca pongas el prefijo `VITE_` a un secreto** (`PAYPAL_SECRET`, keys de SendGrid, key de servidor de Google). Todo lo que tiene `VITE_` queda dentro del JavaScript que descarga el navegador.

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

## 3. Twilio SendGrid Email Validation

### 3.1 Para qué sirve

Verifica, **antes de guardar un correo**, que la dirección existe y puede recibir mensajes. Detecta errores de tipeo (`gmial.com` → sugiere `gmail.com`), dominios inexistentes y correos desechables. Sirve para el registro de usuarios (`USUARIO.correo_usuario`), los contactos de emergencia y el formulario de contacto (`MENSAJE_CONTACTO.correo_remitente`). En un sistema de alertas, un correo mal escrito significa una alerta que nunca llega.

### 3.2 Obtener las credenciales

1. Crea una cuenta en <https://sendgrid.com>. **Email Validation solo está disponible en los planes Pro o superiores**; confírmalo en la página de precios de SendGrid.
2. En el panel ve a **Settings → API Keys → Create API Key**.
3. Elige **Custom Access** y activa **Email Address Validation → Full Access**. Esta key es distinta de la key de envío de correos: SendGrid pide una key dedicada para validación.
4. Copia la key (empieza con `SG.`). **SendGrid la muestra una sola vez.**

```env
SENDGRID_VALIDATION_API_KEY=<INSERT_YOUR_SENDGRID_EMAIL_VALIDATION_API_KEY_HERE>
```

### 3.3 Endpoint

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| `POST` | `/email/validate` | `{ email, source?: "registro-web" }` | `{ email, verdict: "Valid" \| "Risky" \| "Invalid", score, isValid, suggestion? }` |

El backend rechaza con `400` los correos con formato inválido **antes** de llamar a SendGrid. Así no se gastan créditos de validación.

### 3.4 Ejemplos

**Frontend (formulario de registro):**

```ts
import { api } from './lib/api'

const check = await api.email.validate({ email, source: 'registro-mobile' })
if (check.verdict === 'Invalid') {
  setError(check.suggestion ? `¿Quisiste decir ...@${check.suggestion}?` : 'Este correo no existe')
}
```

**Desde otro servicio del backend:**

```ts
// usuarios.module.ts
@Module({ imports: [SendgridModule], providers: [UsuariosService] })

// usuarios.service.ts
constructor(private readonly emailValidation: EmailValidationService) {}

async registrar(dto: CrearUsuarioDto) {
  const { verdict } = await this.emailValidation.validate({ email: dto.correo, source: 'registro' });
  if (verdict === 'Invalid') throw new BadRequestException('El correo no existe');
  // ...guardar usuario
}
```

**Probar (PowerShell):**

```powershell
curl.exe -X POST http://localhost:3000/email/validate -H "Content-Type: application/json" -d '{\"email\":\"prueba@gmial.com\"}'
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

## 6. Errores comunes

| Respuesta / síntoma | Causa | Solución |
|---|---|---|
| `503` "… no está configurado: define X en el archivo .env" | Falta la variable o todavía tiene el marcador `<INSERT_…>` | Completa el `.env` y reinicia el backend (sección 2.3). |
| `502` "… rechazó la solicitud (HTTP 401/403)" | Credencial incorrecta, vencida o sin permisos | Revisa el log del backend (`docker compose logs backend`), que muestra el detalle del proveedor. |
| `502` "jsReport: no se pudo contactar al proveedor" | El servidor jsReport no está corriendo o la URL es incorrecta | Levanta jsReport (sección 5.2). Si el backend corre en Docker, revisa `JSREPORT_URL_DOCKER`. |
| `502` "Google Maps rechazó la solicitud (REQUEST_DENIED)" | Geocoding API no habilitada, sin facturación o key restringida a otra IP | Revisa los pasos 2 a 4 de la sección 6.2. |
| `400` con lista de mensajes | El body no cumple el DTO (formato de correo, monto, etc.) | Corrige el request; el mensaje indica el campo. |
| Error de CORS en la consola del navegador | El origen del frontend no está en `CORS_ORIGINS` | Agrega la URL de Vite (ej. `http://localhost:5174`) y reinicia el backend. |
| El mapa muestra "This page can't load Google Maps correctly" | Key de navegador sin el dominio/puerto actual en los referentes | Agrega el origen en la consola de Google (sección 6.2, paso 4). |
| La app móvil en el teléfono no llega al backend | `localhost` en el teléfono es el propio teléfono | Usa `VITE_API_URL=http://<IP-de-tu-PC>:3000`. |

---

## . Tests

Los servicios del backend tienen tests unitarios con `fetch` simulado. **No necesitan credenciales reales:**

```powershell
npm run test --workspace=backend
```
