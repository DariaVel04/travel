# ADR-2: Cookie sessions, not localStorage tokens

## Context

The browser app and the API are different origins. The client must not be trusted to name the current user. Passwords and session secrets must not be readable by page scripts.

## Decision

Authenticate with a signed HTTP-only cookie (`atp_sid`). Store only a hash of the session token in `Session`. Resolve the user on the server from that cookie. Do not accept `userId` from the request body as identity.

## Consequences

XSS cannot read the session token. CORS must allow credentials, and the cookie `SameSite` policy must match how the frontend calls the API. Login and saved trips need the API and MySQL; search mocks still work when they are down. `SameSite=Lax` is enough for this JSON API unless cookie-authenticated form posts from other sites are added later.
