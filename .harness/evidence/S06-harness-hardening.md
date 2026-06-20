# S06 Harness Hardening Evidence

## Summary

Implemented harness discipline checks for Sandcastle task branches:

- `scripts/check-allowed-files.mts` checks changed files against `.harness/policies/allowed-files.json`.
- `scripts/check-evidence-exists.mts` checks that the task evidence file exists.
- `scripts/check-evidence-sections.mts` checks for required evidence sections.
- `scripts/harness-check.mts` runs the full local harness gate.
- `sandcastle-implement.yml` now resolves the task id, runs the harness checks before pushing/opening the PR, and checks out with the configured dispatch token so workflow-file changes can be pushed by the recovery/manual path.

## Changed files

- `.github/workflows/sandcastle-implement.yml`
- `.harness/policies/allowed-files.json`
- `.harness/PROGRESS.md`
- `.harness/evidence/S06-harness-hardening.md`
- `docs/HARNESS.md`
- `docs/WORKFLOW.md`
- `package.json`
- `scripts/check-allowed-files.mts`
- `scripts/check-evidence-exists.mts`
- `scripts/check-evidence-sections.mts`
- `scripts/harness-check.mts`
- `scripts/harness-lib.mts`

## Verification

Passed locally:

```bash
pnpm harness:check -- --task S06 --base origin/main
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Key observed results:

- Harness check passed for S06 and saw 12 changed files.
- Lint: 4/4 packages successful.
- Typecheck: 5/5 tasks successful.
- Tests: 9 test files passed, 51 tests passed.
- Build: 4/4 packages successful.

## Result

S06 implementation is ready for PR verification and Sandcastle review. Human final review and merge remain the terminal gate.
