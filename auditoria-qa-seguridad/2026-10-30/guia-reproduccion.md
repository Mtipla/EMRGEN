# Guía de reproducción

Fecha: 2026-10-30. Reproduce el entorno aislado y las pruebas de esta auditoría **sin tocar** los
servicios, datos ni `.env` del equipo. Todo corre en `127.0.0.1`, con BD en `tmpfs` y proveedores
externos sustituidos por dobles. Requiere Node 24, Docker Desktop y un Python 3.12.

Rutas relativas a la raíz del repo. `A` = `Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación`.

## 0. Prerrequisitos (una vez)

```bash
# Desde A: dependencias del monorepo ya instaladas (node_modules presente).
# Venv Python 3.12 propio para FastAPI (el .venv del equipo está en 3.14 sin bcrypt, QA-ENV-01):
py -V:Astral/CPython3.12.10 -m venv "$SCRATCH/venv312"
"$SCRATCH/venv312/Scripts/python.exe" -m pip install -r "A/services/internal-api/requirements.txt"
```

Define un directorio temporal fuera del repo para secretos efímeros, p. ej.
`export AUD_SCRATCH=<carpeta temporal>/aud` y `export AUD_PYTHON="$SCRATCH/venv312/Scripts/python.exe"`.

Los scripts están en `auditoria-qa-seguridad/2026-10-30/scripts/`.

## 1. BD desechable (lee init.sql, no lo modifica)

```bash
node scripts/bd-aislada.mjs up      # crea emergen-aud-claude-db en 127.0.0.1:55710 (tmpfs)
# ...al terminar todo:
node scripts/bd-aislada.mjs down    # detiene y elimina el contenedor (no deja volúmenes)
```

El script imprime el SHA-256 de `init.sql` antes y después (debe ser idéntico).

## 2. APIs aisladas (backend real + FastAPI real, proveedores dobles)

```bash
AUD_SCRATCH=... AUD_PYTHON=... node scripts/levantar-apis.mjs
# NestJS -> 127.0.0.1:3710 ; FastAPI -> 127.0.0.1:3711 ; Ctrl+C detiene ambos.
```

Antes, compila el backend a la caché ignorada (lo hace una vez el operador):

```bash
cd A && node node_modules/typescript/bin/tsc -p apps/backend/tsconfig.build.json \
  --outDir node_modules/.cache/emergen-aud-claude/dist --incremental false \
  --declaration false --sourceMap false
```

## 3. Datos sintéticos de personal

```bash
AUD_SCRATCH=... node scripts/sembrar-sintetico.mjs   # admin/soporte sintéticos + admin de fixture
```

## 4. Pruebas

```bash
# Funcional + seguridad (76 casos) contra las APIs aisladas:
AUD_SCRATCH=... node scripts/pruebas-api.mjs         # -> evidencias/casos-api.jsonl
AUD_SCRATCH=... node scripts/pruebas-seguridad.mjs   # -> evidencias/casos-seguridad.jsonl

# Suites existentes del proyecto (regresión):
AUD_PYTHON=... bash scripts/regresion.sh             # -> evidencias/reg-*.log

# Suite unitaria web con la config corregida (QA-REG-02):
cd A && node node_modules/vitest/vitest.mjs run --root apps/web \
  --config "<ruta absoluta>/scripts/vitest-web-aud.config.mjs"
```

## 5. Comandos puntuales útiles (sanitizados)

```bash
# Confirmar que las rutas genéricas están retiradas:
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:3710/payments/paypal/orders   # 404
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3710/maps/geocode?address=x            # 401

# Cabeceras de seguridad:
curl -s -D - -o /dev/null http://127.0.0.1:3710/health | grep -iE "x-content-type|x-frame|referrer|cache-control"

# Cifrado de ficha médica (no debe aparecer el texto en claro):
docker exec emergen-aud-claude-db psql -U aud_synthetic -d emergen_aud_test \
  -c "SELECT count(*) FROM antecedente_medico WHERE tipo_sangre='O+AUDIT'"   # 0
```

## 6. Limpieza

```bash
node scripts/bd-aislada.mjs down        # elimina la BD de auditoría
# El servidor web de prueba (si se levantó) y las APIs se detienen con Ctrl+C / TaskStop.
```

Ningún script escribe en la BD del equipo, en `.env`, en volúmenes persistentes ni en `init.sql`.
