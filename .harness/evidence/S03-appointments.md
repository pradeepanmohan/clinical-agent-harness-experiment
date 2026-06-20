# S03 Appointment Scheduling Evidence

## Summary

Implemented the appointment scheduling vertical slice within the S03 scope.

- Added shared Zod appointment schemas and DTO types for create, update status, list, and appointment responses.
- Added a Drizzle `appointments` table with foreign keys to `patients` and `doctors`, and an `appointment_status` enum.
- Created SQL migration `0003_create_appointments.sql`.
- Added NestJS appointment create, list, get-by-id, and update status endpoints under `/appointments`.
- Added minimal Next.js appointment list and create form under `/appointments`.
- Added API tests for create, list, get by id, update status, missing patient/doctor, scheduled in the past, and invalid status.

No recurring appointments, calendar sync, notifications, payments, or auth behavior was added.

## Files changed

- `.harness/evidence/S03-appointments.md`
- `.harness/PROGRESS.md`
- `.harness/TASKS.json`
- `apps/api/src/app.module.ts`
- `apps/api/src/appointments/appointments.controller.test.ts`
- `apps/api/src/appointments/appointments.controller.ts`
- `apps/api/src/appointments/appointments.module.ts`
- `apps/api/src/appointments/appointments.service.ts`
- `apps/web/src/app/appointments/page.tsx`
- `apps/web/src/app/appointments/new/page.tsx`
- `packages/db/src/schema.ts`
- `packages/db/src/migrations/0003_create_appointments.sql`
- `packages/shared/src/index.ts`
- `packages/shared/src/appointment.ts`

## Commands run

- `pnpm --filter @clinical/shared build`: passed, refreshing the shared package `dist` export for package-based API tests.
- `pnpm --filter @clinical/api test`: passed with 29 API tests, including 13 new appointment tests.
- `pnpm lint`: passed. Turbo reported 4 successful lint tasks.
- `pnpm typecheck`: passed. Turbo reported 5 successful tasks, including the shared build dependency.
- `pnpm test`: passed. Turbo reported 4 successful test tasks. Vitest reported 34 total passing tests across API, DB, shared, and web packages.
- `pnpm build`: passed. Turbo reported 4 successful build tasks. Next.js built `/appointments` and `/appointments/new` successfully.

## Test results

- API appointment tests: 13 passing tests covering:
  - Create appointment with valid input
  - Reject appointment missing patientId
  - Reject appointment missing doctorId
  - Reject appointment scheduled in the past
  - Reject appointment missing scheduledAt
  - List appointments (empty and populated)
  - Get appointment by id
  - Get missing appointment throws NotFoundException
  - Update status to checked_in, completed, cancelled
  - Reject invalid status
- Existing patient, doctor, scaffold, DB, shared, and web tests remained passing.
- Full final `pnpm test` result: 4 package test tasks passed, 34 tests passed, 0 failed.

## Acceptance criteria

All acceptance criteria have been met:

- [x] Create appointment with patient and doctor.
- [x] Reject appointment for missing patient or doctor.
- [x] Reject new appointment scheduled in the past.
- [x] Default status is `scheduled`.
- [x] Update status to `checked_in`, `completed`, or `cancelled`.
- [x] Tests cover core behavior.
- [x] Evidence written to `.harness/evidence/S03-appointments.md`.

## Implementation notes

### Schema design

The appointment schema includes:
- `id`: UUID primary key
- `patientId`: UUID foreign key to patients table (required)
- `doctorId`: UUID foreign key to doctors table (required)
- `scheduledAt`: timestamp with timezone (required)
- `status`: enum of `scheduled` (default), `checked_in`, `completed`, `cancelled`
- `createdAt`: timestamp with timezone
- `updatedAt`: timestamp with timezone

### Validation

- The `createAppointmentSchema` requires `patientId`, `doctorId`, and `scheduledAt`.
- The service validates that `scheduledAt` is not in the past before creating an appointment.
- The `updateAppointmentStatusSchema` validates that status is one of the allowed enum values.

### API endpoints

- `POST /appointments` - Create a new appointment
- `GET /appointments` - List all appointments
- `GET /appointments/:id` - Get a specific appointment
- `PATCH /appointments/:id/status` - Update appointment status

### Web UI

- `/appointments` - List all appointments with basic information
- `/appointments/new` - Form to create a new appointment with patient ID, doctor ID, and scheduled date/time

## Known limitations

- The NestJS appointment service uses in-memory storage. The DB appointments table and migration exist, but the API is not yet wired to a database-backed repository.
- No migration runner was added or executed; S03 only adds the migration file and Drizzle schema.
- The web create form requires manual entry of patient and doctor IDs rather than dropdowns.
- The appointments list page shows IDs rather than patient/doctor names (would require joins or additional fetches).
- The web create form posts to `NEXT_PUBLIC_CLINICAL_API_URL` or `http://localhost:3001` by default, so the API server must be running for interactive create/list behavior.
- No allowed-files policy update was required for S03 (the policy already listed all necessary paths).

## Next suggested task

S04: Implement today's appointments dashboard.
