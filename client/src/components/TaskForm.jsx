import React, { useState } from 'react';

const PRIORITIES = ['low', 'medium', 'high'];

export default function TaskForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [titleError, setTitleError] = useState('');
  const [expanded, setExpanded] = useState(false);

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  function removeTag(t) {
    setTags(tags.filter((x) => x !== t));
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError('');
    await onSubmit({ title: title.trim(), description: description.trim() || null, dueDate: dueDate || null, priority, tags });
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setTags([]);
    setExpanded(false);
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form-main">
        <input
          type="text"
          className="task-form-title"
          placeholder="Add a task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
        />
        <button type="submit" className="btn-primary">Add</button>
      </div>
      {titleError && <span className="field-error">{titleError}</span>}

      {expanded && (
        <div className="task-form-extra">
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="task-form-row">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Due date"
            />
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} priority</option>
              ))}
            </select>
          </div>
          <div className="task-form-tags">
            <div className="tag-chips">
              {tags.map((t) => (
                <span key={t} className="tag-chip">
                  {t} <button type="button" onClick={() => removeTag(t)}>×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag, press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
            />
          </div>
        </div>
      )}
    </form>
  );
}

