# Code Walkthrough: instalado, sin HTML generado

Escrito para: quien revise el material y se pregunte por qué no hay un walkthrough HTML.

## Estado

- **Skill `code-walkthrough`:** copiada a `~/.claude/skills/code-walkthrough/SKILL.md` desde la extensión de VS Code (`fjanuszewski.code-walkthrough-mcp-1.0.6`).
- **Servidor MCP `walkthrough`:** registrado en Claude Code (`http://127.0.0.1:8771/mcp`), conectado.
- **Walkthrough HTML:** no se generó. La skill sirve para recorridos guiados dentro del editor, no para producir un HTML, y no se pidió el HTML en esta fase.
- **Resaltados en los videos:** no aparecen. El servidor corre en la ventana de VS Code de EMRGEN, la que tiene el chat de Claude Code. Ver [06_videos/README.md](../06_videos/README.md).

## Qué hay en su lugar

El recorrido de cada funcionalidad, con archivos, funciones, orden de ejecución y dependencias, está en:

- [FUNCIONALIDADES.md](../03_funcionalidades/FUNCIONALIDADES.md): doce puntos por funcionalidad, con el recorrido general al inicio.
- [ARQUITECTURA.md](../01_arquitectura/ARQUITECTURA.md): diagramas Mermaid de componentes, login y SOS.
- [MAPA_DE_RUTAS.md](../02_rutas/MAPA_DE_RUTAS.md): "dónde busco X" con archivo y línea.
- [06_videos/](../06_videos/): los diez videos de estudio, con el código de cada tema.

## Para usar el walkthrough en vivo

Con la extensión de VS Code abierta en la carpeta del proyecto, pedir en Claude Code "recórreme este archivo". Los resaltados aparecen en el editor de esa ventana.
