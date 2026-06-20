# S03 - Appointment scheduling

## Goal

Implement appointment scheduling between existing patients and doctors.

## Allowed changes

- `apps/api/src/appointments/**`
- `apps/api/src/app.module.ts`
- `apps/api/src/doctors/doctors.module.ts`
- `apps/api/src/patients/patients.module.ts`
- `apps/web/src/app/appointments/**`
- `packages/db/src/schema.ts`
- `packages/db/src/migrations/**`
- `packages/shared/src/appointment.ts`
- `packages/shared/src/index.ts`
- `tests/**`
- `.harness/evidence/S03-appointments.md`
- `.harness/PROGRESS.md`
- `.harness/TASKS.json`
- `.harness/policies/allowed-files.json`

## Acceptance criteria

- [ ] Create appointment with patient and doctor.
- [ ] Reject appointment for missing patient or doctor.
- [ ] Reject new appointment scheduled in the past.
- [ ] Default status is `scheduled`.
- [ ] Update status to `checked_in`, `completed`, or `cancelled`.

## Out of scope

- Recurring appointments.
- Calendar sync.
- Notifications.
- Payments.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
