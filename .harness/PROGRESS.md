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

## Completed SMOKE test

- Validated the Sandcastle label harness end-to-end workflow.
- Confirmed `agent:implement` label triggers Sandcastle Docker worktree runner.
- All verification commands (lint, typecheck, test, build) passed in the Sandcastle environment.
- Evidence documented in `.harness/evidence/SMOKE-sandcastle-label-e2e.md`.
- Zero product code changes as required.

## Completed S03

- Added shared appointment validation and DTO types.
- Added Drizzle `appointments` table schema with foreign keys to patients and doctors, and SQL migration.
- Added NestJS `AppointmentsModule`, controller, and in-memory service for create, list, get by id, and update status.
- Added appointment list and create form pages in the Next.js app.
- Added API tests covering create, list, get by id, update status, missing patient/doctor, scheduled in the past, and invalid status.
- Ran S03 verification commands and wrote `.harness/evidence/S03-appointments.md`.

## Completed S04

- Added `AppointmentWithDetails` schema with enriched patient and doctor names.
- Added `GET /appointments/today` endpoint with date filtering and data enrichment.
- Added tests for date filtering logic covering today, tomorrow, and mixed scenarios.
- Created `/dashboard` page showing today's appointments with patient name, doctor name, time, and status.
- Added clear empty state for when no appointments are scheduled today.
- Ran S04 verification commands and wrote `.harness/evidence/S04-today-dashboard.md`.

## Completed S05

- Added shared clinical note validation and DTO types.
- Added Drizzle `clinical_notes` table schema with foreign key to appointments.
- Added NestJS `ClinicalNotesModule`, controller, and in-memory service for create, list by appointment, and get by id.
- Added appointment detail page showing notes and new note creation form in the Next.js app.
- Added API tests covering create, required noteText, missing appointment, and filtering by appointment.
- Notes are only shown on appointment detail pages, not in broad list views.
- Ran S05 verification commands and wrote `.harness/evidence/S05-clinical-notes.md`.

## Completed S06

- Added local harness check scripts for allowed files, evidence existence, and evidence section validation.
- Added `pnpm harness:check` as the combined task gate.
- Updated the Sandcastle implementation workflow to resolve the task id and run the harness gate before pushing/opening a PR.
- Annotated the separate Sandcastle review workflow as the S06 review-loop gate.
- Documented the manual override path in `docs/HARNESS.md` and `docs/WORKFLOW.md`.
- Wrote `.harness/evidence/S06-harness-hardening.md`.

## Issue #36

Validation proof for the complete autonomous Sandcastle flow after PR #30 and PR #35 merged. This is a no-op proof exercise, not a feature task.

## Next task

Next task from `.harness/TASKS.json` after S06 human review and merge.

## Handoff note

A future Codex run should start by reading:

- `AGENTS.md`
- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/HARNESS.md`
- `docs/WORKFLOW.md`
- `.harness/TASKS.json`
- `.harness/PROGRESS.md`
- Next task file from `.harness/tasks/`
- `.harness/evidence/S05-clinical-notes.md`

S05 verification passed locally. The S01, S02, S03, S04, and S05 API services store records in memory; DB schema and migrations exist, but runtime database-backed repositories remain future work.

The Sandcastle label harness has been validated end-to-end through the SMOKE test. The workflow can now handle `agent:implement` labeled issues and will support `agent:review` labeled PRs.
