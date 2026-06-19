# Workflow: Matt Pocock Style Harness Adaptation

## Correct source pattern

The workflow follows the Matt Pocock label method:

```txt
GitHub Issue
-> add label: agent:implement
-> GitHub Action posts an @codex instruction comment
-> Codex Subscription / Codex Cloud executes from GitHub context
-> Codex opens a PR
-> verify.yml runs on the PR
-> optional PR label: agent:review
-> GitHub Action posts @codex review
-> human reviews and merges
```

GitHub Actions should dispatch labels/comments and run verification. It should not run Codex itself with `OPENAI_API_KEY` as the primary harness path.

## Our version

```txt
Clinical PRD
-> .harness/TASKS.json
-> GitHub issue for one task
-> agent:implement label
-> @codex implementation comment
-> Codex Cloud executes exactly one task
-> Codex writes evidence and opens PR
-> verify.yml independently verifies PR
-> optional agent:review label
-> @codex review comment
-> human merge gate
```

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

Create or update a GitHub issue for one task and apply `agent:implement`.

The dispatcher workflow comments with bounded `@codex` instructions using `CODEX_DISPATCH_TOKEN`, a fine-grained GitHub token stored as a repository Actions secret. This avoids `github-actions[bot]` authored comments, which may be ignored by Codex Cloud mention triggers.

The dispatch identity needs only enough access to comment on issues and pull requests. Codex Cloud should use the connected GitHub repo context to implement the issue, create a branch, and open a pull request against `main`.

### 4. Execute

Codex handles one task only. It should not select its own next task unless the harness asks it to.

### 5. Verify

`verify.yml` runs independently from Codex's self-report on every PR and push to `main`.

### 6. Review

A separate review pass checks the diff against the task contract. Add `agent:review` to a PR to dispatch an `@codex review` comment.

### 7. Repeat

The next run starts from repository state, not the prior chat.

## Labels

Required labels:

- `agent:implement` — dispatch implementation from a GitHub issue.
- `agent:review` — dispatch review from a pull request.
- `agent:fix` — mark a follow-up fix request after human/Codex review.

Optional labels:

- `agent:blocked`
- `agent:done`
- `harness:s02`
- `scope:clinical-app`

## Why this matters

Long chats rot. Durable files do not. The workflow should make progress inspectable through git, tests, and evidence rather than through a giant conversation transcript.

The experiment is:

```txt
Labels trigger Codex.
Codex Subscription / Cloud executes.
GitHub Actions verifies.
Human merges.
```

Not:

```txt
GitHub Actions executes Codex with an API key.
```
