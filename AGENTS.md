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

## Active harness mode

This repository uses the **Sandcastle runner** as the primary harness path.

The earlier Codex Cloud label method is archived because dispatch worked, but PR publication was unreliable: Codex could react/run and claim a branch or PR, while GitHub had no branch, commit, or PR. Keep those notes as historical evidence only.

## Label state machine

Use the original labels, now mapped to Sandcastle:

- `agent:implement` on an issue runs the Sandcastle implementation workflow.
- `agent:fix` on an issue reruns the Sandcastle implementation workflow for follow-up fixes.
- `agent:review` on a pull request runs the Sandcastle review workflow and posts a review comment.
- `agent:blocked` marks failed or blocked automation.
- `agent:done` marks human-accepted completion.

`agent:sandcastle` remains as a backward-compatible alias, but new issues should use `agent:implement`.

## Sandcastle runner flow

- The implementation workflow runs Sandcastle in a Docker worktree.
- The agent must implement exactly one issue and commit to the Sandcastle branch.
- The workflow pushes the branch and opens or reuses a draft PR through the GitHub REST pulls API.
- The draft PR remains a human review/acceptance/merge gate.
- The review workflow runs a separate Sandcastle review pass against the PR diff and posts its findings as a PR comment.
- Current experiment result: Sandcastle is validated end to end when `CLAUDE_CODE_OAUTH_TOKEN` and a `CODEX_DISPATCH_TOKEN` with Contents, Issues, Pull Requests, and Metadata permissions are configured.

## Quality bar

- Type-safe code.
- Clear validation boundaries.
- Tests for domain rules.
- No commented-out tests.
- No unrelated rewrites.
- No new dependency without explaining why in evidence.

## Human gate

The Sandcastle runner can implement, test, open/update a draft PR, and review a PR. A human owns product acceptance, architecture approval, merge, and release.
