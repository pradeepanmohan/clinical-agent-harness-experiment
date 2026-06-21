# S09: Doctor list search by full name and specialty

## Goal

Add doctor list search by full name and specialty.

## Feature

Allow users to search for doctors by full name or specialty.

## Current context

The existing doctor API stores doctors with:
- `fullName`
- `specialty`
- optional `phone`
- optional `email`

The current Doctors page fetches `GET /doctors` and renders each doctor's `fullName` and `specialty`.

## Requested behavior

- The Doctors list page should expose a search input named `q`.
- When a user searches, the page should show only doctors whose `fullName` or `specialty` contains the query, case-insensitive.
- The API should support `GET /doctors?q=<term>` and apply the same filter server-side.
- Existing `GET /doctors` with no query must keep current behavior.
- Whitespace-only queries should behave like no query.
- If search has no matches, show `No doctors match your search.`.
- Preserve the existing no-doctors empty state (`No doctors yet.`) for the no-data/no-search case.

## Allowed files

- `apps/api/src/doctors/**`
- `apps/web/src/app/doctors/**`
- `.harness/tasks/S09-doctor-search.md`
- `.harness/evidence/S09-doctor-search.md`
- `.harness/policies/allowed-files.json`
- `.harness/TASKS.json`
- `.harness/PROGRESS.md`

## Acceptance criteria

- Add/update focused API tests for search behavior:
  - no query returns all doctors
  - whitespace-only query returns all doctors
  - query matches `fullName` case-insensitively
  - query matches `specialty` case-insensitively
  - query with no matches returns an empty list
- Update the Doctors page to pass the query to the API and preserve the query in the input.
- Add/update web tests if the current web test harness supports page-level assertions; otherwise document why not in evidence.
- Write/update the task file.
- Add the allowed-files policy entry.
- Add/update `.harness/TASKS.json` with S09.
- Add the evidence file with `Summary`, `Changed files`, `Verification`, and `Result` sections.
- Run the normal verification gate:

```bash
pnpm harness:check -- --task S09 --base origin/main
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Out of scope

- Authentication
- Database migrations
- Advanced pagination/sorting
- Styling overhaul
- Auto-merge

## Verification commands

```bash
pnpm harness:check -- --task S09 --base origin/main
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
