const { Router } = require('express');
const db = require('../db');

const router = Router();

function rowToTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || null,
    status: row.status,
    completed: row.completed === 1,
    priority: row.priority,
    tags: JSON.parse(row.tags || '[]'),
    dueDate: row.due_date || null,
    position: row.position,
    deletedAt: row.deleted_at || null,
    completedAt: row.completed_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getSubtasks(taskId) {
  return db
    .prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY position, id')
    .all(taskId)
    .map((r) => ({ id: r.id, title: r.title, completed: r.completed === 1, createdAt: r.created_at }));
}

function logActivity(taskId, userId, action, field = null, oldValue = null, newValue = null) {
  db.prepare(
    'INSERT INTO activity (task_id, user_id, action, field, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(taskId, userId, action, field, oldValue == null ? null : String(oldValue), newValue == null ? null : String(newValue));
}

// POST /api/tasks/reorder — must come before /:id routes
router.post('/reorder', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
  const update = db.prepare('UPDATE tasks SET position = ? WHERE id = ? AND user_id = ?');
  db.transaction((list) => list.forEach((id, i) => update.run(i + 1, id, req.user.id)))(ids);
  res.json({ ok: true });
});

// POST /api/tasks/bulk — must come before /:id routes
router.post('/bulk', (req, res) => {
  const { action, ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids must be a non-empty array' });
  if (!['complete', 'delete'].includes(action)) return res.status(400).json({ error: 'action must be complete or delete' });
  const now = new Date().toISOString();
  if (action === 'complete') {
    const stmt = db.prepare("UPDATE tasks SET completed = 1, status = 'done', completed_at = ?, updated_at = ? WHERE id = ? AND user_id = ?");
    db.transaction(() => ids.forEach((id) => stmt.run(now, now, id, req.user.id)))();
  } else {
    const stmt = db.prepare('UPDATE tasks SET deleted_at = ?, updated_at = ? WHERE id = ? AND user_id = ?');
    db.transaction(() => ids.forEach((id) => stmt.run(now, now, id, req.user.id)))();
  }
  res.json({ ok: true });
});

// GET /api/tasks
router.get('/', (req, res) => {
  const { status, priority, tag, search, sortBy, showDeleted } = req.query;
  let sql = 'SELECT * FROM tasks WHERE user_id = ?';
  const params = [req.user.id];

  if (showDeleted !== 'true') sql += ' AND deleted_at IS NULL';
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (priority) { sql += ' AND priority = ?'; params.push(priority); }
  if (search) { sql += ' AND title LIKE ?'; params.push(`%${search}%`); }

  const orderMap = {
    priority: "CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 END",
    dueDate: 'due_date',
    createdAt: 'created_at',
    position: 'position',
  };
  sql += ` ORDER BY ${orderMap[sortBy] || 'position'} ASC, id ASC`;

  let rows = db.prepare(sql).all(...params);
  if (tag) {
    rows = rows.filter((r) => { try { return JSON.parse(r.tags).includes(tag); } catch { return false; } });
  }

  res.json(rows.map((r) => ({ ...rowToTask(r), subtasks: getSubtasks(r.id) })));
});

// GET /api/tasks/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { showDeleted } = req.query;
  const sql = showDeleted === 'true'
    ? 'SELECT * FROM tasks WHERE id = ? AND user_id = ?'
    : 'SELECT * FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL';
  const row = db.prepare(sql).get(id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Not Found' });
  res.json({ ...rowToTask(row), subtasks: getSubtasks(id) });
});

// GET /api/tasks/:id/activity
router.get('/:id/activity', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const row = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Not Found' });
  const rows = db.prepare('SELECT * FROM activity WHERE task_id = ? ORDER BY timestamp DESC').all(id);
  res.json(rows.map((a) => ({ id: a.id, action: a.action, field: a.field, oldValue: a.old_value, newValue: a.new_value, timestamp: a.timestamp })));
});

// POST /api/tasks
router.post('/', (req, res) => {
  const { title, description, dueDate, priority = 'medium', tags = [], status = 'todo' } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required' });
  }
  if (dueDate !== undefined && dueDate !== null && isNaN(new Date(dueDate).getTime())) {
    return res.status(400).json({ error: 'dueDate must be a valid date string' });
  }
  if (!['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ error: 'priority must be low, medium, or high' });
  }
  if (!['todo', 'in_progress', 'done'].includes(status)) {
    return res.status(400).json({ error: 'status must be todo, in_progress, or done' });
  }
  const maxPos = db.prepare('SELECT MAX(position) as m FROM tasks WHERE user_id = ? AND deleted_at IS NULL').get(req.user.id);
  const position = (maxPos?.m ?? 0) + 1;
  const result = db.prepare(
    'INSERT INTO tasks (user_id, title, description, status, priority, tags, due_date, position, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    req.user.id, title.trim(), description || null, status,
    priority, JSON.stringify(Array.isArray(tags) ? tags : []),
    dueDate || null, position, status === 'done' ? 1 : 0
  );
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  logActivity(result.lastInsertRowid, req.user.id, 'created');
  res.status(201).json({ ...rowToTask(row), subtasks: [] });
});

// PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const row = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Not Found' });

  const { title, description, completed, dueDate, priority, tags, status } = req.body;
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'title must be a non-empty string' });
  }
  if (dueDate !== undefined && dueDate !== null && isNaN(new Date(dueDate).getTime())) {
    return res.status(400).json({ error: 'dueDate must be a valid date string' });
  }
  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ error: 'priority must be low, medium, or high' });
  }
  if (status !== undefined && !['todo', 'in_progress', 'done'].includes(status)) {
    return res.status(400).json({ error: 'status must be todo, in_progress, or done' });
  }

  const updates = {};
  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description;
  if (dueDate !== undefined) updates.due_date = dueDate;
  if (priority !== undefined) updates.priority = priority;
  if (tags !== undefined) updates.tags = JSON.stringify(Array.isArray(tags) ? tags : []);

  // Sync status ↔ completed
  let newStatus = status !== undefined ? status : row.status;
  let newCompleted = completed !== undefined ? completed : row.completed === 1;
  if (status === 'done') newCompleted = true;
  else if (status === 'todo' || status === 'in_progress') newCompleted = false;
  if (completed === true && row.status !== 'in_progress') newStatus = 'done';
  if (completed === false && newStatus === 'done') newStatus = 'todo';

  updates.status = newStatus;
  updates.completed = newCompleted ? 1 : 0;

  const wasCompleted = row.completed === 1;
  if (newCompleted && !wasCompleted) updates.completed_at = new Date().toISOString();
  else if (!newCompleted && wasCompleted) updates.completed_at = null;
  updates.updated_at = new Date().toISOString();

  const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  db.prepare(`UPDATE tasks SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), id);

  if (completed !== undefined && completed !== wasCompleted) {
    logActivity(id, req.user.id, newCompleted ? 'completed' : 'uncompleted', 'completed', String(wasCompleted), String(newCompleted));
  } else {
    logActivity(id, req.user.id, 'updated');
  }

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json({ ...rowToTask(updated), subtasks: getSubtasks(id) });
});

// DELETE /api/tasks/:id (soft delete)
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const row = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Not Found' });
  const now = new Date().toISOString();
  db.prepare('UPDATE tasks SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now, now, id);
  logActivity(id, req.user.id, 'deleted');
  res.status(204).end();
});

// POST /api/tasks/:id/restore
router.post('/:id/restore', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const row = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Not Found' });
  const now = new Date().toISOString();
  db.prepare('UPDATE tasks SET deleted_at = NULL, updated_at = ? WHERE id = ?').run(now, id);
  logActivity(id, req.user.id, 'restored');
  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json({ ...rowToTask(updated), subtasks: getSubtasks(id) });
});

module.exports = router;
