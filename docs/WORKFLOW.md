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
-> add label: agent:review on the PR
-> GitHub Action runs a separate Sandcastle review pass
-> Sandcastle posts a PR review comment
-> human accepts/requests fixes/merges
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

### 6. Review

After the implementation PR exists, add this label to the PR:

```txt
agent:review
```

That runs the Sandcastle review workflow. The review agent reads the PR body, diff, files, checks, comments, and reviews, then posts a structured review comment with:

- verdict,
- blockers,
- warnings,
- what looks good,
- verification notes.

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

## Why this matters

Long chats rot. Durable files do not. The workflow should make progress inspectable through git, tests, evidence, PRs, and review comments rather than through a giant conversation transcript.

The active comparison is now simple:

```txt
Archived Codex Cloud mode: label dispatch worked, PR publication failed.
Active Sandcastle mode: labels trigger an Actions-hosted agent runner, runner publishes draft PR, GitHub Actions verifies, Sandcastle reviews, human merges.
```
