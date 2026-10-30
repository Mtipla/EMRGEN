# Revalidación selectiva de QA de EMERGEN

**Fecha:** 29-10-2026, America/Santiago. **Referencia:** `Informe QA.txt` proporcionado por el equipo.

Se revisaron los 14 hallazgos del informe y la cobertura que había quedado pendiente. Resultado: **10 hallazgos vigentes, 2 resueltos en el entorno actual y 2 no reproducidos**. El GPS físico pasó la comprobación de captura. **Actualización del 29-10-2026:** el usuario confirmó que la combinación de volumen envió la alerta sin inconvenientes con la app en segundo plano y la pantalla apagada; con ubicación encendida adjuntó la ubicación precisa. WhatsApp tiene evidencia de despacho desde el servidor local, pero no se confirmó explícitamente la recepción por un contacto. El pago completo sigue pendiente.

Se excluye **HU-12** por instrucción del usuario. El alcance médico es el **antecedente médico**; no se solicita implementar una ficha médica ni su consulta por terceros. Las historias ya aprobadas y las 448 pruebas del informe anterior no se repitieron como batería completa. Tampoco se considera que esas 448 pruebas hayan sido revalidadas aquí.

## Entorno y método

- Interfaces reales de web, móvil en navegador y panel de escritorio, cargadas con Electron y sesiones de QA independientes. Se comprobaron formularios, rutas, mensajes, estilos calculados y árbol de accesibilidad.
- APIs mediante HTTP, con cuentas temporales para los casos de roles, PIN, contraseña y tickets; consulta de PostgreSQL para contrastar persistencia y auditoría.
- APK en el Redmi conectado por ADB: **0.2.3-lan-debug**, `versionCode 6`, 5.920.376 bytes. El APK instalado y `app-debug.apk` tienen el mismo SHA-256: `D61C6C51633B0ABA2A07FB13D378BF1B7FD6B2F55C194E61CCED319D4FA7605D`.
- La captura GPS se ejecutó desde el plugin nativo del APK, con el teléfono desbloqueado y EMERGEN visible. No se inyectaron coordenadas.

**Atención adicional: los clientes están usando entornos diferentes.** Las interfaces en los puertos 5173, 5174 y 5175 sirven configuración `docker` y consumen NestJS en **3001**. El APK consume NestJS local por LAN en **3000**. FastAPI responde en **8000**.

| Comprobación actual | NestJS local :3000 | NestJS Docker :3001 |
|---|---|---|
| `GET /health/ready` | 200 | 404 |
| Estado administrativo de WhatsApp | `enabled: true`, `state: open` | `enabled: false`, `state: disabled` |

El contenedor Docker está ejecutándose, pero no expone el contrato de disponibilidad de la versión local. **La aprobación del despacho del APK no acredita el funcionamiento del emisor en Docker.** Antes de probar ese despliegue, actualizarlo y verificar su configuración según [DESPLIEGUE.md](DESPLIEGUE.md), conservando un único emisor WhatsApp activo. No se cambiaron servicios ni configuraciones durante esta revisión.

## Hallazgos que siguen necesitando atención

La numeración corresponde al informe original.

| Caso | Prioridad | Resultado y evidencia reproducida | Atención necesaria |
|---|---|---|---|
| **#3 — Editar apadrinado sin correo** | Media | **No pasa.** En el panel, el correo vacío sigue siendo obligatorio: `required=true`, `valueMissing=true`, formulario inválido. Bloquea guardar cambios de nombre. | Adaptar la edición al apadrinado sin correo. Ver [admin-cuentas.tsx](../packages/ui/src/admin-cuentas.tsx). |
| **#4 — Deshabilitar trabajador** | Media | **No pasa como bloqueo de cuenta.** Cambiarlo a rol USUARIO devuelve 200; iniciar sesión después devuelve **201 y un JWT**. Los tokens anterior y nuevo reciben **403** al consultar administración: la retirada de permisos sí funciona. | Definir si se quiere impedir el login o solo retirar el rol. Implementar el bloqueo esperado o ajustar la acción y la etiqueta «Inhabilitado». Ver [admin.service.ts](../apps/backend/src/admin/admin.service.ts). |
| **#5 — Cobertura de bitácora** | Media | **No pasa en la bitácora.** Login válido 201, login erróneo 401, PIN erróneo 403, contraseña actual incorrecta 401 y resolución de ticket 200 no agregaron entradas para esos eventos. El ticket sí guardó al responsable de la solución. | Incorporar los eventos que deba cubrir la bitácora, en NestJS y FastAPI. **El login válido sí registra un acceso en `acceso_aplicacion`**; no hay ausencia total de registro. Ver [login.service.ts](../apps/backend/src/login/login.service.ts) y [tickets.py](../services/internal-api/app/services/tickets.py). |
| **#6 — Confirmación y aviso de eliminación** | Menor | **No pasa.** Sobre un apadrinado temporal, pasar a parcial persistió `estado_ID=2` sin confirmación. La eliminación sí pidió confirmación y borró la cuenta, pero el mensaje «Cuenta eliminada.» no quedó visible. | Confirmar el cambio de acceso y ubicar el aviso de eliminación fuera del bloque que depende de la cuenta seleccionada. Ver [admin-cuentas.tsx](../packages/ui/src/admin-cuentas.tsx). |
| **#7 — Ruta móvil desconocida** | Menor | **No pasa.** `/ruta-qa-inexistente` dejó el contenido visible vacío, sin error de Vite. | Añadir un destino para rutas desconocidas. Ver [App.tsx móvil](../apps/mobile/src/App.tsx). |
| **#8 — Login de usuario en escritorio** | Menor | **No pasa el mensaje.** Una cuenta temporal con credenciales válidas y rol USUARIO recibió «No se pudo iniciar sesión. Verifica tus datos e inténtalo nuevamente.». | Mostrar que el panel requiere administrador o soporte. El error propio de esa comprobación termina traducido al mensaje genérico. Ver [PanelAdmin.tsx](../apps/desktop/src/admin/PanelAdmin.tsx). |
| **#9 — Límite de bitácora** | Menor | **No pasa.** Introducir **1001** y pulsar «Listar bitácora» muestra `HTTP 400: limite must not be greater than 1000`. | Validar el valor antes de consultar y presentar el error en español. El atributo `max=1000` no impide esta acción del botón. Ver [SeccionBitacora.tsx](../apps/desktop/src/admin/SeccionBitacora.tsx). |
| **#11 — Soporte mientras carga** | Menor | **No pasa.** Con la respuesta demorada se ven simultáneamente «Cargando…» y «Aún no tienes solicitudes.». | Mostrar el estado vacío después de finalizar la carga. Ver [soporte.tsx](../packages/ui/src/soporte.tsx). |
| **#13 — Checkbox de acceso completo** | UX | **No pasa visualmente.** En el modal web, el `label` usa `display: grid`; el checkbox mide unos **365 px** dentro de una etiqueta de **372 px** y el texto queda debajo. La asociación semántica entre control y etiqueta sí existe. | Corregir la disposición y el ancho del checkbox en este formulario. Ver [cuentas-apadrinadas.tsx](../packages/ui/src/cuentas-apadrinadas.tsx) y [wireframe.css](../packages/ui/src/wireframe.css). |
| **#14 — Texto de descarga** | UX | **No pasa la actualización del contenido.** `/descargar` sigue diciendo «Próximamente en Android e iOS.», aunque existe un APK de prueba. | Distinguir Android en pruebas de la disponibilidad pública y del estado de iOS. La existencia del APK no implica que ya exista una publicación en tienda. Ver [PublicSite.tsx](../apps/web/src/features/inicio/PublicSite.tsx). |

Los casos #3, #6, #8 y #9 se reprodujeron en el panel de escritorio actual. No se atribuye una segunda ejecución a pantallas administrativas web que hayan sido retiradas o redirigidas al panel.

## Hallazgos resueltos o no reproducidos

| Caso original | Resultado actual | Límite de la conclusión |
|---|---|---|
| **#1 — Migraciones y `/perfil`** | **Pasa en el entorno existente.** El verificador confirmó **34 tablas, 166 columnas, 21 funciones y 20 triggers**, comparando `init.sql` más las tres migraciones. El perfil respondió 200 en ambas APIs NestJS. La ejecución de migraciones para instalaciones nuevas está documentada. | No se realizó una instalación desde cero. Se mantiene la necesidad de ejecutar `npm run migrate:deployment` según despliegue. No se modificó `init.sql`. |
| **#2 — Dependencias de Capacitor** | **Pasa en el entorno existente.** Están instalados `@capacitor/android@8.5.2` y `@capacitor/geolocation@8.2.4`; las comprobaciones de la interfaz móvil no mostraron el error de importación y el plugin nativo obtuvo GPS. | No se reinstalaron dependencias ni se ensayó `npm ci` en un clon limpio. |
| **#10 — Error 304 del perfil** | **No reproducido.** Doce consultas locales al perfil devolvieron 200. Cuatro cargas web del perfil, autenticadas contra Docker, terminaron sin error 304 ni aviso de fallo. | Al ser intermitente, no puede declararse corregido definitivamente. Mantenerlo en observación; si reaparece, registrar petición, cabeceras de caché y respuesta. |
| **#12 — Categorías deshabilitadas en accesibilidad** | **No reproducido; pasa la comprobación actual del navegador.** Las cinco opciones y el selector tienen `disabled=false` en DOM y árbol de accesibilidad. La selección cambia mediante teclado. | No se ejecutó una sesión con un lector de pantalla concreto. Esta evidencia no certifica accesibilidad completa. |

## Cobertura que estaba pendiente

| Prueba | Resultado de esta revisión | Qué falta |
|---|---|---|
| **HU-07 — GPS físico** | **Pasa.** La lectura nativa obtuvo coordenadas válidas con precisión estimada de **16 m**. En la prueba manual posterior, el usuario confirmó que el SOS por volumen adjuntó la ubicación precisa con ubicación encendida, app en segundo plano y pantalla apagada. | La prueba posterior fue confirmada por el usuario; no se realizó una nueva medición automática de precisión ni consulta de persistencia en BD. |
| **HU-08 — WhatsApp** | **Pasa el despacho registrado en el servidor local; recepción actual pendiente.** Emisor conectado y cola pendiente vacía en la consulta. Las alertas **267 a 270** tienen un envío de ACTIVACIÓN y otro de FINALIZACIÓN en estado ENVIADO. | No se enviaron mensajes nuevos ni se comprobó el teléfono receptor. ENVIADO acredita despacho registrado, no entrega o lectura. En Docker el emisor sigue deshabilitado. |
| **HU-16 — Pago completo PayPal** | **Pendiente.** No se completó una compra durante esta revisión. | Ejecutar un pago con comprador Sandbox y contrastar captura, venta y plan/cupos en BD, incluyendo la recarga de la sesión. La carga de botones ya aprobada no sustituye esa comprobación. |
| **APK — Volumen y pantalla apagada** | **Pasa por confirmación manual del usuario el 29-10-2026.** La combinación de botones de volumen envió la alerta sin inconvenientes con la app en segundo plano y la pantalla apagada; con ubicación encendida adjuntó la ubicación precisa. | Prueba manual posterior a la validación automática. Ver [SOS_VOLUMEN_ANDROID.md](SOS_VOLUMEN_ANDROID.md). |

## Orden de atención y evidencias

1. Alinear el entorno que se desea probar o desplegar: actualmente Docker no tiene el emisor ni el contrato de disponibilidad del entorno local.
2. Resolver edición de apadrinados (#3), semántica de deshabilitación (#4) y cobertura de bitácora (#5).
3. Completar la confirmación de recepción WhatsApp y el pago Sandbox. La secuencia de volumen en segundo plano y con pantalla apagada queda aprobada por la prueba manual del usuario.
4. Corregir los detalles de interfaz restantes; conservar #10 en observación. #12 no tiene evidencia actual que justifique tratarlo como fallo reproducido.

Los resultados técnicos sin tokens, teléfonos ni coordenadas se guardan en [revalidacion-2026-10-29.json](qa/revalidacion-2026-10-29.json). Las capturas y los scripts auxiliares permanecen localmente en `node_modules/.cache/qa-atencion*`; no forman parte del entregable versionado porque algunas capturas contienen datos de las cuentas existentes.

Las cuentas, apadrinados, planes y el ticket temporales de la validación automática se eliminaron. Al cerrar esa validación, antes de la prueba manual posterior del usuario, los recuentos iniciales y finales coincidían: **8 usuarios, 5 tickets, 46 alertas y 56 envíos**; quedaban **0 cuentas QA temporales** de esta revisión. Se conservan las trazas legítimas de acceso y auditoría generadas por las pruebas. La validación automática no creó alertas ni envíos WhatsApp nuevos. No se corrigió código de producto, no se aplicaron migraciones, no se modificó `init.sql` y no se crearon commits ni push.
