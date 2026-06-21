# Clinical Agent Harness Experiment

This repository is an experiment in agent harness engineering using a small Clinical Management App as the testbed.

The application is intentionally small. The real product is the harness:

- fresh context per task
- durable state in files
- bounded task cards
- allowed-file policies
- verification commands
- evidence artifacts
- PR walkthrough artifacts
- GitHub Actions execution
- separate review pass
- human merge gate

## Stack target

| Layer | Choice |
|---|---|
| Frontend | Next.js App Router |
| Backend | NestJS |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Workspace | pnpm monorepo |
| Agent executor | OpenAI Codex |
| Orchestrator | GitHub Actions plus harness files |

## Core principle

The agent is amnesiac, but the filesystem is not.

A long-running task should be split into short agent sessions. Each Codex run receives a fresh prompt built from verified external state: task file, progress log, architecture docs, git diff, test results, and evidence from previous runs.

## Experiment flow

```txt
PRD
-> task queue
-> one bounded agent run
-> verification
-> evidence
-> PR
-> separate review
-> optional fix loop
-> human merge gate
-> final main verification
```

## Final report

The experiment report is here:

```txt
docs/EXPERIMENT_REPORT.md
```

It captures the final state, proof timeline, failure modes, and reusable Sandcastle label-harness pattern.

## First milestone

Milestone 1 proves one agent-built vertical slice:

1. S00 scaffolds repo, CI, app shells, and harness files.
2. S01 implements Patient CRUD.
3. CI verifies lint, typecheck, tests, and build.
4. Evidence is written to `.harness/evidence/S01-patient-crud.md`.
5. Human reviews the PR.

## Important

Do not start building all clinical features at once. The purpose is to test whether Codex can complete one bounded slice from fresh context and produce evidence that a human can trust.
