# Freelance Project Tracker
##Author: Vikram Singh
A MERN stack app to manage freelance client projects, tasks, milestones, and earnings.

## Features

- **Personal accounts** — each user registers and gets their own dashboard and projects
- **JWT authentication** — secure login/register with token-based sessions
- **Data isolation** — users only see their own projects, tasks, and earnings
- Add client projects with deadline and budget
- Track tasks under each project (todo → in-progress → done)
- Mark milestones as done with click-to-toggle
- Personal earnings dashboard with Recharts bar charts
- Progress bars for task and milestone completion
- Dark modern UI

## Tech Stack

- **Frontend:** React (JavaScript), Vite, React Router, Recharts, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB

## Prerequisites

- Node.js 18+
- MongoDB running locally with admin username/password (set in `backend/.env`)

## Setup

### 1. Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or run manually
mongod
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Server runs at `http://localhost:4000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`

> **Important:** Both servers must run at the same time. Start the backend first, then the frontend. Open `http://localhost:3000` and **register or log in** to access your personal dashboard.

---

## Personal Dashboard & Multi-User

Every user gets their own private workspace:

| What | How it works |
|------|--------------|
| Register / Login | `POST /api/auth/register` and `POST /api/auth/login` return a JWT token |
| Personal dashboard | `GET /api/projects/stats` returns stats for **only the logged-in user** |
| Personal projects | All project/task routes filter by `userId` from the JWT |
| Data isolation | Alice cannot see Bob's projects, tasks, or earnings |

### Auth Flow

```
1. User registers or logs in → receives JWT token
2. Frontend stores token in localStorage
3. Every API request sends: Authorization: Bearer <token>
4. Backend middleware verifies token → attaches req.user
5. Controllers query only data where userId = req.user._id
```

### First-Time Use

1. Go to `http://localhost:3000` — you'll be redirected to `/login`
2. Click **Create one** to register with name, email, and password
3. After login, you land on **your personal dashboard** with your name in the header
4. Add projects — they belong only to your account

---

## Frontend–Backend Integration

The frontend and backend are fully connected and tested to work together. Here is how they communicate.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (http://localhost:3000)                                │
│                                                                 │
│  React Pages                                                    │
│  ├── Login.js / Register.js → POST /api/auth/login|register    │
│  ├── Dashboard.js           → GET /api/projects/stats          │
│  ├── Projects.js            → GET/POST/DELETE /api/projects     │
│  └── ProjectDetail.js         → GET/PUT /api/projects/:id       │
│                               → PATCH milestones, tasks CRUD     │
│                           │                                     │
│                           ▼                                     │
│  AuthContext.js + services/api.js (JWT in Authorization header) │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              Vite dev proxy (vite.config.js)
              forwards /api/* → http://localhost:4000
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Express API (http://localhost:5000)                            │
│                                                                 │
│  server.js                                                      │
│  ├── CORS enabled (allows browser requests)                     │
│  ├── JSON body parsing                                          │
│  ├── /api/projects  → projectRoutes → projectController         │
│  └── /api/tasks     → taskRoutes    → taskController            │
│                           │                                     │
│                           ▼                                     │
│                   Mongoose Models                               │
│                   ├── Project (milestones embedded)             │
│                   └── Task (linked via projectId)               │
│                           │                                     │
│                           ▼                                     │
│                   MongoDB (freelance-tracker database)          │
└─────────────────────────────────────────────────────────────────┘
```

### How Requests Flow

1. **User action in React** — e.g. clicking "Add Project" on the Projects page.
2. **API service call** — `frontend/src/services/api.js` sends an Axios request to `/api/projects`.
3. **Vite proxy** — In development, Vite forwards `/api/*` to `http://localhost:5000` so the browser never hits CORS issues.
4. **Express route** — `backend/routes/projectRoutes.js` matches the URL and method.
5. **Controller logic** — `backend/controllers/projectController.js` reads/writes MongoDB via Mongoose.
6. **JSON response** — Data is sent back to React, which updates the UI.

### Connection Configuration

| Layer | File | Role |
|-------|------|------|
| API client | `frontend/src/services/api.js` | Axios with `baseURL: '/api'` + JWT interceptor |
| Auth state | `frontend/src/context/AuthContext.js` | Stores user + token, handles login/logout |
| Dev proxy | `frontend/vite.config.js` | Proxies `/api` → `http://localhost:4000` |
| Auth middleware | `backend/middleware/auth.js` | Verifies JWT, sets `req.user` on every protected route |
| Routes | `backend/server.js` | `/api/auth` (public), `/api/projects` & `/api/tasks` (protected) |
| Database | `backend/.env` | `MONGODB_ADMIN_USERNAME`, `MONGODB_ADMIN_PASSWORD`, `JWT_SECRET` |

### UI → API Mapping

| Page | User Action | Frontend Call | Backend Endpoint |
|------|-------------|---------------|------------------|
| Login | Sign in | `login({ email, password })` | `POST /api/auth/login` |
| Register | Create account | `register({ name, email, password })` | `POST /api/auth/register` |
| Dashboard | Page loads | `getDashboardStats()` | `GET /api/projects/stats` (user-scoped) |
| Projects | Page loads | `getProjects()` | `GET /api/projects` |
| Projects | Add project | `createProject(data)` | `POST /api/projects` |
| Projects | Delete project | `deleteProject(id)` | `DELETE /api/projects/:id` |
| Project Detail | Page loads | `getProject(id)` | `GET /api/projects/:id` |
| Project Detail | Edit project | `updateProject(id, data)` | `PUT /api/projects/:id` |
| Project Detail | Toggle milestone | `toggleMilestone(pid, mid)` | `PATCH /api/projects/:pid/milestones/:mid` |
| Project Detail | Add task | `createTask(data)` | `POST /api/tasks` |
| Project Detail | Update task status | `updateTask(id, data)` | `PUT /api/tasks/:id` |
| Project Detail | Delete task | `deleteTask(id)` | `DELETE /api/tasks/:id` |

### Data Relationships

- **Users** are stored in the `users` collection (name, email, hashed password).
- **Projects** belong to a user via `userId` and contain embedded **milestones**.
- **Tasks** are stored in the `tasks` collection with a `projectId` field referencing the parent project.
- When you fetch a project (`GET /api/projects/:id`), the backend also loads its tasks and calculates **progress** (% of tasks marked `done`).
- When you delete a project, the backend automatically deletes all linked tasks.
- Dashboard stats are computed server-side from all projects and tasks (total budget, earned amount, charts).

### Verified Integration Tests

The following flows were tested end-to-end through the Vite proxy (`http://localhost:3000/api/*` → backend):

| Test | Result |
|------|--------|
| Register & login | ✅ Pass |
| Personal dashboard per user | ✅ Pass |
| User data isolation (Alice vs Bob) | ✅ Pass |
| Unauthenticated requests rejected | ✅ Pass |
| Health check via proxy | ✅ Pass |
| Dashboard stats via proxy | ✅ Pass |
| Create project with milestones | ✅ Pass |
| Create task under project | ✅ Pass |
| Update task status (todo → in-progress) | ✅ Pass |
| Get project with tasks and progress | ✅ Pass |
| Toggle milestone completed | ✅ Pass |
| List projects with computed progress | ✅ Pass |
| Delete task | ✅ Pass |
| Delete project (cascades tasks) | ✅ Pass |

Run the quick verification yourself:

```bash
# Register a user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Use the returned token for personal dashboard
curl http://localhost:3000/api/projects/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in, get JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/health` | No | Health check |
| GET | `/api/projects` | Yes | List **your** projects with progress |
| GET | `/api/projects/stats` | Yes | **Your** dashboard earnings stats |
| GET | `/api/projects/:id` | Yes | Get **your** project with tasks |
| POST | `/api/projects` | Yes | Create project (auto-linked to you) |
| PUT | `/api/projects/:id` | Yes | Update **your** project |
| DELETE | `/api/projects/:id` | Yes | Delete **your** project + tasks |
| PATCH | `/api/projects/:projectId/milestones/:milestoneId` | Yes | Toggle milestone |
| GET | `/api/tasks/project/:projectId` | Yes | Get tasks for **your** project |
| POST | `/api/tasks` | Yes | Create task |
| PUT | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |

## Project Structure

```
freelance-project-tracker/
├── README.md                 # This file (full integration guide)
├── backend/
│   ├── README.md             # Backend-specific details
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env
└── frontend/
    ├── README.md             # Frontend-specific details
    └── src/
        ├── components/
        ├── pages/
        ├── services/api.js   # All backend API calls
        ├── App.js
        └── main.jsx
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Redirected to login page | Register or log in first — all data routes require auth |
| Dashboard shows "Failed to load" | Start the backend (`cd backend && npm run dev`) |
| `MongoDB connection error` | Start MongoDB (`brew services start mongodb-community`) |
| API calls return 404 on port 3000 | Check `vite.config.js` proxy points to port 4000 |
| `Not authorized` errors | Log in again — token may have expired (7-day expiry) |
| CORS errors in browser | Backend already has `cors()` enabled; restart both servers |
| Empty charts | Add projects with `earnedAmount` values via My Projects |
