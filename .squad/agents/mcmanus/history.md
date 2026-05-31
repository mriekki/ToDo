# Project Context

- **Owner:** Mark Riekki
- **Project:** Task Management App — users can create, update, and delete tasks
- **Stack:** React (frontend), Node.js (backend)
- **Created:** 2026-03-22

## Core Context

React frontend for a task manager. Key views: task list, task creation form, task editing, task deletion. Consumes a REST API built by Fenster.

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- React app lives in client/ subdirectory (Vite)
- Vite proxy: /api/* → http://localhost:3000 (no CORS issues in dev)
- All API calls centralized in client/src/api/tasks.js
- State owned at App level, passed down via props
- TaskForm, TaskList, TaskItem components in client/src/components/
- Test setup: Vitest + @testing-library/react + jsdom, setup file at client/src/test/setup.js
- dueDate: date input (type="date") in TaskForm, value is "" or "YYYY-MM-DD" string
- Pass dueDate as null (not empty string) when not set — api/tasks.js omits it from body if falsy
- TaskItem: isOverdue = dueDate && !completed && new Date(dueDate) < new Date()
- Overdue tasks get red .due-date.overdue styling
## ABANDONED: TODO-20260530184200 — 2026-05-30
All artifacts removed (stories folder, branches, worktrees). Any prior notes
referencing TODO-20260530184200 spec.md / plan.md / tasks.md are now stale — those
files no longer exist. If this ticket is restarted, treat it as a fresh start.

