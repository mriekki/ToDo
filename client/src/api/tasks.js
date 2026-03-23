const BASE = '/api/tasks';

function authHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function fetchTasks(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${query ? '?' + query : ''}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(fields) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create task');
  }
  return res.json();
}

export async function updateTask(id, fields) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update task');
  }
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to delete task');
}

export async function restoreTask(id) {
  const res = await fetch(`${BASE}/${id}/restore`, { method: 'POST', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to restore task');
  return res.json();
}

export async function reorderTasks(ids) {
  const res = await fetch(`${BASE}/reorder`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('Failed to reorder tasks');
}

export async function bulkAction(action, ids) {
  const res = await fetch(`${BASE}/bulk`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ action, ids }),
  });
  if (!res.ok) throw new Error('Failed to perform bulk action');
}

export async function fetchActivity(taskId) {
  const res = await fetch(`${BASE}/${taskId}/activity`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch activity');
  return res.json();
}

