# Sandcastle runner experiment

This repo has two agent-harness modes:

1. **Codex Cloud mode** — `agent:implement` asks GitHub Actions to post a human-authored `@codex` comment. Codex Cloud runs from GitHub context, but PR publication currently requires the Codex UI **Create PR** gate.
2. **Sandcastle mode** — `agent:sandcastle` runs a GitHub Actions-hosted Sandcastle runner. The runner starts a Docker sandbox, asks Claude Code to implement one issue, pushes the resulting branch, and opens a draft PR with `gh pr create`.

Sandcastle mode is closer to Matt Pocock's AFK-agent-loop pattern: issue/label driven, isolated worktree, implementation agent, commits collected on a branch, GitHub PR created by the runner.

## Trigger

Add this label to a standalone GitHub issue:

```txt
agent:sandcastle
```

Or run the workflow manually:

```txt
Actions -> Sandcastle Implement -> Run workflow -> issue_number=<number>
```

## Required secret

The workflow requires this repository secret:

```txt
CLAUDE_CODE_OAUTH_TOKEN
```

Generate it on a trusted machine with:

```bash
claude setup-token
```

Do not commit the token. Store it only as a GitHub Actions secret.

## What the workflow does

```txt
issue label/manual dispatch
-> checkout main
-> install pnpm dependencies
-> build .sandcastle/Dockerfile
-> export issue body/comments into .sandcastle/runtime/issue-context.md
-> run .sandcastle/run-issue.mts
-> Sandcastle creates branch sandcastle/issue-<n>-<slug>
-> Claude Code implements inside Docker sandbox
-> workflow verifies branch has commits
-> workflow pushes branch
-> workflow opens draft PR
```

## Human gate

The PR is intentionally opened as a **draft**. A human still owns:

- architecture review,
- product acceptance,
- final verification,
- marking ready for review,
- merge.

## Difference from Codex Cloud

Codex Cloud prepares a PR candidate inside ChatGPT and currently needs a human to click **Create PR**. Sandcastle runs the agent inside our own runner, so the GitHub Action owns `git push` and `gh pr create` directly.

## Safety boundaries

- The workflow runs only for `agent:sandcastle`, not the existing `agent:implement` Codex Cloud label.
- The agent gets one issue context and is instructed to follow task allowed files.
- The branch is pushed separately from `main`.
- PRs are draft by default.
- Existing `verify.yml` remains the independent quality gate.
