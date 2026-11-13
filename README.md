# QueueLess

QueueLess is a queue-management platform that lets customers join service
queues remotely while staff manage the queue from a dashboard. Administrators
create organizations and services, staff operate queues, and customers track
their token status without waiting in a physical line.

## Documentation

The project documentation is split into focused documents:

1. [Product Requirements Document](./docs/PRD.md) - product goals, users, and
   functional requirements.
2. [Technical Requirements Document](./docs/TRD.md) - architecture, stack,
   security, and API requirements.
3. [Application Flow](./docs/APP_FLOW.md) - customer, staff, and admin flows.
4. [UI/UX Design Brief](./docs/UI_UX_DESIGN_BRIEF.md) - interface principles,
   layout, accessibility, and responsive behavior.
5. [Backend Schema](./docs/BACKEND_SCHEMA.md) - MongoDB models, relationships,
   indexes, and state transitions.
6. [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md) - delivered work and
   the next recommended milestones.

## Project structure

```text
QueueLess/
├── client/                 # React and Vite frontend
│   └── src/
│       ├── components/     # Shared layout and route components
│       ├── context/        # Authentication state
│       ├── pages/          # Customer, staff, and admin screens
│       └── api/            # Axios API client
├── server/                 # Express and MongoDB backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Authentication, authorization, and validation
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── scripts/            # Operational scripts
│   └── tests/              # Backend tests
└── docs/                   # Product and engineering documentation
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB database

## Local setup

### 1. Start the API

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Set `MONGO_URI` and a strong `JWT_SECRET` in `server/.env`, then run:

```powershell
npm start
```

The API runs on `http://localhost:5000` by default.

### 2. Start the frontend

```powershell
cd client
npm install
npm run dev
```

The Vite development server runs on `http://localhost:5173`.

## Validation

Run backend tests:

```powershell
cd server
npm test
```

Run frontend linting and a production build:

```powershell
cd client
npm run lint
npm run build
```

## Security notes

- Never commit `.env` files or real credentials.
- Use a unique production `JWT_SECRET`.
- Restrict CORS to the deployed frontend origin.
- Use HTTPS in production.
- Review role assignments before granting staff or admin access.