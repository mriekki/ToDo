# Squad Decisions

## Active Decisions

### 2026-03-22: Express server structure
**By:** Fenster
**What:** Split `app.js` (Express config, routes) and `server.js` (listen/entrypoint). App is exported for testability without binding a port.
**Why:** Allows Hockney to require('./app') in tests without spinning up a real server.

### 2026-03-22: Test strategy kickoff
**By:** Hockney
**What:** Using Jest + Supertest against the exported Express app (app.js). `server.js` excluded from coverage (it only binds the port).
**Why:** App/server split from Fenster allows Supertest to mount the app without binding a real port — cleaner, faster tests.

### 2026-03-22: Tasks API structure
**By:** Fenster
**What:** In-memory task store (`src/data/taskStore.js`) with Express router (`src/routes/tasks.js`) mounted at `/api/tasks`. No database yet — array + integer ID counter.
**Why:** Keeps the API testable and runnable without a DB dependency. Easy to swap in a real DB later by replacing `taskStore.js`.
**Contract:**
- `GET /api/tasks` → 200 `[]`
- `GET /api/tasks/:id` → 200 task | 404
- `POST /api/tasks` → 201 task (requires `title`)
- `PUT /api/tasks/:id` → 200 task | 404
- `DELETE /api/tasks/:id` → 204 | 404

### 2026-03-22: In-memory store test isolation
**By:** Hockney
**What:** Use `jest.resetModules()` + re-require `app` in `beforeEach`. Resets module cache, giving each test a fresh in-memory store.
**Why:** The task store is a module-level array — without resetting modules, state leaks between tests causing false failures.

### 2026-03-22: React frontend structure
**By:** McManus
**What:** Vite + React app in `client/` subdirectory. Vite dev server proxies `/api/*` to `http://localhost:3000` — no CORS config needed in dev.
**Why:** Keeps frontend and backend as separate packages. Proxy avoids CORS issues without touching the backend.
**Structure:** `client/src/api/tasks.js` (all API calls), `App.jsx` (owns state), `client/src/components/` (TaskForm, TaskList, TaskItem)

### 2026-03-22: Frontend test strategy
**By:** Hockney
**What:** Vitest + @testing-library/react for component tests in `client/src/__tests__/`. Fetch mocked with `vi.fn()` for App tests.
**Why:** Vitest integrates natively with Vite — no separate Jest config needed for the React app. RTL encourages testing from the user's perspective.

### 2026-03-23: dueDate field added
**By:** Fenster
**What:** Added optional `dueDate` to task shape — ISO date string or null. Validated in POST/PUT routes. `null` on PUT clears the due date.
**Why:** User request. Fully backward-compatible — existing tasks have `dueDate: null`.

### 2026-03-23: Due date UI
**By:** McManus
**What:** `type="date"` input in TaskForm. TaskItem shows due date when present; highlights overdue (past due + incomplete) tasks in red.
**Why:** User request.

### 2026-03-23: dueDate test coverage
**By:** Hockney
**What:** 5 new backend tests (POST/PUT with dueDate, invalid date → 400, clear with null) + 3 frontend tests (TaskForm passes date, TaskItem shows/hides).
**Why:** New optional field — all paths (set, unset, invalid, clear) covered.

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
