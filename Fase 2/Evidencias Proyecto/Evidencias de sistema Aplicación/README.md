# EMERGEN - Ecosistema Multiplataforma de Alertas

Este directorio contiene el monorepo del proyecto EMERGEN, integrado por la aplicación web, móvil, de escritorio y el servidor backend centralizado.

## 🛠️ Herramientas y Requisitos Previos

Cada miembro del equipo debe tener instalado:
* **Node.js (v24.21.0 LTS):** [Descargar](https://nodejs.org/)
* **Docker Desktop:** [Descargar](https://www.docker.com/products/docker-desktop)
* **Visual Studio Code:** Extensiones obligatorias: ESLint, Prettier.
* **Git:** Para clonar y gestionar ramas.
* **Dependencias Globales:** Ejecutar en terminal `npm install -g turbo @nestjs/cli @ionic/cli`

## 🏗️ Estructura del Monorepo

* `apps/backend/`: API REST en NestJS. Gestiona la seguridad (RBAC) y la conexión a PostgreSQL.
* `apps/web/`: Aplicación React + Vite para clientes.
* `apps/mobile/`: Aplicación Ionic + React + Capacitor para iOS/Android con GPS.
* `apps/desktop/`: Panel Administrativo en Electron + React.

## Comandos de ejecución de las aplicaciones

> Para la ejecución de cada entorno, es necesario e **IMPORTANTISIMO** asegurarse estar en la raiz del monorepo (Fase 2/ Evidencias Proyecto) y utilizar los comandos de Turborepo para levantar las aplicaciones, los comandos són:

## Para la aplicación WEB
-----
* **npx turbo run dev --filter=web**
-----

## Para la aplicación MOVIL
-----
* **npx turbo run dev --filter=mobile**
-----

## Para la aplicación de ESCRITORIO
----
* **npx turbo run dev --filter=desktop**
----

## 🚀 Guía de Instalación y Ejecución

**Importante:** Todos los comandos deben ejecutarse ubicados dentro de la carpeta `Fase 2/Evidencias Proyecto`.

### 1. Preparar el Entorno y Dependencias
Clona el repositorio, navega a esta carpeta e instala las dependencias del monorepo:
```bash
npm install


### 2. Levantar Base de Datos
Se debe ejecutar Docker Desktop y dejar en segundo plano, y se utilizan los siguientes comandos en bash para su control:

### 2.1 Para eliminar contenedor y volumen para un inicio LIMPIO: **ESTA OPCIÓN ELIMINA LOS DATOS CONTENIDOS EN LAS TABLAS** 
- docker-compose down -v

### 2.2 Para apagar el contenedor y NO perder datos:
- docker-compose down

### 2.3 Para levantar contenedor y volumen nuevamente:**
- docker-compose up --build -d

Cualquier cambio realizado a los contenedores/volumenes debe seguir el siguiente orden:

**Eliminar Contenedor -> Realizar modificaciones -> Levantar contenedor**


