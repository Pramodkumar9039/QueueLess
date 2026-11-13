# QueueLess Backend Schema

QueueLess uses MongoDB through Mongoose. All schemas include `createdAt` and
`updatedAt` timestamps unless noted otherwise.

## 1. User

Collection: `users`

| Field | Type | Rules |
|---|---|---|
| `name` | String | Required, trimmed |
| `email` | String | Required, unique, lowercase, trimmed |
| `password` | String | Required, minimum six characters; store a hash |
| `phone` | String | Optional, trimmed |
| `role` | String | `customer`, `staff`, or `admin`; defaults to `customer` |
| `isActive` | Boolean | Defaults to `true` |

## 2. Organization

Collection: `organizations`

| Field | Type | Rules |
|---|---|---|
| `name` | String | Required, trimmed |
| `type` | String | `clinic`, `salon`, `college`, or `other` |
| `address` | String | Required, trimmed |
| `description` | String | Optional |
| `owner` | ObjectId | Required reference to `User` |
| `staff` | ObjectId[] | References to assigned `User` documents |
| `isActive` | Boolean | Defaults to `true` |

## 3. Service

Collection: `services`

| Field | Type | Rules |
|---|---|---|
| `name` | String | Required, trimmed |
| `description` | String | Optional |
| `estimatedDuration` | Number | Required, minimum one |
| `organization` | ObjectId | Required reference to `Organization` |
| `isActive` | Boolean | Defaults to `true` |

## 4. Queue

Collection: `queues`

| Field | Type | Rules |
|---|---|---|
| `service` | ObjectId | Required reference to `Service` |
| `date` | String | Required queue date |
| `lastTokenNumber` | Number | Minimum zero, defaults to zero |
| `callNextVersion` | Number | Concurrency coordination version |
| `status` | String | `open`, `paused`, or `closed`; defaults to `open` |

Unique index: `{ service: 1, date: 1 }`

This guarantees one queue per service per date.

## 5. Token

Collection: `tokens`

| Field | Type | Rules |
|---|---|---|
| `queue` | ObjectId | Required reference to `Queue` |
| `customer` | ObjectId | Required reference to `User` |
| `tokenNumber` | Number | Required, minimum one |
| `status` | String | `waiting`, `serving`, `completed`, or `cancelled` |
| `joinedAt` | Date | Defaults to creation time |

Indexes:

- `{ queue: 1, tokenNumber: 1 }` unique: token numbers cannot repeat in a
  queue.
- `{ customer: 1 }` partial unique for `waiting` and `serving`: one active
  token per customer across all queues.
- `{ queue: 1 }` partial unique for `serving`: one serving token per queue.

## 6. Relationships

```text
User 1 ---- owns ---- * Organization
User * ---- assigned to ---- * Organization
Organization 1 ---- contains ---- * Service
Service 1 ---- has ---- * Queue (one per date)
Queue 1 ---- contains ---- * Token
User 1 ---- owns ---- * Token
```

## 7. State transitions

### Queue

```text
open <-> paused
open -> closed
paused -> closed
```

### Token

```text
waiting -> serving -> completed
waiting -> cancelled
serving -> cancelled
```

State transitions must be enforced by controller logic and protected by
authorization middleware. Database indexes provide the final protection for
the active-token and single-serving invariants.
