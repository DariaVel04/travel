# Travel Platform

```
Travel Platform
├── frontend → React + TypeScript + Vite
├── backend  → Node.js + TypeScript + Express
└── database → MySQL + Prisma
```

The UI talks to the API over HTTP. The API talks to MySQL through Prisma. The frontend still uses mock services today; `frontend/src/services/api` is the place to switch those calls to the backend later.

## Start

1. **MySQL** — `npm run db:up` (Docker) or create a local `travel_platform` database.
2. **Database** — `cp database/.env.example database/.env` and set `DATABASE_URL`. Then:

   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   ```

3. **Backend** — `cp backend/.env.example backend/.env` (same `DATABASE_URL`, plus `PORT` and `CORS_ORIGIN`).

   ```bash
   npm run dev:backend
   ```

4. **Frontend**

   ```bash
   npm run dev
   ```

Optional: `cp frontend/.env.example frontend/.env` to set `VITE_API_URL` (defaults to `http://localhost:4000`).

Prisma Studio: `npm run prisma:studio`.
