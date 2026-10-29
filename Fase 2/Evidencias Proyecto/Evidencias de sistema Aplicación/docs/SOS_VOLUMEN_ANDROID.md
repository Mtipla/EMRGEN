# SOS con teclas de volumen · Android 0.2.2

Implementación del 29-10-2026. La prueba de la combinación que registra el SOS queda reservada al usuario. No se enviaron SOS ni mensajes de WhatsApp durante las comprobaciones automáticas de esta integración.

El usuario confirmó el funcionamiento de `0.2.1` tras la corrección de ubicación y la recuperación del servicio, incluida la prueba de envío propuesta con la app retirada de Recientes y la pantalla apagada. `0.2.2` reorganiza la tarjeta en **Tu secuencia**, **Segundo plano**, **Ubicación** y **Sesión**, con separación visual, textos genéricos y resultado breve. La duración por defecto pasa a dos horas.

## Configurar y activar

1. Inicia sesión con PIN, plan efectivo y contactos de prueba. En **Modificar usuario**, guarda una finalidad/prioridad de emergencia: el envío consulta `GET /usuarios/me/perfil` y utiliza su `prioridad_ID`, correspondiente a `usuario.prioridad_id`. No sustituye una prioridad ausente por otra predeterminada.
2. En Home pulsa **Configurar alerta → Comenzar grabación**. Usa exclusivamente las teclas físicas **Volumen + y Volumen −**. Se admiten de 3 a 12 pulsaciones, incluyendo ambas teclas; la grabación dura hasta 20 segundos y puedes terminarla antes. Mantener una tecla pulsada cuenta una sola vez.
3. Completa **Comenzar prueba 1 → teclas físicas → Comprobar prueba** y luego la segunda prueba. Deja como máximo **2 segundos entre pulsaciones**. Estas comprobaciones solo validan la secuencia y no envían alertas. Cambiar de app durante la captura la cancela. Grabar una nueva secuencia desactiva la detección anterior.
4. Pulsa **Habilitar acceso a los botones** y, en Ajustes de Accesibilidad, habilita **EMERGEN · Secuencia de volumen**. En APK instalados fuera de una tienda Android puede bloquear el ajuste: si ocurre con este APK de confianza, abre Información de la app, menú de tres puntos y **Permitir ajustes restringidos**, y vuelve a Accesibilidad. La habilitación la realiza el usuario; los scripts no modifican ese ajuste mediante ADB.
5. Vuelve a Home y pulsa **Activar segundo plano** con EMERGEN visible. Concede ubicación (aproximada o precisa) y notificaciones si se solicitan. La tarjeta debe indicar **ACTIVADO** y Android mostrará la notificación **EMERGEN · SOS por volumen**. Comprueba **Ubicación reciente disponible para el SOS** antes de la prueba con coordenadas; también se muestra la precisión estimada. Para detenerlo usa **Desactivar segundo plano** o la acción **Desactivar** de esa notificación.
6. En Redmi/HyperOS revisa batería **Sin restricciones** para EMERGEN y, si corresponde, los ajustes de inicio automático. El botón **Permisos y batería** abre la información de la app. Son ajustes manuales del dispositivo; el código no desactiva protecciones del sistema.

Habilitar el permiso de Accesibilidad no activa por sí solo el envío. El usuario conserva el control con el botón de la app. Al desactivar, la autorización del servicio puede permanecer en Ajustes, pero deja de solicitar el filtrado de teclas y detiene la ubicación del servicio.

## Qué ocurre al completar la secuencia

- El reconocedor nativo detecta la última pulsación de la secuencia completa; no se muestra una confirmación adicional.
- El servicio consulta la prioridad guardada del perfil y utiliza el JWT de NestJS para registrar `POST /internal/v1/alertas` en FastAPI. No depende de temporizadores JavaScript ni de mantener una WebView activa.
- El mensaje, contactos, plan, permisos, ficha médica y WhatsApp siguen siendo responsabilidad de las APIs y de NestJS. No se envía WhatsApp directamente desde Android.
- El servicio mantiene ubicación mediante `FusedLocationProviderClient` de Google, el proveedor que también usa el plugin del SOS manual, y conserva GPS/red de Android como respaldo. Al disparar usa una posición reciente de hasta 60 segundos, consultada justo antes de construir la solicitud. Si no hay ninguna válida, omite la ubicación y registra el SOS sin ella, sin esperar diez segundos por el GPS. El resultado indica si la solicitud incluyó ubicación.
- La notificación distingue activación en curso, **Alerta activada**, **alerta ya activa** o un error. Si la solicitud omitió coordenadas, indica **Alerta activada sin ubicación**. No muestra números internos ni detalles del procesamiento; los resultados conservados de versiones anteriores también se simplifican. La confirmación no acredita recepción o lectura de WhatsApp.
- Una solicitud en curso no se duplica por otra secuencia. Ante pérdida de red se conserva cifrado el UUID y el contenido del intento no confirmado; repetir la secuencia reintenta ese mismo contenido. No existe un envío automático offline: la repetición es una acción del usuario.
- La restricción existente de un SOS activo por usuario continúa vigente. Para probar otra activación, primero finaliza la anterior con el PIN desde la app.

El registro sigue necesitando conexión al PC/servidor. La IP y las dos URL permanecen incorporadas en el APK mediante el modo LAN. Cambiar una URL requiere reconstruir, sincronizar e instalar la actualización.

## Android y pantalla apagada

Se utiliza un `AccessibilityService` con capacidad de filtrar teclas y un servicio en primer plano de tipo `location`. Android requiere una notificación para ese servicio; no se añade un widget. La captura devuelve las teclas al sistema para conservar el uso normal del volumen, e ignora teclas ajenas al volumen. La configuración no habilita lectura del contenido de ventanas ni ejecución de gestos.

El usuario confirmó funcionamiento con la app minimizada y la pantalla apagada en su Redmi. Desde `0.2.1` el servicio devuelve `START_STICKY`, conserva la activación por perfil y admite la recreación con Intent nulo mientras la sesión siga vigente. Retirar la interfaz de Recientes no ejecuta una desactivación. Si Accesibilidad se reconecta durante la recuperación, se admite una espera de hasta 30 segundos; la tarjeta informa **RECONECTANDO**. Desactivar desde la app o la notificación, cerrar sesión, vencer la sesión o revocar los permisos cancela la activación persistida.

La recuperación depende de Android/HyperOS y debe comprobarse en este dispositivo. Revisa batería **Sin restricciones** e inicio automático. Android/HyperOS puede interceptar teclas cuando la pantalla no está interactiva, terminar procesos o limitar la red con Doze. Una notificación activa no prueba por sí sola que el dispositivo entregue esas teclas. No se promete captura durante **Forzar detención**, después de reiniciar o si Android revoca el servicio. Si el sistema bloquea la recuperación, abre EMERGEN y actívala otra vez; no hay autoarranque de detección por boot.

Referencias oficiales: [filtrado de teclas por Accesibilidad](<https://developer.android.com/reference/android/accessibilityservice/AccessibilityService#onKeyEvent(android.view.KeyEvent)>), [tipos y requisitos de servicios en primer plano](https://developer.android.com/develop/background-work/services/fgs/service-types), [inicio del servicio desde una app visible](https://developer.android.com/develop/background-work/services/fgs/launch) y [restricciones de Doze](https://developer.android.com/training/monitoring-device-state/doze-standby).

Referencias de la corrección: [proveedor fusionado y servicio de ubicación en primer plano](https://developers.google.com/android/reference/com/google/android/gms/location/FusedLocationProviderClient) y [recuperación de servicios START_STICKY](https://developer.android.com/reference/android/app/Service#START_STICKY). No se inicia un servicio de ubicación nuevo desde el fondo para eludir las restricciones de Android.

## Sesión y almacenamiento

La sesión dura **2 horas por defecto**, desde el inicio de sesión. Se configura en el servidor con `JWT_SESSION_HOURS=2`: acepta enteros de 1 a 168 horas. La variable se incluye en `example.env` y se transmite al contenedor en Compose. Reinicia NestJS al cambiarla; para Docker usa `docker compose up -d --build backend`. El cambio aplica a los JWT nuevos de web, APK y panel; los existentes conservan su vencimiento. Tras pasar de cuatro a dos horas, el usuario debe cerrar sesión e ingresar una vez. No es necesario reconstruir el APK para cambiar solo esta duración.

La tarjeta muestra el vencimiento del JWT real; no inventa un plazo a partir de la activación. Al vencer se desactiva la detección y se informa al usuario; debe volver a iniciar sesión y activarla. No se añadieron contraseñas ni renovación automática. Cerrar sesión o cambiar de perfil desactiva la detección anterior.

El JWT y el intento sin confirmar se cifran con AES-GCM y una clave no exportable de Android Keystore. No se guardan contraseñas. La secuencia se conserva localmente por perfil y dispositivo; no se modificó `init.sql` ni se añadieron tablas. Las otras teclas y el contenido de otras apps no se registran. En web se explica que la función necesita el APK; se eliminó la simulación con botones de pantalla.

## Código y comprobaciones

Fuentes principales:

- `apps/mobile/src/components/ConfigurarAlerta.tsx`: grabación física, dos pruebas y guardado.
- `apps/mobile/src/components/AlertaVolumen.tsx`: estado, permisos, activación/desactivación y resultado.
- `apps/mobile/src/components/AlertaVolumen.css`: secciones, separación, estado visual y botones.
- `apps/mobile/src/lib/volumen-nativo.ts`, `session.ts` y `App.tsx`: puente y sincronización/cierre de sesión.
- `apps/mobile/android/app/src/main/java/com/emergen/mobile/VolumeSos*.java`: plugin, servicios, credenciales, petición y coordinación nativa.
- `VolumeSequenceMatcher.java`: reconocedor independiente de Android y de la red.
- `VolumeSosLocation.java` y `VolumeLocationPolicy.java`: proveedor, estado y validación de antigüedad/coordenadas.
- `apps/backend/src/config/session.ts` y `login/login.module.ts`: duración del JWT.
- `MainActivity.java`, manifest y recursos XML: registro del plugin, captura durante configuración, servicios y permisos.

Comandos desde la raíz del monorepo:

```powershell
npm run test.unit --workspace=mobile -- --run
npm run test --workspace=backend -- --runInBand src/config/session.spec.ts src/admin/admin-acceso.spec.ts
.\scripts\test-volume-native.ps1
npm run android:apk --workspace=mobile
```

Resultados obtenidos antes de la prueba final del usuario:

| Comprobación                                          | Resultado                                                                     |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| TypeScript y ESLint de la integración                 | Aprobados                                                                     |
| Suite móvil                                           | 45 tests aprobados en 7 archivos                                              |
| Sesión y autorización del backend                     | 20 tests aprobados en 2 suites                                                |
| Reconocedor y política de ubicación nativos con JUnit | 9 tests aprobados, sin red ni envío SOS                                       |
| Compilación APK                                       | `assembleDebug` aprobado                                                      |
| Instalación en Redmi Note 13 Pro, Android 16/API 36   | Aprobada, versión `0.2.2-lan-debug`, `versionCode 5`                          |
| Plugin nativo desde la WebView                        | Detección activa, secuencia conservada y ubicación reciente disponible        |
| CORS y disponibilidad de ambas APIs LAN               | Aprobados                                                                     |
| Accesibilidad y permisos                              | Aprobados; el usuario reactivó y el estado nativo confirmó la conexión        |
| Combinación que registra SOS y recibe WhatsApp        | Funcionamiento de 0.2.1 confirmado por el usuario, incluida ubicación         |
| Activación con pantalla apagada                       | Envío con app minimizada confirmado; servicio conservado al retirar Recientes |

El worker de `testDebugUnitTest` de Gradle no pudo cargar la clase de prueba en esta ruta Windows. Las clases compilaron y las nueve pruebas pasaron con JUnit directo. `test-volume-native.ps1` reproduce esa comprobación con el mismo JDK y clases, sin cambiar las versiones de Gradle o AGP. No se atribuye el fallo del worker a un defecto del reconocedor.

APK generado en `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`: **5.917.837 bytes**, SHA-256 `61D9DE8073CD05A7D568694C89D71A8CE9675E55E3249464178C5E517B37EB35`.

Durante la preparación física se confirmó el guardado de la secuencia. Se corrigió la comprobación del permiso de Accesibilidad para admitir tanto el nombre completo como la forma abreviada de su componente Android, y se reinstaló la actualización conservando la configuración.

En la validación anterior de `0.2.1` se verificó una sesión de cuatro horas, detección activa, Accesibilidad conectada y ubicación reciente con precisión estimada de 10,44 m. El usuario confirmó la continuidad al retirar EMERGEN de Recientes y, posteriormente, el funcionamiento exitoso de la prueba real. En `0.2.2`, las pruebas de JWT verifican la nueva duración por defecto de **7200 segundos**. La revisión del APK confirmó cuatro secciones, separación de 20 px, espacios internos de 12 px, ausencia de desbordamiento horizontal y resultado **Alerta activada**. Tras actualizar, vuelve a iniciar sesión para recibir las dos horas y reactiva la detección.

## Prueba final del usuario

Con sesión nueva de dos horas, servicio **ACTIVADO**, **Ubicación reciente disponible**, plan, contactos y prioridad guardados, y sin otro SOS activo:

1. Minimiza EMERGEN y pulsa tu secuencia. Comprueba registro, prioridad, ubicación si está disponible y recepción por el contacto de prueba.
2. Finaliza ese SOS con PIN.
3. Retira EMERGEN de Recientes y comprueba que la notificación del servicio continúa. Bloquea/apaga la pantalla y repite la secuencia. Comprueba si HyperOS entrega los eventos y se registra un nuevo SOS con ubicación.
4. Indica qué casos funcionaron y cualquier mensaje mostrado. Si el cierre de Recientes termina el servicio a pesar de los ajustes de batería/inicio automático, registra esa limitación del dispositivo para analizarla por separado.

No cambies prioridad o contactos para una prueba automática. La recepción se confirma con el contacto; el contador «enviado» del servidor solo acredita el despacho registrado.
