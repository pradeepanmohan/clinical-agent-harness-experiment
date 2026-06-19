# S02 - Doctor CRUD vertical slice

## Goal

Implement basic doctor management using the same proven pattern from S01.

## Allowed changes

- `apps/api/src/doctors/**`
- `apps/api/src/app.module.ts`
- `apps/web/src/app/doctors/**`
- `packages/db/src/schema.ts`
- `packages/db/src/migrations/**`
- `packages/shared/src/index.ts`
- `packages/shared/src/doctor.ts`
- `tests/**`
- `.harness/evidence/S02-doctor-crud.md`
- `.harness/PROGRESS.md`
- `.harness/TASKS.json`
- `.harness/policies/allowed-files.json`

## Acceptance criteria

- [ ] Create doctor.
- [ ] List doctors.
- [ ] View doctor by id.
- [ ] Update doctor.
- [ ] Validate required fullName and specialty.
- [ ] Tests cover core behavior.

## Out of scope

- Appointment scheduling.
- Auth.
- Calendar integrations.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
