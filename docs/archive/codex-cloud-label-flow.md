# Archived: Codex Cloud label flow

This repo initially tested a Codex Subscription / Codex Cloud label flow:

```txt
GitHub Issue
-> add label: agent:implement
-> GitHub Action posts a human-authored @codex instruction comment
-> Codex Cloud reacts/runs
-> Codex should open a PR
-> verify.yml should run
```

## Result

The dispatch gate worked after `CODEX_DISPATCH_TOKEN` made the comment author `pradeepanmohan` instead of `github-actions[bot]`.

However, autonomous PR publication was unreliable in this repo:

- Codex reacted to the issue comment.
- Codex generated task output.
- Codex claimed branches/commits/PRs existed.
- GitHub did not have the claimed branch, commit, or PR.

This happened for the S03 appointment scheduling task and a tiny PR-publication smoke test.

## Decision

Codex Cloud mode is archived. It remains useful as historical evidence and fallback research, but it is no longer the active harness path.

The active path is now Sandcastle:

```txt
agent:implement issue label
-> GitHub Action runs Sandcastle
-> runner pushes branch
-> runner opens draft PR
-> verify.yml runs
-> agent:review PR label runs Sandcastle review
-> human merges
```

Archived workflow snapshots:

- `docs/archive/codex-label-dispatch.yml`
- `docs/archive/codex-review-dispatch.yml`
