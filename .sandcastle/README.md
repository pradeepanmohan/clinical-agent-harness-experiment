# .sandcastle

Local configuration for the Sandcastle runner experiment.

- `Dockerfile` builds the sandbox image used by the GitHub Actions workflows.
- `run-issue.mts` runs one issue in a Sandcastle branch worktree and expects commits.
- `run-review.mts` reviews one pull request and writes a review comment file without committing.
- `runtime/` is ignored and used by Actions for issue/PR context and result files.

Sandcastle is now the active harness path. The Codex Cloud label flow is archived under `docs/archive/`.
