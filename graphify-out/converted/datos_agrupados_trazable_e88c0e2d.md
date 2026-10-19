<!-- converted from datos_agrupados_trazable.docx -->

Reporte de Auditoría de Errores
Proyecto Emergen · Fuente: Cambios Realizados en Documentación · Generado el 13/10/2026
Criterio de conteo: cada entrada de la bitácora cuenta como un error en el documento donde se corrigió (una misma corrección replicada en dos documentos cuenta dos veces). Se incluyen 12 hallazgos aún no resueltos de la sección “Cambios Pendientes”, marcados como [Pendiente]. Las primeras ocho categorías son las solicitadas; las demás se crearon para hallazgos que no encajaban en ellas. Recuento reconciliado el 17/10/2026: 224 sub-IDs únicos en el detalle; encabezados y resumen se igualaron a ese valor. Reconciliación del 17/10/2026: 224 sub-IDs únicos revisados. Corregido y verificado: 54; pendiente de validación: 116; pendiente: 54. La tabla «Estado reconciliado por ID» al final del documento registra el estado de cada uno. Nota (verificación cruzada del 17/10/2026): la tabla «Estado reconciliado por ID» no existe en este documento (solo contiene el resumen cuantitativo y el Anexo). Al contrastar los 224 sub-IDs con los archivos del proyecto: 75 verificados, 4 parciales, 131 no aplicados, 2 no determinables y 12 pendientes de Cambios Pendientes. El estado y la evidencia de cada sub-ID están en _verificacion_2026-10-17/Matriz de verificación cruzada.xlsx.
Convención de trazabilidad: cada categoría es un bloque con ID [ERR-NN] y cada error tiene un sub-ID [ERR-NN.MM]. Cada error remite, al final de su línea y en la sección «Trazabilidad de resolución» de su bloque, a la acción registrada en «Cambios Realizados (AUDITORIA CLAUDE)» mediante un ID [AUDIT-NNN] (numeración correlativa según el orden de aparición de las entradas de esa bitácora: 208 acciones). Los hallazgos no resueltos remiten a [AUDIT-P01] a [AUDIT-P12] (sección «Cambios Pendientes») y la nota final de la bitácora es [AUDIT-P13]. El Anexo lista cada ID con su documento, fecha, hallazgo y errores vinculados. Para enlazar: seleccione el ID [AUDIT-…] e inserte un hipervínculo (Ctrl+K) o un chip con «@» hacia el documento de auditoría.
# Resumen cuantitativo
# Detalle de errores por categoría
## [ERR-01] Errores de tipeo (7)
[ERR-01.01] 1.2.1 Hoja de ruta del proyecto: [AUDIT-007]
[ERR-01.02] 1.2.2 Sprint-fase1: El periodo del Sprint 3 estaba copiado del Sprint 4 (31-08 al 14-09 en vez de 24 al 28-08).  [AUDIT-031]
[ERR-01.03] 1.2.3 Sprint-fase2: Daily Scrum del Sprint 5 con el mes equivocado (agosto en vez de septiembre).  [AUDIT-033]
[ERR-01.04] 1.2.3 Sprint-fase2: Daily Scrum del Sprint 6 con el mes equivocado (agosto en vez de septiembre) y sin separador entre meses.  [AUDIT-034]
[ERR-01.05] 1.2.3 Sprint-fase2: Hito académico del Sprint 6 copiado del Sprint 5 (jueves 24), fecha anterior al inicio del sprint.  [AUDIT-035]
[ERR-01.06] 2.1.1 PRODUCT BACKLOG: Errata 'Depecencia' en las dependencias de las TD (que además usaban IDs antiguos F1-xx).  [AUDIT-079]
[ERR-01.07] Especificación de Herramientas y Servicios del Proyecto: Se anunciaban 4 servicios externos de APIs, pero se listan[AUDIT-204]
### Trazabilidad de resolución [ERR-01]
[ERR-01.01] Resolución documentada en: [AUDIT-007]
[ERR-01.02] Resolución documentada en: [AUDIT-031] - Sprint-fase1: periodo del Sprint 3 (24 al 28 de agosto) (confirmado por el usuario el 17/10/2026)
[ERR-01.03] Resolución documentada en: [AUDIT-033] - Sprint-fase2: Daily Scrum del Sprint 5 (mes de septiembre) (confirmado por el usuario el 17/10/2026)
[ERR-01.04] Resolución documentada en: [AUDIT-034] - Sprint-fase2: Daily Scrum del Sprint 6 (meses y separador) (confirmado por el usuario el 17/10/2026)
[ERR-01.05] Resolución documentada en: [AUDIT-035] - Sprint-fase2: Hito académico del Sprint 6 (1 y 8 de octubre) (confirmado por el usuario el 17/10/2026)
[ERR-01.06] Resolución documentada en: [AUDIT-079] - Product Backlog: dependencias TD-xx y errata 'Dependencia'
[ERR-01.07] Resolución documentada en: [AUDIT-204] - Especificación 4.2: 5 servicios externos de APIs (no 4)
## [ERR-02] Poca especificación en el texto (16)
[ERR-02.01] Acta de constitución: [AUDIT-038]
[ERR-02.02] Acta de constitución: [AUDIT-040]
[ERR-02.03] Acta de constitución: [AUDIT-041]
[ERR-02.04] Acta de constitución: RF5 no era verificable ('a gusto del usuario') y la activación en segundo plano no es factible solo con Capacitor.  [AUDIT-043]
[ERR-02.05] Acta de constitución: [AUDIT-044]
[ERR-02.06] Acta de constitución: [AUDIT-049]
[ERR-02.07] Informe ERS: RF3 mencionaba el rol 'empleados', que no estaba definido en el sistema.  [AUDIT-055]
[ERR-02.08] Informe ERS: RF5 no era verificable ('a gusto del usuario') y la activación en segundo plano no es factible solo con Capacitor.  [AUDIT-057]
[ERR-02.09] Informe ERS: RF7 ambiguo: no aclaraba si el límite de 5 contactos era por usuario o por cuenta familiar.  [AUDIT-058]
[ERR-02.10] Informe ERS: RF25 no era verificable ('soporte de usuario externo').  [AUDIT-063]
[ERR-02.11] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-129]
[ERR-02.12] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-130]
[ERR-02.13] Matriz de trazabilidad de Pruebas: CP-RNF4-01 usaba el rol 'empleado', inexistente (corresponde a SOPORTE).  [AUDIT-167]
[ERR-02.14] CRITERIOS DE ACEPTACIÓN: CA-03.1 exigía un teléfono 'estrictamente numérico' (impedía +56) y validar que 'no existe' (no verificable).  [AUDIT-172]
[ERR-02.15] CRITERIOS DE ACEPTACIÓN: La longitud del mensaje tenía tres comportamientos distintos (truncar a 160, bloquear con contador y columna de 200).  [AUDIT-173]
[ERR-02.16] CRITERIOS DE ACEPTACIÓN: CA-08.1 exigía envío exitoso a la totalidad de los contactos, algo que depende del proveedor y no es verificable.  [AUDIT-174]
### Trazabilidad de resolución [ERR-02]
[ERR-02.01] Resolución documentada en: [AUDIT-038] - Acta: Indicador de Alcance con método de medición
[ERR-02.02] Resolución documentada en: [AUDIT-040]
[ERR-02.03] Resolución documentada en: [AUDIT-041]
[ERR-02.04] Resolución documentada en: [AUDIT-043] - Acta: RF5 con mínimo verificable (pulsación de 5 s en el perfil predeterminado) y Could Have (confirmado por el usuario el 17/10/2026)
[ERR-02.05] Resolución documentada en: [AUDIT-044] - Acta: RF7, límite de 5 contactos por usuario
[ERR-02.06] Resolución documentada en: [AUDIT-049] - Acta: RF25, nivel de acceso de apadrinados y asistencia de SOPORTE
[ERR-02.07] Resolución documentada en: [AUDIT-055]
[ERR-02.08] Resolución documentada en: [AUDIT-057] - ERS: RF5 con mínimo verificable (pulsación de 5 s en el perfil predeterminado) y Could Have (confirmado por el usuario el 17/10/2026)
[ERR-02.09] Resolución documentada en: [AUDIT-058] - ERS: RF7, límite de 5 contactos por usuario
[ERR-02.10] Resolución documentada en: [AUDIT-063] - ERS: RF25, nivel de acceso de apadrinados y asistencia de SOPORTE
[ERR-02.11] Pendiente, registrado en: [AUDIT-129] - Pendiente: el texto original de CA-03.1 sigue en la Tabla Maestra (hoja «Criterio de aceptacion», celda C5); no se ha corregido (verificado el 17/10/2026)
[ERR-02.12] Pendiente, registrado en: [AUDIT-130] - Pendiente: el texto original de CA-08.1 sigue en la Tabla Maestra (hoja «Criterio de aceptacion», celda C11); no se ha corregido (verificado el 17/10/2026)
[ERR-02.13] Resolución documentada en: [AUDIT-167] - Matriz de pruebas: CP-RBAC-001 con rol SOPORTE
[ERR-02.14] Resolución documentada en: [AUDIT-172] - Criterios de aceptación: CA-03.1, teléfono en formato E.164
[ERR-02.15] Resolución documentada en: [AUDIT-173] - Criterios de aceptación: CA-05.1, mensaje de 160 caracteres validado en front y back
[ERR-02.16] Resolución documentada en: [AUDIT-174] - Criterios de aceptación: CA-08.1, intento de envío registrado por contacto
## [ERR-03] Falta de información legal (4)
[ERR-03.01] Acta de constitución: Faltaban RNF sobre cumplimiento de la Ley 21.719 y retención/supresión de datos (además de latencia, disponibilidad y accesibilidad); solo existían RNF1–RNF5.  [AUDIT-051]
[ERR-03.02] Informe ERS: [AUDIT-065]
[ERR-03.03] 2.1.1 PRODUCT BACKLOG: [AUDIT-091]
[ERR-03.04] [Pendiente] Cambios Pendientes: [AUDIT-P10]
### Trazabilidad de resolución [ERR-03]
[ERR-03.01] Resolución documentada en: [AUDIT-051] - Acta: nuevos RNF6 a RNF10 (latencia, tolerancia a fallos, Ley 21.719, retención, accesibilidad)
[ERR-03.02] Resolución documentada en: [AUDIT-065] - ERS: nuevos RNF6 a RNF10
[ERR-03.03] Resolución documentada en: [AUDIT-091] - Product Backlog: HU-11 con consentimiento explícito (Ley 21.719)
[ERR-03.04] Pendiente de resolución, registrado en: [AUDIT-P10] - Pendiente: plazo de retención (RNF9) y revisión de la Ley 21.719
## [ERR-04] Errores relacionados a antecedentes médicos (10)
[ERR-04.01] BDD con tipos de datos: [AUDIT-015]
[ERR-04.02] BDD con tipos de datos: [AUDIT-016]
[ERR-04.03] 2.1.1 PRODUCT BACKLOG: [AUDIT-092]
[ERR-04.04] 2.1.1 PRODUCT BACKLOG: [AUDIT-093]
[ERR-04.05] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-132]
[ERR-04.06] Historias Usuario con instructivo: [AUDIT-148]
[ERR-04.07] Historias Usuario con instructivo: [AUDIT-149]
[ERR-04.08] CRITERIOS DE ACEPTACIÓN: [AUDIT-176]
[ERR-04.09] BDD con tipos de datos: [AUDIT-185]
[ERR-04.10] BDD con tipos de datos: [AUDIT-191]
### Trazabilidad de resolución [ERR-04]
[ERR-04.01] Resolución documentada en: [AUDIT-015] - BDD: nueva tabla ANTECEDENTE_MEDICO
[ERR-04.02] Resolución documentada en: [AUDIT-016] - BDD: FK antecedente_medico_ID en DETALLE_ALERTA
[ERR-04.03] Resolución documentada en: [AUDIT-092] - Product Backlog: HU-12 revoca el acceso al cerrarse la emergencia (HU-14)
[ERR-04.04] Resolución documentada en: [AUDIT-093] - Product Backlog: el SOS nunca se bloquea por falta de ficha médica
[ERR-04.05] Resolución documentada en: [AUDIT-132] - Tabla Maestra: CA-12.1, revocación cuando la emergencia deja de estar ACTIVA
[ERR-04.06] Resolución documentada en: [AUDIT-148] - HU con instructivo: HU-11 con ficha médica cifrada y consentimiento
[ERR-04.07] Resolución documentada en: [AUDIT-149] - HU con instructivo: HU-12 con SOS sin ficha y enlace con emergencia cerrada
[ERR-04.08] Resolución documentada en: [AUDIT-176] - Criterios de aceptación: CA-12.1, revocación cuando la emergencia deja de estar ACTIVA
[ERR-04.09] Resolución documentada en: [AUDIT-185] - BDD: ANTECEDENTE_MEDICO con cifrado, IV, versión de llave y consentimiento
[ERR-04.10] Resolución documentada en: [AUDIT-191] - BDD: nueva tabla ENLACE_MEDICO
## [ERR-05] Errores técnicos (10)
[ERR-05.01] Acta de constitución: Se indicaba JavaScript como lenguaje de desarrollo en lugar de TypeScript.  [AUDIT-002]
[ERR-05.02] Acta de constitución: Especificaciones técnicas mencionaban 'React/Angular' en vez de React.  [AUDIT-003]
[ERR-05.03] Especificación de Herramientas y Servicios: Faltaba el punto Entorno de Ejecución (contenedor con Docker Desktop).  [AUDIT-009]
[ERR-05.04] Horas hombre en relación a Tareas: Tarea TH-1.3 con framework sin decidir ('React/Angular') en lugar de React + Ionic.  [AUDIT-074]
[ERR-05.05] Sprint backlog actividades horas: Tarea TH-1.3 con framework sin decidir ('React/Angular') en lugar de React + Ionic.  [AUDIT-136]
[ERR-05.06] Especificación de Herramientas y Servicios del Proyecto: Se especificaba 'React/Angular' sin decidir el framework (el repositorio usa React 19 con Ionic React).  [AUDIT-198]
[ERR-05.07] Especificación de Herramientas y Servicios del Proyecto: No se documentaba la versión de Turborepo ni los workspaces del monorepo.  [AUDIT-201]
[ERR-05.08] Especificación de Herramientas y Servicios del Proyecto: [AUDIT-203]
[ERR-05.09] [Pendiente] Cambios Pendientes: [AUDIT-P06]
[ERR-05.10] [Pendiente] Cambios Pendientes: [AUDIT-P07]
### Trazabilidad de resolución [ERR-05]
[ERR-05.01] Resolución documentada en: [AUDIT-002]
[ERR-05.02] Resolución documentada en: [AUDIT-003] - Acta: 'React/Angular' unificado a React
[ERR-05.03] Resolución documentada en: [AUDIT-009] - Especificación de Herramientas: PostgreSQL y punto Entorno de Ejecución (Docker)
[ERR-05.04] Resolución documentada en: [AUDIT-074] - Horas hombre: TH-1.3 con React + Ionic
[ERR-05.05] Resolución documentada en: [AUDIT-136] - Sprint backlog horas: TH-1.3 con React + Ionic
[ERR-05.06] Resolución documentada en: [AUDIT-198] - Especificación 4.2: React 19 con Ionic React
[ERR-05.07] Resolución documentada en: [AUDIT-201] - Especificación 4.2: Turborepo 2.11 y workspaces
[ERR-05.08] Resolución documentada en: [AUDIT-203] - Especificación 4.2: versiones y herramientas de calidad
[ERR-05.09] Pendiente de resolución, registrado en: [AUDIT-P06] - Pendiente: ecosistema del monorepo (Dockerfile, packageManager, turbo.json, .env)
[ERR-05.10] Pendiente de resolución, registrado en: [AUDIT-P07] - Pendiente: perfil 'qa', integración continua y hosting/respaldo de la Fase 3
## [ERR-06] Errores de historias de usuario (54)
[ERR-06.01] 1.2.1 Hoja de ruta del proyecto: Se indicaban 8 HU en el MVP; faltaba HU-14 (finalizar/cancelar emergencia), por lo que son 9.  [AUDIT-021]
[ERR-06.02] 1.2.1 Hoja de ruta del proyecto: [AUDIT-022]
[ERR-06.03] 1.2.1 Hoja de ruta del proyecto: Conteo 'Historias MVP: 8 HUs' desactualizado tras incorporar HU-14.  [AUDIT-023]
[ERR-06.04] 2.1.1 PRODUCT BACKLOG: [AUDIT-082]
[ERR-06.05] 2.1.1 PRODUCT BACKLOG: Faltaba la feature F05.3 (finalización, cancelación y expiración de la emergencia).  [AUDIT-083]
[ERR-06.06] 2.1.1 PRODUCT BACKLOG: Faltaba la feature F07.3 (adquisición de planes y cupos para apadrinados).  [AUDIT-084]
[ERR-06.07] 2.1.1 PRODUCT BACKLOG: Faltaba la feature F09.3 (solicitudes de soporte desde la web).  [AUDIT-085]
[ERR-06.08] 2.1.1 PRODUCT BACKLOG: HU-06 usaba el estado 'En Emergencia Active' (uno de cuatro nombres distintos), sin idempotencia ni límite de una alerta activa.  [AUDIT-086]
[ERR-06.09] 2.1.1 PRODUCT BACKLOG: HU-08 no registraba el estado del envío por cada contacto (fallo parcial del despacho).  [AUDIT-087]
[ERR-06.10] 2.1.1 PRODUCT BACKLOG: HU-09 no derivaba a la compra de cupos cuando la cuenta principal no tenía cupos disponibles.  [AUDIT-088]
[ERR-06.11] 2.1.1 PRODUCT BACKLOG: [AUDIT-090]
[ERR-06.12] 2.1.1 PRODUCT BACKLOG: HU-13 mostraba estados de cuenta ('Activa, Bloqueada, En Emergencia') que no coinciden con el catálogo ESTADO_USUARIO.  [AUDIT-094]
[ERR-06.13] 2.1.1 PRODUCT BACKLOG: [AUDIT-096]
[ERR-06.14] 2.1.1 PRODUCT BACKLOG: [AUDIT-097]
[ERR-06.15] 2.1.1 PRODUCT BACKLOG: [AUDIT-098]
[ERR-06.16] 2.1.1 PRODUCT BACKLOG: [AUDIT-099]
[ERR-06.17] 2.1.1 PRODUCT BACKLOG: [AUDIT-100]
[ERR-06.18] 2.1.1 PRODUCT BACKLOG: [AUDIT-101]
[ERR-06.19] 2.1.1 PRODUCT BACKLOG: [AUDIT-102]
[ERR-06.20] 2.1.1 PRODUCT BACKLOG: [AUDIT-107]
[ERR-06.21] 2.1.1 PRODUCT BACKLOG: [AUDIT-108]
[ERR-06.22] 2.1.1 PRODUCT BACKLOG: [AUDIT-109]
[ERR-06.23] 2.1.1 PRODUCT BACKLOG: [AUDIT-110]
[ERR-06.24] 2.1.1 PRODUCT BACKLOG: [AUDIT-113]
[ERR-06.25] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-116]
[ERR-06.26] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-117]
[ERR-06.27] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-118]
[ERR-06.28] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-119]
[ERR-06.29] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-120]
[ERR-06.30] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-121]
[ERR-06.31] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-122]
[ERR-06.32] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-126]
[ERR-06.33] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-127]
[ERR-06.34] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-134]
[ERR-06.35] Product backlog puntos historia: [AUDIT-135]
[ERR-06.36] Épicas e Historias de Usuario: [AUDIT-137]
[ERR-06.37] Épicas e Historias de Usuario: [AUDIT-138]
[ERR-06.38] Épicas e Historias de Usuario: [AUDIT-139]
[ERR-06.39] Épicas e Historias de Usuario: [AUDIT-140]
[ERR-06.40] Épicas e Historias de Usuario: [AUDIT-141]
[ERR-06.41] Épicas e Historias de Usuario: [AUDIT-142]
[ERR-06.42] Historias Usuario con instructivo: [AUDIT-143]
[ERR-06.43] Historias Usuario con instructivo: [AUDIT-144]
[ERR-06.44] Historias Usuario con instructivo: [AUDIT-145]
[ERR-06.45] Historias Usuario con instructivo: [AUDIT-146]
[ERR-06.46] Historias Usuario con instructivo: [AUDIT-150]
[ERR-06.47] Historias Usuario con instructivo: [AUDIT-151]
[ERR-06.48] Historias Usuario con instructivo: [AUDIT-152]
[ERR-06.49] Historias Usuario con instructivo: [AUDIT-153]
[ERR-06.50] Historias Usuario con instructivo: [AUDIT-154]
[ERR-06.51] Historias Usuario con instructivo: [AUDIT-155]
[ERR-06.52] Historias Usuario con instructivo: [AUDIT-156]
[ERR-06.53] CRITERIOS DE ACEPTACIÓN: [AUDIT-178]
[ERR-06.54] [Pendiente] Cambios Pendientes: [AUDIT-P12]
### Trazabilidad de resolución [ERR-06]
[ERR-06.01] Resolución documentada en: [AUDIT-021] - Hoja de ruta: enfoque prioritario con 9 HU del MVP (se suma HU-14)
[ERR-06.02] Pendiente, registrado en: [AUDIT-022] - Hoja de ruta: total de 19 HU (13 originales + 6 nuevas) (pendiente: el total de historias sigue en 13)
[ERR-06.03] Resolución documentada en: [AUDIT-023] - Hoja de ruta: 'Historias MVP' de 8 a 9 HU
[ERR-06.04] Resolución documentada en: [AUDIT-082] - Product Backlog: nueva feature F04.3 (números oficiales)
[ERR-06.05] Resolución documentada en: [AUDIT-083] - Product Backlog: nueva feature F05.3 (cierre de la emergencia)
[ERR-06.06] Resolución documentada en: [AUDIT-084] - Product Backlog: nueva feature F07.3 (planes y cupos)
[ERR-06.07] Resolución documentada en: [AUDIT-085] - Product Backlog: nueva feature F09.3 (solicitudes de soporte)
[ERR-06.08] Resolución documentada en: [AUDIT-086] - Product Backlog: HU-06 con alerta ACTIVA, idempotencia y una alerta activa por usuario
[ERR-06.09] Resolución documentada en: [AUDIT-087] - Product Backlog: HU-08 con estado de envío por contacto
[ERR-06.10] Resolución documentada en: [AUDIT-088] - Product Backlog: HU-09 deriva a compra de cupos (HU-16)
[ERR-06.11] Resolución documentada en: [AUDIT-090] - Product Backlog: HU-10 con PIN al elegir perfil (RF23) y niveles de acceso
[ERR-06.12] Resolución documentada en: [AUDIT-094] - Product Backlog: HU-13 con estados del catálogo ESTADO_USUARIO
[ERR-06.13] Resolución documentada en: [AUDIT-096] - Product Backlog: HU-13 con mínimo privilegio y auditoría
[ERR-06.14] Resolución documentada en: [AUDIT-097] - Product Backlog: nueva HU-14 Finalizar o Cancelar Emergencia
[ERR-06.15] Resolución documentada en: [AUDIT-098] - Product Backlog: nueva HU-15 Gestionar Perfil y Credenciales
[ERR-06.16] Resolución documentada en: [AUDIT-099] - Product Backlog: nueva HU-16 Adquirir Plan o Cupos
[ERR-06.17] Resolución documentada en: [AUDIT-100] - Product Backlog: nueva HU-17 Consultar Números Oficiales
[ERR-06.18] Resolución documentada en: [AUDIT-101] - Product Backlog: nueva HU-18 Enviar Solicitud de Soporte
[ERR-06.19] Resolución documentada en: [AUDIT-102] - Product Backlog: nueva HU-19 Generar Informe Personal
[ERR-06.20] Resolución documentada en: [AUDIT-107] - Product Backlog: Story Points de HU-10 = 5
[ERR-06.21] Resolución documentada en: [AUDIT-108] - Product Backlog: Story Points de HU-09 = 3
[ERR-06.22] Resolución documentada en: [AUDIT-109] - Product Backlog: HU-12 con 4 SP y dependencia de HU-14
[ERR-06.23] Resolución documentada en: [AUDIT-110] - Product Backlog: HU-14 a HU-19 en el Sprint Planning de la Fase 2
[ERR-06.24] Resolución documentada en: [AUDIT-113] - Product Backlog: enfoque MVP con 9 HU (HU-01 a HU-08 y HU-14)
[ERR-06.25] Resolución documentada en: [AUDIT-116] - Tabla Maestra: features de HU-01 y HU-02 descruzadas
[ERR-06.26] Resolución documentada en: [AUDIT-117] - Tabla Maestra: HU-09 depende de HU-02 y HU-10
[ERR-06.27] Resolución documentada en: [AUDIT-118] - Tabla Maestra: HU-10 depende de HU-02
[ERR-06.28] Resolución documentada en: [AUDIT-119] - Tabla Maestra: HU-11 depende de HU-02 y HU-10
[ERR-06.29] Resolución documentada en: [AUDIT-120] - Tabla Maestra: HU-12 depende de HU-06, HU-08, HU-11 y HU-14
[ERR-06.30] Resolución documentada en: [AUDIT-121] - Tabla Maestra: HU-13 depende de HU-02
[ERR-06.31] Resolución documentada en: [AUDIT-122] - Tabla Maestra: hoja Fase_2 con HU-14 a HU-19
[ERR-06.32] Resolución documentada en: [AUDIT-126] - Tabla Maestra: features F04.3, F05.3, F07.3 y F09.3
[ERR-06.33] Resolución documentada en: [AUDIT-127] - Tabla Maestra: hoja 'Historia de usuario' con HU-14 a HU-19
[ERR-06.34] Resolución documentada en: [AUDIT-134] - Tabla Maestra: criterios CA-14.1 a CA-19.1
[ERR-06.35] Resolución documentada en: [AUDIT-135] - Product backlog puntos historia: HU-14 a HU-19 'Por estimar'
[ERR-06.36] Resolución documentada en: [AUDIT-137] - Épicas e HU: MoSCoW de EP-01 a Must Have
[ERR-06.37] Resolución documentada en: [AUDIT-138] - Épicas e HU: MoSCoW de EP-02 a Must Have
[ERR-06.38] Resolución documentada en: [AUDIT-139] - Épicas e HU: MoSCoW de EP-08 a Should Have
[ERR-06.39] Resolución documentada en: [AUDIT-140] - Épicas e HU: HU-01 asociada a EP-02
[ERR-06.40] Resolución documentada en: [AUDIT-141] - Épicas e HU: HU-02 asociada a EP-01
[ERR-06.41] Resolución documentada en: [AUDIT-142] - Épicas e HU: tabla con HU-14 a HU-19
[ERR-06.42] Resolución documentada en: [AUDIT-143] - HU con instructivo: identificadores EP/HU de HU-01 y HU-02
[ERR-06.43] Resolución documentada en: [AUDIT-144] - HU con instructivo: HU-02 Esc. 1 (redacción y PIN solo con apadrinados)
[ERR-06.44] Resolución documentada en: [AUDIT-145] - HU con instructivo: HU-06 con ubicación actual y sin SMS automático
[ERR-06.45] Resolución documentada en: [AUDIT-146] - HU con instructivo: HU-09 con vinculación, cupos y PIN
[ERR-06.46] Resolución documentada en: [AUDIT-150] - HU con instructivo: HU-13 sin CRUD total (mínimo privilegio)
[ERR-06.47] Resolución documentada en: [AUDIT-151] - HU con instructivo: escenarios Gherkin de HU-14
[ERR-06.48] Resolución documentada en: [AUDIT-152] - HU con instructivo: escenarios Gherkin de HU-15
[ERR-06.49] Resolución documentada en: [AUDIT-153] - HU con instructivo: escenarios Gherkin de HU-16
[ERR-06.50] Resolución documentada en: [AUDIT-154] - HU con instructivo: escenarios Gherkin de HU-17
[ERR-06.51] Resolución documentada en: [AUDIT-155] - HU con instructivo: escenarios Gherkin de HU-18
[ERR-06.52] Resolución documentada en: [AUDIT-156] - HU con instructivo: escenarios Gherkin de HU-19
[ERR-06.53] Resolución documentada en: [AUDIT-178] - Criterios de aceptación: criterios CA-14.1 a CA-19.1
[ERR-06.54] Pendiente de resolución, registrado en: [AUDIT-P12] - Pendiente: HU 'Could Have' de seguridad personal (decisión del PO)
## [ERR-07] Errores de APIs (8)
[ERR-07.01] Especificación de Herramientas y Servicios: [AUDIT-010]
[ERR-07.02] Especificación de Herramientas y Servicios: [AUDIT-010]
[ERR-07.03] Diagrama de Componentes: [AUDIT-011]
[ERR-07.04] Diagrama de Arquitectura: [AUDIT-012]
[ERR-07.05] Diagrama de Arquitectura: [AUDIT-012]
[ERR-07.06] Especificación de Herramientas y Servicios del Proyecto: [AUDIT-205]
[ERR-07.07] Especificación de Herramientas y Servicios del Proyecto: [AUDIT-208]
[ERR-07.08] [Pendiente] Cambios Pendientes: [AUDIT-P01]
### Trazabilidad de resolución [ERR-07]
[ERR-07.01] Resolución documentada en: [AUDIT-010]
[ERR-07.02] Resolución documentada en: [AUDIT-010]
[ERR-07.03] Resolución documentada en: [AUDIT-011] - Diagrama de Componentes: servicio duplicado y servicios Mensajería y Conversión de Divisas
[ERR-07.04] Resolución documentada en: [AUDIT-012]
[ERR-07.05] Resolución documentada en: [AUDIT-012]
[ERR-07.06] Resolución documentada en: [AUDIT-205] - Especificación 4.2: módulos reales de la API REST del backend
[ERR-07.07] Resolución documentada en: [AUDIT-208] - Especificación 4.2: Google Maps como geocodificación (no captura)
[ERR-07.08] Pendiente de resolución, registrado en: [AUDIT-P01] - Pendiente: canal y proveedor de despacho de alertas
## [ERR-08] Errores de base de datos (25)
[ERR-08.01] Acta de constitución: [AUDIT-001]
[ERR-08.02] Acta de constitución: [AUDIT-002]
[ERR-08.03] Especificación de Herramientas y Servicios: [AUDIT-009]
[ERR-08.04] Diagrama de Arquitectura: [AUDIT-013]
[ERR-08.05] BDD con tipos de datos: [AUDIT-014]
[ERR-08.06] BDD con tipos de datos: [AUDIT-017]
[ERR-08.07] BDD con tipos de datos: [AUDIT-179]
[ERR-08.08] BDD con tipos de datos: [AUDIT-180]
[ERR-08.09] BDD con tipos de datos: [AUDIT-181]
[ERR-08.10] BDD con tipos de datos: [AUDIT-182]
[ERR-08.11] BDD con tipos de datos: [AUDIT-183]
[ERR-08.12] BDD con tipos de datos: [AUDIT-184]
[ERR-08.13] BDD con tipos de datos: [AUDIT-186]
[ERR-08.14] BDD con tipos de datos: [AUDIT-187]
[ERR-08.15] BDD con tipos de datos: [AUDIT-188]
[ERR-08.16] BDD con tipos de datos: [AUDIT-189]
[ERR-08.17] BDD con tipos de datos: [AUDIT-190]
[ERR-08.18] BDD con tipos de datos: [AUDIT-192]
[ERR-08.19] BDD con tipos de datos: [AUDIT-193]
[ERR-08.20] BDD con tipos de datos: [AUDIT-194]
[ERR-08.21] BDD con tipos de datos: [AUDIT-195]
[ERR-08.22] BDD con tipos de datos: [AUDIT-196]
[ERR-08.23] BDD con tipos de datos: [AUDIT-197]
[ERR-08.24] Especificación de Herramientas y Servicios del Proyecto: [AUDIT-202]
[ERR-08.25] [Pendiente] Cambios Pendientes: [AUDIT-P02]
### Trazabilidad de resolución [ERR-08]
[ERR-08.01] Resolución documentada en: [AUDIT-001] - Acta: MySQL reemplazado por Docker Desktop + PostgreSQL
[ERR-08.02] Resolución documentada en: [AUDIT-002]
[ERR-08.03] Resolución documentada en: [AUDIT-009] - Especificación de Herramientas: PostgreSQL y punto Entorno de Ejecución (Docker)
[ERR-08.04] Resolución documentada en: [AUDIT-013]
[ERR-08.05] Pendiente de resolución, registrado en: [AUDIT-014] - BDD: tabla PLAN sin total_venta ni fecha_venta; aún presente en init.sql y en el diccionario (verificado 18/10/2026)
[ERR-08.06] Resolución documentada en: [AUDIT-017] - BDD: todos los tipos de datos adaptados de MySQL a PostgreSQL (verificado 18/10/2026: ALERTAS y PROPUESTA DE MEJORA convertidas)
[ERR-08.07] Resolución documentada en: [AUDIT-179] - BDD: USUARIO.contra_usuario varchar(255)
[ERR-08.08] Resolución documentada en: [AUDIT-180] - BDD: columnas de USUARIO pasan a NULL (PIN, suscripción, mensaje, prioridad)
[ERR-08.09] Resolución documentada en: [AUDIT-181] - BDD: catálogo cerrado de roles en ROL (1 ADMINISTRADOR, 2 SOPORTE, 3 USUARIO, según código); verificado 18/10/2026
[ERR-08.10] Pendiente de resolución, registrado en: [AUDIT-182] - BDD: PRIORIDAD sin valores; falta definir la lista de tipos de emergencia (no está en código ni documentos)
[ERR-08.11] Parcial, registrado en: [AUDIT-183] - BDD: PIN varchar(4) aplicado; pin_hash / intentos_fallidos pendientes
[ERR-08.12] Parcial, registrado en: [AUDIT-184] - BDD: num_emergencia VARCHAR(16) en E.164 y nombre/parentesco en el diccionario; init.sql pendiente
[ERR-08.13] Pendiente de resolución, registrado en: [AUDIT-186] - BDD: ALERTA con estado, idempotencia y timestamps; no presente en init.sql ni en el diccionario
[ERR-08.14] Parcial, registrado en: [AUDIT-187] - BDD: UBICACION_ALERTA con coordenadas, precisión, fuente y hora (diccionario con tipos propuestos; init.sql pendiente)
[ERR-08.15] Pendiente de resolución, registrado en: [AUDIT-188] - BDD: HISTORIAL_ALERTA con transiciones de estado; no presente en init.sql ni en el diccionario
[ERR-08.16] Pendiente de resolución, registrado en: [AUDIT-189] - BDD: DETALLE_ALERTA.texto_mensaje (copia del mensaje) no presente en init.sql ni en el diccionario
[ERR-08.17] Pendiente de resolución, registrado en: [AUDIT-190] - BDD: nueva tabla ENVIO_ALERTA (no presente en hojas activas ni en init.sql)
[ERR-08.18] Resolución documentada en: [AUDIT-192] - BDD: NOTIFICACION_MOVIL.fecha_envio a timestamptz
[ERR-08.19] Resolución documentada en: [AUDIT-193] - BDD: VENTA / DETALLE_VENTA alineadas con init.sql
[ERR-08.20] Pendiente de resolución, registrado en: [AUDIT-194] - BDD: PLAN sin total_venta / fecha_venta y FK en PLAN_USUARIO; aún presente en init.sql (PLAN L112-113; PLAN_USUARIO sin FK) (verificado 18/10/2026)
[ERR-08.21] Parcial, registrado en: [AUDIT-195] - BDD: notas de responsabilidad pendientes en SOPORTE y CONTACTO; tipos varchar pendientes de normalizar
[ERR-08.22] Resolución documentada en: [AUDIT-196] - BDD: BITACORA_SISTEMA.accion_realizada y fecha con hora
[ERR-08.23] Resolución documentada en: [AUDIT-197] - BDD: hoja 'ANEXO FUERA DE ALCANCE' (renombrada desde PROPUESTA DE MEJORA, 18/10/2026)
[ERR-08.24] Resolución documentada en: [AUDIT-202] - Especificación 4.2: PostgreSQL, init.sql (30 tablas) y TypeORM
[ERR-08.25] Pendiente de resolución, registrado en: [AUDIT-P02] - Pendiente: migración del esquema a init.sql y TypeORM
## [ERR-09] Errores de seguridad y control de acceso (20)
[ERR-09.01] Acta de constitución: [AUDIT-048]
[ERR-09.02] Acta de constitución: [AUDIT-050]
[ERR-09.03] Informe ERS: [AUDIT-062]
[ERR-09.04] Informe ERS: [AUDIT-064]
[ERR-09.05] 2.1.1 PRODUCT BACKLOG: [AUDIT-089]
[ERR-09.06] 2.1.1 PRODUCT BACKLOG: [AUDIT-095]
[ERR-09.07] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-128]
[ERR-09.08] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-131]
[ERR-09.09] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-133]
[ERR-09.10] Historias Usuario con instructivo: [AUDIT-147]
[ERR-09.11] CRITERIOS DE ACEPTACIÓN: [AUDIT-171]
[ERR-09.12] CRITERIOS DE ACEPTACIÓN: [AUDIT-175]
[ERR-09.13] CRITERIOS DE ACEPTACIÓN: [AUDIT-177]
[ERR-09.14] Especificación de Herramientas y Servicios del Proyecto: [AUDIT-199]
[ERR-09.15] Especificación de Herramientas y Servicios del Proyecto: [AUDIT-200]
[ERR-09.16] Especificación de Herramientas y Servicios del Proyecto: [AUDIT-206]
[ERR-09.17] Especificación de Herramientas y Servicios del Proyecto: [AUDIT-207]
[ERR-09.18] [Pendiente] Cambios Pendientes: [AUDIT-P03]
[ERR-09.19] [Pendiente] Cambios Pendientes: [AUDIT-P04]
[ERR-09.20] [Pendiente] Cambios Pendientes: [AUDIT-P05]
### Trazabilidad de resolución [ERR-09]
[ERR-09.01] Resolución documentada en: [AUDIT-048] - Acta: RF20, escritorio solo a través de la API del backend
[ERR-09.02] Resolución documentada en: [AUDIT-050] - Acta: RNF4, autorización por rol y por propiedad (anti-IDOR)
[ERR-09.03] Resolución documentada en: [AUDIT-062] - ERS: RF20, escritorio solo a través de la API del backend
[ERR-09.04] Resolución documentada en: [AUDIT-064] - ERS: RNF4, autorización por rol y por propiedad (anti-IDOR)
[ERR-09.05] Resolución documentada en: [AUDIT-089] - Product Backlog: HU-10 con PIN como hash y contador en el servidor
[ERR-09.06] Resolución documentada en: [AUDIT-095] - Product Backlog: HU-13 con rol ADMINISTRADOR verificado en cada endpoint
[ERR-09.07] Resolución documentada en: [AUDIT-128] - Tabla Maestra: CA-02.1, JWT de 1 hora
[ERR-09.08] Resolución documentada en: [AUDIT-131] - Tabla Maestra: CA-10.1, PIN como hash y contador en servidor
[ERR-09.09] Resolución documentada en: [AUDIT-133] - Tabla Maestra: CA-13.1, rol ADMINISTRADOR verificado en el backend
[ERR-09.10] Resolución documentada en: [AUDIT-147] - HU con instructivo: HU-10 Esc. 4, bloqueo de PIN en el servidor
[ERR-09.11] Resolución documentada en: [AUDIT-171] - Criterios de aceptación: CA-02.1, JWT de 1 hora
[ERR-09.12] Resolución documentada en: [AUDIT-175] - Criterios de aceptación: CA-10.1, PIN como hash y contador en servidor
[ERR-09.13] Resolución documentada en: [AUDIT-177] - Criterios de aceptación: CA-13.1, rol ADMINISTRADOR verificado en el backend
[ERR-09.14] Resolución documentada en: [AUDIT-199] - Especificación 4.2: Capacitor solo para apps/mobile y token en almacenamiento seguro
[ERR-09.15] Resolución documentada en: [AUDIT-200] - Especificación 4.2: Electron 44 solo vía API y ventana endurecida
[ERR-09.16] Resolución documentada en: [AUDIT-206] - Especificación 4.2: el backend como única fuente de sesión
[ERR-09.17] Resolución documentada en: [AUDIT-207] - Especificación 4.2: Firebase Authentication no emite sesiones
[ERR-09.18] Pendiente de resolución, registrado en: [AUDIT-P03] - Pendiente: worker outbox, una alerta ACTIVA por usuario y guard anti-IDOR
[ERR-09.19] Pendiente de resolución, registrado en: [AUDIT-P04] - Pendiente: refresh token rotativo, 'cerrar todas las sesiones' y /auth/me
[ERR-09.20] Pendiente de resolución, registrado en: [AUDIT-P05] - Pendiente: configuración de seguridad de la ventana de Electron
## [ERR-10] Errores de pruebas y trazabilidad (QA) (15)
[ERR-10.01] 2.1.1 PRODUCT BACKLOG: [AUDIT-077]
[ERR-10.02] 2.1.1 PRODUCT BACKLOG: [AUDIT-103]
[ERR-10.03] 2.1.1 PRODUCT BACKLOG: [AUDIT-114]
[ERR-10.04] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-123]
[ERR-10.05] Plan de pruebas: [AUDIT-158]
[ERR-10.06] Plan de pruebas: [AUDIT-159]
[ERR-10.07] Plan de pruebas: [AUDIT-160]
[ERR-10.08] Plan de pruebas: [AUDIT-161]
[ERR-10.09] Plan de pruebas: [AUDIT-162]
[ERR-10.10] Plan de pruebas: [AUDIT-163]
[ERR-10.11] Plan de pruebas: [AUDIT-164]
[ERR-10.12] Plan de pruebas: [AUDIT-165]
[ERR-10.13] Matriz de trazabilidad de Pruebas: [AUDIT-166]
[ERR-10.14] Matriz de trazabilidad de Pruebas: [AUDIT-168]
[ERR-10.15] Matriz de trazabilidad de Pruebas: [AUDIT-169]
### Trazabilidad de resolución [ERR-10]
[ERR-10.01] Resolución documentada en: [AUDIT-077]
[ERR-10.02] Resolución documentada en: [AUDIT-103] - Product Backlog: línea 'RF trazados' en cada HU
[ERR-10.03] Resolución documentada en: [AUDIT-114] - Product Backlog: trazabilidad total vía Tabla Maestra
[ERR-10.04] Resolución documentada en: [AUDIT-123] - Tabla Maestra: columnas RF, CA y CP (matriz única de trazabilidad)
[ERR-10.05] Resolución documentada en: [AUDIT-158] - Plan de pruebas: pruebas de IDOR, Electron y CORS
[ERR-10.06] Resolución documentada en: [AUDIT-159] - Plan de pruebas: pruebas de rendimiento y resiliencia
[ERR-10.07] Resolución documentada en: [AUDIT-160] - Plan de pruebas: ambiente real de ejecución (Docker, commit o tag)
[ERR-10.08] Resolución documentada en: [AUDIT-161] - Plan de pruebas: prioridades P1 / P2 de los casos
[ERR-10.09] Resolución documentada en: [AUDIT-162] - Plan de pruebas: ambiente de pruebas y matriz de dispositivos
[ERR-10.10] Resolución documentada en: [AUDIT-163] - Plan de pruebas: casos trazados a RF, HU y CA
[ERR-10.11] Resolución documentada en: [AUDIT-164] - Plan de pruebas: IDs únicos CP-MÓDULO-NNN y 13 casos nuevos
[ERR-10.12] Resolución documentada en: [AUDIT-165] - Plan de pruebas: caso de ejemplo como 'Ejemplo (no ejecutado)'
[ERR-10.13] Resolución documentada en: [AUDIT-166] - Matriz de pruebas: IDs únicos y columnas HU, CA y Prioridad
[ERR-10.14] Resolución documentada en: [AUDIT-168] - Matriz de pruebas: 13 casos agregados en la versión 1.1
[ERR-10.15] Resolución documentada en: [AUDIT-169] - Matriz de pruebas: resultado de ejemplo como 'Ejemplo (no ejecutado)'
## [ERR-11] Inconsistencias de alcance y catálogos entre documentos (17)
[ERR-11.01] Acta de constitución: [AUDIT-004]
[ERR-11.02] Visión del Producto: [AUDIT-018]
[ERR-11.03] Visión del Producto: [AUDIT-019]
[ERR-11.04] Acta de constitución: [AUDIT-036]
[ERR-11.05] Acta de constitución: [AUDIT-037]
[ERR-11.06] Acta de constitución: [AUDIT-042]
[ERR-11.07] Acta de constitución: RF12 usaba una lista no unificada de tipos de emergencia.  [AUDIT-045]
[ERR-11.08] Acta de constitución: [AUDIT-046]
[ERR-11.09] Acta de constitución: RF16 no precisaba qué se vende ni el uso de PayPal sandbox y Mindicador, con un alcance comercial contradictorio entre documentos.  [AUDIT-047]
[ERR-11.10] Informe ERS: [AUDIT-056]
[ERR-11.11] Informe ERS: [AUDIT-059]
[ERR-11.12] Informe ERS: [AUDIT-060]
[ERR-11.13] Informe ERS: [AUDIT-061]
[ERR-11.14] 2.1.1 PRODUCT BACKLOG: [AUDIT-080]
[ERR-11.15] 2.1.1 PRODUCT BACKLOG: [AUDIT-081]
[ERR-11.16] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-125]
[ERR-11.17] Matriz de trazabilidad de Pruebas: [AUDIT-170]
### Trazabilidad de resolución [ERR-11]
[ERR-11.01] Resolución documentada en: [AUDIT-004] - Acta: tipo de emergencia 'Emergencia' en la Solución Propuesta
[ERR-11.02] Resolución documentada en: [AUDIT-018] - Visión del Producto: objetivo alineado a números oficiales 131/132/133
[ERR-11.03] Resolución documentada en: [AUDIT-019] - Visión del Producto: propósito sin 'agentes de seguridad'
[ERR-11.04] Resolución documentada en: [AUDIT-036] - Acta: Objetivos del Negocio con el catálogo de 4 tipos de emergencia
[ERR-11.05] Resolución documentada en: [AUDIT-037] - Acta: objetivo alineado a números oficiales (sin agentes de seguridad)
[ERR-11.06] Resolución documentada en: [AUDIT-042] - Acta: RF4 con catálogo único de tipos de emergencia
[ERR-11.07] Resolución documentada en: [AUDIT-045] - Acta: RF12 con catálogo único de tipos de emergencia
[ERR-11.08] Resolución documentada en: [AUDIT-046] - Acta: RF14, mostrar números oficiales (sin notificación automática)
[ERR-11.09] Resolución documentada en: [AUDIT-047] - Acta: RF16, ventas de planes y cupos con PayPal sandbox y Mindicador
[ERR-11.10] Resolución documentada en: [AUDIT-056] - ERS: RF4 con catálogo único de tipos de emergencia
[ERR-11.11] Resolución documentada en: [AUDIT-059] - ERS: RF12 con catálogo único de tipos de emergencia
[ERR-11.12] Resolución documentada en: [AUDIT-060] - ERS: RF14, mostrar números oficiales (sin notificación automática)
[ERR-11.13] Resolución documentada en: [AUDIT-061] - ERS: RF16, ventas de planes y cupos con PayPal sandbox y Mindicador
[ERR-11.14] Resolución documentada en: [AUDIT-080] - Product Backlog: ventas se mantienen en el alcance (EP-07, HU-16)
[ERR-11.15] Resolución documentada en: [AUDIT-081] - Product Backlog: F04.1 con catálogo único de tipos de emergencia
[ERR-11.16] Resolución documentada en: [AUDIT-125] - Tabla Maestra: F04.1 con catálogo único de tipos de emergencia
[ERR-11.17] Resolución documentada en: [AUDIT-170] - Matriz de pruebas: alcances de RF5, RF14, RF16-RF18, RF20 y RF25 actualizados
## [ERR-12] Errores de planificación (sprints, fechas y backlog) (24)
[ERR-12.01] 1.2.1 Hoja de ruta del proyecto: [AUDIT-020]
[ERR-12.02] 1.2.1 Hoja de ruta del proyecto: Se atribuían los elementos Must Have a los Sprints 1–4, que solo tienen entregables documentales.  [AUDIT-025]
[ERR-12.03] 1.2.1 Hoja de ruta del proyecto: [AUDIT-026]
[ERR-12.04] 1.2.1 Hoja de ruta del proyecto: Se afirmaba que el MVP se logra en el Sprint 4, cuando ese sprint solo prepara la línea base.  [AUDIT-027]
[ERR-12.05] 1.2.1 Hoja de ruta del proyecto: [AUDIT-028]
[ERR-12.06] 1.2.1 Hoja de ruta del proyecto: [AUDIT-029]
[ERR-12.07] 1.2.2 Sprint-fase1: [AUDIT-030]
[ERR-12.08] 1.2.2 Sprint-fase1: [AUDIT-032]
[ERR-12.09] Informe ERS: [AUDIT-066]
[ERR-12.10] 2.1.1 PRODUCT BACKLOG: [AUDIT-078]
[ERR-12.11] 2.1.1 PRODUCT BACKLOG: [AUDIT-104]
[ERR-12.12] 2.1.1 PRODUCT BACKLOG: [AUDIT-105]
[ERR-12.13] 2.1.1 PRODUCT BACKLOG: [AUDIT-106]
[ERR-12.14] 2.1.1 PRODUCT BACKLOG: [AUDIT-111]
[ERR-12.15] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-115]
[ERR-12.16] 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG: [AUDIT-124]
[ERR-12.17] [Pendiente] Cambios Pendientes: [AUDIT-P08]
[ERR-12.18] 2.1.1 PRODUCT BACKLOG: periodos de los Sprints 1–3 (hallazgo nuevo, sin AUDIT).
[ERR-12.19] 1.2.2 Sprint-fase1: hito académico del Sprint 4 "jueves 4" (hallazgo nuevo, sin AUDIT).
[ERR-12.20] Trello.json: listas "Cierre Sprint 4" con fechas 4/9 (cerrada) y 14/9 (abierta); los documentos dan 14/9.
[ERR-12.21] Trello.json: tarjeta "Sprint Review" del Sprint 4 con fecha 3/9, dentro de la lista "Cierre Sprint 4 - 14/9".
[ERR-12.22] Trello.json: listas duplicadas (Cierre Sprint 3 - 28/8; Daily sprint 2, 3 y 4; Sprint 6 con 10/8 y 28/9).
[ERR-12.23] Trello.json: 23 listas "Sprint 6 a 28 - 10/8/2026" cerradas, con fechas que no corresponden a los sprints.
[ERR-12.24] Trello.json: "Cierre Sprint 7 - /10/2026" sin día; "Sprint 7 - 12/10/2026" abierta.
### Trazabilidad de resolución [ERR-12]
[ERR-12.01] Resolución documentada en: [AUDIT-020] - Hoja de ruta: aclaración de iteraciones semanales (Sprint 4 y 6 de dos semanas)
[ERR-12.02] Resolución documentada en: [AUDIT-025] - Hoja de ruta: Must Have en la Fase 2; Sprints 1-4 como línea base
[ERR-12.03] Resolución aplicada el 18/10/2026 en: [AUDIT-026] - Hoja de ruta: horizonte de 5 semanas (no 7) para la Fase 1 (pendiente: el horizonte sigue en 7 semanas)
[ERR-12.04] Resolución documentada en: [AUDIT-027] - Hoja de ruta: MVP en la Fase 2, no en el Sprint 4
[ERR-12.05] Resolución aplicada el 18/10/2026 en: [AUDIT-028] - Hoja de ruta: nota que concilia Hito 1 (11-09) y cierre de Fase 1 (14-09)
[ERR-12.06] Resolución aplicada el 18/10/2026 en: [AUDIT-029] - Hoja de ruta: Definition of Done única de 8 ítems
[ERR-12.07] Resolución aplicada el 18/10/2026 en: [AUDIT-030]
[ERR-12.08] Resolución documentada en: [AUDIT-032] - Sprint-fase1: periodo del Sprint 4 hasta el 14 de septiembre
[ERR-12.09] Pendiente de resolución: la bitácora la registra como aplicada, pero no consta en el archivo; registrado en: [AUDIT-066] - ERS: nota que prioriza la planificación por HU sobre la de plataformas
[ERR-12.10] Resolución aplicada el 18/10/2026 en: [AUDIT-078] - Product Backlog: Fase 1 hasta el 14 de septiembre
[ERR-12.11] Resolución aplicada el 18/10/2026 en: [AUDIT-104] - Product Backlog: Fase 1 con tres Sprints de una semana y el Sprint 4 de dos
[ERR-12.12] Pendiente de resolución: la bitácora la registra como aplicada, pero no consta en el archivo; registrado en: [AUDIT-105] - Product Backlog: Sprint 4 sin TD-12 (8 SP) y cierre el 14-09
[ERR-12.13] Resolución aplicada el 18/10/2026 en: [AUDIT-106] - Product Backlog: Definition of Done única (remite a Hoja de ruta §6)
[ERR-12.14] Resolución aplicada el 18/10/2026 en: [AUDIT-111] - Product Backlog: nota sobre la numeración de Sprints de la Fase 2
[ERR-12.15] Resolución aplicada el 18/10/2026 en: [AUDIT-115] - Tabla Maestra: dependencias TD con IDs vigentes
[ERR-12.16] Resolución aplicada el 18/10/2026 en: [AUDIT-124] - Tabla Maestra: hoja Tareas F1 con IDs TD y prioridades unificadas
[ERR-12.17] Pendiente de resolución, registrado en: [AUDIT-P08] - Pendiente: estimación y planificación de HU-14 a HU-19 y tareas TH
[ERR-12.18] Resolución aplicada el 18/10/2026 en: 2.1.1 PRODUCT BACKLOG §7 (hallazgo nuevo; ver Cambios Realizados (AUDITORIA CLAUDE), intervención ERR-12).
[ERR-12.19] Resolución aplicada el 18/10/2026 en: 1.2.2 Sprint-fase1 (hallazgo nuevo; ver Cambios Realizados (AUDITORIA CLAUDE), intervención ERR-12).
[ERR-12.20] Pendiente de resolución: discrepancia de Trello.json. No se modifica Trello.json; decisión del equipo.
[ERR-12.21] Pendiente de resolución: discrepancia de Trello.json frente al 14/9 de Sprint-fase1. No se modifica Trello.json.
[ERR-12.22] Pendiente de resolución: discrepancia de Trello.json. No se modifica Trello.json.
[ERR-12.23] Pendiente de resolución: discrepancia de Trello.json. No se modifica Trello.json.
[ERR-12.24] Pendiente de resolución: discrepancia de Trello.json. No se modifica Trello.json.
## [ERR-13] Errores de roles y responsabilidades (9)
[ERR-13.01] Acta de constitución: La Lista de Interesados conservaba nombres de la plantilla en lugar del interesado real (Julio Tapia, Product Owner).  [AUDIT-005]
[ERR-13.02] 1.2.1 Hoja de ruta del proyecto: Alineación con la Capacidad Real mencionaba 'dos Developers' en lugar de tres.  [AUDIT-006]
[ERR-13.03] 1.2.1 Hoja de ruta del proyecto: [AUDIT-024]
[ERR-13.04] Matriz RACI: La misma persona era Responsable (R) y Aprobador (A) en Desarrollo de la Aplicación de Escritorio.  [AUDIT-069]
[ERR-13.05] Matriz RACI: La misma persona era R y A en Testing QA, y el Product Owner solo figuraba como Informado.  [AUDIT-070]
[ERR-13.06] Matriz RACI: El Product Owner figuraba solo como Informado, incluso en Definición de requisitos.  [AUDIT-071]
[ERR-13.07] Matriz RACI: Faltaba la actividad 'Aceptación de incrementos (Sprint Review)' exigida por el Plan de pruebas.  [AUDIT-072]
[ERR-13.08] 2.1.1 PRODUCT BACKLOG: Se mencionaban 'dos Developers' cuando el equipo tiene tres integrantes con tareas de desarrollo.  [AUDIT-112]
[ERR-13.09] [Pendiente] Cambios Pendientes: [AUDIT-P09]
### Trazabilidad de resolución [ERR-13]
[ERR-13.01] Resolución documentada en: [AUDIT-005] - Acta: Lista de Interesados con el Product Owner real (Julio Tapia)
[ERR-13.02] Resolución documentada en: [AUDIT-006]
[ERR-13.03] Resolución documentada en: [AUDIT-024] - Hoja de ruta: Trabajo en Paralelo con tres Developers
[ERR-13.04] Resolución documentada en: [AUDIT-069] - RACI: Escritorio con R (Esp. Escritorio) y A (Arquitecto)
[ERR-13.05] Resolución documentada en: [AUDIT-070] - RACI: Testing QA con R (Esp. QA) y A (Product Owner)
[ERR-13.06] Resolución documentada en: [AUDIT-071] - RACI: Product Owner = C en Documentación inicial y Requisitos
[ERR-13.07] Resolución documentada en: [AUDIT-072] - RACI: nueva fila 'Aceptación de incrementos (Sprint Review)'
[ERR-13.08] Resolución documentada en: [AUDIT-112] - Product Backlog: 'tres Developers' en la garantía de viabilidad
[ERR-13.09] Pendiente de resolución, registrado en: [AUDIT-P09] - Pendiente: rebalanceo de la carga de Alonso en la RACI
## [ERR-14] Errores de presupuesto y cálculo (3)
[ERR-14.01] Informe TEC: [AUDIT-073]
[ERR-14.02] Horas hombre en relación a Tareas: [AUDIT-075]
[ERR-14.03] Horas hombre en relación a Tareas: [AUDIT-076]
### Trazabilidad de resolución [ERR-14]
[ERR-14.01] Resolución documentada en: [AUDIT-073] - Informe TEC: nueva sección Presupuesto de Infraestructura y Herramientas
[ERR-14.02] Resolución documentada en: [AUDIT-075] - Horas hombre: fórmulas =E*C y =SUM en lugar de MULTIPLY
[ERR-14.03] Resolución documentada en: [AUDIT-076] - Horas hombre: resumen por responsable con SUMIF (Gabriel / Alonso)
## [ERR-15] Errores de control documental (versiones, índices, anexos y diagramas) (7)
[ERR-15.01] Bitácora de cambios (Hoja de ruta): [AUDIT-008] + [AUDIT-P13]
[ERR-15.02] Acta de constitución: Control de cambios sin la versión vigente con fecha real (faltaba la v1.2).  [AUDIT-052]
[ERR-15.03] Informe ERS: Ficha del documento con una sola revisión (v1.0); no había historial de versiones.  [AUDIT-054]
[ERR-15.04] Informe ERS: Anexo 'Carta Gantt' sin contenido.  [AUDIT-067]
[ERR-15.05] Informe ERS: [AUDIT-068]
[ERR-15.06] Plan de pruebas: [AUDIT-157]
[ERR-15.07] [Pendiente] Cambios Pendientes: [AUDIT-P11]
### Trazabilidad de resolución [ERR-15]
[ERR-15.01] Documentado sin corregir en: [AUDIT-008] - Hoja de ruta: entrada (07/10/2026) sin texto en la bitácora  y  [AUDIT-P13] - Nota final: entrada vacía en la bitácora (registro del equipo, sin modificar)
[ERR-15.02] Resolución documentada en: [AUDIT-052] - Acta: versión 1.2 agregada (07-10-2026). Autor: Gabriel Valencia (confirmado por el usuario)
[ERR-15.03] Resolución documentada en: [AUDIT-054] - ERS: revisión 1.1 agregada (07/10/2026). Autor: Gabriel Valencia (confirmado por el usuario)
[ERR-15.04] Resolución documentada en: [AUDIT-067] - ERS: Carta Gantt como documento externo enlazado
[ERR-15.05] Pendiente de validación, registrado en: [AUDIT-068] - Texto del índice corregido (una sola entrada “Limitaciones”); pendiente de validar los números de página en Word
[ERR-15.06] Pendiente, registrado en: [AUDIT-157] - Plan de pruebas: versión 1.1 agregada (07-10-2026). Pendiente: estado de la versión 1.1
[ERR-15.07] Pendiente de resolución, registrado en: [AUDIT-P11] - Pendiente: actualizar diagramas ER y de secuencia 'Generar Alerta'
## [ERR-16] Referencias a normas y estándares obsoletos (2)
[ERR-16.01] Acta de constitución: Se exigía cumplir ISO 9126 (reemplazada por ISO/IEC 25010) e ISO 25001 (que no es un modelo de calidad de producto).  [AUDIT-039]
[ERR-16.02] Informe ERS: [AUDIT-053]
### Trazabilidad de resolución [ERR-16]
[ERR-16.01] Resolución documentada en: [AUDIT-039]
[ERR-16.02] Pendiente de validación, registrado en: [AUDIT-053] - ERS: IEEE 830 ya no aparece; la frase de portada con la norma no contiene ISO/IEC/IEEE 29148 (confirmar con el autor)

Cómo usar este índice: busque el ID [AUDIT-NNN] en el documento «Cambios Realizados (AUDITORIA CLAUDE)» ubicando el documento afectado, la fecha y el identificador de hallazgo de la auditoría (columna «Hallazgo»); el título resume la acción. La columna «Errores» devuelve al bloque de este documento.

| Categoría | Cantidad de errores |
| --- | --- |
| [ERR-01] Errores de tipeo | 0 |
| [ERR-02] Poca especificación en el texto | 2 |
| [ERR-03] Falta de información legal | 3 |
| [ERR-04] Errores relacionados a antecedentes médicos | 6 |
| [ERR-05] Errores técnicos | 3 |
| [ERR-06] Errores de historias de usuario | 44 |
| [ERR-07] Errores de APIs | 3 |
| [ERR-08] Errores de base de datos | 12 |
| [ERR-09] Errores de seguridad y control de acceso | 19 |
| [ERR-10] Errores de pruebas y trazabilidad (QA) | 15 |
| [ERR-11] Inconsistencias de alcance y catálogos entre documentos | 12 |
| [ERR-12] Errores de planificación (sprints, fechas y backlog) | 8 |
| [ERR-13] Errores de roles y responsabilidades | 1 |
| [ERR-14] Errores de presupuesto y cálculo | 0 |
| [ERR-15] Errores de control documental (versiones, índices, anexos y diagramas) | 4 |
| [ERR-16] Referencias a normas y estándares obsoletos | 1 |
| Total | 133 |
| ID de acción | Fecha | Documento afectado | Título de la acción | Hallazgo | Errores |
| --- | --- | --- | --- | --- | --- |
| [AUDIT-001] | 28/09/2026 | Acta de Constitución | Acta: MySQL reemplazado por Docker Desktop + PostgreSQL | Bitácora previa | ERR-08.01 |
| [AUDIT-002] | 05/10/2026 | Acta de Constitución |  | Bitácora previa | ERR-05.01, ERR-08.02 |
| [AUDIT-003] | 05/10/2026 | Acta de Constitución | Acta: 'React/Angular' unificado a React | Bitácora previa | ERR-05.02 |
| [AUDIT-004] | 05/10/2026 | Acta de Constitución | Acta: tipo de emergencia 'Emergencia' en la Solución Propuesta | Bitácora previa | ERR-11.01 |
| [AUDIT-005] | 07/10/2026 | Acta de Constitución | Acta: Lista de Interesados con el Product Owner real (Julio Tapia) | Bitácora previa | ERR-13.01 |
| [AUDIT-006] | 05/10/2026 | 1.2.1 Hoja de ruta del proyecto |  | Bitácora previa | ERR-13.02 |
| [AUDIT-007] | 07/10/2026 | 1.2.1 Hoja de ruta del proyecto |  | Bitácora previa | ERR-01.01 |
| [AUDIT-008] | 07/10/2026 | 1.2.1 Hoja de ruta del proyecto | Hoja de ruta: entrada (07/10/2026) sin texto en la bitácora | Bitácora previa | ERR-15.01 |
| [AUDIT-009] | 28/09/2026 | Especificación de Herramientas y Servicios del Proyecto | Especificación de Herramientas: PostgreSQL y punto Entorno de Ejecución (Docker) | Bitácora previa | ERR-05.03, ERR-08.03 |
| [AUDIT-010] | 28/09/2026 | Especificación de Herramientas y Servicios del Proyecto |  | Bitácora previa | ERR-07.01, ERR-07.02 |
| [AUDIT-011] | 28/09/2026 | Diagrama de Componentes | Diagrama de Componentes: servicio duplicado y servicios Mensajería y Conversión de Divisas | Bitácora previa | ERR-07.03 |
| [AUDIT-012] | 28/09/2026 | Diagrama de Arquitectura |  | Bitácora previa | ERR-07.04, ERR-07.05 |
| [AUDIT-013] | 28/09/2026 | Diagrama de Arquitectura |  | Bitácora previa | ERR-08.04 |
| [AUDIT-014] | 05/10/2026 | BDD con tipos de datos | BDD: tabla PLAN sin total_venta ni fecha_venta | Bitácora previa | ERR-08.05 |
| [AUDIT-015] | 06/10/2026 | BDD con tipos de datos | BDD: nueva tabla ANTECEDENTE_MEDICO | Bitácora previa | ERR-04.01 |
| [AUDIT-016] | 06/10/2026 | BDD con tipos de datos | BDD: FK antecedente_medico_ID en DETALLE_ALERTA | Bitácora previa | ERR-04.02 |
| [AUDIT-017] | 06/10/2026 | BDD con tipos de datos | BDD: todos los tipos de datos adaptados de MySQL a PostgreSQL | Bitácora previa | ERR-08.06 |
| [AUDIT-018] | 07/10/2026 | Visión del Producto (1.1) | Visión del Producto: objetivo alineado a números oficiales 131/132/133 | I-08 | ERR-11.02 |
| [AUDIT-019] | 07/10/2026 | Visión del Producto (1.1) | Visión del Producto: propósito sin 'agentes de seguridad' | I-08 | ERR-11.03 |
| [AUDIT-020] | 07/10/2026 | 1.2.1 Hoja de ruta del proyecto (1.2) | Hoja de ruta: aclaración de iteraciones semanales (Sprint 4 y 6 de dos semanas) | 1.2 | ERR-12.01 |
| [AUDIT-021] | 07/10/2026 | 1.2.1 Hoja de ruta del proyecto (1.2) | Hoja de ruta: enfoque prioritario con 9 HU del MVP (se suma HU-14) | A-06 | ERR-06.01 |
| [AUDIT-022] | 07/10/2026 | 1.2.1 Hoja de ruta del proyecto (1.2) | Hoja de ruta: total de 19 HU (13 originales + 6 nuevas) | 2.1 / A-10 | ERR-06.02 |
| [AUDIT-023] | 07/10/2026 | 1.2.1 Hoja de ruta del proyecto (1.2) | Hoja de ruta: 'Historias MVP' de 8 a 9 HU | A-06 | ERR-06.03 |
| [AUDIT-024] | 07/10/2026 | 1.2.1 Hoja de ruta del proyecto (1.2) | Hoja de ruta: Trabajo en Paralelo con tres Developers | I-04 | ERR-13.03 |
| [AUDIT-025] | 07/10/2026 | 1.2.1 Hoja de ruta del proyecto (1.2) | Hoja de ruta: Must Have en la Fase 2; Sprints 1-4 como línea base | 1.2 | ERR-12.02 |
| [AUDIT-026] | 07/10/2026 | 1.2.1 Hoja de ruta del proyecto (1.2) | Hoja de ruta: horizonte de 5 semanas (no 7) para la Fase 1 | 1.2 | ERR-12.03 |
| [AUDIT-027] | 07/10/2026 | 1.2.1 Hoja de ruta del proyecto (1.2) | Hoja de ruta: MVP en la Fase 2, no en el Sprint 4 | 1.2 | ERR-12.04 |
| [AUDIT-028] | 07/10/2026 | 1.2.1 Hoja de ruta del proyecto (1.2) | Hoja de ruta: nota que concilia Hito 1 (11-09) y cierre de Fase 1 (14-09) | 1.2 | ERR-12.05 |
| [AUDIT-029] | 07/10/2026 | 1.2.1 Hoja de ruta del proyecto (1.2) | Hoja de ruta: Definition of Done única de 8 ítems | 1.2 / A-12 | ERR-12.06 |
| [AUDIT-030] | 07/10/2026 | 1.2.2 Sprint-fase1 (1.2) |  | 2.1 / A-10 | ERR-12.07 |
| [AUDIT-031] | 07/10/2026 | 1.2.2 Sprint-fase1 (1.2) | Sprint-fase1: periodo del Sprint 3 (24 al 28 de agosto) | 1.2 | ERR-01.02 |
| [AUDIT-032] | 07/10/2026 | 1.2.2 Sprint-fase1 (1.2) | Sprint-fase1: periodo del Sprint 4 hasta el 14 de septiembre | 1.2 | ERR-12.08 |
| [AUDIT-033] | 07/10/2026 | 1.2.3 Sprint-fase2 (1.2) | Sprint-fase2: Daily Scrum del Sprint 5 (mes de septiembre) | 1.2 (conciliación) | ERR-01.03 |
| [AUDIT-034] | 07/10/2026 | 1.2.3 Sprint-fase2 (1.2) | Sprint-fase2: Daily Scrum del Sprint 6 (meses y separador) | 1.2 (conciliación) | ERR-01.04 |
| [AUDIT-035] | 07/10/2026 | 1.2.3 Sprint-fase2 (1.2) | Sprint-fase2: Hito académico del Sprint 6 (1 y 8 de octubre) | 1.2 (conciliación) | ERR-01.05 |
| [AUDIT-036] | 07/10/2026 | Acta de constitución (1.3) | Acta: Objetivos del Negocio con el catálogo de 4 tipos de emergencia | I-05 | ERR-11.04 |
| [AUDIT-037] | 07/10/2026 | Acta de constitución (1.3) | Acta: objetivo alineado a números oficiales (sin agentes de seguridad) | I-08 | ERR-11.05 |
| [AUDIT-038] | 07/10/2026 | Acta de constitución (1.3) | Acta: Indicador de Alcance con método de medición | 1.3 | ERR-02.01 |
| [AUDIT-039] | 07/10/2026 | Acta de constitución (1.3) |  | 1.3 | ERR-16.01 |
| [AUDIT-040] | 07/10/2026 | Acta de constitución (1.3) |  | 1.3 | ERR-02.02 |
| [AUDIT-041] | 07/10/2026 | Acta de constitución (1.3) |  | RF3 | ERR-02.03 |
| [AUDIT-042] | 07/10/2026 | Acta de constitución (1.3) | Acta: RF4 con catálogo único de tipos de emergencia | RF4 | ERR-11.06 |
| [AUDIT-043] | 07/10/2026 | Acta de constitución (1.3) | Acta: RF5 con mínimo verificable (pulsación de 2 s) y Could Have | RF5 | ERR-02.04 |
| [AUDIT-044] | 07/10/2026 | Acta de constitución (1.3) | Acta: RF7, límite de 5 contactos por usuario | RF7 | ERR-02.05 |
| [AUDIT-045] | 07/10/2026 | Acta de constitución (1.3) | Acta: RF12 con catálogo único de tipos de emergencia | RF12 | ERR-11.07 |
| [AUDIT-046] | 07/10/2026 | Acta de constitución (1.3) | Acta: RF14, mostrar números oficiales (sin notificación automática) | RF14 | ERR-11.08 |
| [AUDIT-047] | 07/10/2026 | Acta de constitución (1.3) | Acta: RF16, ventas de planes y cupos con PayPal sandbox y Mindicador | I-07 | ERR-11.09 |
| [AUDIT-048] | 07/10/2026 | Acta de constitución (1.3) | Acta: RF20, escritorio solo a través de la API del backend | RF20 | ERR-09.01 |
| [AUDIT-049] | 07/10/2026 | Acta de constitución (1.3) | Acta: RF25, nivel de acceso de apadrinados y asistencia de SOPORTE | RF25 | ERR-02.06 |
| [AUDIT-050] | 07/10/2026 | Acta de constitución (1.3) | Acta: RNF4, autorización por rol y por propiedad (anti-IDOR) | R-01 / A-04 | ERR-09.02 |
| [AUDIT-051] | 07/10/2026 | Acta de constitución (1.3) | Acta: nuevos RNF6 a RNF10 (latencia, tolerancia a fallos, Ley 21.719, retención, accesibilidad) | 1.4 / A-17 | ERR-03.01 |
| [AUDIT-052] | 07/10/2026 | Acta de constitución (1.3) | Acta: control de cambios con la versión 1.2 (07-10-2026) | A-22 | ERR-15.02 |
| [AUDIT-053] | 07/10/2026 | Informe ERS (1.4) |  | 1.4 | ERR-16.02 |
| [AUDIT-054] | 07/10/2026 | Informe ERS (1.4) | ERS: historial de versiones (revisión 1.1 del 07/10/2026) | A-22 | ERR-15.03 |
| [AUDIT-055] | 07/10/2026 | Informe ERS (1.4) |  | RF3 | ERR-02.07 |
| [AUDIT-056] | 07/10/2026 | Informe ERS (1.4) | ERS: RF4 con catálogo único de tipos de emergencia | RF4 | ERR-11.10 |
| [AUDIT-057] | 07/10/2026 | Informe ERS (1.4) | ERS: RF5 con mínimo verificable (pulsación de 2 s) y Could Have | RF5 | ERR-02.08 |
| [AUDIT-058] | 07/10/2026 | Informe ERS (1.4) | ERS: RF7, límite de 5 contactos por usuario | RF7 | ERR-02.09 |
| [AUDIT-059] | 07/10/2026 | Informe ERS (1.4) | ERS: RF12 con catálogo único de tipos de emergencia | RF12 | ERR-11.11 |
| [AUDIT-060] | 07/10/2026 | Informe ERS (1.4) | ERS: RF14, mostrar números oficiales (sin notificación automática) | RF14 | ERR-11.12 |
| [AUDIT-061] | 07/10/2026 | Informe ERS (1.4) | ERS: RF16, ventas de planes y cupos con PayPal sandbox y Mindicador | I-07 | ERR-11.13 |
| [AUDIT-062] | 07/10/2026 | Informe ERS (1.4) | ERS: RF20, escritorio solo a través de la API del backend | RF20 | ERR-09.03 |
| [AUDIT-063] | 07/10/2026 | Informe ERS (1.4) | ERS: RF25, nivel de acceso de apadrinados y asistencia de SOPORTE | RF25 | ERR-02.10 |
| [AUDIT-064] | 07/10/2026 | Informe ERS (1.4) | ERS: RNF4, autorización por rol y por propiedad (anti-IDOR) | R-01 / A-04 | ERR-09.04 |
| [AUDIT-065] | 07/10/2026 | Informe ERS (1.4) | ERS: nuevos RNF6 a RNF10 | 1.4 / A-17 | ERR-03.02 |
| [AUDIT-066] | 07/10/2026 | Informe ERS (1.4) | ERS: nota que prioriza la planificación por HU sobre la de plataformas | 1.4 | ERR-12.09 |
| [AUDIT-067] | 07/10/2026 | Informe ERS (1.4) | ERS: Carta Gantt como documento externo enlazado | 1.4 | ERR-15.04 |
| [AUDIT-068] | 07/10/2026 | Informe ERS (1.4) | ERS: índice corregido (sección 2.3, Limitaciones y Anexos) | 1.4 | ERR-15.05 |
| [AUDIT-069] | 07/10/2026 | Matriz RACI (1.5) | RACI: Escritorio con R (Esp. Escritorio) y A (Arquitecto) | 1.5 / A-18 | ERR-13.04 |
| [AUDIT-070] | 07/10/2026 | Matriz RACI (1.5) | RACI: Testing QA con R (Esp. QA) y A (Product Owner) | 1.5 / A-18 | ERR-13.05 |
| [AUDIT-071] | 07/10/2026 | Matriz RACI (1.5) | RACI: Product Owner = C en Documentación inicial y Requisitos | 1.5 / A-18 | ERR-13.06 |
| [AUDIT-072] | 07/10/2026 | Matriz RACI (1.5) | RACI: nueva fila 'Aceptación de incrementos (Sprint Review)' | 1.5 / A-18 | ERR-13.07 |
| [AUDIT-073] | 07/10/2026 | Informe TEC (1.6) | Informe TEC: nueva sección Presupuesto de Infraestructura y Herramientas | 1.6 / A-14 | ERR-14.01 |
| [AUDIT-074] | 07/10/2026 | Horas hombre en relación a Tareas (1.6) | Horas hombre: TH-1.3 con React + Ionic | I-03 | ERR-05.04 |
| [AUDIT-075] | 07/10/2026 | Horas hombre en relación a Tareas (1.6) | Horas hombre: fórmulas =E*C y =SUM en lugar de MULTIPLY | 1.6 / A-14 | ERR-14.02 |
| [AUDIT-076] | 07/10/2026 | Horas hombre en relación a Tareas (1.6) | Horas hombre: resumen por responsable con SUMIF (Gabriel / Alonso) | 1.6 / A-14 | ERR-14.03 |
| [AUDIT-077] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) |  | 2.1 / A-08 | ERR-10.01 |
| [AUDIT-078] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: Fase 1 hasta el 14 de septiembre | 1.2 / 2.1 | ERR-12.10 |
| [AUDIT-079] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: dependencias TD-xx y errata 'Dependencia' | 2.1 / A-10 | ERR-01.06 |
| [AUDIT-080] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: ventas se mantienen en el alcance (EP-07, HU-16) | I-07 | ERR-11.14 |
| [AUDIT-081] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: F04.1 con catálogo único de tipos de emergencia | I-05 | ERR-11.15 |
| [AUDIT-082] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: nueva feature F04.3 (números oficiales) | 2.1 / A-06 / A-10 | ERR-06.04 |
| [AUDIT-083] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: nueva feature F05.3 (cierre de la emergencia) | 2.1 / A-06 / A-10 | ERR-06.05 |
| [AUDIT-084] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: nueva feature F07.3 (planes y cupos) | 2.1 / A-06 / A-10 | ERR-06.06 |
| [AUDIT-085] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: nueva feature F09.3 (solicitudes de soporte) | 2.1 / A-06 / A-10 | ERR-06.07 |
| [AUDIT-086] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: HU-06 con alerta ACTIVA, idempotencia y una alerta activa por usuario | I-06 / C-01 / A-03 | ERR-06.08 |
| [AUDIT-087] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: HU-08 con estado de envío por contacto | C-03 / F06.2 | ERR-06.09 |
| [AUDIT-088] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: HU-09 deriva a compra de cupos (HU-16) | I-07 | ERR-06.10 |
| [AUDIT-089] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: HU-10 con PIN como hash y contador en el servidor | R-05 | ERR-09.05 |
| [AUDIT-090] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: HU-10 con PIN al elegir perfil (RF23) y niveles de acceso | 2.2 | ERR-06.11 |
| [AUDIT-091] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: HU-11 con consentimiento explícito (Ley 21.719) | R-06 / C-18 / A-17 | ERR-03.03 |
| [AUDIT-092] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: HU-12 revoca el acceso al cerrarse la emergencia (HU-14) | A-06 / CA-12.1 | ERR-04.03 |
| [AUDIT-093] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: el SOS nunca se bloquea por falta de ficha médica | A-07 | ERR-04.04 |
| [AUDIT-094] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: HU-13 con estados del catálogo ESTADO_USUARIO | I-06 | ERR-06.12 |
| [AUDIT-095] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: HU-13 con rol ADMINISTRADOR verificado en cada endpoint | R-01 | ERR-09.06 |
| [AUDIT-096] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: HU-13 con mínimo privilegio y auditoría | 2.2 / C-21 / C-22 | ERR-06.13 |
| [AUDIT-097] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: nueva HU-14 Finalizar o Cancelar Emergencia | 2.1 / A-06 / A-10 | ERR-06.14 |
| [AUDIT-098] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: nueva HU-15 Gestionar Perfil y Credenciales | 2.1 / A-06 / A-10 | ERR-06.15 |
| [AUDIT-099] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: nueva HU-16 Adquirir Plan o Cupos | 2.1 / A-06 / A-10 | ERR-06.16 |
| [AUDIT-100] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: nueva HU-17 Consultar Números Oficiales | 2.1 / A-06 / A-10 | ERR-06.17 |
| [AUDIT-101] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: nueva HU-18 Enviar Solicitud de Soporte | 2.1 / A-06 / A-10 | ERR-06.18 |
| [AUDIT-102] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: nueva HU-19 Generar Informe Personal | 2.1 / A-06 / A-10 | ERR-06.19 |
| [AUDIT-103] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: línea 'RF trazados' en cada HU | A-08 | ERR-10.02 |
| [AUDIT-104] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: Fase 1 con tres Sprints de una semana y el Sprint 4 de dos | 1.2 | ERR-12.11 |
| [AUDIT-105] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: Sprint 4 sin TD-12 (8 SP) y cierre el 14-09 | 2.1 / A-10 | ERR-12.12 |
| [AUDIT-106] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: Definition of Done única (remite a Hoja de ruta §6) | 1.2 / A-12 | ERR-12.13 |
| [AUDIT-107] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: Story Points de HU-10 = 5 | 2.1 / A-10 | ERR-06.20 |
| [AUDIT-108] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: Story Points de HU-09 = 3 | 2.1 / A-10 | ERR-06.21 |
| [AUDIT-109] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: HU-12 con 4 SP y dependencia de HU-14 | 2.1 / A-10 | ERR-06.22 |
| [AUDIT-110] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: HU-14 a HU-19 en el Sprint Planning de la Fase 2 | 2.1 / A-06 | ERR-06.23 |
| [AUDIT-111] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: nota sobre la numeración de Sprints de la Fase 2 | 2.1 | ERR-12.14 |
| [AUDIT-112] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: 'tres Developers' en la garantía de viabilidad | I-04 | ERR-13.08 |
| [AUDIT-113] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: enfoque MVP con 9 HU (HU-01 a HU-08 y HU-14) | A-06 | ERR-06.24 |
| [AUDIT-114] | 07/10/2026 | 2.1.1 PRODUCT BACKLOG (2.1) | Product Backlog: trazabilidad total vía Tabla Maestra | A-08 | ERR-10.03 |
| [AUDIT-115] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: dependencias TD con IDs vigentes | 2.1 / A-10 | ERR-12.15 |
| [AUDIT-116] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: features de HU-01 y HU-02 descruzadas | 2.1 / A-10 | ERR-06.25 |
| [AUDIT-117] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: HU-09 depende de HU-02 y HU-10 | 2.1 / A-10 | ERR-06.26 |
| [AUDIT-118] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: HU-10 depende de HU-02 | 2.1 / A-10 | ERR-06.27 |
| [AUDIT-119] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: HU-11 depende de HU-02 y HU-10 | 2.1 / A-10 | ERR-06.28 |
| [AUDIT-120] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: HU-12 depende de HU-06, HU-08, HU-11 y HU-14 | 2.1 / A-10 | ERR-06.29 |
| [AUDIT-121] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: HU-13 depende de HU-02 | 2.1 / A-10 | ERR-06.30 |
| [AUDIT-122] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: hoja Fase_2 con HU-14 a HU-19 | 2.1 / A-06 / A-10 | ERR-06.31 |
| [AUDIT-123] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: columnas RF, CA y CP (matriz única de trazabilidad) | A-08 | ERR-10.04 |
| [AUDIT-124] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: hoja Tareas F1 con IDs TD y prioridades unificadas | 2.1 / A-10 | ERR-12.16 |
| [AUDIT-125] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: F04.1 con catálogo único de tipos de emergencia | I-05 | ERR-11.16 |
| [AUDIT-126] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: features F04.3, F05.3, F07.3 y F09.3 | 2.1 | ERR-06.32 |
| [AUDIT-127] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: hoja 'Historia de usuario' con HU-14 a HU-19 | 2.1 | ERR-06.33 |
| [AUDIT-128] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: CA-02.1, JWT de 1 hora | CA-02.1 | ERR-09.07 |
| [AUDIT-129] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: CA-03.1, teléfono en formato E.164 | CA-03.1 | ERR-02.11 |
| [AUDIT-130] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: CA-08.1, intento de envío registrado por contacto | CA-08.1 | ERR-02.12 |
| [AUDIT-131] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: CA-10.1, PIN como hash y contador en servidor | CA-10.1 | ERR-09.08 |
| [AUDIT-132] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: CA-12.1, revocación cuando la emergencia deja de estar ACTIVA | CA-12.1 | ERR-04.05 |
| [AUDIT-133] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: CA-13.1, rol ADMINISTRADOR verificado en el backend | CA-13.1 | ERR-09.09 |
| [AUDIT-134] | 07/10/2026 | 2.1.2 TABLA MAESTRA DE PRODUCT BACKLOG (2.1) | Tabla Maestra: criterios CA-14.1 a CA-19.1 | A-06 / A-08 | ERR-06.34 |
| [AUDIT-135] | 07/10/2026 | Product backlog puntos historia (2.1) | Product backlog puntos historia: HU-14 a HU-19 'Por estimar' | 2.1 / A-06 | ERR-06.35 |
| [AUDIT-136] | 07/10/2026 | Sprint backlog actividades horas (2.1) | Sprint backlog horas: TH-1.3 con React + Ionic | I-03 | ERR-05.05 |
| [AUDIT-137] | 07/10/2026 | Épicas e Historias de Usuario (2.2) | Épicas e HU: MoSCoW de EP-01 a Must Have | 2.2 | ERR-06.36 |
| [AUDIT-138] | 07/10/2026 | Épicas e Historias de Usuario (2.2) | Épicas e HU: MoSCoW de EP-02 a Must Have | 2.2 | ERR-06.37 |
| [AUDIT-139] | 07/10/2026 | Épicas e Historias de Usuario (2.2) | Épicas e HU: MoSCoW de EP-08 a Should Have | 2.2 | ERR-06.38 |
| [AUDIT-140] | 07/10/2026 | Épicas e Historias de Usuario (2.2) | Épicas e HU: HU-01 asociada a EP-02 | 2.1 / A-10 | ERR-06.39 |
| [AUDIT-141] | 07/10/2026 | Épicas e Historias de Usuario (2.2) | Épicas e HU: HU-02 asociada a EP-01 | 2.1 / A-10 | ERR-06.40 |
| [AUDIT-142] | 07/10/2026 | Épicas e Historias de Usuario (2.2) | Épicas e HU: tabla con HU-14 a HU-19 | 2.1 / A-06 | ERR-06.41 |
| [AUDIT-143] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: identificadores EP/HU de HU-01 y HU-02 | 2.1 / A-10 | ERR-06.42 |
| [AUDIT-144] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: HU-02 Esc. 1 (redacción y PIN solo con apadrinados) | 2.2 | ERR-06.43 |
| [AUDIT-145] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: HU-06 con ubicación actual y sin SMS automático | 2.2 / R-13 / C-06 | ERR-06.44 |
| [AUDIT-146] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: HU-09 con vinculación, cupos y PIN | 2.2 | ERR-06.45 |
| [AUDIT-147] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: HU-10 Esc. 4, bloqueo de PIN en el servidor | R-05 | ERR-09.10 |
| [AUDIT-148] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: HU-11 con ficha médica cifrada y consentimiento | 2.2 / A-11 | ERR-04.06 |
| [AUDIT-149] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: HU-12 con SOS sin ficha y enlace con emergencia cerrada | A-07 / C-02 | ERR-04.07 |
| [AUDIT-150] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: HU-13 sin CRUD total (mínimo privilegio) | 2.2 / A-11 / C-21 / C-22 | ERR-06.46 |
| [AUDIT-151] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: escenarios Gherkin de HU-14 | A-06 / A-11 | ERR-06.47 |
| [AUDIT-152] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: escenarios Gherkin de HU-15 | A-06 / A-11 | ERR-06.48 |
| [AUDIT-153] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: escenarios Gherkin de HU-16 | A-06 / A-11 | ERR-06.49 |
| [AUDIT-154] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: escenarios Gherkin de HU-17 | A-06 / A-11 | ERR-06.50 |
| [AUDIT-155] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: escenarios Gherkin de HU-18 | A-06 / A-11 | ERR-06.51 |
| [AUDIT-156] | 07/10/2026 | Historias Usuario con instructivo (2.2) | HU con instructivo: escenarios Gherkin de HU-19 | A-06 / A-11 | ERR-06.52 |
| [AUDIT-157] | 07/10/2026 | Plan de pruebas (2.3) | Plan de pruebas: control de versiones (v1.1, 07-10-2026) | A-22 | ERR-15.06 |
| [AUDIT-158] | 07/10/2026 | Plan de pruebas (2.3) | Plan de pruebas: pruebas de IDOR, Electron y CORS | 2.3 / A-16 | ERR-10.05 |
| [AUDIT-159] | 07/10/2026 | Plan de pruebas (2.3) | Plan de pruebas: pruebas de rendimiento y resiliencia | 2.3 / A-16 | ERR-10.06 |
| [AUDIT-160] | 07/10/2026 | Plan de pruebas (2.3) | Plan de pruebas: ambiente real de ejecución (Docker, commit o tag) | 2.3 | ERR-10.07 |
| [AUDIT-161] | 07/10/2026 | Plan de pruebas (2.3) | Plan de pruebas: prioridades P1 / P2 de los casos | 2.3 | ERR-10.08 |
| [AUDIT-162] | 07/10/2026 | Plan de pruebas (2.3) | Plan de pruebas: ambiente de pruebas y matriz de dispositivos | 2.3 | ERR-10.09 |
| [AUDIT-163] | 07/10/2026 | Plan de pruebas (2.3) | Plan de pruebas: casos trazados a RF, HU y CA | 2.3 / A-08 | ERR-10.10 |
| [AUDIT-164] | 07/10/2026 | Plan de pruebas (2.3) | Plan de pruebas: IDs únicos CP-MÓDULO-NNN y 13 casos nuevos | 2.3 / A-08 / A-16 | ERR-10.11 |
| [AUDIT-165] | 07/10/2026 | Plan de pruebas (2.3) | Plan de pruebas: caso de ejemplo como 'Ejemplo (no ejecutado)' | 2.3 | ERR-10.12 |
| [AUDIT-166] | 07/10/2026 | Matriz de trazabilidad de Pruebas (2.3) | Matriz de pruebas: IDs únicos y columnas HU, CA y Prioridad | 2.3 / A-08 | ERR-10.13 |
| [AUDIT-167] | 07/10/2026 | Matriz de trazabilidad de Pruebas (2.3) | Matriz de pruebas: CP-RBAC-001 con rol SOPORTE | 1.4 / RNF4 | ERR-02.13 |
| [AUDIT-168] | 07/10/2026 | Matriz de trazabilidad de Pruebas (2.3) | Matriz de pruebas: 13 casos agregados en la versión 1.1 | 2.3 / A-16 | ERR-10.14 |
| [AUDIT-169] | 07/10/2026 | Matriz de trazabilidad de Pruebas (2.3) | Matriz de pruebas: resultado de ejemplo como 'Ejemplo (no ejecutado)' | 2.3 | ERR-10.15 |
| [AUDIT-170] | 07/10/2026 | Matriz de trazabilidad de Pruebas (2.3) | Matriz de pruebas: alcances de RF5, RF14, RF16-RF18, RF20 y RF25 actualizados | I-07 / 1.4 / A-09 | ERR-11.17 |
| [AUDIT-171] | 07/10/2026 | CRITERIOS DE ACEPTACIÓN (3.1) | Criterios de aceptación: CA-02.1, JWT de 1 hora | CA-02.1 | ERR-09.11 |
| [AUDIT-172] | 07/10/2026 | CRITERIOS DE ACEPTACIÓN (3.1) | Criterios de aceptación: CA-03.1, teléfono en formato E.164 | CA-03.1 | ERR-02.14 |
| [AUDIT-173] | 07/10/2026 | CRITERIOS DE ACEPTACIÓN (3.1) | Criterios de aceptación: CA-05.1, mensaje de 160 caracteres validado en front y back | CA-05.1 | ERR-02.15 |
| [AUDIT-174] | 07/10/2026 | CRITERIOS DE ACEPTACIÓN (3.1) | Criterios de aceptación: CA-08.1, intento de envío registrado por contacto | CA-08.1 | ERR-02.16 |
| [AUDIT-175] | 07/10/2026 | CRITERIOS DE ACEPTACIÓN (3.1) | Criterios de aceptación: CA-10.1, PIN como hash y contador en servidor | CA-10.1 | ERR-09.12 |
| [AUDIT-176] | 07/10/2026 | CRITERIOS DE ACEPTACIÓN (3.1) | Criterios de aceptación: CA-12.1, revocación cuando la emergencia deja de estar ACTIVA | CA-12.1 | ERR-04.08 |
| [AUDIT-177] | 07/10/2026 | CRITERIOS DE ACEPTACIÓN (3.1) | Criterios de aceptación: CA-13.1, rol ADMINISTRADOR verificado en el backend | CA-13.1 | ERR-09.13 |
| [AUDIT-178] | 07/10/2026 | CRITERIOS DE ACEPTACIÓN (3.1) | Criterios de aceptación: criterios CA-14.1 a CA-19.1 | A-06 / A-08 | ERR-06.53 |
| [AUDIT-179] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: USUARIO.contra_usuario varchar(255) | 4.1 / A-01 | ERR-08.07 |
| [AUDIT-180] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: columnas de USUARIO pasan a NULL (PIN, suscripción, mensaje, prioridad) | 4.1 / A-01 | ERR-08.08 |
| [AUDIT-181] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: catálogo cerrado de roles en ROL | R-01 / A-04 | ERR-08.09 |
| [AUDIT-182] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: PRIORIDAD documentada como catálogo de tipos de emergencia | I-05 | ERR-08.10 |
| [AUDIT-183] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: PIN varchar(4) y migración pin_hash / intentos_fallidos | 4.1 / R-05 / A-01 | ERR-08.11 |
| [AUDIT-184] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: num_emergencia en E.164 con nombre y parentesco | 4.1 / A-01 | ERR-08.12 |
| [AUDIT-185] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: ANTECEDENTE_MEDICO con cifrado, IV, versión de llave y consentimiento | 4.1 / R-07 / A-01 | ERR-04.09 |
| [AUDIT-186] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: ALERTA con estado, idempotencia y timestamps | I-06 / C-01 / A-01 / A-06 | ERR-08.13 |
| [AUDIT-187] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: UBICACION_ALERTA con coordenadas, precisión, fuente y hora | 4.1 / R-15 / A-01 | ERR-08.14 |
| [AUDIT-188] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: HISTORIAL_ALERTA con transiciones de estado | 4.1 / A-01 | ERR-08.15 |
| [AUDIT-189] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: DETALLE_ALERTA.texto_mensaje (copia del mensaje) | 4.1 / A-01 | ERR-08.16 |
| [AUDIT-190] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: nueva tabla ENVIO_ALERTA | 4.1 / C-03 / A-01 / A-03 | ERR-08.17 |
| [AUDIT-191] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: nueva tabla ENLACE_MEDICO | 4.1 / R-06 / C-02 / A-01 | ERR-04.10 |
| [AUDIT-192] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: NOTIFICACION_MOVIL.fecha_envio a timestamptz | 4.1 / C-11 | ERR-08.18 |
| [AUDIT-193] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: VENTA / DETALLE_VENTA alineadas con init.sql | 4.1 | ERR-08.19 |
| [AUDIT-194] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: PLAN sin total_venta / fecha_venta y FK en PLAN_USUARIO | 4.1 (bitácora 05/10/2026) | ERR-08.20 |
| [AUDIT-195] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: notas de responsabilidad en SOPORTE y CONTACTO; tipo varchar | 4.1 / A-20 | ERR-08.21 |
| [AUDIT-196] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: BITACORA_SISTEMA.accion_realizada y fecha con hora | 4.1 / C-11 | ERR-08.22 |
| [AUDIT-197] | 07/10/2026 | BDD con tipos de datos (4.1) | BDD: hoja 'ANEXO FUERA DE ALCANCE' | 4.1 / A-20 | ERR-08.23 |
| [AUDIT-198] | 07/10/2026 | Especificación de Herramientas y Servicios del Proyecto (4.2) | Especificación 4.2: React 19 con Ionic React | I-03 | ERR-05.06 |
| [AUDIT-199] | 07/10/2026 | Especificación de Herramientas y Servicios del Proyecto (4.2) | Especificación 4.2: Capacitor solo para apps/mobile y token en almacenamiento seguro | R-17 / R-08 / 4.2 | ERR-09.14 |
| [AUDIT-200] | 07/10/2026 | Especificación de Herramientas y Servicios del Proyecto (4.2) | Especificación 4.2: Electron 44 solo vía API y ventana endurecida | R-02 / R-03 / A-05 | ERR-09.15 |
| [AUDIT-201] | 07/10/2026 | Especificación de Herramientas y Servicios del Proyecto (4.2) | Especificación 4.2: Turborepo 2.11 y workspaces | 4.2 | ERR-05.07 |
| [AUDIT-202] | 07/10/2026 | Especificación de Herramientas y Servicios del Proyecto (4.2) | Especificación 4.2: PostgreSQL 15, init.sql y TypeORM | R-21 / 4.2 | ERR-08.24 |
| [AUDIT-203] | 07/10/2026 | Especificación de Herramientas y Servicios del Proyecto (4.2) | Especificación 4.2: versiones y herramientas de calidad | 4.2 / R-18 / R-20 / A-15 | ERR-05.08 |
| [AUDIT-204] | 07/10/2026 | Especificación de Herramientas y Servicios del Proyecto (4.2) | Especificación 4.2: 5 servicios externos de APIs (no 4) | 4.2 | ERR-01.07 |
| [AUDIT-205] | 07/10/2026 | Especificación de Herramientas y Servicios del Proyecto (4.2) | Especificación 4.2: módulos reales de la API REST del backend | 4.2 | ERR-07.06 |
| [AUDIT-206] | 07/10/2026 | Especificación de Herramientas y Servicios del Proyecto (4.2) | Especificación 4.2: el backend como única fuente de sesión | R-09 | ERR-09.16 |
| [AUDIT-207] | 07/10/2026 | Especificación de Herramientas y Servicios del Proyecto (4.2) | Especificación 4.2: Firebase Authentication no emite sesiones | R-09 | ERR-09.17 |
| [AUDIT-208] | 07/10/2026 | Especificación de Herramientas y Servicios del Proyecto (4.2) | Especificación 4.2: Google Maps como geocodificación (no captura) | 4.2 | ERR-07.07 |
| [AUDIT-P01] | — | Cambios Pendientes | Pendiente: canal y proveedor de despacho de alertas | Pendiente | ERR-07.08 |
| [AUDIT-P02] | — | Cambios Pendientes | Pendiente: migración del esquema a init.sql y TypeORM | Pendiente | ERR-08.25 |
| [AUDIT-P03] | — | Cambios Pendientes | Pendiente: worker outbox, una alerta ACTIVA por usuario y guard anti-IDOR | Pendiente | ERR-09.18 |
| [AUDIT-P04] | — | Cambios Pendientes | Pendiente: refresh token rotativo, 'cerrar todas las sesiones' y /auth/me | Pendiente | ERR-09.19 |
| [AUDIT-P05] | — | Cambios Pendientes | Pendiente: configuración de seguridad de la ventana de Electron | Pendiente | ERR-09.20 |
| [AUDIT-P06] | — | Cambios Pendientes | Pendiente: ecosistema del monorepo (Dockerfile, packageManager, turbo.json, .env) | Pendiente | ERR-05.09 |
| [AUDIT-P07] | — | Cambios Pendientes | Pendiente: perfil 'qa', integración continua y hosting/respaldo de la Fase 3 | Pendiente | ERR-05.10 |
| [AUDIT-P08] | — | Cambios Pendientes | Pendiente: estimación y planificación de HU-14 a HU-19 y tareas TH | Pendiente | ERR-12.17 |
| [AUDIT-P09] | — | Cambios Pendientes | Pendiente: rebalanceo de la carga de Alonso en la RACI | Pendiente | ERR-13.09 |
| [AUDIT-P10] | — | Cambios Pendientes | Pendiente: plazo de retención (RNF9) y revisión de la Ley 21.719 | Pendiente | ERR-03.04 |
| [AUDIT-P11] | — | Cambios Pendientes | Pendiente: actualizar diagramas ER y de secuencia 'Generar Alerta' | Pendiente | ERR-15.07 |
| [AUDIT-P12] | — | Cambios Pendientes | Pendiente: HU 'Could Have' de seguridad personal (decisión del PO) | Pendiente | ERR-06.54 |
| [AUDIT-P13] | — | Cambios Pendientes (nota final) | Nota final: entrada vacía en la bitácora (registro del equipo, sin modificar) | Nota | ERR-15.01 |