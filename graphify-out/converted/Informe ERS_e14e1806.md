<!-- converted from Informe ERS.docx -->


| DUOC UC - Escuela de informática y telecomunicaciones |
| --- |
| Propuesta de Proyecto y Especificación de Requisitos de Software |
| Proyecto: “EMERGEN” |
|  |
|  |
|  |

|  |
| --- |
# Índice
Tabla de contenido
ÍNDICE	2
1.	INTRODUCCIÓN	3
1.1.	Propósito	3
1.2.	Visión General del Documento	3
2.	REQUISITOS ESPECÍFICOS	3
2.1.	Requisitos Funcionales	3
2.2.	Requisitos no funcionales	5
3.	Hitos del Proyecto	6
4.	LIMITACIONES:	7
5.	ANEXOS	6
5.1.	Carta Gantt	6


Ficha del documento

| Fecha | Revisión | Autor | Modificación |
| --- | --- | --- | --- |
| 04/09 | 1.0 | Alonso González | Redacción inicial del documento |
| 07/10/2026 | 1.1 | Gabriel Valencia | Correcciones de la auditoría técnica (ver Cambios Realizados (AUDITORÍA CLAUDE)) |
|  |  |  |  |
|  |  |  |  |

Integrantes:
| Nombre Integrante del Equipo | Rol Definido |
| --- | --- |
| Gabriel Valencia | Scrum Master |
| Diego Plaza | Equipo de Desarrollo |
| Alonso González | Equipo de Desarrollo |


# Introducción
El siguiente documento abordará el contexto de las funcionalidades del proyecto a desarrollar y específicamente los requerimientos funcionales y no funcionales del mismo, detallando sus características y limitaciones
## Propósito
El propósito de este documento es definir y detallar las especificaciones que considerarán las aplicaciones a confeccionar (Aplicación web, móvil y escritorio). Estas aplicaciones corresponden al proyecto “EMERGEN” el cual, brevemente, consiste en la gestión de alertas de emergencia, manteniendo un control sobre los usuarios y actividades realizadas por los mismos
## Visión General del Documento
Este documento ERS especificará los requerimientos funcionales y no funcionales sobre los cuales se basará el proyecto al igual que los hitos que se trabajarán, esto último teniendo un valor considerable al servirnos como guía técnica durante los Sprints de desarrollo. En las siguientes secciones del documento se detallarán los requerimientos funcionales y no funcionales y las posibles limitaciones del sistema, estos requerimientos exponen lo que el sistema debe hacer como la gestión de suscripciones y la emisión de alertas, y también cómo debe operar en materia de seguridad, rendimiento y accesibilidad
# Requisitos específicos
Se detallan los requerimientos funcionales ordenados por módulos y los requerimientos no funcionales considerados para el desarrollo del proyecto.
## Requisitos Funcionales
Modulo Usuarios:
RF1: El sistema debe permitir crear una cuenta al usuario
RF2: El sistema debe permitir iniciar sesión al usuario con sus credenciales
RF3: El sistema debe permitir modificar las credenciales (correo y contraseña) de los usuarios y del personal de soporte desde la página web / escritorio / móvil, previa verificación de identidad.
RF4: El sistema debe modificar las especificaciones y finalidad del usuario (Urbano, Medico, Emergencias y Adulto mayor)
RF5: El sistema debe permitir al usuario configurar el método de activación del SOS según su tipo de usuario. Para personas mayores o usuarios con acceso limitado, la configuración predeterminada requiere mantener pulsado el botón SOS durante 5 segundos. La activación con la aplicación en segundo plano o cerrada (acceso directo, widget o botón físico) se implementará solo donde el sistema operativo lo permita sin código nativo adicional y se clasifica como Could Have (prioridad pendiente de confirmación). El valor para el resto de perfiles queda pendiente de confirmar.
RF6: El sistema debe tener al menos 1 contacto de emergencia ingresado dentro de un usuario/cuenta para su correcto uso.
RF7: El sistema debe permitir un máximo de 5 contactos de emergencia por usuario: la cuenta principal y cada usuario apadrinado administran su propio límite de 5 contactos. El límite se valida en el backend (CA-03.2).
RF8: El sistema debe tener un máximo de 5 usuarios apadrinados posibles dentro de una cuenta
RF9: El sistema debe tener los datos personales filtrados para cada cuenta y sus usuarios apadrinados
RF10: El sistema debe poder filtrar información médica y que está solo sea compartida a las personas designadas por el usuario.
Módulo Alertas:
RF11: El sistema debe enviar un mensaje a los contactos de emergencia registrados por el usuario
RF12: El sistema debe enviar un mensaje personalizado dependiendo de la finalidad del usuario (Urbano, Medico, Emergencias y Adulto mayor)
RF13: El sistema debe compartir la última ubicación ingresada desde el dispositivo a los contactos de emergencia del usuario.
RF14: El sistema debe mostrar al usuario los números oficiales de emergencia (131, 132 y 133)
Sistema en General:
RF15: Se debe tener una aplicación de escritorio la cual administre el software.
RF16:	La aplicación web debe realizar ventas de planes de cuenta de usuario y de cupos para usuarios apadrinados, utilizando PayPal en modo sandbox (pruebas) y Mindicador para la conversión CLP–USD.
RF17: El sistema debe generar descuentos a usuarios que quisieran apadrinar otra cuenta dentro de ella.
RF18: La aplicación web debe poder realizar contacto de soporte en caso de problemas de software de los usuarios.
RF19: La aplicación de escritorio debe poder gestionar las cuentas vinculadas a los usuarios, sin perder el espacio apadrinado anteriormente.
RF20: La aplicación de escritorio debe poder modificar la BBDD de la página web y aplicación móvil.
RF21: La aplicación de escritorio debe poder generar informes de seguimiento de los usuarios.
RF22: La aplicación web y móvil deben poder generar informes de seguimiento personales de las cuentas.
RF23: La aplicación web y móvil debe funcionar con un sistema de pin único que esté vinculado a la cuenta principal para el ingreso personal de los usuarios.
RF24: La aplicación web y móvil el primer inicio de sesión debe estar vinculado a la cuenta principal.
RF25: La aplicación web y móvil debe permitir al usuario principal definir sus usuarios apadrinados y el nivel de acceso de cada uno (acceso completo o acceso parcial), y solicitar asistencia al personal de SOPORTE cuando requiera ayuda para gestionarlos.
## Requisitos no funcionales
RNF1: Las aplicaciones deben ser responsivas
RNF2: La aplicación web debe ser compatibles entre navegadores
RNF3: El sistema debe garantizar la seguridad al gestionar correos y credenciales de ingreso
RNF4: El backend debe ser el único encargado de procesar la seguridad mediante un modelo estricto de control de acceso basado en roles
RNF5: El sistema debe garantizar la seguridad y confidencialidad de los datos proporcionados por el usuario
RNF6: Al momento de emergencia, el sistema debe registrar la alerta e iniciar acción en un máximo de 3 segundos, y el primer intento de despacho a cada contacto en un máximo de 10 segundos desde la alerta.
RNF7: El sistema debe garantizar la persistencia de las alertas ante fallos, y mantener una disponibilidad objetivo del 99% mensual
RNF8: El sistema debe proteger los datos de salud conforme a la Ley 21.719, exigiendo consentimiento explícito, aplicando cifrado y limitando el acceso a la ficha médica sólo durante emergencias activas
RNF9: Al eliminar una cuenta, el sistema debe suprimir la información personal y médica de forma inmediata, conservando únicamente el historial de alertas para fines de auditoría/legales
RNF10: Las interfaces de activación SOS y configuración de contactos deben cumplir con el estándar de accesibilidad WCAG 2.1 nivel AA
## Hitos del Proyecto
Los requisitos funcionales y no funcionales del proyecto se basan en los hitos principales ya establecidos dentro del proyecto, estos hitos fueron divididos en fases tomando en cuenta la Carta Gantt confeccionada previamente, los hitos y sus respectivas semanas y fases son:
Fase 1
Documentación inicial, Definición del proyecto y metodología
Semana 1
Definición de requisitos Funcionales/No Funcionales
Semana 2
Diseño y Definición de Software/Herramientas a Utilizar
Semana 3
Implementación y Configuración de Entorno de Desarrollo
Semana 4
Modelado de datos y definición de variables
Semana 4
Fase 2
Inicio del desarrollo de la Aplicación
Semana 5 a Semana 7
Desarrollo de Aplicación Móvil
Semana 8 a Semana 10
Finalización del desarrollo de la aplicación
Semana 11 a Semana 13
Testing, QA y confección y ejecución de pruebas
Semana 14 a Semana 15
Fase 3
Implementación de Solución
Semana 16 a Semana 17
Mantenimiento de Aplicaciones desplegadas
Semana 18
Esta definición de hitos y fechas nos permite mantener un correcto alineamiento sobre el ritmo en que se llevará a cabo el desarrollo de las aplicaciones y también gracias a estos, nos permite desglosar de mejor manera los requerimientos a trabajar


# Limitaciones:
Algunas limitaciones que se han identificado a las que nos podemos enfrentar dentro del desarrollo del sistema y posiblemente durante su implementación son:
Errores en exportación de aplicaciones
Dependencia operativa de las APIs
Errores de compatibilidad de herramientas de desarrollo y/o versiones de las mismas
Limitaciones por conectividad continua
Dificultades al configurar entornos de desarrollo y/o entornos de Monorepo
# Anexos
## Carta Gantt
La Carta Gantt se mantiene como documento externo, enlazado en la sección 2.3 (Hitos del Proyecto). Ante cualquier diferencia de fechas, prevalecen la Hoja de ruta del proyecto (1.2.1) y los Sprint Planning de la Fase 1 y la Fase 2 (1.2.2 y 1.2.3).
