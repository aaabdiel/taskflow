# TaskFlow - MVP Gestor de Tareas

Aplicación web Full Stack desarrollada para administrar las tareas de un equipo, reemplazando el uso de hojas de cálculo por una interfaz moderna, rápida y con persistencia de datos.

## Alcance del Proyecto

*Dentro del alcance (In-Scope):* 

- CRUD completo de tareas (Crear, Leer, Actualizar, Eliminar).

- Interfaz web responsive con validaciones básicas.

- Filtros combinables por estado, prioridad y búsqueda por título.

- Panel de estadísticas (Dashboard) en tiempo real.

- Backend con API REST, validación de datos y manejo de errores HTTP.

- Base de datos relacional persistente (SQLite).

- Pruebas automatizadas para los endpoints principales.


*Fuera del alcance (Out-of-Scope)*

- *Autenticación y Autorización:* No se implementaron usuarios ni roles (login/registro) para mantener el enfoque en la funcionalidad principal solicitada.

- *Paginación:* El listado devuelve todas las tareas, ideal para un equipo pequeño.

- *Despliegue en la nube:* La aplicación está diseñada para ejecutarse localmente.

## Funcionalidades

**Completadas**
- [x] Listar, crear, editar y eliminar tareas
- [x] Estados Pending / In Progress / Completed
- [x] Filtros por estado y prioridad
- [x] Búsqueda por título (opcional)
- [x] Panel de estadísticas (opcional)
- [x] Validación en frontend y backend (Zod)
- [x] Pruebas automatizadas de listado y creación

**Mejoras futuras**
- [ ] Pruebas de PATCH y DELETE, con base de datos aislada para tests
- [ ] Estadísticas globales independientes de los filtros
- [ ] Cambiar el estado directamente desde la tarjeta
- [ ] Debounce en el buscador
- [ ] Paginación, autenticación y despliegue

      
## Casos de Uso Principales

1. *Gestión de Tareas (CRUD):*

  - *Como usuario, quiero* crear una tarea con título, descripción, prioridad y estado, *para* registrar nuevas actividades.

  - *Como usuario, quiero* editar los detalles de una tarea existente, *para* corregir o actualizar su información.

 - *Como usuario, quiero* eliminar tareas que ya no son necesarias, *para* mantener el tablero limpio.

2. *Seguimiento de Progreso:*

 - *Como usuario, quiero* cambiar el estado de una tarea (Pending, In Progress, Completed), *para* reflejar su avance real.

3. *Visualización y Búsqueda:*

  - *Como usuario, quiero* filtrar las tareas por estado y prioridad, *para* enfocarme en lo que es urgente.

  - *Como usuario, quiero* buscar tareas por su título, *para* encontrar información específica rápidamente.

 - *Como usuario, quiero* ver un resumen estadístico, *para* conocer de un vistazo la carga de trabajo del equipo.

## API

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| GET | `/api/tasks?status=&priority=&search=` | Lista tareas (filtros opcionales) | 200 |
| POST | `/api/tasks` | Crea una tarea | 201, 400 |
| PATCH | `/api/tasks/:id` | Actualiza campos de una tarea | 200, 400, 404 |
| DELETE | `/api/tasks/:id` | Elimina una tarea | 204, 404 |

## Base de datos

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  priority TEXT NOT NULL DEFAULT 'Medium',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```
El archivo `backend/tasks.db` se crea solo al iniciar el servidor por primera vez.


## Tecnologías Utilizadas

- *Frontend:* React, Vite, TypeScript, CSS puro.

- *Backend:* Node.js, Express, TypeScript.

- *Base de Datos:* SQLite (módulo nativo `node:sqlite`).

- *Validación:* Zod.

- *Pruebas:* Vitest + Supertest.



## Decisiones técnicas

Usé React + Vite + TypeScript en el frontend con `useState`/`useEffect`, sin librerías de estado, porque para un MVP de una sola vista Redux sería sobreingeniería. El backend es una API REST con Express y TypeScript; elegí `PATCH` para las actualizaciones parciales y valido toda entrada con Zod, que responde 400 ante datos inválidos antes de tocar la base de datos. Para la persistencia usé SQLite con el módulo nativo `node:sqlite` (Node 22.13+), que evita compilar módulos en C++ en Windows, y todas las consultas son parametrizadas para prevenir inyección SQL; al ser un módulo experimental, en producción migraría a PostgreSQL o `better-sqlite3`. Las pruebas usan Vitest + Supertest sobre la API.

 ##  Uso de Inteligencia Artificial

Durante el desarrollo de este MVP, utilicé herramientas de IA (principalmente Claude y DeepSeek) como un asistente de consulta y pair-programming. Empecé el proyecto por mi cuenta, definiendo el alcance y la estructura general, y usé IA como apoyo durante el desarrollo: DeepSeek para programar partes del código, resolver errores y Claude para revisar el código ya terminado y detectar debilidades.

**Nota:** Aunque la IA me proporcionó sugerencias, bases de código y soluciones a errores, todo el código fue revisado, adaptado y probado por mí. 

## Cómo instalar y ejecutar 

El proyecto está dividido en dos carpetas: `backend` y `frontend`. Necesitarás *dos terminales* abiertas y tener instalado  Node.js (v22.13 o superior).

### Terminal 1: Backend

```bash
# 1. Entrar a la carpeta del backend
cd backend
# 2. Instalar dependencias
npm install
# 3. Iniciar el servidor (se ejecutará en http://localhost:3000)
npm run dev
```

### Terminal 2: Frontend
```bash
# 1. Entrar a la carpeta del frontend
cd frontend
# 2. Instalar dependencias
npm install
# 3. Iniciar la interfaz (se ejecutará en http://localhost:5173)
npm run dev
```

### Pruebas

```bash
cd backend
npm test
```

## Video de demostración
https://drive.google.com/drive/folders/1SxZqnZ-PzojByCUPruH-K4_un51SDoeX?usp=sharing 
