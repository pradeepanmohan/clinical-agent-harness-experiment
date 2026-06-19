# Architecture

## Target architecture

```txt
apps/web       Next.js App Router UI
apps/api       NestJS REST API
packages/db    Drizzle schema, migrations, db client
packages/shared shared validation and DTO schemas
PostgreSQL     relational persistence
```

## Data flow

```txt
Browser
-> Next.js route/page/action
-> NestJS REST API
-> shared validation
-> DB repository/service
-> PostgreSQL
```

## Package boundaries

| Package | Responsibility |
|---|---|
| `apps/web` | UI, forms, navigation, API client calls |
| `apps/api` | HTTP routes, services, validation, error mapping |
| `packages/db` | schema, migrations, DB connection, repository helpers |
| `packages/shared` | shared Zod schemas, DTO types, enum definitions |

## Initial API shape

Patients:

```txt
POST   /patients
GET    /patients
GET    /patients/:id
PATCH  /patients/:id
```

Doctors:

```txt
POST   /doctors
GET    /doctors
GET    /doctors/:id
PATCH  /doctors/:id
```

Appointments:

```txt
POST   /appointments
GET    /appointments/today
PATCH  /appointments/:id/status
```

Clinical notes:

```txt
POST   /appointments/:id/notes
GET    /appointments/:id/notes
```

## Verification layers

- Unit tests for shared validation.
- API tests for service/controller behavior.
- DB tests for repository and migration behavior.
- Frontend smoke tests after the UI exists.

## Architecture constraints

- Keep the first milestone boring.
- Avoid one-off abstractions.
- Do not introduce auth in S00 or S01.
- Do not add external services.
- Favor explicit schema and simple REST endpoints.
