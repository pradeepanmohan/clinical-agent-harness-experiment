# S03 Appointment Scheduling Evidence

## Summary

Implemented the appointment scheduling vertical slice.

- Added shared appointment schemas, DTO types, and appointment status validation.
- Added a Drizzle `appointments` table and SQL migration.
- Added NestJS appointment create and status update endpoints under `/appointments`.
- Appointment creation validates patient and doctor existence through the existing in-memory patient and doctor services.
- Appointment creation rejects past scheduled times and defaults status to `scheduled`.
- Appointment status updates accept `checked_in`, `completed`, and `cancelled`.
- Added API tests covering creation, missing patient, missing doctor, past appointment rejection, allowed status updates, and HTTP runtime wiring.

No recurring appointments, calendar sync, notifications, payments, auth, insurance, billing, or RBAC behavior was added.

## Files changed

- `.harness/PROGRESS.md`
- `.harness/evidence/S03-appointments.md`
- `apps/api/src/app.module.ts`
- `apps/api/src/appointments/appointments.controller.test.ts`
- `apps/api/src/appointments/appointments.controller.ts`
- `apps/api/src/appointments/appointments.module.ts`
- `apps/api/src/appointments/appointments.service.ts`
- `apps/api/src/doctors/doctors.module.ts`
- `apps/api/src/patients/patients.module.ts`
- `packages/db/src/schema.ts`
- `packages/db/src/migrations/0003_create_appointments.sql`
- `packages/shared/src/appointment.ts`
- `packages/shared/src/index.ts`

## Allowlist note

The S03 allowed-files list included appointment API files, `apps/api/src/app.module.ts`, DB schema/migrations, `packages/shared/src/appointment.ts`, tests, progress, and evidence. Two small policy corrections were required to make the slice runnable:

- `packages/shared/src/index.ts` exports the new appointment schemas and DTO types so package consumers can import them from `@clinical/shared`, matching the existing patient and doctor pattern.
- `apps/api/src/patients/patients.module.ts` and `apps/api/src/doctors/doctors.module.ts` export their services so the appointments module can validate that appointments reference existing patients and doctors using the same in-memory service instances.

## Commands run

- `pnpm --filter @clinical/api test`: initially failed before rebuilding the shared package, then failed while appointment service constructor dependencies were unresolved. Fixed by adding explicit NestJS `@Inject` decorators to the appointment service constructor.
- `pnpm --filter @clinical/shared build`: passed, refreshing the shared package `dist` output for package-based API tests.
- `pnpm --filter @clinical/api test`: passed after dependency injection correction with 24 API tests.
- `pnpm lint`: passed. Turbo reported 4 successful lint tasks.
- `pnpm typecheck`: passed. Turbo reported 5 successful tasks, including the shared build dependency.
- `pnpm test`: passed. Turbo reported 4 successful test tasks. Vitest reported 29 total passing tests across API, DB, shared, and web packages.
- `pnpm build`: passed. Turbo reported 4 successful build tasks.

## Test results

- API appointment tests: 8 passing tests covering create with existing patient and doctor, missing patient, missing doctor, past scheduling rejection, status updates to `checked_in`, `completed`, and `cancelled`, and HTTP runtime wiring.
- Existing patient, doctor, scaffold, DB, shared, and web tests remained passing.
- Full final `pnpm test` result: 4 package test tasks passed, 29 tests passed, 0 failed.

## Known limitations

- The NestJS appointment service uses in-memory storage, consistent with the existing S01/S02 patient and doctor services. The DB appointment table and migration exist, but the API is not yet wired to a database-backed repository.
- No migration runner was added or executed; S03 only adds the migration file and Drizzle schema.
- The task did not require appointment UI, so no web appointment pages were added.

## Next suggested task

S04: Implement today's appointments dashboard.
