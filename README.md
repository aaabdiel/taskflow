\# TaskFlow - MVP Gestor de Tareas



Aplicación web Full Stack desarrollada para administrar las tareas de un equipo, reemplazando el uso de hojas de cálculo por una interfaz moderna, rápida y con persistencia de datos.



\## Alcance del Proyecto



\*\*Dentro del alcance (In-Scope):\*\*

\- CRUD completo de tareas (Crear, Leer, Actualizar, Eliminar).

\- Interfaz web responsive con validaciones básicas.

\- Filtros combinables por estado, prioridad y búsqueda por título.

\- Panel de estadísticas (Dashboard) en tiempo real.

\- Backend con API REST, validación de datos y manejo de errores HTTP.

\- Base de datos relacional persistente (SQLite).

\- Pruebas automatizadas para los endpoints principales.



\*\*Fuera del alcance (Out-of-Scope) - \*Decisiones conscientes para el MVP\*:\*\*

\- \*\*Autenticación y Autorización:\*\* No se implementaron usuarios ni roles (login/registro) para mantener el enfoque en la funcionalidad principal solicitada.

\- \*\*Paginación:\*\* El listado devuelve todas las tareas, ideal para un equipo pequeño.

\- \*\*Despliegue en la nube:\*\* La aplicación está diseñada para ejecutarse localmente.



\## Casos de Uso Principales



1\. \*\*Gestión de Tareas (CRUD):\*\*

&#x20;  - \*Como usuario, quiero\* crear una tarea con título, descripción, prioridad y estado, \*para\* registrar nuevas actividades.

&#x20;  - \*Como usuario, quiero\* editar los detalles de una tarea existente, \*para\* corregir o actualizar su información.

&#x20;  - \*Como usuario, quiero\* eliminar tareas que ya no son necesarias, \*para\* mantener el tablero limpio.

2\. \*\*Seguimiento de Progreso:\*\*

&#x20;  - \*Como usuario, quiero\* cambiar el estado de una tarea (Pending, In Progress, Completed), \*para\* reflejar su avance real.

3\. \*\*Visualización y Búsqueda:\*\*

&#x20;  - \*Como usuario, quiero\* filtrar las tareas por estado y prioridad, \*para\* enfocarme en lo que es urgente.

&#x20;  - \*Como usuario, quiero\* buscar tareas por su título, \*para\* encontrar información específica rápidamente.

&#x20;  - \*Como usuario, quiero\* ver un resumen estadístico, \*para\* conocer de un vistazo la carga de trabajo del equipo.



\## Tecnologías Utilizadas



\- \*\*Frontend:\*\* React, Vite, TypeScript, CSS puro.

\- \*\*Backend:\*\* Node.js, Express, TypeScript.

\- \*\*Base de Datos:\*\* SQLite (módulo nativo `node:sqlite`).

\- \*\*Validación:\*\* Zod.

\- \*\*Pruebas:\*\* Vitest + Supertest.



\## Decisiones Técnicas Detalladas



\- \*\*¿Por qué `node:sqlite` y no `better-sqlite3`?\*\*

&#x20; Se eligió el módulo nativo incluido en Node.js (versión 22+) para evitar la compilación de código C++ en Windows (que requiere Visual Studio Build Tools y suele fallar en entornos limpios). Esto hace que el proyecto sea 100% portable y fácil de instalar. Al ser un solo archivo (`tasks.db`), garantiza persistencia real.

\- \*\*¿Por qué Zod para validación?\*\*

&#x20; Zod permite definir un "esquema de verdad" en el backend. Si el frontend envía datos corruptos (ej. un título vacío o un estado no permitido), Zod intercepta la petición y el backend responde con un HTTP 400 controlado, evitando que la base de datos se ensucie.

\- \*\*¿Por qué React + Vite?\*\*

&#x20; Vite ofrece un entorno de desarrollo instantáneo. Se usó el estado nativo de React (`useState`, `useEffect`) en lugar de herramientas como Redux, ya que para el tamaño de este MVP, Redux sería sobre-ingeniería.

\- \*\*¿Por qué Vitest + Supertest?\*\*

&#x20; Para garantizar la calidad del código sin necesidad de hacer pruebas manuales en el navegador cada vez que se modifica algo. Se prueban los "caminos felices" (creación exitosa) y los "caminos de error" (validación de Zod).



\## Cómo instalar y ejecutar (Paso a Paso)



El proyecto está dividido en dos carpetas: `backend` y `frontend`. Necesitarás \*\*dos terminales\*\* abiertas y tener instalado \*\*Node.js (v22 o superior)\*\*.



\### Terminal 1: Backend

```bash

\# 1. Entrar a la carpeta del backend

cd backend



\# 2. Instalar dependencias

npm install



\# 3. Iniciar el servidor (se ejecutará en http://localhost:3000)

npm run dev

