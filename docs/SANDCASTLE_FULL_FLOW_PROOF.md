# Sandcastle Full Flow Proof

## Purpose

This document serves as proof that the Sandcastle agent harness can complete a full autonomous workflow cycle without manual implementation intervention.

## Full Flow Design

The Sandcastle harness follows this end-to-end autonomous path:

```txt
GitHub Issue + agent:implement label
  → Sandcastle implementation workflow runs in Docker worktree
  → Claude Code implements the issue
  → Workflow pushes branch
  → Workflow opens or reuses draft PR via GitHub REST API
  → PR Verify workflow runs independently
  → If Verify passes, workflow adds agent:review label
  → Sandcastle review workflow runs
  → Review agent posts structured PR review comment
  → If verdict is COMMENT or REQUEST_CHANGES, workflow adds agent:fix
  → Sandcastle fix workflow runs on same branch
  → Verify → Review → Fix loop repeats (capped at 3 non-approve reviews)
  → When verdict is APPROVE or cap is reached, automation stops
  → Human performs final review and merge
```

## What This Proof Validates

This issue (#31) validates that the Sandcastle runner can:

1. Pick up an `agent:implement` labeled issue
2. Create an isolated Docker worktree on a new branch
3. Implement changes per the issue specification
4. Commit changes to the branch
5. Push the branch to GitHub
6. Open a draft PR via the GitHub REST API
7. Wait for independent PR Verify checks to pass
8. Automatically trigger review via the `agent:review` label
9. Post a structured review comment
10. Optionally run automatic fix iterations if needed
11. Stop at the human review gate

## Human Gate

**The final gate remains human-owned.**

The Sandcastle harness automates:
- Implementation
- Testing
- PR creation
- Verification
- Code review
- Fix iterations (up to safety cap)

Humans retain ownership of:
- Product acceptance
- Architecture approval
- Final merge decision
- Production readiness claims
- Security exceptions

## No Manual Implementation Intervention

This proof issue is intentionally minimal and constrained to documentation files only:

- `docs/SANDCASTLE_FULL_FLOW_PROOF.md` (this file)
- `.harness/evidence/SANDCASTLE-full-flow-proof.md`
- `.harness/PROGRESS.md`

By avoiding workflow file changes and keeping the scope small, the proof can complete the full autonomous path without requiring manual implementation fixes or workflow debugging during the run.

## Verification

Standard verification commands confirm no regressions:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Success Criteria

This proof is successful when:

- All acceptance criteria from issue #31 are met
- All verification commands pass
- Evidence file documents the result
- The draft PR is created without manual intervention
- PR Verify workflow passes
- Review workflow runs and posts a verdict
- Human merge remains the final step

## Operational Lessons

Key lessons from prior Sandcastle validation (issue #17, workflow run #27839376514):

- Docker container must stay alive for `docker exec` commands
- `/home/agent/.claude` must be writable for session capture
- Package manager and git home variables must be forced in container setup
- PR publication should use REST API for idempotency
- Fine-grained PAT requires Contents, Issues, Pull Requests, and Metadata permissions
- Independent Verify workflow prevents review of known-red PRs
- Auto-fix loop cap prevents infinite review/fix cycles

See `docs/SANDCASTLE.md` for detailed setup and operation.
