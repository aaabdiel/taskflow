import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './index';

describe('API TaskFlow', () => {
  it('Debería devolver un array en GET /api/tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Debería crear una tarea correctamente (POST)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Tarea de prueba automatizada', priority: 'High' });
    
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Tarea de prueba automatizada');
    expect(res.body.priority).toBe('High');
  });

  it('Debería fallar al crear tarea sin título (Validación Zod)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ description: 'No tiene titulo' });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Datos inválidos');
  });
});