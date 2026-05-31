const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH;
const useMemory = !DB_PATH || DB_PATH === ':memory:';
const filePath = useMemory ? null : path.resolve(DB_PATH);

// In-memory store state
let store = { tasks: [], nextId: 1 };

// Load from file on startup (if not in-memory mode)
if (filePath) {
  if (fs.existsSync(filePath)) {
    try {
      store = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      store = { tasks: [], nextId: 1 };
    }
  }
}

function persist() {
  if (filePath) {
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
  }
}

function getAllTasks() {
  return [...store.tasks];
}

function getTaskById(id) {
  return store.tasks.find((t) => t.id === id);
}

function createTask({ title, description, dueDate }) {
  const task = {
    id: store.nextId++,
    title,
    description: description !== undefined ? description : null,
    completed: false,
    dueDate: dueDate !== undefined ? dueDate : null,
    createdAt: new Date().toISOString(),
  };
  store.tasks.push(task);
  persist();
  return task;
}

function updateTask(id, fields) {
  const task = store.tasks.find((t) => t.id === id);
  if (!task) return null;
  if (fields.title !== undefined) task.title = fields.title;
  if (fields.description !== undefined) task.description = fields.description;
  if (fields.completed !== undefined) task.completed = fields.completed;
  if (fields.dueDate !== undefined) task.dueDate = fields.dueDate;
  persist();
  return task;
}

function deleteTask(id) {
  const index = store.tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  store.tasks.splice(index, 1);
  persist();
  return true;
}

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
