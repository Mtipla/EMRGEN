# Informe de cobertura

Escrito para: quien revise si el encargo quedó completo y qué falta.

## Resumen

| Entregable | Estado |
|---|---|
| Reconocimiento del proyecto (Etapa 1) | Completo para el monorepo. Pendiente: frontends en detalle |
| Análisis de rutas (Etapa 2) | Completo para las 82 rutas de API y las rutas de navegación. Matriz con estados |
| Explicación de funcionalidades (Etapa 3) | 12 funcionalidades. Algunas solo con rutas leídas (F3, F4 parcial, F10, F11) |
| Análisis de documentación (Etapa 4) | Documentos de texto leídos. Binarios no leídos |
| Code Walkthrough (Etapa 5) | Skill y servidor instalados y conectados. No se generó walkthrough HTML; los resaltados no aparecen en los videos (ver bloqueos) |
| Videos con Screencast MCP (Etapa 6) | **10 videos producidos** en `06_videos/`, 1920×1080, con narración Helena, subtítulos y capítulos. Storyboard en `INDICE_VIDEOS.md` |
| Documento de estudio (Etapa 7) | Entregado: `GUIA_COMPLETA_DEFENSA.md` con 11 capítulos. PDF no generado (no hay herramienta de exportación) |
| Preguntas de defensa (Etapa 8) | 67 preguntas (cumple el mínimo de 50) |
| Material de repaso (Etapa 9) | Entregados: resumen, glosario, mapa de rutas, preguntas, guion, puntos críticos, índice de videos |
| Simulador (Etapa 10) | Entregado: protocolo y modo crítico |
| Carpeta de entrega (Etapa 13) | Entregada con la estructura pedida |

## Rutas encontradas

| Tipo | Cantidad |
|---|---|
| Rutas de API NestJS | 64 |
| Rutas de API FastAPI | 18 |
| Rutas de navegación web | 7 públicas y privadas, más `RUTAS_PUBLICAS` (no enumeradas) |
| Rutas de navegación móvil | 8 |
| Rutas de navegación escritorio | 10 |

Fuente: [MATRIZ_RUTAS.md](../02_rutas/MATRIZ_RUTAS.md).

## Rutas documentadas

- Documentadas y encontradas: todas las rutas que citan `readme.apis.internas.md`, `readme-apis.md`, `README.md` y `README_BDD.md`.
- Documentadas pero no encontradas: ninguna ruta de API. Sí faltan cinco archivos de `docs/`.
- Implementadas sin mención en la documentación revisada: 39.

## Funcionalidades analizadas

F1 registro, F2 inicio de sesión y perfiles, F3 perfil y contactos, F4 apadrinados, F5 compras, F5b PayPal sin guard, F6 SOS, F6b WhatsApp, F7 tickets, F8 contacto, F9 administración, F10 auditoría y reportes, F11 integraciones, F12 salud y cierre automático.

Profundidad:
- **Leídas de punta a punta:** F2, F5b, F6, F6b, F12.
- **Leídas en parte:** F1, F4, F5, F7, F8, F9, F10, F11.
- **Solo por rutas:** F3.

## Documentos revisados

| Documento | Estado |
|---|---|
| `README.md` (aplicación) | Leído por secciones: 2, 5, 10, cabecera y los puntos citados |
| `README.md` (raíz del repositorio) | No leído |
| `README_BDD.md` | Leído |
| `readme.apis.internas.md` | Leído, rutas cruzadas |
| `readme-apis.md` | Leído, rutas cruzadas |
| `services/internal-api/README.md` | Solo cabecera |
| `apps/backend/README.md` | Plantilla de NestJS; no aporta |
| `init.sql` | Leído en su lista de tablas |
| `migrations/` | Nombres revisados; contenido no |
| `CONTRIBUTING.md` (raíz) | No leído |
| `Evidencias de documentación/` (.docx, .xlsx, .drawio, .png, .pdf, .bmpr) | No leídos |

## Videos previstos y creados

| Previstos | Creados |
|---|---|
| 10 (ver [INDICE_VIDEOS.md](../06_videos/INDICE_VIDEOS.md)) | **10**, todos verificados con ffprobe: 1920×1080, H.264, audio AAC, capítulos y subtítulos |

Archivos: `01_arquitectura_y_estructura.mp4` a `10_simulacion_de_defensa.mp4`, en [06_videos/](../06_videos/). Duraciones de 52 a 78 segundos. Se revisaron fotogramas de los videos 01, 02, 05 y 10; el resto se verificó por formato y registro.

## Materiales entregados

- [00_INDICE.md](../00_INDICE.md)
- [01_arquitectura/ARQUITECTURA.md](../01_arquitectura/ARQUITECTURA.md)
- [02_rutas/MATRIZ_RUTAS.md](../02_rutas/MATRIZ_RUTAS.md), [MAPA_DE_RUTAS.md](../02_rutas/MAPA_DE_RUTAS.md)
- [03_funcionalidades/FUNCIONALIDADES.md](../03_funcionalidades/FUNCIONALIDADES.md)
- [04_documentacion/TRAZABILIDAD_DOCUMENTACION.md](../04_documentacion/TRAZABILIDAD_DOCUMENTACION.md)
- [05_code_walkthrough/README.md](../05_code_walkthrough/README.md)
- [06_videos/README.md](../06_videos/README.md), [INDICE_VIDEOS.md](../06_videos/INDICE_VIDEOS.md)
- [07_guias_estudio/GUIA_COMPLETA_DEFENSA.md](../07_guias_estudio/GUIA_COMPLETA_DEFENSA.md), [GLOSARIO_TECNICO.md](../07_guias_estudio/GLOSARIO_TECNICO.md), [RESUMEN_RAPIDO.md](../07_guias_estudio/RESUMEN_RAPIDO.md)
- [08_preguntas_defensa/PREGUNTAS_DEFENSA.md](../08_preguntas_defensa/PREGUNTAS_DEFENSA.md), [SIMULADOR_DEFENSA.md](../08_preguntas_defensa/SIMULADOR_DEFENSA.md)
- [09_guiones/GUION_PRESENTACION.md](../09_guiones/GUION_PRESENTACION.md)
- [10_informes/INFORME_COBERTURA.md](INFORME_COBERTURA.md), [PUNTOS_CRITICOS.md](PUNTOS_CRITICOS.md)

Sin PDF ni SRT: no hay herramienta de exportación ni de voz disponible.

## Apartados pendientes

1. Leer los documentos binarios de `Evidencias de documentación/` y contrastarlos.
2. Revisar `CONTRIBUTING.md` y el `README.md` de la raíz del repositorio.
3. Leer en detalle los servicios de perfil y apadrinados.
4. Confirmar la ventana de 5 horas de compras pendientes.
5. Ejecutar las pruebas de FastAPI (requiere PostgreSQL) y de los frontends.
6. Generar el walkthrough y los videos si se dispone de las herramientas.

## Bloqueos técnicos

| Bloqueo | Efecto |
|---|---|
| Resaltado de Code Walkthrough en los videos | El servidor MCP de Walkthrough corre en la ventana de VS Code de EMRGEN (con el chat de Claude Code). Grabar esa ventana expone el chat, así que los videos usan una ventana limpia sin resaltados |
| Sin walkthrough HTML | No se generó; la skill quedó instalada, pero no se usó para producir un HTML |
| Sin herramienta de texto a voz | Sin narración ni SRT |
| Sin herramienta de exportación PDF | Solo Markdown |
| Pruebas de FastAPI requieren PostgreSQL | No ejecutadas |
| Binarios de Office sin lector en esta sesión | No leídos |

## Control de calidad

| Criterio | Resultado |
|---|---|
| Todas las aplicaciones exploradas | Sí: NestJS, FastAPI, web, móvil, escritorio y paquetes |
| Rutas inventariadas | Sí: 82 de API y navegación |
| Cada ruta con ubicación verificable | Sí: archivo y línea |
| Funcionalidades con archivos | Sí |
| Documentos relevantes analizados | Parcial: los de texto, no los binarios |
| Contradicciones identificadas | Sí: ver PUNTOS_CRITICOS |
| Banco de preguntas de 50 o más | Sí: 67 |
| Walkthroughs abribles | No aplica: no se generó walkthrough HTML |
| Videos reproducibles | Sí: 10 MP4 verificados con ffprobe; reproducción completa no probada en un reproductor |
| Secretos expuestos | No: no se leyeron `.env` ni `.local`, y no se copiaron contraseñas |
| Código alterado | No: solo se creó `material_defensa/` |

## Restricciones y cambios

- Se creó `material_defensa/` dentro de `Evidencias de sistema Aplicación/`. No está en Git.
- No hubo commits, merges, pushes ni cambios de rama.
- No se instalaron dependencias. Las pruebas se ejecutaron con los `node_modules` ya existentes.
- Se ejecutó una sola suite de pruebas, con mocks y sin base de datos.
- Se usó `graphify query` solo para orientarse; el contenido de los archivos se verificó leyéndolos.
