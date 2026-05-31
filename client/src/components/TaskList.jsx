import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, onToggle, onDelete, onUpdate, onReorder, selectedIds, onSelect, onBulkAction }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    onReorder(reordered.map((t) => t.id));
  }

  const allSelected = tasks.length > 0 && tasks.every((t) => selectedIds.has(t.id));

  if (tasks.length === 0) {
    return <p className="empty-state">No tasks yet. Add one above!</p>;
  }

  return (
    <div className="task-list-wrap">
      {selectedIds.size > 0 && (
        <div className="bulk-bar">
          <span>{selectedIds.size} selected</span>
          <button className="btn-primary" onClick={() => onBulkAction('complete')}>Mark Done</button>
          <button className="btn-danger" onClick={() => onBulkAction('delete')}>Delete</button>
        </div>
      )}

      <div className="task-list-header">
        <label className="select-all">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => {
              if (allSelected) onSelect(null); // deselect all
              else tasks.forEach((t) => { if (!selectedIds.has(t.id)) onSelect(t.id); });
            }}
          />
          Select all
        </label>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
              selected={selectedIds.has(task.id)}
              onSelect={onSelect}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

