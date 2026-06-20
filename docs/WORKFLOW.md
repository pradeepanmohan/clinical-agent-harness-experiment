# Workflow: Sandcastle Agent Harness

This repository now uses one primary Matt Pocock-inspired harness pattern:

```txt
GitHub Issue
-> add label: agent:implement
-> GitHub Action runs Sandcastle
-> Sandcastle creates an isolated Docker worktree branch
-> Claude Code implements exactly one issue
-> workflow pushes the Sandcastle branch
-> workflow opens or reuses a draft PR through the REST pulls API
-> verify.yml runs on the PR
-> workflow automatically adds agent:review after Verify passes
-> GitHub Action runs a separate Sandcastle review pass
-> Sandcastle posts a PR review comment
-> if verdict is COMMENT or REQUEST_CHANGES, workflow labels the issue agent:fix
-> Sandcastle fixes the same PR branch and the loop repeats
-> when verdict is APPROVE, automation stops
-> human performs final review and merge
```

The previous Codex Cloud label flow is archived under `docs/archive/`. It is not the active experiment path because Codex Cloud dispatch worked but autonomous GitHub PR publication did not.

## Why Sandcastle is the active path

Sandcastle mode follows the desired AFK-agent-loop pattern more closely because the runner owns git directly:

- issue labels are the task queue,
- the runner creates an isolated worktree,
- the agent works from fresh repository state and issue context,
- the workflow pushes a branch,
- the workflow opens a draft PR,
- GitHub Actions verifies the PR independently,
- review is a separate pass,
- a human owns merge.

## Validated lesson

The Sandcastle runner flow has been validated end to end. Issue #17 triggered successful workflow run `27839376514`; the runner created branch `sandcastle/issue-17-sandcastle-token-updated-pr-publication-smoke-test`, opened draft PR #18, and the PR's independent `verify` check passed.

Key operational lessons:

- the Docker image must stay alive for Sandcastle `docker exec`,
- `/home/agent/.claude` must be writable for Claude Code session capture,
- package-manager and git home variables must be forced in the container setup,
- PR publication should use the REST pulls API, not `gh pr create`,
- PR publication should be idempotent and reuse an open PR for the same branch,
- the fine-grained PAT must include `Contents: read/write`, `Issues: read/write`, `Pull requests: read/write`, and `Metadata: read`.

See `docs/SANDCASTLE.md` for setup and operation.

## Matt-inspired steps

### 1. Grill

Before a task exists, clarify:

- who uses this?
- what is the smallest useful behavior?
- what is explicitly out of scope?
- what would be over-engineering?
- how will we verify it?

### 2. Plan

Write the task file with:

- goal
- allowed files
- acceptance criteria
- verification commands
- evidence requirements
- out of scope list

### 3. Dispatch implementation

Create or update a GitHub issue for one task, then add:

```txt
agent:implement
```

For follow-up fixes, add:

```txt
agent:fix
```

Both labels dispatch the Sandcastle implementation workflow. `agent:sandcastle` remains a backward-compatible alias but should not be used for new issues.

### 4. Execute

The agent handles one issue only. It should not select its own next task unless the harness asks it to.

### 5. Verify

`verify.yml` runs independently from the agent's self-report on every PR and push to `main`.

Before a Sandcastle branch is pushed, the implementation workflow also runs:

```bash
pnpm harness:check -- --task <task-id> --base <base-ref>
```

That gate checks the changed files against the task allowlist, confirms the evidence file exists, and confirms evidence sections are present. If the gate fails, the issue is labeled `agent:blocked` and no review is queued.

The implementation workflow waits for the PR `verify` check to pass before queueing review. If `verify` fails, the loop stops with `agent:blocked` instead of asking the reviewer to judge a known-red PR.

Manual overrides are allowed only as explicit commits that update the policy or evidence and explain why the exception is in scope.

### 6. Review and auto-fix

After Verify passes, the implementation workflow automatically adds this label to the PR:

```txt
agent:review
```

That runs the Sandcastle review workflow. The review agent reads the PR body, diff, files, checks, comments, and reviews, then posts a structured review comment with:

- verdict,
- blockers,
- warnings,
- what looks good,
- verification notes.

If the verdict is `COMMENT` or `REQUEST_CHANGES`, the review workflow comments on the linked issue and adds:

```txt
agent:fix
```

That dispatches another Sandcastle implementation pass on the same issue branch. The fix pass receives the linked PR context, prior Sandcastle review comments, current checks, and current PR diff, then pushes a follow-up commit. The implementation workflow waits for Verify again and queues another review.

The auto-fix loop has a safety cap of 3 non-approve Sandcastle reviews. After that, the workflow labels the issue `agent:blocked` and waits for a human.

### 7. Human gate

A human decides whether to:

- request fixes,
- mark the PR ready for review,
- merge,
- close/reject,
- mark `agent:done`.

## Labels

Required labels:

- `agent:implement` — dispatch issue implementation through Sandcastle.
- `agent:fix` — dispatch follow-up implementation/fix through Sandcastle.
- `agent:review` — dispatch PR review through Sandcastle.

Operational labels:

- `agent:blocked` — workflow failed or needs intervention.
- `agent:done` — human accepted/merged/completed the task.
- `agent:sandcastle` — backward-compatible implementation alias; prefer `agent:implement`.

Scope labels:

- `harness:s02`, `harness:s03`, etc.
- `scope:clinical-app`

## Full-flow validation

Issue #36 validates the complete no-manual-intervention Sandcastle flow after PR #30 (harness hardening) and PR #35 (Sandcastle verify wait fix):

- Issue labeled `agent:implement`
- Sandcastle implements and commits
- Harness checks pass
- Branch pushed, draft PR opened
- PR Verify passes
- `agent:review` queued automatically
- Sandcastle Review posts verdict
- If needed, `agent:fix` loop runs
- Human performs final review and merge

This proof issue intentionally uses only S06-allowed files so the harness checks can pass without manual recovery intervention.

## Why this matters

Long chats rot. Durable files do not. The workflow should make progress inspectable through git, tests, evidence, PRs, and review comments rather than through a giant conversation transcript.

The active comparison is now simple:

```txt
Archived Codex Cloud mode: label dispatch worked, PR publication failed.
Active Sandcastle mode: labels trigger an Actions-hosted agent runner, runner publishes draft PR, GitHub Actions verifies, Sandcastle reviews, human merges.
```
