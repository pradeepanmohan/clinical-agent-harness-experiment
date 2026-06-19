# Harness Progress

## Current state

S00 scaffold and S01 Patient CRUD have been implemented and verified locally.

The repository now has a minimal pnpm/Turbo monorepo with Next.js, NestJS, shared validation, DB scaffold packages, and the first Patient CRUD vertical slice.

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

## Completed S01

- Added shared patient validation and DTO types.
- Added Drizzle `patients` table schema and SQL migration.
- Added NestJS `PatientsModule`, controller, and in-memory service for create, list, get by id, and update.
- Added patient list, create form, and detail pages in the Next.js app.
- Added API tests covering create, list, get by id, update, invalid email, missing id, and required full name.
- Ran S01 verification commands and wrote `.harness/evidence/S01-patient-crud.md`.

## Next task

S02: Implement Doctor CRUD vertical slice.

## Handoff note

A future Codex run should start by reading:

- `AGENTS.md`
- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/HARNESS.md`
- `docs/WORKFLOW.md`
- `.harness/TASKS.json`
- `.harness/PROGRESS.md`
- `.harness/tasks/S02-doctor-crud.md`
- `.harness/evidence/S01-patient-crud.md`

S01 verification passed locally. The S01 API service stores patients in memory; DB schema and migration were added, but runtime database-backed repositories remain future work.
