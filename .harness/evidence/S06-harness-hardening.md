# S06 Harness Hardening Evidence

## Summary

Implemented harness discipline checks for Sandcastle task branches:

- `scripts/check-allowed-files.mts` checks changed files against `.harness/policies/allowed-files.json`.
- `scripts/check-evidence-exists.mts` checks that the task evidence file exists.
- `scripts/check-evidence-sections.mts` checks for required evidence sections.
- `scripts/harness-check.mts` runs the full local harness gate.
- `sandcastle-implement.yml` now resolves the task id, runs the harness checks before pushing/opening the PR, and checks out with the configured dispatch token so workflow-file changes can be pushed by the recovery/manual path.
- `sandcastle-review.yml` remains the separate trusted-main review workflow and is annotated as the S06 review-loop gate.

## Changed files

- `.github/workflows/sandcastle-implement.yml`
- `.github/workflows/sandcastle-review.yml`
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

## Full-flow proof (Issue #36)

Issue #36 is a clean proof-of-concept to validate the complete Sandcastle no-intervention flow from updated `main` after PR #30 (this S06 harness hardening) and PR #35 (Sandcastle verify wait fix) have merged.

**Goal**: Prove the autonomous flow works end-to-end:
- Issue with `agent:implement` label
- Sandcastle implementation commit
- Harness checks pass
- Branch push and draft PR creation
- PR Verify passes independently
- Workflow auto-queues `agent:review`
- Sandcastle Review posts findings
- If needed, `agent:fix` loop runs
- Human final review and merge

**Scope constraint**: Issue #36 uses the same S06 task id and only touches files already allowed by the S06 policy:
- `docs/HARNESS.md`
- `docs/WORKFLOW.md`
- `.harness/evidence/S06-harness-hardening.md`
- `.harness/PROGRESS.md`

This constraint ensures the merged harness checks can pass without requiring manual recovery or policy overrides.

**Changes made**:
- Added full-flow validation section to `docs/WORKFLOW.md` documenting the proof intent
- Added this proof section to `.harness/evidence/S06-harness-hardening.md`
- Updated `.harness/PROGRESS.md` with proof note

**Verification**: All S06 verification commands pass with the proof documentation added.
