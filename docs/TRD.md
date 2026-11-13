# QueueLess Technical Requirements Document

## 1. System architecture

QueueLess uses a client-server architecture:

```text
React/Vite client
        |
        | JSON over HTTP
        v
Express API
        |
        | Mongoose
        v
MongoDB
```

The client uses Axios and React Router. The server exposes REST endpoints,
applies validation and authorization middleware, and persists data in
MongoDB.

## 2. Technology stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- React Icons

### Backend

- Node.js
- Express 5
- Mongoose 9
- JSON Web Tokens
- bcryptjs
- express-validator
- express-rate-limit
- CORS

### Testing

- Jest
- Supertest
- MongoDB Memory Server

## 3. Runtime configuration

The API reads configuration from `server/.env`:

| Variable | Required | Default | Description |
|---|---:|---|---|
| `PORT` | No | `5000` | HTTP port for the API |
| `MONGO_URI` | Yes | None | MongoDB connection string |
| `JWT_SECRET` | Yes | None | Secret used to sign and verify JWTs |
| `TRUST_PROXY_HOPS` | No | `0` | Number of trusted reverse-proxy hops |

The frontend currently targets `http://localhost:5000/api` from
`client/src/api/axios.js`.

## 4. API conventions

- Base URL: `/api`
- Content type: `application/json`
- Authentication header: `Authorization: Bearer <jwt>`
- Successful responses use JSON unless an endpoint explicitly returns an empty
  status.
- Invalid input returns a 4xx response.
- Unexpected server failures return a safe 500 response.
- Passwords are excluded from user responses.

## 5. API surface

### Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a customer |
| POST | `/auth/login` | Public | Authenticate a user |
| GET | `/auth/me` | Authenticated | Return the current user |

### Organizations and services

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/organizations` | Public | List active organizations |
| GET | `/organizations/assigned` | Staff/admin | List assigned organizations |
| POST | `/organizations` | Admin | Create an organization |
| GET | `/services/organization/:organizationId` | Public | List organization services |
| POST | `/services` | Admin | Create a service |

### Queues

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/queues/service/:serviceId` | Public | Get or create today's queue |
| PATCH | `/queues/service/:serviceId/status` | Staff/admin | Update queue status |

### Tokens

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/tokens` | Authenticated | Join a queue |
| GET | `/tokens/my-active` | Authenticated | Get the user's active token |
| GET | `/tokens/queue/:queueId/my-active` | Authenticated | Get active token in a queue |
| GET | `/tokens/queue/:queueId/customer-tokens` | Authenticated | View public queue tokens |
| GET | `/tokens/queue/:queueId/tokens` | Staff/admin | View queue tokens with customer details |
| POST | `/tokens/queue/:queueId/call-next` | Staff/admin | Call the next waiting token |
| GET | `/tokens/:tokenId/status` | Authenticated | Get the user's token status |
| PATCH | `/tokens/:tokenId/complete` | Staff/admin | Complete a serving token |

### Users

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/users` | Staff/admin | Create a user |
| POST | `/users/staff` | Admin | Create a staff account |
| PATCH | `/users/staff/assign` | Admin | Assign staff to an organization |
| GET | `/users/staff` | Admin | List staff |

## 6. Security requirements

- Hash passwords with bcryptjs before storage.
- Sign JWTs with a secret supplied through the environment.
- Load the current user from MongoDB during authentication.
- Reject inactive users and invalid or expired tokens.
- Enforce role middleware on staff and admin endpoints.
- Apply validation before controller logic.
- Keep production CORS restricted to the real client origin.
- Do not log passwords, tokens, or connection strings.

## 7. Reliability requirements

- Use unique indexes to enforce queue invariants at the database layer.
- Handle duplicate-key races as safe API errors.
- Keep call-next operations concurrency-safe.
- Use the centralized error handler for unexpected API failures.
- Keep tests deterministic by using an isolated MongoDB test instance.
