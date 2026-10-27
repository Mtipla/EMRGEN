# Integración local de Gabriel — 27 de octubre de 2026

Se integra `origin/gabriel@20f71f4` en `alonso`, partiendo de `ea57cfb`. Se incorporan 11 commits de la historia entrante. No se realiza push.

## Resoluciones

Hubo conflictos de contenido en 10 archivos: `admin.service.ts`, `admin.service.spec.ts`, `login.service.ts`, el registro móvil, las páginas administrativas, las pruebas web de soporte, `admin-views.tsx`, `perfil-form.tsx`, `soporte.tsx` y las pruebas Python de tickets.

Se conservan la administración de trabajadores, las derivaciones entre módulos y los permisos recientes de Alonso. Se incorporan el registro móvil con Firebase, el ingreso por perfiles y PIN, los perfiles apadrinados sin credenciales propias y los cambios visuales de Gabriel. Los atajos de tickets respetan la confirmación de cierre y la restricción de edición a administradores cuando el caso está EN PROCESO o CERRADO.

La compilación detectó dos métodos `eliminarTrabajador` en el controlador administrativo, unidos automáticamente por Git. Se diferenciaron sus nombres conservando las dos rutas. También se corrigió una referencia a `verificar` que había quedado fuera de alcance al combinar las funciones de tickets.

Dos pruebas de WhatsApp ya tenían expectativas desactualizadas respecto del separador del mensaje de finalización de Alonso. Se ajustaron las expectativas sin cambiar el mensaje. La preparación de la prueba de apadrinados se adaptó a la selección de perfil y PIN del nuevo login.

## Base de datos local e init.sql

El commit inicial del merge conservó `init.sql` conforme a la instrucción vigente en ese momento. Después, el usuario autorizó incorporar los cambios de Gabriel en ese archivo. Se incorporó exactamente la versión de `gabriel@20f71f4`, con `pin.pin_temporal`, credenciales nulas para apadrinados y la restricción `c_usuario_05`. Esta incorporación se registra en un commit adicional, sin reescribir el merge anterior. Se actualizó `AGENTS.md` para permitir incorporar cambios existentes de la rama de origen durante un merge, manteniendo la protección frente a cambios propios.

Se aplicaron las migraciones entrantes `005_pin_temporal.sql` y `006_apadrinado_sin_credenciales.sql` en una transacción sobre PostgreSQL local. Se conservaron los dos perfiles apadrinados existentes; la segunda migración retiró sus credenciales propias. Antes de hacerlo se guardó un respaldo local, excluido de Git, en `node_modules/.cache/gabriel-local-credentials-before-006.json`.

Para otros ambientes con el esquema anterior, aplicar ambas migraciones mediante el procedimiento habitual. Las instalaciones nuevas que utilicen el `init.sql` actualizado ya incluyen esos cambios. La incorporación del archivo no vuelve a inicializar ni borra la base local.

## Graphify

Se incorporan los artefactos ya versionados en la rama entrante. La actualización incremental local con Graphify 0.9.92 terminó con 3198 nodos, 6524 relaciones y 209 comunidades. Se conserva una copia consultable en `node_modules/.cache/graphify-alonso-2026-10-27/graph.json`.

Conforme a `CONTRIBUTING.md`, la regeneración local no se añade al commit de `alonso`: se restablecen los artefactos versionados al resultado del merge. No se actualiza la rama compartida `graphify` con código de una rama individual. Los nombres semánticos de algunas comunidades requieren una actualización posterior; no se ejecutó etiquetado con LLM. Graphify advirtió que no está instalado el complemento opcional `pypdf`, por lo que no actualizó la extracción de PDF.

## Validación

- Compilación de backend, web, móvil y escritorio: correcta.
- Backend: 202 pruebas unitarias aprobadas.
- Web: 56 pruebas aprobadas.
- Móvil: 21 pruebas aprobadas.
- API interna: 52 pruebas aprobadas.
- Integración con PostgreSQL: 8 pruebas de autenticación/administración y 7 de apadrinados aprobadas.
- `pruebas_init.sql`: comprobaciones correctas, con rollback.
- Tras incorporar `init.sql`: coincidencia exacta con `gabriel@20f71f4`; verificación del esquema local correcta (34 tablas, 162 columnas, 21 funciones y 20 triggers), y pruebas SQL aprobadas de nuevo.
- Lint de backend y web: sin errores; backend conserva cinco advertencias.
- API interna reiniciada y panel local comprobado por HTTP.

Persisten advertencias no bloqueantes de CSS de Ionic, tamaño de bundles, VM Modules de Node y deprecación de TestClient. No quedan conflictos de contenido pendientes.
