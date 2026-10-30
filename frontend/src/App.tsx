import { useState, useEffect } from 'react';

// Tipos de datos
type Task = {
  id: number;
  title: string;
  description: string | null;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  created_at: string;
};

const API_URL = 'http://localhost:3000/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<string>('');
  
  // Estados del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Pending');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Cargar tareas
  const fetchTasks = async () => {
    try {
      const url = filter ? `${API_URL}?status=${filter}` : API_URL;
      const res = await fetch(url);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Error cargando tareas', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]); // Se recarga cuando cambia el filtro

  // Guardar (Crear o Editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('El título es obligatorio');

    const taskData = { title, description, priority, status };
    
    try {
      if (editingId) {
        // Editar
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
      } else {
        // Crear
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      alert('Error al guardar la tarea');
    }
  };

  // Eliminar
  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar esta tarea?')) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  // Preparar edición
  const handleEdit = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setStatus(task.status);
    setEditingId(task.id);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setStatus('Pending');
    setEditingId(null);
  };

  return (
    <div className="container">
      <header>
        <h1>TaskFlow</h1>
        <p>Gestor de tareas para el equipo</p>
      </header>

      <main className="layout">
        {/* Formulario */}
        <section className="card form-section">
          <h2>{editingId ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Título *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ej. Diseñar la BD" />
            </div>
            
            <div className="input-group">
              <label>Descripción</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalles opcionales..." />
            </div>

            <div className="row">
              <div className="input-group">
                <label>Prioridad</label>
                <select value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="Low">Baja</option>
                  <option value="Medium">Media</option>
                  <option value="High">Alta</option>
                </select>
              </div>
              
              {editingId && (
                <div className="input-group">
                  <label>Estado</label>
                  <select value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Pending">Pendiente</option>
                    <option value="In Progress">En Progreso</option>
                    <option value="Completed">Completada</option>
                  </select>
                </div>
              )}
            </div>

            <div className="actions">
              <button type="submit" className="btn primary">{editingId ? 'Guardar Cambios' : 'Crear Tarea'}</button>
              {editingId && <button type="button" onClick={resetForm} className="btn secondary">Cancelar</button>}
            </div>
          </form>
        </section>

        {/* Lista de Tareas */}
        <section className="tasks-section">
          <div className="list-header">
            <h2>Tareas</h2>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="filter">
              <option value="">Todas</option>
              <option value="Pending">Pendientes</option>
              <option value="In Progress">En Progreso</option>
              <option value="Completed">Completadas</option>
            </select>
          </div>

          <div className="task-list">
            {tasks.length === 0 ? (
              <p className="empty">No hay tareas para mostrar.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="card task-card">
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <span className={`badge priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && <p className="desc">{task.description}</p>}
                  
                  <div className="task-footer">
                    <span className={`status status-${task.status.replace(' ', '-').toLowerCase()}`}>
                      {task.status}
                    </span>
                    <div className="task-actions">
                      <button onClick={() => handleEdit(task)} className="text-btn edit">Editar</button>
                      <button onClick={() => handleDelete(task.id)} className="text-btn delete">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}