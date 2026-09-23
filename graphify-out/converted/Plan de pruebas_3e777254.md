<!-- converted from Plan de pruebas.docx -->




Plan de pruebas
(Proyecto: “EMERGEN”)






















Integrantes: Gabriel Valencia,
Diego Plaza,
Alonso González
Docente: Julio Tapia
Asignatura: Capstone










Control del documento

## Propósito y objetivos
## Este plan define que se va a probar, como se validará y bajo qué criterios se  validará la aplicación de Emergen. Su finalidad es asegurar que cada requisito tenga una prueba identificable, un resultado esperado y evidencia suficiente antes de aceptar una entrega.
## Objetivos específicos:
## Comprobar el flujo crítico de emergencia: configuración, activación, ubicación puntual y envío de alertas.
## Verificar la gestión de cuentas, contactos, usuarios apadrinados, PIN e información médica.
## Validar seguridad, confidencialidad, control de acceso, responsividad y compatibilidad.
## Detectar defectos tempranamente en cada Sprint y mantener la  trazabilidad

## Alcance de las Pruebas
Las pruebas del proyecto Emergen estarán orientadas a verificar el funcionamiento correcto, seguro y confiable de los módulos de usuarios, módulo de alerta y sistemas generales de la aplicación, como la correcta conexión con la base de datos, APIs y cosas específicas de la aplicación web, móvil y escritorio
Se evaluarán los flujos principales desde el registro e inicio de sesión hasta la activación de una emergencia y el envío del mensaje con la ubicación del usuario. También se comprobarán aspectos no funcionales como la seguridad, confidencialidad, responsividad y compatibilidad entre navegadores.
Las funcionalidades posteriores serán probadas cuando sean incorporadas oficialmente a un Sprint y cuenten con criterios de aceptación definidos.

Qué se probará (En alcance):
Registro y autenticación.
Configuración del usuario.
Personalización de mensajes.
Contactos de emergencia.
Usuarios apadrinados.
Información médica.
Alertas de emergencia.
Ubicación.
Números de emergencia.
Aplicación de escritorio.
PIN y vinculación.
Administración de cuentas.
Responsividad.
Compatibilidad.
Seguridad.
Qué NO se probará (Fuera de alcance):
Integración con centrales públicas.
Seguimiento continuo de la ubicación.
Pagos y ventas reales de cuentas.
Funciones de voz o video.
Dispositivos y navegadores no incluidos en la matriz aprobada.
Funcionalidades no aceptadas.
Se utilizarán datos ficticios para la ficha médica.

## Tipos de Pruebas
Pruebas Funcionales: Validar que cada función del sistema cumpla con lo establecido en los requisitos funcionales del ERS.
Pruebas Unitarias: Comprobar individualmente el funcionamiento de componentes, validaciones, permisos y reglas del sistema.
Pruebas de Integración: Verificar la comunicación entre las aplicaciones, el backend, la base de datos, el GPS y el servicio de envío de mensajes.
Pruebas de Interfaz y Responsividad: Verificar que la aplicación sea legible y utilizable en dispositivos móviles, tabletas y computadores.
Pruebas de Seguridad: Comprobar la protección de credenciales, sesiones, correos y accesos mediante los roles definidos en el backend.
Pruebas de Privacidad y Confidencialidad: Verificar que la ubicación, la información médica y los datos personales solo sean compartidos con usuarios autorizados.
Pruebas de Usabilidad: Comprobar que la configuración y activación de una alerta SOS sean claras, rápidas y fáciles de utilizar.

Criterios de Aceptación y Salida
Aceptación
Requisito con criterio de aceptación aprobado y relación con una historia/tarea del Sprint.
Versión desplegada en QA, identificable y estable para ejecución.
Ambiente, permisos, datos y dependencias disponibles.
Pruebas unitarias del cambio aprobadas y sin defectos bloqueantes conocidos.
Salida
100 % de casos P1 y P2 planificados ejecutados; 100 % de P1 aprobados.
Al menos 95 % de casos ejecutados aprobados en la versión candidata.
Cero defectos bloqueantes o críticos abiertos; defectos altos con decisión explícita del Product Owner.
Trazabilidad y evidencias completas; regresión crítica aprobada.
Aceptación del incremento registrada en la Sprint Review.
Suspensión y reanudación
Se suspende la ejecución si el ambiente no permite continuar, la compilación no inicia, una dependencia crítica falla de forma general o más del 30 % de los casos queda bloqueado. Se reanuda cuando la causa esté corregida, se despliegue una versión identificada y una prueba de humo confirme estabilidad básica.

## Matriz de Casos de Prueba
Una tabla que organice y detalle todos los casos de prueba, cada caso de prueba debe rastrearse directamente a un código de requisito del ERS. Los datos completos se detallan en la Matriz de trazabilidad de pruebas.
Requisitos funcionales:


Requisitos no Funcionales


## Registro de Evidencias y Resultados
Aquí documentamos lo que pasará al momento de ejecutar los casos de prueba de la tabla anterior. A continuación, se presenta un modelo de referencia para el registro de evidencias.

| Versión | Fecha | Descripción | Estado |
| --- | --- | --- | --- |
| 1.0 | 08-09-2026 | Plan inicial trazable al ERS y alineado con Backlog y Sprints. | Para revisión |
| ID del caso | Requisito relacionado | Descripción del caso | Resultado esperado |
| --- | --- | --- | --- |
| CP-RF1-01 | RF1 | Verificar la creación de una cuenta con datos válidos e inválidos. | La cuenta se crea con datos válidos. Los datos incompletos, incorrectos o duplicados son rechazados sin generar registros parciales. |
| CP-RF2-01 | RF2 | Verificar el inicio de sesión con credenciales correctas e incorrectas. | El sistema permite el acceso únicamente con credenciales válidas y muestra un mensaje de error seguro en los demás casos. |
| CP-RF3-01 | RF3 | Verificar la modificación de las credenciales desde las aplicaciones disponibles. | Las credenciales se actualizan únicamente después de validar la identidad y funcionan correctamente en los canales disponibles. |
| CP-RF4-01 | RF4 | Verificar la modificación de la finalidad o tipo de usuario. | La finalidad seleccionada se guarda correctamente y se utiliza en la configuración de las alertas. |
| CP-RF5-01 | RF5 | Verificar la personalización del método de activación en segundo plano. | La configuración queda guardada y permite activar la alerta según el método definido y las restricciones del sistema operativo. |
| CP-RF6-01 | RF6 | Verificar que una cuenta tenga al menos un contacto de emergencia para utilizar el sistema. | El sistema impide completar la configuración o utilizar la alerta sin contactos y habilita su uso al registrar al menos uno. |
| CP-RF7-01 | RF7 | Verificar el límite máximo de contactos de emergencia. | El sistema permite registrar hasta cinco contactos y rechaza el sexto sin eliminar ni modificar los contactos existentes. |
| CP-RF8-01 | RF8 | Verificar el límite máximo de usuarios apadrinados. | El sistema acepta hasta cinco usuarios apadrinados y rechaza la incorporación del sexto. |
| CP-RF9-01 | RF9 | Verificar la separación de los datos entre la cuenta principal y sus usuarios apadrinados. | Cada usuario solo puede consultar o modificar la información que le corresponde según sus permisos. |
| CP-RF10-01 | RF10 | Verificar el acceso restringido a la información médica. | Solo las personas designadas pueden acceder a la información médica. Al revocar el permiso, el acceso deja de estar disponible. |
| CP-RF11-01 | RF11 | Verificar el envío de una alerta a los contactos registrados. | El sistema genera y envía la alerta a todos los contactos vigentes, registrando el estado de cada envío. |
| CP-RF12-01 | RF12 | Verificar la generación de mensajes según la finalidad del usuario. | El mensaje generado corresponde a la finalidad configurada e incluye el contenido personalizado del usuario. |
| CP-RF13-01 | RF13 | Verificar el envío de la ubicación durante una emergencia. | La alerta incorpora la ubicación obtenida al momento del incidente y no mantiene seguimiento continuo posteriormente. |
| CP-RF13-02 | RF13 | Verificar el comportamiento cuando no se puede obtener la ubicación actual. | El sistema informa que no obtuvo la ubicación actual o utiliza el último punto conocido, indicándolo claramente en el mensaje. |
| CP-RF14-01 | RF14 | Verificar la presentación de números oficiales de emergencia. | El sistema muestra los números oficiales correspondientes, sin indicar que se realizó una notificación automática a dichos organismos. |
| CP-RF15-01 | RF15 | Verificar las funciones administrativas de la aplicación de escritorio. | El administrador accede a las funciones autorizadas. El usuario común no puede ingresar ni ejecutar acciones administrativas. |
| CP-RF16-01 | RF16 | Verificar el proceso de venta de una cuenta desde la aplicación web. | La cuenta se genera únicamente después de una operación aprobada. Los rechazos no generan cuentas ni cobros duplicados. |
| CP-RF17-01 | RF17 | Verificar la aplicación de descuentos por apadrinamiento. | El sistema calcula y aplica el descuento aprobado, mostrando correctamente el precio original y el precio final. |
| CP-RF18-01 | RF18 | Verificar el envío de una solicitud de soporte desde la aplicación web. | Una solicitud válida genera confirmación e identificador. Los formularios incompletos son rechazados con mensajes claros. |
| CP-RF19-01 | RF19 | Verificar la gestión de cuentas vinculadas sin perder incorrectamente los cupos disponibles. | El sistema actualiza correctamente los vínculos y cupos según la regla aprobada, conservando la información necesaria. |
| CP-RF20-01 | RF20 | Verificar la modificación autorizada de información compartida desde escritorio. | El cambio realizado mediante el backend se refleja en web y móvil y queda auditado. Las solicitudes no autorizadas son rechazadas. |
| CP-RF21-01 | RF21 | Verificar la generación de informes administrativos de seguimiento. | El informe contiene información consistente con los filtros y solamente puede ser generado por roles autorizados. |
| CP-RF22-01 | RF22 | Verificar la generación de informes personales desde web y móvil. | El informe muestra únicamente los datos de la cuenta autenticada y presenta resultados equivalentes en web y móvil. |
| CP-RF23-01 | RF23 | Verificar el acceso mediante un PIN vinculado a la cuenta principal. | El PIN válido identifica correctamente el vínculo. Los PIN inválidos, vencidos o bloqueados no permiten el acceso. |
| CP-RF24-01 | RF24 | Verificar la vinculación durante el primer inicio de sesión. | El primer acceso exige una vinculación válida, la registra una sola vez y evita asociaciones duplicadas. |
| CP-RF25-01 | RF25 | Verificar la gestión del usuario principal y de las personas apadrinadas. | El usuario principal puede ejecutar únicamente las acciones autorizadas sobre sus cuentas apadrinadas. Los cambios quedan registrados |
| ID del caso | Requisito relacionado | Descripción del caso | Resultado esperado |
| --- | --- | --- | --- |
| CP-RNF1-01 | RNF1 | Verificar la responsividad de las aplicaciones. | El contenido se adapta sin superposiciones, desplazamiento horizontal innecesario, texto esencial cortado ni controles inaccesibles. |
| CP-RNF2-01 | RNF2 | Verificar la compatibilidad de la aplicación web entre navegadores. | Los flujos principales funcionan de manera equivalente en todos los navegadores incluidos en la matriz. |
| CP-RNF3-01 | RNF3 | Verificar la protección de correos y credenciales. | Las contraseñas no se muestran ni almacenan en texto plano y los mensajes de error no revelan información sensible. |
| CP-RNF4-01 | RNF4 | Verificar el control de acceso basado en roles desde el backend. | El backend permite las acciones autorizadas y rechaza cualquier operación que no corresponda al rol del usuario. |
| CP-RNF5-01 | RNF5 | Verificar la seguridad y confidencialidad de los datos personales. | Solo los usuarios autorizados pueden acceder a los datos. La información sensible no aparece en errores, registros ni cuentas ajenas. |
| ID del caso | Estado | Evidencia | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- | --- |
| CP-RF01-01 | Aprobado | Captura de pantalla del formulario completado y de la confirmación de registro. | El sistema crea una cuenta cuando los datos ingresados son válidos y muestra un mensaje de confirmación. | La cuenta fue creada correctamente y el sistema mostró el mensaje de confirmación correspondiente. |