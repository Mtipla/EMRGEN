# Panel de escritorio EMERGEN

El panel administrativo usa React/Vite dentro de Electron. Comparte componentes con web/móvil y consume NestJS y FastAPI; el renderer mantiene Node deshabilitado, aislamiento de contexto y sandbox.

## Versión comprobada

El 30-10-2026 se instaló **Electron 44.9.1 en Windows x64**: manifiesto, lock, paquete, dist y ejecutable real coinciden. El bloqueo EBUSY quedó resuelto. El instalador oficial verificó el ZIP con sus checksums; la prueba nativa aprobó seis casos con perfil temporal y APIs simuladas. Vite está fijado en 8.3.3.

El Node embebido en ese Electron es 24.22.0; la herramienta Node del monorepo observada es 24.21.0 con npm 11.19.0. Son runtimes distintos. Este resultado no acredita las instalaciones de otros integrantes, macOS/Linux, un instalador firmado o aceptación con proveedores reales.

## Instalar y trabajar

Ejecutar desde la raíz del monorepo de aplicación, dos niveles por encima de esta carpeta. En una copia nueva/revisada, instalar desde el único lock:

```powershell
npm ci --no-audit --no-fund
node node_modules/electron/install.js
```

Son dos pasos distintos: npm instala el paquete fijado y el comando explícito ejecuta install.js de esa misma dependencia para adquirir el binario. No depender de un postinstall o de la descarga perezosa al abrir el panel. El instalador usa checksums.json incluido; no desactivar integridad, habilitar todos los scripts, usar un Electron global/latest o mirrors desconocidos. La adquisición necesita red al registro npm y releases oficiales GitHub/CDN (proxy privado si corresponde); la prueba posterior bloquea egreso a proveedores. No copiar node_modules ni borrar el lock. Coordinar procesos antes de reinstalar dependencias de una copia en uso. La nueva evidencia de instalación limpia se registra en el cierre H2–H5 del informe; la comprobación histórica anterior fue una actualización dirigida.

La configuración privada utiliza las plantillas de la raíz sin sobrescribir un .env existente. Para desarrollo, una vez preparados los servicios del entorno:

```powershell
npm run dev --workspace=desktop
# Modo Docker local, como alternativa:
npm run dev:docker --workspace=desktop
```

Estos comandos abren el panel y leen la configuración del entorno; no son la prueba aislada descrita abajo. No ejecutarlos contra proveedores/datos reales como parte de una revisión precommit.

## Comprobación aislada reproducible

Desde la raíz de aplicación:

```powershell
node scripts/security-run.mjs build desktop
node scripts/check-electron-panel.mjs
```

El primer comando compila con modo security-check y destinos sintéticos; el segundo usa el ejecutable local, el main.cjs real y ese renderer. Intercepta HTTP/HTTPS en memoria, deniega WebSockets y permisos, y crea/elimina solamente su perfil temporal marcado. No inicia APIs, Vite, Docker, emisor o BD ni utiliza el perfil de escritorio real. La ventana de prueba permanece oculta.

Los seis casos verifican arranque/aislamiento, login inválido, login de administrador y auditoría, monitor SOS de solo lectura, tickets de la segunda API y logout con recarga. Evidencia y captura sintéticas quedan bajo node_modules/.cache, fuera de Git. El helper scripts/electron-panel-fixture.cjs solo se utiliza mediante el runner.

La prueba requiere un entorno gráfico disponible; se comprobó únicamente Windows x64. Un sandbox puede impedir el arranque gráfico sin ser un fallo del producto. Para la política de selección del renderer existe además:

```powershell
node --test apps/desktop/electron/main.test.cjs
```

El build Vite no crea por sí mismo un instalador Electron. Los bundles security-check contienen destinos falsos y no deben distribuirse. Preparar artefactos release y comprobar todos los roles/flujos contra staging es una etapa distinta.

Ver el [cierre de fortalecimiento](../../docs/FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md), la [operación segura](../../docs/OPERACION_SEGURA.md) y el [prompt de revisión precommit](../../docs/PROMPT_CLAUDE_REVISION_PRECOMMIT_EQUIPO.md).
