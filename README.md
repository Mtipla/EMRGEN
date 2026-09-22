## 📖 Descripción del Proyecto
**Emergen** es una aplicación diseñada para brindar una solución rápida, ágil y efectiva en situaciones que requieran un llamado de emergencia (incidentes médicos, domésticos o accidentes urbanos). Además, el sistema permite la trazabilidad y gestión de equipos de respuesta.

* **¿Qué problema resuelve?:** Reduce drásticamente los tiempos de espera y la falta de información en situaciones críticas. Complementa la alerta de emergencia entregando detalles específicos y vitales (ubicación en tiempo real, contexto y datos médicos) para el personal de rescate, solucionando problemas de falta de contexto o pérdida de ubicación.
* **¿A quién va dirigido?:** Al público general, enfocándose en usuarios en situación de alto riesgo (sectores con alta tasa de incidentes) y personas dependientes o con condiciones de salud que necesiten comunicar su estado rápidamente a sus "contactos de emergencia" o cuidadores.

---

## 🛠️ Tecnologías Utilizadas
El proyecto se aloja en un único repositorio gestionado con **Turborepo** para centralizar la lógica y garantizar un mismo ambiente de desarrollo.

* **Lenguaje de Programación:** TypeScript (garantiza tipado unificado entre frontend y backend).
* **Backend y API REST:** Node.js con el framework Nest.js para la confección de APIs internas.
* **Base de Datos:** MySQL (Base de datos relacional con 30 tablas normalizadas para garantizar la integridad de los datos).
* **Frontend (App Web):** React / Angular con componentes base de Ionic.
* **App de Escritorio (Administración):** Electron (exporta la app web como software ejecutable local para gestionar la plataforma).
* **App Móvil:** Capacitor (herramienta nativa de Ionic para exportar la app web a móvil).
* **Servicios y APIs Externas:** 
  * PayPal REST API
  * Twilio SendGrid Email Validation
  * jsReport API
  * Google Maps Platform API

---

## ⚙️ Instrucciones para ejecutar el proyecto localmente

*[Espacio reservado: Detallar aquí los pasos de instalación, comandos como `npm install`, configuración de variables de entorno `.env`, scripts de ejecución de Turborepo y credenciales de la base de datos local]*

---

## 👨‍💻 Integrantes del Equipo y Roles

| Nombre | Rol | Función Principal | Tareas |
|---|---|---|---|
| **Julio Tapia** | Product Owner | Maximizar el valor del proyecto y asegurar que el sistema resuelva el problema de trazabilidad y gestión de equipos. | Definir funcionalidades, validar criterios de aceptación y ajustar prioridades tras cada iteración. |
| **Gabriel Valencia** | Scrum Master | Facilitar la adopción de la metodología Scrum y asegurar la fluidez del proceso de desarrollo. | Organizar reuniones metodológicas y apoyar la gestión efectiva del Product Backlog. |
| **Alonso González** | Equipo de Desarrollo | Construir la solución informática transformando requerimientos en módulos funcionales. | Diseñar la BD, programar lógica, desarrollar interfaces y realizar pruebas. |
| **Diego Plaza** | Equipo de Desarrollo | Construir la solución informática transformando requerimientos en módulos funcionales. | Diseñar la BD, programar lógica, desarrollar interfaces y realizar pruebas. |

---

## 🔄 Metodología de Trabajo
Se utiliza el marco de trabajo **Scrum** para el desarrollo ágil del proyecto. El trabajo se divide en iteraciones (Sprints) enfocadas en transformar los requerimientos del *Product Backlog* en entregables funcionales. El equipo mantiene reuniones periódicas (Dailies, Plannings, Retrospectives) para asegurar la mejora continua y adaptar las prioridades según el valor entregado.

---

## 🏗️ Arquitectura de la Solución
El sistema utiliza una arquitectura basada en microservicios y un entorno monorepo (**Turborepo**). 
* **Capa de Datos:** MySQL almacena la información estructurada en 30 tablas normalizadas.
* **Capa de Negocio (Backend):** Una API REST centralizada construida en Nest.js procesa la lógica y se comunica con servicios externos (Google Maps, PayPal, Twilio, jsReport).
* **Capa de Presentación (Clientes):** Tres interfaces comparten la misma base lógica y de diseño mediante Ionic/TypeScript:
  1. **Web App:** Acceso general para usuarios.
  2. **Mobile App (Capacitor):** Interfaz nativa en smartphones para el envío de alertas en tiempo real y geolocalización.
  3. **Desktop App (Electron):** Panel de administración central para gestionar plataformas, usuarios y trazabilidad de los equipos.

*[Espacio reservado: Insertar diagrama de arquitectura de software o infraestructura aquí]*
