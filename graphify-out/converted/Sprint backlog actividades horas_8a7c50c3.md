<!-- converted from Sprint backlog actividades horas.xlsx -->

## Sheet: Product_Backlog_tareas
| Sprint Backlog con estimación de tareas para las historia de usuario |
| --- |
| Total Horas: |  | 88 |
| Id Historia | Id Tarea | Tareas o actividad | Horas estimadas |  |
| HU-01 | TH-1.1 | Modelado de BDD y desarrollo de API utilizando Nest.js para el registro de usuarios (endpoint de /Registro), con validación de correo | 4.0 |
| HU-01 | TH-1.2 | Implementación de encriptación de contraseña en el backend | 2.0 |
| HU-01 | TH-1.3 | Maquetado del UI para el formulario de registro usando React/Angular y la debida conexión con el backend | 3.0 |
| HU-02 | TH-2.1 | Desarrollo del endpoint de /Login en Nest.js para realizar la validación de credenciales y generación de JWT | 4.0 |
| HU-02 | TH-2.2 | Creación de vista de Login y confirmación de almacenamiento seguro del token JWT | 3.0 |
| HU-03 | TH-3.1 | Desarrollo del endpoint que gestiona los CONTACTOS, incluyendo la regla de negocio que bloquea el registro de mas de 5 contactos de emergencia | 3.0 |
| HU-03 | TH-3.2 | Bosquejo del formulario de ingreso de contactos, con validación del formato del numero telefonico | 2.0 |
| HU-04 | TH-4.1 | Desarrollo de la API para gestionar contactos, implementando la validación para que se mantenga al menos 1 contacto de emergencia | 4.0 |
| HU-04 | TH-4.2 | Desarrollo de vista de contactos, con funciones de edición, eliminación y confirmación de cambios/borrado | 2.0 |
| HU-05 | TH-5.1 | Desarrollo de la vista de MODIFICAR USUARIO, centrandose en las funciones de crear mensaje y seleccionar tipo de emergencia. Añadiendo tambien la regla de 160 caracteres como maximo al mensaje | 2.0 |
| HU-05 | TH-5.2 | Desarrollo de backend para gestionar las emergencias y su persistencia en la BDD | 2.0 |
| HU-06 | TH-6.1 | Implementación en la UI de la función del boton SOS con logica de confirmación personalizable (mantener presionado durante 2 segundos continuos) | 4.0 |
| HU-06 | TH-6.2 | Desarrollo del endpoint de /Alertas, siendo el que recibe las alertas SOS y actualiza el estado del perfil del usuario a "Emergencia activa" | 3.0 |
| HU-07 | TH-7.1 | Integración de plugin de geolocalización (Capacitor) para extraer la ubicación (Latitud y longitud especificamente) en tiempo real | 5.0 |
| HU-07 | TH-7.2 | Desarrollo de la logica de fallback y manejo de Timeout para implementar el uso de la ultima ubicación conocida del usuario | 3.0 |
| HU-08 | TH-8.1 | Integración con servicios de mensajeria (Push/SMS) desde el backend para el envio del enlace con la ubicación | 6.0 |
| HU-08 | TH-8.2 | Desarrollo del registro de auditoria de alertas en la BDD con fecha, hora y estado del envió de la alerta para los contactos | 2.0 |
| HU-09 | TH-9.1 | Desarrollo de endpoints para creación de cuentas secundarias, aplicando la regla de negocios de un maximo de 5 usuarios secundarios por cuenta principal | 4.0 |
| HU-09 | TH-9.2 | Maquetación de panel administrativo de usuario principal para gestionar usuarios secundarios | 3.0 |
| HU-10 | TH-10.1 | Creación y configuración del manejo de PIN en la UI | 3.0 |
| HU-10 | TH-10.2 | Revisión de logica de backend con respecto a la validación y uso de PIN para autorizar acciones como desvinculación de usuarios secundarios | 3.0 |
| HU-11 | TH-11.1 | Implementación de cifrado AES-256 para campos de datos medicos sensibles | 4.0 |
| HU-11 | TH-11.2 | Desarrollo de interfaz del anexo de la ficha medica del usuario revisando su manejo y confidencialidad | 2.0 |
| HU-12 | TH-12.1 | Logica de backend para la generación de la vista publica restringida de la ficha medica enlaces temporales que funcionen en base al estado de la emergencia | 4.0 |
| HU-12 | TH-12.2 | Automatización de la prohibición del acceso al enlace medico inmediatamente despues que la emergencia cambie de estado | 2.0 |
| HU-13 | TH-13.1 | Maquetación completa del panel de administración y empaquetado inicial en Electron para expotación. | 5.0 |
| HU-13 | TH-13.2 | Implementación de servicios de reportes exclusivamente para auditoria por parte del ADMINISTRADOR | 4.0 |