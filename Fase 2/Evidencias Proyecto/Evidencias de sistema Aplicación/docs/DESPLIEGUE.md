# Entornos y preparación de hosting

La política vigente de ciberseguridad, límites, variables y aplicación/rollback está en [OPERACION_SEGURA.md](OPERACION_SEGURA.md); los permisos se describen en una [propuesta no aplicada](PERMISOS_BD_PROPUESTA.md). docker-compose.production.yml es una referencia separada, no una actualización automática del Compose local. deploy/production.env.example contiene placeholders de servidor y no reemplaza las plantillas públicas Vite.

El SOS necesita **NestJS + FastAPI + el mismo PostgreSQL + un emisor WhatsApp conectado**. Que el login responda o que el contenedor esté encendido no acredita que los mensajes puedan salir.

El incidente del 29 de octubre ocurrió al cambiar el APK de NestJS local a Docker: el contenedor respondía por HTTP pero tenía WhatsApp deshabilitado. El SOS se conservó en PostgreSQL y se despachó al restablecer el emisor. El usuario confirmó recepción y finalización. No se modificó `init.sql` ni fue necesario regenerar datos.

## Elegir un entorno completo

| Entorno | NestJS que consume el cliente   | FastAPI                          | PostgreSQL visto por las APIs                  | Identificador por defecto          |
| ------- | ------------------------------- | -------------------------------- | ---------------------------------------------- | ---------------------------------- |
| Local   | PC:3000                         | PC:8000, proceso Python local    | localhost:5433                                 | local                              |
| Docker  | PC:3001 → contenedor:3000       | PC:8000 → contenedor:8000        | db:5432                                        | docker                             |
| Hosting | Dominio HTTPS público de NestJS | Dominio HTTPS público de FastAPI | Host/puerto privado o gestionado del proveedor | Definir, por ejemplo, emergen-prod |

Los puertos de una máquina local no son las URLs públicas de hosting. Los clientes usan los dominios HTTPS; las APIs escuchan en `HOST=0.0.0.0` y en el `PORT` que entregue la plataforma. FastAPI se inicia con `python run.py`; no fijar `INTERNAL_API_PORT` si el proveedor asigna `PORT`.

No iniciar FastAPI local y el contenedor FastAPI sobre el mismo puerto 8000. No abrir dos procesos con la misma sesión/número de WhatsApp. El proceso emisor y su disco deben mantenerse activos; un hosting que suspenda el proceso o borre su sistema de archivos necesita una solución de persistencia y ejecución continua antes de utilizarlo para SOS.

Para una instalación nueva o una base de una versión anterior, iniciar primero solo PostgreSQL, mantener las APIs detenidas y aplicar las migraciones versionadas antes de iniciarlas. Si la base ya contiene datos, obtener primero el respaldo descrito más abajo:

```powershell
docker compose up -d db
npm run migrate:deployment
node scripts/verify-schema.cjs
docker compose up -d --build backend internal-api
```

`migrate:deployment` ejecuta los tres scripts existentes para finalización WhatsApp, permiso de antecedentes por contacto y responsable de tickets. Es una acción explícita; no se ejecuta al importar módulos, compilar, arrancar APIs o comprobar el estado. El verificador de solo lectura compara `init.sql` **más las migraciones**, sin exigir cambios al archivo protegido. Las APIs permanecen no disponibles si faltan las columnas que necesitan esas funcionalidades.

## Archivos compartidos y secretos

`example.env` contiene marcadores, sin credenciales reales ni definiciones repetidas de JWT. Copiarlo solo si todavía no existe `.env`, completar los secretos y conservar los archivos privados fuera de Git. No copiar el `.env` privado de otra persona al repositorio.

Para local, usar `apps/backend/.env.local.example` como referencia de `apps/backend/.env.local`. FastAPI local reutiliza esa configuración de conexión; su `.env` específico puede sobrescribirla. Las variables del proceso tienen prioridad. En staging/production las APIs no cargan estos archivos locales: se configuran mediante las variables del servicio.

En las dos APIs configurar los mismos `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `EMERGEN_ENVIRONMENT` y `EMERGEN_DEPLOYMENT_ID`. `DB_HOST=db` solo tiene sentido dentro de la red de Compose. Para PostgreSQL gestionado con TLS, usar `DB_SSLMODE=verify-full` y `DB_SSL_CA_FILE` con el certificado CA del proveedor en ambos servicios; no se desactiva la validación del certificado. Para PostgreSQL de Compose en su red privada se conserva `DB_SSLMODE=disable`.

El ID de despliegue es una etiqueta de configuración: ayuda a detectar entornos mezclados y no sustituye comprobar que las conexiones apunten a la misma base. La comprobación con una sesión válida detecta también incompatibilidades de JWT o de usuario.

En NestJS también configurar:

```env
EMERGEN_ENVIRONMENT=production
EMERGEN_DEPLOYMENT_ID=emergen-prod
WHATSAPP_ENABLED=true
WHATSAPP_SENDER_PHONE=<NUMERO_INTERNACIONAL_DEL_EMISOR>
WHATSAPP_AUTH_DIR=/data/whatsapp
MEDICAL_DATA_KEYS=<LAS_MISMAS_CLAVES_QUE_CIFRARON_LAS_FICHAS>
CORS_ORIGINS=https://DOMINIO_WEB,https://localhost
```

Montar `/data/whatsapp` en almacenamiento persistente y configurar permisos de escritura para el usuario del proceso. En Compose se mantiene el volumen ya existente `volumen_emergen_whatsapp_auth` y su ruta anterior; no se crea una sesión alternativa automáticamente. Un Git clone no transfiere esta sesión. Al trasladar el emisor, detener primero la instancia anterior y transferir su estado privado de forma segura o vincular de nuevo en el destino. Ver [WhatsApp SOS](WHATSAPP_SOS.md).

No sustituir `MEDICAL_DATA_KEYS` durante el traslado de datos. Conservar todas las claves utilizadas; una clave nueva válida no puede descifrar fichas antiguas. `JWT_SECRET` debe coincidir entre las APIs; cambiarlo invalida sesiones existentes y exige volver a iniciar sesión.

En FastAPI configurar también `INTERNAL_API_DOCS_ENABLED=false` fuera de desarrollo y los mismos orígenes permitidos. Evitar `INTERNAL_API_CORS_ORIGINS=` vacío: desactiva CORS en lugar de heredar el valor común. El origen Android `https://localhost` corresponde a la WebView, no a la ubicación del servidor.

## Comprobación antes de preparar un APK o habilitar el servicio

| Ruta                         | Qué comprueba                                          | Uso                              |
| ---------------------------- | ------------------------------------------------------ | -------------------------------- |
| GET /health                  | Proceso vivo                                           | Distinguir un proceso detenido   |
| GET /health/ready            | Conexión PostgreSQL y columnas de la cola SOS          | Healthcheck de APIs/contenedores |
| GET /health/sos, solo NestJS | Lo anterior y conexión WhatsApp con el emisor esperado | Monitor del despacho SOS         |

La disponibilidad HTTP de NestJS se conserva mientras se vincula WhatsApp. Por eso `/health/ready` puede responder 200 con `sosReady:false`; la preparación del APK exige `sosReady:true`. Un proveedor no debe utilizar `/health/sos` para matar/reiniciar continuamente la API cuando lo que falta es escanear el QR.

Ejecutar desde la raíz del monorepo, con el entorno elegido funcionando:

```powershell
npm run check:environment -- --mode android-lan
# Alternativas: --mode docker, production, android-production o staging
```

Comprueba identidad de cada API, entorno, ID de despliegue, PostgreSQL/esquema, conexión WhatsApp y CORS. Falla si se seleccionó la instancia equivocada aunque responda por HTTP. No crea alertas, no envía mensajes y no inicia sesión. Para comprobar también el JWT compartido, definir temporalmente `EMERGEN_CHECK_TOKEN` con un token de una cuenta existente; no imprimirlo ni guardarlo en archivos versionados. Para la web, definir `EMERGEN_CHECK_ORIGIN` con su origen HTTPS exacto; por defecto se verifica `https://localhost` del móvil.

`android:prepare`, `android:apk` y los builds Android verifican estos requisitos antes de empaquetar. Los comandos se detienen si las APIs antiguas no tienen el contrato `/health/ready`: actualizar y reiniciar ambas, no cambiar de puerto para silenciar el error. La vinculación inicial se realiza mediante las rutas administrativas existentes.

## Builds para hosting

Copiar `.env.production.example` a `.env.production.local` y `.env.android-production.example` a `.env.android-production.local`, completando los dominios reales y `VITE_DEPLOYMENT_ID` coincidente. Estas variables son públicas y quedan incorporadas en el build; modificar el servidor después no cambia un APK ya instalado.

```powershell
npm run check:environment -- --mode production
npm run build:hosting
npm run android:prepare:production --workspace=mobile
```

Web, escritorio y móvil rechazan builds de producción con URLs locales, IP, HTTP, dominios de ejemplo o APIs omitidas. Para un bundle de prueba local seleccionar explícitamente el modo correspondiente, por ejemplo `npm run build --workspace=web -- --mode docker`. `android:apk` sigue generando el APK debug LAN; el empaquetado firmado de distribución se configura en Android Studio/CI sobre los assets de `android:prepare:production`.

La plataforma debe poder ejecutar Node y Python con sus dependencias; no bastan un hosting de archivos estáticos o funciones que se suspendan para el proceso persistente de WhatsApp. El proveedor, dominios, certificados, permisos del disco, firma del APK y políticas de respaldo se concretarán cuando se elija hosting. Las integraciones adicionales (Firebase, PayPal, jsReport, Maps) requieren sus propios dominios/configuraciones productivas.

## Conservar y trasladar PostgreSQL

Mantener los nombres existentes de los volúmenes de PostgreSQL y WhatsApp. La configuración de Compose espera a que PostgreSQL esté saludable antes de iniciar las APIs y ahora incluye FastAPI. El puerto PostgreSQL del PC queda enlazado a `127.0.0.1`, para acceso de desarrollo local.

Antes del traslado:

```powershell
npm run build --workspace=backend
npm run check:data
npm run backup:db
```

`check:data` realiza una transacción de solo lectura, cuenta las tablas principales, comprueba las restricciones validadas y descifra todas las fichas con las claves configuradas, sin imprimir su contenido. Está destinado a la conexión de desarrollo definida en el `.env` raíz/`DB_*` del proceso, igual que `scripts/db-dev.cjs`.

`backup:db` respalda el PostgreSQL de Compose mediante `pg_dump --format=custom`, valida el archivo con `pg_restore --list` y guarda un manifiesto SHA-256. Crea un archivo nuevo en `backups/`, ignorado por Git, sin sobrescribir archivos. El archivo `.partial` no es un respaldo confirmado. El respaldo no contiene los secretos externos: conservar aparte las claves de cifrado y el estado privado del emisor. Su contenido debe tratarse como datos privados, aun cuando las fichas estén cifradas.

Validar el respaldo mediante restauración en una base aislada antes del traslado definitivo. Usar `pg_restore --exit-on-error --no-owner --no-acl` sobre un destino vacío creado expresamente para esa prueba; verificar filas, relaciones, secuencias, restricciones y descifrado con las mismas claves. `--list` confirma la lectura del archivo, no una restauración completa. [pg_dump](https://www.postgresql.org/docs/15/app-pgdump.html) genera un respaldo consistente incluso con actividad, pero para el corte final detener escrituras y el emisor antes de obtener el respaldo definitivo.

Restaurar en el destino vacío y configurar **ambas** APIs contra esa base. No ejecutar `init.sql` sobre la base restaurada, no activar sincronización automática de TypeORM y no eliminar volúmenes para corregir una conexión. Aplicar solo migraciones explícitas revisadas y con respaldo. Si se restaura también la cola de mensajes, revisar sus estados antes de habilitar el único emisor: las activaciones recientes pendientes y los avisos de finalización pueden reanudarse.

Antes de permitir tráfico: ejecutar la comprobación del entorno y la sesión compartida, verificar las claves de las fichas, probar recepción y cierre de un único SOS de prueba y mantener el origen detenido para evitar dos emisores. El historial y los envíos terminales se conservan; PostgreSQL y WhatsApp no comparten una transacción, por lo que un corte después del envío y antes de confirmar su estado en la base puede duplicar un mensaje. No se promete entrega exactamente una vez.

La ordenación mediante `service_healthy` y la persistencia siguen la documentación de [arranque en Compose](https://docs.docker.com/compose/how-tos/startup-order/) y [volúmenes Docker](https://docs.docker.com/engine/storage/volumes/). Los valores públicos incorporados al compilar siguen el comportamiento de [variables de Vite](https://vite.dev/guide/env-and-mode).

## Validación en este entorno, 29 de octubre de 2026

Se verificaron 251 pruebas de NestJS, 51 del móvil, 11 de configuración/esquema en Node y 11 de FastAPI. Las imágenes de ambas APIs se compilaron y se probaron con consultas de lectura en contenedores temporales; se comprobó que un backend con WhatsApp deshabilitado responde a la API pero rechaza disponibilidad SOS.

La auditoría confirmó 34 tablas, 166 columnas, 21 funciones y 20 triggers conforme al esquema base más las tres migraciones. No se aplicaron migraciones ni se modificó `init.sql`. Los recuentos de datos permanecieron en 8 usuarios, 5 contactos, 1 ficha médica, 45 alertas y 54 envíos; la ficha se descifra con las claves existentes y no hay restricciones sin validar.

Se generó un respaldo custom con manifiesto SHA-256 en `backups/` y se restauró en un PostgreSQL temporal sin red, sin montar los volúmenes originales. La restauración terminó sin errores, coincidieron esos recuentos y se comprobó nuevamente el descifrado y las restricciones. Se retiró únicamente el contenedor temporal. No se generaron SOS para estas verificaciones. Estos resultados validan este entorno y su respaldo; no equivalen a una prueba del hosting futuro.
