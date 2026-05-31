function authHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function createSubtask(taskId, title) {
  const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create subtask');
  return res.json();
}

export async function updateSubtask(taskId, subtaskId, fields) {
  const res = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error('Failed to update subtask');
  return res.json();
}

export async function deleteSubtask(taskId, subtaskId) {
  const res = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete subtask');
}
