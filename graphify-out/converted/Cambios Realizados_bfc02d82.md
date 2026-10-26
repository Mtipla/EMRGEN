<!-- converted from Cambios Realizados.docx -->

Cambios Realizados
Integrantes: Alonso Gonzalez / Diego Plaza / Gabriel Valencia
# Errores Totales
| Categoría | Cantidad de errores | Errores no corregidos |
| --- | --- | --- |
| [ERR-01] Errores de tipeo | 7 | 0 |
| [ERR-02] Poca especificación en el texto | 16 | 2 |
| [ERR-03] Falta de información legal | 4 | 3 |
| [ERR-04] Errores relacionados a antecedentes médicos | 10 | 6 |
| [ERR-05] Errores técnicos | 10 | 2 |
| [ERR-06] Errores de historias de usuario | 54 | 1 |
| [ERR-07] Errores de APIs | 8 | 2 |
| [ERR-08] Errores de base de datos | 25 | 3 |
| [ERR-09] Errores de seguridad y control de acceso | 20 | 3 |
| [ERR-10] Errores de pruebas y trazabilidad (QA) | 15 | 15 |
| [ERR-11] Inconsistencias de alcance y catálogos entre documentos | 17 | 3 |
| [ERR-12] Errores de planificación (sprints, fechas y backlog) | 17 | 8 |
| [ERR-13] Errores de roles y responsabilidades | 9 | 1 |
| [ERR-14] Errores de presupuesto y cálculo | 3 | 0 |
| [ERR-15] Errores de control documental (versiones, índices, anexos y diagramas) | 7 | 4 |
| [ERR-16] Referencias a normas y estándares obsoletos | 2 | 1 |
| Total | 224 | 54 |

Observando la tabla de la totalidad de errores encontrados podemos destacar el enfoque de corrección, en esta ocasión consideramos realizar arreglos enfocados en mantener la coherencia de los datos encontrados, debido a que durante el transcurso del proyecto enfocándose en el código no fuimos actualizando las dependencias usadas, generando de esta manera muchos errores.

En la tabla mencionada se muestran las categorías de cada uno de estos tipos de errores pudiendo ser llevadas de errores leves hasta algunos que son críticos para el enfoque de la aplicación. De esta manera algunos pueden caer en 2 tipos de categorías realizando un efecto bola de nieve, el mejor ejemplo a mencionar es la “base de datos”, durante las fases preliminares del proyecto se comento el uso de MySQL para gestionar la base de datos, pero a la hora de usar docker nos resultó más conveniente “PostgreSQL”, pero este cambio de la base de datos no fue especificada en los documentos.

Las categorías de errores más básicos arreglados fueron los errores de tipeo, congruencia con versiones y herramientas, poca especificación y errores en tablas de cálculo. Consideramos que estos son leves ya que el tiempo de arreglo de estos es mínimo durante la corrección de estos.

Los errores más conflictivos fueron relacionados a las historias de usuario y visión del producto, ya que estos debían tener una revisión más minuciosa ya que estos pueden alterar el uso completo de la aplicación y varios documentos los cuales los mencionan, fueron llevados por la poca actualización de datos y poca especificaciones en usabilidad el producto final llevando a una incongruencia o falta de información relevante para la construcción de estos.

Hemos de mencionar que el apartado de seguridad tuvo que ser mejorado ya que como trabajamos con información delicada y la posibilidad de comprar una cuenta de un usuario principal puede llegar a varios tipos de problemas de corto o largo plazo, estos fueron llevados con bashear aquellos datos no relevantes y protección de los datos de los usuarios, a su vez con una especificación llevada por el usuario que no tenga que ser subida como un PDF como un antecedente médico del usuario.
# Anexo
datos_agrupados_trazable.docx 
Cambios Realizados (AUDITORIA CLAUDE).docx 
Matriz de verificación cruzada.xlsx