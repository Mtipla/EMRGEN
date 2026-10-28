# Contrato de APIs internas — 2026-10-21

NestJS conserva login, administración, compras y auditoría en localhost:3001 (Docker; 3000 local). FastAPI corre separado en localhost:8000. Comparten PostgreSQL y JWT HS256 de `POST /usuarios/login`, emisor emergen-api y audiencia emergen-web. La identidad y el rol se releen en cada petición; el cliente no elige actor, dueño, PIN ID ni tutor.

Arranque: [README_BDD.md](README_BDD.md) y [services/internal-api/README.md](services/internal-api/README.md). OpenAPI se genera en `/openapi.json`; documentación en `/docs` y `/redoc`.

Consulta y pruebas manuales de SOS: [guía de visualización y pruebas](docs/PRUEBAS_SOS.md), con listado como Admin, creación como principal y cierre con PIN.

## SOS

El panel de escritorio ofrece **Alertas SOS** con la sesión Admin existente y actualización cada 3 segundos. Consulta `GET /admin/alertas` en NestJS (solo ADMINISTRADOR completo): filtros opcionales `estado` y `usuario_id`, `limit` 1–100 (20 por defecto) y `offset` >=0. Devuelve `{alertas, total, activas}`; `total` respeta los filtros y `activas` cuenta todas las alertas activas. Incluye nombre/correo del emisor y conserva los eventos de cuentas eliminadas con esos campos nulos. Es una consulta de la misma BD, sin escrituras SOS ni dependencia del proceso FastAPI.

| Método/ruta | Contrato |
|---|---|
| POST /internal/v1/alertas | Usuario autenticado. UUID `clave_idempotencia` y `prioridad_id` 1–4 obligatorios; `ubicacion` opcional (1–150), `mensaje` opcional (1–200, solo acceso completo). |
| GET /internal/v1/alertas | Propias; personal completo puede consultar todas o filtrar por `usuario_id`. Filtro opcional `estado`: ACTIVA, FINALIZADA o EXPIRADA, aplicado antes de paginar. `limit` 1–100, `offset` >=0. |
| GET /internal/v1/alertas/{id} | Propietario o personal completo; ajena devuelve 404. |
| POST /internal/v1/alertas/{id}/cerrar | Emisor o su principal vinculado. Body `{"pin":"0007"}`; cadena de cuatro dígitos. No admite ID de tutor. |

Respuesta: alerta_id, usuario_id nullable, ubicacion nullable, mensaje snapshot, prioridad_id, clave_idempotencia, estado_alerta, fecha_creacion y fecha_cierre nullable (ISO con zona). Los campos `whatsapp` (activación) y `whatsapp_cierre` (finalización) contienen `{pendientes, enviados, fallidos}` por separado.

Crear exige plan del principal y al menos un contacto propio. Una sola transacción inserta detalle/snapshot, ubicación si existe, referencia a la ficha médica del emisor, alerta, historial inicial y un `ENVIO_ALERTA` pendiente por contacto con IDs del motor. Un mismo UUID y payload devuelve el mismo evento; reutilizar UUID para otro contenido devuelve 409. Si ya hay otro SOS activo, 409. El snapshot del mensaje no depende de futuras ediciones de plantilla. El mensaje por defecto es el configurado o INTERNAL_API_MENSAJE_PREDETERMINADO (por defecto “Necesito ayuda inmediata en mi ubicación.”). El parcial usa el mensaje configurado. NestJS despacha la cola mediante WhatsApp, descifra la ficha vinculada e incluye sus seis campos en la activación. Los enlaces médicos temporales no se envían. Configuración y prueba: [SOS por WhatsApp](docs/WHATSAPP_SOS.md).

Cerrar usa PIN propio en completo y en principal parcial; apadrinado parcial usa el del principal real. PIN faltante: 409; incorrecto: 403; cinco intentos fallidos o bloqueo vigente: 429 (15 minutos). Los contadores se confirman antes de responder un error. Un usuario ajeno no puede verificar PIN de otra familia. El cierre repetido autorizado es idempotente.

La aplicación escribe una transición normal y fecha_cierre real; SQL revoca enlaces y encola los avisos WhatsApp de `FINALIZACION` a los contactos actuales en la misma transacción. Repetir el cierre no duplica los avisos. El borrado de cuenta usa el trigger para cierre/historial/depuración y cancela todos sus envíos pendientes, sin duplicación en servicio. El job de arranque y periódico finaliza a las 24 horas transcurridas como FINALIZADA y genera el mismo aviso de cierre. EXPIRADA no se usa en este flujo. Si FastAPI está apagado, la recuperación ocurre al iniciarlo.

## Ventas del panel administrativo (NestJS)

La sección **Administrar compras** del escritorio consulta ventas reales mediante la sesión Admin. `GET /admin/ventas` devuelve `{ventas, total, total_pagado_clp}` con sus líneas de compra, usuario, método y estado de pago. Filtros opcionales: `busqueda` (boleta, ID/nombre/correo del comprador u orden), `estado_pago_id` 1–5, `desde` y `hasta` (AAAA-MM-DD, días inclusivos de America/Santiago); paginación `limit` 1–100 (20 por defecto), `offset` >=0. El total pagado respeta los filtros y suma únicamente estado PAGADO. Se conservan ventas de cuentas eliminadas con los datos del usuario nulos.

**Descargar PDF/Excel** abre un selector de formato y solicita `GET /admin/ventas/reporte?formato=pdf` o `formato=xlsx`, con los mismos filtros aplicados y sin paginación. jsReport genera un PDF horizontal (`chrome-pdf`) o un Excel real (`html-to-xlsx`). La primera hoja, Detalle de compras, muestra cada producto comprado con boleta, fecha, nombre y correo separados, cantidad, precio unitario, subtotal, método y estado. Le siguen Ventas y Resumen; los importes y cantidades conservan su tipo numérico. El listado y los reportes describen el producto comprado sin mostrar el plan actual del usuario. El reporte incluye todos los resultados. Sin `formato` se conserva PDF; otros valores devuelven 400. Ambas rutas requieren ADMINISTRADOR con acceso completo. Si jsReport falla, la descarga muestra un error, permite reintentar y el listado sigue disponible. Las consultas y reportes no modifican ventas ni estados de pago. La configuración JSREPORT_URL y su variante Docker siguen en [readme-apis.md](readme-apis.md).

## Reportes de bitácora (NestJS)

El botón **Descargar PDF/Excel** de **Bitácora / auditoría** utiliza el mismo selector y `GET /admin/auditoria/reporte?formato=pdf|xlsx`. Ambos formatos se generan mediante jsReport con los filtros de la sección (incluido `limite`, 100 registros por defecto y hasta 1000). Excel contiene las hojas Resumen y Bitacora, con actor, usuario afectado, resultado y cambios. Omitir `formato` conserva PDF; un formato inválido devuelve 400. Solo puede exportar un ADMINISTRADOR con acceso completo. Cada exportación registra en la bitácora su formato y resultado; cancelar el selector no solicita ningún reporte.

## Soporte

| Método/ruta | Contrato |
|---|---|
| GET /internal/v1/tickets-soporte/categorias | Catálogo; sesión requerida. |
| GET /internal/v1/tickets-soporte/estados | Catálogo; sesión requerida. |
| POST /internal/v1/tickets-soporte | `descripcion` 1–500 y categoria_id existente. Crea TICKET_SOPORTE, estado 1 ABIERTO, sin seguimiento. |
| GET /internal/v1/tickets-soporte | Propios; personal completo puede ver todos. Filtros estado, usuario_id; paginación limit/offset. |
| GET /internal/v1/tickets-soporte/{ticket_id} | ID de TICKET_SOPORTE, propietario o personal completo. |
| PATCH /internal/v1/tickets-soporte/{ticket_id} | Personal completo: estado del catálogo y/o solución no vacía de hasta 500 caracteres. El estado se actualiza en ticket; una solución crea/actualiza el único seguimiento SOPORTE. |

Respuesta: ticket_id, usuario_id, nombre_usuario y correo_usuario nullable, descripcion, estado, solucion nullable, categoria_id, categoria. Estado sin seguimiento es válido; solución ausente es NULL. No existe estado en SOPORTE. Las consultas usan LEFT JOIN para no perder tickets nuevos.

En web y escritorio, el menú de SOPORTE ofrece únicamente Administrar cuentas (lectura), Administrar compras (ventas reales, lectura) y Administrar Tickets de soporte. La bandeja consulta los tickets de todos los usuarios, filtra por estado, pagina de 20 en 20 y se actualiza cada 15 segundos. Permite responder y cambiar el estado; el solicitante ve la solución en Mis solicitudes de `/soporte`. NestJS permite a SOPORTE con acceso completo `GET /admin/usuarios`, `GET /admin/usuarios/:id` y `GET /admin/ventas`; las modificaciones de cuentas y los reportes permanecen exclusivos del administrador.

## Errores y responsabilidades

Errores con forma `{statusCode,message,error}`: 400 validación de entrada, 401 sesión, 403 permiso, 404 recurso no visible, 409 integridad o conflicto de negocio, 429 PIN, 503 indisponibilidad/conflicto transitorio agotado. Se reintenta la transacción completa como máximo tres veces solo para 40001/40P01; nunca se reintenta una llamada de proveedor dentro de ella.

El transporte WhatsApp y la cola de `ENVIO_ALERTA` están implementados en NestJS y PostgreSQL. El módulo de perfil gestiona la ficha médica cifrada; FastAPI vincula la ficha del emisor al crear el SOS y NestJS la descifra para el aviso inicial. Las consultas GET del histórico SOS son informativas y no modifican registros ni generan mensajes. El servicio público de enlaces y tokens médicos no está implementado. SQL no autentica, confirma pagos, cifra ni entrega mensajes. Las otras integraciones conservan su documentación en [readme-apis.md](readme-apis.md).
