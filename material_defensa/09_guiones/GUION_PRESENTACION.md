# Guion de presentación (10 a 15 minutos)

Escrito para: estudiante que expone el proyecto ante la comisión.

**Tiempo total objetivo:** 12 minutos, más preguntas.

| Bloque | Minutos | Diapositiva o demostración |
|---|---|---|
| 1. Problema y objetivo | 1,5 | Una diapositiva |
| 2. Usuarios y funcionalidades | 1,5 | Una diapositiva |
| 3. Arquitectura | 2 | Diagrama de [ARQUITECTURA.md](../01_arquitectura/ARQUITECTURA.md) §1 |
| 4. Flujo de inicio de sesión | 2 | Código: `login.service.ts:111` |
| 5. Flujo del SOS | 2,5 | Código: `services/alertas.py:27` y diagrama de secuencia |
| 6. Seguridad | 1,5 | Tabla de [GUIA_COMPLETA_DEFENSA.md](../07_guias_estudio/GUIA_COMPLETA_DEFENSA.md) cap. 7 |
| 7. Limitaciones y trabajo futuro | 1 | [PUNTOS_CRITICOS.md](../10_informes/PUNTOS_CRITICOS.md) resumen |
| 8. Cierre | 0,5 | Una frase |

## 1. Problema y objetivo (1,5 min)

Decir: "EMERGEN es una plataforma para avisar a personas de confianza cuando alguien necesita ayuda. Un SOS desde el móvil registra la alerta y envía un mensaje por WhatsApp con la ubicación."

Mencionar el alcance: web, móvil y panel de escritorio, con dos servicios de backend y una base PostgreSQL.

## 2. Usuarios y funcionalidades (1,5 min)

Enumerar los cuatro tipos: usuario, apadrinado, administrador y soporte.

Nombrar las funcionalidades en grupos: acceso, cuenta y apadrinados, compras, SOS, soporte y administración. No leer la lista completa.

## 3. Arquitectura (2 min)

Mostrar el diagrama de componentes. Puntos a decir:

- Tres interfaces, un cliente compartido (`packages/api-client`).
- NestJS para cuentas, compras y administración.
- FastAPI para SOS y tickets, porque el SOS es crítico y debe ser simple.
- PostgreSQL compartida. Decir explícitamente que es un acoplamiento y por qué se eligió (transacciones simples).
- JWT emitido por NestJS y verificado en ambos servicios.

## 4. Flujo de inicio de sesión (2 min)

Abrir `apps/backend/src/login/login.service.ts` en la línea 111. Recorrer:

1. Se busca el usuario por correo y se compara la contraseña con bcrypt. Si no existe, se compara contra un hash ficticio.
2. Si es apadrinado, se rechaza. Si tiene perfiles con PIN, se elige perfil.
3. Se firma el JWT (línea 139) con el id del usuario y su correo.
4. En cada petición, `JwtAuthGuard` verifica el token y relee el usuario en la base.

Mencionar la prueba: "Las nueve pruebas de este flujo pasaron en la revisión."

## 5. Flujo del SOS (2,5 min)

Abrir `services/internal-api/app/services/alertas.py` en la línea 27. Recorrer:

1. La clave de idempotencia evita alertas duplicadas.
2. Se bloquea la fila del usuario (`FOR UPDATE`).
3. Se validan plan, contactos y alertas activas.
4. Se crean la alerta y una fila de envío por contacto, en una sola transacción.
5. El dispatcher de NestJS toma esas filas con `SKIP LOCKED` y envía por WhatsApp.
6. El cierre exige PIN; cinco fallos bloquean 15 minutos.
7. Si nadie cierra, el sistema lo hace a las 24 horas.

## 6. Seguridad (1,5 min)

Decir las medidas: JWT con emisor y audiencia, bcrypt, guards por rol, validación con DTO y Pydantic, límite de cuerpo, bloqueo de PIN, idempotencia.

**Antes de terminar este bloque, reconocer los riesgos.** Decir: "Encontré tres rutas sin autenticación, que la regla de acceso por plataforma no está implementada y que hay dos políticas de PIN distintas. Están documentadas en el material de estudio."

## 7. Limitaciones y trabajo futuro (1 min)

- WhatsApp por Baileys, que no es API oficial.
- Límite de tasa en memoria.
- Documentación citada que falta.
- Pruebas de FastAPI y de frontends no ejecutadas en la revisión.

## 8. Cierre (0,5 min)

"El sistema registra y envía el SOS de forma verificable y protegida. Conozco sus límites y los documenté, y sé qué corregiría primero."

---

## Preguntas que sigue la comisión

Si preguntan algo que no sabes, di: "No lo verifiqué en esta revisión. Lo revisaría en [archivo]." No inventes una respuesta.

Consulta [PREGUNTAS_DEFENSA.md](../08_preguntas_defensa/PREGUNTAS_DEFENSA.md) para las preguntas más probables.
