# Workflow: Agent Harness Modes

This repository compares two Matt Pocock-inspired agent harness patterns.

## Mode A: Codex Cloud label flow

```txt
GitHub Issue
-> add label: agent:implement
-> GitHub Action posts a human-authored @codex instruction comment
-> Codex Subscription / Codex Cloud executes from GitHub context
-> human reviews Codex task UI and clicks Create PR when needed
-> verify.yml runs on the PR
-> optional PR label: agent:review
-> GitHub Action posts @codex review
-> human reviews and merges
```

GitHub Actions dispatch comments and run verification. They do not run Codex with `OPENAI_API_KEY` in this mode.

### Validated lesson

The dispatch gate works when the `@codex` comment is authored with `CODEX_DISPATCH_TOKEN` instead of `github-actions[bot]`. However, Codex Cloud PR publication is not fully autonomous in this repo: Codex can prepare a branch/PR candidate inside its UI, but a human may need to click **Create PR**.

Use this mode when the desired gate is:

```txt
human label -> Codex Cloud implementation -> human PR publication -> GitHub verify -> human merge
```

## Mode B: Sandcastle runner flow

```txt
GitHub Issue
-> add label: agent:sandcastle
-> GitHub Action runs Sandcastle
-> Sandcastle creates an isolated Docker worktree branch
-> Claude Code implements exactly one issue
-> workflow pushes the Sandcastle branch
-> workflow opens or reuses a draft PR through the REST pulls API
-> verify.yml runs on the PR
-> human reviews and merges
```

This mode follows Matt Pocock's AFK-agent-loop direction more closely because the runner owns git directly. The agent does not rely on Codex Cloud's UI publication gate.

### Validated lesson

The Sandcastle runner flow is now validated end to end. Issue #17 triggered successful workflow run `27839376514`; the runner created branch `sandcastle/issue-17-sandcastle-token-updated-pr-publication-smoke-test`, opened draft PR #18, and the PR's independent `verify` check passed.

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

### 3. Dispatch

Create or update a GitHub issue for one task, then choose a mode:

- `agent:implement` for Codex Cloud mode.
- `agent:sandcastle` for Sandcastle runner mode.

### 4. Execute

The agent handles one task only. It should not select its own next task unless the harness asks it to.

### 5. Verify

`verify.yml` runs independently from the agent's self-report on every PR and push to `main`.

### 6. Review

A separate review pass checks the diff against the task contract. Use `agent:review` for Codex Cloud review or run human review manually for Sandcastle draft PRs.

### 7. Repeat

The next run starts from repository state, not the prior chat.

## Labels

Required labels:

- `agent:implement` — dispatch implementation from a GitHub issue through Codex Cloud.
- `agent:sandcastle` — dispatch implementation from a GitHub issue through the Sandcastle runner.
- `agent:review` — dispatch review from a pull request.
- `agent:fix` — mark a follow-up fix request after human/Codex review.

Optional labels:

- `agent:blocked`
- `agent:done`
- `harness:s02`
- `scope:clinical-app`

## Why this matters

Long chats rot. Durable files do not. The workflow should make progress inspectable through git, tests, evidence, and PRs rather than through a giant conversation transcript.

The comparison is:

```txt
Codex Cloud mode: labels trigger Codex, human publishes PR, GitHub Actions verifies.
Sandcastle mode: labels trigger an Actions-hosted agent runner, runner publishes draft PR, GitHub Actions verifies, human merges.
```
