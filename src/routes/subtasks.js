const { Router } = require('express');
const db = require('../db');

const router = Router({ mergeParams: true });

function rowToSubtask(r) {
  return { id: r.id, title: r.title, completed: r.completed === 1, createdAt: r.created_at };
}

// GET /api/tasks/:taskId/subtasks
router.get('/', (req, res) => {
  const taskId = parseInt(req.params.taskId, 10);
  const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(taskId, req.user.id);
  if (!task) return res.status(404).json({ error: 'Not Found' });
  const rows = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY position, id').all(taskId);
  res.json(rows.map(rowToSubtask));
});

// POST /api/tasks/:taskId/subtasks
router.post('/', (req, res) => {
  const taskId = parseInt(req.params.taskId, 10);
  const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(taskId, req.user.id);
  if (!task) return res.status(404).json({ error: 'Not Found' });
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required' });
  }
  const maxPos = db.prepare('SELECT MAX(position) as m FROM subtasks WHERE task_id = ?').get(taskId);
  const result = db.prepare('INSERT INTO subtasks (task_id, title, position) VALUES (?, ?, ?)').run(
    taskId, title.trim(), (maxPos?.m ?? 0) + 1
  );
  const row = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(rowToSubtask(row));
});

// PUT /api/tasks/:taskId/subtasks/:subtaskId
router.put('/:subtaskId', (req, res) => {
  const taskId = parseInt(req.params.taskId, 10);
  const subtaskId = parseInt(req.params.subtaskId, 10);
  const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(taskId, req.user.id);
  if (!task) return res.status(404).json({ error: 'Not Found' });
  const subtask = db.prepare('SELECT * FROM subtasks WHERE id = ? AND task_id = ?').get(subtaskId, taskId);
  if (!subtask) return res.status(404).json({ error: 'Not Found' });

  const { title, completed } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title.trim();
  if (completed !== undefined) updates.completed = completed ? 1 : 0;
  if (Object.keys(updates).length === 0) return res.json(rowToSubtask(subtask));

  const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  db.prepare(`UPDATE subtasks SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), subtaskId);
  const updated = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(subtaskId);
  res.json(rowToSubtask(updated));
});

// DELETE /api/tasks/:taskId/subtasks/:subtaskId
router.delete('/:subtaskId', (req, res) => {
  const taskId = parseInt(req.params.taskId, 10);
  const subtaskId = parseInt(req.params.subtaskId, 10);
  const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(taskId, req.user.id);
  if (!task) return res.status(404).json({ error: 'Not Found' });
  const result = db.prepare('DELETE FROM subtasks WHERE id = ? AND task_id = ?').run(subtaskId, taskId);
  if (result.changes === 0) return res.status(404).json({ error: 'Not Found' });
  res.status(204).end();
});

module.exports = router;
