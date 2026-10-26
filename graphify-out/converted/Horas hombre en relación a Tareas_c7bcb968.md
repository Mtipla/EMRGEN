<!-- converted from Horas hombre en relación a Tareas.xlsx -->

## Sheet: Tareas y Tarifas
| Resumen de Costos por Responsable |  |  |
| --- | --- | --- |
| Responsable | Horas Invertidas | Total ($CLP) |
| Gabriel Valencia | 23 | 120000 |
| Diego Plaza | 60 | 564000 |
| Alonso González | 41 | 348000 |
| ID Tarea | Tareas o actividad | Horas estimadas | Responsable | Tarifa / Hora ($CLP) | Subtotal ($CLP) |
| TH-1.1 | Modelado de BDD y desarrollo de API utilizando Nest.js para el registro de usuarios (endpoint de /Registro), con validación de correo | 4.0 | Diego Plaza | 12000.0 | 48000 |
| TH-1.2 | Implementación de encriptación de contraseña en el backend | 2.0 | Diego Plaza | 12000.0 | 24000 |
| TH-1.3 | Maquetado del UI para el formulario de registro usando React + Ionic y la debida conexión con el backend | 3.0 | Alonso Gonzalez | 12000.0 | 36000 |
| TH-2.1 | Desarrollo del endpoint de /Login en Nest.js para realizar la validación de credenciales y generación de JWT | 4.0 | Diego Plaza | 12000.0 | 48000 |
| TH-2.2 | Creación de vista de Login y confirmación de almacenamiento seguro del token JWT | 3.0 | Alonso Gonzalez | 12000.0 | 36000 |
| TH-3.1 | Desarrollo del endpoint que gestiona los CONTACTOS, incluyendo la regla de negocio que bloquea el registro de mas de 5 contactos de emergencia | 3.0 | Diego Plaza | 12000.0 | 36000 |
| TH-3.2 | Bosquejo del formulario de ingreso de contactos, con validación del formato del numero telefonico | 2.0 | Alonso Gonzalez | 12000.0 | 24000 |
| TH-4.1 | Desarrollo de la API para gestionar contactos, implementando la validación para que se mantenga al menos 1 contacto de emergencia | 4.0 | Diego Plaza | 12000.0 | 48000 |
| TH-4.2 | Desarrollo de vista de contactos, con funciones de edición, eliminación y confirmación de cambios/borrado | 2.0 | Alonso Gonzalez | 12000.0 | 24000 |
| TH-5.1 | Desarrollo de la vista de MODIFICAR USUARIO, centrandose en las funciones de crear mensaje y seleccionar tipo de emergencia. Añadiendo tambien la regla de 160 caracteres como maximo al mensaje | 2.0 | Alonso Gonzalez | 12000.0 | 24000 |
| TH-5.2 | Desarrollo de backend para gestionar las emergencias y su persistencia en la BDD | 2.0 | Diego Plaza | 12000.0 | 24000 |
| TH-6.1 | Implementación en la UI de la función del boton SOS con logica de confirmación personalizable (mantener presionado durante 5 segundos continuos) | 4.0 | Alonso Gonzalez | 12000.0 | 48000 |
| TH-6.2 | Desarrollo del endpoint de /Alertas, siendo el que recibe las alertas SOS y actualiza el estado del perfil del usuario a "Emergencia activa" | 3.0 | Diego Plaza | 12000.0 | 36000 |
| TH-7.1 | Integración de plugin de geolocalización (Capacitor) para extraer la ubicación (Latitud y longitud especificamente) en tiempo real | 5.0 | Alonso Gonzalez | 12000.0 | 60000 |
| TH-7.2 | Desarrollo de la logica de fallback y manejo de Timeout para implementar el uso de la ultima ubicación conocida del usuario | 3.0 | Gabriel Valencia | 10000.0 | 30000 |
| TH-8.1 | Integración con servicios de mensajeria (Push/SMS) desde el backend para el envio del enlace con la ubicación | 6.0 | Diego Plaza | 12000.0 | 72000 |
| TH-8.2 | Desarrollo del registro de auditoria de alertas en la BDD con fecha, hora y estado del envió de la alerta para los contactos | 2.0 | Gabriel Valencia | 10000.0 | 20000 |
| TH-9.1 | Desarrollo de endpoints para creación de cuentas secundarias, aplicando la regla de negocios de un maximo de 5 usuarios secundarios por cuenta principal | 4.0 | Diego Plaza | 12000.0 | 48000 |
| TH-9.2 | Maquetación de panel administrativo de usuario principal para gestionar usuarios secundarios | 3.0 | Alonso Gonzalez | 12000.0 | 36000 |
| TH-10.1 | Creación y configuración del manejo de PIN en la UI | 3.0 | Alonso Gonzalez | 12000.0 | 36000 |
| TH-10.2 | Revisión de logica de backend con respecto a la validación y uso de PIN para autorizar acciones como desvinculación de usuarios secundarios | 3.0 | Diego Plaza | 12000.0 | 36000 |
| TH-11.1 | Implementación de cifrado AES-256 para campos de datos medicos sensibles | 4.0 | Diego Plaza | 12000.0 | 48000 |
| TH-11.2 | Desarrollo de interfaz del anexo de la ficha medica del usuario revisando su manejo y confidencialidad | 2.0 | Alonso Gonzalez | 12000.0 | 24000 |
| TH-12.1 | Logica de backend para la generación de la vista publica restringida de la ficha medica enlaces temporales que funcionen en base al estado de la emergencia | 4.0 | Diego Plaza | 12000.0 | 48000 |
| TH-12.2 | Automatización de la prohibición del acceso al enlace medico inmediatamente despues que la emergencia cambie de estado | 2.0 | Gabriel Valencia | 10000.0 | 20000 |
| TH-13.1 | Maquetación completa del panel de administración y empaquetado inicial en Electron para expotación. | 5.0 | Gabriel Valencia | 10000.0 | 50000 |
| TH-13.2 | Implementación de servicios de reportes exclusivamente para auditoria por parte del ADMINISTRADOR | 4.0 | Diego Plaza | 12000.0 | 48000 |
| TH-14.1 | Diseñar e implementar en la interfaz el botón/pantalla con confirmación para finalizar la alerta activa. | 2.0 | Gabriel Valencia | 10000.0 | 20000 |
| TH-14.2 | Crear el endpoint de cierre de emergencia que notifique el fin de la situación a los contactos y revoque automáticamente los permisos/tokens de acceso temporal a los datos médicos. | 4.0 | Diego Plaza | 12000.0 | 48000 |
| TH-15.1 | Construir la pantalla de ajustes de perfil con campos para cambio de correo y contraseña. | 3.0 | Gabriel Valencia | 10000.0 | 30000 |
| TH-15.2 | Implementar el servicio de actualización de credenciales en la base de datos/proveedor de identidad, requiriendo la contraseña actual y enviando un correo de verificación al nuevo e-mail. | 4.0 | Gabriel Valencia | 10000.0 | 40000 |
| TH-16.1 | Desarrollar la vista de selección de planes/cupos e integrar la pasarela de pagos con interfaz clara de Checkout. | 2.0 | Diego Plaza | 10000.0 | 20000 |
| TH-16.2 | Crear la lógica de negocio para procesar la transacción, actualizar el saldo de cupos del usuario principal en la base de datos y activar los permisos de asignación de apadrinados. | 4.0 | Diego Plaza | 10000.0 | 40000 |
| TU-17.1 | Diseñar el módulo visual con la lista de números públicos oficiales (ej. Policía, Ambulancia, Bomberos) e implementar enlaces nativos de llamada. | 3.0 | Diego Plaza | 10000.0 | 30000 |
| TU-17.2 | Configurar la carga dinámica de números de emergencia locales según el país o región del usuario. | 2.0 | Alonso Gonzalez | 12000.0 | 24000 |
| TU-18.1 | Crear el formulario de contacto/soporte accesible para usuarios autenticados y visitantes, con campos para tipo de problema, descripción y adjuntos. | 2.0 | Gabriel Valencia | 10000.0 | 20000 |
| TU-18.2 | Construir el endpoint para procesar la solicitud e integrarlo con un servicio de correo o plataforma de Helpdesk. | 4.0 | Alonso Gonzalez | 12000.0 | 48000 |
| TU-19.1 | Diseñar las consultas a la base de datos para compilar el historial de alertas y eventos del usuario y sus apadrinados dentro de un rango de fechas. | 3.0 | Alonso Gonzalez | 12000.0 | 36000 |
| TU-19.2 | Implementar el botón de descarga y la lógica de generación del reporte en pantalla o formato exportable (PDF/CSV). | 3.0 | Alonso Gonzalez | 12000.0 | 36000 |
|  | Total de Horas Estimadas | 124 |  | Total | 1424000 |