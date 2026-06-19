# S02 Doctor CRUD Evidence

## Summary

Implemented the Doctor CRUD vertical slice within the S02 scope.

- Added shared Zod doctor schemas and DTO types for create, update, list, and doctor responses.
- Added a Drizzle `doctors` table and SQL migration.
- Added NestJS doctor create, list, get-by-id, and update endpoints under `/doctors`.
- Added a minimal Next.js doctor list, create form, and detail view under `/doctors`.
- Added API tests for create, list, get by id, update, missing id, required full name, required specialty, and HTTP runtime wiring.

No appointment scheduling, auth, or calendar integration behavior was added.

## Files changed

- `.harness/TASKS.json`
- `.harness/PROGRESS.md`
- `.harness/evidence/S02-doctor-crud.md`
- `apps/api/src/app.module.ts`
- `apps/api/src/doctors/doctors.controller.test.ts`
- `apps/api/src/doctors/doctors.controller.ts`
- `apps/api/src/doctors/doctors.module.ts`
- `apps/api/src/doctors/doctors.service.ts`
- `apps/web/src/app/doctors/page.tsx`
- `apps/web/src/app/doctors/new/page.tsx`
- `apps/web/src/app/doctors/[id]/page.tsx`
- `packages/db/src/schema.ts`
- `packages/db/src/migrations/0002_create_doctors.sql`
- `packages/shared/src/index.ts`
- `packages/shared/src/doctor.ts`

## Commands run

- `pnpm --filter @clinical/shared build`: passed, refreshing the shared package `dist` export for package-based API tests.
- `pnpm --filter @clinical/api test`: initially failed because `@nestjs/testing` is not installed. The S02 task asked for HTTP smoke or Nest testing-module coverage, so the test was corrected to use an HTTP smoke through `NestFactory` without adding a dependency.
- `pnpm --filter @clinical/api test`: passed after correction with 16 API tests, including the S02 HTTP runtime wiring smoke.
- `pnpm lint`: passed. Turbo reported 4 successful lint tasks.
- `pnpm typecheck`: passed. Turbo reported 5 successful tasks, including the shared build dependency.
- `pnpm test`: passed. Turbo reported 4 successful test tasks. Vitest reported 21 total passing tests across API, DB, shared, and web packages.
- `pnpm build`: passed. Turbo reported 4 successful build tasks. Next.js built `/doctors`, `/doctors/[id]`, and `/doctors/new` successfully.

## Test results

- API doctor tests: 8 passing tests covering create, list, get by id, update, missing id, required full name, required specialty, and HTTP runtime wiring.
- Existing patient, scaffold, DB, shared, and web tests remained passing.
- Full final `pnpm test` result: 4 package test tasks passed, 21 tests passed, 0 failed.

## Known limitations

- The NestJS doctor service uses in-memory storage. The DB doctor table and migration exist, but the API is not yet wired to a database-backed repository.
- No migration runner was added or executed; S02 only adds the migration file and Drizzle schema.
- The web create form posts to `NEXT_PUBLIC_CLINICAL_API_URL` or `http://localhost:3001` by default, so the API server must be running for interactive create/list/detail behavior.
- No allowed-files policy correction was required for S02.

## Next suggested task

S03: Implement appointment scheduling.
