# Guía de Trabajo del Equipo: Claude Code + Graphify y Flujo Git

> **Fuente de la verdad** para configurar Claude Code con Graphify y para trabajar con las ramas del repositorio **EMRGEN**.
> Si algo de este documento no coincide con lo que ves en tu máquina, **detente y avisa en el canal del equipo** antes de hacer commit.

> **Nota sobre nombres:** la herramienta se llama **Graphify**. El paquete de Python es `graphifyy` (con doble "y"), el comando de terminal es `graphify` y la rama de datos del repositorio es **`graphify`**.

---

## Índice

1. [Principios](#1-principios)
2. [Arquitectura de ramas](#2-arquitectura-de-ramas)
3. [Requisitos y versiones fijadas](#3-requisitos-y-versiones-fijadas)
4. [Configuración inicial](#4-configuración-inicial)
5. [Uso diario de Claude Code con Graphify](#5-uso-diario-de-claude-code-con-graphify)
6. [Git Workflow](#6-git-workflow)
7. [Solución de problemas](#7-solución-de-problemas)
8. [Referencia rápida de comandos](#8-referencia-rápida-de-comandos)

---

## 1. Principios

1. **Una sola versión de Graphify para todo el equipo.** Si las versiones no coinciden, se invalida la caché del grafo y cada actualización genera diffs enormes y conflictos.
2. **El grafo compartido (`graphify-out/`) solo se modifica y se commitea en la rama `graphify`.** En las ramas individuales, `graphify-out/` solo llega mediante merge desde `graphify`.
3. **El grafo compartido siempre representa el estado de `main`**, nunca trabajo en curso de una rama individual.
4. **Los archivos que dependen de la máquina no se versionan** (rutas absolutas, intérprete de Python, configuración personal).
5. **A `main` solo se llega mediante Pull Request revisado.** Nunca con push directo y nunca con `--force`.


## 2. Arquitectura de ramas

| Rama | Propósito | Quién escribe | Cómo recibe cambios |
|---|---|---|---|
| `main` | Producción / código estable | Nadie directamente | Solo PR aprobado desde una rama individual |
| `graphify` | Datos actualizados de Graphify (`graphify-out/`) | Quien actualiza el grafo (ver [6.4](#64-actualizar-y-publicar-el-grafo-en-graphify)) | Merge de `main` + commit del grafo regenerado |
| `alonso` | Rama individual de Alonso González | Solo Alonso | Commits propios + merge de `main` y `graphify` |
| `diego` | Rama individual de Diego Plaza | Solo Diego | Commits propios + merge de `main` y `graphify` |
| `gabriel` | Rama individual de Gabriel Valencia | Solo Gabriel | Commits propios + merge de `main` y `graphify` |

## 3. Requisitos y versiones fijadas

| Herramienta | Versión del equipo | Verificación |
|---|---|---|
| Claude Code | Última estable (mínimo `2.1.x`) | `claude --version` |
| uv (gestor de herramientas Python) | `0.12.x` o superior | `uv --version` |
| Graphify (`graphifyy`) | **`0.9.65`** (fijada) | `uv tool list` |
| Node.js / npm (aplicación) | `^24.21.0` / `^11.19.0` | `node -v` / `npm -v` |
| Git | `2.40` o superior | `git --version` |

## 4. Configuración inicial

### 4.1 Por desarrollador (una vez por máquina)

**Windows (PowerShell):**

```powershell
# 1. Claude Code: verificar y actualizar
claude --version
claude update

# 2. uv (si no está instalado)
winget install --id=astral-sh.uv -e
uv tool update-shell          # agrega las herramientas al PATH; reinicia la terminal

# 3. Graphify con la versión fijada del equipo
uv tool install "graphifyy==0.9.65"
uv tool list                  # debe mostrar: graphifyy v0.9.65

# 4. Registrar el skill de Graphify en Claude Code (variante Windows/PowerShell)
graphify install --platform windows

# 5. Desactivar la reconstrucción automática en hooks de Git (ver nota)
[Environment]::SetEnvironmentVariable('GRAPHIFY_SKIP_HOOK', '1', 'User')

# 6. Mostrar correctamente rutas con tildes (p. ej. "Aplicación")
git config --global core.quotepath off
```

### 4.2 Por clon del repositorio (una vez por cada clon)

> **Importante:** clona el repositorio **fuera** de carpetas sincronizadas (OneDrive, Dropbox, iCloud). La sincronización puede bloquear o corromper archivos de `.git/`. Ruta recomendada: `C:\dev\EMRGEN`.

```powershell
git clone https://github.com/Mtipla/EMRGEN.git C:\dev\EMRGEN
cd C:\dev\EMRGEN
git switch <tu-rama>              # alonso | diego | gabriel
git fetch origin
git merge origin/graphify         # trae el grafo compartido

# 1. Registrar el intérprete local de Graphify (archivo NO versionado).
#    Se escribe sin BOM: Out-File/Set-Content en PowerShell 5.1 agregan BOM y rompen la ruta.
$py = Join-Path (uv tool dir).Trim() 'graphifyy\Scripts\python.exe'
[IO.File]::WriteAllText("$PWD\graphify-out\.graphify_python", $py, (New-Object Text.UTF8Encoding $false))

# 2. Registrar el merge driver de graph.json en la config local de Git
graphify hook install
graphify hook status              # verificar
git status                        # no debe haber cambios; si aparece .gitattributes modificado, avisa al Tech Lead

### 4.3 Configuración del repositorio (una sola vez, la realiza el Tech Lead)

Estos cambios se hacen en la rama del Tech Lead, se integran a `main` mediante PR y luego se propagan a `graphify` según la sección [6.4](#64-actualizar-y-publicar-el-grafo-en-graphify).

**a) Agregar a `.gitignore`:**

```gitignore
# Graphify: archivos locales de cada máquina (NO versionar)
graphify-out/.graphify_python
graphify-out/.graphify_root
graphify-out/.graphify_detect.json
graphify-out/.graphify_extract.json
graphify-out/.graphify_incremental.json
graphify-out/memory/

# Claude Code: configuración personal
.claude/settings.local.json
CLAUDE.local.md
```

**b) Crear `.gitattributes`:**

```gitattributes
# Merge driver de Graphify: une (union-merge) dos versiones de graph.json en vez de generar conflicto
graphify-out/graph.json merge=graphify
# Contraer los archivos generados en los diffs de Pull Requests de GitHub
graphify-out/** linguist-generated=true
```

**c) Dejar de versionar los archivos con rutas absolutas** (actualmente contienen rutas de una máquina concreta):

```powershell
git rm --cached graphify-out/.graphify_python graphify-out/.graphify_root
```

**d) Integrar Graphify en Claude Code a nivel de proyecto:**

```powershell
graphify claude install
```

Esto crea una sección `## graphify` en `CLAUDE.md` y un hook `PreToolUse` en `.claude/settings.json`. **Antes de hacer commit, revisa `.claude/settings.json`:** no debe contener rutas absolutas (`C:\Users\...`). Si aparecen, reemplázalas por el comando `graphify` sin ruta.


```markdown
## Reglas del equipo (obligatorias)

- NO hagas commit de cambios en `graphify-out/` salvo que la rama actual sea `graphify`.
- Si regeneras el grafo en una rama individual para consultas locales, descarta los cambios con `git restore graphify-out` antes de hacer commit.
- NO ejecutes `/graphify .` (reconstrucción completa) fuera de la rama `graphify`.
- NO hagas push a `main`, a `graphify` ni a ramas de otros desarrolladores.
- NO uses `git push --force`, `git rebase` sobre ramas publicadas ni `git reset --hard` sin confirmación explícita.
- Usa `git add <archivos>` específicos; nunca `git add -A` sin revisar `git status`.
```

**f) Commit y PR:**

```powershell
git add .gitignore .gitattributes CLAUDE.md .claude/settings.json
git commit -m "chore: estandarizar configuración de Graphify y Claude Code"
git push origin <rama-del-tech-lead>
gh pr create --base main --title "chore: estandarizar Graphify y Claude Code" --body "Configuración compartida según CONTRIBUTING.md"
```

**g) Protección de ramas en GitHub** (*Settings → Branches → Add rule*):

| Rama | Reglas |
|---|---|
| `main` | Requerir PR, requerir **1 aprobación**, bloquear force push, bloquear eliminación |
| `graphify` | Bloquear force push, bloquear eliminación |
| `alonso`, `diego`, `gabriel` | Bloquear force push, bloquear eliminación |

---

## 6. Git Workflow

### 6.1 Reglas de oro

1. **Cada desarrollador escribe solo en su rama** (`alonso`, `diego` o `gabriel`). Nunca hagas push a la rama de otra persona.
2. **No se hace merge directo entre ramas individuales.** El trabajo de otra persona llega a tu rama solo a través de `main`, después de su PR.
3. **Merge, no rebase**, en todas las ramas publicadas. Nunca uses `git push --force`.
4. **`graphify-out/` solo cambia en la rama `graphify`.**
5. **Haz push de tu rama al menos al final de cada jornada** (sirve como respaldo).
6. **Nunca subas secretos** (`.env`, credenciales de MySQL, PayPal, Twilio o Google Maps).
7. **Mensajes de commit** con formato *Conventional Commits*: `feat(backend): ...`, `fix(web): ...`, `docs: ...`, `chore(graphify): ...`.

### 6.2 Ciclo diario en tu rama individual

```powershell
# Al empezar el día
git switch <tu-rama>
git pull --ff-only origin <tu-rama>
git fetch origin
git merge origin/main              # incorpora lo que ya se aprobó
git merge origin/graphify          # incorpora el grafo más reciente (ver 6.3)

# Durante el trabajo
git status                         # revisa que graphify-out/ NO aparezca modificado
git add <archivos-específicos>
git commit -m "feat(mobile): enviar ubicación en tiempo real con la alerta"

# Al terminar el día
git push origin <tu-rama>
```

### 6.3 Extraer los datos más recientes de `graphify` hacia tu rama

**Cuándo:** al empezar el día, cada vez que el equipo avise que el grafo se actualizó y **siempre antes de abrir un PR a `main`**.

```powershell
git switch <tu-rama>
git status                                   # el árbol de trabajo debe estar limpio
git restore graphify-out                     # descarta regeneraciones locales, si las hubo
git fetch origin
git merge origin/graphify -m "merge: sincronizar grafo desde graphify"
git diff --stat origin/graphify -- graphify-out   # debe quedar VACÍO (tu grafo es idéntico al compartido)
git push origin <tu-rama>
```

- Como tú nunca modificas `graphify-out/`, este merge no debería generar conflictos en el grafo.
- Si aun así hay conflicto en `graphify-out/`, la versión correcta siempre es la de `graphify`:

  ```powershell
  git checkout --theirs -- graphify-out
  git add graphify-out
  git commit
  ```

### 6.4 Actualizar y publicar el grafo en `graphify`

**Cuándo es obligatorio:** **después de cada PR integrado a `main`**. El grafo compartido debe reflejar siempre el código de `main`.

**Quién lo hace:** **el autor del PR que se acaba de integrar**, el mismo día. Así las actualizaciones quedan en orden y nunca hay dos personas actualizando a la vez.

**Cuándo es opcional:** cuando cambian documentos importantes (`.md`, `.docx`, PDF) sin cambios de código. En ese caso se necesita la actualización semántica con Claude Code (ver paso 3b).

**Nunca:** con código de una rama individual que todavía no está en `main`.

```powershell
# 0. Avisar en el canal del equipo: "Actualizando graphify (main@<sha>)"

# 1. Posicionarse en graphify, actualizado
git fetch origin
git switch graphify
git pull --ff-only origin graphify

# 2. Traer el código de main (graphify = main + grafo)
git merge origin/main -m "merge: sincronizar main en graphify"

# 3a. Cambios de código: actualización incremental (AST, sin LLM, sin costo de tokens)
graphify update .

# 3b. Cambios en documentos: actualización semántica desde Claude Code (consume tokens)
#     claude  →  /graphify . --update

# 4. Verificar antes del commit
git diff --stat -- graphify-out                     # revisar la magnitud del cambio
git diff --stat origin/main..HEAD -- . ':!graphify-out'   # debe quedar VACÍO: solo cambia el grafo
graphify god-nodes                                  # verificación rápida de que el grafo es coherente

# 5. Commit y push
git add graphify-out
git commit -m "chore(graphify): actualizar grafo a main@$(git rev-parse --short origin/main)"
git push origin graphify

# 6. Avisar en el canal del equipo: "graphify actualizado, hagan merge de origin/graphify"
```

**Si el push es rechazado** (otra persona actualizó primero):

```powershell
git pull origin graphify            # el merge driver une graph.json automáticamente
graphify update .                   # vuelve a dejar el grafo coherente
git add graphify-out
git commit -m "chore(graphify): reconciliar grafo"
git push origin graphify
```

**Si `graphify update` se niega a sobrescribir** porque el nuevo grafo tiene menos nodos: confirma que en `main` se eliminó código intencionalmente y ejecuta `graphify update . --force`.

---

## 7. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `graphify: command not found` | El directorio de herramientas de uv no está en el PATH | `uv tool update-shell` y reiniciar la terminal y VS Code |
| `WinError 123` o una ruta inválida al ejecutar Graphify | `.graphify_python` se escribió con BOM (`Out-File`/`Set-Content`) | Volver a crearlo con el comando `WriteAllText` de la sección [4.2](#42-por-clon-del-repositorio-una-vez-por-cada-clon) |
| `.graphify_python` desapareció después de un merge | Migración única: el archivo dejó de versionarse (sección 4.3-c) | Volver a crearlo según la sección 4.2; ahora Git lo ignora |
| Diff gigante en `graphify-out/cache/` | Versión de Graphify distinta de la del equipo | `uv tool list`; reinstalar con `uv tool install "graphifyy==0.9.65" --reinstall` |
| `graphify-out/` aparece modificado en tu rama | Hooks activos o regeneración local | `git restore graphify-out`; confirmar que `GRAPHIFY_SKIP_HOOK=1` está configurada |
| Conflicto en `graph.json` | Merge driver no registrado en tu clon | `graphify hook install`; en tu rama, resolver con `git checkout --theirs -- graphify-out` |
| Claude no usa el grafo | Claude Code no se abrió desde la raíz o falta la sección en `CLAUDE.md` | Abrir `claude` en la raíz del repo; verificar la sección `## graphify` de `CLAUDE.md` |
| Errores de bloqueo en `.git/index.lock` | Repositorio dentro de OneDrive/Dropbox | Clonar fuera de carpetas sincronizadas (`C:\dev\EMRGEN`) |
| Rutas mostradas como `Aplicaci\303\263n` | Configuración `core.quotepath` | `git config --global core.quotepath off` |

---

## 8. Referencia rápida de comandos

| Acción | Comando |
|---|---|
| Traer el grafo compartido a mi rama | `git fetch origin; git merge origin/graphify` |
| Traer lo aprobado en `main` a mi rama | `git fetch origin; git merge origin/main` |
| Descartar un grafo regenerado localmente | `git restore graphify-out` |
| Actualizar el grafo compartido (en `graphify`) | `git merge origin/main; graphify update .` |
| Consultar el grafo | `graphify query "<pregunta>"` |
| Verificar la versión de Graphify | `uv tool list` |
| Verificar el merge driver y los hooks | `graphify hook status` |
| Abrir un PR a `main` | `gh pr create --base main --head <tu-rama>` |
