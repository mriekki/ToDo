# Project Context

- **Owner:** Mark Riekki
- **Project:** Task Management App — users can create, update, and delete tasks
- **Stack:** React (frontend), Node.js (backend)
- **Created:** 2026-03-22

## Core Context

Node.js backend providing a REST API for task CRUD. Endpoints consumed by McManus's React frontend. Database TBD (likely SQLite or MongoDB for simplicity).

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- App/server split: app.js exports Express app (no listen), server.js does the listen. Enables clean supertest testing.
- /health endpoint returns { status: 'ok', timestamp: ISO string }
- Port: process.env.PORT || 3000
- Task store: in-memory array in src/data/taskStore.js. No DB yet — easy to swap later.
- Tasks router: src/routes/tasks.js, mounted at /api/tasks in app.js
- IDs are integers (auto-increment counter in store). Parse params with parseInt.
- Consistent error shape: { error: "message" }
- Task shape: { id, title, description, completed, createdAt }
- SQLite via better-sqlite3 (sync API — no async/await, cleaner code)
- DB_PATH env var controls db file location; tests use ':memory:' for isolation
- completed stored as INTEGER 0/1, converted to boolean in rowToTask()
- Store API surface unchanged: getAllTasks, getTaskById, createTask, updateTask, deleteTask
- tasks.db added to .gitignore
- dueDate: optional field, null if not set. ISO date string if set.
- Validated with isNaN(new Date(dueDate).getTime()) in POST and PUT routes
- PUT allows dueDate: null to clear the due date
