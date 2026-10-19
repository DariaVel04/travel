# Backend

Express API for the travel platform. It reads and writes MySQL through Prisma. Schema and migrations live in `/database`.

## Setup

From the repo root:

```bash
npm install
cp backend/.env.example backend/.env
cp database/.env.example database/.env
```

Set the same `DATABASE_URL` in both `.env` files. Then generate the Prisma client and apply migrations (see `/database/README.md`).

```bash
npm run prisma:generate
npm run prisma:migrate
npm run dev:backend
```

## Layout

- `routes` — HTTP paths
- `controllers` — request/response
- `services` — business logic
- `src/config/prisma.ts` — Prisma Client
- `middleware` — errors and 404s
- `schemas` — Zod validation

## API

| Method | Path |
| --- | --- |
| GET | `/api/health` |
| GET/POST | `/api/trips` |
| GET/PUT/DELETE | `/api/trips/:id` |
| GET/POST | `/api/trips/:tripId/options` |
| GET/POST | `/api/trips/:tripId/itinerary` |
| GET | `/api/accommodations` |
| GET | `/api/transport` |

There is no authentication UI. User `passwordHash` is never returned.
