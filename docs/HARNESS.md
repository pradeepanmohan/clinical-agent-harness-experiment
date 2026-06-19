# Agent Harness Design

## Core principle

The task is long-running, but each agent session is short-running.

Codex should not rely on previous chat history. Each run receives fresh context built from durable state in the repository.

## Durable state

| File | Purpose |
|---|---|
| `.harness/TASKS.json` | Task queue and statuses |
| `.harness/PROGRESS.md` | Shift report across agent runs |
| `.harness/tasks/*.md` | Bounded task specifications |
| `.harness/evidence/*.md` | Verification and result evidence |
| `docs/*.md` | Product and architecture source of truth |
| `AGENTS.md` | Stable rules injected into coding agents |

## Loop

```txt
Pick one pending task
-> build fresh context
-> run Codex
-> verify with real commands
-> write evidence
-> update progress
-> open or update PR
-> wait for human review
```

## Fresh context inputs

Each agent run should be given:

- active task file
- PRD
- architecture doc
- harness doc
- workflow doc
- progress file
- git status and recent commits
- last relevant evidence file

## Done means

A task is done only when:

- acceptance criteria are satisfied
- verification commands pass or blockers are documented honestly
- evidence file exists
- changed files are inside the allowed set
- no unrelated work is included
- human can review the PR without reconstructing the whole session

## Failure handling

If a task fails:

1. Write the failure to evidence.
2. Mark the task as blocked or failed in progress.
3. Preserve logs and test output.
4. Do not fake success.
5. Do not broaden scope to work around the failure.

## Human gates

Humans own:

- product scope approval
- architecture approval
- merge approval
- production readiness claims
- security exceptions

Agents own:

- bounded implementation
- local verification
- evidence generation
- honest handoff
