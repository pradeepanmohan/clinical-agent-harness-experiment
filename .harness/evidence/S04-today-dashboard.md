# S04 Today's Appointments Dashboard Evidence

## Summary

Implemented the today's appointments dashboard vertical slice within the S04 scope.

- Added `AppointmentWithDetails` schema with enriched patient and doctor names.
- Added `GET /appointments/today` endpoint that filters appointments by today's date and enriches them with patient and doctor names.
- Added tests for date filtering logic covering today, tomorrow, and mixed scenarios.
- Created `/dashboard` page showing today's appointments with patient name, doctor name, scheduled time, and status.
- Added empty state message when no appointments are scheduled for today.

No calendar UI, drag and drop, or real-time updates were added.

## Files changed

- `.harness/evidence/S04-today-dashboard.md`
- `.harness/policies/allowed-files.json`
- `.harness/PROGRESS.md`
- `.harness/tasks/S04-today-dashboard.md`
- `apps/api/src/appointments/appointments.controller.test.ts`
- `apps/api/src/appointments/appointments.controller.ts`
- `apps/api/src/appointments/appointments.service.ts`
- `apps/web/src/app/dashboard/page.tsx`
- `packages/shared/src/appointment.ts`
- `packages/shared/src/index.ts`

## Commands run

- `pnpm --filter @clinical/shared build`: passed, refreshing the shared package with new schemas.
- `pnpm --filter @clinical/api test -- appointments.controller.test.ts`: passed with 20 appointment tests including 5 new tests for `listToday`.
- `pnpm lint`: passed. Turbo reported 4 successful lint tasks.
- `pnpm typecheck`: passed. Turbo reported 5 successful tasks including the shared build dependency.
- `pnpm test`: passed. Turbo reported 4 successful test tasks with 36 total passing tests.
- `pnpm build`: passed. Turbo reported 4 successful build tasks. Next.js built `/dashboard` successfully.
- Review fix: removed the unused future `reason` field from the enriched appointment schema/UI and updated the S04 allowed-files policy to explicitly include the shared package barrel export required by the package's public export surface.

## Test results

- API appointment tests: 20 passing tests covering:
  - All existing S03 tests (create, list, get, update status, validation)
  - New `listToday` tests:
    - Returns empty list when no appointments today
    - Returns today's appointments with patient and doctor details
    - Filters by date correctly (excludes tomorrow)
    - Excludes tomorrow's appointments
    - Returns multiple today's appointments
- All existing patient, doctor, scaffold, DB, shared, and web tests remained passing.
- Full final `pnpm test` result: 4 package test tasks passed, 36 tests passed, 0 failed.

## Acceptance criteria

All acceptance criteria have been met:

- [x] API exposes today's appointments.
- [x] UI shows today's appointments.
- [x] Empty state is clear.
- [x] Status is visible.
- [x] Tests cover date filtering.

## Implementation notes

### Schema design

Added `appointmentWithDetailsSchema` to the shared package:
- `id`: appointment UUID
- `patientId`: patient UUID
- `patientName`: enriched patient full name
- `doctorId`: doctor UUID
- `doctorName`: enriched doctor full name
- `scheduledAt`: timestamp with timezone
- `status`: appointment status enum

### API endpoint

- `GET /appointments/today` - Returns today's appointments enriched with patient and doctor names
- The service filters appointments by date using start-of-day and end-of-day boundaries
- The service fetches related patient and doctor records to enrich the response
- Date filtering uses local timezone for "today" calculation

### Web UI

- `/dashboard` - Shows today's appointments with:
  - Scheduled time (formatted as locale time)
  - Patient name
  - Doctor name
  - Appointment status
  - Link to view all appointments
  - Clear empty state message when no appointments today

### Tests

- Added helper functions `todayDate()` and `tomorrowDate()` for test date generation
- Tests verify date filtering logic works correctly
- Tests verify enriched patient and doctor names are returned
- Tests verify empty state when no appointments scheduled for today
- Used non-null assertions in tests after length checks for TypeScript strictness

## Known limitations

- The NestJS appointment service uses in-memory storage. The DB appointments table exists but the API is not yet wired to a database-backed repository.
- The dashboard shows all today's appointments without pagination or filtering by status.
- Appointment reason remains out of the current S04 data model and dashboard. Add it only when a future slice adds `reason` to base appointment creation/storage.
- The dashboard does not auto-refresh or show real-time updates.
- The web dashboard posts to `NEXT_PUBLIC_CLINICAL_API_URL` or `http://localhost:3001` by default, so the API server must be running.
- Date filtering uses the server's local timezone, not user-specific timezone.

## Next suggested task

S05: Implement clinical notes.
