import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SubtaskList from './SubtaskList';
import './TaskItem.css';

const PRIORITY_LABELS = { high: '🔴', medium: '🟡', low: '🟢' };

export default function TaskItem({ task, onToggle, onDelete, onUpdate, selected, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
  const subtasksDone = subtasks.filter((s) => s.completed).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-item${task.completed ? ' task-completed' : ''}${selected ? ' task-selected' : ''}`}
    >
      <span className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">⠿</span>

      <input
        type="checkbox"
        className="task-select"
        checked={selected}
        onChange={() => onSelect(task.id)}
        title="Select"
      />

      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        title="Mark complete"
      />

      <span className={`priority-dot priority-${task.priority}`} title={task.priority}>
        {PRIORITY_LABELS[task.priority]}
      </span>

      <div className="task-body">
        <span className={`task-title${task.completed ? ' completed' : ''}`}>{task.title}</span>
        {task.description && <span className="task-desc">{task.description}</span>}
        <div className="task-meta">
          {task.dueDate && (
            <span className={`task-due${isOverdue ? ' overdue' : ''}`}>
              {isOverdue ? '⚠ ' : '📅 '}Due {new Date(task.dueDate + 'T00:00:00').toLocaleDateString()}
            </span>
          )}
          {task.tags.map((t) => <span key={t} className="tag-chip small">{t}</span>)}
          {subtasks.length > 0 && (
            <span className="subtask-count" onClick={() => setExpanded((x) => !x)}>
              ✓ {subtasksDone}/{subtasks.length}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button
          className="btn-icon"
          onClick={() => setExpanded((x) => !x)}
          title={expanded ? 'Collapse' : 'Expand subtasks'}
        >
          {expanded ? '▲' : '▼'}
        </button>
        <button className="btn-icon btn-danger" onClick={() => onDelete(task.id)} title="Delete">✕</button>
      </div>

      {expanded && (
        <div className="task-subtasks">
          <SubtaskList taskId={task.id} subtasks={subtasks} onChange={setSubtasks} />
        </div>
      )}
    </div>
  );
}

