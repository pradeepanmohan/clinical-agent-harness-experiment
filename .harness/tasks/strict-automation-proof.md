# 42 - Strict automation proof after dispatch-token fix

## Goal

Run a fresh strict full Sandcastle proof from current `main` after both infra fixes are merged:

- PR #38: review artifact extraction recovery
- PR #41: `agent:fix` queueing uses dispatch token so the downstream implement workflow can trigger

This is a no-manual-retrigger proof. The assistant/operator must not edit this PR branch, manually post reviews, manually add `agent:fix`, or manually re-add `agent:review` after this initial issue label.

## Allowed changes

- `docs/HARNESS.md`
- `.harness/PROGRESS.md`
- `.harness/tasks/strict-automation-proof.md`
- `.harness/policies/allowed-files.json`
- `.harness/evidence/42-strict-automation-proof.md`
- `.harness/TASKS.json`

## Acceptance criteria

- [ ] Add a concise note that the strict automation loop should now run from issue label through human-ready PR with no manual re-trigger.
- [ ] Keep the note generic and reusable; do not paste long run logs.
- [ ] Keep PR small enough for Sandcastle Review.
- [ ] Run the normal verification commands.
- [ ] Let the harness run the full automation sequence:
  - `agent:implement`
  - Verify
  - automatic `agent:review`
  - if review returns COMMENT or REQUEST_CHANGES, automatic `agent:fix`
  - Verify again
  - automatic second-pass `agent:review`
  - final APPROVE or honest failure

## Out of scope

- Auto-merge
- Product behavior changes
- Manual branch recovery
- Manual review posting
- Manual re-trigger after this issue is labeled

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm harness:check -- --task 42 --base origin/main
```
