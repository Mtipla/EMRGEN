<!-- converted from Especificación de Herramientas y Servicios del Proyecto.docx -->



Especificación de Herramientas y Servicios del Proyecto
Capstone




















Integrantes: Gabriel Valencia, Diego Plaza, Alonso González
Docente: Julio Tapia
Sección: 704D








## Introducción
Dentro de este documento se especifican las APIs, servicios externos e internos que se considerarán en el desarrollo del proyecto “Emergen”, detallando el funcionamiento de los servicios y la forma en que se utilizarán dentro del proyecto y la función que llevarán a cabo.
Adicionalmente a esto, se detallarán brevemente las herramientas a utilizar, lenguaje de código y aplicaciones necesarias para el desarrollo correcto de las aplicaciones consideradas dentro del proyecto.

## Herramientas y Lenguaje de Código a Utilizar
Para el desarrollo de las aplicaciones, se optó por utilizar herramientas que aseguren un mismo ambiente de desarrollo, lo que permite centralizar la lógica y evitar problemas al exportar las aplicaciones, sus funciones y así agilizar el trabajo, en base a esto se optará por utilizar:
Lenguaje de programación:
Se utilizará TypeScript como lenguaje unificado para el proyecto en general, con esto garantizamos que el backend y las aplicaciones compartan datos idénticos y no surjan problemas de mal tipado de datos
Backend y API REST:
Se implementará Node.js como entorno de ejecución, usando Nest.js como framework principal para la confección de las APIs internas que consumen las aplicaciones.
Desarrollo Frontend:
Se usará React/Angular en conjunto con los componentes base de Ionic para desarrollar interfaces gráficas y la lógica de negocio dentro de la aplicación
Aplicación Movil:
Se utilizará Capacitor para realizar la exportación de la aplicación web directamente a una aplicación móvil, esto debido a que Capacitor es una herramienta nativa de Ionic, lo que agiliza inmensamente el trabajo de desarrollo
Aplicación de Escritorio:
Se utilizará el framework Electron para exportar la aplicación web desarrollada como un software ejecutable local, siendo esta la aplicación que gestionará la plataforma web y móvil
Gestor de Entorno:
Se usará Turborepo para alojar las 3 aplicaciones confeccionadas y el backend en un solo repositorio
Base de datos relacional:
Se utilizará MySQL para la gestión y confección de las 30 tablas normalizadas solicitadas para el sistema, garantizando la integridad de los datos
## Servicios Externos a Implementar
Las aplicaciones harán uso de 4 servicios externos de APIs los cuales son necesarios para el funcionamiento correcto de las aplicaciones, estos servicios son:
PayPal REST API
Twilio SendGrid Email Validation
jsReport API
Google Maps Platform API
## Servicios Internos a Desarrollar
Las aplicaciones también harán uso de 2 servicios de API REST creados por el equipo de desarrollo, estos servicios gestionan datos vitales de las aplicaciones y son necesarios para el funcionamiento completo de la página, estas APIs y su propósito se explican a continuación:
API Integrada de Usuarios:
Gestionará todos los datos relacionados a las tablas de datos de USUARIO y se utilizará para el control de permisos, conexión con planes y la administración de los usuarios
API Integrada de Alertas:
Gestionará todos los datos relacionados a las tablas de datos de ALERTAS, se utilizará para la función principal de las aplicaciones, ya que en este servicio se administrarán los llamados de alerta, ubicación, historial de las mismas y su detalle

Considerando los servicios previamente mencionados, a continuación se presenta una tabla la cual explica las funciones nativas de dichos servicios, y la forma en que se utilizarán o funciones que cumpliran dentro del proyecto.
## Usos de Servicios Externos e Internos






| APIs a Implementar | Funciones del Servicio | Funciones a cumplir dentro del proyecto |
| --- | --- | --- |
| PayPal REST API | Servicio que cumple la función de pasarela de pago permitiendo realizar/simular transacciones | Se utilizará para completar los pagos de los planes y pagos de usuarios apadrinados dentro de la página |
| API Integrada de Usuarios | Servicio creado por el equipo de desarrollo para manejar la gestión de los usuarios ingresados al sistema | Dentro de este servicio, se almacenarán todos los datos relevantes a los usuarios para su posterior uso |
| API Integrada de Alertas | Servicio creado por el equipo de desarrollo para gestionar las alertas generadas por los usuarios en el sistema | Se utilizará para almacenar todos los datos de una alerta generada por un usuario y su posterior uso |
| Twilio SendGrid Email Validation | Servicio que verifica correos electrónicos ingresados al sistema, revisando dominios y existencia de los mismos, adicional a esto otorga funciones para la recuperación de contraseñas | Se utilizará para verificar la validez de los correos electrónicos que sean utilizados para crear un usuario dentro de la página, al igual que el manejo de la recuperación de contraseñas |
| jsReport API | Servicio que genera informes en formato PDF o Excel y habilita su descarga dentro del sistema | Se usará para la auditoría general de los usuarios ADMIN y SOPORTE, al igual que las acciones del usuario principal y el apadrinado, se podrán generar informes que detallen las acciones o movimientos de su cuenta y las relacionadas |
| Google Maps Platform API | Servicio que permite la captura de una ubicación exacta del usuario, utilizando parámetros de Longitud y Latitud | Para el correcto manejo de las emergencias dentro del proyecto, es necesario utilizar la ubicación al momento de la emergencia, por lo tanto esta se extrae y se utilizará para el registro y manejo de la emergencia |