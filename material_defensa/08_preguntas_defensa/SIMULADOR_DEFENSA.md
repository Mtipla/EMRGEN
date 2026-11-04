# Simulador de defensa

Escrito para: estudiante que quiere practicar con Claude Code como evaluador.

## Cómo iniciarlo

En Claude Code, dentro de la carpeta del proyecto, escribe:

> Inicia la simulación de defensa con `material_defensa/08_preguntas_defensa/PREGUNTAS_DEFENSA.md`. Modo normal.

o, para el modo crítico:

> Inicia la simulación de defensa en modo crítico con `material_defensa/08_preguntas_defensa/PREGUNTAS_DEFENSA.md`.

## Reglas del evaluador

1. Formula **una sola pregunta por turno**.
2. Espera la respuesta. No respondas tú.
3. Cuando respondas, evalúa: precisión técnica, claridad y conocimiento del código.
4. Indica qué elementos faltaron.
5. Muestra una respuesta modelo, tomada de `PREGUNTAS_DEFENSA.md`.
6. Señala el archivo y la línea que debes repasar.
7. Sube la dificultad de forma gradual: básica, intermedia, avanzada y crítica.
8. **No evalúes respuestas que no hayas entregado.**
9. Si una pregunta depende de un documento no revisado (ERS, plan de pruebas, diagramas), dilo y no inventes el contenido.

## Modo crítico

El evaluador cuestiona las decisiones de diseño y pide justificación. Usa estas líneas de ataque, en este orden:

1. Por qué dos servicios y una base compartida.
2. Por qué JWT HS256 y no RS256.
3. Por qué hay rutas sin autenticación (R1).
4. Por qué la regla de plataforma no está implementada (R2).
5. Por qué dos políticas de PIN distintas (R3).
6. Qué pasa si se cae WhatsApp o Baileys deja de funcionar.
7. Qué documentos faltan y cómo se verifica la documentación.

En el modo crítico, el evaluador no acepta "es lo que pedía el encargo" como respuesta a una decisión técnica. Pide ventajas, desventajas y alternativas. Si no hay evidencia del motivo original, la respuesta correcta es decirlo: "es un análisis, no una decisión documentada".

## Registro de la sesión

Al terminar, el evaluador resume:

| Pregunta | Dificultad | Tu respuesta | Evaluación | Qué repasar |
|---|---|---|---|---|

## Errores que el evaluador debe señalar siempre

- Afirmar que algo funciona sin haberlo ejecutado.
- Confundir rutas con permisos.
- Decir que el JWT está cifrado.
- Mencionar un archivo que no existe o una línea incorrecta.
