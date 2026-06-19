# S00 Scaffold Evidence

## Summary

Created a minimal pnpm/Turbo monorepo scaffold for the Clinical Agent Harness Experiment.

- Added root workspace manifests and shared TypeScript/ESLint/Turbo configuration.
- Added a Next.js App Router shell in `apps/web`.
- Added a NestJS shell in `apps/api`.
- Added `@clinical/shared` with a small Zod health-check contract.
- Added `@clinical/db` with Drizzle PostgreSQL schema/config/client scaffolding.
- Updated CI verification workflow to use pnpm 9.1.2 and the same verification commands.

No Patient CRUD, Doctor CRUD, appointments, auth, or clinical notes were implemented.

## Files changed

- `.github/workflows/verify.yml`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `apps/web/**`
- `apps/api/**`
- `packages/shared/**`
- `packages/db/**`
- `scripts/eslint.config.mjs`
- `scripts/verify-env.mjs`
- `.harness/PROGRESS.md`
- `.harness/evidence/S00-scaffold.md`
- `.harness/TASKS.json`
- `.harness/tasks/S00-scaffold.md`
- `.harness/tasks/S01-patient-crud.md`
- `.harness/policies/allowed-files.json`

## Commands run

- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Test results

- `pnpm install`: passed. It initially warned that the package manager pin was `pnpm@9.15.9` while the available pnpm was `9.1.2`; the root `packageManager` field and verify workflow were changed to `pnpm@9.1.2`.
- `pnpm install --frozen-lockfile`: passed in independent orchestrator verification after the lockfile policy correction.
- `pnpm lint`: passed. Turbo reported 4 successful package lint tasks.
- `pnpm typecheck`: passed. Turbo reported 5 successful tasks including the shared package build dependency.
- `pnpm test`: passed. Vitest reported 4 passing test files and 6 passing tests.
- `pnpm build`: passed. Turbo reported 4 successful package build tasks, including the Next.js production build.
- Independent orchestrator verification also passed after review corrections: `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

## Known limitations

- Initial Codex run exposed two harness policy gaps: S00 did not allow `pnpm-lock.yaml` or `.harness/TASKS.json`. The orchestrator corrected the S00/S01 task cards and allowed-file policy, kept the generated lockfile so CI can use `pnpm install --frozen-lockfile`, and marked S00 completed in `.harness/TASKS.json`.
- The DB package contains initial Drizzle scaffolding and a scaffold table only; it does not run migrations or connect during tests.
- The app shells expose only scaffold health/status behavior.
- `apply_patch` became intermittently unavailable because the sandbox helper failed with `bwrap: loopback: Failed RTM_NEWADDR: Operation not permitted`; later edits used approved shell commands.

## Next suggested task

S01: Implement Patient CRUD vertical slice.
