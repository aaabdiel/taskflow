import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import db from './db';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend (que estará en otro puerto)
app.use(express.json()); // Permite recibir datos en formato JSON

// --- VALIDACIÓN CON ZOD ---
// Definimos cómo debe lucir una tarea cuando llega al servidor
const TaskSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional().nullable(),
  status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
});

// --- ENDPOINTS DE LA API ---

// 1. GET /api/tasks - Listar todas las tareas (con filtro opcional por estado)
app.get('/api/tasks', (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM tasks';
    const params: any[] = [];

    // Si envían ?status=Pending, filtramos
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    // Ordenamos por fecha de creación descendente
    query += ' ORDER BY created_at DESC';

    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al obtener las tareas' });
  }
});

// 2. POST /api/tasks - Crear una nueva tarea
app.post('/api/tasks', (req, res) => {
  try {
    // Validamos los datos que llegan
    const validatedData = TaskSchema.parse(req.body);

    // Insertamos en la base de datos
    const insert = db.prepare(
      'INSERT INTO tasks (title, description, status, priority) VALUES (?, ?, ?, ?)'
    );
    
    const result = insert.run(
      validatedData.title,
      validatedData.description || null,
      validatedData.status || 'Pending', // Por defecto
      validatedData.priority || 'Medium' // Por defecto
    );

    // Devolvemos la tarea creada con su nuevo ID
    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTask);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.issues });
    }
    res.status(500).json({ error: 'Error interno del servidor al crear la tarea' });
  }
});

// 3. PATCH /api/tasks/:id - Actualizar una tarea existente (título, estado, prioridad, etc)
app.patch('/api/tasks/:id', (req, res) => {
  try {
    const id = req.params.id;
    const validatedData = TaskSchema.partial().parse(req.body); // .partial() permite enviar solo algunos campos

    // Verificamos si la tarea existe
    const existingTask: any = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Actualizamos solo los campos que llegaron
    const updates = [];
    const values = [];
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No se enviaron datos para actualizar' });
    }

    values.push(id);
    db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    // Devolvemos la tarea actualizada
    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updatedTask);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.issues });
    }
    res.status(500).json({ error: 'Error interno del servidor al actualizar la tarea' });
  }
});

// 4. DELETE /api/tasks/:id - Eliminar una tarea
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const id = req.params.id;
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.status(204).send(); // 204 significa "Éxito, sin contenido que devolver"
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al eliminar la tarea' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor TaskFlow corriendo en http://localhost:${PORT}`);
});