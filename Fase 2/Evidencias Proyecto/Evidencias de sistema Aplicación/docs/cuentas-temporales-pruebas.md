# Cuentas temporales de prueba: solo datos sintéticos

Actualizado el 30-10-2026. La versión histórica contenía identidades y credenciales de cuentas locales; se retiraron del documento sin mostrarlas ni modificar cuentas existentes. Limpiar esta copia no revoca credenciales ni elimina su historia Git. Su responsable debe revisar vigencia/exclusión del destino de hosting mediante un procedimiento autorizado.

## Perfiles necesarios

| Perfil | Identidad/credencial | Función que debe preservar la fixture |
|---|---|---|
| ADMINISTRADOR completo | <IDENTIDAD_Y_CLAVE_SINTETICAS_PRIVADAS> | Administración, reportes y transiciones reservadas |
| SOPORTE completo | <IDENTIDAD_Y_CLAVE_SINTETICAS_PRIVADAS> | Lectura permitida y atención de soporte; sin privilegios de administrador |
| Principal completo con plan/cupos | <IDENTIDAD_CLAVE_Y_PIN_SINTETICOS> | Contraseña → selección de perfil → PIN; compras y vínculo |
| Apadrinado completo/parcial | <PERFIL_Y_PIN_SINTETICOS> | PIN temporal/efectivo, acceso parcial y SOS autorizado |

No reutilizar identidades del historial ni atribuir a estas filas cuentas existentes en la base. Un hash bcrypt no vuelve seguro un password de demostración conocido.

## Preparar y usar pruebas

Usar fixtures de una base nueva y desechable, con entorno test, claves exclusivamente sintéticas y dobles de Firebase/PayPal/Maps/jsReport/WhatsApp instalados antes del bootstrap. No conectar a localhost:5433, .env operativo, backups o sesión Baileys. Los scripts de comprobación aislada y su evidencia se describen en [FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md](FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md).

El seed de desarrollo permanece manual y bloqueado por defecto: exige development/test explícito, indicadores coherentes, destino loopback, nombre de DB con sufijo _dev/_test y EMERGEN_SEED_EXPECTED_DB idéntico. Nunca usarlo para hosting, migrar usuarios o corregir un login. Su guardia puede comprobarse sin conectar mediante node --test scripts/seed-safety.test.cjs.

El registro real exige identidad Firebase verificada; los ejemplos históricos de creación/promoción directa de personal no son un procedimiento vigente. Para pruebas usar proveedor falso y fixtures, sin cambiar roles de cuentas existentes.

## Retirar cuentas de demostración del despliegue

El responsable identifica, con información local autorizada, qué cuentas son sintéticas y cuál es su relación con datos/planes/alertas. Decide exclusión/rotación antes del traslado, con respaldo y reglas de borrado/vínculo revisadas. No se ejecutaron consultas a usuarios, borrados, seeds ni promociones en el fortalecimiento.

Ver [OPERACION_SEGURA.md](OPERACION_SEGURA.md) para custodia, rotación, backup/rollback y restricciones. Las credenciales operativas deben permanecer en su gestor privado, nunca volver a esta tabla.
