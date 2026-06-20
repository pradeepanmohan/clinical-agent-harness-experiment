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
-> run implementation agent
-> verify with real commands
-> write evidence
-> update progress
-> open or update PR
-> wait for PR Verify
-> run review agent
-> if review finds issues, run fix agent on the same PR branch
-> repeat verify/review/fix until review approves or safety cap trips
-> wait for human final review and merge
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
- review-driven fix iterations
- local verification
- evidence generation
- honest handoff

## PR walkthrough artifacts

Every PR can have a generated reviewer-orientation artifact. This copies the useful part of Warp's `/pr-walkthrough` pattern without requiring a Warp/Oz API key:

```bash
pnpm pr-walkthrough -- --pr <number> --repo <owner>/<repo> --out .harness/pr-walkthrough/index.html
```

The generated artifact is a static HTML/D3 site with four reviewer views:

1. **System overview** — stable repository areas touched by the PR.
2. **Data flow graph** — how PR intent and changed files flow into reviewer understanding.
3. **Code dependency graph** — entrypoints, touched areas, and verification surface.
4. **User action graph** — the human reviewer path through the PR.

GitHub Actions integration is intentionally split:

- `.github/workflows/pr-walkthrough.yml` runs with read-only repository permissions, generates `.harness/pr-walkthrough/index.html`, validates the artifact shape, and uploads it as an Actions artifact.
- `.github/workflows/pr-walkthrough-publish.yml` is manual-only and has write permissions. It can comment with the artifact run. Publishing to `gh-pages` is opt-in via `publish_to_pages=true` because private/client PR context may be sensitive.

This is an orientation aid, not a review verdict. Human review and merge approval remain separate gates.
