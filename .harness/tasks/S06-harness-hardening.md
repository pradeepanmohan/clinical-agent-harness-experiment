# S06 - Harness hardening and review loop

## Goal

Add scripts and workflow checks that enforce harness discipline.

## Allowed changes

- `scripts/**`
- `.harness/policies/**`
- `.github/workflows/**`
- `docs/HARNESS.md`
- `docs/WORKFLOW.md`
- `.harness/evidence/S06-harness-hardening.md`
- `.harness/PROGRESS.md`

## Acceptance criteria

- [ ] Check allowed changed files for a task.
- [ ] Check required evidence file exists.
- [ ] Check evidence file contains required sections.
- [ ] Add separate agent review workflow draft.
- [ ] Document manual override path.

## Out of scope

- Auto-merge.
- Production deploy.
- Complex policy engine.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
