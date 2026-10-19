# Database

MySQL schema and Prisma migrations for the travel platform. No React or Express code lives here.

## Models

User, Trip, TripOption, Transport, Accommodation, Itinerary, ItineraryDay, Activity, TripCost.

`User.status` defaults to `ACTIVE`. `User.subscriptionPlan` defaults to `FREE`. Payments are not implemented.

## Setup

```bash
cp database/.env.example database/.env
```

Set `DATABASE_URL`, then from the repo root:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

Do not run destructive resets against an existing database.

`seed/seed.ts` is a placeholder and does not insert travel data.
