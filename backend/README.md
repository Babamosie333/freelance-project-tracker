# Backend — Freelance Project Tracker API

Express + MongoDB REST API that powers the React frontend.

## Quick Start

```bash
npm install
npm run dev
```

Runs on **http://localhost:4000**. Requires MongoDB (see `backend/.env`).

## How It Connects to the Frontend

The React app never talks to MongoDB directly. All data flows through this API:

```
React (port 3000)  →  Vite proxy /api/*  →  Express (port 4000)  →  MongoDB
```

- **CORS** is enabled in `server.js` so the browser can call the API.
- **JWT auth** protects all project/task routes — each user sees only their own data.
- Routes are prefixed with `/api` to match the frontend Axios `baseURL`.
- Responses are always JSON.

## Route Mounting (`server.js`)

```js
app.use('/api/auth', authRoutes);         // register, login, me (public except /me)
app.use('/api/projects', projectRoutes);  // protected — user-scoped projects + stats
app.use('/api/tasks', taskRoutes);        // protected — tasks linked to user's projects
```

## Authentication

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/auth/register` | No | Create account, returns JWT |
| `POST /api/auth/login` | No | Sign in, returns JWT |
| `GET /api/auth/me` | Yes | Get logged-in user profile |

All `/api/projects` and `/api/tasks` routes require `Authorization: Bearer <token>`.
The `protect` middleware in `middleware/auth.js` decodes the JWT and sets `req.user`.
Every query filters by `req.user._id` so each user has a personal dashboard and projects.

## Collections

### User (`models/User.js`)

| Field | Type | Description |
|-------|------|-------------|
| name | String | Display name |
| email | String | Unique login email |
| password | String | Bcrypt-hashed (min 6 chars) |

### Project (`models/Project.js`)

| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId | Owner — links project to a user |
| clientName | String | Client name |
| projectName | String | Project title |
| deadline | Date | Due date |
| budget | Number | Total project budget |
| earnedAmount | Number | Amount earned so far |
| status | String | `active`, `completed`, `on-hold` |
| milestones | Array | Embedded sub-documents with `title`, `completed`, `dueDate` |

### Task (`models/Task.js`)

| Field | Type | Description |
|-------|------|-------------|
| projectId | ObjectId | Reference to parent project |
| title | String | Task name |
| status | String | `todo`, `in-progress`, `done` |
| priority | String | `low`, `medium`, `high` |

## Key Controller Logic

- **`getAllProjects`** — Returns each project with computed `progress`, `taskCount`, and `milestoneProgress`.
- **`getProjectById`** — Returns project + all its tasks + progress percentage.
- **`getDashboardStats`** — Aggregates budget, earnings, task counts, and chart data for the Dashboard page.
- **`deleteProject`** — Deletes the project and all tasks with matching `projectId`.
- **`toggleMilestone`** — Flips `completed` on an embedded milestone sub-document.

## Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in your MongoDB admin credentials:

```
PORT=4000
MONGODB_HOST=127.0.0.1
MONGODB_PORT=27017
MONGODB_DATABASE=freelance-tracker
MONGODB_ADMIN_USERNAME=your_admin_username
MONGODB_ADMIN_PASSWORD=your_admin_password
MONGODB_AUTH_SOURCE=admin
JWT_SECRET=your_secret_key_here
```

The server builds the connection URI automatically:

```
mongodb://USERNAME:PASSWORD@HOST:PORT/DATABASE?authSource=admin
```

If you already have a full URI, you can set `MONGODB_URI` directly and it will be used instead.

## Verify Backend Is Working

```bash
curl http://localhost:5000/api/health
# → {"status":"ok","message":"Freelance Tracker API is running"}

curl http://localhost:5000/api/projects/stats
# → JSON with totalBudget, totalEarned, earningsChart, etc.
```

See the root [README.md](../README.md) for the full frontend–backend integration guide.
