# Sandcastle runner experiment

Sandcastle is the active agent-harness path for this repo.

The earlier Codex Cloud mode is archived because dispatch worked but autonomous branch/PR publication did not. Sandcastle runs the agent inside our own GitHub Actions-hosted runner, so the workflow owns `git push`, draft PR publication, and review comments directly.

## Trigger implementation

Add this label to a standalone GitHub issue:

```txt
agent:implement
```

For follow-up fixes, add:

```txt
agent:fix
```

Backward-compatible alias:

```txt
agent:sandcastle
```

Or run the workflow manually:

```txt
Actions -> Sandcastle Implement -> Run workflow -> issue_number=<number>
```

## Trigger PR review

Add this label to a pull request:

```txt
agent:review
```

Or run the workflow manually:

```txt
Actions -> Sandcastle Review -> Run workflow -> pr_number=<number>
```

The review workflow reads the PR body, diff, files, checks, comments, and existing reviews, then posts a structured Sandcastle review comment.

## Required secrets

The workflows require these repository secrets:

```txt
CLAUDE_CODE_OAUTH_TOKEN
CODEX_DISPATCH_TOKEN
```

Generate `CLAUDE_CODE_OAUTH_TOKEN` on a trusted machine with:

```bash
claude setup-token
```

`CLAUDE_CODE_OAUTH_TOKEN` authenticates Claude Code inside the Sandcastle container.

`CODEX_DISPATCH_TOKEN` is legacy-named but still used by the workflow for GitHub write operations that `GITHUB_TOKEN` may be blocked from doing, especially creating pull requests. The fine-grained PAT needs repository access to this repo with:

| Permission | Level |
| --- | --- |
| Metadata | Read |
| Contents | Read and write |
| Issues | Read and write |
| Pull requests | Read and write |

The important lesson from the smoke test: `Issues and pull requests: read/write` is not enough by itself. Without `Contents: read/write`, PR creation may fail because GitHub cannot validate/read the head/base refs for the pull request.

Do not commit either token. Store them only as GitHub Actions secrets.

## What the implementation workflow does

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

## What the review workflow does

```txt
PR label/manual dispatch
-> checkout PR head
-> install pnpm dependencies
-> build .sandcastle/Dockerfile
-> export PR body/diff/files/checks/comments/reviews into .sandcastle/runtime/pr-review-context.md
-> run .sandcastle/run-review.mts
-> Sandcastle writes .sandcastle/runtime/sandcastle-review.md
-> workflow posts that file as a PR comment
```

## Validated smoke result

The end-to-end Sandcastle implementation path is validated.

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

Implementation PRs are intentionally opened as **draft**. A human still owns:

- architecture review,
- product acceptance,
- final verification,
- marking ready for review,
- merge.

Review comments are advisory. A human decides whether a Sandcastle review is blocking.

## Safety boundaries

- The implementation workflow runs for `agent:implement`, `agent:fix`, and the compatibility alias `agent:sandcastle`.
- The review workflow runs for `agent:review` on PRs.
- The implementation agent gets one issue context and is instructed to follow task allowed files.
- The branch is pushed separately from `main`.
- PRs are draft by default.
- Existing `verify.yml` remains the independent quality gate.
