# S01 - Patient CRUD vertical slice

## Goal

Implement basic patient management across DB, API, shared validation, and web UI.

## Fresh context

Read these files first:

- `AGENTS.md`
- `docs/PRD.md`
- `docs/DOMAIN_MODEL.md`
- `docs/ARCHITECTURE.md`
- `docs/HARNESS.md`
- `.harness/PROGRESS.md`
- `.harness/TASKS.json`
- S00 evidence file

## Allowed changes

- `apps/api/src/patients/**`
- `apps/api/src/app.module.ts`
- `apps/web/src/app/patients/**`
- `packages/db/src/schema.ts`
- `packages/db/src/migrations/**`
- `packages/shared/src/patient.ts`
- `tests/**`
- `.harness/evidence/S01-patient-crud.md`
- `.harness/PROGRESS.md`
- `.harness/TASKS.json`

## Acceptance criteria

- [ ] API supports `POST /patients`.
- [ ] API supports `GET /patients`.
- [ ] API supports `GET /patients/:id`.
- [ ] API supports `PATCH /patients/:id`.
- [ ] Web UI supports patient list.
- [ ] Web UI supports create patient form.
- [ ] Web UI supports patient detail view.
- [ ] `fullName` is required.
- [ ] `email` is optional but valid when present.
- [ ] Tests cover create, list, get by id, update, and invalid email.

## Out of scope

- Delete patient.
- Auth.
- Insurance.
- Medical history.
- Appointments.
- Clinical notes.

## Verification

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Evidence required

Write `.harness/evidence/S01-patient-crud.md` with:

- summary
- files changed
- commands run
- test results
- known limitations
- next suggested task
```
