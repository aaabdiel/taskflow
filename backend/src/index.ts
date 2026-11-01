import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import db from './db';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// --- VALIDACIÓN CON ZOD ---
const TaskSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional().nullable(),
  status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
});

// --- ENDPOINTS DE LA API ---

// 1. GET /api/tasks - Listar tareas (con filtro por estado, prioridad y búsqueda)
app.get('/api/tasks', (req, res) => {
  try {
    const { status, search, priority } = req.query;
    let query = 'SELECT * FROM tasks WHERE 1=1'; 
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (search) {
      query += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al obtener las tareas' });
  }
});

// GET /api/tasks/stats - Estadísticas globales (independientes de los filtros)
app.get('/api/tasks/stats', (req, res) => {
  try {
    const rows = db
      .prepare('SELECT status, COUNT(*) AS count FROM tasks GROUP BY status')
      .all() as { status: string; count: number }[];

    const stats = { total: 0, pending: 0, inProgress: 0, completed: 0 };
    for (const row of rows) {
      stats.total += row.count;
      if (row.status === 'Pending') stats.pending = row.count;
      if (row.status === 'In Progress') stats.inProgress = row.count;
      if (row.status === 'Completed') stats.completed = row.count;
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al obtener las estadísticas' });
  }
});

// 2. POST /api/tasks - Crear una tarea
app.post('/api/tasks', (req, res) => {
  try {
    const validatedData = TaskSchema.parse(req.body);

    const insert = db.prepare(
      'INSERT INTO tasks (title, description, status, priority) VALUES (?, ?, ?, ?)'
    );
    
    const result = insert.run(
      validatedData.title,
      validatedData.description || null,
      validatedData.status || 'Pending',
      validatedData.priority || 'Medium'
    );

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTask);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.issues });
    }
    res.status(500).json({ error: 'Error interno del servidor al crear la tarea' });
  }
});

// 3. PATCH /api/tasks/:id - Actualizar tarea
app.patch('/api/tasks/:id', (req, res) => {
  try {
    const id = req.params.id;
    const validatedData = TaskSchema.partial().parse(req.body);

    const existingTask: any = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

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

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updatedTask);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.issues });
    }
    res.status(500).json({ error: 'Error interno del servidor al actualizar la tarea' });
  }
});

// 4. DELETE /api/tasks/:id - Eliminar tarea
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const id = req.params.id;
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al eliminar la tarea' });
  }
});

// Iniciar servidor (solo si no estamos en modo test)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor TaskFlow corriendo en http://localhost:${PORT}`);
  });
}

export default app;