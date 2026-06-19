# S00 - Scaffold monorepo and harness foundation

## Goal

Create the initial pnpm monorepo, app shells, DB package, shared package, scripts, and verification baseline for the Clinical Agent Harness Experiment.

## Fresh context

Read these files first:

- `AGENTS.md`
- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/HARNESS.md`
- `docs/WORKFLOW.md`
- `.harness/TASKS.json`
- `.harness/PROGRESS.md`

## Allowed changes

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `.env.example`
- `apps/web/**`
- `apps/api/**`
- `packages/db/**`
- `packages/shared/**`
- `scripts/**`
- `.harness/evidence/S00-scaffold.md`
- `.harness/PROGRESS.md`
- `.harness/TASKS.json`
- `.github/workflows/verify.yml`

## Acceptance criteria

- [ ] pnpm workspace exists.
- [ ] Next.js app shell exists in `apps/web`.
- [ ] NestJS app shell exists in `apps/api`.
- [ ] Shared package exists.
- [ ] DB package exists with an initial Drizzle setup or clearly documented placeholder.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` are defined.
- [ ] Verification commands pass or blockers are documented honestly.
- [ ] Evidence file is written.

## Out of scope

- Patient CRUD implementation.
- Doctor CRUD implementation.
- Auth.
- Production deployment.
- UI polish.

## Verification

Run:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Evidence required

Write `.harness/evidence/S00-scaffold.md` with:

- summary
- files changed
- commands run
- test results
- known limitations
- next suggested task
```
