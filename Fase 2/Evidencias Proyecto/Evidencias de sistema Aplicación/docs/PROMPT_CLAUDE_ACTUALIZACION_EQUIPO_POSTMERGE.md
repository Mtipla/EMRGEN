# EMERGEN — Acompañamiento de actualización e integración por integrante

**Listo para entregar al equipo: 30-10-2026.** H2–H5 están confirmados en el cierre vigente de [FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md](FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md). Esto prepara el entorno local para testing con cobertura indicada; no autoriza hosting ni garantiza todas las funciones.

Copia el texto siguiente en Claude Code, abierto en el repositorio del integrante.

---

Actúa como mantenedor de EMERGEN y acompáñame en la actualización de **mi propio equipo y rama**. Instala/configura lo necesario, comprueba contratos y funciones pertinentes y corrige discrepancias pequeñas reproducibles. Completa el acompañamiento autorizado; no conviertas este trabajo en otra auditoría general.

## 1. Identificar la versión y la dirección de integración

Lee AGENTS.md, CLAUDE.md y CONTRIBUTING.md aplicables. Localiza la raíz Git y **A** = `Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación`. Desde A lee README.md, los README desktop/Python, docs/OPERACION_SEGURA.md, el cierre vigente de docs/FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md y docs/MANIFIESTO_CANDIDATO_PRECOMMIT.json. REVISION_INTEGRACION_EQUIPO_CLAUDE.md es la revisión histórica anterior a H2–H5: no la reescribas como una aprobación nueva.

Empieza con inspección de solo lectura:

```powershell
git branch --show-current
git rev-parse HEAD
git status --short
git diff --cached --name-only
git diff --name-only --diff-filter=U
git for-each-ref --format="%(refname) %(objectname)" refs/heads refs/remotes/origin
```

El fortalecimiento está en la rama **alonso** (llamada «/alonso» por el usuario). Además, por indicación expresa del responsable, **alonso es la rama destino de integración del trabajo de los integrantes**. Identifica por separado la rama fuente de cada integrante y el SHA de alonso que contiene el fortalecimiento. Al preparar este documento este último trabajo seguía sin commit sobre HEAD 6c228e6566487c265231c0f99dcc12de7a305557. **Ese HEAD no identifica el futuro commit del fortalecimiento.** Una vez creado, Git le asigna su SHA: obtén el real del repositorio o del responsable; no inventarlo ni exigir que esté escrito dentro del mismo commit. El manifiesto identifica bytes del delta previo al commit, no un futuro commit; los estados M/?? cambian al versionarlos. No supongas frescura de origin/* sin actualización confirmada.

La dirección indicada para este encargo es **rama del integrante → alonso**. CONTRIBUTING describe como flujo general PR hacia main y prohíbe merges entre ramas individuales; la instrucción expresa del responsable establece alonso como destino para esta integración concreta. Registra esa excepción sin modificar las reglas generales ni sustituir silenciosamente alonso por main. Comprueba las refs y los dos SHAs antes de preparar pasos; deja las operaciones Git al usuario. Si la incorporación ya existe, verifica ancestros y contenido sin repetir el merge; un squash/cherry-pick puede exigir comparar contenido además de ancestros. Llevar cambios del integrante a alonso no actualiza por sí solo su rama personal con el fortalecimiento de alonso: distingue la copia/rama que se probará y no ejecutes automáticamente el merge inverso.

No hagas staging, commit, merge, push, checkout/switch, reset, restore, clean, stash ni rebase automáticos. Conserva índice y cambios propios/ajenos; identifica su origen antes de corregir. Si dirección, destino o SHA faltan, solicita ese dato y continúa el diagnóstico independiente. No escribas a otras personas o servicios. No regeneres, restaures, borres ni incluyas graphify-out/ en este encargo.

## 2. Preparar mi entorno desde sus manifiestos

Registra plataforma/arquitectura y versiones reales; compáralas con los manifiestos presentes. Referencia comprobada: Node **24.21.0** / npm **11.19.0** (engines ^24.21.0 / ^11.19.0), Vite **8.3.3**, Electron **44.9.1**, Python **3.12** (prueba anterior 3.12.10) y bcrypt Python **5.0.0**. El Node embebido de Electron probado es **24.22.0**, distinto del Node usado para instalar. PostgreSQL está referenciado como 15; registra versión real solo si está disponible mediante metadatos autorizados. Docker/Compose se verifican cuando el integrante los usa; no deduzcas su versión efectiva del YAML.

Desde la raíz Git, ubica A y comprueba herramientas sin imprimir configuración privada:

```powershell
$repoRaiz = (git rev-parse --show-toplevel).Trim()
$appRaiz = Join-Path $repoRaiz 'Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación'
Set-Location -LiteralPath $appRaiz
node --version
npm --version
python --version
# Solo si se usan:
docker --version
docker compose version
```

Antes de instalar revisa scripts y lock, y si las dependencias están en uso. No cierres aplicaciones ni reemplaces node_modules en una copia activa. En ese caso prepara una copia independiente con selección revisada de fuentes nuevas y modificadas, sin privados ni entornos del autor, y continúa allí. Una copia de HEAD solamente no representa un delta sin commit. No atribuyas la versión de un proceso activo a las últimas fuentes sin evidencia.

En la copia de trabajo inactiva o aislada seleccionada, **desde A**:

```powershell
npm ci --no-audit --no-fund
node node_modules/electron/install.js
npm ls electron --workspace=desktop --depth=0
node -p "require('./node_modules/electron/package.json').version"
Get-Content -LiteralPath node_modules/electron/dist/version
```

npm ci instala el paquete; el segundo comando prepara su ejecutable. Verifica que install.js corresponde a la dependencia local resuelta 44.9.1 y conserva sus checksums incluidos. La adquisición requiere acceso al registro npm y a los releases oficiales de Electron en GitHub, o proxy corporativo aprobado con integridad preservada. No usar Electron global, latest, npx que descargue otra versión, espejos desconocidos, flags de fuerza ni habilitación general de scripts. Si falla por red/proxy, registra la causa; no desactives TLS/checksums. El runner nativo verifica también la versión del ejecutable real.

Cypress **13.17.0** es opcional para quien lo necesita: después de confirmar su versión local, `node node_modules/cypress/bin/cypress install`. No descargues navegadores adicionales por defecto. Separa esta fase de adquisición de la fase de pruebas, cuyo egreso a proveedores debe bloquearse.

Python necesita **su propio venv**, también al actualizar una instalación existente. Desde A, en Windows con Python 3.12 confirmado:

```powershell
if (-not (Test-Path -LiteralPath '.\services\internal-api\.venv\Scripts\python.exe')) {
    python -m venv services/internal-api/.venv
}
.\services\internal-api\.venv\Scripts\python.exe -m pip install -r services/internal-api/requirements.txt
.\services\internal-api\.venv\Scripts\python.exe -c "import bcrypt; print(bcrypt.__version__)"
```

Alternativa con activación: `.\services\internal-api\.venv\Scripts\Activate.ps1` y luego `python -m pip install -r services/internal-api/requirements.txt`. No cambies políticas globales si la activación falla: usa el intérprete directo. FastAPI verifica PIN con bcrypt Python; scripts/pin-bcrypt.cjs permanece como legado fuera de ese recorrido, sin necesidad de eliminarlo.

requirements.txt es para desarrollo local Windows/Python 3.12, incluye pruebas e incorpora requirements-runtime.txt. El lock `services/internal-api/locks/requirements-linux-py312.lock` es de **runtime Linux/Python 3.12**, con hashes: en ese entorno corresponde `python -m pip install --require-hashes -r services/internal-api/locks/requirements-linux-py312.lock` desde A. No aplicarlo a Windows ni confundirlo con el entorno de pruebas. No copies .venv/node_modules del autor. El harness security-run tiene limitaciones Windows documentadas; no declares verificadas Linux/macOS ni emprendas su portabilidad como mejora opcional H9.

## 3. Configuración y datos conservados

Compara **nombres** de variables con example.env y, si corresponde al destino futuro, deploy/production.env.example. Completa solo lo faltante mediante un canal local privado, sin sobrescribir .env, mostrar valores, copiar credenciales entre equipos o introducir secretos en plantillas/reportes. Separa servidor privado, VITE_* públicas, modo local/LAN/debug, copia sintética y futura distribución. Contrasta ambos orígenes API y deployment ID. No cambies secretos, claves médicas/firma o sesión WhatsApp.

**H1 está excluido por decisión del usuario:** no rotar/revocar, reescribir historia ni realizar nuevos saneamientos. Conserva el pendiente de revocación antes de hosting. H6–H11 no se implementan de oficio.

Si ya hay BD/datos, **no ejecutar seed**, renombrar la BD, migrar o recrear volúmenes al incorporar cambios. El guard restrictivo de H2 se conserva; EMERGEN_BDD se rechaza intencionalmente para seed. La demostración es opcional y exclusiva de una BD **nueva, vacía e independiente** dev/test: sigue README §6.3 con copia, instancia/volumen/puerto propios, seis variables explícitas y confirmación exacta. DB_HOST=db:5432 es interno al contenedor; desde host se usa loopback y el puerto publicado. No ejecutar seed para «comprobar» una actualización ni usar down -v.

No modificar init.sql, esquema/migraciones, roles, datos o recursos existentes. Mantener synchronize=false. Cualquier restart/rebuild de servicios propios requiere antes un plan concreto de impacto, identidad de recursos y volúmenes, y autorización expresa del integrante. Continúa los pasos independientes mientras se decide; no operar sobre servicios ajenos o producción.

## 4. Verificación pequeña y aislada

Selecciona las comprobaciones necesarias según cambios y riesgo; no ejecutes todas las suites por rutina. Antes del bootstrap revisa fixtures/harness, instala dobles y bloquea egreso HTTP/HTTPS/WebSocket a terceros; usa entorno sintético sin .env/DB/JWT heredados. No usar servicios activos solo porque responden, LIVE_APIS, emisor, cobros, Firebase/proveedores reales, cargas, fuerza bruta o fuzzing. Si una comprobación no se puede aislar, márcala pendiente y continúa las demás.

Menú existente **desde A de la copia aislada**:

| Alcance | Comando / condición |
|---|---|
| H2, guard puro sin BD | `node --test scripts/seed-safety.test.cjs` — 7 tests; el último cubre seis destinos/confirmaciones |
| H3, seis escenarios CORS | `node scripts/security-run.mjs jest --config test/jest-e2e.json --runTestsByPath test/security-boundaries.e2e-spec.ts --testNamePattern CORS` |
| Backend afectado | `node scripts/security-run.mjs build backend` |
| Desktop afectado | `node scripts/security-run.mjs build desktop`, después `node scripts/check-electron-panel.mjs` — seis casos nativos, perfil temporal/APIs falsas |
| Python/configuración, si pertinente | `node scripts/security-run.mjs python-config` — requiere venv propio en esa copia; 2 tests / 6 Settings, sin conftest/BD |
| Web o móvil afectado | `node scripts/security-run.mjs build web` o `node scripts/security-run.mjs build mobile` |
| Tipos del cliente compartido, si cambió | `node scripts/security-run.mjs build @repo/api-client` |

H3 ejercita AppModule con proveedores falsos y **configureHttpBoundary compartida con main.ts**, CORS antes de boundedJson. Comprueba 413/415/400 con cuerpo/status/ACAO, respuesta válida con JWT parcial, preflight permitido y origen no permitido sin ACAO. Conserva allowlist, autenticación, cuotas y errores; no añadir * o credenciales indiscriminadas. El selector ejecuta **6 y omite otros 6**: no reportar 12 aprobados; 414 no se ejecutó. El panel simulado intercepta APIs con ACAO *, por lo que **no acredita CORS real de file:// / Origin:null**; la aceptación nativa frente al backend real sigue pendiente. No debilitar la allowlist para cerrarla.

Reutiliza evidencia anterior solo si coincide en fuentes, lock, configuración y alcance; identifica snapshot/huellas, fecha y limitaciones. Las pruebas aisladas del 30-10-2026 acreditaron npm ci limpio, instalación oficial y panel 6/6 en Windows x64; no acreditan la instalación de este integrante. Los bundles security-check contienen destinos sintéticos y **no son distribuibles**.

Revisa consumidores modificados por la integración: api.maps/api.indicators reciben **accessToken primero** y JWT propio; Firebase ID token no sustituye esa sesión. Los wrappers genéricos api.paypal/api.reports rechazan **410 localmente** y sus rutas retiradas responden **404 HTTP**. Migra consumidores a compras/reportes autorizados; no restaurar bypasses ni tratar la retirada intencional como regresión a reparar.

Prepara y completa esta matriz, identificando caso/comando, resultado, evidencia nueva o reutilizada y límite. Estados: **aprobado, fallido, no ejecutado, pendiente manual**. No uses build como aceptación de todas las filas.

| Función | Cobertura que debe distinguirse |
|---|---|
| Identidad/login principal → perfil → PIN | Sesión propia, PIN temporal/efectivo, rechazo y recuperación pertinentes |
| Roles/parcial/apadrinados | Propiedad, permisos, vínculo y máximo cinco; capacidad parcial/SOS conservada |
| Perfil/contactos/consentimiento | Datos sintéticos, consentimiento y cifrado/descifrado con claves sintéticas |
| SOS con y sin GPS | Creación, idempotencia, cierre/estado e historial; despacho siempre falso |
| Compras | Precio servidor, reserva/cupos, captura/conciliación; proveedor falso |
| Soporte/contacto/reportes | Autorización, entrada válida/errores, límites y exportación completa |
| Arranque/health/clientes | Orígenes, renderer, login/logout y ambos contratos API; health no prueba todos los flujos |
| CORS/consumidores | Errores tempranos, allowlist, preflight, tokens nuevos y rutas retiradas |
| Android/dispositivo/proveedores | Cobertura específica o pendiente manual con responsable y pasos |

Si necesitas BD, diseña primero un destino nuevo y desechable con fixtures sintéticas/guardas de identidad; revisa el runner pertinente antes de ejecutarlo. No usar BD, volúmenes, credenciales o datos existentes ni pytest completo que cargue conftest contra ellos.

Si cambiaron fuentes móviles, contratos, configuración pública o XML nativo, el responsable debe reconstruir frontend, sincronizar Capacitor, construir e instalar el APK actualizado conforme al README. **No hacerlo automáticamente**, reutilizar APK antiguo ni promover un bundle sintético. GPS con/sin permiso, segundo plano, volumen, FileProvider y aceptación física requieren dispositivo y pasos manuales registrados. Proveedores, release firmado y hosting conservan su aprobación separada.

## 5. Correcciones mínimas autorizadas

Puedes corregir discrepancias pequeñas **atribuibles y reproducibles**: import/ruta/script, instrucción con variable no sensible faltante o consumidor que olvidó el nuevo token. Antes identifica el origen del cambio y preserva el trabajo del integrante; no atribuyas todo error a alonso. Aplica un diff acotado, comprueba lo afectado y registra antes/después con evidencia disponible.

Un conflicto amplio de lock, esquema, política de negocio o versión mayor requiere diagnóstico/alternativas y decisión del responsable: detén ese cambio y continúa tareas independientes. No elijas un lado del lock a ciegas, regeneres masivamente, hagas refactor amplio, promociones privilegios, desactives TLS o elimines validaciones/guardas/tests. No modificar init.sql ni recursos/secretos reales. Las operaciones Git y la publicación quedan al usuario.

## 6. Entrega por integrante y rama

Crea **un reporte propio y único**, por ejemplo docs/INTEGRACION_<integrante>_<rama-saneada>_<fecha>.md; si ya existe uno ajeno o de otra ejecución, usa otro nombre. No sobrescribas la revisión histórica de Claude ni el cierre del autor.

Registra: rama/SHA fuente del integrante, destino alonso y su HEAD, SHA real del fortalecimiento, dirección acordada e incorporación ya presente o pendiente; plataforma/versiones/lock; acciones e instalaciones; correcciones mínimas y archivos; comandos/resultados; matriz funcional; evidencia nueva/reutilizada; pendientes con responsable y próximo paso. Incluye la selección de archivos revisables y exclusiones (privados, dependencias, cachés Graphify, QA ajena, backups, APK/bundles); no prepares el índice. Comparte solo información redactada.

Al terminar, incluye en el reporte y en tu respuesta al integrante una **lista explícita de credenciales faltantes**, obtenida de la comparación local con las plantillas y los requisitos de los componentes utilizados. Indica únicamente: nombre de la variable o credencial, componente/función afectada, estado (ausente, vacía, placeholder o no verificable), si es necesaria para el modo elegido u opcional, archivo privado de destino mediante ruta relativa y quién debe aportarla o siguiente paso. No muestres valores, hashes, conexiones privadas ni datos personales; no solicites que se peguen secretos en el chat. Conserva la configuración local existente y utiliza mecanismos privados para completar lo faltante, sin copiar secretos de otro equipo ni reabrir H1.

Separa faltantes que impiden arrancar o probar una función de credenciales de proveedores que no se necesitan en pruebas con dobles. Marca las funciones afectadas como no ejecutadas o pendientes; no declararlas aprobadas. Si no detectas faltantes, dilo expresamente **para el alcance revisado** y distingue credenciales presentes de credenciales cuya validez no se comprobó. No contactar proveedores reales para validar credenciales en este acompañamiento. El listado ayuda a prevenir errores de configuración; no garantiza por sí solo todas las funcionalidades.

Separa **comprobado localmente**, **preparado para destino** y **pendiente externo/manual**. H1 previo al hosting, TLS/ingreso/CSP reales, roles efectivos, restauración/descifrado, política común de sesión/PIN, cuotas entre réplicas, entregas ambiguas, Android físico, proveedores y firma/publicación siguen sujetos a decisión y evidencia. Concluye «entorno local preparado para testing con cobertura indicada» solo si lo observado lo permite; no prometas integridad total ni «listo para hosting» con filas pendientes.

