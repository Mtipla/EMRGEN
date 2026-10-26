# Compra de plan Premium y cupos

El catálogo define el plan base 2 “PLAN BASE DEMOSTRACION” a **5000 CLP** y el cupo adicional 1 a **1000 CLP**. `init.sql` los incluye para instalaciones nuevas; en una BD existente se aplica `migraciones/002_precio_plan_base.sql`. La migración actualiza el precio y admite reservas de plan con cero cupos, conservando los datos existentes.

## Comprobación en la web

1. Iniciar sesión con una cuenta principal sin plan, por ejemplo `pruebacompraplan@emergen.test` si todavía no ha comprado uno.
2. En `/inicio`, tanto la cabecera como el botón principal dicen **Comprar Premium** y llevan a `/premium`.
3. `/premium` muestra **Valor de la cuenta Premium: $5.000**, encima del precio del cupo apadrinado y con el mismo formato.
4. Pulsar **Comprar Premium** abre `/comprar` con una unidad fija de plan, sin selector de cantidad.
5. Continuar con PayPal. Solo un pago confirmado con el importe correcto activa Premium; el plan no incluye cupos adicionales.
6. Al aceptar el resultado, se vuelve a `/inicio` con la sesión actualizada. Ambos accesos dicen **Comprar cupos de cuentas** y llevan directamente a `/comprar`, donde se elige la cantidad de cupos.

Una compra de plan pendiente impide crear una segunda. Puede retomarse, cancelarse antes del cobro o conciliarse cuando el resultado es incierto. Repetir la confirmación de un pago no activa otro plan ni concede cupos extra.

## API y pruebas automáticas

- `GET /compras/precio`: precios públicos `precioPlan` y `precioUnitario`.
- `GET /compras/resumen`: resumen autenticado con `tipoCompra=PLAN` sin plan o `CUPOS` con plan.
- `POST /compras/apadrinados/ordenes`: `{cantidad: 1, tipo: "PLAN"}` para el plan; `tipo: "CUPOS"` para cupos. Sin `tipo` conserva el comportamiento anterior de comprar cupos.
- Captura, cancelación, pendientes y conciliación conservan sus rutas existentes. El precio y el comprador se obtienen en el servidor.

Desde la raíz del monorepo, con PostgreSQL local disponible:

```powershell
npm run test --workspace=web
$env:DB_E2E='1'
npm run test:e2e --workspace=backend -- --runInBand compras.db.e2e-spec.ts
```

Estas pruebas usan PayPal simulado; comprueban navegación, actualización de sesión, concurrencia, importes, activación, cancelación y recuperación. Las pruebas de BD crean y eliminan su propia cuenta temporal.
