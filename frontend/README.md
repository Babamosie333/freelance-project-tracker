# Frontend — Freelance Project Tracker UI

React + Vite single-page app that consumes the Express API.

## Quick Start

```bash
npm install
npm run dev
```

Runs on **http://localhost:3000**. Requires the backend running on port 4000.

## How It Connects to the Backend

All API communication goes through **`src/services/api.js`** and **`src/context/AuthContext.js`**.

```js
const api = axios.create({ baseURL: '/api' });
// Axios interceptor attaches: Authorization: Bearer <token>
```

Unauthenticated users are redirected to `/login`. After login, every page only shows **that user's** data.

| Page | Imports |
|------|---------|
| `Login.js` / `Register.js` | `useAuth()` → `login`, `register` |
| `AuthContext.js` | `login`, `register`, `getMe` from `api.js` |

| Page | Imports from `api.js` |
|------|----------------------|
| `Dashboard.js` | `getDashboardStats` |
| `Projects.js` | `getProjects`, `createProject`, `deleteProject` |
| `ProjectDetail.js` | `getProject`, `updateProject`, `createTask`, `updateTask`, `deleteTask`, `toggleMilestone` |

### Dev Proxy (`vite.config.js`)

During development, the browser calls `http://localhost:3000/api/...`. Vite forwards those requests to the backend:

```js
proxy: {
  '/api': {
    target: 'http://localhost:4000',
    changeOrigin: true,
  },
},
```

This avoids CORS issues and lets the frontend use relative URLs (`/api/projects`) in both dev and production.

## Page → API Flow

### Login / Register (`/login`, `/register`)

1. User submits credentials.
2. `AuthContext` calls `POST /api/auth/login` or `POST /api/auth/register`.
3. JWT token + user saved to `localStorage`.
4. User redirected to personal dashboard.

### Dashboard (`/`)

1. On mount, calls `GET /api/projects/stats`.
2. Renders stat cards (earned, budget, pending, active projects).
3. Passes `earningsChart` and `projectEarnings` to Recharts components.

### Projects (`/projects`)

1. On mount, calls `GET /api/projects` (includes progress per project).
2. "Add Project" modal → `POST /api/projects`.
3. Delete button → `DELETE /api/projects/:id` (also removes tasks on backend).

### Project Detail (`/projects/:id`)

1. On mount, calls `GET /api/projects/:id` (returns project + tasks + progress).
2. Edit modal → `PUT /api/projects/:id`.
3. Click milestone → `PATCH /api/projects/:pid/milestones/:mid`.
4. Add task → `POST /api/tasks` with `projectId`.
5. Start/Done/Reopen → `PUT /api/tasks/:id` with new `status`.
6. Delete task → `DELETE /api/tasks/:id`.

## Verify Frontend–Backend Connection

With both servers running:

```bash
# This hits the backend through the Vite proxy (same path the UI uses)
curl http://localhost:3000/api/health
# → {"status":"ok","message":"Freelance Tracker API is running"}
```

Then open **http://localhost:3000** — the Dashboard should load stats and charts without errors.

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. In production, configure your web server to proxy `/api` to the Express backend (same pattern as the Vite dev proxy).

See the root [README.md](../README.md) for the full integration architecture and test results.
