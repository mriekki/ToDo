# Project Context

- **Owner:** Mark Riekki
- **Project:** Task Management App — users can create, update, and delete tasks
- **Stack:** React (frontend), Node.js (backend)
- **Created:** 2026-03-22

## Core Context

Testing a task manager: React UI + Node.js API. Key flows to cover: create task, update task (title, status, description), delete task, list tasks, empty states, validation errors.

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- Test entry point: src/__tests__/health.test.js using Jest + Supertest
- Import app from src/app.js directly (not server.js) — no port binding needed
- jest.config.js excludes server.js from coverage
- Tasks test file: src/__tests__/tasks.test.js
- Use jest.resetModules() + re-require('../app') in beforeEach to reset in-memory store between tests
- DELETE returns 204 with no body — test with expect(res.status).toBe(204) only
- PUT 400 case: test both missing title and empty string title
- Frontend tests: Vitest + @testing-library/react in client/src/__tests__/
- Mock fetch with global.fetch = vi.fn() + mockResolvedValueOnce
- Use waitFor for async rendering after fetch
- vi.mock for mocking child components in parent tests
- Test files: TaskForm.test.jsx, TaskItem.test.jsx, TaskList.test.jsx, App.test.jsx
- SQLite test isolation: set process.env.DB_PATH = ':memory:' at top of test file (before imports)
- jest.resetModules() + re-require still works — each re-require opens a new ':memory:' DB connection
- process.env vars survive jest.resetModules() (they're on process, not in module registry)
- dueDate backend tests: POST with valid date, POST without date (null), POST with invalid date (400), PUT update, PUT clear with null
- dueDate frontend tests: TaskForm passes dueDate to onSubmit, TaskItem shows/hides due date based on dueDate field
## ABANDONED: TODO-20260530184200 — 2026-05-30
All artifacts removed (stories folder, branches, worktrees). Any prior notes
referencing TODO-20260530184200 spec.md / plan.md / tasks.md are now stale — those
files no longer exist. If this ticket is restarted, treat it as a fresh start.

