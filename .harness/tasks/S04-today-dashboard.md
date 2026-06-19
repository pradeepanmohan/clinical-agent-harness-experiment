# S04 - Today's appointments dashboard

## Goal

Create a simple dashboard that shows today's appointments with patient, doctor, time, reason, and status.

## Allowed changes

- `apps/api/src/appointments/**`
- `apps/web/src/app/**`
- `packages/shared/src/appointment.ts`
- `tests/**`
- `.harness/evidence/S04-today-dashboard.md`
- `.harness/PROGRESS.md`

## Acceptance criteria

- [ ] API exposes today's appointments.
- [ ] UI shows today's appointments.
- [ ] Empty state is clear.
- [ ] Status is visible.
- [ ] Tests cover date filtering.

## Out of scope

- Calendar UI.
- Drag and drop.
- Real-time updates.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
