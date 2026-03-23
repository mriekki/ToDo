import React, { useState } from 'react';
import { createSubtask, updateSubtask, deleteSubtask } from '../api/subtasks';

export default function SubtaskList({ taskId, subtasks, onChange }) {
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const sub = await createSubtask(taskId, newTitle.trim());
      onChange([...subtasks, sub]);
      setNewTitle('');
      setAdding(false);
    } catch {}
  }

  async function handleToggle(sub) {
    try {
      const updated = await updateSubtask(taskId, sub.id, { completed: !sub.completed });
      onChange(subtasks.map((s) => (s.id === sub.id ? updated : s)));
    } catch {}
  }

  async function handleDelete(id) {
    try {
      await deleteSubtask(taskId, id);
      onChange(subtasks.filter((s) => s.id !== id));
    } catch {}
  }

  const done = subtasks.filter((s) => s.completed).length;

  return (
    <div className="subtask-list">
      {subtasks.length > 0 && (
        <div className="subtask-progress">
          <div className="subtask-bar">
            <div className="subtask-bar-fill" style={{ width: `${(done / subtasks.length) * 100}%` }} />
          </div>
          <span>{done}/{subtasks.length}</span>
        </div>
      )}
      {subtasks.map((sub) => (
        <div key={sub.id} className="subtask-item">
          <input type="checkbox" checked={sub.completed} onChange={() => handleToggle(sub)} />
          <span className={sub.completed ? 'completed' : ''}>{sub.title}</span>
          <button className="subtask-delete" onClick={() => handleDelete(sub.id)}>×</button>
        </div>
      ))}
      {adding ? (
        <form onSubmit={handleAdd} className="subtask-add-form">
          <input
            autoFocus
            type="text"
            placeholder="Subtask title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit">Add</button>
          <button type="button" onClick={() => { setAdding(false); setNewTitle(''); }}>Cancel</button>
        </form>
      ) : (
        <button className="subtask-add-btn" onClick={() => setAdding(true)}>+ Add subtask</button>
      )}
    </div>
  );
}
