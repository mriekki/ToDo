import React, { useState } from 'react';

export default function FilterBar({ search, onSearch, filterStatus, onFilterStatus, filterPriority, onFilterPriority, filterTag, onFilterTag, sortBy, onSortBy, allTags }) {
  return (
    <div className="filter-bar">
      <input
        type="search"
        className="filter-search"
        placeholder="Search tasks…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />

      <select value={filterStatus} onChange={(e) => onFilterStatus(e.target.value)}>
        <option value="">All statuses</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <select value={filterPriority} onChange={(e) => onFilterPriority(e.target.value)}>
        <option value="">All priorities</option>
        <option value="high">🔴 High</option>
        <option value="medium">🟡 Medium</option>
        <option value="low">🟢 Low</option>
      </select>

      {allTags.length > 0 && (
        <select value={filterTag} onChange={(e) => onFilterTag(e.target.value)}>
          <option value="">All tags</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      )}

      <select value={sortBy} onChange={(e) => onSortBy(e.target.value)}>
        <option value="position">Custom order</option>
        <option value="dueDate">Due date</option>
        <option value="priority">Priority</option>
        <option value="createdAt">Date created</option>
      </select>
    </div>
  );
}
