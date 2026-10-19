# ADR-3: AI behind TripPlanningService, keys on the server

## Context

The vacation planner UI already depends on `TripPlanningService` (`generateTripOptions`, `generateItinerary`). Today that interface is implemented by in-browser mocks. A later model must not force a UI rewrite, and provider API keys must not ship to the browser.

## Decision

Keep the planner UI on `TripPlanningService`. When a model is added, implement that interface on the Express backend. Validate model JSON with Zod before saving `TripOption` and `Itinerary`. Do not call OpenAI, Claude, or DeepSeek from React.

## Consequences

Mocks can stay until the backend implementation exists. Swapping providers is a server change. The model must not invent bookable prices once partner offers exist; scoring stays deterministic code. DeepSeek is acceptable only as a cheap draft model behind the same Zod check.
