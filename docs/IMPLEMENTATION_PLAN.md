# QueueLess Implementation Plan

## 1. Delivered foundation

The current repository already contains:

- React/Vite client with shared layout and role-aware routes.
- Express API with modular routes and controllers.
- MongoDB/Mongoose models for users, organizations, services, queues, and
  tokens.
- JWT authentication and current-user lookup.
- Customer, staff, and admin authorization middleware.
- Request validation and authentication rate limiting.
- Queue creation, status changes, token creation, call-next, and completion.
- Unique indexes and concurrency handling for token invariants.
- Centralized safe API error handling.
- Backend Jest/Supertest coverage for authentication, validation, rate limits,
  database behavior, errors, and token concurrency.

## 2. Recommended delivery phases

### Phase 1 - Stabilize local development

- Keep `server/.env` local and ensure `.env.example` contains every required
  variable.
- Add a documented admin bootstrap command using
  `server/scripts/createFirstAdmin.js`.
- Confirm the client API base URL can be configured per environment.
- Run backend tests, frontend lint, and frontend production build in CI.

### Phase 2 - Complete customer experience

- Finish empty, loading, and error states on public organization pages.
- Show queue position and current serving token.
- Add explicit token cancellation if required by the product decision.
- Refresh token status automatically or introduce a real-time update channel.
- Add a clear session-expiration recovery flow.

### Phase 3 - Complete staff operations

- Show only organizations assigned to the logged-in staff member.
- Add queue filters for waiting, serving, completed, and cancelled tokens.
- Prevent accidental double-submit on call-next and complete actions.
- Add confirmation and visible success/error feedback for queue mutations.
- Make pause/resume behavior clear to customers.

### Phase 4 - Complete administration

- Build organization create/edit screens.
- Build service create/edit/deactivate screens.
- Build staff list, creation, and assignment screens.
- Add audit-friendly confirmation messages for role and assignment changes.

### Phase 5 - Quality and production readiness

- Add API contract tests for every documented endpoint.
- Add frontend component and route tests for critical flows.
- Add structured request correlation IDs and production-safe logging.
- Add health/readiness endpoints for deployment.
- Configure production CORS, HTTPS, secrets, backups, and monitoring.
- Perform accessibility testing with keyboard navigation and a screen reader.

## 3. Definition of done

A release is ready when:

- A new customer can register, browse, join, and track a queue.
- Staff can operate an assigned queue without exposing other organizations.
- Admins can configure organizations, services, and staff.
- Concurrent token operations preserve all database invariants.
- All documented API responses and error cases are covered by tests.
- `npm test`, `npm run lint`, and `npm run build` pass in a clean checkout.
- Production configuration contains no hard-coded secrets or localhost origins.

## 4. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Concurrent queue operations | Atomic updates, unique indexes, and concurrency tests |
| Stale or revoked access | Load current user and role on each authenticated request |
| Users waiting without updates | Polling initially; real-time events when needed |
| Incorrect organization access | Validate staff assignment server-side |
| Sensitive configuration exposure | Environment variables and secret management |
