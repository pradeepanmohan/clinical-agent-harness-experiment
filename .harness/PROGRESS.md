# Harness Progress

## Current state

S00 scaffold, S01 Patient CRUD, and S02 Doctor CRUD have been implemented and verified locally.

The repository now has a minimal pnpm/Turbo monorepo with Next.js, NestJS, shared validation, DB scaffold packages, the first Patient CRUD vertical slice, and the Doctor CRUD vertical slice.

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

## Completed S02

- Added shared doctor validation and DTO types.
- Added Drizzle `doctors` table schema and SQL migration.
- Added NestJS `DoctorsModule`, controller, and in-memory service for create, list, get by id, and update.
- Added doctor list, create form, and detail pages in the Next.js app.
- Added API tests covering create, list, get by id, update, missing id, required full name, required specialty, and HTTP runtime wiring.
- Ran S02 verification commands and wrote `.harness/evidence/S02-doctor-crud.md`.

## Next task

S03: Implement appointment scheduling.

## Handoff note

A future Codex run should start by reading:

- `AGENTS.md`
- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/HARNESS.md`
- `docs/WORKFLOW.md`
- `.harness/TASKS.json`
- `.harness/PROGRESS.md`
- `.harness/tasks/S03-appointments.md`
- `.harness/evidence/S02-doctor-crud.md`

S02 verification passed locally. The S01 and S02 API services store records in memory; DB schema and migrations exist, but runtime database-backed repositories remain future work.
