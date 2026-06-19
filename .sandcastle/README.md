# .sandcastle

Local configuration for the Sandcastle runner experiment.

- `Dockerfile` builds the sandbox image used by the GitHub Action.
- `run-issue.mts` runs one issue in a Sandcastle branch worktree.
- `runtime/` is ignored and used by Actions for issue context/result files.

This is intentionally separate from the existing Codex Cloud label flow.
