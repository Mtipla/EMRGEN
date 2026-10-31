# Resultados de ciberseguridad

Fecha: 2026-10-30. Referencia: OWASP API Security Top 10 (2023), OWASP Cheat Sheets (SQLi, Docker)
—guías vivas consultadas el 2026-10-30, usadas como lista de verificación, no como certificación.
Combina revisión estática (lectura de fuentes vía grafo Graphify + lectura directa) con
comprobaciones dinámicas seguras contra el entorno aislado.

Distinción usada: **CONFIRMADO** (demostrado con prueba), **INDICIO** (pendiente de validar),
**PREVENTIVO** (recomendación sin explotación demostrada).

## 1. Pruebas dinámicas de seguridad ejecutadas (13 casos, todos APROBADO)

Evidencia: `evidencias/casos-seguridad.jsonl`, `evidencias/03-pruebas-seguridad-salida.log`.

### Autenticación y sesión
- **JWT expirado** rechazado en ambas APIs (401); **firma con secreto distinto** rechazada (401);
  **issuer/audience incorrectos** rechazados (401). (`SEC-JWT-01/02/03`).
- **No enumeración de usuarios:** correo inexistente y contraseña incorrecta devuelven el mismo
  mensaje (`SEC-ENUM-01`). El código usa además un hash ficticio para igualar tiempos.

### Autorización / IDOR / BOLA (OWASP API1/API5)
- `/admin/*` denegado a usuario común (403) y sin token (401); `/admin/usuarios/planes` solo
  ADMINISTRADOR, no SOPORTE; admin no puede cambiar su propio estado (`SEC-AUTHZ-01…06`).
- **El rol del JWT no se respeta:** un token forjado con `rol_ID:1` sigue recibiendo 403 porque
  el servidor relee rol/estado de la BD en cada petición (`SEC-BOLA-04`). Control clave de RNF4.
- Un usuario **no** modifica/borra contactos ajenos (`SEC-IDOR-01/02`), **no** lee ticket ajeno
  (404, `SEC-IDOR-03`), **no** lee alerta ajena (404, `SEC-IDOR-04`); en FastAPI un no-staff que
  falsea `usuario_id` en el historial solo ve lo suyo (`SEC-BOLA-03`). No se puede eliminar cuentas
  siendo usuario común (`SEC-BOLA-02`).

### Inyección y XSS
- **SQLi:** payload `' OR '1'='1` en login no autentica ni rompe; payload destructivo en nombre
  de contacto se almacena como literal y la tabla sigue existiendo (parametrización confirmada);
  filtro de estado con payload se rechaza por allowlist del DTO (`SEC-SQLI-01/02/03`).
- **XSS almacenado:** `<script>` en el mensaje SOS se guarda y devuelve como dato; la respuesta es
  `application/json` con `X-Content-Type-Options: nosniff` (no ejecutable en el servidor;
  `SEC-XSS-01/02`). La neutralización en el cliente React es responsabilidad del render (no se
  probó en UI viva).

### Límites, cabeceras y asignación masiva (PRE-SEC-006/011)
- Cuerpo JSON excesivo → **413**; `Content-Type` no JSON → **415**; `__proto__`/estructura
  peligrosa → **400** antes del negocio (`SEC-LIM-01/02/03`).
- Registro con `rol_id`/`estado_id` extra → **400** (`forbidNonWhitelisted`, anti mass-assignment;
  `SEC-MASSASSIGN-01`).
- Cabeceras presentes: `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`,
  `Cache-Control: no-store`; `X-Powered-By` deshabilitado (`SEC-HDR-01`).
- **Rate-limit activo:** ráfaga a `/compras/precio` termina en **429 con `Retry-After`**
  (`SEC-RATE-01`).
- CORS: origen permitido recibe su ACAO; origen malicioso no (`SEC-CORS-01/02`).

### SSRF / redirección abierta / resiliencia
- `/maps/geocode` no acepta URL arbitraria del atacante (destino es constante del servidor; el
  parámetro es solo texto de dirección) y no hay `Location` a dominios externos (`SEC-SSRF-01`,
  `SEC-REDIR-01`). Nivel superficial; la evaluación profunda de jsReport/SSRF queda para el otro
  integrante.
- **Resiliencia (RNF7):** con el proveedor de pago caído (simulado), crear orden devuelve **502/503
  controlado** (no 500 crudo ni cuelga), y al restaurarlo la compra vuelve a funcionar
  (`SEC-RESIL-01/02`).

## 2. Observaciones de configuración en ejecución (runtime)

- **PRE-SEC-003 sigue abierto en runtime (INDICIO, no corregido en lo desplegado):** los
  contenedores activos `nestjs_emergen_backend` y `fastapi_emergen_internal` publican en
  `0.0.0.0:3001` y `0.0.0.0:8000` (todas las interfaces IPv4/IPv6), accesibles desde la LAN. PERO
  esas imágenes se construyeron el **2026-10-29 21:29, antes del commit de seguridad**
  (2026-10-30 10:13): el runtime NO ejecuta el HEAD endurecido. La mitigación de exposición vive en
  `docker-compose.production.yml` (no aplicado). **Recomendación:** reconstruir imágenes desde el
  HEAD actual y aplicar el Compose de producción / reglas de ingreso antes de exponer. No se probó
  acceso desde otra máquina.
- El entorno del contenedor backend contiene secretos como variables (`JWT_SECRET`, `DB_PASSWORD`,
  `PAYPAL_SECRET`, …). No se imprimieron valores. Es esperable en runtime, pero refuerza
  PRE-SEC-002 (rotación/custodia pendiente del responsable).

## 3. Vulnerabilidades

- **Vulnerabilidades nuevas CONFIRMADAS: 0.** Ninguna de las comprobaciones dinámicas de inyección,
  XSS, IDOR/BOLA, elusión de rol, CORS o límites logró eludir un control.
- **INDICIOS / pendientes de validación (para el otro integrante, con staging autorizado):**
  evaluación ofensiva amplia de API por rol/objeto; motor jsReport y plantillas (SSRF/lectura de
  archivos/HTML); SQLi/XSS exhaustivos; carga/fuerza bruta; perímetro TLS/red; artefactos
  Android/Electron firmados. Los recorridos estáticos y las pruebas acotadas de esta auditoría no
  los sustituyen.
- **PREVENTIVO:** mantener `docs` FastAPI desactivadas en producción (verificado por config, no en
  un despliegue real); definir CSP/headers en la capa de frontend/ingreso (aún no existe); cerrar
  PRE-SEC-003 en runtime; completar la cadena de dependencias (PRE-SEC-014: Electron/Vite ya
  actualizados en manifiesto/lock por el compañero).

## 4. Hallazgos de entorno (afectan la reproducibilidad/QA, no la seguridad del producto)

- **QA-ENV-01 (media, dev):** `services/internal-api/.venv` versionado/instalado está en
  **Python 3.14.7 y sin `bcrypt`** → FastAPI no importa (`ModuleNotFoundError: bcrypt`), y el
  Dockerfile/documentación fijan **3.12**. Evidencia: primera corrida de `evidencias/fastapi.log`.
  Coincide con el pendiente H4 del compañero ("actualizar el venv de cada integrante"). La auditoría
  usó un venv 3.12 propio para poder ejecutar FastAPI.
- **QA-ENV-02 (media, dev):** el runner del compañero `scripts/security-db-check.mjs` falla en su
  paso Python por la misma razón (bcrypt ausente en `.venv`), de modo que su "integración
  sintética" no se reproduce tal cual en esta máquina. Evidencia:
  `evidencias/reg-security-db-check-companero.log`. La parte Jest (5/5) sí pasó.
- **Acoplamiento de pruebas a seed retirado:** tras la limpieza PRE-SEC-012, el `conftest.py` de
  pytest asume cuentas concretas (`admin@emergen.test` con PIN conocido, "Apadrinado Completo"); en
  BD limpia esas suites fallan por datos ausentes, no por el producto.

## 5. Para cada hallazgo (resumen accionable)

| ID | Sev. | Componente | Reproducción | Impacto | Solución | Verificación |
|---|---|---|---|---|---|---|
| QA-REG-02 | Media | `apps/web/vitest.config.ts:5` | `npm test` en web | Suite unitaria web no corre (calidad/CI) | Resolver la función antes de `mergeConfig` (ver abajo) | `npm test -w web` verde |
| QA-REG-01 | Baja | `apps/backend/src/admin/admin-tickets.service.ts:56` + spec:35 | Jest unit | Spec contradictorio; informe >2000 tickets lanza 413 | Actualizar el spec al nuevo tope; confirmar política de informe completo vs. cap | spec verde y decisión documentada |
| PRE-SEC-003 (runtime) | Media | contenedores activos | `docker ps` | BD/API expuestas en 0.0.0.0 (imagen vieja) | Reconstruir desde HEAD + Compose prod/ingreso | puertos solo en red definida |
| QA-ENV-01/02 | Media (dev) | `services/internal-api/.venv` | arrancar FastAPI / runner | FastAPI no corre localmente | Recrear venv en Python 3.12 con `requirements.txt` | `python -c "import bcrypt"` y arranque OK |

### Corrección sugerida QA-REG-02 (no aplicada)
`apps/web/vitest.config.ts` debe resolver la función de `vite.config.ts` antes de fusionar, p. ej.:

```ts
import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';
const base = typeof viteConfig === 'function'
  ? viteConfig({ command: 'serve', mode: 'test' }) : viteConfig;
export default mergeConfig(base, defineConfig({
  test: { environment: 'jsdom', env: { VITE_PAYPAL_CLIENT_ID: 'test-client' } },
}));
```

(La auditoría usó exactamente este patrón en `scripts/vitest-web-aud.config.mjs` y la suite pasó 110/110.)
