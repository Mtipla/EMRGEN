## 📖 Descripción del Proyecto

**EMERGEN** es una plataforma de alertas de emergencia con una web, una aplicación móvil y un panel administrativo de escritorio. Reúne la gestión de usuarios, cuentas apadrinadas, contactos, planes, compras, alertas SOS y soporte.

- **¿Qué problema aborda?:** Facilitar la comunicación y el seguimiento de emergencias, centralizando la información del usuario, sus contactos y el historial de alertas.
- **¿A quién va dirigido?:** Al público general, especialmente a personas dependientes, adultos mayores y usuarios vinculados con cuidadores o contactos de confianza.

---

## 🛠️ Tecnologías Utilizadas

Las aplicaciones se organizan en un monorepo con **npm workspaces y Turborepo**, compartiendo componentes y contratos de datos.

- **Lenguajes:** TypeScript y Python.
- **Backend:** Node.js con NestJS para cuentas, permisos, compras y administración; FastAPI para SOS y soporte.
- **Base de Datos:** PostgreSQL 15 con TypeORM y 34 tablas definidas en `init.sql`.
- **Web:** React 19, Ionic React y Vite.
- **App Móvil:** Ionic React y Capacitor, con su propio punto de entrada.
- **Escritorio:** React y Electron para el panel administrativo.
- **Entorno y Calidad:** Docker Compose, ESLint, oxlint, Prettier, Jest, Vitest, Cypress y pytest.
- **Servicios e Integraciones:**
  - PayPal: pagos de planes y cupos.
  - Firebase Authentication: verificación de correo y herramientas de recuperación de contraseña. Las sesiones JWT las emite NestJS.
  - jsReport: reportes PDF y Excel.
  - Google Maps Platform: mapas y geocodificación.
  - mindicador.cl: indicadores económicos para la conversión de precios.
  - WhatsApp mediante Baileys: envío de SOS a los contactos de emergencia con mensaje personalizado y ubicación.

---

## ⚙️ Instrucciones para ejecutar el proyecto localmente

Requiere **Node.js 24.21.0, npm 11.19.x, Python 3.12+ y Docker Desktop**. Consulta la [guía de instalación y ejecución](<Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/README.md>) para configurar `.env`, instalar dependencias e iniciar las aplicaciones.

Ejecuta los comandos desde `Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/`. Docker Compose inicia PostgreSQL y NestJS; FastAPI y jsReport se ejecutan por separado. Los datos de prueba se explican en [la guía de la base de datos](<Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación/README_BDD.md>).

---

## 👨‍💻 Integrantes del Equipo y Roles

| Nombre               | Rol                  | Función Principal                 | Tareas                                                         |
| -------------------- | -------------------- | --------------------------------- | -------------------------------------------------------------- |
| **Julio Tapia**      | Product Owner        | Orientar el alcance del proyecto. | Priorizar funcionalidades y validar criterios de aceptación.   |
| **Gabriel Valencia** | Scrum Master         | Facilitar el trabajo con Scrum.   | Coordinar reuniones y apoyar la gestión del Product Backlog.   |
| **Alonso González**  | Equipo de Desarrollo | Implementar la solución.          | Diseñar la BD, desarrollar funcionalidades y realizar pruebas. |
| **Diego Plaza**      | Equipo de Desarrollo | Implementar la solución.          | Diseñar la BD, desarrollar funcionalidades y realizar pruebas. |

---

## 🔄 Metodología de Trabajo

El equipo utiliza **Scrum**, organizando el Product Backlog en sprints y revisando avances, pruebas y prioridades mediante reuniones de planificación, seguimiento y retrospectiva.

---

## 🏗️ Arquitectura de la Solución

- **Capa de Datos:** PostgreSQL compartido por NestJS y FastAPI, con restricciones y triggers de integridad.
- **Capa de Negocio:** NestJS gestiona cuentas, permisos, planes, compras e integraciones. FastAPI gestiona SOS, su cierre automático y soporte, utilizando las mismas sesiones JWT.
- **Capa de Presentación:** Tres aplicaciones independientes comparten paquetes de interfaz y acceso a las APIs:
  1. **Web:** Sitio público, registro, cuenta y compra de planes.
  2. **Móvil:** Acceso del usuario, gestión de su cuenta y alertas SOS.
  3. **Escritorio:** Administración de usuarios, consulta de alertas, compras, bitácora y reportes.
