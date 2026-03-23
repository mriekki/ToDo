import React from 'react';

const COLUMNS = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

const PRIORITY_LABELS = { high: '🔴', medium: '🟡', low: '🟢' };

export default function KanbanBoard({ tasks, onToggle, onDelete, onUpdate }) {
  function handleMoveStatus(task, newStatus) {
    onUpdate(task.id, { status: newStatus });
  }

  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div key={col.id} className={`kanban-col kanban-${col.id}`}>
            <div className="kanban-col-header">
              <h3>{col.label}</h3>
              <span className="kanban-count">{colTasks.length}</span>
            </div>
            <div className="kanban-cards">
              {colTasks.length === 0 && <p className="kanban-empty">No tasks</p>}
              {colTasks.map((task) => {
                const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
                return (
                  <div key={task.id} className={`kanban-card${task.completed ? ' completed' : ''}`}>
                    <div className="kanban-card-top">
                      <span className={`priority-dot priority-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
                      <span className={`kanban-title${task.completed ? ' done' : ''}`}>{task.title}</span>
                      <button className="btn-icon btn-danger" onClick={() => onDelete(task.id)}>✕</button>
                    </div>
                    {task.dueDate && (
                      <span className={`kanban-due${isOverdue ? ' overdue' : ''}`}>
                        📅 {new Date(task.dueDate + 'T00:00:00').toLocaleDateString()}
                      </span>
                    )}
                    {task.tags.length > 0 && (
                      <div className="kanban-tags">
                        {task.tags.map((t) => <span key={t} className="tag-chip small">{t}</span>)}
                      </div>
                    )}
                    {task.subtasks.length > 0 && (
                      <span className="subtask-count">
                        ✓ {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                      </span>
                    )}
                    <div className="kanban-actions">
                      {COLUMNS.filter((c) => c.id !== col.id).map((c) => (
                        <button key={c.id} className="btn-move" onClick={() => handleMoveStatus(task, c.id)}>
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
