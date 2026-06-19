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
6. Do not merge your own PR.
7. Do not add auth, billing, insurance, or complex RBAC unless a task explicitly asks for it.
8. Keep diffs small enough for human review.

## Quality bar

- Type-safe code.
- Clear validation boundaries.
- Tests for domain rules.
- No commented-out tests.
- No unrelated rewrites.
- No new dependency without explaining why in evidence.

## Human gate

Codex can implement, test, and open/update a PR. A human owns product acceptance, architecture approval, merge, and release.
