<!-- converted from Informe ERS.docx -->





# Índice

Ficha del documento


Integrantes:


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
RF3: El sistema debe poder modificar las credenciales de los usuarios y empleados desde la página web / escritorio / móvil
RF4: El sistema debe modificar las especificaciones y finalidad del usuario (médico, urbano, emergencias y adulto mayor)
RF5: El sistema debe poder personalizarse a gusto del usuario considerando el formato de activación en segundo plano.
RF6: El sistema debe tener al menos 1 contacto de emergencia ingresado dentro de un usuario/cuenta para su correcto uso.
RF7: El sistema debe tener un límite de 5 contactos de emergencia por cuenta, considerando también cuentas apadrinadas.
RF8: El sistema debe tener un máximo de 5 usuarios apadrinados posibles dentro de una cuenta
RF9: El sistema debe tener los datos personales filtrados para cada cuenta y sus usuarios apadrinados
RF10: El sistema debe poder filtrar información médica y que está solo sea compartida a las personas designadas por el usuario.
Módulo Alertas:
RF11: El sistema debe enviar un mensaje a los contactos de emergencia registrados por el usuario
RF12: El sistema debe enviar un mensaje personalizado dependiendo de la finalidad del usuario (médico, urbano, emergencias y adulto mayor)
RF13: El sistema debe compartir la última ubicación ingresada desde el dispositivo a los contactos de emergencia del usuario.
RF14: El sistema debe informar a las redes de seguridad más cercanas del usuario (números de emergencias)
Sistema en General:
RF15: Se debe tener una aplicación de escritorio la cual administre el software.
RF16:	La aplicación web debe realizar ventas de cuentas de usuarios.
RF17: El sistema debe generar descuentos a usuarios que quisieran apadrinar otra cuenta dentro de ella.
RF18: La aplicación web debe poder realizar contacto de soporte en caso de problemas de software de los usuarios.
RF19: La aplicación de escritorio debe poder gestionar las cuentas vinculadas a los usuarios, sin perder el espacio apadrinado anteriormente.
RF20: La aplicación de escritorio debe poder modificar la BBDD de la página web y aplicación móvil.
RF21: La aplicación de escritorio debe poder generar informes de seguimiento de los usuarios.
RF22: La aplicación web y móvil deben poder generar informes de seguimiento personales de las cuentas.
RF23: La aplicación web y móvil debe funcionar con un sistema de pin único que esté vinculado a la cuenta principal para el ingreso personal de los usuarios.
RF24: La aplicación web y móvil el primer inicio de sesión debe estar vinculado a la cuenta principal.
RF25: La aplicación web y móvil debe poder decidir el usuario principal, las personas que tiene apadrinadas en su cuenta y cómo son utilizadas con un soporte de usuario externo.
## Requisitos no funcionales
RNF1: Las aplicaciones deben ser responsivas
RNF2: La aplicación web debe ser compatibles entre navegadores
RNF3: El sistema debe garantizar la seguridad al gestionar correos y credenciales de ingreso
RNF4: El backend debe ser el único encargado de procesar la seguridad mediante un modelo estricto de control de acceso basado en roles
RNF5: El sistema debe garantizar la seguridad y confidencialidad de los datos proporcionados por el usuario

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
Desarrollo de Aplicación Web
Semana 5 a Semana 7
Desarrollo de Aplicación Móvil
Semana 8 a Semana 10
Desarrollo Aplicación de Escritorio
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

| DUOC UC - Escuela de informática y telecomunicaciones |
| --- |
| Propuesta de Proyecto       y Especificación de Requisitos de Software |
| Proyecto: “EMERGEN” |
|  |
|  |
|  |
| Planificación y Especificación de Requisitos según estándares; IEEE 830, ISO9000 y PMI. |
| --- |
| Fecha | Revisión | Autor | Modificación |
| --- | --- | --- | --- |
| 04/09 | 1.0 | Alonso González | Redacción inicial del documento |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
| Nombre Integrante del Equipo | Rol Definido |
| --- | --- |
| Gabriel Valencia | Scrum Master |
| Diego Plaza | Equipo de Desarrollo |
| Alonso González | Equipo de Desarrollo |