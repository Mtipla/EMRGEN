# Registro de cambios de desarrollo

Registro de cambios de **código** del monorepo. Los cambios de la documentación del proyecto
siguen en `Evidencias de documentación/Cambios Realizados*.docx` (IDs AUDIT/ERR). Agregar
bloques nuevos al final; no reescribir los anteriores.

---

## 2026-10-21 — Rutas y UI base de los wireframes (bloque 1)

### Módulo
Rutas - Usuario / Administración / Móvil

### Plataformas
Web · Móvil · Escritorio · Compartido

### Tipo
CREADO / REUTILIZADO / MODIFICADO

### Archivos
- Creados (compartido): `packages/ui/src/wireframe.tsx`, `wireframe.css`, `css.d.ts`, `mocks.tsx`, `perfil-form.tsx`, `cuentas-apadrinadas.tsx`, `admin-views.tsx`
- Creados (web): `apps/web/src/features/cuenta/{session.ts, AppShell.tsx, CuentaPages.tsx}`, `apps/web/src/features/administracion/AdminPages.tsx`
- Creados (escritorio): `apps/desktop/src/admin/VistasWireframe.tsx`
- Creados (móvil): `apps/mobile/src/lib/{session.ts, alerta.ts, wireframe.test.ts}`, `components/ConfigurarAlerta.tsx`, `pages/{Login, Registro, Pin, Perfil, Cuentas}.tsx`
- Modificados: `apps/web/src/App.tsx`, `apps/desktop/src/main.tsx`, `apps/desktop/src/admin/PanelAdmin.tsx`, `apps/mobile/src/App.tsx`, `apps/mobile/src/pages/Home.tsx`

### Cambios
- Web: rutas `/inicio`, `/perfil`, `/cuentas`, `/administracion/{cuentas,compras,trabajadores}`; se reutilizan `/`, `/premium`, `/login`, `/comprar`, `/usuarios`.
- Escritorio: `HashRouter` (Electron carga `file://`) y las 3 vistas de administración dentro de la sesión del panel.
- Móvil: rutas `/login`, `/registro`, `/pin`, `/home`, `/perfil`, `/cuentas` y flujo "Configurar alerta en segundo plano".

### Antes / después
- `apps/web/src/App.tsx` — ANTES: tras login/PIN/compra se iba a `/usuarios`. DESPUÉS: se va a `/inicio` (Home del wireframe); `/usuarios` sigue igual.
- `apps/desktop/src/admin/PanelAdmin.tsx` — ANTES: mostraba las 3 secciones de pruebas. DESPUÉS: siguen en `/`, con navegación a las vistas nuevas.
- `apps/mobile/src/pages/Home.tsx` — ANTES: plantilla vacía de Ionic. DESPUÉS: Home del wireframe.

### Impacto
MEDIO

### Compatibilidad
Web · Móvil · Desktop · módulo compartido. Sin cambios de backend.

### Estado
PARCIAL

### Pendiente
Endpoints de cuentas apadrinadas, PIN de apadrinados y listado de compras para el personal.

---

## 2026-10-21 — Roles, permisos, soporte y funcionalidades documentadas (bloque 2)

### Módulo
Roles y permisos · Soporte · Alertas · Perfil

### Plataformas
Web · Móvil · Escritorio · Compartido · Backend

### Tipo
CREADO / MODIFICADO / INTEGRADO

### Archivos
- Backend (modificado): `apps/backend/src/login/login.service.ts`
- Compartido (creados): `packages/ui/src/permisos.tsx`, `packages/ui/src/soporte.tsx`
- Compartido (modificados): `packages/ui/src/{wireframe.tsx, mocks.tsx, perfil-form.tsx, admin-views.tsx}`
- Web (modificados): `apps/web/src/App.tsx`, `features/auth/AuthForm.tsx`, `features/cuenta/{session.ts, AppShell.tsx, CuentaPages.tsx}`, `features/administracion/AdminPages.tsx`
- Escritorio (modificado): `apps/desktop/src/admin/VistasWireframe.tsx`
- Móvil (creado): `apps/mobile/src/components/AlertaSos.tsx`
- Móvil (modificados): `apps/mobile/src/{App.tsx, lib/session.ts, lib/wireframe.test.ts, pages/Home.tsx, pages/Perfil.tsx}`
- Configuración (modificado): `example.env`

### Cambios
- Backend: `POST /usuarios/login`, `GET/PATCH /usuarios/me` y `GET /usuarios` devuelven además `rol_ID`, `estado_ID` y `usuario_principal_ID` (cambio aditivo, autorizado por el equipo). La autorización no cambia: JwtAuthGuard + RolesGuard releen la BD.
- Matriz de permisos `packages/ui/src/permisos.tsx` (USUARIO, APADRINADO, SOPORTE, ADMINISTRADOR) usada por menús y rutas de web y móvil. "Trabajador" de los wireframes = rol SOPORTE (ERS RF3).
- SOPORTE: gestiona tickets (`/administracion/tickets`, PATCH internal-api) y consulta alertas; ve "Administrar cuentas" y "Administrar compras" solo lectura (`PENDIENTE DEFINICIÓN DE PERMISOS SOPORTE`); no accede a trabajadores.
- Nuevas rutas web: `/soporte` (HU-18), `/administracion/tickets`, `/administracion/alertas`; guardas por permiso con página "Sin permisos".
- Móvil: SOS conectado a `POST /internal/v1/alertas` y cierre con PIN `POST /internal/v1/alertas/{id}/cerrar` (HU-06, HU-14); menú por perfil.
- Números oficiales 131/132/133 (HU-17) en la Home web y móvil.
- Perfil: finalidad = catálogo PRIORIDAD; contactos con nombre ≤ 20, E.164 y máximo 5 (RF7); mensaje ≤ 200; ficha médica con las columnas de ANTECEDENTE_MEDICO; con acceso parcial se pide autorización del principal y no se envía nada.
- Tablas de administración: botón "Descargar" (CSV de las filas visibles). Compras: estados del catálogo ESTADO_PAGO y "PIN Trabajador" antes de modificar o eliminar (sin endpoint).

### Antes / después
- `login.service.ts` (`sinPassword`) — ANTES: `{usuario_ID, nombre_usuario, correo_usuario, requiere_pin}`. DESPUÉS: los mismos campos más `rol_ID`, `estado_ID` y `usuario_principal_ID`.
- `AppShell.tsx` — ANTES: detectaba al administrador llamando a `GET /admin/usuarios`. DESPUÉS: usa el rol de la sesión (ya no genera esa consulta en la bitácora).
- `PinDialog` — ANTES: siempre PIN + confirmación. DESPUÉS: `confirmar={false}` para ingresar un PIN existente; el valor por defecto mantiene el comportamiento anterior.
- `AdminCompras` — ANTES: `titulo`. DESPUÉS: `titulo` + `puedeEditar` (obligatoria).

### Impacto
ALTO (cambio de respuesta del backend compartido por web, móvil y escritorio; es aditivo)

### Compatibilidad
Web · Móvil · Desktop · Backend · módulo compartido. Las sesiones guardadas antes de este cambio no traen `rol_ID`: el menú queda mínimo hasta que `/usuarios/me` refresca la sesión (la web lo hace al cargar).

### Estado
PARCIAL

### Pendiente
- Reconstruir el contenedor Docker del backend para que exponga los campos nuevos.
- Endpoints: contactos, prioridad, mensaje personalizado, ficha médica, PIN de trabajador, validación de PIN del principal, listado/edición de ventas, informe personal (HU-19).
- Definir permisos de SOPORTE sobre cuentas y compras (hoy el backend los limita a ADMINISTRADOR).

---

## 2026-10-21 — SOPORTE = "Trabajador" de documentos y mockups (bloque 3)

### Módulo
Roles y permisos · Administración

### Plataformas
Web · Escritorio · Compartido (móvil: solo tests; los mockups móviles no tienen pantallas de Trabajador)

### Tipo
MODIFICADO

### Decisión
El equipo definió que toda funcionalidad que documentos o mockups atribuyen a "Trabajador" corresponde al rol SOPORTE, con las acciones de "web y escritorio.pdf" págs. 10-23. Se aplica **solo en la UI**: el backend no cambia y `/admin/*` sigue limitado a ADMINISTRADOR (lo comprueba `test/auth-admin.db.e2e-spec.ts:71`), por lo que SOPORTE recibe 403 en esas llamadas hasta que el equipo decida el RBAC.

### Archivos
- `packages/ui/src/permisos.tsx`, `admin-views.tsx`, `perfil-form.tsx`, `wireframe.tsx`
- `apps/web/src/features/administracion/AdminPages.tsx`, `apps/web/src/features/cuenta/CuentaPages.tsx`
- `apps/mobile/src/lib/wireframe.test.ts`

### Cambios
- SOPORTE puede, en la UI: buscar, añadir, modificar, eliminar y descargar cuentas y compras. Eliminar le pide antes el "PIN de trabajador del administrador" (mockup págs. 15 y 22). El administrador elimina solo con confirmación (págs. 54 y 59).
- Exclusivo del ADMINISTRADOR: Administrar trabajadores y modificar el "PIN verificación trabajador" (págs. 32-33 y 47-51).
- Perfil por variante: usuario (contactos, finalidad, mensaje, ficha), soporte (solo datos personales, pág. 12) y administrador (+ PIN de trabajador).
- "Añadir cuenta" (pág. 17) con formulario y aviso de endpoint pendiente; "Acaba de modificar a …" (págs. 13 y 60); aviso de descarga CSV (págs. 16 y 23).
- Compras: "Modificar" ya no pide PIN (el mockup solo lo exige para eliminar).

### Antes / después
- `permisos.tsx` — ANTES: SOPORTE veía cuentas y compras en solo lectura (`PENDIENTE_SOPORTE`). DESPUÉS: SOPORTE tiene las acciones del Trabajador; nuevas acciones `admin.cuentas.eliminar`, `admin.compras.eliminar` y `perfil.pinTrabajador`, `requierePinTrabajador()` y `BACKEND_SOPORTE` en lugar de `PENDIENTE_SOPORTE`.
- `PerfilForm` — ANTES: prop `personal`. DESPUÉS: prop `variante`.
- `AdminCompras` — ANTES: PIN para modificar y eliminar. DESPUÉS: PIN solo para eliminar y solo para SOPORTE (`pinParaEliminar`).

### Impacto
MEDIO

### Compatibilidad
Web · Desktop · módulo compartido. Sin cambios de backend.

### Estado
PENDIENTE BACKEND

### Pendiente
- Que el equipo habilite en el backend las rutas que correspondan para SOPORTE y actualice el e2e.
- Endpoint para validar el PIN de trabajador; endpoints para crear cuentas de usuario desde el personal y para gestionar ventas; eliminar trabajador.
