# APK debug LAN: implementación y validación del 28-10-2026

Este informe conserva la evidencia del APK inicial `0.1.0-lan-debug`. El archivo de salida fue sustituido posteriormente por `0.1.1-lan-debug`, que corrige la actualización de soporte; ver la actualización al final del informe. El SHA-256 del artefacto inicial no identifica el APK actualizado.

## Resultado

| Etapa                                 | Resultado     | Evidencia                                                                                                                                                                               |
| ------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ambiente preparado                    | **aprobado**  | Android Studio 2026.2.1; SDK Platform 36; Build-Tools 36.0.0; ADB 37.0.1; Gradle Wrapper 8.14.3 con JDK 21 verificado. APIs accesibles por LAN y firewall limitado.                     |
| APK debug compilado                   | **aprobado**  | `assembleDebug` finalizó correctamente. Identidad `com.emergen.mobile`, versión `0.1.0-lan-debug`, minSdk 24 y target/compileSdk 36. Firma debug verificada.                            |
| Recorrido principal en teléfono       | **aprobado**  | Instalado y actualizado en Redmi Note 13 Pro, Android 16/API 36. Comprobaciones de WebView y GPS reales; el usuario confirmó el recorrido funcional solicitado.                         |
| Escenarios de degradación en teléfono | **pendiente** | No se completaron todos los casos de permisos aproximados/denegados, pérdida de red, JWT vencido o desconexión de WhatsApp. No confundir los tests simulados con estas pruebas físicas. |

No se modificó `init.sql`, no se reinicializó PostgreSQL, no se cargaron fixtures ni migraciones en esta ejecución y no se crearon commits o publicaciones. Las pruebas automáticas no enviaron SOS, tickets ni mensajes de WhatsApp. El usuario realizó las operaciones de prueba desde el teléfono.

## Artefacto entregado

Ruta relativa a la raíz del monorepo:

```text
apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

- Nombre instalado: **EMERGEN LAN**.
- `applicationId`: `com.emergen.mobile` (identidad provisional estable).
- `versionCode`: `1`; `versionName`: `0.1.0-lan-debug`.
- Tamaño: **6.312.602 bytes**.
- SHA-256: `A6E5546FAE5E77895A9A48D2F2CEA4663619D8C8DAAE590B39789EEF33FD7599`.
- Firma: Android Debug, verificada con `apksigner`. No se creó una clave de producción.
- Las dos URL LAN y la fecha de compilación están incorporadas en `assets/public/android-build.json`. No se versionan la IP ni los archivos locales de este equipo.

El APK está ignorado por Git y permanece disponible localmente. Los integrantes deben compartir el archivo por un medio acordado o reconstruirlo. Una actualización con una firma debug distinta puede ser rechazada por Android; no se desinstala automáticamente una aplicación con datos.

## Decisiones de implementación

- Capacitor core/CLI/Android **8.5.2**; Geolocation **8.2.4**, compatible con la versión mayor existente. Se actualizó el único lockfile mediante npm workspaces.
- Assets empaquetados con `webDir: 'dist'`, sin `server.url`. Origen efectivo de la WebView comprobado: **`https://localhost`**, plataforma **android**.
- Modalidad principal: NestJS local **3000**, FastAPI **8000**, PostgreSQL existente en Docker. El backend de Docker continúa siendo una alternativa en **3001**, documentada por separado.
- Modo `android-lan`: ambas URL obligatorias con IPv4 privada, plantilla pública y archivo local ignorado; rechaza localhost, valores sin reemplazar y simulación de coordenadas.
- `android:prepare` y `android:apk` reconstruyen antes de sincronizar, comprobando el marcador de assets. La carpeta Android existente se conserva.
- HTTP: manifest principal con cleartext desactivado; overlay **debug** con cleartext activado. `BuildConfig.DEBUG` limita la excepción de contenido mixto. Capacitor conserva `allowMixedContent: false` como base y release utiliza `MIXED_CONTENT_NEVER_ALLOW`.
- Geolocalización nativa en Android; ruta web conservada. COARSE/FINE en primer plano, aceptación de permiso aproximado, límite total de 10 segundos, caché de posición de 30 segundos y continuación del SOS sin coordenadas si falla. GPS opcional, sin permiso de ubicación en segundo plano.
- JDK **Temurin 21.0.12.1+1-LTS** portátil en `.android-tools/`, ignorado y separado de `node_modules`. Android Studio se ejecuta con JBR 25.0.3; la compilación usa Java 21. Gradle JDK local configurado con `GRADLE_LOCAL_JAVA_HOME`; el log del IDE confirmó Java 21 y Gradle Sync satisfactorio. El Wrapper confirmó Launcher/Daemon JVM 21.
- Configuración particular en `.android.local.json`, `local.properties`, `.gradle/config.properties` y archivos `.env` ignorados. El helper escapa Unicode en propiedades Java para preservar la ruta «Aplicación».
- Regla de firewall para TCP 3000 y 8000: entrada, perfil Privado y `LocalSubnet`. La Wi-Fi de confianza se cambió a Privado con autorización del usuario. No se añadió ninguna regla para PostgreSQL.
- Se hizo explícita la escucha de NestJS en `HOST` o `0.0.0.0`; se reinició FastAPI en `0.0.0.0`. CORS conserva los clientes web y permite el origen exacto Android.
- Una respuesta 401 protegida explica cómo cerrar sesión y volver a ingresar. No se añadió renovación automática del JWT.
- Las pantallas de secuencia de volumen indican que son simulación sin persistencia ni envío. No se implementaron botones físicos, segundo plano, push ni cola offline.
- Se corrigió el contraste observado con el modo oscuro del Redmi manteniendo el tema claro ya utilizado por EMERGEN.

## Comandos y comprobaciones ejecutadas

Las rutas y el procedimiento reproducible para otros equipos están en la [sección 11 del README](../README.md#11-apk-android-de-depuración-preparación-local-y-pruebas-en-red-lan).

| Comando/acción                                                                                                           | Resultado final                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run build --workspace=mobile` antes de los cambios                                                                  | **aprobado**. Sin errores TypeScript; advertencias de CSS de Ionic y tamaño de chunks.                                                                                   |
| `npm install --workspace=mobile --save-exact @capacitor/android@8.5.2 @capacitor/geolocation@8.2.4 --no-audit --no-fund` | **aprobado**. Dos dependencias directas y una transitiva; un solo lockfile.                                                                                              |
| Consulta de Android Studio/product-info, SDK, JBR, ADB e IP de adaptadores                                               | **aprobado**. Studio 2026.2.1, SDK 37 inicialmente; se añadió Platform 36 para la plantilla real.                                                                        |
| Descarga de JDK 21 y Android Command-line Tools                                                                          | **aprobado**. SHA-256 verificados; SDK Platform 36 instalado sobre el SDK existente.                                                                                     |
| `npm run android:prepare --workspace=mobile`                                                                             | **aprobado**. Build LAN, generación inicial con `cap add android` y `cap sync android`; Geolocation registrado entre cinco plugins.                                      |
| `npm run test.unit --workspace=mobile -- --run`                                                                          | **aprobado**. **33 tests en 5 archivos**: SOS, ubicación web/nativa, sesión y reglas compartidas.                                                                        |
| `node --test scripts/android-lan-env.test.mjs`                                                                           | **aprobado**. **3 tests**, incluidas URL incompletas/localhost y simulación prohibida en LAN.                                                                            |
| TypeScript del móvil y `tsconfig.node.json`; ESLint de los archivos TypeScript de configuración y librerías modificados  | **aprobado**. Se corrigió el tipado del plugin de metadatos de Vite.                                                                                                     |
| `node scripts/check-android-lan.mjs`                                                                                     | **aprobado**. GET sin efectos, preflight con Authorization/Content-Type y origen exacto en ambas APIs; origen ajeno sin autorización CORS.                               |
| `docker compose ps` y diagnóstico SQL de solo lectura                                                                    | **aprobado**. PostgreSQL disponible; consultas autenticadas del teléfono comprobaron acceso real a datos.                                                                |
| `node scripts/verify-schema.cjs`                                                                                         | **falló**, por diferencias previas documentadas abajo; no por una columna faltante para Android.                                                                         |
| `gradlew.bat --version`                                                                                                  | **aprobado**. Gradle 8.14.3 y JVM 21 tanto antes como después de conservar el JDK en la carpeta local estable.                                                           |
| `npm run android:apk --workspace=mobile`                                                                                 | **aprobado**. Ciclo completo; último `assembleDebug`: **BUILD SUCCESSFUL**, 245 tareas, 40 segundos.                                                                     |
| `gradlew.bat processDebugMainManifest processReleaseMainManifest --no-daemon`                                            | **aprobado**. Cleartext `true` en debug y `false` en release. No se construyó ni publicó una release.                                                                    |
| `cap open android`, selección local de Gradle JDK y Gradle Sync en Studio                                                | **aprobado**. IDE abierto; log confirmó uso de Java 21 y finalización de Sync.                                                                                           |
| `aapt dump badging`, `apksigner verify --print-certs` e inspección del ZIP                                               | **aprobado**. Identidad, versión, SDK, permisos, firma y assets empaquetados comprobados.                                                                                |
| `adb devices -l`, `adb install -r`, apertura de MainActivity y actualización posterior                                   | **aprobado**. Redmi autorizado; instalación y actualización con conservación de datos.                                                                                   |
| Inspección CDP de la WebView de EMERGEN                                                                                  | **aprobado**. Origen HTTPS local; ambos endpoints accesibles por LAN; respuestas 401 legibles con token inválido y respuestas 200 con la sesión iniciada por el usuario. |
| Plugin nativo en el Redmi con permiso preciso                                                                            | **aprobado**. Coordenadas válidas, precisión informada de aproximadamente 18 m. No se imprimió ni guardó su valor exacto en el informe.                                  |
| Prettier y `git diff --check`                                                                                            | **aprobado**. Documentación/configuración con formato válido; sin errores de whitespace.                                                                                 |

Advertencias no bloqueantes: CSS `host-context` de Ionic, chunks de Vite mayores que 500 kB, repositorios `flatDir`, funciones Gradle obsoletas para una futura actualización mayor y `android.overridePathCheck` experimental. No se actualizaron versiones mayores para ocultarlas.

## Matriz funcional

«Aprobado» indica la evidencia específica de la fila. Una consulta GET aprobada no sustituye una prueba de edición; el reporte manual del usuario se identifica por separado.

| Caso                                                 | Resultado     | Evidencia o trabajo pendiente                                                                                                                                                  |
| ---------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Instalación y actualización                          | **aprobado**  | ADB devolvió `Success`; identidad y versión instaladas comprobadas.                                                                                                            |
| Apertura desde la aplicación con assets empaquetados | **aprobado**  | WebView `https://localhost`, assets del APK y Home visibles. Sin `server.url` ni dependencia de Vite. Los procesos Vite previos del usuario no se detuvieron.                  |
| Login/PIN                                            | **aprobado**  | Usuario inició sesión; Home y consultas protegidas con su sesión devolvieron 200; confirmación manual satisfactoria.                                                           |
| Navegación, teclado y botón Atrás                    | **pendiente** | Recorrido principal reportado satisfactorio; falta una comprobación dirigida de todos los comportamientos del teclado y Atrás.                                                 |
| Zonas seguras, contraste y ancho de pantalla         | **aprobado**  | Captura privada del Home legible, sin desbordamiento horizontal: viewport/scrollWidth 406 px. Falta ampliar a rotación y otros dispositivos.                                   |
| Perfil y edición de antecedentes médicos             | **aprobado**  | Consulta protegida 200; el usuario confirmó explícitamente la modificación del antecedente médico.                                                                             |
| Contactos y cuentas vinculadas                       | **aprobado**  | Perfil con contactos, resumen de cupos y cuentas vinculadas: 200; usuario confirmó el recorrido consultado.                                                                    |
| Soporte                                              | **aprobado**  | Catálogo y listado protegidos: 200; usuario confirmó que las funciones del recorrido se completan. No se creó un ticket automáticamente.                                       |
| SOS con coordenadas reales                           | **aprobado**  | GPS nativo válido; alerta persistida con formato de coordenadas reales; usuario confirmó ubicación precisa recibida.                                                           |
| Ubicación solo aproximada                            | **pendiente** | Test unitario aprobado; falta cambiar el permiso y comprobar el caso físicamente.                                                                                              |
| Permiso denegado/persistente                         | **pendiente** | Tests unitarios aprobados; falta recorrido físico y aviso con envío sin coordenadas.                                                                                           |
| GPS desactivado                                      | **pendiente** | Se observó `OS-PLUG-GLOC-0007` real antes de que el usuario activara Ubicación. Falta probar el SOS sin ubicación en ese estado.                                               |
| Timeout de ubicación                                 | **pendiente** | Tests del límite total y respuestas tardías aprobados; falta reproducir el timeout en el teléfono.                                                                             |
| Registro y despacho de WhatsApp                      | **aprobado**  | SOS del usuario persistido; consulta posterior mostró un despacho de activación registrado, sin pendientes ni fallidos.                                                        |
| Recepción por contacto de prueba                     | **aprobado**  | Confirmación manual del usuario al recorrido solicitado, incluida ubicación precisa. La recepción no se deduce únicamente del contador enviado.                                |
| Finalización con PIN y aviso de cierre               | **aprobado**  | Usuario confirmó cierre; estado `FINALIZADA` observado y un despacho de cierre registrado, sin pendientes ni fallidos.                                                         |
| SOS ya activo                                        | **pendiente** | Restricción conservada en servidor; no se forzó una segunda activación en la prueba física.                                                                                    |
| Reintentos e idempotencia                            | **pendiente** | Tests de conservación de UUID/contenido y ausencia de éxito falso aprobados; falta fallo de red controlado en el dispositivo.                                                  |
| API inaccesible/pérdida de red                       | **pendiente** | Tests de error de red aprobados; falta recorrido en modo avión o con un servicio detenido.                                                                                     |
| JWT vencido                                          | **pendiente** | Tests del mensaje 401 y rechazo nativo a token inválido aprobados. No se esperó una hora ni se cambió la duración de la sesión.                                                |
| WhatsApp desconectado                                | **pendiente** | No se desconectó la sesión del emisor para provocar fallos. Un despacho registrado demuestra disponibilidad al enviar, no una comprobación administrativa continua del estado. |
| Reapertura y recuperación                            | **aprobado**  | La actualización conservó la sesión y la app recuperó el estado del servidor; el Home mostró el SOS finalizado.                                                                |
| Nueva compilación con URL distinta de localhost      | **aprobado**  | Baseline web con configuración anterior y builds posteriores LAN; URLs actuales comprobadas en metadatos y peticiones reales.                                                  |

Confirmación del usuario: «Por ahora, todas las funciones se completan exitosamente, y la ubicación se entrega precisa, junto con el cierre de la alerta e incluso modificación de usuario (antecedente medico)». No se solicitaron credenciales, PIN ni tokens por el chat.

## Incidencias resueltas y diferencia de esquema

1. La CLI de Capacitor y algunas herramientas no pudieron consultar el usuario/red dentro del entorno restringido; las acciones necesarias se ejecutaron con la autorización correspondiente fuera de esa restricción.
2. AGP rechazó la ruta con caracteres no ASCII. Se conservó la ubicación del repositorio y se configuró `android.overridePathCheck=true`; las compilaciones posteriores finalizaron.
3. La generación de `BuildConfig` estaba desactivada por defecto. Se habilitó explícitamente para compilar la condición que limita contenido mixto a debug.
4. El Redmi primero apareció `unauthorized`; el usuario aceptó RSA. Después rechazó la instalación con `INSTALL_FAILED_USER_RESTRICTED`; el usuario habilitó Instalar vía USB y el reintento/actualización finalizaron con `Success`.
5. Un diagnóstico inicial con GET simple a la raíz de NestJS tuvo timeouts intermitentes. Las comprobaciones finales con cabeceras JSON y sin caché, equivalentes al cliente, devolvieron 200/401 esperados; las consultas autenticadas funcionales devolvieron 200. No se atribuye una causa definitiva a ese timeout inicial.
6. El tema oscuro del teléfono reducía el contraste del acceso. Se mantuvo el esquema claro de la app tanto en HTML/CSS como en el tema nativo; se reconstruyó e instaló el APK final.

`verify-schema.cjs` compara estrictamente las columnas contra el archivo protegido `init.sql`. La base instalada tiene columnas adicionales procedentes de migraciones ya existentes:

- `contacto_emergencia.compartir_antecedentes`.
- `soporte.trabajador_id`, `trabajador_nombre` y `trabajador_correo`.

El diagnóstico no encontró columnas esperadas ausentes. Las consultas reales de perfil/contactos y soporte funcionaron. No se corrigió `init.sql` ni se borraron esas columnas para hacer pasar el comparador. Como mejora posterior, revisar el comparador para considerar las migraciones aplicadas; cualquier modificación propia de `init.sql` requiere autorización expresa.

## Archivos y pasos siguientes

Cambios principales: `apps/mobile/android/` (fuentes, recursos y Wrapper), `capacitor.config.ts`, `package.json` móvil y lockfile, modo/plantillas LAN, scripts Android y diagnóstico, geolocalización y sus tests, mensajes de sesión 401, indicación de simulación, tema claro, escucha NestJS, parámetro de arranque LAN de FastAPI, reglas de ignore y README. Los archivos locales de SDK/JDK, red y secretos no se versionan.

El recorrido principal quedó validado. Quedan las filas pendientes de degradación y controles de interfaz dirigidos de la matriz; cada una debe registrarse con su propio resultado. Las funciones de segundo plano, push, botones físicos y cola offline pertenecen a una etapa posterior. Los cambios de código o URL se distribuyen repitiendo `npm run android:apk --workspace=mobile` e instalando el archivo actualizado; los cambios siguen pendientes para revisión y commit del usuario.

## Actualización 0.1.1: estado de soporte sincronizado

La comprobación inicial de soporte cubrió la consulta de categorías/listados, pero no detectó que un ticket cerrado desde el panel continuaba como `ABIERTO` en la pantalla móvil ya abierta. `Soporte.tsx` solo cargaba al montar o crear una solicitud, y la navegación de Ionic conserva la pantalla en memoria.

La versión `0.1.1-lan-debug` (`versionCode 2`) consulta estado y solución cada tres segundos mientras soporte está visible y en primer plano. Refresca al regresar o reanudar la app y añade **Actualizar**. Cancela las peticiones al salir, conserva borradores y detalles desplegados y se recupera de fallos de red mostrando un aviso mientras los datos puedan estar desactualizados. El catálogo se consulta una vez por ciclo visible, no en cada actualización periódica.

Se añadieron cinco pruebas de regresión: cierre/solución sin perder el borrador, salida/entrada de la página Ionic, pausa/reanudación nativa, recuperación de red y actualización manual/limpieza de listeners. La suite móvil completa pasó **38 tests en 6 archivos**; TypeScript y ESLint de los archivos modificados pasaron. No se cambió la lógica de cierre del panel ni la base de datos.

El nuevo `assembleDebug` finalizó correctamente en 19 segundos y el APK se instaló con `adb install -r` en el Redmi, conservando los datos. La verificación de la WebView real comparó dos solicitudes: ambas estaban `CERRADO` en la API y en la pantalla. Se observaron cuatro consultas automáticas durante el recorrido de entrada y espera; el botón **Actualizar** estaba disponible. No se creó ni cambió ningún ticket para esta comprobación.

Artefacto actualizado en la misma ruta de salida: **5.887.411 bytes**, versión `0.1.1-lan-debug`, `versionCode 2`, SHA-256 `5E1BC6F8D9F48F423279691EA1022284807D31E2F56E070FAA2B917FADBE07AB`.
