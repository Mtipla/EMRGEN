# Despliegue del Sistema EMERGEN

Este proyecto utilizará Docker para garantizar la portabilidad
y evitar conflictos de dependencias locales.
La infraestructura considera un motor de base de datos relacional PostgreSQL y un contenedor Node.js preparado para la arquitectura Monorepo que se busca trabajar. Ya que las aplicaciones a desarrollar
se exportarán del mismo codigo y se ejecutarán en un ambiente controlado para evitar inconsistencia en datos

# Importante: Dado a que esta es la primera fase del proyecto de Capstone, se maqueta el levantamiento de la arquitectura, asegurando el docker y sus archivos para la implementación rapida al momento de desarrollar

# Levantamiento de Infraestructura

# 1.- Abrir terminal en la ruta base del proyecto (Donde se encuentra el archivo 'docker-compose.yml').

# 2.- Ejectuar el comando para descargar, construir y levantar los contenedores en segundo plano
```bash
   docker-compose up --build -d