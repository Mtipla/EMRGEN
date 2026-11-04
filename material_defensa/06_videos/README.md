# Videos de estudio

Escrito para: quien vaya a estudiar o presentar los videos.

## Contenido

| Archivo | Tema | Duración |
|---|---|---|
| [01_arquitectura_y_estructura.mp4](01_arquitectura_y_estructura.mp4) | Monorepo, servidores y puntos de entrada | 1 min 02 s |
| [02_frontend_y_navegacion.mp4](02_frontend_y_navegacion.mp4) | Rutas de web, móvil y escritorio | 1 min 01 s |
| [03_backend_rutas_api.mp4](03_backend_rutas_api.mp4) | Controladores de NestJS y FastAPI | 56 s |
| [04_base_de_datos_y_modelos.mp4](04_base_de_datos_y_modelos.mp4) | Esquema, alertas y migraciones | 59 s |
| [05_autenticacion_y_permisos.mp4](05_autenticacion_y_permisos.mp4) | Contraseña, JWT, guards y bloqueo de PIN | 1 min 18 s |
| [06_sos_y_alertas.mp4](06_sos_y_alertas.mp4) | Registro, idempotencia, cierre con PIN y envíos | 1 min 09 s |
| [07_compras_y_planes.mp4](07_compras_y_planes.mp4) | Precio público, rutas de compra y PayPal | 56 s |
| [08_administracion_y_auditoria.mp4](08_administracion_y_auditoria.mp4) | Administración y bitácora | 54 s |
| [09_integraciones_externas.mp4](09_integraciones_externas.mp4) | mindicador, Google Maps, Firebase y WhatsApp | 52 s |
| [10_simulacion_de_defensa.mp4](10_simulacion_de_defensa.mp4) | Cinco preguntas de la comisión con evidencia | 1 min 16 s |

Cada video tiene 1920 × 1080, H.264 con audio AAC, narración en español con la voz Helena de Windows, subtítulos quemados, una tarjeta de título de 4 segundos y capítulos por segmento. El storyboard con las líneas que se muestran está en [INDICE_VIDEOS.md](INDICE_VIDEOS.md).

## Cómo se produjeron

- **Grabación:** Screencast MCP (`@tmhs/screencast-mcp`), con la ventana de VS Code en pantalla completa. Los videos muestran solo el editor.
- **Narración:** voz Helena (Windows, sin conexión), anclada a un marcador por segmento.
- **Edición:** tarjeta de título, subtítulos y capítulos con FFmpeg 9.0.2.

## Limitaciones conocidas

- **Sin resaltado de Code Walkthrough.** El servidor de Walkthrough se ejecuta en la ventana de VS Code de EMRGEN, la que tiene el chat de Claude Code. Grabar esa ventana mostraría la conversación, así que los videos usan una ventana limpia. Para incluir los resaltados hace falta cerrar esa ventana, y lo decide quien usa el equipo.
- **Video 01:** el segmento de `docker-compose.yml` se cambió por `app.module.ts`, porque al abrir ese archivo aparece una notificación de VS Code que se grababa encima del código.
- **Reproducción:** verificados con ffprobe y fotogramas. No probados en un reproductor de escritorio.

## Reglas que se respetaron

- No se muestran `.env`, `.env.*.local` ni `.android.local.json`. El explorador de archivos está oculto.
- No se muestran contraseñas ni PIN de las cuentas de desarrollo.
- Solo se lee código: no se ejecutó ninguna operación que cambie la base de datos.
