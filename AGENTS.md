# Instrucciones del proyecto

## Protección de init.sql

Por instrucción expresa del usuario, los archivos `init.sql` de este proyecto se protegen frente a cambios propios. Se permite incorporar cambios existentes de la rama de origen al hacer merge.

- No editarlo, sobrescribirlo, regenerarlo ni reformatearlo fuera de la incorporación de cambios existentes de otra rama durante un merge.
- Al hacer merge, está autorizado incorporar los cambios de `init.sql` de la rama de origen, incluidos los de `gabriel`, sin introducir modificaciones adicionales propias.
- Si una tarea requiere un cambio propio en `init.sql`, presentar únicamente sugerencias al usuario, sin aplicarlas al archivo, salvo autorización expresa.
- Esta regla se aplica a todas las tareas y futuras sesiones de trabajo sobre este proyecto.

## Commits y publicación

- Los commits, push y operaciones similares quedan a cargo del usuario.
- Dejar los cambios pendientes para que el usuario los revise y haga commit. No crear commits ni subir cambios automáticamente.
