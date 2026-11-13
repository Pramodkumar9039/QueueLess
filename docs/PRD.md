# QueueLess Product Requirements Document

## 1. Product overview

QueueLess is a digital queue platform for organizations that serve people in
sequence, such as clinics, salons, colleges, and other service providers.
Customers should be able to discover a service, join its queue, and monitor
their progress remotely. Staff should be able to operate the queue safely and
admins should be able to configure the organizations and services.

## 2. Problem statement

Physical queues create uncertainty, crowding, and lost time. Organizations
also need a simple way to control the order of service and see which customers
are waiting, being served, or completed.

## 3. Goals

- Reduce unnecessary physical waiting.
- Give customers a clear token number and current status.
- Give staff a reliable workflow for calling and completing customers.
- Give administrators control over organizations, services, staff, and access.
- Preserve queue ordering when multiple staff actions happen concurrently.

## 4. Users and permissions

### Customer

- Browse active organizations and services.
- View today's queue.
- Join a queue when authenticated.
- View the customer's active token and status.
- Cancel or monitor a token where supported by the product workflow.

### Staff

- View assigned organizations and queue tokens.
- Pause or resume a queue.
- Call the next waiting customer.
- Complete the serving token.

### Administrator

- Create organizations and services.
- Create staff accounts.
- Assign existing staff to organizations.
- Review staff accounts.
- Use all staff queue operations.

## 5. Functional requirements

### Authentication

- Users can register and log in with email and password.
- Authenticated requests use a JWT bearer token.
- The API verifies that the user still exists and is active.
- Current database role is used for authorization, so revoked privileges take
  effect even when an old JWT is presented.
- Login and registration requests are rate limited.

### Organization and service discovery

- Public users can browse active organizations.
- Each organization exposes active services.
- A service has a name, description, and estimated duration.
- An organization can be a clinic, salon, college, or other service type.

### Queue operations

- A service has at most one queue for a given date.
- A queue can be open, paused, or closed.
- A customer receives a sequential token number.
- A customer cannot hold more than one active token across queues.
- Only one customer can be serving in a queue at a time.
- Staff can call the next waiting customer and complete the serving customer.

### Administration

- Admins can create organizations and services.
- Admins can create staff and assign staff to organizations.
- Staff access must be limited to staff/admin users.

## 6. Non-functional requirements

- Do not expose passwords, JWT secrets, or internal database errors in API
  responses.
- Validate request bodies and MongoDB identifiers before database operations.
- Return consistent JSON errors.
- Keep queue mutations atomic and safe under concurrent requests.
- Provide responsive, keyboard-accessible screens for desktop and mobile.

## 7. Success metrics

- Customers can join a queue in under one minute.
- Queue status is understandable without staff assistance.
- No duplicate active customer tokens are created under concurrent requests.
- No queue has more than one serving token.
- Backend tests cover authentication, validation, errors, rate limits, and
  token concurrency.

## 8. Out of scope for the current release

- SMS, email, or push notifications.
- Payments and billing.
- Multi-factor authentication.
- Appointment scheduling.
- Historical analytics and reporting dashboards.
- Native mobile applications.
