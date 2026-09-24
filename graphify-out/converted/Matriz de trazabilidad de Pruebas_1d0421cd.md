<!-- converted from Matriz de trazabilidad de Pruebas.xlsx -->

## Sheet: Casos de prueba
| ID del caso | Requisito relacionado | Descripción del caso | Datos de entrada | Resultado esperado |
| --- | --- | --- | --- | --- |
| CP-RF1-01 | RF1 | Verificar la creación de una cuenta con datos válidos e inválidos. | Nombre, correo nuevo, contraseña válida; correo duplicado y campos vacíos. | La cuenta se crea con datos válidos. Los datos incompletos, incorrectos o duplicados son rechazados sin generar registros parciales. |
| CP-RF2-01 | RF2 | Verificar el inicio de sesión con credenciales correctas e incorrectas. | Correo registrado, contraseña correcta, contraseña incorrecta y correo inexistente. | El sistema permite el acceso únicamente con credenciales válidas y muestra un mensaje de error seguro en los demás casos. |
| CP-RF3-01 | RF3 | Verificar la modificación de las credenciales desde las aplicaciones disponibles. | Nueva contraseña, nuevo correo y credenciales actuales del usuario. | Las credenciales se actualizan únicamente después de validar la identidad y funcionan correctamente en los canales disponibles. |
| CP-RF4-01 | RF4 | Verificar la modificación de la finalidad o tipo de usuario. | Médico, urbano, emergencias y adulto mayor. | La finalidad seleccionada se guarda correctamente y se utiliza en la configuración de las alertas. |
| CP-RF5-01 | RF5 | Verificar la personalización del método de activación en segundo plano. | Método de activación, permisos del dispositivo y configuración seleccionada. | La configuración queda guardada y permite activar la alerta según el método definido y las restricciones del sistema operativo. |
| CP-RF6-01 | RF6 | Verificar que una cuenta tenga al menos un contacto de emergencia para utilizar el sistema. | Cuenta sin contactos y cuenta con un contacto válido. | El sistema impide completar la configuración o utilizar la alerta sin contactos y habilita su uso al registrar al menos uno. |
| CP-RF7-01 | RF7 | Verificar el límite máximo de contactos de emergencia. | Cinco contactos registrados y un sexto contacto válido. | El sistema permite registrar hasta cinco contactos y rechaza el sexto sin eliminar ni modificar los contactos existentes. |
| CP-RF8-01 | RF8 | Verificar el límite máximo de usuarios apadrinados. | Cinco usuarios apadrinados y solicitud de registro de un sexto usuario. | El sistema acepta hasta cinco usuarios apadrinados y rechaza la incorporación del sexto. |
| CP-RF9-01 | RF9 | Verificar la separación de los datos entre la cuenta principal y sus usuarios apadrinados. | Cuenta principal, dos usuarios apadrinados y datos personales diferentes. | Cada usuario solo puede consultar o modificar la información que le corresponde según sus permisos. |
| CP-RF10-01 | RF10 | Verificar el acceso restringido a la información médica. | Información médica, contacto autorizado, contacto no autorizado y permiso revocado. | Solo las personas designadas pueden acceder a la información médica. Al revocar el permiso, el acceso deja de estar disponible. |
| CP-RF11-01 | RF11 | Verificar el envío de una alerta a los contactos registrados. | Cuenta con entre uno y cinco contactos válidos y activación de SOS. | El sistema genera y envía la alerta a todos los contactos vigentes, registrando el estado de cada envío. |
| CP-RF12-01 | RF12 | Verificar la generación de mensajes según la finalidad del usuario. | Finalidad seleccionada y mensaje personalizado. | El mensaje generado corresponde a la finalidad configurada e incluye el contenido personalizado del usuario. |
| CP-RF13-01 | RF13 | Verificar el envío de la ubicación durante una emergencia. | GPS disponible, permiso concedido y coordenadas actuales. | La alerta incorpora la ubicación obtenida al momento del incidente y no mantiene seguimiento continuo posteriormente. |
| CP-RF13-02 | RF13 | Verificar el comportamiento cuando no se puede obtener la ubicación actual. | GPS desactivado, permiso rechazado, timeout y última ubicación conocida. | El sistema informa que no obtuvo la ubicación actual o utiliza el último punto conocido, indicándolo claramente en el mensaje. |
| CP-RF14-01 | RF14 | Verificar la presentación de números oficiales de emergencia. | Ubicación o zona del usuario y tipo de emergencia. | El sistema muestra los números oficiales correspondientes, sin indicar que se realizó una notificación automática a dichos organismos. |
| CP-RF15-01 | RF15 | Verificar las funciones administrativas de la aplicación de escritorio. | Credenciales de administrador y credenciales de usuario común. | El administrador accede a las funciones autorizadas. El usuario común no puede ingresar ni ejecutar acciones administrativas. |
| CP-RF16-01 | RF16 | Verificar el proceso de venta de una cuenta desde la aplicación web. | Plan seleccionado, datos del comprador y respuesta aprobada o rechazada del servicio de pago. | La cuenta se genera únicamente después de una operación aprobada. Los rechazos no generan cuentas ni cobros duplicados. |
| CP-RF17-01 | RF17 | Verificar la aplicación de descuentos por apadrinamiento. | Precio de la cuenta, número de usuarios apadrinados y regla de descuento. | El sistema calcula y aplica el descuento aprobado, mostrando correctamente el precio original y el precio final. |
| CP-RF18-01 | RF18 | Verificar el envío de una solicitud de soporte desde la aplicación web. | Nombre, correo, asunto, descripción válida y formulario incompleto. | Una solicitud válida genera confirmación e identificador. Los formularios incompletos son rechazados con mensajes claros. |
| CP-RF19-01 | RF19 | Verificar la gestión de cuentas vinculadas sin perder incorrectamente los cupos disponibles. | Cuenta principal, usuarios vinculados, eliminación y reemplazo de un usuario. | El sistema actualiza correctamente los vínculos y cupos según la regla aprobada, conservando la información necesaria. |
| CP-RF20-01 | RF20 | Verificar la modificación autorizada de información compartida desde escritorio. | Usuario administrador, cambio de datos y solicitud directa no autorizada. | El cambio realizado mediante el backend se refleja en web y móvil y queda auditado. Las solicitudes no autorizadas son rechazadas. |
| CP-RF21-01 | RF21 | Verificar la generación de informes administrativos de seguimiento. | Rango de fechas, usuario seleccionado, filtros y rol administrador. | El informe contiene información consistente con los filtros y solamente puede ser generado por roles autorizados. |
| CP-RF22-01 | RF22 | Verificar la generación de informes personales desde web y móvil. | Usuario autenticado, rango de fechas y filtros personales. | El informe muestra únicamente los datos de la cuenta autenticada y presenta resultados equivalentes en web y móvil. |
| CP-RF23-01 | RF23 | Verificar el acceso mediante un PIN vinculado a la cuenta principal. | PIN válido, PIN inválido, PIN vencido o bloqueado. | El PIN válido identifica correctamente el vínculo. Los PIN inválidos, vencidos o bloqueados no permiten el acceso. |
| CP-RF24-01 | RF24 | Verificar la vinculación durante el primer inicio de sesión. | Cuenta principal, cuenta dependiente y PIN de vinculación. | El primer acceso exige una vinculación válida, la registra una sola vez y evita asociaciones duplicadas. |
| CP-RF25-01 | RF25 | Verificar la gestión del usuario principal y de las personas apadrinadas. | Cuenta principal, usuarios apadrinados, acciones administrativas y permisos definidos. | El usuario principal puede ejecutar únicamente las acciones autorizadas sobre sus cuentas apadrinadas. Los cambios quedan registrados |
| ID del caso | Requisito relacionado | Descripción del caso | Datos de entrada | Resultado esperado |
| CP-RNF1-01 | RNF1 | Verificar la responsividad de las aplicaciones. | Resoluciones de 360 × 800, 768 × 1024 y 1366 × 768 píxeles. | El contenido se adapta sin superposiciones, desplazamiento horizontal innecesario, texto esencial cortado ni controles inaccesibles. |
| CP-RNF2-01 | RNF2 | Verificar la compatibilidad de la aplicación web entre navegadores. | Chrome, Edge, Firefox y Safari, según disponibilidad y versiones aprobadas. | Los flujos principales funcionan de manera equivalente en todos los navegadores incluidos en la matriz. |
| CP-RNF3-01 | RNF3 | Verificar la protección de correos y credenciales. | Credenciales válidas, contraseña incorrecta, recuperación de contraseña y revisión de registros. | Las contraseñas no se muestran ni almacenan en texto plano y los mensajes de error no revelan información sensible. |
| CP-RNF4-01 | RNF4 | Verificar el control de acceso basado en roles desde el backend. | Usuarios principal, apadrinado, empleado y administrador; operaciones permitidas y prohibidas. | El backend permite las acciones autorizadas y rechaza cualquier operación que no corresponda al rol del usuario. |
| CP-RNF5-01 | RNF5 | Verificar la seguridad y confidencialidad de los datos personales. | Datos personales, médicos y de ubicación; usuarios autorizados y no autorizados. | Solo los usuarios autorizados pueden acceder a los datos. La información sensible no aparece en errores, registros ni cuentas ajenas. |
| ID del caso | Requisito relacionado | Descripción del caso | Resultado esperado |
| CP-RNF1-01 | RNF1 | Verificar la responsividad de las aplicaciones. | El contenido se adapta sin superposiciones, desplazamiento horizontal innecesario, texto esencial cortado ni controles inaccesibles. |
| CP-RNF2-01 | RNF2 | Verificar la compatibilidad de la aplicación web entre navegadores. | Los flujos principales funcionan de manera equivalente en todos los navegadores incluidos en la matriz. |
| CP-RNF3-01 | RNF3 | Verificar la protección de correos y credenciales. | Las contraseñas no se muestran ni almacenan en texto plano y los mensajes de error no revelan información sensible. |
| CP-RNF4-01 | RNF4 | Verificar el control de acceso basado en roles desde el backend. | El backend permite las acciones autorizadas y rechaza cualquier operación que no corresponda al rol del usuario. |
| CP-RNF5-01 | RNF5 | Verificar la seguridad y confidencialidad de los datos personales. | Solo los usuarios autorizados pueden acceder a los datos. La información sensible no aparece en errores, registros ni cuentas ajenas. |
## Sheet: Registro de Resultado
| ID del caso | Estado | Evidencia | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- | --- |
| CP-RF01-01 | Aprobado | Captura de pantalla del formulario completado y de la confirmación de registro. | El sistema crea una cuenta cuando los datos ingresados son válidos y muestra un mensaje de confirmación. | La cuenta fue creada correctamente y el sistema mostró el mensaje de confirmación correspondiente. |
## Sheet: Hoja 1
| ID | Resumen | Alcance | Caso | Resultado verificable |
| --- | --- | --- | --- | --- |
| RF1 | Crear una cuenta. | MVP | CP-USR-001 | Cuenta válida creada; datos inválidos/duplicados rechazados. |
| RF2 | Iniciar sesión con credenciales. | MVP | CP-AUT-001 | Acceso con credenciales válidas; rechazo seguro y genérico en intentos inválidos. |
| RF3 | Modificar credenciales en web/escritorio/móvil. | MVP | CP-AUT-002 | Cambio autorizado persiste en canales aplicables; sesión/credencial anterior se trata según política. |
| RF4 | Modificar finalidad del usuario. | MVP | CP-CFG-001 | Finalidad válida guardada y usada por el mensaje. |
| RF5 | Personalizar activación en segundo plano. | Aclarar | CP-CFG-002 | Opción persiste y el disparador acordado funciona con permisos/limitaciones del SO. |
| RF6 | Exigir al menos un contacto de emergencia. | MVP | CP-CON-001 | No se habilita operación completa sin contacto; se informa cómo corregir. |
| RF7 | Máximo cinco contactos por cuenta. | MVP | CP-CON-002 | Acepta 1–5; bloquea el sexto sin perder información. |
| RF8 | Máximo cinco usuarios apadrinados. | Post-MVP | CP-APA-001 | Acepta hasta cinco y bloquea el sexto. |
| RF9 | Separar datos de cuenta y apadrinados. | MVP/Post | CP-DAT-001 | Cada identidad solo visualiza/modifica datos autorizados. |
| RF10 | Compartir datos médicos solo con designados. | MVP/Post | CP-MED-001 | Acceso concedido/revocado correctamente; no hay filtración a terceros. |
| RF11 | Enviar mensaje a contactos registrados. | MVP | CP-ALT-001 | Se crea y despacha alerta a todos los contactos vigentes; estado registrable. |
| RF12 | Personalizar mensaje según finalidad. | MVP | CP-ALT-002 | Contenido coincide con médico/urbano/emergencias/adulto mayor y personalización. |
| RF13 | Compartir última ubicación ingresada. | MVP | CP-GEO-001 | Envía ubicación del incidente; último punto conocido solo como fallback señalado; sin rastreo continuo. |
| RF14 | Informar redes de seguridad cercanas. | Condicionado | CP-EME-001 | Muestra números oficiales pertinentes; no promete contacto automático. |
| RF15 | Aplicación de escritorio administradora. | Post-MVP | CP-ADM-001 | Funciones autorizadas disponibles según rol y auditadas. |
| RF16 | Ventas de cuentas en web. | Futuro | CP-VTA-001 | Flujo de compra con validación, confirmación y manejo de rechazo, tras definir proveedor. |
| RF17 | Descuento por apadrinar. | Futuro | CP-VTA-002 | Regla aprobada calcula descuento correcto en límites y combinaciones. |
| RF18 | Contacto de soporte web. | Condicionado | CP-SOP-001 | Solicitud válida genera confirmación e identificador; valida campos y errores. |
| RF19 | Gestionar vinculadas sin perder cupo. | Post-MVP | CP-APA-002 | Altas/bajas/cambios mantienen conteo e historial según regla aprobada. |
| RF20 | Escritorio modifica datos compartidos. | Condicionado | CP-ADM-002 | Cambio autorizado vía backend se refleja en web/móvil y queda auditado; se niega acceso directo/no autorizado. |
| RF21 | Informes de seguimiento administrativos. | Post-MVP | CP-REP-001 | Informe respeta filtros, permisos y consistencia de datos. |
| RF22 | Informes personales web/móvil. | Post-MVP | CP-REP-002 | Solo incluye datos de la cuenta autorizada y coincide entre canales. |
| RF23 | PIN único vinculado a cuenta principal. | Post-MVP | CP-PIN-001 | PIN válido identifica el vínculo; inválido/bloqueado no concede acceso. |
| RF24 | Primer ingreso vinculado a principal. | Post-MVP | CP-PIN-002 | Primer acceso exige y registra vínculo válido sin duplicidad. |
| RF25 | Gestionar principal y apadrinados con soporte externo. | Aclarar | CP-APA-003 | Ejecutable solo tras definir actores, acciones, permisos, reglas y resultado esperado. |
| RNF1 | Aplicaciones responsivas. | MVP | CP-RWD-001 | Sin desplazamiento horizontal ni controles inaccesibles en matriz aprobada. |
| RNF2 | Compatibilidad entre navegadores. | MVP | CP-BRW-001 | Flujos P1 equivalentes en navegadores soportados; diferencias documentadas. |
| RNF3 | Seguridad de correos y credenciales. | MVP | CP-SEG-001 | Contraseñas no visibles/registradas en claro; transporte y recuperación seguros. |
| RNF4 | Seguridad procesada por backend con RBAC. | MVP | CP-RBAC-001 | Cliente no decide autorización; backend niega cada acción fuera del rol. |
| RNF5 | Confidencialidad de datos. | MVP | CP-PRI-001 | Aislamiento, mínimo acceso, logs sanitizados y no exposición de ubicación/médicos. |