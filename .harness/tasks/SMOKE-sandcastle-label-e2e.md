# SMOKE - Sandcastle label harness end-to-end proof

## Goal

Prove the active Sandcastle label harness can run through the full implementation path from a GitHub issue labeled `agent:implement`, open or reuse a draft PR, trigger `verify.yml`, and then support an `agent:review` PR label review comment.

This is intentionally a tiny documentation/evidence-only task so the harness path is tested without changing product behavior.

## Allowed changes

- `.harness/evidence/SMOKE-sandcastle-label-e2e.md`
- `.harness/PROGRESS.md`
- `.harness/TASKS.json`

## Acceptance criteria

- [ ] Create `.harness/evidence/SMOKE-sandcastle-label-e2e.md`.
- [ ] Evidence explains that this was triggered by issue label `agent:implement`.
- [ ] Evidence includes the command/status evidence available inside the Sandcastle run.
- [ ] No product code is changed.
- [ ] The Sandcastle workflow opens or reuses a draft PR.

## Out of scope

- Product feature work.
- Auto-merge.
- Production deploy.
- Changing Sandcastle workflow code.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
