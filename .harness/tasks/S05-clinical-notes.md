# S05 - Clinical notes

## Goal

Allow creating and viewing clinical notes for an appointment.

## Allowed changes

- `apps/api/src/clinical-notes/**`
- `apps/api/src/appointments/**`
- `apps/web/src/app/appointments/**`
- `packages/db/src/schema.ts`
- `packages/shared/src/clinical-note.ts`
- `tests/**`
- `.harness/evidence/S05-clinical-notes.md`
- `.harness/PROGRESS.md`

## Acceptance criteria

- [ ] Create note for appointment.
- [ ] View notes for appointment.
- [ ] Note text is required.
- [ ] Notes are not shown in broad appointment list views.
- [ ] Tests cover required note text and appointment association.

## Out of scope

- Rich text editor.
- Attachments.
- Audit log.
- Role-based access.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
