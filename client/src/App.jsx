import React, { useState, useEffect, useRef } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask, reorderTasks, bulkAction } from './api/tasks';
import AuthForm from './components/AuthForm';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import FilterBar from './components/FilterBar';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import Toast from './components/Toast';

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('list');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('position');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const dueTodayShown = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : '');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!user) return;
    loadTasks();
  }, [user, search, filterStatus, filterPriority, filterTag, sortBy]);

  useEffect(() => {
    if (dueTodayShown.current || !tasks.length) return;
    const today = new Date().toDateString();
    const dueToday = tasks.filter(
      (t) => t.dueDate && !t.completed && new Date(t.dueDate + 'T00:00:00').toDateString() === today
    );
    if (dueToday.length > 0) {
      addToast(`${dueToday.length} task${dueToday.length > 1 ? 's' : ''} due today`, 'warning');
      dueTodayShown.current = true;
    }
  }, [tasks]);

  function addToast(message, type = 'info') {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }

  async function loadTasks() {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (filterTag) params.tag = filterTag;
      if (search) params.search = search;
      if (sortBy !== 'position') params.sortBy = sortBy;
      setTasks(await fetchTasks(params));
      setError('');
    } catch (e) {
      if (e.message === 'Failed to fetch tasks') handleLogout();
      else setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(fields) {
    try {
      const task = await createTask(fields);
      setTasks((prev) => [...prev, task]);
      setError('');
    } catch (e) { setError(e.message); }
  }

  async function handleToggle(id) {
    const task = tasks.find((t) => t.id === id);
    try {
      const updated = await updateTask(id, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) { setError(e.message); }
  }

  async function handleDelete(id) {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } catch (e) { setError(e.message); }
  }

  async function handleUpdate(id, fields) {
    try {
      const updated = await updateTask(id, fields);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) { setError(e.message); }
  }

  async function handleReorder(ids) {
    // Optimistic update
    const ordered = ids.map((id) => tasks.find((t) => t.id === id)).filter(Boolean);
    setTasks(ordered);
    try { await reorderTasks(ids); } catch (e) { setError(e.message); }
  }

  function handleSelect(id) {
    if (id === null) { setSelectedIds(new Set()); return; }
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  async function handleBulkAction(action) {
    const ids = [...selectedIds];
    try {
      await bulkAction(action, ids);
      setSelectedIds(new Set());
      await loadTasks();
    } catch (e) { setError(e.message); }
  }

  function handleAuthSuccess({ user }) {
    setUser(user);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTasks([]);
  }

  const allTags = [...new Set(tasks.flatMap((t) => t.tags))];

  if (!user) return <AuthForm onSuccess={handleAuthSuccess} />;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">✅ ToDo</h1>
          <nav className="view-tabs">
            {['list', 'kanban', 'calendar'].map((v) => (
              <button key={v} className={`tab${view === v ? ' active' : ''}`} onClick={() => setView(v)}>
                {v === 'list' ? '☰ List' : v === 'kanban' ? '⬛ Kanban' : '📅 Calendar'}
              </button>
            ))}
          </nav>
        </div>
        <div className="header-right">
          <span className="user-label">👤 {user.username}</span>
          <button className="btn-icon" onClick={() => setDarkMode((d) => !d)} title="Toggle dark mode">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="btn-secondary" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <main className="app-main">
        <TaskForm onSubmit={handleCreate} />

        <FilterBar
          search={search} onSearch={setSearch}
          filterStatus={filterStatus} onFilterStatus={setFilterStatus}
          filterPriority={filterPriority} onFilterPriority={setFilterPriority}
          filterTag={filterTag} onFilterTag={setFilterTag}
          sortBy={sortBy} onSortBy={setSortBy}
          allTags={allTags}
        />

        {error && <p className="error-banner">{error}</p>}
        {loading && <p className="loading-text">Loading…</p>}

        {!loading && view === 'list' && (
          <TaskList
            tasks={tasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onReorder={handleReorder}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onBulkAction={handleBulkAction}
          />
        )}
        {!loading && view === 'kanban' && (
          <KanbanBoard tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} onUpdate={handleUpdate} />
        )}
        {!loading && view === 'calendar' && (
          <CalendarView tasks={tasks} />
        )}
      </main>

      <Toast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}

