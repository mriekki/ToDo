process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let token;

// Helper: add auth header to every request
const auth = (req) => req.set('Authorization', `Bearer ${token}`);

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username: 'tester', password: 'pass1234' });
  token = res.body.token;
});

beforeEach(() => {
  db.prepare('DELETE FROM subtasks').run();
  db.prepare('DELETE FROM activity').run();
  db.prepare('DELETE FROM tasks').run();
  db.prepare("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'tasks'").run();
});

describe('GET /api/tasks', () => {
  it('returns 200 and empty array on fresh start', async () => {
    const res = await auth(request(app).get('/api/tasks'));
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('returns 200 and array with tasks after creating some', async () => {
    await auth(request(app).post('/api/tasks').send({ title: 'Task A' }));
    await auth(request(app).post('/api/tasks').send({ title: 'Task B' }));

    const res = await auth(request(app).get('/api/tasks'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBe('Task A');
    expect(res.body[1].title).toBe('Task B');
  });
});

describe('GET /api/tasks/:id', () => {
  it('returns 200 and the task when found', async () => {
    const created = await auth(request(app).post('/api/tasks').send({ title: 'Find me' }));
    const { id } = created.body;

    const res = await auth(request(app).get(`/api/tasks/${id}`));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.title).toBe('Find me');
  });

  it('returns 404 when id does not exist', async () => {
    const res = await auth(request(app).get('/api/tasks/99999'));
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/tasks', () => {
  it('returns 201 and created task with correct shape', async () => {
    const res = await auth(request(app).post('/api/tasks').send({ title: 'New task' }));
    expect(res.status).toBe(201);
    expect(typeof res.body.id).toBe('number');
    expect(res.body.title).toBe('New task');
    expect(res.body.completed).toBe(false);
    expect(typeof res.body.createdAt).toBe('string');
  });

  it('returns 201 with description when provided', async () => {
    const res = await auth(
      request(app).post('/api/tasks').send({ title: 'With description', description: 'Some details' })
    );
    expect(res.status).toBe(201);
    expect(res.body.description).toBe('Some details');
  });

  it('returns 400 when title is missing', async () => {
    const res = await auth(request(app).post('/api/tasks').send({}));
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'title is required' });
  });

  it('returns 400 when title is empty string', async () => {
    const res = await auth(request(app).post('/api/tasks').send({ title: '' }));
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'title is required' });
  });

  it('returns 201 with dueDate when provided', async () => {
    const res = await auth(
      request(app).post('/api/tasks').send({ title: 'With due date', dueDate: '2026-12-31T00:00:00.000Z' })
    );
    expect(res.status).toBe(201);
    expect(res.body.dueDate).toBe('2026-12-31T00:00:00.000Z');
  });

  it('returns 201 with dueDate null when not provided', async () => {
    const res = await auth(request(app).post('/api/tasks').send({ title: 'No due date' }));
    expect(res.status).toBe(201);
    expect(res.body.dueDate).toBeNull();
  });

  it('returns 400 when dueDate is invalid', async () => {
    const res = await auth(
      request(app).post('/api/tasks').send({ title: 'Bad date', dueDate: 'not-a-date' })
    );
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 201 with priority and tags when provided', async () => {
    const res = await auth(
      request(app).post('/api/tasks').send({ title: 'Rich task', priority: 'high', tags: ['work', 'urgent'] })
    );
    expect(res.status).toBe(201);
    expect(res.body.priority).toBe('high');
    expect(res.body.tags).toEqual(['work', 'urgent']);
  });
});

describe('PUT /api/tasks/:id', () => {
  it('returns 200 and updated task when found', async () => {
    const created = await auth(request(app).post('/api/tasks').send({ title: 'Original' }));
    const { id } = created.body;

    const res = await auth(request(app).put(`/api/tasks/${id}`).send({ title: 'Updated' }));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.title).toBe('Updated');
  });

  it('can update completed to true', async () => {
    const created = await auth(request(app).post('/api/tasks').send({ title: 'Finish me' }));
    const { id } = created.body;

    const res = await auth(request(app).put(`/api/tasks/${id}`).send({ completed: true }));
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.status).toBe('done');
  });

  it('returns 400 when title is empty string', async () => {
    const created = await auth(request(app).post('/api/tasks').send({ title: 'Has a title' }));
    const { id } = created.body;

    const res = await auth(request(app).put(`/api/tasks/${id}`).send({ title: '' }));
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 when id does not exist', async () => {
    const res = await auth(request(app).put('/api/tasks/99999').send({ title: 'Ghost' }));
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('can update dueDate', async () => {
    const created = await auth(request(app).post('/api/tasks').send({ title: 'Task' }));
    const { id } = created.body;
    const res = await auth(
      request(app).put(`/api/tasks/${id}`).send({ dueDate: '2027-01-01T00:00:00.000Z' })
    );
    expect(res.status).toBe(200);
    expect(res.body.dueDate).toBe('2027-01-01T00:00:00.000Z');
  });

  it('can clear dueDate by setting to null', async () => {
    const created = await auth(
      request(app).post('/api/tasks').send({ title: 'Task', dueDate: '2027-01-01T00:00:00.000Z' })
    );
    const { id } = created.body;
    const res = await auth(request(app).put(`/api/tasks/${id}`).send({ dueDate: null }));
    expect(res.status).toBe(200);
    expect(res.body.dueDate).toBeNull();
  });

  it('can update priority', async () => {
    const created = await auth(request(app).post('/api/tasks').send({ title: 'Task' }));
    const { id } = created.body;
    const res = await auth(request(app).put(`/api/tasks/${id}`).send({ priority: 'low' }));
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe('low');
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('returns 204 when deleted', async () => {
    const created = await auth(request(app).post('/api/tasks').send({ title: 'Delete me' }));
    const { id } = created.body;

    const res = await auth(request(app).delete(`/api/tasks/${id}`));
    expect(res.status).toBe(204);
  });

  it('returns 404 when id does not exist', async () => {
    const res = await auth(request(app).delete('/api/tasks/99999'));
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('task is not visible after soft-deletion', async () => {
    const created = await auth(request(app).post('/api/tasks').send({ title: 'Gone soon' }));
    const { id } = created.body;

    await auth(request(app).delete(`/api/tasks/${id}`));

    const res = await auth(request(app).get(`/api/tasks/${id}`));
    expect(res.status).toBe(404);
  });

  it('task can be restored after soft-deletion', async () => {
    const created = await auth(request(app).post('/api/tasks').send({ title: 'Restore me' }));
    const { id } = created.body;

    await auth(request(app).delete(`/api/tasks/${id}`));
    const res = await auth(request(app).post(`/api/tasks/${id}/restore`));
    expect(res.status).toBe(200);
    expect(res.body.deletedAt).toBeNull();
  });
});
