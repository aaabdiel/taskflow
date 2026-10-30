import { DatabaseSync } from 'node:sqlite';

// Se crea (o se abre) el archivo de base de datos en la raíz del backend
const db = new DatabaseSync('tasks.db');

// Creamos la tabla si no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    priority TEXT NOT NULL DEFAULT 'Medium',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

console.log('✅ Base de datos SQLite lista (usando node:sqlite).');

export default db;