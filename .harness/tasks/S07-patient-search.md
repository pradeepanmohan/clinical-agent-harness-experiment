# S07: Patient list search

## Goal

Add patient list search by name/email/phone.

## Feature

The Patients list page should expose a search input and filter results based on a query parameter.

## Requested behavior

- The Patients list page should expose a search input named `q`.
- When a user searches, the page should show only patients whose `fullName`, `email`, or `phone` contains the query, case-insensitive.
- The existing empty state should remain clear:
  - no patients at all: `No patients yet.`
  - search has no matches: `No patients match your search.`
- The API should support `GET /patients?q=<term>` and apply the same filter server-side.
- Existing `GET /patients` with no query must keep current behavior.

## Allowed files

- `apps/api/src/patients/**`
- `apps/web/src/app/patients/**`
- `.harness/tasks/S07-patient-search.md`
- `.harness/evidence/S07-patient-search.md`
- `.harness/policies/allowed-files.json`
- `.harness/TASKS.json`
- `.harness/PROGRESS.md`

## Acceptance criteria

- Add/update focused API tests for search behavior:
  - no query returns all patients
  - query matches name/email/phone case-insensitively
  - query with no matches returns an empty list
- Add/update web tests if the current web test harness supports page-level assertions; otherwise document why not in evidence.
- Write/update the task file.
- Add the allowed-files policy entry.
- Add the evidence file with `Summary`, `Changed files`, `Verification`, and `Result` sections.
- Run the normal verification gate:

```bash
pnpm harness:check -- --task S07 --base origin/main
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Out of scope

- Authentication
- Database persistence migration
- Advanced pagination/sorting
- Product styling overhaul
- Auto-merge

## Verification commands

```bash
pnpm harness:check -- --task S07 --base origin/main
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
