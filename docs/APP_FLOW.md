# QueueLess Application Flow

## 1. Public customer flow

```text
Home
  -> Browse active organizations
  -> Select an organization
  -> View active services
  -> Select a service
  -> View today's queue
  -> Join queue
  -> Log in or register if required
  -> Receive token
  -> Queue success
  -> Track token status
```

### Screens

- `/` - browse organizations
- `/organizations/:organizationId` - organization details and services
- `/join-queue/:serviceId` - queue details and join action
- `/queue-success` - token confirmation
- `/login` and `/register` - authentication

## 2. Returning customer flow

```text
Login
  -> Dashboard
  -> View active token
  -> View current queue status
  -> Wait for staff to call token
  -> View serving status
  -> View completed status
```

The dashboard route is protected and requires a valid authenticated session.

## 3. Staff flow

```text
Login as staff
  -> Staff dashboard
  -> Select assigned organization/service queue
  -> View waiting and serving tokens
  -> Call next customer
  -> Serve customer
  -> Complete token
  -> Repeat or pause/resume queue
```

Staff access is allowed for `staff` and `admin` roles. The server must also
verify that the staff member is allowed to manage the selected organization.

## 4. Admin flow

```text
Login as admin
  -> Admin dashboard
  -> Create organization
  -> Create service
  -> Create staff account or find existing staff
  -> Assign staff to organization
  -> Monitor queue operations
```

Admin-only screens and API operations are protected by both authentication and
admin authorization.

## 5. Queue state flow

```text
Queue: open
  -> Customer joins
  -> Token: waiting
  -> Staff calls next
  -> Token: serving
  -> Staff completes
  -> Token: completed
```

Alternative paths:

- `open -> paused -> open`
- `open -> closed`
- `waiting -> cancelled` when cancellation is supported by the active UI/API

## 6. Failure flows

- Unauthenticated users are redirected to login for protected pages.
- Customers attempting staff/admin pages are redirected to the dashboard.
- Invalid forms show validation feedback and do not submit.
- Expired or revoked sessions are rejected by the API.
- Unknown frontend paths redirect to home.
- Unexpected API failures return a generic safe error message.
