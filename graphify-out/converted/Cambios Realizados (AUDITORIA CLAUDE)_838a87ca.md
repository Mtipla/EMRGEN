<!-- converted from Cambios Realizados (AUDITORIA CLAUDE).docx -->

Cambios Realizados en Documentación

Por el avance realizado en la Fase 2, se han realizado modificaciones específicas a los documentos de la Fase 1, estos cambios son:

Acta de Constitución
(28/09/2026) Se modificó el apartado de Especificaciones técnicas de las herramientas de desarrollo reemplazando la definición de “MySQL” por la incorporación de Docker Desktop y PostgreSQL, esto debido a que el contenedor se levanta utilizando una base de datos creada en PostgreSQL
(05/10/2026) Se modificó el apartado de Objetivos de desarrollo reemplazando la definición de “base de datos relacional de ORACLE” por “base de datos relacional de PostgreSQL”.
En el mismo apartado se corrigió la definición “El lenguaje a desarrollar será JavaScript” a “El lenguaje a desarrollar será TypeScript”
(05/10/2026) Se modificó el apartado de Especificaciones técnicas de las herramientas de desarrollo modificando el punto “React/Angular” a “React”, esto debido a que React es el framework de frontend empleado en el desarrollo de las aplicaciones
(05/10/2026) Se modificó el apartado de Solución Propuesta incluyendo el tipo de emergencia “Emergencia”, que contempla accidentes comunes.
(07/10/2026) Se eliminaron Nombres de la sección “Lista de Interesados (stakeholders)”, ya que se mantuvieron nombres que venían incluidos en la plantilla del documento y se reemplazaron por el interesado verdadero; Julio Tapia establecido como Product Owner

1.2.1 Hoja de ruta del proyecto
(05/10/2026) Se modificó el apartado de Alineación con la Capacidad Real modificando la mención de “dos Developers” a “tres Developers” ya que se consideran los 3 integrantes en el desarrollo de tareas dentro del proyecto
(07/10/2026) Se corrigió un error de tipeo en la sección “Criterios para Asignar Historias a Sprints” que definía 7 criterios cuando en realidad eran 6
(07/10/2026)

Especificación de Herramientas y Servicios del Proyecto
(28/09/2026)  Se modificó el apartado de Herramientas y Lenguaje de Código a Utilizar, específicamente el punto de
Base de datos relacional: Se estableció como PostgreSQL por lo comentado en el punto anterior
Se creó el punto Entorno de Ejecución donde se especificó el uso del contenedor mediante Docker Desktop
(28/09/2026)  Se modificó el apartado de Servicios Externos a Implementar, reemplazando “Twilio Send Grid” por “Firebase Authentication”, esto debido a que las funciones necesarias de Twilio solo son accesibles mediante una suscripción, la cual no está contemplada en el proyecto.
Al igual que en el mismo apartado, se añadió Mindicador, debido a que este es necesario para el funcionamiento correcto de la pasarela de pago (Paypal)
Diagrama de Componentes
(28/09/2026)  Se modificó el apartado de Servicios Externos, corrigiendo la duplicación de un servicio e incluyendo “Servicio Mensajeria” y “Servicio Conversión de Divisas” que previamente no se había definido
Diagrama de Arquitectura
(28/09/2026)  Se modificó el apartado de Servicios y APIs Externas, reemplazando “Send Grid (Correos Transaccionales)” por “jsReport (Confección de Reportes)”.
Dentro del mismo apartado se añadió “Mindicador (Conversor de Divisas)” que “Realiza Conversión de Dinero”
(28/09/2026) Se modificó el apartado Proveedor de Nube (Entorno de Docker), reemplazando “Base de datos SQL” por “Base de datos PostgreSQL”

BDD con tipos de datos
(05/10/2026) Se modifica el apartado de PLANES, modificando la tabla PLAN, eliminando los datos:
total_venta
fecha_venta
Esto ya que estos datos no pertenecen a dicha tabla y causaron conflictos en el ambiente de desarrollo
(06/10/2026) En el apartado de USUARIO se añade la tabla “ANTECEDENTE_MEDICO”, la cual controla la información médica entregada por el usuario
(06/10/2026) En el apartado de ALERTA, considerando la tabla “DETALLE_ALERTA”, se añadió la clave foránea de “antecedente_medico_ID” que conecta la tabla anteriormente creada con las alertas
(06/10/2026) Se han modificado TODOS los tipos de datos del documento, adaptandolos a aquellos empleados en el uso de PostgreSQL, esto debido a que anteriormente se tomaron en cuenta tipos de datos de MySQL

Correcciones aplicadas el 07/10/2026 según la Auditoría Técnica EMERGEN
Se contrastó la Auditoría Técnica EMERGEN (05/10/2026) con esta bitácora y con el repositorio (init.sql, package.json y Dockerfile). Solo se corrigió el delta pendiente y no se revirtió ninguna decisión registrada arriba. Criterio: la documentación se alinea con lo que ya existe en el repositorio, y los cambios de esquema que aún no están en init.sql se marcan como migración propuesta. Decisiones del equipo aplicadas: las ventas (PayPal en modo sandbox) se mantienen en el alcance, y el proveedor del canal de despacho queda pendiente. Cada entrada indica el hallazgo de la auditoría, la inconsistencia original, el texto anterior, el texto nuevo y la justificación.
Visión del Producto.docx (1.1)
(07/10/2026) Hallazgo I-08. Inconsistencia original: La Visión, RF14 y el Acta prometían comunicar a ambulancias y fuerzas de orden; la matriz y el Plan de pruebas lo reducían a mostrar números oficiales.
Texto anterior: El proyecto “Emergen” busca entregar una solución rápida a las situaciones que requieran un llamado de emergencia ágil y efectivo (sean incidentes médicos, domésticos y/o accidentes urbanos). Su objetivo es comunicar a los contactos de emergencia del usuario y a los servicios de emergencia comunes (ambulancias o fuerzas de orden) toda la información necesaria para acudir en su auxilio en el momento en que se utilice la aplicación (información médica relevante, contexto del accidente y ubicación del incidente).
Texto nuevo: El proyecto “Emergen” busca entregar una solución rápida a las situaciones que requieran un llamado de emergencia ágil y efectivo (sean incidentes médicos, domésticos y/o accidentes urbanos). Su objetivo es comunicar a los contactos de emergencia del usuario toda la información necesaria para acudir en su auxilio en el momento en que se utilice la aplicación (información médica relevante, contexto del accidente y ubicación del incidente), y facilitar el contacto con los servicios de emergencia comunes (ambulancias, bomberos o fuerzas de orden) mostrando sus números oficiales (131, 132 y 133).
Justificación: La Visión prometía comunicar automáticamente a ambulancias y fuerzas de orden. El Plan de pruebas excluye la integración con centrales públicas y CP-RF14 solo muestra números oficiales. Se alinea la Visión con ese alcance, igual que RF14 del ERS y el Acta.
(07/10/2026) Hallazgo I-08. Inconsistencia original: La Visión, RF14 y el Acta prometían comunicar a ambulancias y fuerzas de orden; la matriz y el Plan de pruebas lo reducían a mostrar números oficiales.
Texto anterior: “Emergen” busca solucionar los tiempos de espera en situaciones de emergencia, brindando una comunicación efectiva al círculo cercano de la persona y a los agentes de seguridad para el auxilio del usuario.
Texto nuevo: “Emergen” busca solucionar los tiempos de espera en situaciones de emergencia, brindando una comunicación efectiva al círculo cercano de la persona y facilitando el contacto con los servicios de emergencia mediante los números oficiales (131, 132 y 133) para el auxilio del usuario.
Justificación: Mismo texto de alcance que el Acta v1.2.
1.2.1 Hoja de ruta del proyecto.docx (1.2)
(07/10/2026) Hallazgo 1.2. Inconsistencia original: Hoja de ruta y Sprint Planning: iteraciones “de una semana” con un Sprint 4 de dos, horizonte de 7 semanas para 5, MVP atribuido al Sprint 4, tres Definition of Done y fechas de cierre incoherentes.
Texto anterior: Con este plan se espera una proyección macro que agrupa las Historias de Usuario del Product Backlog en iteraciones de una semana, estableciendo un camino probable para alcanzar el Producto Mínimo Viable y sus posteriores extensiones.
Texto nuevo: Con este plan se espera una proyección macro que agrupa las Historias de Usuario del Product Backlog en iteraciones de una semana (salvo el Sprint 4 de la Fase 1, de dos semanas, y los Sprints de la Fase 2 que su Sprint Planning extienda explícitamente), estableciendo un camino probable para alcanzar el Producto Mínimo Viable y sus posteriores extensiones.
Justificación: El documento hablaba de iteraciones de una semana, pero el Sprint 4 dura dos semanas (31-08 al 14-09) y el Sprint 6 de la Fase 2 también (28-09 al 09-10).
(07/10/2026) Hallazgo A-06. Inconsistencia original: No existía una HU para finalizar o cancelar la emergencia (alerta que nunca se cierra, C-02).
Texto anterior: Garantizar el enfoque prioritario en las 8 Historias de Usuario pertenecientes al MVP.
Texto nuevo: Garantizar el enfoque prioritario en las 9 Historias de Usuario pertenecientes al MVP (HU-01 a HU-08 y HU-14).
Justificación: Se agregó HU-14 (Finalizar o cancelar emergencia) al MVP: sin ella la alerta nunca se cierra y el enlace médico queda público (C-02).
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: Total de Historias de Usuario (HU): 13 Historias.
Texto nuevo: Total de Historias de Usuario (HU): 19 Historias (13 originales y 6 incorporadas en la versión 1.1 para cubrir requisitos sin HU).
Justificación: Se crearon HU-14 a HU-19 para que los 25 RF tengan al menos una HU (antes 12 RF no tenían).
(07/10/2026) Hallazgo A-06. Inconsistencia original: No existía una HU para finalizar o cancelar la emergencia (alerta que nunca se cierra, C-02).
Texto anterior: Historias MVP: 8 HUs.
Texto nuevo: Historias MVP: 9 HUs (HU-01 a HU-08 y HU-14).
Justificación: Consecuencia de incorporar HU-14 al MVP.
(07/10/2026) Hallazgo I-04. Inconsistencia original: Tamaño del equipo: la planificación hablaba de “dos Developers”, mientras el Acta declara 3 ingenieros.
Texto anterior: Trabajo en Paralelo: Las historias HU-04 (Edición de Contactos) y HU-05 (Configuración de Mensaje) no poseen dependencias directas entre sí y pueden ser asumidas de manera simultánea por los dos Developers una vez completada la HU-03.
Texto nuevo: Trabajo en Paralelo: Las historias HU-04 (Edición de Contactos) y HU-05 (Configuración de Mensaje) no poseen dependencias directas entre sí y pueden ser asumidas de manera simultánea por dos de los tres Developers del equipo una vez completada la HU-03.
Justificación: La bitácora del 05/10/2026 corrigió “dos Developers” solo en la Conclusión; la mención en Análisis Crítico de Historias seguía igual.
(07/10/2026) Hallazgo 1.2. Inconsistencia original: Hoja de ruta y Sprint Planning: iteraciones “de una semana” con un Sprint 4 de dos, horizonte de 7 semanas para 5, MVP atribuido al Sprint 4, tres Definition of Done y fechas de cierre incoherentes.
Texto anterior: Prioridad: Cumplimiento estricto del enfoque MVP. Los elementos Must Have son absorbidos en los Sprints 1 al 4.
Texto nuevo: Prioridad: Cumplimiento estricto del enfoque MVP. Los elementos Must Have se desarrollan en los primeros Sprints de la Fase 2 (Product Backlog §8); los Sprints 1 al 4 de la Fase 1 producen la línea base documental y técnica.
Justificación: Los Sprints 1–4 solo tienen entregables documentales; las HU del MVP están en la Fase 2.
(07/10/2026) Hallazgo 1.2. Inconsistencia original: Hoja de ruta y Sprint Planning: iteraciones “de una semana” con un Sprint 4 de dos, horizonte de 7 semanas para 5, MVP atribuido al Sprint 4, tres Definition of Done y fechas de cierre incoherentes.
Texto anterior: Previsibilidad y Transparencia: Establece un horizonte claro de 7 semanas de trabajo donde los roles Scrum (PO, SM y Developers) comprenden el momento en que se entregará cada capacidad del sistema.
Texto nuevo: Previsibilidad y Transparencia: Establece un horizonte claro de 5 semanas para la Fase 1 (cuatro Sprints, con el Sprint 4 de dos semanas) donde los roles Scrum (PO, SM y Developers) comprenden el momento en que se entregará cada capacidad del sistema.
Justificación: Se anunciaba un horizonte de 7 semanas para 4 sprints que suman 5 semanas.
(07/10/2026) Hallazgo 1.2. Inconsistencia original: Hoja de ruta y Sprint Planning: iteraciones “de una semana” con un Sprint 4 de dos, horizonte de 7 semanas para 5, MVP atribuido al Sprint 4, tres Definition of Done y fechas de cierre incoherentes.
Texto anterior: Garantía de Entrega Temprana de Valor: La consecución del MVP en el Sprint 4 mitiga el riesgo académico de llegar al final del proceso de titulación sin un producto funcional demostrable.
Texto nuevo: Garantía de Entrega Temprana de Valor: La consecución temprana del MVP en la Fase 2 (9 HU: HU-01 a HU-08 y HU-14), preparada con la línea base entregada en el Sprint 4 de la Fase 1, mitiga el riesgo académico de llegar al final del proceso de titulación sin un producto funcional demostrable.
Justificación: El MVP no se logra en el Sprint 4: ese sprint solo prepara la línea base.
(07/10/2026) Hallazgo 1.2. Inconsistencia original: Hoja de ruta y Sprint Planning: iteraciones “de una semana” con un Sprint 4 de dos, horizonte de 7 semanas para 5, MVP atribuido al Sprint 4, tres Definition of Done y fechas de cierre incoherentes.
Texto anterior: Fechas incoherentes: Sprint 4 termina el 14-09, el Hito 1 del Acta vence el 11-09 y el Backlog cerraba la Fase 1 el 06-09
Texto nuevo: Nota de fechas (v1.1): la entrega del Hito N°1 del Acta (11-09-2026) se realiza dentro del Sprint 4. La Sprint Review y la Retrospectiva del Sprint 4 se registraron el 14-09-2026, que es la fecha de cierre de la Fase 1 (el Product Backlog §3 y §7 se corrigieron para usar la misma fecha).
Justificación: Se explicita la relación entre el hito y el cierre del sprint, y se unifica la fecha de cierre de la Fase 1.
(07/10/2026) Hallazgo 1.2 / A-12. Inconsistencia original: Hoja de ruta y Sprint Planning: iteraciones “de una semana” con un Sprint 4 de dos, horizonte de 7 semanas para 5, MVP atribuido al Sprint 4, tres Definition of Done y fechas de cierre incoherentes.
Texto anterior: Dos Definition of Done: la primera (6 ítems) y, tras “La siguiente definición se aplica a todas las tarjetas y entregables de los cuatro Sprints.”, una segunda con 8 ítems: El entregable está completo  | Los criterios de aceptación aplicables fueron revisados y cumplidos. | El documento, diagrama o configuración fue revisado por otro integrante. | La evidencia se encuentra adjunta o vinculada desde la tarjeta correspondiente. | No existen errores críticos pendientes que impidan presentar el resultado. | La documentación y la trazabilidad relacionadas fueron actualizadas. | El resultado puede demostrarse en la Sprint Review y ser inspeccionado por el Product Owner. | La tarjeta queda marcada como completada solamente después de la validación correspondiente.
Texto nuevo: Una sola Definition of Done de 8 ítems (los 6 originales más “La evidencia se encuentra adjunta o vinculada desde la tarjeta correspondiente” y “La tarjeta queda marcada como completada solamente después de la validación correspondiente”), seguida de la frase: “Esta Definition of Done es única para el proyecto: se aplica a todas las tarjetas y entregables de la Fase 1 y la Fase 2, y reemplaza a la segunda definición que tenía este documento y a la del Product Backlog §7.”
Justificación: Había tres DoD distintas (dos aquí y una en el Product Backlog §7). Se fusionan sin perder criterios.
1.2.2 Sprint-fase1.docx (1.2)
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: PBI de la Fase 1 identificados como F1-01 … F1-11
Texto nuevo: PBI identificados como TD-01 … TD-11 (11 filas)
Justificación: Los IDs F1-xx eran los antiguos; el Product Backlog y la Tabla Maestra usan TD-xx.
(07/10/2026) Hallazgo 1.2. Inconsistencia original: Hoja de ruta y Sprint Planning: iteraciones “de una semana” con un Sprint 4 de dos, horizonte de 7 semanas para 5, MVP atribuido al Sprint 4, tres Definition of Done y fechas de cierre incoherentes.
Texto anterior: Sprint 3 — Periodo: 31 de agosto al 14 de septiembre de 2026
Texto nuevo: Sprint 3 — Periodo: 24 al 28 de agosto de 2026
Justificación: El periodo del Sprint 3 estaba copiado del Sprint 4. Sus Daily Scrum (24–28 de agosto) y la Hoja de ruta confirman 24 al 28 de agosto.
(07/10/2026) Hallazgo 1.2. Inconsistencia original: Hoja de ruta y Sprint Planning: iteraciones “de una semana” con un Sprint 4 de dos, horizonte de 7 semanas para 5, MVP atribuido al Sprint 4, tres Definition of Done y fechas de cierre incoherentes.
Texto anterior: Sprint 4 — Periodo: 31 de agosto  al 6 de septiembre de 2026.
Texto nuevo: Sprint 4 — Periodo: 31 de agosto al 14 de septiembre de 2026 (incluye la entrega del Hito N°1 el 11-09-2026).
Justificación: El Sprint 4 terminaba el 06-09 en el encabezado, pero sus Daily Scrum y su Review llegan al 14-09, como indica la Hoja de ruta.
1.2.3 Sprint-fase2.docx (1.2)
(07/10/2026) Hallazgo 1.2 (conciliación). Inconsistencia original: Fechas de los Sprints 5 y 6 con el mes equivocado. No figuraba en la auditoría; se detectó al conciliar la Hoja de ruta con los Sprint Planning.
Texto anterior: Sprint 5 — Daily Scrum: 21, 22, 23, 24 y 25 de agosto.
Texto nuevo: Sprint 5 — Daily Scrum: 21, 22, 23, 24 y 25 de septiembre.
Justificación: Error de mes: el Sprint 5 transcurre del 21 al 25 de septiembre de 2026.
(07/10/2026) Hallazgo 1.2 (conciliación). Inconsistencia original: Fechas de los Sprints 5 y 6 con el mes equivocado. No figuraba en la auditoría; se detectó al conciliar la Hoja de ruta con los Sprint Planning.
Texto anterior: Sprint 6 — Daily Scrum: 28, 29 y 30 de agosto 1, 2, 5, 6, 7, 8 y 9 de octubre
Texto nuevo: Sprint 6 — Daily Scrum: 28, 29 y 30 de septiembre; 1, 2, 5, 6, 7, 8 y 9 de octubre.
Justificación: Error de mes: el Sprint 6 transcurre del 28 de septiembre al 9 de octubre de 2026.
(07/10/2026) Hallazgo 1.2 (conciliación). Inconsistencia original: Fechas de los Sprints 5 y 6 con el mes equivocado. No figuraba en la auditoría; se detectó al conciliar la Hoja de ruta con los Sprint Planning.
Texto anterior: Sprint 6 — Hito académico: revisión del avance y recepción de retroalimentación durante la clase semanal con el profesor. El día jueves 24 a las 1:40.
Texto nuevo: Sprint 6 — Hito académico: revisión del avance y recepción de retroalimentación durante la clase semanal con el profesor. Los días jueves 1 y 8 de octubre a las 1:40.
Justificación: El hito académico del Sprint 6 estaba copiado del Sprint 5 (jueves 24 de septiembre), fecha anterior al inicio del sprint.
Acta de constitución.docx (1.3)
(07/10/2026) Hallazgo I-05. Inconsistencia original: Cuatro listas distintas de tipos de emergencia (Acta, ERS, F04.1 y HU-05) y ninguna tabla de tipos identificada en el modelo.
Texto anterior: Objetivos del Negocio: Urbano / Médico / Adulto Mayor
Texto nuevo: Objetivos del Negocio: Urbano / Emergencia / Médico / Adulto Mayor
Justificación: La Solución Propuesta ya incluía “Emergencia” (cambio del 05/10/2026), pero los Objetivos del Negocio seguían con tres tipos. Se completa el catálogo único.
(07/10/2026) Hallazgo I-08. Inconsistencia original: La Visión, RF14 y el Acta prometían comunicar a ambulancias y fuerzas de orden; la matriz y el Plan de pruebas lo reducían a mostrar números oficiales.
Texto anterior: “Emergen” busca solucionar los tiempos de espera en situaciones de emergencia, brindando una comunicación efectiva al círculo cercano de la persona y a los agentes de seguridad para el auxilio del usuario.
Texto nuevo: “Emergen” busca solucionar los tiempos de espera en situaciones de emergencia, brindando una comunicación efectiva al círculo cercano de la persona y facilitando el contacto con los servicios de emergencia mediante los números oficiales (131, 132 y 133) para el auxilio del usuario.
Justificación: La Visión y RF14 prometían comunicar a ambulancias y fuerzas de orden, pero la matriz (CP-RF14) y el Plan de pruebas ya lo reducían a mostrar los números oficiales. El objetivo se alinea con ese alcance real.
(07/10/2026) Hallazgo 1.3. Inconsistencia original: Acta: calidad basada en ISO 9126 e ISO 25001, indicadores sin método de medición y control de cambios incompleto.
Texto anterior: Indicador de Alcance: 100%
Texto nuevo: 100 % de los RF en alcance con al menos un caso de prueba P1/P2 aprobado (Matriz de trazabilidad de pruebas)
Justificación: Los indicadores no tenían método de medición.
(07/10/2026) Hallazgo 1.3. Inconsistencia original: Acta: calidad basada en ISO 9126 e ISO 25001, indicadores sin método de medición y control de cambios incompleto.
Texto anterior: El sistema tiene que cumplir con las normas de calidad definidas en la ISO 9126 y la ISO 25001.
Texto nuevo: El sistema se evaluará según el modelo de calidad de producto ISO/IEC 25010 (reemplaza a ISO 9126), considerando las características indicadas a continuación.
Justificación: ISO 9126 fue reemplazada por ISO/IEC 25010, e ISO 25001 trata la planificación de la evaluación, no es un modelo de calidad de producto.
(07/10/2026) Hallazgo 1.3. Inconsistencia original: Acta: calidad basada en ISO 9126 e ISO 25001, indicadores sin método de medición y control de cambios incompleto.
Texto anterior: Indicadores: -98% / -98% / -98% / -100% / -100%
Texto nuevo:
Justificación: Los valores “-98 %” no tenían signo correcto ni método de medición. Se conservan las metas (98 % y 100 %) y se indica cómo se miden.
(07/10/2026) Hallazgo RF3. Inconsistencia original: RF3 mencionaba “empleados”, un rol que no estaba definido.
Texto anterior: RF3: El sistema debe poder modificar las credenciales de los usuarios y empleados desde la página web / escritorio / móvil
Texto nuevo: RF3: El sistema debe permitir modificar las credenciales (correo y contraseña) de los usuarios y del personal de soporte (rol SOPORTE, denominado anteriormente “empleados”) desde la página web / escritorio / móvil, previa verificación de identidad.
Justificación: I-05/1.4: el rol “empleado” no estaba definido. Se mapea al rol SOPORTE que existe en el catálogo ROL del init.sql (ADMINISTRADOR, SOPORTE, USUARIO). Se replica el texto del ERS v1.1.
(07/10/2026) Hallazgo RF4. Inconsistencia original: RF4 usaba una de las cuatro listas distintas de tipos de emergencia (I-05).
Texto anterior: RF4: El sistema debe modificar las especificaciones y finalidad del usuario (médico, urbano, emergencias y adulto mayor)
Texto nuevo: RF4: El sistema debe permitir modificar la finalidad del usuario según el catálogo único de tipos de emergencia: Urbano, Médico, Emergencia y Adulto Mayor.
Justificación: I-05: había cuatro listas distintas de tipos de emergencia. Se adopta el catálogo único del Acta (Solución Propuesta, actualizada el 05/10/2026). Se replica el texto del ERS v1.1.
(07/10/2026) Hallazgo RF5. Inconsistencia original: RF5 no era verificable (“a gusto del usuario”) y la activación en segundo plano no es factible solo con Capacitor (R-14).
Texto anterior: RF5: El sistema debe poder personalizarse a gusto del usuario considerando el formato de activación en segundo plano.
Texto nuevo: RF5: El sistema debe permitir al usuario configurar el método de activación del SOS. Mínimo verificable: botón SOS en la aplicación móvil con pulsación sostenida de 2 segundos (CA-06.1). La activación con la aplicación en segundo plano o cerrada (acceso directo, widget o botón físico) se implementará solo donde el sistema operativo lo permita sin código nativo adicional y se clasifica como Could Have.
Justificación: 1.4 y R-14: “a gusto del usuario” no es verificable y la activación con la app cerrada no es factible solo con Capacitor. Se fija un mínimo verificable y lo demás queda como Could Have. Se replica el texto del ERS v1.1.
(07/10/2026) Hallazgo RF7. Inconsistencia original: RF7 era ambiguo: 5 contactos por usuario o por cuenta familiar (C-13).
Texto anterior: RF7: El sistema debe tener un límite de 5 contactos de emergencia por cuenta, considerando también cuentas apadrinadas.
Texto nuevo: RF7: El sistema debe permitir un máximo de 5 contactos de emergencia por usuario: la cuenta principal y cada usuario apadrinado administran su propio límite de 5 contactos. El límite se valida en el backend (CA-03.2).
Justificación: 1.4 y C-13: no quedaba claro si eran 5 contactos por usuario o por cuenta familiar. Se define por usuario, coherente con CONTACTO_EMERGENCIA.usuario_ID del modelo de datos. Se replica el texto del ERS v1.1.
(07/10/2026) Hallazgo RF12. Inconsistencia original: RF12 usaba una de las cuatro listas distintas de tipos de emergencia (I-05).
Texto anterior: RF12: El sistema debe enviar un mensaje personalizado dependiendo de la finalidad del usuario (médico, urbano, emergencias y adulto mayor)
Texto nuevo: RF12: El sistema debe enviar un mensaje personalizado dependiendo de la finalidad del usuario (Urbano, Médico, Emergencia y Adulto Mayor).
Justificación: I-05: alineación con el catálogo único de tipos de emergencia. Se replica el texto del ERS v1.1.
(07/10/2026) Hallazgo RF14. Inconsistencia original: RF14 prometía informar a las redes de seguridad, pero el alcance real es mostrar números oficiales (I-08).
Texto anterior: RF14: El sistema debe informar a las redes de seguridad más cercanas del usuario (números de emergencias)
Texto nuevo: RF14: El sistema debe mostrar al usuario los números oficiales de emergencia de Chile (131 Ambulancia SAMU, 132 Bomberos y 133 Carabineros) con acceso directo a la llamada. El sistema no notifica automáticamente a estos organismos.
Justificación: I-08: la matriz de pruebas (CP-RF14) y el Plan de pruebas ya reducían el alcance a mostrar números oficiales. Ahora el requisito lo dice explícitamente. Se replica el texto del ERS v1.1.
(07/10/2026) Hallazgo I-07. Inconsistencia original: Alcance comercial contradictorio: el Backlog eliminaba las ventas y el resto de los documentos las mantenía.
Texto anterior: RF16:	La aplicación web debe realizar ventas de cuentas de usuarios.
Texto nuevo: RF16: La aplicación web debe realizar ventas de planes de cuentas de usuario y de cupos para usuarios apadrinados, utilizando PayPal en modo sandbox (pruebas) y Mindicador para la conversión CLP–USD.
Justificación: I-07: la decisión del equipo es mantener las ventas en el alcance (repo con integraciones PayPal y Mindicador; bitácora del 28/09/2026). Se precisa el modo sandbox. Se replica el texto del ERS v1.1.
(07/10/2026) Hallazgo RF20. Inconsistencia original: RF20 (el escritorio modifica la BBDD) contradecía RNF4 (R-02).
Texto anterior: RF20: La aplicación de escritorio debe poder modificar la BBDD de la página web y aplicación móvil.
Texto nuevo: RF20: La aplicación de escritorio debe poder consultar y modificar los datos administrados de la plataforma web y móvil (usuarios, estados, roles y planes) exclusivamente a través de la API del backend con rol ADMINISTRADOR; no accede directamente a la BBDD ni contiene credenciales de conexión.
Justificación: 1.3, R-02 y A-05: “modificar la BBDD” desde Electron contradice RNF4 y expone credenciales dentro del .asar. Se exige que el escritorio opere solo a través de la API. Se replica el texto del ERS v1.1.
(07/10/2026) Hallazgo RF25. Inconsistencia original: RF25 no era verificable (“soporte de usuario externo”).
Texto anterior: RF25: La aplicación web y móvil debe poder decidir el usuario principal, las personas que tiene apadrinadas en su cuenta y cómo son utilizadas con un soporte de usuario externo.
Texto nuevo: RF25: La aplicación web y móvil debe permitir al usuario principal definir sus usuarios apadrinados y el nivel de acceso de cada uno (acceso completo o acceso parcial), y solicitar asistencia al personal de SOPORTE cuando requiera ayuda para gestionarlos.
Justificación: 1.4: “soporte de usuario externo” no era verificable. Se alinea con el nivel de acceso (ESTADO_USUARIO: ACCESO COMPLETO/ACCESO PARCIAL del init.sql) y con el rol SOPORTE. Se replica el texto del ERS v1.1.
(07/10/2026) Hallazgo R-01 / A-04. Inconsistencia original: RBAC insuficiente: reglas de propiedad sin verificar (riesgo de IDOR) y sin catálogo cerrado de roles.
Texto anterior: RNF4: El backend debe ser el único encargado de procesar la seguridad mediante un modelo estricto de control de acceso basado en roles
Texto nuevo: RNF4: El backend debe ser el único encargado de procesar la seguridad mediante un modelo de autorización en dos capas: (1) control de acceso basado en roles con un catálogo cerrado (ADMINISTRADOR, SOPORTE y USUARIO; el usuario se subclasifica en PRINCIPAL o APADRINADO según su vínculo) y denegación por defecto; (2) verificación de propiedad del recurso (contactos, apadrinados, ficha médica y alertas) en cada endpoint que reciba un identificador.
Justificación: Se replica el RNF4 del ERS v1.1 (autorización por rol y por propiedad).
(07/10/2026) Hallazgo 1.4 / A-17. Inconsistencia original: ERS: índice duplicado, anexo Gantt vacío, RNF de rendimiento y accesibilidad prometidos pero inexistentes, requisitos no verificables, rol “empleado” sin definir, planificación por plataforma y cita de IEEE 830.
Texto anterior: Requisitos de aprobación con RNF1 a RNF5
Texto nuevo: Se agregan RNF6 (latencia SOS), RNF7 (tolerancia a fallos y disponibilidad), RNF8 (Ley 21.719), RNF9 (retención y supresión) y RNF10 (accesibilidad)
Justificación: 1.4, R-06, R-11, R-12, C-01 y A-17: la introducción prometía RNF de rendimiento y accesibilidad que no existían, y faltaban disponibilidad, latencia de la alerta, tolerancia a fallos y cumplimiento de la Ley 21.719. Se redactan de forma independiente del proveedor de mensajería, que sigue pendiente.
(07/10/2026) Hallazgo A-22. Inconsistencia original: Documentos sin historial de versiones con fechas reales.
Texto anterior: Control de cambios hasta la versión 1.1 (05-10-2026)
Texto nuevo: Se agrega la versión 1.2 (07-10-2026)
Justificación: Registro de versiones con fechas reales.
Informe ERS.docx (1.4)
(07/10/2026) Hallazgo 1.4. Inconsistencia original: ERS: índice duplicado, anexo Gantt vacío, RNF de rendimiento y accesibilidad prometidos pero inexistentes, requisitos no verificables, rol “empleado” sin definir, planificación por plataforma y cita de IEEE 830.
Texto anterior: Planificación y Especificación de Requisitos según estándares; IEEE 830, ISO9000 y PMI.
Texto nuevo: Planificación y Especificación de Requisitos según estándares; ISO/IEC/IEEE 29148:2018 (reemplaza a IEEE 830), ISO 9000 y PMI.
Justificación: IEEE 830 fue reemplazada por ISO/IEC/IEEE 29148. Se cita la norma vigente.
(07/10/2026) Hallazgo A-22. Inconsistencia original: Documentos sin historial de versiones con fechas reales.
Texto anterior: Ficha del documento con una sola revisión (04/09, v1.0)
Texto nuevo: Se agrega la revisión 1.1 del 07/10/2026 con el detalle de las correcciones
Justificación: 1.3/1.4: no había historial de versiones.
(07/10/2026) Hallazgo RF3. Inconsistencia original: RF3 mencionaba “empleados”, un rol que no estaba definido.
Texto anterior: RF3: El sistema debe poder modificar las credenciales de los usuarios y empleados desde la página web / escritorio / móvil
Texto nuevo: RF3: El sistema debe permitir modificar las credenciales (correo y contraseña) de los usuarios y del personal de soporte (rol SOPORTE, denominado anteriormente “empleados”) desde la página web / escritorio / móvil, previa verificación de identidad.
Justificación: I-05/1.4: el rol “empleado” no estaba definido. Se mapea al rol SOPORTE que existe en el catálogo ROL del init.sql (ADMINISTRADOR, SOPORTE, USUARIO).
(07/10/2026) Hallazgo RF4. Inconsistencia original: RF4 usaba una de las cuatro listas distintas de tipos de emergencia (I-05).
Texto anterior: RF4: El sistema debe modificar las especificaciones y finalidad del usuario (médico, urbano, emergencias y adulto mayor)
Texto nuevo: RF4: El sistema debe permitir modificar la finalidad del usuario según el catálogo único de tipos de emergencia: Urbano, Médico, Emergencia y Adulto Mayor.
Justificación: I-05: había cuatro listas distintas de tipos de emergencia. Se adopta el catálogo único del Acta (Solución Propuesta, actualizada el 05/10/2026).
(07/10/2026) Hallazgo RF5. Inconsistencia original: RF5 no era verificable (“a gusto del usuario”) y la activación en segundo plano no es factible solo con Capacitor (R-14).
Texto anterior: RF5: El sistema debe poder personalizarse a gusto del usuario considerando el formato de activación en segundo plano.
Texto nuevo: RF5: El sistema debe permitir al usuario configurar el método de activación del SOS. Mínimo verificable: botón SOS en la aplicación móvil con pulsación sostenida de 2 segundos (CA-06.1). La activación con la aplicación en segundo plano o cerrada (acceso directo, widget o botón físico) se implementará solo donde el sistema operativo lo permita sin código nativo adicional y se clasifica como Could Have.
Justificación: 1.4 y R-14: “a gusto del usuario” no es verificable y la activación con la app cerrada no es factible solo con Capacitor. Se fija un mínimo verificable y lo demás queda como Could Have.
(07/10/2026) Hallazgo RF7. Inconsistencia original: RF7 era ambiguo: 5 contactos por usuario o por cuenta familiar (C-13).
Texto anterior: RF7: El sistema debe tener un límite de 5 contactos de emergencia por cuenta, considerando también cuentas apadrinadas.
Texto nuevo: RF7: El sistema debe permitir un máximo de 5 contactos de emergencia por usuario: la cuenta principal y cada usuario apadrinado administran su propio límite de 5 contactos. El límite se valida en el backend (CA-03.2).
Justificación: 1.4 y C-13: no quedaba claro si eran 5 contactos por usuario o por cuenta familiar. Se define por usuario, coherente con CONTACTO_EMERGENCIA.usuario_ID del modelo de datos.
(07/10/2026) Hallazgo RF12. Inconsistencia original: RF12 usaba una de las cuatro listas distintas de tipos de emergencia (I-05).
Texto anterior: RF12: El sistema debe enviar un mensaje personalizado dependiendo de la finalidad del usuario (médico, urbano, emergencias y adulto mayor)
Texto nuevo: RF12: El sistema debe enviar un mensaje personalizado dependiendo de la finalidad del usuario (Urbano, Médico, Emergencia y Adulto Mayor).
Justificación: I-05: alineación con el catálogo único de tipos de emergencia.
(07/10/2026) Hallazgo RF14. Inconsistencia original: RF14 prometía informar a las redes de seguridad, pero el alcance real es mostrar números oficiales (I-08).
Texto anterior: RF14: El sistema debe informar a las redes de seguridad más cercanas del usuario (números de emergencias)
Texto nuevo: RF14: El sistema debe mostrar al usuario los números oficiales de emergencia de Chile (131 Ambulancia SAMU, 132 Bomberos y 133 Carabineros) con acceso directo a la llamada. El sistema no notifica automáticamente a estos organismos.
Justificación: I-08: la matriz de pruebas (CP-RF14) y el Plan de pruebas ya reducían el alcance a mostrar números oficiales. Ahora el requisito lo dice explícitamente.
(07/10/2026) Hallazgo I-07. Inconsistencia original: Alcance comercial contradictorio: el Backlog eliminaba las ventas y el resto de los documentos las mantenía.
Texto anterior: RF16: La aplicación web debe realizar ventas de cuentas de usuarios.
Texto nuevo: RF16: La aplicación web debe realizar ventas de planes de cuentas de usuario y de cupos para usuarios apadrinados, utilizando PayPal en modo sandbox (pruebas) y Mindicador para la conversión CLP–USD.
Justificación: I-07: la decisión del equipo es mantener las ventas en el alcance (repo con integraciones PayPal y Mindicador; bitácora del 28/09/2026). Se precisa el modo sandbox.
(07/10/2026) Hallazgo RF20. Inconsistencia original: RF20 (el escritorio modifica la BBDD) contradecía RNF4 (R-02).
Texto anterior: RF20: La aplicación de escritorio debe poder modificar la BBDD de la página web y aplicación móvil.
Texto nuevo: RF20: La aplicación de escritorio debe poder consultar y modificar los datos administrados de la plataforma web y móvil (usuarios, estados, roles y planes) exclusivamente a través de la API del backend con rol ADMINISTRADOR; no accede directamente a la BBDD ni contiene credenciales de conexión.
Justificación: 1.3, R-02 y A-05: “modificar la BBDD” desde Electron contradice RNF4 y expone credenciales dentro del .asar. Se exige que el escritorio opere solo a través de la API.
(07/10/2026) Hallazgo RF25. Inconsistencia original: RF25 no era verificable (“soporte de usuario externo”).
Texto anterior: RF25: La aplicación web y móvil debe poder decidir el usuario principal, las personas que tiene apadrinadas en su cuenta y cómo son utilizadas con un soporte de usuario externo.
Texto nuevo: RF25: La aplicación web y móvil debe permitir al usuario principal definir sus usuarios apadrinados y el nivel de acceso de cada uno (acceso completo o acceso parcial), y solicitar asistencia al personal de SOPORTE cuando requiera ayuda para gestionarlos.
Justificación: 1.4: “soporte de usuario externo” no era verificable. Se alinea con el nivel de acceso (ESTADO_USUARIO: ACCESO COMPLETO/ACCESO PARCIAL del init.sql) y con el rol SOPORTE.
(07/10/2026) Hallazgo R-01 / A-04. Inconsistencia original: RBAC insuficiente: reglas de propiedad sin verificar (riesgo de IDOR) y sin catálogo cerrado de roles.
Texto anterior: RNF4: El backend debe ser el único encargado de procesar la seguridad mediante un modelo estricto de control de acceso basado en roles
Texto nuevo: RNF4: El backend debe ser el único encargado de procesar la seguridad mediante un modelo de autorización en dos capas: (1) control de acceso basado en roles con un catálogo cerrado (ADMINISTRADOR, SOPORTE y USUARIO; el usuario se subclasifica en PRINCIPAL o APADRINADO según su vínculo) y denegación por defecto; (2) verificación de propiedad del recurso (contactos, apadrinados, ficha médica y alertas) en cada endpoint que reciba un identificador.
Justificación:
(07/10/2026) Hallazgo 1.4 / A-17. Inconsistencia original: ERS: índice duplicado, anexo Gantt vacío, RNF de rendimiento y accesibilidad prometidos pero inexistentes, requisitos no verificables, rol “empleado” sin definir, planificación por plataforma y cita de IEEE 830.
Texto anterior: Solo existían RNF1 a RNF5
Texto nuevo: RNF6: Al activar el SOS, el backend debe registrar la alerta y responder al cliente en un máximo de 3 segundos (percentil 95, en el ambiente de pruebas), y el primer intento de despacho a cada contacto debe iniciarse en un máximo de 10 segundos desde la activación.
RNF7: Una alerta confirmada al cliente no debe perderse ante fallos del servicio de mensajería o reinicios del backend: se persiste antes de despacharse, se reintenta con espera incremental y su estado por destinatario queda registrado. Se admite una sola alerta ACTIVA por usuario, y las solicitudes repetidas con la misma clave de idempotencia no generan alertas duplicadas. El ambiente de la Fase 3 debe tener una disponibilidad objetivo del 99 % mensual.
RNF8: El sistema debe tratar la información de salud como dato personal sensible conforme a la Ley 21.719 (vigente desde el 01-12-2026): consentimiento explícito al registrar la ficha médica, consentimiento del tutor para usuarios menores de edad, cifrado en reposo AES-256-GCM con la llave fuera de la base de datos, y acceso a la ficha solo mediante un enlace temporal mientras la emergencia esté ACTIVA.
RNF9: Ante una solicitud de eliminación de cuenta, el sistema debe suprimir los datos personales y la ficha médica, y conservar el historial de alertas de forma seudonimizada durante el plazo de retención que defina el Product Owner, para fines legales.
RNF10: Los flujos de activación del SOS y de configuración de contactos deben cumplir los criterios de nivel AA de WCAG 2.1 aplicables a contraste, tamaño mínimo de objetivos táctiles (44 × 44 px) y uso con lector de pantalla.
Justificación: 1.4, R-06, R-11, R-12, C-01 y A-17: la introducción prometía RNF de rendimiento y accesibilidad que no existían, y faltaban disponibilidad, latencia de la alerta, tolerancia a fallos y cumplimiento de la Ley 21.719. Se redactan de forma independiente del proveedor de mensajería, que sigue pendiente.
(07/10/2026) Hallazgo 1.4. Inconsistencia original: ERS: índice duplicado, anexo Gantt vacío, RNF de rendimiento y accesibilidad prometidos pero inexistentes, requisitos no verificables, rol “empleado” sin definir, planificación por plataforma y cita de IEEE 830.
Texto anterior: La Fase 2 se planificaba por plataforma (web semanas 5–7, móvil 8–10, escritorio 11–13), en contradicción con el Backlog, que planifica por HU
Texto nuevo: Nota de conciliación (v1.1): las semanas por plataforma de la Fase 2 son referenciales. La ejecución se planifica por funcionalidad (Historias de Usuario) según el Product Backlog §8 y el documento 1.2.3 Sprint-fase2: cada HU se construye en las plataformas que le corresponden, de modo que el flujo SOS móvil (HU-06, HU-07, HU-08 y HU-14) no espera a que termine la aplicación web.
Justificación: Con el plan por plataforma el SOS móvil no existía hasta la semana 8. Se conserva la tabla de hitos y se aclara cuál planificación prevalece.
(07/10/2026) Hallazgo 1.4. Inconsistencia original: ERS: índice duplicado, anexo Gantt vacío, RNF de rendimiento y accesibilidad prometidos pero inexistentes, requisitos no verificables, rol “empleado” sin definir, planificación por plataforma y cita de IEEE 830.
Texto anterior: Anexo “Carta Gantt” sin contenido
Texto nuevo: La Carta Gantt se mantiene como documento externo, enlazado en la sección 2.3 (Hitos del Proyecto). Ante cualquier diferencia de fechas, prevalecen la Hoja de ruta del proyecto (1.2.1) y los Sprint Planning de la Fase 1 y la Fase 2 (1.2.2 y 1.2.3).
Justificación: El anexo estaba vacío. Se indica dónde está la planificación vigente para no duplicar fechas.
(07/10/2026) Hallazgo 1.4. Inconsistencia original: ERS: índice duplicado, anexo Gantt vacío, RNF de rendimiento y accesibilidad prometidos pero inexistentes, requisitos no verificables, rol “empleado” sin definir, planificación por plataforma y cita de IEEE 830.
Texto anterior: Índice: “3. Limitaciones / 4. Limitaciones / 5. Anexos / 5.1. Acta de Proyecto” (sin la sección 2.3)
Texto nuevo: Índice: “2.3. Hitos del Proyecto / 3. Limitaciones / 4. Anexos / 4.1. Carta Gantt”
Justificación: El índice repetía “Limitaciones” (la primera entrada apuntaba en realidad a Hitos del Proyecto) y rotulaba mal el anexo. Los números de página se recalculan al actualizar la tabla en Word o Docs.
Matriz RACI.xlsx (1.5)
(07/10/2026) Hallazgo 1.5 / A-18. Inconsistencia original: RACI: la misma persona era R y A en escritorio y en testing, y el Product Owner figuraba solo como I.
Texto anterior: Desarrollo Aplicación de Escritorio: Esp. Escritorio = R y Esp. QA = A (ambos Gabriel Valencia); Arquitecto = I
Texto nuevo: Esp. Escritorio = R (Gabriel Valencia); Arquitecto de Software = A (Diego Plaza); Esp. QA = C
Justificación: La misma persona ejecutaba y aprobaba.
(07/10/2026) Hallazgo 1.5 / A-18. Inconsistencia original: RACI: la misma persona era R y A en escritorio y en testing, y el Product Owner figuraba solo como I.
Texto anterior: Testing QA: Jefe de Proyecto = A y Esp. QA = R (ambos Gabriel Valencia); Product Owner = I
Texto nuevo: Esp. QA = R (Gabriel Valencia); Product Owner = A (Julio Tapia); Jefe de Proyecto = C
Justificación: La misma persona ejecutaba y aprobaba, y el Plan de pruebas exige la decisión del PO sobre defectos altos.
(07/10/2026) Hallazgo 1.5 / A-18. Inconsistencia original: RACI: la misma persona era R y A en escritorio y en testing, y el Product Owner figuraba solo como I.
Texto anterior: Product Owner = I en Documentación inicial y en Definición de requisitos
Texto nuevo: Product Owner = C en ambas actividades
Justificación: El PO figuraba solo como informado en todas las filas, incluso en los requisitos.
(07/10/2026) Hallazgo 1.5 / A-18. Inconsistencia original: RACI: la misma persona era R y A en escritorio y en testing, y el Product Owner figuraba solo como I.
Texto anterior: (no existía)
Texto nuevo: Nueva fila “Aceptación de incrementos (Sprint Review)”: Jefe de Proyecto = R, Product Owner = A, especialistas = C
Justificación: El Plan de pruebas exige la aceptación del incremento en la Review, pero la RACI no tenía esa actividad.
Informe TEC.docx (1.6)
(07/10/2026) Hallazgo 1.6 / A-14. Inconsistencia original: Informe TEC: resumen por responsable con Gabriel y Alonso intercambiados y sección de infraestructura anunciada pero inexistente.
Texto anterior: El índice anunciaba “Presupuesto de Infraestructura y Herramientas a Utilizar”, pero la sección no existía
Texto nuevo: Nueva sección con: Herramientas de desarrollo (Node.js 24.21.0, TypeScript, Turborepo, Docker Desktop, PostgreSQL 15 en contenedor, GitHub): $0 (licencias gratuitas o de uso educativo). | PayPal REST API en modo sandbox: $0 durante las pruebas; en producción cobra una comisión por transacción. | Firebase Authentication (plan Spark): $0 para la verificación de correo y la recuperación de contraseña. | Google Maps Platform: $0 dentro de la cuota gratuita mensual; requiere una cuenta de facturación activa. | jsReport: $0 con la licencia gratuita, que limita la cantidad de plantillas. | Mindicador: $0 (API pública de indicadores económicos). | Servicio de mensajería para el despacho de alertas: costo por mensaje, pendiente de definir junto con el proveedor (ver “Cambios Pendientes” en Cambios Realizados). | Hosting del backend y de la base de datos para la Fase 3: pendiente de definir. | Publicación en tiendas, solo si se publica en la Fase 3: Google Play, pago único de US$25; Apple Developer Program, US$99 al año. | El presupuesto total de $1.496.400 CLP no cambia en esta versión: los costos de infraestructura conocidos son $0 durante el desarrollo, y los pendientes (mensajería, hosting y tiendas) se agregarán cuando el equipo los defina.
Justificación: Faltaban los costos de SMS, hosting, Google Maps y cuentas de tiendas. Se documentan los conocidos y se marcan como pendientes los que dependen de decisiones del equipo. El enlace del índice apunta a la nueva sección.
Horas hombre en relación a Tareas.xlsx (1.6)
(07/10/2026) Hallazgo I-03. Inconsistencia original: Framework frontend sin decidir (“React/Angular”) en el Acta, en 4.2 y en la tarea TH-1.3.
Texto anterior: TH-1.3: Maquetado del UI para el formulario de registro usando React/Angular y la debida conexión con el backend
Texto nuevo: TH-1.3: Maquetado del UI para el formulario de registro usando React + Ionic y la debida conexión con el backend
Justificación: El repositorio usa React 19 con Ionic React en web, móvil y escritorio. El Acta ya se corrigió el 05/10/2026; la tarea seguía con “React/Angular”.
(07/10/2026) Hallazgo 1.6 / A-14. Inconsistencia original: Informe TEC: resumen por responsable con Gabriel y Alonso intercambiados y sección de infraestructura anunciada pero inexistente.
Texto anterior: Subtotales con =MULTIPLY(E,C) (27 filas) y totales escritos a mano (“88h”, “$1.032.000CLP”)
Texto nuevo: Subtotales =E*C y totales =SUM(C10:C36) y =SUM(F10:F36) (mismos valores: 88 h y $1.032.000)
Justificación: MULTIPLY no existe en Excel (#¿NOMBRE?) y los totales fijos podían desalinearse del detalle.
(07/10/2026) Hallazgo 1.6 / A-14. Inconsistencia original: Informe TEC: resumen por responsable con Gabriel y Alonso intercambiados y sección de infraestructura anunciada pero inexistente.
Texto anterior: Resumen por responsable con valores fijos: Gabriel Valencia 29.0 h / $348.000; Diego Plaza 47.0 h / $564.000; Alonso González 12.0 h / $120.000
Texto nuevo: Resumen calculado con SUMIF sobre el detalle: Gabriel Valencia 12 h / $120.000; Diego Plaza 47 h / $564.000; Alonso González 29 h / $348.000 (total $1.032.000)
Justificación: El resumen intercambiaba a Gabriel y Alonso. Con fórmulas, el resumen ya no puede separarse del detalle.
2.1.1 PRODUCT BACKLOG.docx (2.1)
(07/10/2026) Hallazgo 2.1 / A-08. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: Garantizar la trazabilidad completa entre los Requisitos Funcionales (RF) originales.
Texto nuevo:
Justificación:
(07/10/2026) Hallazgo 1.2 / 2.1. Inconsistencia original: Hoja de ruta y Sprint Planning: iteraciones “de una semana” con un Sprint 4 de dos, horizonte de 7 semanas para 5, MVP atribuido al Sprint 4, tres Definition of Done y fechas de cierre incoherentes.
Texto anterior: Estas son las tareas para la Fase 1, que no representan funcionalidades visibles para el usuario final, pero son necesarios para definir, diseñar, preparar y controlar el producto. La fecha de la fase 1 se considera desde el 10 de agosto al 6 de septiembre.
Texto nuevo: Estas son las tareas para la Fase 1, que no representan funcionalidades visibles para el usuario final, pero son necesarios para definir, diseñar, preparar y controlar el producto. La fecha de la fase 1 se considera desde el 10 de agosto al 14 de septiembre.
Justificación: El Sprint 4 cierra el 14-09-2026 (Hoja de ruta y Sprint-fase1).
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: Dependencias de las TD escritas como “Depecencia: F1-01”, “F1-04”, “F1-07”, “F1-09”
Texto nuevo: “Dependencia: TD-01”, “TD-04”, “TD-07”, “TD-09” (10 tareas)
Justificación: Las TD dependían de IDs antiguos (F1-xx). Se corrige además la errata “Depecencia”.
(07/10/2026) Hallazgo I-07. Inconsistencia original: Alcance comercial contradictorio: el Backlog eliminaba las ventas y el resto de los documentos las mantenía.
Texto anterior: Se reestructuran las capacidades del sistema en 10 Épicas principales, eliminando redundancias comerciales y simplificando la administración:
Texto nuevo: Se reestructuran las capacidades del sistema en 10 Épicas principales, unificando capacidades redundantes y simplificando la administración. Las ventas de planes y cupos para usuarios apadrinados (RF16 y RF17) se mantienen en el alcance mediante PayPal en modo sandbox (EP-07, HU-16):
Justificación: Decisión del equipo (07/10/2026): las ventas siguen en el alcance, como muestran el repositorio (integraciones PayPal y Mindicador, módulo de planes), el ERS (RF16 y RF17) y la bitácora del 28/09/2026. La frase del Backlog era la única que las eliminaba.
(07/10/2026) Hallazgo I-05. Inconsistencia original: Cuatro listas distintas de tipos de emergencia (Acta, ERS, F04.1 y HU-05) y ninguna tabla de tipos identificada en el modelo.
Texto anterior: F04.1: Definición de tipos de emergencia (Médica, Urbana, General).
Texto nuevo: F04.1: Definición de tipos de emergencia (catálogo único: Urbano, Médico, Emergencia y Adulto Mayor).
Justificación: F04.1 tenía una cuarta lista de tipos (Médica, Urbana, General). Se usa el catálogo único del Acta.
(07/10/2026) Hallazgo 2.1 / A-06 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: (no existía)
Texto nuevo: EP-04 — F04.3: Visualización de los números oficiales de emergencia (131, 132 y 133).
Justificación: Feature necesaria para las HU nuevas creadas para trazar RF sin HU.
(07/10/2026) Hallazgo 2.1 / A-06 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: (no existía)
Texto nuevo: EP-05 — F05.3: Finalización, cancelación y expiración de la emergencia (estados ACTIVA, FINALIZADA, CANCELADA y EXPIRADA).
Justificación: Feature necesaria para las HU nuevas creadas para trazar RF sin HU.
(07/10/2026) Hallazgo 2.1 / A-06 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: (no existía)
Texto nuevo: EP-07 — F07.3: Adquisición de planes y cupos para usuarios apadrinados (PayPal sandbox y Mindicador).
Justificación: Feature necesaria para las HU nuevas creadas para trazar RF sin HU.
(07/10/2026) Hallazgo 2.1 / A-06 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: (no existía)
Texto nuevo: EP-09 — F09.3: Solicitudes de soporte desde la aplicación web.
Justificación: Feature necesaria para las HU nuevas creadas para trazar RF sin HU.
(07/10/2026) Hallazgo I-06 / C-01 / A-03. Inconsistencia original: Estado de emergencia con cuatro nombres distintos y sin máquina de estados ni columna de estado en ALERTA.
Texto anterior: HU-06: Al confirmarse la activación, el sistema cambia el estado del perfil a "En Emergencia Active".
Texto nuevo: HU-06: Al confirmarse la activación, el sistema registra la alerta en estado ACTIVA (catálogo de estados de HU-14) y responde de inmediato; el despacho a los contactos se procesa de forma asíncrona (HU-08). Solo puede existir una alerta ACTIVA por usuario y los reintentos del cliente no generan alertas duplicadas.
Justificación: El estado tenía cuatro nombres distintos (“En Emergencia Active”, “Emergencia activa”, “En Emergencia”, “Emergencia Finalizada”). Se usa el catálogo único y se agregan idempotencia y una sola alerta activa por usuario.
(07/10/2026) Hallazgo C-03 / F06.2. Inconsistencia original: Fallo parcial del despacho sin estado por destinatario.
Texto anterior: HU-08: El sistema almacena la hora exacta y el estado del envío para auditoría.
Texto nuevo: HU-08: El sistema registra, por cada contacto, la hora exacta, el número de intentos y el estado del envío (PENDIENTE, ENVIADO o FALLIDO) para auditoría (CA-08.1).
Justificación: No existía registro por destinatario (fallo parcial). El criterio es independiente del proveedor de mensajería, cuya definición sigue pendiente.
(07/10/2026) Hallazgo I-07. Inconsistencia original: Alcance comercial contradictorio: el Backlog eliminaba las ventas y el resto de los documentos las mantenía.
Texto anterior: (no existía)
Texto nuevo: Nuevo criterio: Si la cuenta principal no tiene cupos disponibles, el sistema deriva a la compra de cupos (HU-16).
Justificación: Conecta HU-09 con la compra de cupos que mantienen sus escenarios.
(07/10/2026) Hallazgo R-05. Inconsistencia original: PIN débil: 4 dígitos guardados en claro y bloqueo que se esquiva desde otro cliente.
Texto anterior: HU-10: El PIN debe ser numérico y estar encriptado en el almacenamiento.
Texto nuevo: HU-10: El PIN debe ser numérico de 4 dígitos y almacenarse como hash; el contador de intentos fallidos se mantiene en el servidor por cuenta.
Justificación: Un PIN “encriptado” puede descifrarse y un contador por dispositivo se esquiva desde otro cliente.
(07/10/2026) Hallazgo 2.2. Inconsistencia original: Épicas e HU: MoSCoW incoherente y escenarios copiados o en contradicción con el Backlog.
Texto anterior: HU-10 solo cubría acciones sensibles del tutor
Texto nuevo: Nuevos criterios: “Si la cuenta tiene usuarios apadrinados, después del inicio de sesión el sistema solicita el PIN para identificar el perfil que ingresa (RF23).” y “El tutor define si cada apadrinado tiene acceso completo (puede cambiar su propio PIN) o acceso parcial (solo el tutor puede cambiarlo).”
Justificación: El escenario 1 de HU-02 pedía PIN en el login (RF23) y HU-10 usaba acceso completo/sin acceso completo, sin respaldo en el Backlog. Ambos conceptos existen en el repositorio (ESTADO_USUARIO: ACCESO COMPLETO / ACCESO PARCIAL).
(07/10/2026) Hallazgo R-06 / C-18 / A-17. Inconsistencia original: Enlace médico público y datos de salud sensibles bajo la Ley 21.719 (vigente desde el 01-12-2026).
Texto anterior: (no existía)
Texto nuevo: Nuevo criterio: El registro de la ficha es opcional y requiere el consentimiento explícito del usuario (o de su tutor si es menor de edad), conforme a la Ley 21.719.
Justificación: La salud es dato sensible bajo la Ley 21.719, vigente desde el 01-12-2026 (antes del Hito 3).
(07/10/2026) Hallazgo A-06 / CA-12.1. Inconsistencia original: No existía una HU para finalizar o cancelar la emergencia (alerta que nunca se cierra, C-02).
Texto anterior: HU-12: Una vez desactivada la alerta por el usuario o tutor mediante PIN, el acceso a la ficha médica se revoca automáticamente.
Texto nuevo: HU-12: Cuando la emergencia deja de estar ACTIVA (finalizada, cancelada o expirada según HU-14), el acceso a la ficha médica se revoca automáticamente.
Justificación: Solo los tutores tienen PIN, y no existía una HU para cerrar la emergencia. Ahora el cierre lo define HU-14.
(07/10/2026) Hallazgo A-07. Inconsistencia original: El SOS quedaba bloqueado si el usuario no tenía ficha médica.
Texto anterior: (no existía)
Texto nuevo: Nuevo criterio: Si el usuario no registró ficha médica, la alerta se envía igual, sin enlace médico: la ausencia de ficha nunca bloquea el SOS.
Justificación: El escenario 2 de HU-12 bloqueaba el SOS si no había información médica, en contradicción con RF11.
(07/10/2026) Hallazgo I-06. Inconsistencia original: Estado de emergencia con cuatro nombres distintos y sin máquina de estados ni columna de estado en ALERTA.
Texto anterior: HU-13: El panel muestra el estado de las cuentas (Activa, Bloqueada, En Emergencia).
Texto nuevo: HU-13: El panel muestra el estado de las cuentas (Acceso completo, Acceso parcial, Bloqueado/Inactivo) y si tienen una emergencia ACTIVA.
Justificación: Se usan los estados del catálogo ESTADO_USUARIO del init.sql y el estado de alerta de HU-14.
(07/10/2026) Hallazgo R-01. Inconsistencia original: RBAC insuficiente: reglas de propiedad sin verificar (riesgo de IDOR) y sin catálogo cerrado de roles.
Texto anterior: HU-13: Solo los usuarios con rol "Administrador" pueden acceder a este módulo.
Texto nuevo: HU-13: Solo los usuarios con rol ADMINISTRADOR pueden acceder a este módulo; el backend lo verifica en cada endpoint.
Justificación: El nombre del rol se alinea con la tabla ROL (ADMINISTRADOR).
(07/10/2026) Hallazgo 2.2 / C-21 / C-22. Inconsistencia original: Épicas e HU: MoSCoW incoherente y escenarios copiados o en contradicción con el Backlog.
Texto anterior: (no existía)
Texto nuevo: Nuevo criterio: El administrador consulta cuentas y compras, y cambia el estado o el rol de una cuenta; no puede bloquearse ni quitarse el rol a sí mismo ni dejar el sistema sin administradores. Cada acción queda en BITACORA_SISTEMA y el panel no da acceso a la ficha médica.
Justificación: HU-13 (escenarios) otorgaba un CRUD total sobre usuarios y compras; el Backlog pide listar, filtrar y gestionar, y RNF5 exige confidencialidad.
(07/10/2026) Hallazgo 2.1 / A-06 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: (no existía)
Texto nuevo: HU-14: Finalizar o Cancelar Emergencia — Como usuario que activó una alerta (o su tutor), quiero finalizar o cancelar la emergencia, para que mis contactos sepan que la situación terminó y se revoque el acceso a mi información médica. Criterios: La emergencia solo puede estar en uno de los estados del catálogo: ACTIVA, FINALIZADA, CANCELADA o EXPIRADA (mismo nombre en HU, CA y base de datos). | El usuario emisor la cierra con su sesión activa y una confirmación explícita; el tutor puede cerrarla con su PIN. | Si nadie la cierra, la emergencia pasa automáticamente a EXPIRADA a las 24 horas de su activación. | Al cancelarla, los contactos ya notificados reciben un aviso de falsa alarma. Prioridad: Crítica.
Justificación: No existía una HU para finalizar o cancelar la emergencia, aunque HU-12 y CA-12.1 dependen de esa acción (C-02).
(07/10/2026) Hallazgo 2.1 / A-06 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: (no existía)
Texto nuevo: HU-15: Gestionar Perfil y Credenciales — Como usuario registrado, quiero modificar mi correo y mi contraseña, para mantener mis credenciales de acceso actualizadas y seguras. Criterios: El cambio de correo o de contraseña exige ingresar la contraseña actual. | La nueva contraseña cumple las reglas de CA-01.2 y el nuevo correo no puede estar registrado en otra cuenta principal. Prioridad: Alta.
Justificación: Traza RF3, que no tenía Historia de Usuario.
(07/10/2026) Hallazgo 2.1 / A-06 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: (no existía)
Texto nuevo: HU-16: Adquirir Plan o Cupos de Apadrinados — Como usuario principal, quiero comprar un plan o cupos para usuarios apadrinados desde la aplicación web, para ampliar la protección a mis dependientes. Criterios: La compra se confirma solo cuando PayPal (modo sandbox) aprueba la orden; una orden aprobada actualiza los cupos una sola vez, aunque la confirmación llegue repetida. | El precio en USD se calcula con el valor del dólar entregado por Mindicador al momento de la cotización y se muestra antes de pagar. | Un pago rechazado o cancelado no crea la venta ni modifica los cupos. | La activación de alertas SOS nunca depende del estado del plan o de la suscripción. Prioridad: Media.
Justificación: Traza RF16, RF17, que no tenía Historia de Usuario.
(07/10/2026) Hallazgo 2.1 / A-06 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: (no existía)
Texto nuevo: HU-17: Consultar Números Oficiales de Emergencia — Como usuario, quiero ver los números oficiales de emergencia con acceso directo a la llamada, para contactar rápidamente a los servicios públicos cuando lo necesite. Criterios: La pantalla muestra 131 (SAMU), 132 (Bomberos) y 133 (Carabineros) con botón de llamada directa en la aplicación móvil. | La pantalla indica que la aplicación no notifica automáticamente a estos organismos. Prioridad: Media.
Justificación: Traza RF14, que no tenía Historia de Usuario.
(07/10/2026) Hallazgo 2.1 / A-06 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: (no existía)
Texto nuevo: HU-18: Enviar Solicitud de Soporte — Como usuario o visitante, quiero enviar una solicitud de soporte, para recibir ayuda ante problemas con la aplicación. Criterios: Una solicitud con nombre, correo válido, categoría y descripción genera un identificador y un estado inicial visible para el usuario. | El personal con rol SOPORTE puede responder la solicitud y cambiar su estado; la respuesta queda registrada. Prioridad: Media.
Justificación: Traza RF18, que no tenía Historia de Usuario.
(07/10/2026) Hallazgo 2.1 / A-06 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: (no existía)
Texto nuevo: HU-19: Generar Informe Personal de Actividad — Como usuario principal, quiero generar un informe de la actividad de mi cuenta y de mis apadrinados, para revisar el historial de alertas y acciones. Criterios: El informe (PDF generado con jsReport) incluye solo las alertas y acciones de la cuenta autenticada y de sus apadrinados, filtradas por rango de fechas. | El informe obtenido en la web y en el móvil es equivalente. Prioridad: Media.
Justificación: Traza RF22, que no tenía Historia de Usuario.
(07/10/2026) Hallazgo A-08. Inconsistencia original:
Texto anterior: Las HU no indicaban qué RF cubrían
Texto nuevo: Cada HU termina con una línea “RF trazados: …” (19 HU, 25 RF cubiertos)
Justificación: 12 de los 25 RF no tenían HU. Con las HU nuevas, todos los RF quedan trazados.
(07/10/2026) Hallazgo 1.2. Inconsistencia original: Hoja de ruta y Sprint Planning: iteraciones “de una semana” con un Sprint 4 de dos, horizonte de 7 semanas para 5, MVP atribuido al Sprint 4, tres Definition of Done y fechas de cierre incoherentes.
Texto anterior: La Fase 1 se ejecutará mediante cuatro Sprints de una semana. Esta cadencia responde al horario académico y permite utilizar cada clase semanal como instancia de Sprint Review y retroalimentación. La planificación del siguiente Sprint incorporará los ajustes solicitados por el profesor.
Texto nuevo: La Fase 1 se ejecutará mediante cuatro Sprints (los tres primeros de una semana y el Sprint 4 de dos semanas). Esta cadencia responde al horario académico y permite utilizar cada clase semanal como instancia de Sprint Review y retroalimentación. La planificación del siguiente Sprint incorporará los ajustes solicitados por el profesor.
Justificación: El Sprint 4 dura dos semanas (31-08 al 14-09).
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: Sprint 4: 4 | 31 agos. – 6 sept. | Preparar el inicio de la construcción | TD-10, TD-11, TD-12 | 11
Texto nuevo: Sprint 4: 4 | 31 ago. – 14 sept. | Preparar el inicio de la construcción | TD-10, TD-11 | 8
Justificación: El Sprint 4 incluía un TD-12 que no existe (los SP pasan de 11 a 8 = 3 + 5) y cerraba el 06-09.
(07/10/2026) Hallazgo 1.2 / A-12. Inconsistencia original: Hoja de ruta y Sprint Planning: iteraciones “de una semana” con un Sprint 4 de dos, horizonte de 7 semanas para 5, MVP atribuido al Sprint 4, tres Definition of Done y fechas de cierre incoherentes.
Texto anterior: Definition of Done para la Fase 1: El entregable está almacenado en el repositorio o ubicación oficial del equipo | El contenido fue revisado por al menos otro integrante distinto de su autor. | Los criterios de aceptación del PBI están cumplidos y existe evidencia verificable. | Las observaciones de la clase semanal están registradas y clasificadas como corrección o mejora. | No existen campos incompletos sin responsable o fecha de resolución. | El Product Backlog y la tabla maestra se actualizaron cuando el cambio los afectó.
Texto nuevo: Definition of Done: Se aplica la Definition of Done única del proyecto, definida en la Hoja de ruta (1.2.1, §6).
Justificación: Tercera DoD distinta. Sus criterios ya están contenidos en la DoD única (versionado, revisión por otro integrante, criterios verificables, trazabilidad actualizada).
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: 7 | HU-10 | Configurar y Validar PIN de Seguridad | 3 | HU-02 | NO
Texto nuevo: 7 | HU-10 | Configurar y Validar PIN de Seguridad | 5 | HU-02 | NO
Justificación: SP y dependencias unificados con la Tabla Maestra (fuente única). Para HU-09/HU-10 se mantiene el orden recomendado: PIN antes de dependientes (HU-09 depende de HU-10).
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: 8 | HU-09 | Crear y Vincular Usuario Dependiente | 5 | HU-02, HU-10 | NO
Texto nuevo: 8 | HU-09 | Crear y Vincular Usuario Dependiente | 3 | HU-02, HU-10 | NO
Justificación: SP y dependencias unificados con la Tabla Maestra (fuente única). Para HU-09/HU-10 se mantiene el orden recomendado: PIN antes de dependientes (HU-09 depende de HU-10).
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: 10 | HU-12 | Visualización Restringida de Datos Médicos en Emergencia | 3 | HU-06, HU-08, HU-11 | NO
Texto nuevo: 10 | HU-12 | Visualización Restringida de Datos Médicos en Emergencia | 4 | HU-06, HU-08, HU-11, HU-14 | NO
Justificación: SP y dependencias unificados con la Tabla Maestra (fuente única). Para HU-09/HU-10 se mantiene el orden recomendado: PIN antes de dependientes (HU-09 depende de HU-10).
(07/10/2026) Hallazgo 2.1 / A-06. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: Tabla de Sprint Planning de la Fase 2 con 13 HU
Texto nuevo: Se agregan HU-14 a HU-19 con Sprint “Por asignar” y Story Points “Por estimar”
Justificación: Las HU nuevas entran al Backlog; su estimación y asignación quedan para el refinamiento del equipo.
(07/10/2026) Hallazgo 2.1. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: (no existía)
Texto nuevo: Nota (v1.1): la columna Sprint es el orden de pronóstico relativo de la Fase 2. La asignación real a Sprints (numeración global desde el Sprint 5) se registra en 1.2.3 Sprint-fase2. Las HU-14 a HU-19 no están en estado Ready hasta estimarse.
Justificación: La numeración 1–11 de esta tabla no coincidía con el Sprint-fase2 (Sprint 5: HU-01; Sprint 6: HU-02 y HU-03).
(07/10/2026) Hallazgo I-04. Inconsistencia original: Tamaño del equipo: la planificación hablaba de “dos Developers”, mientras el Acta declara 3 ingenieros.
Texto anterior: Garantía de viabilidad: La estimación relativa en Story Points y el ejercicio de división de historias permiten que dos Developers afronten el desarrollo en Sprints semanales sin riesgos de saturación.
Texto nuevo: Garantía de viabilidad: La estimación relativa en Story Points y el ejercicio de división de historias permiten que los tres Developers afronten el desarrollo en Sprints semanales sin riesgos de saturación.
Justificación: El equipo tiene tres integrantes con tareas de desarrollo (Acta e Informe TEC).
(07/10/2026) Hallazgo A-06. Inconsistencia original: No existía una HU para finalizar o cancelar la emergencia (alerta que nunca se cierra, C-02).
Texto anterior: Enfoque prioritario en el MVP: Se aislaron las 8 Historias de Usuario críticas que componen el núcleo de comunicación de emergencia, asegurando un incremento funcional temprano.
Texto nuevo: Enfoque prioritario en el MVP: Se aislaron las 9 Historias de Usuario críticas (HU-01 a HU-08 y HU-14) que componen el núcleo de comunicación de emergencia, asegurando un incremento funcional temprano.
Justificación: HU-14 se incorpora al MVP.
(07/10/2026) Hallazgo A-08. Inconsistencia original:
Texto anterior: Trazabilidad total: La matriz de requisitos garantiza que ninguna funcionalidad clave quede omitida, proporcionando respaldo metodológico para las evaluaciones académicas de titulación.
Texto nuevo:
Justificación: Se indica dónde vive la trazabilidad.
2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG.xlsx (2.1)
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: Dependencias de TD-02 a TD-11 escritas con IDs antiguos (F1-01, F1-04, F1-07, F1-09)
Texto nuevo: Dependencias con IDs vigentes (TD-01, TD-04, TD-07, TD-09) en 10 filas
Justificación: Las TD dependían de IDs que ya no existen en el Backlog.
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: HU-01: EP-01/F01.1; HU-02: EP-02/F02.1
Texto nuevo: HU-01: EP-02/F02.1 (Registro de usuario); HU-02: EP-01/F01.1 (Autenticación JWT)
Justificación: Las features estaban cruzadas: el registro apuntaba a la autenticación JWT y el login al registro. Se corrige también la épica para que cada HU quede en la épica de su feature.
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: HU-09 — dependencias: HU-02
Texto nuevo: HU-09 — dependencias: HU-02, HU-10
Justificación: Dependencias unificadas con el documento del Backlog. HU-09 y HU-10 estaban invertidas entre ambos documentos; se adopta la recomendada (PIN antes de dependientes). HU-12 depende además de HU-14 (cierre de la emergencia).
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: HU-10 — dependencias: HU-09
Texto nuevo: HU-10 — dependencias: HU-02
Justificación: Dependencias unificadas con el documento del Backlog. HU-09 y HU-10 estaban invertidas entre ambos documentos; se adopta la recomendada (PIN antes de dependientes). HU-12 depende además de HU-14 (cierre de la emergencia).
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: HU-11 — dependencias: HU-02, HU-09
Texto nuevo: HU-11 — dependencias: HU-02, HU-10
Justificación: Dependencias unificadas con el documento del Backlog.
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: HU-12 — dependencias: HU-08, HU-11
Texto nuevo: HU-12 — dependencias: HU-06, HU-08, HU-11, HU-14
Justificación: Dependencias unificadas con el documento del Backlog. HU-09 y HU-10 estaban invertidas entre ambos documentos; se adopta la recomendada (PIN antes de dependientes). HU-12 depende además de HU-14 (cierre de la emergencia).
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: HU-13 — dependencias: HU-01, HU-02
Texto nuevo: HU-13 — dependencias: HU-02
Justificación: Dependencias unificadas con el documento del Backlog.
(07/10/2026) Hallazgo 2.1 / A-06 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: Tabla Fase_2 con HU-01 a HU-13
Texto nuevo: Se agregan HU-14 a HU-19 (Story Points “Por estimar”, estado “Pendiente (nueva v1.1)”)
Justificación: HU necesarias para trazar los RF sin HU y para cerrar la emergencia.
(07/10/2026) Hallazgo A-08. Inconsistencia original:
Texto anterior: La Tabla Maestra no tenía columnas de RF ni de casos de prueba
Texto nuevo:
Justificación: Matriz única de trazabilidad. Las features huérfanas (F01.2, F04.1, F06.2, F09.2, F10.1, F10.2) quedan asignadas a HU existentes, así EP-10 queda cubierta sin duplicar historias.
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: Hoja “Tareas F1” con IDs F1-01 … F1-11; prioridad de F1-05 = Crítica y de F1-06 = Alta
Texto nuevo: IDs TD-01 … TD-11; prioridad de TD-05 y TD-06 = Media (igual que la hoja Maestro)
Justificación: Las prioridades de TD-05 y TD-06 diferían entre hojas.
(07/10/2026) Hallazgo I-05. Inconsistencia original: Cuatro listas distintas de tipos de emergencia (Acta, ERS, F04.1 y HU-05) y ninguna tabla de tipos identificada en el modelo.
Texto anterior: F04.1: Definición de tipos de emergencia: Médica, Urbana y General.
Texto nuevo: F04.1: Definición de tipos de emergencia (catálogo único): Urbano, Médico, Emergencia y Adulto Mayor.
Justificación: Catálogo único de tipos de emergencia.
(07/10/2026) Hallazgo 2.1. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: (no existían)
Texto nuevo: Features F04.3, F05.3, F07.3 y F09.3 agregadas al final de la hoja
Justificación: Features de las HU nuevas.
(07/10/2026) Hallazgo 2.1. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: Hoja “Historia de usuario” con HU-01 a HU-13
Texto nuevo: Se agregan HU-14 a HU-19 con su redacción
Justificación: Coherencia con el documento del Backlog.
(07/10/2026) Hallazgo CA-02.1. Inconsistencia original: CA-02.1 fijaba tokens de 24 h sin refresh ni revocación (R-04).
Texto anterior: Retorno de token JWT válido con tiempo de expiración (p. ej., 24 hrs).
Texto nuevo: Retorno de token JWT firmado por el backend con expiración de 1 hora (configuración actual del módulo de login).
Justificación: R-04 / 3.1: el CA fijaba 24 h, pero el backend ya emite tokens de 1 hora. El refresh token rotativo y revocable (A-13) queda en Cambios Pendientes.
(07/10/2026) Hallazgo CA-03.1. Inconsistencia original: CA-03.1 exigía un número “estrictamente numérico” (impide +56) y validaba que “no existe”, algo no verificable.
Texto anterior: Validación de formato numérico de teléfono.
Texto nuevo: Validación del teléfono en formato E.164 (p. ej., +56 9 1234 5678), sin duplicados en la lista ni el número propio del usuario.
Justificación: 3.1 / C-05: “estrictamente numérico” impedía el formato +56 y “o no existe” no es verificable.
(07/10/2026) Hallazgo CA-08.1. Inconsistencia original: CA-08.1 exigía un envío exitoso a la totalidad de los contactos, lo que depende del proveedor y no es verificable.
Texto anterior: Notificación enviada exitosamente a la totalidad de contactos de la lista.
Texto nuevo: Intento de envío registrado con estado (PENDIENTE, ENVIADO o FALLIDO), número de intentos y hora para el 100 % de los contactos.
Justificación: 3.1: “enviada exitosamente a la totalidad” dependía del proveedor y no era verificable. El criterio es independiente del proveedor, que sigue pendiente.
(07/10/2026) Hallazgo CA-10.1. Inconsistencia original: CA-10.1 no indicaba dónde vive el contador de intentos del PIN (R-05).
Texto anterior: PIN numérico exacto de 4 dígitos. Tres intentos fallidos bloquean la acción por 5 min.
Texto nuevo: PIN numérico exacto de 4 dígitos, almacenado como hash. Tres intentos fallidos bloquean la acción por 5 min; el contador vive en el servidor por cuenta.
Justificación: R-05: el bloqueo se esquivaba desde otro cliente si el contador no estaba en el servidor.
(07/10/2026) Hallazgo CA-12.1. Inconsistencia original: CA-12.1 desactivaba la alerta “con su PIN”, pero solo los tutores tienen PIN.
Texto anterior: Revocación automática de visibilidad médica al cambiar estado a "Emergencia Finalizada".
Texto nuevo: Revocación automática de la visibilidad médica cuando la emergencia deja de estar ACTIVA (FINALIZADA, CANCELADA o EXPIRADA, según HU-14).
Justificación: 3.1 / I-06: el CA exigía desactivar “con su PIN”, pero solo los tutores tienen PIN; además usaba el estado “Emergencia Finalizada”, que no estaba en ningún catálogo.
(07/10/2026) Hallazgo CA-13.1. Inconsistencia original: CA-13.1 mezclaba el “renderizado” (frontend) con la verificación en el backend.
Texto anterior: Verificación de rol ROLE_ADMIN en el backend para permitir renderizado del panel.
Texto nuevo: Verificación del rol ADMINISTRADOR en el backend en cada endpoint del panel (403 para cualquier otro rol).
Justificación: 3.1: mezclaba el “renderizado” (frontend) con la verificación en el backend. El nombre del rol se alinea con la tabla ROL.
(07/10/2026) Hallazgo A-06 / A-08. Inconsistencia original: No existía una HU para finalizar o cancelar la emergencia (alerta que nunca se cierra, C-02).
Texto anterior: Criterios CA-01.1 a CA-13.1
Texto nuevo: Se agregan CA-14.1 a CA-19.1 para las HU nuevas
Justificación: Cada HU nueva tiene un criterio verificable.
Product backlog puntos historia.xlsx (2.1)
(07/10/2026) Hallazgo 2.1 / A-06. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: Tabla con HU-01 a HU-13
Texto nuevo: Se agregan HU-14 a HU-19 con puntos “Por estimar” (el total =SUM no cambia hasta que el equipo los estime)
Justificación: Coherencia con la Tabla Maestra; la estimación es del equipo (Planning Poker).
Sprint backlog actividades horas.xlsx (2.1)
(07/10/2026) Hallazgo I-03. Inconsistencia original: Framework frontend sin decidir (“React/Angular”) en el Acta, en 4.2 y en la tarea TH-1.3.
Texto anterior: TH-1.3: Maquetado del UI para el formulario de registro usando React/Angular y la debida conexión con el backend
Texto nuevo: TH-1.3: Maquetado del UI para el formulario de registro usando React + Ionic y la debida conexión con el backend
Justificación: El repositorio usa React 19 con Ionic React en web, móvil y escritorio. El Acta ya se corrigió el 05/10/2026; la tarea seguía con “React/Angular”.
Épicas e Historias de Usuario.docx (2.2)
(07/10/2026) Hallazgo 2.2. Inconsistencia original: Épicas e HU: MoSCoW incoherente y escenarios copiados o en contradicción con el Backlog.
Texto anterior: MoSCoW EP-01 (Arquitectura y Inicio usuario): S
Texto nuevo: MoSCoW EP-01: M
Justificación: Registro y login son prerequisito del MVP y el Backlog los marca como Críticos: no pueden ser Should Have.
(07/10/2026) Hallazgo 2.2. Inconsistencia original: Épicas e HU: MoSCoW incoherente y escenarios copiados o en contradicción con el Backlog.
Texto anterior: MoSCoW EP-02 (Gestión de Cuentas y Usuarios Base): S
Texto nuevo: MoSCoW EP-02: M
Justificación: Registro y login son prerequisito del MVP y el Backlog los marca como Críticos: no pueden ser Should Have.
(07/10/2026) Hallazgo 2.2. Inconsistencia original: Épicas e HU: MoSCoW incoherente y escenarios copiados o en contradicción con el Backlog.
Texto anterior: MoSCoW EP-08 (Gestión de Información Médica Controlada): C
Texto nuevo: MoSCoW EP-08: S
Justificación: La Visión presenta la información médica como propuesta de valor central; “Could Have” la dejaba descartable. Queda como Should Have (prioridad Media del Backlog, fuera del MVP).
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: HU-01 asociada a EP-01
Texto nuevo: HU-01 asociada a EP-02
Justificación: Coherencia con la corrección de features cruzadas en la Tabla Maestra (registro = EP-02/F02.1; login JWT = EP-01/F01.1).
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: HU-02 asociada a EP-02
Texto nuevo: HU-02 asociada a EP-01
Justificación: Coherencia con la corrección de features cruzadas en la Tabla Maestra (registro = EP-02/F02.1; login JWT = EP-01/F01.1).
(07/10/2026) Hallazgo 2.1 / A-06. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: Tabla de HU con HU-01 a HU-13
Texto nuevo: Se agregan HU-14 a HU-19
Justificación: HU nuevas para trazar todos los RF y cerrar la emergencia.
Historias Usuario con instructivo.xlsx (2.2)
(07/10/2026) Hallazgo 2.1 / A-10. Inconsistencia original: Product Backlog vs. Tabla Maestra: SP y dependencias distintas, features cruzadas, TD con IDs antiguos, TD-12 inexistente, features sin HU y 12 RF sin HU.
Texto anterior: Identificadores EP-01/HU-01 y EP-02/HU-02
Texto nuevo: EP-02/HU-01 y EP-01/HU-02
Justificación: Coherencia con la corrección de features cruzadas.
(07/10/2026) Hallazgo 2.2. Inconsistencia original: Épicas e HU: MoSCoW incoherente y escenarios copiados o en contradicción con el Backlog.
Texto anterior: HU-02 — Esc. 1: Inicio sección exitoso / Al iniciar sesion puede lograrse sin inconvenientes / Login / El sistema continuará con el ingreso por PIN
Texto nuevo: HU-02 — Esc. 1: Inicio de sesión exitoso / Al iniciar sesión las credenciales son válidas / Login / El sistema ingresa al panel principal; si la cuenta tiene usuarios apadrinados, solicita el PIN del perfil que ingresa (RF23, HU-10)
Justificación: El escenario pedía PIN en todo login, sin respaldo en el Backlog. Ahora el PIN solo se pide para elegir perfil cuando hay apadrinados (RF23), y quedó incorporado en HU-10.
(07/10/2026) Hallazgo 2.2 / R-13 / C-06. Inconsistencia original: Épicas e HU: MoSCoW incoherente y escenarios copiados o en contradicción con el Backlog.
Texto anterior: HU-06 — Esc. 1: Emisión de alerta exitosa / El usuario tiene la aplicación abierta y contactos de emergencia previamente configurados. / SOS / El sistema envía instantáneamente el mensaje de alerta (con la última ubicación conocida) a toda la red de contactos asignada. || Esc. 2: Alerta sin conexión a Internet / El usuario presiona el botón SOS en una zona donde el dispositivo móvil no tiene cobertura de datos o Wi-Fi. / SOS / El sistema intentará enviar la alerta a través de un mensaje SMS de respaldo (fallback) a los números telefónicos registrados de los contactos.
Texto nuevo: HU-06 — Esc. 1: Emisión de alerta exitosa / El usuario tiene la aplicación abierta y contactos de emergencia previamente configurados. / SOS / El sistema registra la alerta en estado ACTIVA con la ubicación obtenida según HU-07 (o la última conocida, indicándolo) y la despacha a toda la red de contactos asignada. || Esc. 2: Alerta sin conexión a Internet / El usuario presiona el botón SOS en una zona donde el dispositivo móvil no tiene cobertura de datos o Wi-Fi. / SOS / El sistema guarda la alerta en el dispositivo con su hora de creación, informa que no hay conexión y ofrece llamar a los números oficiales (HU-17) o abrir la aplicación de mensajes con el texto prellenado para enviarlo manualmente. Al recuperar la conexión, envía la alerta al servidor con su hora de creación e indica que la ubicación puede estar desactualizada.
Justificación: El escenario 1 enviaba la “última ubicación conocida” aunque HU-07 captura el GPS actual. El escenario 2 prometía un SMS automático desde el dispositivo: iOS no permite enviar SMS sin que el usuario pulse Enviar, y en Android SEND_SMS es un permiso restringido por Google Play.
(07/10/2026) Hallazgo 2.2. Inconsistencia original: Épicas e HU: MoSCoW incoherente y escenarios copiados o en contradicción con el Backlog.
Texto anterior: HU-09 — Esc. 1: Creación y vinculación exitosa / El usuario tutor se encuentra logueado y puede añadir a un usuario externo a base de un pago / Pago exitoso / El sistema muestra un mensaje de compra exitosa y deriva a la personalización de usuarios. || Esc. 2: Compra fallida / El usuario tutor no pudo realizar el pago debido a fallas con la tarjeta / Pago ERROR / El sistema no procede con el pago de la cuenta nueva y vuelve a darle la opción de volver a intentar.
Texto nuevo: HU-09 — Esc. 1: Creación y vinculación exitosa / El usuario tutor está autenticado, tiene cupos disponibles y crea la cuenta del dependiente. / Vincular dependiente / El sistema solicita el PIN del tutor, crea la cuenta secundaria vinculada a la principal con sus datos aislados y descuenta un cupo. || Esc. 2: Sin cupos disponibles / El tutor intenta vincular un dependiente y ya usó todos sus cupos (máximo 5). / Vincular dependiente / El sistema bloquea la vinculación con el mensaje "No posee cupos disponibles para vincular nuevos usuarios dependientes" y ofrece comprar cupos (HU-16). || Esc. 3: PIN incorrecto / El tutor ingresa un PIN incorrecto al confirmar la vinculación. / Vincular dependiente / El sistema rechaza la vinculación y aplica la regla de intentos de CA-10.1.
Justificación: Los escenarios solo trataban el pago, no la vinculación ni el PIN. Los escenarios de pago pasan a HU-16 (compra de cupos), con su mismo contenido.
(07/10/2026) Hallazgo R-05. Inconsistencia original: PIN débil: 4 dígitos guardados en claro y bloqueo que se esquiva desde otro cliente.
Texto anterior: HU-10 — (sin escenario)
Texto nuevo: HU-10 — Esc. 4: PIN bloqueado por intentos / El tutor ingresa tres veces un PIN incorrecto. / Validación pin / El sistema bloquea la acción por 5 minutos; el bloqueo se aplica en el servidor, en todos los dispositivos de la cuenta.
Justificación: El bloqueo por intentos debe aplicarse en el servidor para que no se esquive desde otro dispositivo.
(07/10/2026) Hallazgo 2.2 / A-11. Inconsistencia original: Épicas e HU: MoSCoW incoherente y escenarios copiados o en contradicción con el Backlog.
Texto anterior: HU-11 — Esc. 1: Registro exitoso de datos médicos / El usuario ha seleccionado un tipo de emergencia (médica) y está en la vista del mensaje. / Modificar mensaje  / El sistema almacena correctamente el nuevo mensaje personalizado y lo asocia al mensaje de emergencia. || Esc. 2: Validación de mensaje vacío / El usuario se encuentra personalizando el texto de la alerta de antecedente médico y lo deja vacío. / Modificar mensaje  / El sistema impide guardar los cambios y muestra un mensaje de advertencia indicando que "El mensaje de alerta no puede estar vacío". || Esc. 3: Límite de caracteres en la personalización / El usuario está editando el texto personalizado de su alerta. / Modificar mensaje  / El sistema bloquea el ingreso de texto adicional y muestra un contador en rojo alertando que se alcanzó el límite.
Texto nuevo: HU-11 — Esc. 1: Registro exitoso de la ficha médica / El usuario (o su tutor) está en la vista de ficha médica y aceptó el consentimiento de tratamiento de datos de salud. / Guardar ficha médica / El sistema cifra los campos sensibles (AES-256-GCM) antes de guardarlos y confirma el registro. || Esc. 2: Sin consentimiento / El usuario intenta guardar la ficha sin aceptar el consentimiento. / Guardar ficha médica / El sistema no guarda los datos y solicita aceptar el consentimiento (Ley 21.719). || Esc. 3: Fallo de cifrado / Ocurre un error al cifrar los datos (por ejemplo, la llave no está disponible). / Guardar ficha médica / El sistema aborta el guardado sin persistir datos en claro y muestra un error de sistema estándar (CA-11.1).
Justificación: Los escenarios estaban copiados de HU-05 (mensaje personalizado) y no probaban la ficha médica ni su cifrado.
(07/10/2026) Hallazgo A-07 / C-02. Inconsistencia original: El SOS quedaba bloqueado si el usuario no tenía ficha médica.
Texto anterior: HU-12 — Esc. 1: Visualización de datos exitosa / Como contacto de emergencia puedo visualizar los datos relevantes del usuario en situación de peligro / Mensaje de emergencia / El sistema debe poder enviar un mensaje de alerta con información relevante para el usuario || Esc. 2: Visualización de datos Errónea / El sistema no encuentra información relevante increada del usuario / Mensaje de emergencia / El sistema debe poder enviar una alerta de emergencia con información importante, si no llegase haber información relevante el usuario no podrá enviar un mensaje de emergencia
Texto nuevo: HU-12 — Esc. 1: Visualización de datos exitosa / Existe una emergencia ACTIVA y el contacto abre el enlace médico recibido en la alerta. / Abrir enlace médico / El sistema muestra la ficha médica del emisor en modo solo lectura mientras la emergencia siga ACTIVA. || Esc. 2: Usuario sin ficha médica / El usuario emite una alerta sin haber registrado ficha médica. / Mensaje de emergencia / El sistema envía la alerta igual, sin enlace médico. La falta de ficha nunca bloquea el SOS. || Esc. 3: Emergencia cerrada / El contacto abre el enlace después de que la emergencia pasó a FINALIZADA, CANCELADA o EXPIRADA. / Abrir enlace médico / El sistema niega el acceso y muestra "La emergencia ya no está activa. Acceso revocado" (CA-12.1).
Justificación: El escenario 2 impedía enviar la alerta si no había ficha médica, en contradicción con RF11. Se agrega el caso del enlace con la emergencia cerrada.
(07/10/2026) Hallazgo 2.2 / A-11 / C-21 / C-22. Inconsistencia original: Épicas e HU: MoSCoW incoherente y escenarios copiados o en contradicción con el Backlog.
Texto anterior: HU-13 — Esc. 1: Generar un CRUD de los usuarios y sus usuarios apadrinados / Se debe poder modificar, eliminar, agregar y buscar datos relevantes para caso de inconvenientes técnicos / CRUD / El sistema debe entregar la información actualizada a tiempo real || Esc. 2: Generar un CRUD de los datos de compra de los usuarios  / Se debe poder modificar, eliminar, agregar y buscar datos relevantes para caso de inconvenientes técnicos / CRUD / El sistema debe entregar la información actualizada a tiempo real
Texto nuevo: HU-13 — Esc. 1: Listar y filtrar cuentas / El administrador está autenticado con rol ADMINISTRADOR en el panel. / Buscar cuentas / El sistema lista las cuentas y sus apadrinados con su estado, y permite filtrar por nombre, correo o estado, sin mostrar la ficha médica. || Esc. 2: Cambiar estado o rol de una cuenta / El administrador bloquea, reactiva o cambia el rol de una cuenta distinta de la suya. / Gestionar cuenta / El sistema aplica el cambio, lo registra en BITACORA_SISTEMA y lo rechaza si dejaría al sistema sin administradores. || Esc. 3: Consulta de compras / El administrador revisa las compras de un usuario. / Consultar compras / El sistema muestra las ventas en modo solo lectura; las compras no se modifican ni se eliminan desde el panel.
Justificación: Los escenarios daban un CRUD completo (agregar, modificar, eliminar) sobre usuarios y compras. Se aplica mínimo privilegio y auditoría, como pide el Backlog (listar, filtrar y gestionar) y RNF5.
(07/10/2026) Hallazgo A-06 / A-11. Inconsistencia original: No existía una HU para finalizar o cancelar la emergencia (alerta que nunca se cierra, C-02).
Texto anterior: (no existía)
Texto nuevo: HU-14: Esc. 1: Finalizar emergencia || Esc. 2: Cancelar por falsa alarma || Esc. 3: Expiración automática || Esc. 4: Emergencia ya cerrada
Justificación: Escenarios Gherkin de la HU nueva.
(07/10/2026) Hallazgo A-06 / A-11. Inconsistencia original: No existía una HU para finalizar o cancelar la emergencia (alerta que nunca se cierra, C-02).
Texto anterior: (no existía)
Texto nuevo: HU-15: Esc. 1: Cambio exitoso de credenciales || Esc. 2: Contraseña actual incorrecta
Justificación: Escenarios Gherkin de la HU nueva.
(07/10/2026) Hallazgo A-06 / A-11. Inconsistencia original: No existía una HU para finalizar o cancelar la emergencia (alerta que nunca se cierra, C-02).
Texto anterior: (no existía)
Texto nuevo: HU-16: Esc. 1: Pago exitoso || Esc. 2: Compra fallida || Esc. 3: Confirmación duplicada
Justificación: Escenarios Gherkin de la HU nueva. Los escenarios de pago de HU-09 se trasladan aquí sin cambios.
(07/10/2026) Hallazgo A-06 / A-11. Inconsistencia original: No existía una HU para finalizar o cancelar la emergencia (alerta que nunca se cierra, C-02).
Texto anterior: (no existía)
Texto nuevo: HU-17: Esc. 1: Llamar a un número oficial || Esc. 2: Dispositivo sin llamadas
Justificación: Escenarios Gherkin de la HU nueva.
(07/10/2026) Hallazgo A-06 / A-11. Inconsistencia original: No existía una HU para finalizar o cancelar la emergencia (alerta que nunca se cierra, C-02).
Texto anterior: (no existía)
Texto nuevo: HU-18: Esc. 1: Solicitud válida || Esc. 2: Formulario incompleto
Justificación: Escenarios Gherkin de la HU nueva.
(07/10/2026) Hallazgo A-06 / A-11. Inconsistencia original: No existía una HU para finalizar o cancelar la emergencia (alerta que nunca se cierra, C-02).
Texto anterior: (no existía)
Texto nuevo: HU-19: Esc. 1: Informe con datos || Esc. 2: Sin datos en el rango
Justificación: Escenarios Gherkin de la HU nueva.
Plan de pruebas.docx (2.3)
(07/10/2026) Hallazgo A-22. Inconsistencia original: Documentos sin historial de versiones con fechas reales.
Texto anterior: Control del documento con la versión 1.0
Texto nuevo: Se agrega la versión 1.1 (07-10-2026)
Justificación: Registro de versiones con fechas reales.
(07/10/2026) Hallazgo 2.3 / A-16. Inconsistencia original: Plan de pruebas: casos sin traza a HU ni CA, sin prioridad, tres esquemas de ID, ejemplo marcado como aprobado, y sin ambiente QA ni matriz de dispositivos.
Texto anterior: Pruebas de Seguridad: Comprobar la protección de credenciales, sesiones, correos y accesos mediante los roles definidos en el backend.
Texto nuevo: Pruebas de Seguridad: Comprobar la protección de credenciales, sesiones, correos y accesos mediante los roles definidos en el backend, incluidas pruebas de IDOR en cada endpoint que recibe un identificador, la configuración de seguridad de Electron y la lista de orígenes CORS.
Justificación: No había pruebas de IDOR ni de seguridad de Electron o Capacitor.
(07/10/2026) Hallazgo 2.3 / A-16. Inconsistencia original: Plan de pruebas: casos sin traza a HU ni CA, sin prioridad, tres esquemas de ID, ejemplo marcado como aprobado, y sin ambiente QA ni matriz de dispositivos.
Texto anterior: (no existía)
Texto nuevo: Pruebas de Rendimiento y Resiliencia: Medir la latencia entre la activación del SOS y el despacho (RNF6) y verificar reintentos, idempotencia y que ninguna alerta se pierda ante fallos del servicio de mensajería o reinicios del backend (RNF7).
Justificación: No había pruebas de latencia de la alerta ni de caída del proveedor de mensajería.
(07/10/2026) Hallazgo 2.3. Inconsistencia original: Plan de pruebas: casos sin traza a HU ni CA, sin prioridad, tres esquemas de ID, ejemplo marcado como aprobado, y sin ambiente QA ni matriz de dispositivos.
Texto anterior: Versión desplegada en QA, identificable y estable para ejecución.
Texto nuevo: Versión identificada por commit o tag, desplegada en el ambiente de pruebas (contenedores Docker del repositorio levantados con docker-compose y datos ficticios) y estable para ejecución.
Justificación: Se exigía una “versión desplegada en QA”, pero no existe un ambiente QA definido (solo Docker local). Se nombra el ambiente real; un perfil “qa” dedicado queda en Cambios Pendientes.
(07/10/2026) Hallazgo 2.3. Inconsistencia original: Plan de pruebas: casos sin traza a HU ni CA, sin prioridad, tres esquemas de ID, ejemplo marcado como aprobado, y sin ambiente QA ni matriz de dispositivos.
Texto anterior: (no existía)
Texto nuevo: Prioridad de los casos: P1 = casos del flujo SOS y del MVP (HU-01 a HU-08 y HU-14) y casos de seguridad y confidencialidad; P2 = el resto. La prioridad de cada caso está en la columna Prioridad de la Matriz de trazabilidad de pruebas.
Justificación: Ningún caso tenía prioridad, aunque los criterios de salida la exigían.
(07/10/2026) Hallazgo 2.3. Inconsistencia original: Plan de pruebas: casos sin traza a HU ni CA, sin prioridad, tres esquemas de ID, ejemplo marcado como aprobado, y sin ambiente QA ni matriz de dispositivos.
Texto anterior: Se exigía una “matriz aprobada” de dispositivos que no existía
Texto nuevo: Nueva sección “Ambiente de pruebas y matriz aprobada”: Ambiente: contenedores Docker del repositorio (backend NestJS y PostgreSQL 15) levantados con docker-compose, con datos ficticios y la versión identificada por commit o tag. | Web: Chrome, Edge y Firefox (última versión estable), y Safari si hay un equipo disponible; resoluciones de 360 × 800, 768 × 1024 y 1366 × 768 píxeles. | Móvil: Android 10 o superior (emulador de Android Studio y al menos un dispositivo físico); iOS solo si el equipo dispone de un Mac con Xcode. | Escritorio: aplicación Electron en Windows 10 y Windows 11.
Justificación: El Plan excluía dispositivos fuera de la matriz, pero la matriz no estaba definida.
(07/10/2026) Hallazgo 2.3 / A-08. Inconsistencia original: Plan de pruebas: casos sin traza a HU ni CA, sin prioridad, tres esquemas de ID, ejemplo marcado como aprobado, y sin ambiente QA ni matriz de dispositivos.
Texto anterior: Una tabla que organice y detalle todos los casos de prueba, cada caso de prueba debe rastrearse directamente a un código de requisito del ERS. Los datos completos se detallan en la Matriz de trazabilidad de pruebas.
Texto nuevo: Una tabla que organice y detalle todos los casos de prueba. Cada caso se traza a un requisito del ERS, a una Historia de Usuario y a sus criterios de aceptación (CA), y usa el esquema de ID CP-MÓDULO-NNN. Los datos completos (incluidas la HU, los CA y la prioridad) se detallan en la Matriz de trazabilidad de pruebas.
Justificación: Los casos trazaban solo a los RF; ningún CA tenía un caso de prueba asociado.
(07/10/2026) Hallazgo 2.3 / A-08 / A-16. Inconsistencia original: Plan de pruebas: casos sin traza a HU ni CA, sin prioridad, tres esquemas de ID, ejemplo marcado como aprobado, y sin ambiente QA ni matriz de dispositivos.
Texto anterior: Tablas con IDs CP-RF1-01 / CP-RNF1-01 / CP-RF01-01
Texto nuevo: Tablas con IDs CP-MÓDULO-NNN (32 renombrados) y 13 casos nuevos agregados a las tablas de RF y RNF
Justificación: Esquema de ID único, igual a la Matriz.
(07/10/2026) Hallazgo 2.3. Inconsistencia original: Plan de pruebas: casos sin traza a HU ni CA, sin prioridad, tres esquemas de ID, ejemplo marcado como aprobado, y sin ambiente QA ni matriz de dispositivos.
Texto anterior: Registro de evidencias: estado “Aprobado” en el caso de ejemplo
Texto nuevo: Estado “Ejemplo (no ejecutado)”
Justificación: El ejemplo aparecía como un caso aprobado.
Matriz de trazabilidad de Pruebas.xlsx (2.3)
(07/10/2026) Hallazgo 2.3 / A-08. Inconsistencia original: Plan de pruebas: casos sin traza a HU ni CA, sin prioridad, tres esquemas de ID, ejemplo marcado como aprobado, y sin ambiente QA ni matriz de dispositivos.
Texto anterior: Tres esquemas de ID (CP-RF1-01, CP-USR-001 y CP-RF01-01); casos trazados solo al RF; ningún caso con prioridad
Texto nuevo: Esquema único CP-MÓDULO-NNN en todas las hojas (36 IDs renombrados en “Casos de prueba”); columnas nuevas Historia de Usuario, Criterios de aceptación y Prioridad (P1/P2)
Justificación: Los criterios de salida exigían el 100 % de los casos P1 y P2, pero ningún caso tenía prioridad, y ningún CA tenía un caso asociado.
(07/10/2026) Hallazgo 1.4 / RNF4. Inconsistencia original: ERS: índice duplicado, anexo Gantt vacío, RNF de rendimiento y accesibilidad prometidos pero inexistentes, requisitos no verificables, rol “empleado” sin definir, planificación por plataforma y cita de IEEE 830.
Texto anterior: CP-RNF4-01 — datos de entrada: Usuarios principal, apadrinado, empleado y administrador; operaciones permitidas y prohibidas.
Texto nuevo: CP-RBAC-001 — datos de entrada: Usuarios principal, apadrinado, soporte (rol SOPORTE) y administrador; operaciones permitidas y prohibidas.
Justificación: El rol “empleado” no existe; corresponde a SOPORTE.
(07/10/2026) Hallazgo 2.3 / A-16. Inconsistencia original: Plan de pruebas: casos sin traza a HU ni CA, sin prioridad, tres esquemas de ID, ejemplo marcado como aprobado, y sin ambiente QA ni matriz de dispositivos.
Texto anterior: Sin pruebas de latencia, caída del proveedor, idempotencia, IDOR, Electron, CORS ni de los RNF nuevos
Texto nuevo: Nueva sección “Casos agregados en la versión 1.1” con 13 casos: CP-CON-003, CP-ALT-003, CP-ALT-004, CP-ALT-005, CP-MED-002, CP-PER-001, CP-RBAC-002, CP-SEG-002, CP-SEG-003, CP-SEG-004, CP-PRI-002, CP-PRI-003, CP-ACC-001
Justificación: Cubre C-01, C-03, C-05, R-01, R-03, R-11, R-12, R-22 y los RNF6 a RNF10. Las pruebas específicas del proveedor (por ejemplo, SMS con tildes o segmentos) esperan a que se defina el proveedor.
(07/10/2026) Hallazgo 2.3. Inconsistencia original: Plan de pruebas: casos sin traza a HU ni CA, sin prioridad, tres esquemas de ID, ejemplo marcado como aprobado, y sin ambiente QA ni matriz de dispositivos.
Texto anterior: Registro de resultados: CP-RF01-01 / Aprobado / La cuenta fue creada correctamente y el sistema mostró el mensaje de confirmación correspondiente.
Texto nuevo: CP-USR-001 / Ejemplo (no ejecutado) / [Ejemplo de llenado] La cuenta fue creada correctamente y el sistema mostró el mensaje de confirmación correspondiente.
Justificación: El registro mostraba como “Aprobado” un caso que era solo un ejemplo.
(07/10/2026) Hallazgo I-07 / 1.4 / A-09. Inconsistencia original: Alcance comercial contradictorio: el Backlog eliminaba las ventas y el resto de los documentos las mantenía.
Texto anterior: Hoja 1 — alcances “Aclarar”, “Condicionado” y “Futuro”
Texto nuevo:
Justificación: RF5 y RF25 se aclararon en el ERS v1.1; las ventas (RF16 y RF17) siguen en el alcance con PayPal sandbox por decisión del equipo; RF14, RF18 y RF20 ya tienen HU y redacción verificable.
CRITERIOS DE ACEPTACIÓN.xlsx (3.1)
(07/10/2026) Hallazgo CA-02.1. Inconsistencia original: CA-02.1 fijaba tokens de 24 h sin refresh ni revocación (R-04).
Texto anterior: Autenticación y expiración / Con credenciales válidas, el sistema retorna un token JWT seguro con un tiempo de expiración definido (por ejemplo, en 24 hrs) / Con credenciales inválidas, se despliega una notificación: "Usuario o contraseña incorrectos"
Texto nuevo: Autenticación y expiración / Con credenciales válidas, el sistema retorna un token JWT firmado por el backend con expiración de 1 hora (configuración actual del módulo de login). El cierre de sesión elimina el token del almacenamiento seguro del dispositivo. / Con credenciales inválidas, se despliega una notificación: "Usuario o contraseña incorrectos"
Justificación: R-04: el CA fijaba 24 h sin revocación; el backend ya emite tokens de 1 hora. El refresh token rotativo y el “cerrar todas las sesiones” (A-13) quedan en Cambios Pendientes.
(07/10/2026) Hallazgo CA-03.1. Inconsistencia original: CA-03.1 exigía un número “estrictamente numérico” (impide +56) y validaba que “no existe”, algo no verificable.
Texto anterior: Validación de Formato de numéro telefónico / El sistema valida que el formato del número telefónico sea estrictamente numérico y correcto para su posterior uso / El campo de texto muestra un error de validación y bloquea el botón de guardado, generando la notificación "El numero telefonico ingresado es incorrecto o no existe"
Texto nuevo: Validación de formato de número telefónico (E.164) / El número se normaliza y valida en formato E.164 (por ejemplo, +56 9 1234 5678; máximo 15 dígitos). No se permite registrar un número duplicado en la lista ni el número propio del usuario. / El campo muestra un error de validación, bloquea el botón de guardado y genera la notificación "El número telefónico ingresado no tiene un formato válido"
Justificación: 3.1 / C-05: “estrictamente numérico” impedía el formato +56, y “o no existe” no se puede verificar.
(07/10/2026) Hallazgo CA-05.1. Inconsistencia original: El mensaje tenía tres límites distintos (truncar a 160, bloquear con contador y columna de 200).
Texto anterior: Restricción de longitud de mensaje / El mensaje de emergencia personalizado del usuario se fija a un máximo de 160 caracteres / El campo de texto en el sistema se trunca automáticamente al momento que se alcanzan los 160 caracteres
Texto nuevo: Restricción de longitud de mensaje / El mensaje de emergencia personalizado del usuario tiene un máximo de 160 caracteres, validado en el frontend y en el backend. / La interfaz impide escribir más de 160 caracteres y muestra un contador que cambia a rojo al llegar al límite; el backend rechaza mensajes de más de 160 caracteres
Justificación: 3.1: había tres comportamientos (truncar, bloquear con contador rojo y una columna de 200). Se adopta el bloqueo con contador del instructivo de HU-05; la columna varchar(200) del init.sql se mantiene como margen técnico.
(07/10/2026) Hallazgo CA-08.1. Inconsistencia original: CA-08.1 exigía un envío exitoso a la totalidad de los contactos, lo que depende del proveedor y no es verificable.
Texto anterior: Transmisión de notificación / La notificación (al realizarse un llamado de emergencia) que contiene el enlace de ubicación y el mensaje personalizado, debe enviarse exitosamente a la totalidad de los contactos asignados  / Si un envío de alerta falla por problemas del proveedor, el sistema reintenta y guarda el error en la bitácora.
Texto nuevo: Transmisión de notificación / Por cada contacto asignado, el sistema registra al menos un intento de envío con su estado (PENDIENTE, ENVIADO o FALLIDO), número de intentos y hora exacta. El criterio se cumple cuando el 100 % de los contactos tiene un intento registrado y un estado final. / Si un envío falla por problemas del proveedor, el sistema reintenta con espera incremental y registra el error por destinatario; el usuario ve cuántos contactos fueron notificados.
Justificación: 3.1 / C-03: “enviarse exitosamente a la totalidad” dependía del proveedor y no era verificable. El criterio no depende del proveedor de mensajería, que sigue pendiente.
(07/10/2026) Hallazgo CA-10.1. Inconsistencia original: CA-10.1 no indicaba dónde vive el contador de intentos del PIN (R-05).
Texto anterior: PIN numérico exacto de 4 dígitos. Tres intentos fallidos bloquean la acción por 5 min. / El PIN debe ser numérico y exactamente de 4 dígitos, dentro del sistema se tolerarán un máximo de tres intentos fallidos antes de aplicar un bloqueo temporal / Al tercer intento fallido del PIN, se despliega la notificación: "Por seguridad, se ha bloqueado el intento de acceso por 5 minutos debido a intentos fallidos reiterados"
Texto nuevo: PIN numérico exacto de 4 dígitos. Tres intentos fallidos bloquean la acción por 5 min. / El PIN debe ser numérico y exactamente de 4 dígitos, y se almacena como hash. Se toleran un máximo de tres intentos fallidos antes de aplicar un bloqueo temporal; el contador se mantiene en el servidor por cuenta, no por dispositivo. / Al tercer intento fallido del PIN, se despliega la notificación: "Por seguridad, se ha bloqueado el intento de acceso por 5 minutos debido a intentos fallidos reiterados"
Justificación: R-05: si el contador no vive en el servidor, el bloqueo se esquiva desde otro cliente.
(07/10/2026) Hallazgo CA-12.1. Inconsistencia original: CA-12.1 desactivaba la alerta “con su PIN”, pero solo los tutores tienen PIN.
Texto anterior: Bloqueo de visibilidad de ficha / El acceso a los datos médicos se niega automáticamente cuando el usuario desactiva la alerta con su PIN y define el estado como "Emergencia Finalizada" / Si un contacto intenta abrir el enlace post-emergencia, se redirigirá a una pantalla con el mensaje: "Emergencia finalizada. Acceso revocado"
Texto nuevo: Bloqueo de visibilidad de ficha / El acceso a los datos médicos se niega automáticamente cuando la emergencia deja de estar ACTIVA (FINALIZADA, CANCELADA o EXPIRADA, según HU-14). / Si un contacto intenta abrir el enlace después de cerrada la emergencia, se redirige a una pantalla con el mensaje: "La emergencia ya no está activa. Acceso revocado"
Justificación: 3.1: el CA exigía desactivar la alerta “con su PIN”, pero solo los tutores tienen PIN; y “Emergencia Finalizada” no estaba en ningún catálogo de estados.
(07/10/2026) Hallazgo CA-13.1. Inconsistencia original: CA-13.1 mezclaba el “renderizado” (frontend) con la verificación en el backend.
Texto anterior: Renderizado de panel administrativo restringido / El sistema verifica que el rol del usuario cumpla con el de ADMIN en el backend antes de permitir el renderizado de los datos y el historial. / Si se realiza un ingreso no autorizado, se redirige al usuario al inicio de sesión y se genera la notificación: "Acceso denegado. Permisos insuficientes"
Texto nuevo: Panel administrativo restringido / El backend verifica el rol ADMINISTRADOR en cada endpoint del panel (incluidos el historial y los reportes) y responde 403 a cualquier otro rol. La interfaz no muestra el panel a usuarios sin ese rol. / Si se realiza un ingreso no autorizado, se redirige al usuario al inicio de sesión y se genera la notificación: "Acceso denegado. Permisos insuficientes"
Justificación: 3.1: mezclaba el “renderizado” (frontend) con la verificación en el backend.
(07/10/2026) Hallazgo A-06 / A-08. Inconsistencia original: No existía una HU para finalizar o cancelar la emergencia (alerta que nunca se cierra, C-02).
Texto anterior: Criterios CA-01.1 a CA-13.1
Texto nuevo: Se agregan CA-14.1 a CA-19.1 (nombre, condición de aceptación y comportamiento ante error)
Justificación: Criterios verificables para las HU nuevas.
BDD con tipos de datos.xlsx (4.1)
(07/10/2026) Hallazgo 4.1 / A-01. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: USUARIO.contra_usuario varchar(50)
Texto nuevo: USUARIO.contra_usuario varchar(255)
Justificación: Un hash bcrypt mide 60 caracteres (Argon2 cerca de 95): varchar(50) truncaba o fallaba. El init.sql ya usa VARCHAR(255).
(07/10/2026) Hallazgo 4.1 / A-01. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: USUARIO.PIN_ID, suscripcion_ID, msj_personalizado_ID y prioridad_ID NOT NULL
Texto nuevo: Las cuatro columnas pasan a NULL
Justificación: PIN_ID NOT NULL obligaba a todos los usuarios a tener PIN (solo los tutores lo usan). El init.sql ya las define como opcionales porque se configuran después del registro.
(07/10/2026) Hallazgo R-01 / A-04. Inconsistencia original: RBAC insuficiente: reglas de propiedad sin verificar (riesgo de IDOR) y sin catálogo cerrado de roles.
Texto anterior: ROL sin catálogo documentado (ADMIN, SOPORTE, “empleado”, principal y apadrinado dispersos)
Texto nuevo: Nota en ROL.nombre_rol con el catálogo cerrado ADMINISTRADOR, SOPORTE y USUARIO (PRINCIPAL/APADRINADO según usuario_principal_ID)
Justificación: Catálogo único de roles alineado con los INSERT del init.sql.
(07/10/2026) Hallazgo I-05. Inconsistencia original: Cuatro listas distintas de tipos de emergencia (Acta, ERS, F04.1 y HU-05) y ninguna tabla de tipos identificada en el modelo.
Texto anterior: No se identificaba ninguna tabla de tipos de emergencia
Texto nuevo: PRIORIDAD.tipo_prioridad documentada como catálogo único de tipos de emergencia (URBANO, MEDICO, EMERGENCIA, ADULTO MAYOR)
Justificación: La tabla ya existía (su comentario dice que maneja la finalidad de la cuenta). Se documenta en lugar de crear una tabla duplicada.
(07/10/2026) Hallazgo 4.1 / R-05 / A-01. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: PIN.PIN integer (4) (en claro, pierde ceros iniciales, sin contador de intentos)
Texto nuevo: PIN.PIN varchar(4) (como en init.sql) + migración propuesta: pin_hash varchar(255), intentos_fallidos smallint, bloqueado_hasta timestamptz
Justificación:
(07/10/2026) Hallazgo 4.1 / A-01. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: CONTACTO_EMERGENCIA.num_emergencia varchar(9); sin nombre ni parentesco
Texto nuevo: num_emergencia varchar(16) (E.164) + nombre_contacto varchar(50) NOT NULL + parentesco varchar(30) NULL
Justificación: varchar(9) impedía el formato +56 (CA-03.1), y HU-03/HU-04 piden nombre y parentesco que la tabla no tenía.
(07/10/2026) Hallazgo 4.1 / R-07 / A-01. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: ANTECEDENTE_MEDICO: tipo_sangre varchar(20), alergias/enfermedades_cronicas/medicamentos_actuales/discapacidad_presente varchar(250), usuario_ID integer (FK)
Texto nuevo: Campos sensibles como text (cifrado AES-256-GCM); usuario_ID integer (FK, UNIQUE); nuevas columnas iv_cifrado bytea, version_llave smallint, consentimiento_en timestamptz y actualizado_en timestamptz
Justificación: La ficha médica que agregó el equipo el 06/10/2026 no tenía soporte para el cifrado de CA-11.1: el texto cifrado no cabe en varchar(250) y faltaban el IV por registro y la versión de llave para rotarla. consentimiento_en responde a la Ley 21.719. Se conserva el nombre de la tabla.
(07/10/2026) Hallazgo I-06 / C-01 / A-01 / A-06. Inconsistencia original: Estado de emergencia con cuatro nombres distintos y sin máquina de estados ni columna de estado en ALERTA.
Texto anterior: ALERTA sin estado ni timestamps (alerta_ID, ubicacion_alerta_ID, detalle_alerta_ID, usuario_ID)
Texto nuevo: ALERTA + estado_alerta (ACTIVA/FINALIZADA/CANCELADA/EXPIRADA), prioridad_ID (FK), clave_idempotencia uuid UNIQUE, creada_en y cerrada_en timestamptz; índice único parcial de una alerta ACTIVA por usuario
Justificación: No había máquina de estados ni forma de evitar alertas duplicadas por reintentos del cliente.
(07/10/2026) Hallazgo 4.1 / R-15 / A-01. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: UBICACION_ALERTA.ubicacion text (sin precisión, fuente ni hora)
Texto nuevo: ubicacion varchar(150) (como en init.sql) + latitud, longitud numeric(9,6), precision_m, fuente_ubicacion (GPS/ULTIMA_CONOCIDA/NO_DISPONIBLE) y capturada_en timestamptz
Justificación: HU-07 distingue GPS actual de última ubicación conocida, y C-06 exige distinguir la hora de captura de la hora de envío.
(07/10/2026) Hallazgo 4.1 / A-01. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: HISTORIAL_ALERTA sin estado ni timestamps
Texto nuevo: HISTORIAL_ALERTA + estado_anterior, estado_nuevo y fecha_cambio timestamptz
Justificación: El historial con valor legal necesita registrar cada transición de estado con su hora.
(07/10/2026) Hallazgo 4.1 / A-01. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: DETALLE_ALERTA solo referenciaba el mensaje personalizado vigente (msj_personalizado_ID)
Texto nuevo: DETALLE_ALERTA + texto_mensaje varchar(200): copia del texto al momento de la alerta
Justificación: Si el usuario edita su mensaje, el historial que el Acta quiere usar en procesos legales cambiaba retroactivamente.
(07/10/2026) Hallazgo 4.1 / C-03 / A-01 / A-03. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: No existía registro de envío por destinatario (NOTIFICACION_MOVIL solo guardaba usuario_ID y una fecha date)
Texto nuevo: Nueva tabla ENVIO_ALERTA: envio_alerta_ID, alerta_ID, contacto_emergencia_ID, canal, estado_envio (PENDIENTE/ENVIADO/FALLIDO), intentos, proximo_intento_en, id_proveedor, ultimo_error, creado_en, enviado_en
Justificación: Permite el estado por destinatario (HU-08, F06.2, CA-08.1) y sirve de outbox para el despacho asíncrono con reintentos sin infraestructura nueva. Es independiente del proveedor, que sigue pendiente.
(07/10/2026) Hallazgo 4.1 / R-06 / C-02 / A-01. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: No existía entidad para el enlace médico temporal (TH-12.1)
Texto nuevo: Nueva tabla ENLACE_MEDICO: enlace_medico_ID, alerta_ID (FK, UNIQUE), token_hash, creado_en, expira_en, revocado_en
Justificación: El enlace se guarda como hash (un SMS reenviado no revela el token en la BD) y se revoca al cerrar o expirar la emergencia (HU-14).
(07/10/2026) Hallazgo 4.1 / C-11. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: NOTIFICACION_MOVIL.fecha_envio date
Texto nuevo: NOTIFICACION_MOVIL.fecha_envio timestamptz
Justificación: Una auditoría sin hora no cumple la “hora exacta” de HU-08, y America/Santiago tiene cambio de horario.
(07/10/2026) Hallazgo 4.1. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: VENTA.id_usuario; VENTA.fecha_venta date; DETALLE_VENTA.suscripcion_ID
Texto nuevo: VENTA.usuario_ID; VENTA.fecha_venta timestamptz; DETALLE_VENTA.plan_ID
Justificación:
(07/10/2026) Hallazgo 4.1 (bitácora 05/10/2026). Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: PLAN con total_venta integer y fecha_venta date; PLAN_USUARIO.usuario_ID integer (sin FK)
Texto nuevo: PLAN sin total_venta ni fecha_venta; PLAN_USUARIO.usuario_ID integer (FK)
Justificación: La bitácora del 05/10/2026 registraba la eliminación de esos campos, pero el archivo local aún los tenía. Se aplica lo registrado (coincide con el init.sql) y se marca la FK que el init.sql ya declara (fk_plu_usr).
(07/10/2026) Hallazgo 4.1 / A-20. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: Soporte modelado tres veces sin explicar; “CONTACTO” chocaba con “contacto de emergencia”; correo_remitente nvarchar (120); fecha_contacto date
Texto nuevo: Notas de responsabilidad en las hojas SOPORTE y CONTACTO; correo_remitente varchar(100); fecha_contacto timestamptz
Justificación: Las tres tablas existen en el init.sql, así que no se eliminan: se documenta qué guarda cada una. nvarchar no existe en PostgreSQL.
(07/10/2026) Hallazgo 4.1 / C-11. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: BITACORA_SISTEMA.acción_realizada; fecha_accion date
Texto nuevo: BITACORA_SISTEMA.accion_realizada; fecha_accion timestamptz
Justificación: Nombre sin tilde como en el init.sql; una bitácora necesita la hora.
(07/10/2026) Hallazgo 4.1 / A-20. Inconsistencia original: Diccionario: tipos inválidos o insuficientes, alertas sin estado ni timestamps, sin registro de envíos ni enlace médico, PIN en claro y errores de forma.
Texto anterior: Hoja “PROPUESTA DE MEJORA” con 13 tablas (bodega, stock, envío, SIM) mezclada con el modelo
Texto nuevo: Hoja renombrada a “ANEXO FUERA DE ALCANCE” con una nota explicativa
Justificación: No responden a ningún RF. Se separan del modelo sin borrarlas.
Especificación de Herramientas y Servicios del Proyecto.docx (4.2)
(07/10/2026) Hallazgo I-03. Inconsistencia original: Framework frontend sin decidir (“React/Angular”) en el Acta, en 4.2 y en la tarea TH-1.3.
Texto anterior: Se usará React/Angular en conjunto con los componentes base de Ionic para desarrollar interfaces gráficas y la lógica de negocio dentro de la aplicación
Texto nuevo: Se usará React 19 con Ionic React (componentes base de Ionic) para desarrollar las interfaces gráficas y la lógica de presentación de las aplicaciones web, móvil y de escritorio.
Justificación: El repositorio usa React 19.2 e Ionic React 9 en las tres aplicaciones. El Acta ya se corrigió a React el 05/10/2026.
(07/10/2026) Hallazgo R-17 / R-08 / 4.2. Inconsistencia original: Un solo bundle para tres plataformas (funciones de administrador dentro del móvil).
Texto anterior: Se utilizará Capacitor para realizar la exportación de la aplicación web directamente a una aplicación móvil, esto debido a que Capacitor es una herramienta nativa de Ionic, lo que agiliza inmensamente el trabajo de desarrollo
Texto nuevo: Se utilizará Capacitor 8 para empaquetar la aplicación móvil (apps/mobile) como aplicación nativa. La aplicación móvil tiene su propio punto de entrada en el monorepo y comparte con las demás solo los paquetes comunes (packages/ui, api-client y api-types). No incluye el panel de administración. La captura de la ubicación se realizará con el plugin Geolocation de Capacitor (TH-7.1), y el token de sesión debe guardarse en almacenamiento seguro del dispositivo (Keychain/Keystore), no en localStorage.
Justificación: “Exportar la aplicación web” implicaba un solo bundle con funciones de administrador dentro del móvil. El repositorio tiene un punto de entrada por aplicación.
(07/10/2026) Hallazgo R-02 / R-03 / A-05. Inconsistencia original: El escritorio como cliente privilegiado con acceso directo a la base de datos.
Texto anterior: Se utilizará el framework Electron para exportar la aplicación web desarrollada como un software ejecutable local, siendo esta la aplicación que gestionará la plataforma web y móvil
Texto nuevo: Se utilizará Electron 44 para la aplicación de escritorio (apps/desktop), con su propio punto de entrada. Contiene el panel de administración y opera exclusivamente a través de la API del backend con rol ADMINISTRADOR (RF20), sin credenciales de base de datos ni secretos dentro del paquete .asar. La ventana debe configurarse con contextIsolation y sandbox activos, nodeIntegration desactivado, un preload con contextBridge, una CSP estricta, bloqueo de la navegación hacia orígenes externos y sin DevTools en producción; el token se guarda con safeStorage.
Justificación: El texto describía al escritorio como un cliente privilegiado que “gestiona la plataforma”. Un .asar se extrae como un zip: cualquier secreto incluido queda expuesto.
(07/10/2026) Hallazgo 4.2. Inconsistencia original: Especificación: conteo de servicios incorrecto, Maps descrito como captura de ubicación, un solo bundle exportado, servicios internos incompletos y sin versiones ni herramientas de calidad.
Texto anterior: Se usará Turborepo para alojar las 3 aplicaciones confeccionadas y el backend en un solo repositorio
Texto nuevo: Se usará Turborepo 2.11 para alojar las 3 aplicaciones y el backend en un solo repositorio (workspaces de npm apps/* y packages/*).
Justificación: Se documenta la versión real.
(07/10/2026) Hallazgo R-21 / 4.2. Inconsistencia original: Esquema documentado distinto del esquema real del repositorio.
Texto anterior: Se utilizará PostgreSQL para la gestión y confección de las 30 tablas normalizadas solicitadas para el sistema, garantizando la integridad de los datos
Texto nuevo: Se utilizará PostgreSQL 15 (imagen del docker-compose) para las tablas normalizadas definidas en el Diccionario de Datos (4.1), creadas con el script init.sql del repositorio. El backend accede a la base de datos mediante TypeORM.
Justificación: El texto fijaba “30 tablas”, cifra que cambia con la migración propuesta en el Diccionario, y no mencionaba el ORM ni el script de creación.
(07/10/2026) Hallazgo 4.2 / R-18 / R-20 / A-15. Inconsistencia original: Especificación: conteo de servicios incorrecto, Maps descrito como captura de ubicación, un solo bundle exportado, servicios internos incompletos y sin versiones ni herramientas de calidad.
Texto anterior: (no existía)
Texto nuevo: Versiones y herramientas de calidad: Node.js 24.21.0 y npm 11.19 (fijados en .nvmrc y en engines del package.json raíz; la imagen Docker del backend usa la misma versión de Node), TypeScript 6.0, NestJS 12, React 19.2, Ionic React 9, Capacitor 8.5, Electron 44, TypeORM 1.1 y Turborepo 2.11. Calidad de código: Oxlint con reglas que usan información de tipos en el backend y una configuración compartida de ESLint (packages/eslint-config). Pruebas: Jest en el backend; Vitest y Cypress en la aplicación móvil. Por ahora no hay integración continua (CI) configurada.
Justificación: El documento no mencionaba Node 24.21.0, npm 11, ESLint/Oxlint, el framework de pruebas, el ORM ni CI. Se documenta lo que existe hoy en el repositorio.
(07/10/2026) Hallazgo 4.2. Inconsistencia original: Especificación: conteo de servicios incorrecto, Maps descrito como captura de ubicación, un solo bundle exportado, servicios internos incompletos y sin versiones ni herramientas de calidad.
Texto anterior: Las aplicaciones harán uso de 4 servicios externos de APIs los cuales son necesarios para el funcionamiento correcto de las aplicaciones, estos servicios son:
Texto nuevo: Las aplicaciones harán uso de 5 servicios externos de APIs los cuales son necesarios para el funcionamiento correcto de las aplicaciones, estos servicios son:
Justificación: Se anunciaban 4 servicios y se listaban 5 (Mindicador se agregó el 28/09/2026).
(07/10/2026) Hallazgo 4.2. Inconsistencia original: Especificación: conteo de servicios incorrecto, Maps descrito como captura de ubicación, un solo bundle exportado, servicios internos incompletos y sin versiones ni herramientas de calidad.
Texto anterior: Las aplicaciones también harán uso de 2 servicios de API REST creados por el equipo de desarrollo, estos servicios gestionan datos vitales de las aplicaciones y son necesarios para el funcionamiento completo de la página, estas APIs y su propósito se explican a continuación:
Texto nuevo: Las aplicaciones también harán uso de los servicios de API REST creados por el equipo en el backend NestJS. Además de las dos API principales descritas a continuación, el backend tiene módulos de autenticación (login y JWT), administración, planes, auditoría e integraciones externas. Los módulos de contactos, ficha médica, PIN, soporte y reportes personales se agregarán según las HU correspondientes.
Justificación: Los “2 servicios internos” no cubrían contactos, ficha médica, PIN, ventas, soporte ni reportes. Se describen los módulos reales del backend.
(07/10/2026) Hallazgo R-09. Inconsistencia original: Dos proveedores de identidad (Firebase Authentication y JWT propio) sin definir cuál emite la sesión.
Texto anterior: Dos fuentes de identidad sin decidir: Firebase Authentication (4.2) y JWT propio (TH-2.1)
Texto nuevo: Fuente de identidad (decisión v1.1): el backend NestJS es la única fuente de verdad de usuarios, roles y sesiones, y emite su propio JWT (expiración de 1 hora). Firebase Authentication se usa solo para verificar la existencia del correo y para la recuperación de contraseña, y no emite sesiones de la plataforma. El endpoint actual /auth/me, que valida tokens de Firebase, debe alinearse con esta decisión (ver Cambios Pendientes).
Justificación: Duplicaban usuarios, recuperación de contraseña y verificación sin definir cuál emite la sesión. El backend ya emite JWT y concentra los roles (RNF4).
(07/10/2026) Hallazgo R-09. Inconsistencia original: Dos proveedores de identidad (Firebase Authentication y JWT propio) sin definir cuál emite la sesión.
Texto anterior: Firebase Authentication — Se utilizará para verificar la validez de los correos electrónicos que sean utilizados para crear un usuario dentro de la página, al igual que el manejo de la recuperación de contraseñas
Texto nuevo: Firebase Authentication — Se utilizará para verificar la validez de los correos electrónicos con que se crea un usuario y para la recuperación de contraseñas. No emite sesiones: la sesión la emite el backend con su propio JWT.
Justificación: Coherencia con la decisión de fuente única de identidad.
(07/10/2026) Hallazgo 4.2. Inconsistencia original: Especificación: conteo de servicios incorrecto, Maps descrito como captura de ubicación, un solo bundle exportado, servicios internos incompletos y sin versiones ni herramientas de calidad.
Texto anterior: Google Maps Platform API — Servicio que permite la captura de una ubicación exacta del usuario, utilizando parámetros de Longitud y Latitud / Para el correcto manejo de las emergencias dentro del proyecto, es necesario utilizar la ubicación al momento de la emergencia, por lo tanto esta se extrae y se utilizará para el registro y manejo de la emergencia
Texto nuevo: Google Maps Platform API — Servicio de mapas y geocodificación: convierte coordenadas de latitud y longitud en direcciones (geocodificación inversa) y permite generar enlaces y vistas de mapa. / La ubicación la captura el dispositivo con el plugin Geolocation de Capacitor; Google Maps convierte esas coordenadas en una dirección legible y genera el enlace de mapa que se adjunta a la alerta y a su registro. Si no hay API key disponible, el enlace puede generarse con OpenStreetMap (HU-07).
Justificación: Google Maps no captura la ubicación: la captura el plugin Geolocation de Capacitor (TH-7.1). El backend expone /maps/geocode y /maps/reverse-geocode.

Cambios Pendientes (para conversar con el equipo de desarrollo)
Estos puntos de la auditoría no se resolvieron en la documentación porque requieren cambios de código o una decisión del equipo.
Canal de despacho de alertas (R-10, A-02). El equipo considera usar Firebase para notificar por correo. Firebase Authentication solo envía correos de verificación y de recuperación de contraseña, y Firebase Cloud Messaging (Push) solo llega a dispositivos con la app instalada, mientras que los contactos de emergencia son solo nombre y teléfono. Para enviar correos de alerta haría falta un servicio de correo transaccional (por ejemplo, la extensión Trigger Email de Firebase con un proveedor SMTP) y agregar el correo del contacto al modelo. Por eso no se modificó la definición del proveedor en 4.2, el canal “Push / SMS” de HU-08 ni el costo en el TEC. Ya quedó listo lo que no depende del proveedor: ENVIO_ALERTA (columna canal), CA-08.1, RNF6, RNF7 y CP-ALT-004. Falta elegir canal y proveedor, presupuestarlo y probar los casos propios del canal (por ejemplo, SMS con tildes y segmentos, C-04).
Migración del esquema en el código (A-01). Las tablas y columnas marcadas en amarillo en el Diccionario (ENVIO_ALERTA, ENLACE_MEDICO, estado y timestamps de ALERTA, pin_hash, E.164, cifrado de ANTECEDENTE_MEDICO, etc.) aún no están en init.sql ni en las entidades TypeORM. También falta migrar las columnas TIMESTAMP a timestamptz y crear ANTECEDENTE_MEDICO en init.sql.
Despacho asíncrono, autorización y pruebas de seguridad (A-03, A-04). Implementar el worker que procesa ENVIO_ALERTA como outbox, la regla de una alerta ACTIVA por usuario, el guard que niega por defecto con verificación de propiedad, y las pruebas e2e de IDOR (CP-RBAC-002).
Sesión e identidad (A-13, R-09). Implementar el refresh token rotativo y revocable y la opción “cerrar todas las sesiones”. Alinear el endpoint /auth/me (que hoy valida tokens de Firebase) con la decisión de que el backend es la única fuente de sesión.
Aplicación de escritorio (A-05). No se encontró en apps/desktop la configuración de seguridad de la ventana de Electron. Aplicarla y verificar el .asar con CP-SEG-002.
Ecosistema del monorepo (A-15). La copia del Dockerfile en 4.4 Docker usa node:20-alpine, mientras el Dockerfile del repositorio usa Node 24.21.0. Además, el package.json raíz no tiene el campo packageManager que exige Turborepo 2, y turbo.json no declara env/globalEnv. Falta revisar la superposición de reglas ESLint/Oxlint y usar almacenamiento seguro en Capacitor. El archivo .env de 4.4 Docker está versionado con la contraseña de la base de datos local; conviene reemplazarlo por un .env.example.
Ambiente de QA, CI y despliegue (A-16, A-19). Crear un perfil “qa” en docker-compose, configurar integración continua y definir el hosting y el plan de respaldo de la Fase 3.
Estimación y planificación de las HU nuevas. HU-14 a HU-19 tienen Story Points “Por estimar” y Sprint “Por asignar”. También faltan sus tareas TH en el Sprint backlog y en el Informe TEC, y las horas para el trabajo fuera de las HU (Docker, monorepo, pruebas y eventos Scrum) (A-14).
RACI (A-18). Se separaron R y A, pero el rebalanceo de la carga de Alonso (BD, web y móvil) es una decisión del equipo.
Privacidad (A-17). El Product Owner debe definir el plazo de retención del historial seudonimizado (RNF9), y conviene una revisión del cumplimiento de la Ley 21.719 antes del 01-12-2026.
Diagramas (I-09). No se editaron los diagramas (.png y .drawio). Falta actualizar el diagrama ER con las tablas y columnas nuevas, y el diagrama de secuencia “Generar Alerta” con los estados de HU-14.
HU “Could Have” de seguridad personal (A-21). No se crearon las HU de PIN de coacción, activación desde otro dispositivo, reporte de robo ni tutor como receptor de alertas: requieren una decisión del Product Owner.
Entrada vacía en esta bitácora. En la sección “1.2.1 Hoja de ruta del proyecto” hay una entrada “(07/10/2026)” sin texto. No se modificó porque es un registro del equipo.
