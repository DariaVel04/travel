# ADR-1: Modular monolith

## Context

The product is one travel planner with a shared trip model, built by a small team. Search, accounts, saved trips, and a future AI planner must stay consistent. Traffic is low. There is no need to scale search and accounts independently yet.

## Decision

Run one React frontend, one Express API, and one MySQL database. Split domains by folder (`frontend/src/features`, `backend/src/routes` and `services`), not by deployable service. Do not adopt NestJS or microservices for structure.

## Consequences

Deploys and local setup stay simple. Auth, types, and the trip model are not duplicated across services. Module boundaries have to stay in folders so the API does not collapse into one file. Revisit only if search or AI jobs block the request process.
