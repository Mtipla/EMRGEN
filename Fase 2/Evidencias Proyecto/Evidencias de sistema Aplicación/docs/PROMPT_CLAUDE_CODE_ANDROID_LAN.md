# Prompt para Claude Code: entorno local y APK Android

Actualizado el 29-10-2026 para la implementación `0.2.2`. Copia este prompt en Claude Code desde el repositorio del integrante.

---

Trabaja directamente sobre el repositorio EMRGEN para preparar el entorno local de este integrante, compilar el APK Android de depuración e instalarlo en su teléfono. Utiliza la implementación y los scripts existentes; completa el trabajo disponible, no te limites a entregar un diagnóstico.

## 1. Lee las instrucciones y confirma el entorno

Lee las instrucciones aplicables, incluido AGENTS.md, y localiza la raíz del monorepo, que contiene package.json, package-lock.json y docker-compose.yml. Normalmente está en:

```text
Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/
```

Lee README.md, especialmente «APK Android de depuración: preparación local y pruebas en red LAN», y docs/SOS_VOLUMEN_ANDROID.md. Consulta docs/APK_DEBUG_LAN_2026-10-28.md como evidencia histórica de la primera preparación; no uses su versión, hash ni alcance antiguo como estado actual.

Respeta estas condiciones:

- No modificar init.sql.
- No eliminar volúmenes, reinicializar bases existentes ni borrar datos.
- No crear commits ni hacer push.
- Conservar cambios previos del integrante.
- No mostrar contraseñas, tokens, PIN, claves médicas ni sesiones de WhatsApp.
- No sobrescribir archivos locales de configuración existentes con plantillas. Si necesitas ajustar un valor, modifica solo ese dato y conserva el resto.
- No regenerar la integración Android, sustituir los servicios nativos ni modificar permisos o reglas de negocio para eludir un fallo de configuración.

Confirma el sistema operativo, las herramientas instaladas, el modelo del teléfono y su versión de Android. Si el sistema no es Windows, adapta los comandos y explica cualquier limitación de los scripts PowerShell.

## 2. Define la modalidad de trabajo

Pregunta si este integrante ejecutará sus propios servicios o utilizará un PC compartido. Comprueba primero la configuración existente para evitar preguntas ya resueltas.

La modalidad principal documentada utiliza:

- PostgreSQL en Docker.
- NestJS local en 3000.
- FastAPI en 8000.
- Teléfono y PC en la misma red local.

NestJS en Docker es una alternativa que publica el puerto 3001. Elige una modalidad y mantén coherentes las instrucciones y las URL. FastAPI continúa fuera de Compose. Mantén una sola instancia emisora utilizando una misma sesión de WhatsApp; no inicies otro emisor para resolver un problema de red.

Si se utiliza un PC compartido, identifica su IP y los puertos reales. No instales otra base ni solicites secretos del servidor cuando solo se necesita compilar y conectar el teléfono a ese equipo.

Identifica la IPv4 LAN real del PC servidor. No copies la IP del autor del README ni utilices direcciones de Docker, WSL, VPN o localhost como dirección LAN.

## 3. Prepara dependencias y herramientas Android

Comprueba las versiones declaradas en el repositorio y respeta el único lockfile. Ejecuta npm ci desde la raíz del monorepo cuando corresponda.

Revisa Android Studio, SDK, Build-Tools, Platform-Tools/ADB y el JDK efectivo. La implementación documentada utiliza JDK 21, compileSdk/targetSdk 36 y minSdk 24; confirma los archivos del proyecto antes de actuar.

No actualices Capacitor, Gradle o AGP a otra versión mayor para resolver un problema de configuración. Utiliza el Gradle Wrapper existente. Conserva las versiones de los plugins y el proveedor de ubicación declaradas en el proyecto.

Distingue el Java que ejecuta Android Studio del JDK que ejecuta Gradle. Comprueba la selección del IDE y gradlew --version.

Configura .android.local.json a partir de .android.local.example.json solo si falta, con las rutas reales del integrante. Utiliza scripts/android-env.ps1 cuando corresponda. Conserva las rutas particulares y herramientas locales fuera de Git.

## 4. Configura servicios y red

Utiliza example.env y .env.android-lan.example como referencias. Solicita al integrante que complete los secretos directamente en sus archivos locales, sin pegarlos en el chat.

Configura ambas URL en .env.android-lan.local:

- VITE_API_URL hacia NestJS, puerto 3000 o 3001 según la modalidad elegida.
- VITE_INTERNAL_API_URL hacia FastAPI, puerto 8000.

Respeta la precedencia de los archivos .env y las variables del proceso. Comprueba que ninguna definición anterior sobrescriba las URL seleccionadas. Las variables VITE_* son públicas y se incorporan al compilar: no incluyas secretos en ellas.

Prepara o verifica la base mediante los mecanismos existentes. Antes de ejecutar migraciones o cargar fixtures, inspecciona qué hacen y si son necesarios. Conserva las claves de cifrado que correspondan a los datos existentes.

Comprueba:

- Escucha de ambas APIs en una interfaz accesible desde la LAN.
- CORS para https://localhost, conservando los orígenes web necesarios.
- Acceso desde el teléfono y desde la WebView.
- Firewall limitado a los puertos necesarios, perfil Privado y subred local.

Solicita autorización antes de cambiar el perfil de red o crear reglas administrativas. No desactives el firewall ni abras PostgreSQL para conectar el teléfono.

Conserva las excepciones HTTP limitadas a debug. No configures server.url hacia Vite: los archivos web deben ir empaquetados.

La duración actual de sesión es JWT_SESSION_HOURS=2 en el servidor, con dos horas por defecto y un intervalo permitido de 1 a 168 horas enteras. Mantén este valor salvo otra indicación del integrante. Se cuenta desde el inicio de sesión, no desde la activación del segundo plano. Cambiarlo requiere reiniciar NestJS e iniciar sesión de nuevo; no requiere reconstruir el APK. No amplíes la sesión silenciosamente ni implementes renovación automática como parte de esta preparación.

## 5. Compila e instala

Reutiliza la carpeta apps/mobile/android y los scripts existentes. Desde la raíz del monorepo, revisa y utiliza:

```powershell
. .\scripts\android-env.ps1
npm run android:prepare --workspace=mobile
# Solo si necesitas trabajar con el IDE:
npm run android:open --workspace=mobile
npm run android:apk --workspace=mobile
```

android:apk ya reconstruye la web en modo LAN, sincroniza Capacitor y compila el APK. Evita repeticiones innecesarias una vez verificado el entorno. No continúes con archivos compilados antiguos si falla una etapa.

La salida habitual es:

```text
apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

Comprueba versión, fecha, firma debug y SHA-256 del APK generado. La referencia de esta actualización es appId com.emergen.mobile, nombre EMERGEN LAN, versión 0.2.2-lan-debug y versionCode 5; prevalecen los archivos del repositorio si ya existe una actualización posterior. No copies hashes históricos como resultado de una nueva compilación.

Para instalar, comprueba adb devices y la autorización RSA. Algunos fabricantes requieren además «Instalar vía USB». Instala con adb install -r, conservando los datos.

Si aparece una incompatibilidad de firmas entre PCs, explica el problema y solicita una decisión antes de desinstalar o borrar datos. No generes claves de producción ni publiques una release en esta tarea.

## 6. Configura la secuencia de volumen y el segundo plano

Estas funciones ya están implementadas; deben configurarse y validarse, no tratarse como simulaciones ni desarrollos pendientes.

Con una sesión válida, plan efectivo, contactos propios de prueba y prioridad guardada del perfil:

1. Graba desde «Configurar alerta» una secuencia de 3 a 12 pulsaciones físicas, incluyendo Volumen + y Volumen −. Mantén como máximo dos segundos entre pulsaciones; una pulsación mantenida cuenta una vez.
2. Completa las dos comprobaciones dentro del asistente. Estas comprobaciones no envían alertas y grabar desactiva la detección anterior.
3. El integrante debe habilitar manualmente «EMERGEN · Secuencia de volumen» en Ajustes de Accesibilidad. El servicio solo utiliza las teclas de volumen, sin leer el contenido de otras apps. No lo habilites mediante ADB ni modifiques ajustes seguros para omitir la decisión del usuario.
4. Si Android bloquea Accesibilidad por tratarse de un APK instalado fuera de una tienda, explica cómo permitir los ajustes restringidos para esta app desde su información, si esa opción está disponible. No desactives protecciones generales del teléfono.
5. Vuelve a EMERGEN y pulsa «Activar segundo plano» con la app visible. Concede ubicación y notificaciones desde los diálogos del sistema. Comprueba ACTIVADO, la notificación del servicio y «Ubicación reciente disponible para el SOS». Habilitar Accesibilidad por sí solo no activa el envío.
6. Revisa los ajustes de batería y actividad en segundo plano del fabricante. El servicio intenta continuar al retirar la app de Recientes; el resultado debe verificarse en cada teléfono. No prometas ejecución tras Forzar detención, reiniciar, revocar permisos o vencer la sesión.

La secuencia dispara sin confirmación adicional y utiliza la prioridad guardada del perfil activo; no inventa una prioridad ausente. La ubicación por volumen usa el proveedor fusionado y respaldo GPS/red, y acepta una posición de hasta 60 segundos. Si no hay una posición reciente, puede enviar sin ubicación. No bloquees el SOS esperando indefinidamente ni introduzcas coordenadas simuladas.

Cerrar sesión o cambiar de perfil desactiva la detección anterior. La secuencia se guarda por perfil y dispositivo; no se hereda automáticamente de la cuenta principal. Después de una actualización del APK, comprueba de nuevo el estado y reactiva desde la app si corresponde. Si Accesibilidad quedó habilitada pero desconectada, el integrante puede desactivarla y habilitarla de nuevo en Ajustes.

## 7. Valida con el integrante

Verifica las pruebas disponibles y realiza el recorrido del teléfono:

- Apertura con los archivos empaquetados.
- Login, selección de perfil y PIN.
- Perfil, antecedentes médicos, contactos y cuentas conforme a los permisos del perfil.
- Creación de soporte y actualización de su estado/solución tras modificarlo en el panel.
- SOS manual con ubicación real cuando esté disponible.
- SOS por volumen con la app minimizada y, por separado, tras retirarla de Recientes y apagar la pantalla.
- Recepción del WhatsApp con coordenadas, enlace/pin de ubicación y finalización con el PIN efectivo. Finaliza cada alerta antes de intentar otra.
- Desactivación del segundo plano desde la app o la notificación y correcta información del vencimiento de sesión.

El integrante debe realizar personalmente todos los envíos a contactos identificados de prueba, incluida la combinación final de botones fuera del asistente. No envíes un POST de SOS ni inyectes una secuencia de teclas con ADB para dispararlo. No generes mensajes automáticos a contactos personales. Continúa con consultas y verificaciones sin efectos secundarios mientras esperas las pruebas manuales.

Para WhatsApp, comprueba la integración del servidor: WHATSAPP_ENABLED=true no demuestra que esté conectada. Evita utilizar simultáneamente la misma sesión emisora desde varias instancias.

Distingue SOS registrado, despacho registrado y recepción confirmada por el contacto. El aviso «Alerta activada» no certifica recepción o lectura del mensaje.

Si se usa un apadrinado, comprueba sus permisos sin cambiarlos para superar un bloqueo. Usa el plan de su principal, pero sus propios contactos, prioridad, mensaje y antecedentes. El acceso parcial tiene restricciones de edición y requiere el PIN de la principal para finalizar SOS; el acceso completo utiliza su propio PIN. Ningún apadrinado puede administrar otras cuentas apadrinadas. Consulta la sección de perfiles del README.

Revisa y ejecuta las comprobaciones apropiadas desde la raíz:

```powershell
node --test scripts/android-lan-env.test.mjs
npm run test.unit --workspace=mobile -- --run
node scripts/check-android-lan.mjs
.\scripts\test-volume-native.ps1
```

La prueba nativa utiliza JUnit directo tras compilar las clases para evitar el fallo de carga observado en el worker de Gradle con la ruta Windows de referencia. No sustituye la prueba física del teléfono. Las suites de integración de las APIs pueden escribir fixtures: inspecciónalas y coordínalas antes de ejecutarlas sobre una base compartida.

Documenta los escenarios pendientes o fallidos. Las notificaciones push, una cola automática offline y el autoarranque tras reiniciar continúan fuera de esta preparación. No marques validado un dispositivo solo porque la función se probó en el teléfono de otro integrante.

## 8. Entrega y explica el uso posterior

Entrega:

- Versiones verificadas y configuración adoptada.
- Archivos modificados, sin secretos.
- Comandos ejecutados y resultados.
- Ruta, versión y hash del APK.
- Pruebas aprobadas, fallidas y pendientes.
- Estado final de Accesibilidad, ubicación, detección y sesión, sin publicar coordenadas ni credenciales.

Distingue ambiente preparado, APK compilado y funcionamiento validado en teléfono.

Explica que después de instalar no se necesita USB, depuración, Android Studio ni Vite para utilizar la app. Sí deben estar disponibles los servicios y la red configurados. La detección debe estar activada y la sesión vigente.

Si cambia la IP o una URL incorporada al APK, debe repetirse compilación web, sincronización, compilación nativa e instalación. Cambiar solo CORS, la duración de sesión o una configuración del servidor requiere actuar sobre el servicio correspondiente y, para la duración, iniciar sesión de nuevo.

Pregunta cuando falten decisiones o datos indispensables y continúa con las comprobaciones independientes mientras esperas.
