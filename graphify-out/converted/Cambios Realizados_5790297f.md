<!-- converted from Cambios Realizados.docx -->

Cambios Realizados en Documentación

Por el avance realizado en la Fase 2, se han realizado modificaciones específicas a los documentos del proyecto, estos cambios son:

### Acta de Constitución
(28/09/2026) Se modificó el apartado de Especificaciones técnicas de las herramientas de desarrollo reemplazando la definición de “MySQL” por la incorporación de Docker Desktop y PostgreSQL, esto debido a que el contenedor se levanta utilizando una base de datos creada en PostgreSQL
(05/10/2026) Se modificó el apartado de Objetivos de desarrollo reemplazando la definición de “base de datos relacional de ORACLE” por “base de datos relacional de PostgreSQL”.
En el mismo apartado se corrigió la definición “El lenguaje a desarrollar será JavaScript” a “El lenguaje a desarrollar será TypeScript”
(05/10/2026) Se modificó el apartado de Especificaciones técnicas de las herramientas de desarrollo modificando el punto “React/Angular” a “React”, esto debido a que React es el framework de frontend empleado en el desarrollo de las aplicaciones
(05/10/2026) Se modificó el apartado de Solución Propuesta incluyendo el tipo de emergencia “Emergencia”, que contempla accidentes comunes.
(07/10/2026) Se eliminaron Nombres de la sección “Lista de Interesados (stakeholders)”, ya que se mantuvieron nombres que venían incluidos en la plantilla del documento y se reemplazaron por el interesado verdadero; Julio Tapia establecido como Product Owner
(10/10/2026) Se modificó el apartado Objetivos del Negocio, añadiendo el caso de emergencia “Emergencia” que contempla accidentes comunes
(10/10/2026) Se modificó el apartado Objetivos del proyecto, Objetivos de Calidad, específicamente el punto Indicador de éxito, complementando al añadir un método de medición: “100% de los RF en alcance, con al menos 1 caso de prueba P1/P2 aprobado”
En el mismo apartado, se corrigió el objetivo de calidad:
Texto anterior:
“El sistema tiene que cumplir con las normas de calidad definidas en la ISO 9126 y la ISO 25001.”
Texto actual:
“El sistema se evaluará según el modelo de calidad de producto ISO/IEC 25010”

Esto debido a que la ISOs consideradas anteriormente trataban la planificación de evaluación, no un modelo de calidad de producto (que sí considera la ISO/IEC 25010)

En el mismo apartado se añadieron métricas de medición de éxito de:
Seguridad: ≥98% de los casos de seguridad aprobados y 0 defectos críticos
Usabilidad: ≥98% de los casos de usabilidad y responsividad aprobados
Funcionalidad: ≥ 98% de los casos funcionales aprobados
Mantenibilidad: 100% del código funcional sin errores
Interoperabilidad: 100% de los flujos de funcionamiento equivalentes en web, móvil y escritorio
(10/10/2026) Se modificó el apartado Requerimientos de alto nivel, dentro de Módulo Usuario, se especificó el RF3 que mencionaba “empleados”, siendo reemplazado por “personal de soporte” que es acorde a los roles dentro de las aplicaciones.
Al igual que se corrigió un error de tipeo en el RF4 que se refería a los tipos de emergencias que se manejarán y no mencionaba al usuario

Adicionalmente, se hicieron modificaciones a los siguientes RF, sin modificar sus funciones principales, sino que especificando las mismas:
RF5: El sistema debe permitir al usuario configurar el método de activación del SOS. Para personas mayores o usuarios con acceso limitado, la configuración predeterminada requiere pulsación sostenida de 5 segundos; el método es configurable según el tipo de usuario. La activación con la aplicación en segundo plano o cerrada (acceso directo, widget o botón físico) se implementará solo donde el sistema operativo lo permita sin código nativo adicional y se clasifica como Could Have. (Prioridad Could Have y valor del resto de perfiles pendientes de confirmar; ver Cambios Pendientes. La personalización no está implementada en el código fuente de la aplicación móvil.)
RF7: El sistema debe tener un máximo de 5 contactos de emergencia por usuario: la cuenta principal y cada usuario apadrinado deben poder administrar su límite de 5 contactos
RF12: El sistema debe enviar un mensaje personalizado dependiendo de la finalidad del usuario (Urbano, Medico, Emergencias y Adulto mayor)
RF16: La aplicación web debe realizar ventas de planes de cuentas de usuarios y de cupos para usuarios apadrinados.
RF25: La aplicación web y móvil debe permitir al usuario principal definir sus usuarios apadrinados y el nivel de acceso de cada uno (acceso completo o parcial), y solicitar asistencia al personal de soporte en caso de ayuda para gestionarlo
EXCEPCIÓN: Se modificó el RF20 ya que consideraba el acceso a la BDD del sistema que contradice el RNF4:
RF20: La aplicación de escritorio debe permitir al usuario con rol ADMINISTRADOR, consultar y modificar los datos del sistema exclusivamente a través de los datos expuestos por la API del backend

(10/10/2026) Se modificó el apartado Requisitos de aprobación del proyecto, añadiendo los siguientes requisitos no funcionales, esto debido a vacíos presentes en los mismos
RNF6: Al momento de emergencia, el sistema debe registrar la alerta e iniciar acción en un máximo de 3 segundos, y el primer intento de despacho a cada contacto en un máximo de 10 segundos desde la alerta.
RNF7: El sistema debe garantizar la persistencia de las alertas ante fallos, y mantener una disponibilidad objetivo del 99% mensual
RNF8: El sistema debe proteger los datos de salud conforme a la Ley 21.719, exigiendo consentimiento explícito, aplicando cifrado y limitando el acceso a la ficha médica sólo durante emergencias activas
RNF9: Al eliminar una cuenta, el sistema debe suprimir la información personal y médica, conservando únicamente el historial de alertas para fines de auditoría/legales
RNF10: Las interfaces de activación SOS y configuración de contactos deben cumplir con el estándar de accesibilidad WCAG 2.1 nivel AA


### 1.2.1 Hoja de ruta del proyecto
(05/10/2026) Se modificó el apartado de Alineación con la Capacidad Real realizando cambios en la mención de “dos Developers” a “tres Developers” ya que se consideran los 3 integrantes en el desarrollo de tareas dentro del proyecto
(07/10/2026) Se corrigió un error de tipeo en la sección “Criterios para Asignar Historias a Sprints” que definía 7 criterios cuando en realidad eran 6
(10/10/2026) Se modificó el apartado de Introducción, añadiendo el texto “(exceptuando el Sprint 4 correspondiente a la Fase 1 que tiene una duración de dos semanas y los Sprints de Fase 2 que pueden extenderse dependiendo del Sprint Planning)”. Esto justifica la duración del Sprint 4 que dura 2 semanas (31/08 a 14/09) y el Sprint 6 (28/09 a 09/10)
(10/10/2026) Se modificó el apartado de Consolidado Métrico del Backlog, (el cambio del total de historias de 13 a 19 queda pendiente de confirmación: ver Cambios Pendientes).
Al igual que se cambió Historias MVP de 8 a 9, considerando la creación de la HU-14
(10/10/2026) Se modificó el apartado de Objetivos Específicos cambiando el enfoque prioritario de 8 Historias de Usuario a 9, esto debido a la adición de una historia de usuario faltante (HU-14 - Finalizar o cancelar emergencia)
(10/10/2026) Se modificó el apartado de Análisis Crítico de Historias, específicamente el punto Trabajo en Paralelo cambiando la definición de “manera simultánea por dos Developers” a “manera simultánea por dos de los tres Developers”, siguiendo la definición de la capacidad real del mismo documento
(10/10/2026) Se modificó el apartado de Criterios para Asignar Historias a Sprints, específicamente el punto Prioridad:
Texto anterior:
“Cumplimiento estricto del enfoque MVP. Los elementos Must Have son absorbidos en los Sprints 1 al 4.”
Texto actual:
“Cumplimiento estricto del enfoque MVP. Los elementos Must Have se desarrollan en los primeros Sprints de la Fase 2. Los Sprints 1 al 4 de la Fase 1 establecen la base documental y técnica del proyecto.”

Esto se justifica con el punto 8 “Sprint Planning de la Fase 2” del 2.1.1 PRODUCT BACKLOG
(10/10/2026) Se modificó el apartado de Conclusión, específicamente el punto Garantía de Entrega Temprana de Valor:
Texto anterior:
“La consecución del MVP en el Sprint 4 mitiga el riesgo académico de llegar al final del proceso de titulación sin un producto funcional demostrable.”
Texto actual:
“La consecución temprana del MVP en la Fase 2 (9 HUs: HU-01 a HU-08 y HU-14), preparada con la base documental entregada en el Sprint 4 de la Fase 1, mitiga el riesgo académico de llegar al proceso final sin un producto funcional demostrable”

Esto debido a que el MVP no se logra en el Sprint 4, sino que éste prepara la línea base para iniciar la Fase 2

### Especificación de Herramientas y Servicios del Proyecto
(28/09/2026)  Se modificó el apartado de Herramientas y Lenguaje de Código a Utilizar, específicamente el punto de
Base de datos relacional: Se estableció como PostgreSQL por lo comentado en el punto anterior
Se creó el punto Entorno de Ejecución donde se especificó el uso del contenedor mediante Docker Desktop
(28/09/2026)  Se modificó el apartado de Servicios Externos a Implementar, reemplazando “Twilio Send Grid” por “Firebase Authentication”, esto debido a que las funciones necesarias de Twilio solo son accesibles mediante una suscripción, la cual no está contemplada en el proyecto.
Al igual que en el mismo apartado, se añadió Mindicador, debido a que este es necesario para el funcionamiento correcto de la pasarela de pago (Paypal)
(14/10/2026) Se modificó el apartado Servicios Externos a Implementar donde se hacía mención del uso de 4 servicios externos de APIs cuando en realidad son 5
(14/10/2026) Se modificó el apartado Herramientas y Lenguaje de Código a Utilizar, específicamente el punto Desarrollo Frontend, realizando los siguientes cambios, alineando el documento con el ambiente de desarrollo actual:
Texto anterior:
“Se usará React/Angular en conjunto con los componentes base de Ionic para desarrollar interfaces gráficas y la lógica de negocio dentro de la aplicación”
Texto actual:
“Se usará React 19 en conjunto con los componentes base de Ionic React para desarrollar interfaces gráficas y la lógica de negocio dentro de las aplicaciones”

En el mismo apartado, específicamente el punto Gestor de Entorno, se detalló la versión de Turborepo (2.11) y los workspaces de npm:
Texto anterior:
“Se usará Turborepo para alojar las 3 aplicaciones confeccionadas y el backend en un solo repositorio”
Texto actual:
“Se usará Turborepo 2.11 para alojar las 3 aplicaciones confeccionadas y el backend en un solo repositorio (workspaces de npm: apps/* y packages/*)”
(14/10/2026) Se creó el apartado Versiones y Herramientas de Calidad, en el cual se detallan las versiones de las herramientas utilizadas dentro del proyecto, al igual que herramientas de calidad y frameworks de prueba.
(verificado 17/10/2026; fecha de la edición no registrada) En la tabla «Usos de Servicios Externos e Internos» se agregó la fila «Servicio Mensajería (integración WhatsApp)»: módulo interno del backend (/notifications/whatsapp) basado en la librería Baileys, que envía la alerta a cada contacto con reintentos y estado por contacto. Su clasificación como servicio externo o interno sigue pendiente (ver Cambios Pendientes).
### Diagrama de Componentes
(28/09/2026)  Se modificó el apartado de Servicios Externos, corrigiendo la duplicación de un servicio e incluyendo “Servicio Mensajeria” y “Servicio Conversión de Divisas” que previamente no se había definido (Verificado en código: integración WhatsApp mediante Baileys; añadida a la tabla de usos de la Especificación 4.2.)
### Diagrama de Arquitectura
(28/09/2026)  Se modificó el apartado de Servicios y APIs Externas, reemplazando “Send Grid (Correos Transaccionales)” por “jsReport (Confección de Reportes)”.
Dentro del mismo apartado se añadió “Mindicador (Conversor de Divisas)” que “Realiza Conversión de Dinero”
(28/09/2026) Se modificó el apartado Proveedor de Nube (Entorno de Docker), reemplazando “Base de datos SQL” por “Base de datos PostgreSQL”

### BDD con tipos de datos
(05/10/2026) Se modifica el apartado de PLANES, modificando la tabla PLAN, eliminando los datos:
total_venta
fecha_venta
Esto ya que estos datos no pertenecen a dicha tabla y causaron conflictos en el ambiente de desarrollo
Nota de verificación (17/10/2026): en la copia del repositorio de «BDD con tipos de datos.xlsx» (hoja PLANES), la tabla PLAN todavía contiene total_venta (celda A10) y fecha_venta (celda A11). La eliminación no está reflejada en el archivo; ver Cambios Pendientes.
(06/10/2026) En el apartado de USUARIO se añade la tabla “ANTECEDENTE_MEDICO”, la cual controla la información médica entregada por el usuario
(06/10/2026) En el apartado de ALERTA, considerando la tabla “DETALLE_ALERTA”, se añadió la clave foránea de “antecedente_medico_ID” que conecta la tabla anteriormente creada con las alertas
(06/10/2026) Se han modificado TODOS los tipos de datos del documento, adaptandolos a aquellos empleados en el uso de PostgreSQL, esto debido a que anteriormente se tomaron en cuenta tipos de datos de MySQL
Nota de verificación (17/10/2026): la adaptación no está completa en el archivo. CONTACTO.correo_remitente sigue como nvarchar (120), PIN.PIN como integer (4) (hoja USUARIO) y la hoja PROPUESTA DE MEJORA conserva tipos nvarchar e int; ver Cambios Pendientes.

### 2.1.1 PRODUCT BACKLOG
(10/10/2026) Se eliminaron “vacíos de acciones” en las historias de usuario, específicamente en la HU-12, donde no se especificaba el cierre de la emergencia, sinó la visualización de los datos médicos y su duración
Texto anterior:
“1. Los datos médicos sólo se vuelven visibles a través del enlace de la alerta mientras la emergencia permanezca activa.

2. Una vez desactivada la alerta por el usuario o tutor mediante PIN, el acceso a la ficha médica se revoca automáticamente.”
Texto actual:
“1. Los datos médicos sólo se vuelven visibles a través del enlace de la alerta mientras la emergencia permanezca activa.

2. Cuando la emergencia deja de estar ACTIVA (ya sea finalizada, cancelada o expirada tomando en cuenta HU-14), el acceso a la ficha médica se revoca automáticamente

3. Si el usuario no registra ficha médica y/o ningún antecedente médico externo, la alerta es enviada independientemente si existe o no documentación de alguna situación médica.”
(16/10/2026) En el apartado de Features por Épica, se añadieron las siguientes features que cubren vacíos de funciones:
En el punto: EP-05: Activación SOS y Geolocalización
F05.3: Finalización y expiración de la emergencia (Estados: Activa, Finalizada, Expirada)
En el punto: EP-07: Cuentas Vinculadas y PIN
F07.3: Adquisición de planes de usuario principal y cupos para usuarios apadrinados
En el punto: EP-09: Plataforma Administrativa
F09.3: Solicitudes de soporte desde la aplicación web
(16/10/2026) En el apartado Historias de Usuario y Criterios de Aceptación, se modificaron las siguientes historias de usuario para cubrir vacíos técnicos de funciones:
HU-06: Disparar Alerta de Emergencia SOS
Texto anterior:
“1. La interfaz del botón SOS debe requerir una confirmación rápida (p. ej., mantener presionado 2 segundos) para evitar activaciones accidentales.
2. Al confirmarse la activación, el sistema cambia el estado del perfil a "En Emergencia Active"”
Texto actual:
“1. La interfaz del botón SOS debe requerir una confirmación rápida (p. ej., mantener presionado 2 segundos) para evitar activaciones accidentales.
2. Al confirmarse la activación, el sistema registra la alerta en estado ACTIVA (estados de alerta detallados en HU-14) y responde en un plazo de 3 segundos
3. Solo puede existir una alerta ACTIVA por usuario y los reintentos no deben duplicar las mismas”
Nota de verificación (17/10/2026): el criterio 1 de HU-06 en el Product Backlog dice ahora «mantener presionado 5 segundos en el perfil predeterminado de personas mayores o usuarios con acceso limitado; la duración es configurable según el tipo de usuario», en línea con RF5. El texto actual citado arriba (2 segundos) corresponde a la versión del 16/10/2026.

HU-08: Despachar Notificación de Alerta
Texto anterior:
“1. La alerta se transmite mediante el servicio de notificaciones Push / SMS a los contactos asignados (1 a 5).
2. El sistema almacena la hora exacta y el estado del envío para auditoría.”
Texto actual:
“1. La alerta se transmite mediante el servicio de notificaciones Push / SMS a los contactos asignados (1 a 5).
2. El sistema almacena por cada contacto, la hora exacta, número de intentos y  el estado del envío (Enviado, Pendiente, Fallido) para auditoría.”

HU-09: Crear y Vincular Usuario Dependiente
Texto anterior:
“1. La cuenta principal puede vincular un máximo de 5 usuarios dependientes.
2. Cada dependiente posee sus propios datos personales aislados en la BD.
3. La vinculación se valida mediante el PIN de la cuenta principal.”
Texto actual:
“1. La cuenta principal puede vincular un máximo de 5 usuarios dependientes.
2. Cada dependiente posee sus propios datos personales aislados en la BD.
3. La vinculación se valida mediante el PIN de la cuenta principal.
4. Si la cuenta principal no tiene cupos disponibles, el sistema deriva a la compra de cupos.”

HU-13: Panel de Administración de Usuarios (Web/Desktop)
Texto anterior:
“1. El panel muestra el estado de las cuentas (Activa, Bloqueada, En Emergencia).
2. Solo los usuarios con rol "Administrador" pueden acceder a este módulo.”
Texto actual:
“1. El panel muestra el estado de las cuentas (Acceso completo, Acceso Parcial, Bloqueado/Inactivo) y si tienen una alerta ACTIVA.
2. Solo los usuarios con rol "Administrador" pueden acceder a este módulo.
3. El administrador puede consultar cuentas y compras realizadas, y cambiar el estado de la cuenta en caso de necesitarse, mediante la solicitud de soporte. Cada acción del administrador queda registrada en una bitácora.
4. El sistema debe tener al menos 1 administrador y este no puede remover ni modificar su rol.”
### Horas hombre en relación a Tareas
(14/10/2026) Se corrigió la columna Tareas o Actividad de la tarea TH-1.3, donde se mencionaba el uso de “React/Angular” cuando este es “React + Ionic”

### Sprint backlog actividades horas
(14/10/2026) Se corrigió la columna Tareas o Actividad de la tarea TH-1.3, donde se mencionaba el uso de “React/Angular” cuando este es “React + Ionic”


### 2.1.1 PRODUCT BACKLOG (correcciones de la auditoría)
(aplicado 17/10/2026) [AUDIT-079] Dependencias de las tareas TD: “Depecencia: F1-xx” corregido a “Dependencia: TD-xx” (10 tareas); errata y IDs antiguos corregidos.
(aplicado 17/10/2026) [AUDIT-112] Garantía de viabilidad: “dos Developers” corregido a “tres Developers”.
(verificado 17/10/2026; no estaba registrado) [AUDIT-090] HU-10: nuevo criterio «Si la cuenta tiene usuarios apadrinados, después del inicio de sesión, el sistema solicita el PIN para identificar el perfil que ingresa», y el acceso completo o parcial del usuario apadrinado se agrega a las acciones críticas que exigen PIN. Queda abierto el comentario de Alonso González sobre el ingreso de los usuarios apadrinados.
### 1.3 Acta de constitución
(aplicado 17/10/2026) [AUDIT-052] Control de cambios: versión 1.2 (07-10-2026) agregada. Autor: Gabriel Valencia.
### 1.4 Documento ERS
(no verificado, 17/10/2026) [AUDIT-053] Ficha del documento: “IEEE 830” ya no aparece en el Informe ERS, pero la frase de portada que contenía la norma no está en el archivo y no se encuentra ISO/IEC/IEEE 29148:2018. Pendiente de confirmar con el autor.
(aplicado 17/10/2026) [AUDIT-055] RF3: el rol “empleados” pasa a “personal de soporte (rol SOPORTE)”, con verificación de identidad.
(aplicado 17/10/2026) [AUDIT-057] RF5: método de activación del SOS configurable según el tipo de usuario, con pulsación sostenida de 5 segundos en el perfil predeterminado de personas mayores o usuarios con acceso limitado; la activación en segundo plano se clasifica como Could Have. Pendiente: confirmar la prioridad Could Have y el valor para el resto de perfiles. (Corregido el 17/10/2026: esta entrada decía «2 segundos», pero el Informe ERS indica 5 segundos.)
(aplicado 17/10/2026) [AUDIT-058] RF7: límite de 5 contactos de emergencia por usuario (cada usuario apadrinado administra su límite).
(aplicado 17/10/2026) [AUDIT-063] RF25: nivel de acceso de cada usuario apadrinado y asistencia al personal de SOPORTE.
(aplicado 17/10/2026) [AUDIT-054] Ficha del documento: revisión 1.1 (07/10/2026). Autor: Gabriel Valencia.
(aplicado 17/10/2026) [AUDIT-067] Anexo “Carta Gantt”: documento externo y precedencia de la Hoja de ruta y de los Sprint Planning.
(ejecutado, sin validar, 17/10/2026) [AUDIT-068] Índice: ya no repite «Limitaciones», incluye «3. Hitos del Proyecto» y rotula el anexo «5.1. Carta Gantt». Pendiente: validar los números de página en Word y la referencia del anexo a la «sección 2.3» (en el índice, Hitos del Proyecto es la sección 3).
### 2.3 Plan de Pruebas
(aplicado 17/10/2026) [AUDIT-157] Control del documento: versión 1.1 (07-10-2026). Estado pendiente de confirmar.
### 2.3 Matriz de trazabilidad de Pruebas
(aplicado 17/10/2026) [AUDIT-167] CP-RBAC-001: el rol “empleado” pasa a “soporte (rol SOPORTE)”.
### 1.5 RACI
(aplicado 17/10/2026) [AUDIT-069] [AUDIT-070] Desarrollo de Escritorio: R = Especialista de Escritorio, A = Arquitecto de Software. Testing QA: R = Especialista QA, A = Product Owner, Jefe de Proyecto = C.
(aplicado 17/10/2026) [AUDIT-071] Product Owner = C en Documentación inicial y en Definición de requisitos.
(aplicado 17/10/2026) [AUDIT-072] Nueva fila “Aceptación de incrementos (Sprint Review)”: Jefe de Proyecto = R, Product Owner = A, especialistas = C.
Pendiente: rebalanceo de la carga de Alonso en la RACI [AUDIT-P09] (ver Cambios Pendientes).
### 3.1 Criterios de Aceptación
(aplicado 17/10/2026) [AUDIT-172] CA-03.1: validación del teléfono en formato E.164, sin duplicados ni el número propio; nuevo mensaje de error. Corregida la errata “numéro” en el título.
(aplicado 17/10/2026) [AUDIT-173] CA-05.1: límite de 160 caracteres con contador que cambia a rojo; el backend rechaza mensajes de más de 160 caracteres.
(aplicado 17/10/2026) [AUDIT-174] CA-08.1: registro del intento de envío por contacto (PENDIENTE, ENVIADO o FALLIDO), número de intentos y hora; reintento ante fallo del proveedor.
(verificado 17/10/2026; no estaba registrado) CA-06.1: la confirmación del SOS pasa de 2 a 5 segundos en el perfil predeterminado de personas mayores o usuarios con acceso limitado; la duración es configurable según el tipo de usuario (valor para el resto de perfiles pendiente). Coherente con RF5. La Tabla Maestra (2.1.2) mantiene CA-06.1 con 2 segundos (ver Cambios Pendientes).
### 1.2.2 Sprint-fase1
(aplicado 17/10/2026) [AUDIT-031] Sprint 3: periodo 24 al 28 de agosto de 2026 (antes 31 ago–14 sep, copiado del Sprint 4).
(aplicado 17/10/2026) [AUDIT-032] Sprint 4: periodo 31 de agosto al 14 de septiembre de 2026, confirmado por el usuario (antes 31 ago–6 sep).
### 1.2.3 Sprint-fase2
(aplicado 17/10/2026) [AUDIT-033] Sprint 5: Daily Scrum 21 al 25 de septiembre (antes agosto).
(aplicado 17/10/2026) [AUDIT-034] Sprint 6: Daily Scrum 28 al 30 de septiembre y 1 al 9 de octubre (antes agosto).
(aplicado 17/10/2026) [AUDIT-035] Sprint 6: hito académico jueves 1 y 8 de octubre a las 1:40 (antes jueves 24, copiado del Sprint 5).