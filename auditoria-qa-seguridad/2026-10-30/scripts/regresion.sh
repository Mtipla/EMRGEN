#!/usr/bin/env bash
# Ejecuta las suites automatizadas EXISTENTES del proyecto, cada una con su log en evidencias/.
# pytest se dirige a la BD aislada (55710) con EMERGEN_ENVIRONMENT=test: nunca a localhost:5433.
# Jest/Vitest usan scripts/security-run.mjs del proyecto (filtra variables y bloquea red).
# Uso: AUD_PYTHON=<python del venv 3.12> bash regresion.sh
HERE="$(cd "$(dirname "$0")" && pwd)"
APP="$HERE/../../../Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación"
EV="$HERE/../evidencias"
cd "$APP" || exit 1
run() { local name="$1"; shift; echo "== $name: $*" > "$EV/reg-$name.log"; ( "$@" ) >> "$EV/reg-$name.log" 2>&1; echo "exit=$?" >> "$EV/reg-$name.log"; echo "$name terminado: $(tail -1 "$EV/reg-$name.log")"; }

run jest-backend-unit node scripts/security-run.mjs jest
run jest-backend-e2e node scripts/security-run.mjs jest --config test/jest-e2e.json
run vitest-web node scripts/security-run.mjs vitest --root apps/web --mode security-check
run vitest-mobile node scripts/security-run.mjs vitest --root apps/mobile --config vite.config.ts --mode security-check
run vitest-api-client node scripts/security-run.mjs vitest --root packages/api-client
run node-test-scripts node --test scripts/seed-safety.test.cjs scripts/api-environment.test.mjs scripts/android-lan-env.test.mjs scripts/expected-schema.test.cjs apps/desktop/electron/main.test.cjs
run node-test-backup node --experimental-vm-modules --test scripts/backup-db.test.mjs
cd services/internal-api || exit 1
SECRET=$(node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))")
run pytest env -u DB_PASSWORD EMERGEN_ENVIRONMENT=test DB_HOST=127.0.0.1 DB_PORT=55710 DB_USER=aud_synthetic DB_NAME=emergen_aud_test \
  JWT_SECRET="$SECRET" PYTHONDONTWRITEBYTECODE=1 "$AUD_PYTHON" -B -m pytest -q -p no:cacheprovider tests
