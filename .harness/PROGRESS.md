# Harness Progress

## Current state

S00 scaffold has been implemented and verified locally.

The repository now has a minimal pnpm/Turbo monorepo with Next.js, NestJS, shared validation, and DB scaffold packages. No product CRUD behavior has been implemented yet.

## Completed setup

- Created repository folder.
- Initialized git.
- Added initial product, architecture, harness, and workflow documentation.
- Added harness task queue and task cards.
- Added draft GitHub Actions workflows.
- Added S00 pnpm workspace scaffold.
- Added Next.js web app shell.
- Added NestJS API app shell.
- Added shared Zod validation package.
- Added DB package with initial Drizzle PostgreSQL scaffold.
- Ran S00 verification commands and wrote `.harness/evidence/S00-scaffold.md`.

## Next task

S01: Implement Patient CRUD vertical slice.

## Handoff note

A future Codex run should start by reading:

- `AGENTS.md`
- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/HARNESS.md`
- `docs/WORKFLOW.md`
- `.harness/TASKS.json`
- `.harness/PROGRESS.md`
- `.harness/tasks/S01-patient-crud.md`
- `.harness/evidence/S00-scaffold.md`

S00 verification passed locally. A review found the original S00 policy forgot `pnpm-lock.yaml` and `.harness/TASKS.json`; the policy was corrected, the lockfile was kept, and CI now uses `pnpm install --frozen-lockfile`.
