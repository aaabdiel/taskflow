import { useState, useEffect } from 'react';

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  created_at: string;
};

type Stats = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
};

const API_URL = 'http://localhost:3000/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  
  // Filtros
  const [filter, setFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [search, setSearch] = useState<string>(''); 
  
  // Formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Pending');
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchTasks = async () => {
    try {
      let url = `${API_URL}?`;
      if (filter) url += `status=${filter}&`;
      if (priorityFilter) url += `priority=${priorityFilter}&`;
      if (search) url += `search=${search}`;

      const res = await fetch(url);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Error cargando tareas', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter, priorityFilter, search]);

  // Estadísticas globales (no dependen de los filtros)
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`);
      setStats(await res.json());
    } catch (error) {
      console.error('Error cargando estadísticas', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('El título es obligatorio');

    const taskData = { title, description, priority, status };
    
    try {
      if (editingId) {
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
      }
      resetForm();
      fetchTasks();
      fetchStats();
    } catch (error) {
      alert('Error al guardar la tarea');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar esta tarea?')) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
    fetchStats();
  };

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

      {/* PANEL DE ESTADÍSTICAS */}
      <section className="stats-panel">
        <div className="stat-card"><span>Total:</span> <strong>{stats.total}</strong></div>
        <div className="stat-card pending-stat"><span>Pendientes:</span> <strong>{stats.pending}</strong></div>
        <div className="stat-card progress-stat"><span>En Progreso:</span> <strong>{stats.inProgress}</strong></div>
        <div className="stat-card completed-stat"><span>Completadas:</span> <strong>{stats.completed}</strong></div>
      </section>

      <main className="layout">
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

        <section className="tasks-section">
          <div className="list-header">
            <h2>Tareas</h2>
            <div className="filters-container">
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <select value={filter} onChange={e => setFilter(e.target.value)} className="filter">
                <option value="">Estado (Todas)</option>
                <option value="Pending">Pendientes</option>
                <option value="In Progress">En Progreso</option>
                <option value="Completed">Completadas</option>
              </select>
              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="filter">
                <option value="">Prioridad (Todas)</option>
                <option value="High">Alta</option>
                <option value="Medium">Media</option>
                <option value="Low">Baja</option>
              </select>
            </div>
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