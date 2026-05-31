const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');
const subtasksRouter = require('./routes/subtasks');
const requireAuth = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
// Mount subtasks BEFORE tasks so /api/tasks/:taskId/subtasks is matched first
app.use('/api/tasks/:taskId/subtasks', requireAuth, subtasksRouter);
app.use('/api/tasks', requireAuth, tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

module.exports = app;
