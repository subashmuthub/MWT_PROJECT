# Copilot Instructions for AI Agents

## Project Overview
This codebase is a Laboratory Management System (LabMS) with a React + Vite frontend (`frontend/`) and a Node.js/Express + Sequelize backend (`zbackend/`). The system manages labs, equipment, bookings, users, maintenance, orders, notifications, and reports.

## Architecture & Data Flow
- **Frontend**: React (with hooks, context, and functional components), communicates with backend via REST API (`/api/*`).
  - Auth state is managed in `src/contexts/AuthContext.jsx`.
  - API calls are abstracted in `src/services/api.js` (see `apiCall`, `usersAPI`, etc.).
  - Custom hooks (e.g., `useEquipment`) encapsulate resource logic.
  - Major pages are in `src/pages/`, with shared UI in `src/components/`.
  - Chatbot UI (`components/Chatbot.jsx`) interacts with backend `/api/chatbot` for intelligent lab queries.
- **Backend**: Express server (`zbackend/server.js`) exposes REST endpoints for all resources under `/api/`.
  - Sequelize models in `zbackend/models/` define DB schema and relationships (see `models/index.js`).
  - Each resource has a route file in `zbackend/routes/` (e.g., `users.js`, `equipment.js`).
  - Middleware for auth/roles in `middleware/auth.js`.
  - Reports and exports handled in `services/`.
  - Database config in `config/database.js` (MySQL, env-driven).

## Developer Workflows
- **Frontend**:
  - Start dev server: `npm run dev` (in `frontend/`)
  - Build: `npm run build`
  - Lint: `npm run lint`
  - Uses Vite proxy for `/api` to backend (`vite.config.js`)
- **Backend**:
  - Start: `npm start` (in `zbackend/`)
  - Dev mode: `npm run dev` (nodemon)
  - Test DB connection: `npm run test-db`
  - DB migrations: use Sequelize CLI (`sequelize-cli`)

## Project-Specific Patterns & Conventions
- **API URLs**: Always use `/api/` prefix. Frontend expects this for proxying.
- **Auth**: JWT-based, token stored in localStorage, sent as `Authorization: Bearer <token>`.
- **Role-based Access**: Use `authenticateToken` and role middleware in backend routes.
- **Data Models**: All major entities (Lab, Equipment, User, Booking, etc.) are Sequelize models with explicit associations (see `models/index.js`).
- **Error Handling**: Backend returns JSON with `error` or `success` fields; frontend expects and handles these.
- **Chatbot**: `/api/chatbot` endpoint parses natural language queries for lab/equipment info (see `routes/chatbot.js`).
- **Reports/Exports**: Use backend `reportService.js` and `excelExportService.js` for analytics and downloads.
- **Frontend State**: Use React context for auth, hooks for resource logic, and local state for UI.

## Integration Points
- **Frontend/Backend**: All data flows via REST API. No direct DB access from frontend.
- **External**: Uses MySQL (backend), OpenAI (for chatbot, if configured), ExcelJS (for exports).

## Examples
- To fetch all users: `usersAPI.getAll()` (frontend) → `/api/users` (backend)
- To add equipment: POST to `/api/equipment` with auth token
- To generate a report: Use `/api/reports` endpoints

## Key Files/Directories
- `frontend/src/services/api.js` — API abstraction
- `frontend/src/contexts/AuthContext.jsx` — Auth logic
- `frontend/src/pages/` — Main UI pages
- `zbackend/routes/` — API endpoints
- `zbackend/models/` — Data models
- `zbackend/services/` — Business logic (reports, exports)
- `zbackend/config/database.js` — DB config

---
For new features, follow the established API patterns and React context/hook conventions. When in doubt, check the corresponding route/model/service in backend and the API abstraction in frontend.
