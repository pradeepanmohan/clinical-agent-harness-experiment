# Sandcastle runner experiment

This repo has two agent-harness modes:

1. **Codex Cloud mode** — `agent:implement` asks GitHub Actions to post a human-authored `@codex` comment. Codex Cloud runs from GitHub context, but PR publication currently requires the Codex UI **Create PR** gate.
2. **Sandcastle mode** — `agent:sandcastle` runs a GitHub Actions-hosted Sandcastle runner. The runner starts a Docker sandbox, asks Claude Code to implement one issue, pushes the resulting branch, and opens or reuses a draft PR through the GitHub REST pulls API.

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

## Required secrets

The workflow requires these repository secrets:

```txt
CLAUDE_CODE_OAUTH_TOKEN
CODEX_DISPATCH_TOKEN
```

Generate it on a trusted machine with:

```bash
claude setup-token
```

`CLAUDE_CODE_OAUTH_TOKEN` authenticates Claude Code inside the Sandcastle container.

`CODEX_DISPATCH_TOKEN` is used by the workflow for GitHub write operations that `GITHUB_TOKEN` may be blocked from doing, especially creating pull requests. The fine-grained PAT needs repository access to this repo with:

| Permission | Level |
| --- | --- |
| Metadata | Read |
| Contents | Read and write |
| Issues | Read and write |
| Pull requests | Read and write |

The important lesson from the smoke test: `Issues and pull requests: read/write` is not enough by itself. Without `Contents: read/write`, PR creation may fail because GitHub cannot validate/read the head/base refs for the pull request.

Do not commit either token. Store them only as GitHub Actions secrets.

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
-> workflow opens or reuses draft PR
```

## Validated smoke result

The end-to-end Sandcastle path is validated.

Fresh issue #17 triggered workflow run `27839376514`, which completed successfully. The run:

- started the Sandcastle Docker runner,
- ran Claude Code in the sandbox,
- created the requested evidence file,
- committed on branch `sandcastle/issue-17-sandcastle-token-updated-pr-publication-smoke-test`,
- pushed the branch,
- opened draft PR #18,
- and passed the independent `verify` check on the PR.

Proof PR: <https://github.com/pradeepanmohan/clinical-agent-harness-experiment/pull/18>

## Debugging lessons

- Sandcastle starts a container, then runs commands with `docker exec`; the image must stay alive. Use a long-running entrypoint such as `ENTRYPOINT ["sleep", "infinity"]`.
- GitHub Actions may run containers as arbitrary numeric UID/GID. Do not assume a baked home directory is writable.
- Claude Code/Sandcastle session capture expects `/home/agent/.claude/...`; make `/home/agent/.claude` writable in the image even if `HOME` is overridden.
- Force `HOME`, `GIT_CONFIG_GLOBAL`, `COREPACK_HOME`, and `PNPM_HOME` in both Dockerfile environment and setup commands.
- Prefer REST `POST /repos/{owner}/{repo}/pulls` over `gh pr create` inside automation. `gh pr create` can perform GraphQL lookups that fail under fine-grained PATs or GitHub deprecations.
- Make PR publication idempotent by checking for an existing open PR from the same head branch before creating a new one.
- Branch push success is not proof PR creation works. Use a tiny fresh smoke issue to prove the full branch + PR publication path.

## Human gate

The PR is intentionally opened as a **draft**. A human still owns:

- architecture review,
- product acceptance,
- final verification,
- marking ready for review,
- merge.

## Difference from Codex Cloud

Codex Cloud prepares a PR candidate inside ChatGPT and currently needs a human to click **Create PR**. Sandcastle runs the agent inside our own runner, so the GitHub Action owns `git push` and draft PR publication directly.

## Safety boundaries

- The workflow runs only for `agent:sandcastle`, not the existing `agent:implement` Codex Cloud label.
- The agent gets one issue context and is instructed to follow task allowed files.
- The branch is pushed separately from `main`.
- PRs are draft by default.
- Existing `verify.yml` remains the independent quality gate.
