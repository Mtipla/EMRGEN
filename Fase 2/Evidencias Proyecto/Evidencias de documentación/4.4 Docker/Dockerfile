# Se descarga la imagen base de Node.js
FROM node:20-alpine

# Se establece la carpeta de trabajo dentro del contenedor
WORKDIR /app

# Se instalan las herramientas globales necesarias para la arquitectura Monorepo
RUN npm install -g @nestjs/cli nx turbo @ionic/cli

# Comando inteligente que mantiene el contenedor activo en una carpeta vacía
CMD ["sh", "-c", "if [ -f package.json ]; then npm install && npm run start:dev; else echo 'Entorno preparado. Esperando inicialización del Monorepo...' && tail -f /dev/null; fi"]