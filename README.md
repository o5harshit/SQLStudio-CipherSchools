# CipherSQLStudio

CipherSQLStudio is a full-stack SQL practice platform where users:

- Sign up / log in with cookie-based authentication
- Pick SQL assignments loaded from MongoDB
- Execute SQL queries in a PostgreSQL sandbox
- Get hint support from Gemini
- Receive correctness validation against expected output
- Track attempts needed to reach the correct query

## Tech Stack

### Frontend

- React (Vite)
- React Router
- Redux Toolkit
- Axios
- Monaco Editor
- SCSS

### Backend

- Node.js + Express
- MongoDB + Mongoose (assignments, users, attempts, token revocation)
- PostgreSQL (`pg`) for SQL sandbox execution
- JWT + bcrypt authentication
- Cookie-based auth with `HttpOnly` cookies
- Gemini (`@google/genai`) for hints

## Why These Technology Choices

- React + Vite: fast local development and simple component architecture.
- Redux Toolkit: lightweight global auth state management.
- SCSS: structured, reusable styling with variables/mixins.
- MongoDB: flexible schema for nested assignment definitions and attempt logs.
- PostgreSQL: reliable SQL execution engine for assignment sandboxing.
- JWT + HttpOnly Cookie: secure session handling with stateless auth.
- Gemini API: hint generation without exposing complete solutions.

## Project Structure

```text
CipherSchool/
  client/   # React frontend
  server/   # Express backend
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB instance (local or Atlas)
- PostgreSQL instance

## Environment Variables

### Server (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
AUTH_COOKIE_NAME=auth_token
CLIENT_ORIGIN=http://localhost:5173

PGHOST=localhost
PGPORT=5432
PGDATABASE=sql_practice
PGUSER=postgres
PGPASSWORD=your_password

GEMINI_API_KEY=your_gemini_api_key
```

### Client (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:8747/api
```

## Setup Instructions

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd CipherSchool
cd server && npm install
cd ../client && npm install
```

## 2. Configure Environment

- Create `server/.env` from `server/.env.example`
- Create `client/.env` with `VITE_API_BASE_URL`

## 3. Start Databases

- Ensure MongoDB and PostgreSQL are running
- Create PostgreSQL DB:

```sql
CREATE DATABASE sql_practice;
```

## 4. Seed MongoDB Assignments

Insert assignment documents into the `assignments` collection (including `sampleTables` and `expectedOutput`).

## 5. Run the App

### Start backend

```bash
cd server
npm run dev
```

### Start frontend

```bash
cd client
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8747`

## Authentication Flow

- `POST /api/auth/signup` -> creates user and sets auth cookie
- `POST /api/auth/login` -> logs in and sets auth cookie
- `POST /api/auth/logout` -> revokes token + clears cookie
- `GET /api/auth/me` -> returns current user from cookie token

All assignment/query APIs are protected and require valid auth cookie.

## Query Execution Flow

1. Load assignment from MongoDB
2. Create temp PostgreSQL tables from `sampleTables`
3. Insert sample rows
4. Execute user SQL (validated and sandboxed)
5. Compare result with `expectedOutput`
6. Return rows + correctness status + attempt metrics

## Notes

- Hints are guidance-only (not full solutions).
- Query attempts are stored per user for progress tracking.
- If Gemini key is missing, backend can still return fallback hints.
