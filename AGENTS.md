# AGENTS.md

This repo is an agent harness experiment. Follow these rules before changing code.

## Prime directive

Build the smallest correct slice described by the active `.harness/tasks/*.md` file. Do not expand scope.

## Harness rules

1. Read `docs/HARNESS.md`, `docs/WORKFLOW.md`, `.harness/PROGRESS.md`, and the active task file before implementation.
2. Change only files allowed by the active task.
3. Prefer TDD for new behavior.
4. Run the verification commands named in the task.
5. Write an evidence file under `.harness/evidence/` before claiming done.
6. Open or update a pull request for the task.
7. Do not merge your own PR.
8. Do not add auth, billing, insurance, or complex RBAC unless a task explicitly asks for it.
9. Keep diffs small enough for human review.

## Agent harness modes

This repository currently compares two agent execution models.

### Codex Cloud label flow

The GitHub-connected Codex Subscription / Codex Cloud flow is triggered by `agent:implement` and `agent:review`.

- `agent:implement` on an issue asks `@codex` to implement that issue.
- `agent:review` on a pull request asks `@codex review` to review that PR.
- GitHub Actions may dispatch comments and verify PRs, but must not execute Codex with `OPENAI_API_KEY` as the primary harness path.
- Codex should work from the GitHub issue/PR context, follow this file, write evidence, and leave merge/acceptance to the human gate.
- Current experiment result: Codex Cloud can execute tasks, but PR publication may require the Codex UI **Create PR** gate.

### Sandcastle runner flow

The Actions-hosted Sandcastle runner is triggered by `agent:sandcastle`.

- The workflow runs Sandcastle in a Docker worktree.
- The agent must implement exactly one issue and commit to the Sandcastle branch.
- The workflow pushes the branch and opens a draft PR.
- The draft PR remains a human review/acceptance/merge gate.

## Quality bar

- Type-safe code.
- Clear validation boundaries.
- Tests for domain rules.
- No commented-out tests.
- No unrelated rewrites.
- No new dependency without explaining why in evidence.

## Human gate

Codex can implement, test, and open/update a PR. A human owns product acceptance, architecture approval, merge, and release.
