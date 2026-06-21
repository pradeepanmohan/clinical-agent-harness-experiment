# Clinical Agent Harness Experiment Report

## Executive summary

This experiment used a small Clinical Management App to test a bounded coding-agent harness. The app was intentionally modest. The real deliverable was the operating pattern:

```txt
GitHub issue
-> label-driven Sandcastle implementation
-> draft PR
-> independent Verify workflow
-> separate Sandcastle review
-> automatic fix loop when review is not approved
-> human final review and merge
-> final main Verify
```

The experiment is successful, with an important boundary:

- The harness proved it can drive real product slices from issue to verified PR and human merge.
- The strict review to fix to re-review loop was proven by Issue #42 / PR #43.
- A clean product-slice path after the current-head Verify hardening was proven by S09, Issue #46 / PR #47.
- S09 did not exercise the automatic post-review fix pass because Sandcastle Review approved the first implementation.
- Human final merge remains intentionally outside automation.

The reusable pattern is not "let an agent code freely." It is **bounded automation with durable state, independent verification, structured evidence, separate review, and a human merge gate**.

## Final state

| Area | Final status |
| --- | --- |
| Repository | `/home/pradeepan/Documents/Clinical_Agent_Harness_Experiment` |
| Main branch | Green and synced |
| Open PRs | 0 |
| Open issues | 0 |
| Latest merged slice | S09 doctor list search |
| Latest merge commit | `5b0ce5e` |
| Latest main Verify | `27899079333`, success |
| Active harness path | Sandcastle runner via GitHub labels |
| Archived path | Codex Cloud label dispatch, because dispatch worked but PR publication did not |

## What was built

The clinical app accumulated enough real product surface to test the harness against normal application changes:

| Task | Product or harness outcome | Status |
| --- | --- | --- |
| S00 | pnpm/Turbo monorepo, Next.js app, NestJS API, shared validation, DB scaffold, harness files | Completed |
| S01 | Patient CRUD vertical slice | Completed |
| S02 | Doctor CRUD vertical slice | Completed |
| SMOKE | Sandcastle label harness branch and PR publication smoke | Completed |
| S03 | Appointment scheduling | Completed |
| S04 | Today's appointments dashboard | Completed |
| S05 | Clinical notes | Completed |
| S06 | Harness checks and review-loop hardening | Completed |
| Issue #42 | Strict automation proof after dispatch-token fix | Completed |
| S07 | Patient list search | Completed |
| S08 | Current-head Verify wait hardening | Completed |
| S09 | Doctor list search | Completed |

## Harness architecture

### Durable state

The harness uses repository files as memory:

| File or directory | Purpose |
| --- | --- |
| `.harness/TASKS.json` | Task queue and task status |
| `.harness/PROGRESS.md` | Shift report across agent sessions |
| `.harness/tasks/*.md` | Bounded task specifications |
| `.harness/evidence/*.md` | Verification evidence and result notes |
| `.harness/policies/allowed-files.json` | Per-task changed-file allowlists |
| `docs/*.md` | Product, architecture, workflow, and harness source of truth |
| `.github/workflows/*.yml` | Independent verification, implementation dispatch, review dispatch, PR walkthrough |

This matters because each agent run starts fresh. The repo carries continuity, not the chat.

### Active automation path

```txt
Issue with agent:implement
-> Sandcastle Implement workflow
-> Sandcastle runs implementation inside an isolated Docker worktree
-> workflow verifies changed-file and evidence discipline
-> workflow pushes branch
-> workflow opens or reuses draft PR
-> Verify workflow runs independently
-> implementation workflow waits for Verify on the current PR head SHA
-> workflow queues agent:review
-> Sandcastle Review posts structured verdict
-> if COMMENT or REQUEST_CHANGES, review workflow queues agent:fix on the issue
-> Sandcastle fixes the same PR branch
-> Verify and review repeat until APPROVE or safety cap
-> human reviews, marks ready, and merges
-> main Verify proves merged head
```

### Human gates

The harness intentionally stops before merge. Humans still own:

- product scope decisions,
- architecture judgement,
- security exceptions,
- final PR acceptance,
- production-readiness claims,
- merge.

Automation can produce evidence. It does not get to declare itself trustworthy without review.

## Evidence timeline

### Codex Cloud path was archived

The first label-driven idea used Codex Cloud/subscription-style dispatch. It reacted to labels and comments, but reliable branch and PR publication was not proven. That split the problem into two gates:

```txt
Dispatch gate: agent reacts to task
Publication gate: GitHub receives branch, commits, and PR
```

Codex Cloud passed enough of dispatch to be interesting, but failed the publication gate. The experiment switched to Sandcastle because Sandcastle runs under GitHub Actions and directly owns `git push`, PR creation, and review comments.

### Sandcastle smoke proved publication

The smoke path proved that `agent:implement` could trigger Sandcastle, create a branch, open a draft PR, and pass independent Verify.

Key lesson: PR creation inside automation should use the REST pulls API and idempotently reuse an existing PR for a branch. `gh pr create` is too vulnerable to unrelated GraphQL and permission quirks in low-permission automation contexts.

### S05 exposed the bot-push Verify problem

S05 exercised a realistic review/fix path. Sandcastle Review caught a real Next.js client/async component issue. The fix pass produced a commit, but branch updates pushed with the repository `GITHUB_TOKEN` did not reliably trigger normal PR checks.

Fix: add `workflow_dispatch` to Verify, grant the implementation workflow `actions: write`, and explicitly dispatch Verify for Sandcastle branch updates.

### S06 exposed workflow-file permission limits

S06 modified GitHub workflow files. GitHub rejected a workflow-file update from a token path without workflow permission. Manual recovery was required.

Honest conclusion: S06 was useful, but not fully autonomous. It proved the need for explicit token capability boundaries and manual recovery paths for workflow-file changes.

### PR #35, #38, and #41 hardened the loop

The harness then gained several targeted fixes:

| PR | Fix |
| --- | --- |
| #35 | Verify polling fix |
| #38 | Sandcastle review artifact recovery fix |
| #41 | Dispatch token fix for automatic `agent:fix` queueing |

These fixes mattered more than generic extra features. They corrected concrete automation failures discovered by real runs.

### Issue #42 / PR #43 proved the strict automation loop

Issue #42 and PR #43 validated the strict loop after the dispatch-token fix:

```txt
Issue + agent:implement
-> Sandcastle opens/updates draft PR
-> Verify passes
-> automatic agent:review
-> Sandcastle Review returns non-approve
-> automatic agent:fix is queued
-> Sandcastle adds fix commit
-> Verify reruns
-> automatic second Sandcastle Review
-> final APPROVE
-> human final review and merge
```

PR #43 merged as:

```txt
46accc55e0d040bed440e43c882f4b9528786771
```

This is the strongest proof that the review-driven fix loop can run without manual re-triggering.

### S07 proved product-slice implementation, with one weakness

S07 added patient list search:

```txt
Issue #44 -> PR #45
Merge commit: bd6a748b3e10fd5ce20147d948281c48fd9ffb7a
Final main Verify: 27897250291 success
```

The feature was real application work:

- `GET /patients?q=<term>`,
- search by name, email, or phone,
- case-insensitive matching,
- search form in the Next.js page,
- distinct empty states,
- API tests.

It also exposed the stale Verify run problem: after a fix, the implementation workflow could see an older failed Verify run from the same branch and fail too early. Manual review-label recovery was needed.

### S08 fixed current-head Verify waiting

S08 updated the implementation workflow so it waits only on Verify runs whose `headSha` matches the current PR head SHA.

Final S08 evidence:

```txt
Commit: f3f3c962a5abde81732c681bfb379b0a6981ce95
Final main Verify: 27897669527 success
```

This prevents stale failed runs from older branch commits from blocking the review queue.

### S09 proved the clean product-slice path after S08

S09 added doctor list search:

```txt
Issue #46 -> PR #47
PR head SHA: cae3adc09d31364ffa7ea639ad0daa2ce61082f8
Merge commit: 5b0ce5ec266970bd429ce27d624f58d6fbcbf8f6
Final main Verify: 27899079333 success
```

The exercised path was:

```txt
Issue label
-> Sandcastle Implement
-> draft PR
-> Verify on current PR head
-> automatic Sandcastle Review
-> APPROVE
-> human-gate local verification
-> merge
-> main Verify
```

Human-gate verification before merge passed:

```bash
pnpm harness:check -- --task S09 --base origin/main
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

S09 did not prove the automatic post-review fix pass because the review went straight to `APPROVE`. That is a good product outcome, but it should not be overclaimed.

## What is proven

### Proven strongly

- A GitHub label can dispatch a bounded implementation run.
- Sandcastle can publish branches and draft PRs from GitHub Actions.
- Independent Verify can gate the PR before review.
- The implementation workflow can wait for Verify on the current PR head SHA.
- Sandcastle Review can run as a separate pass and post structured verdicts.
- Non-approved reviews can queue automatic `agent:fix` runs.
- Fix commits can go through Verify and re-review.
- Human final merge can remain the terminal gate.
- Durable repo files are a better agent memory substrate than chat history.
- Allowed-file and evidence gates reduce scope creep.

### Proven with caveats

- Workflow-file changes need special handling because GitHub restricts token capabilities for `.github/workflows/**` updates.
- Product slices with straightforward acceptance criteria work well. More ambiguous slices still need stronger grilling before issue creation.
- Draft PR check visibility can be confusing. The reliable proof is run IDs, head SHAs, PR checks, and final main Verify, not a single UI summary.

### Not proven

- Fully unattended production deployment.
- Multi-issue planning by the agent.
- Large refactors.
- Security-sensitive changes without human approval.
- Automatic merge.
- The S09 post-review fix path, because S09 Review approved the first implementation.

## Reusable pattern

Use this pattern for future repos when you want agent implementation without giving up control.

### 1. Keep the task small

A good task has:

- one user-visible behavior,
- exact allowed files,
- explicit out-of-scope list,
- verification commands,
- evidence requirements,
- a clear human acceptance gate.

Bad task:

```txt
Improve the dashboard.
```

Good task:

```txt
Add patient search by name/email/phone on the existing patient list page.
No pagination, no auth, no styling overhaul, no DB migration.
```

### 2. Put all durable context in the repo

The agent should read files, not rely on memory from an earlier chat.

Minimum files:

```txt
AGENTS.md
README.md
docs/PRD.md
docs/ARCHITECTURE.md
docs/HARNESS.md
docs/WORKFLOW.md
.harness/TASKS.json
.harness/PROGRESS.md
.harness/tasks/<task>.md
.harness/policies/allowed-files.json
```

### 3. Use labels as state transitions

Recommended labels:

| Label | Meaning |
| --- | --- |
| `agent:implement` | Start implementation from an issue |
| `agent:fix` | Continue implementation on the same PR after review feedback |
| `agent:review` | Review a PR in a separate Sandcastle pass |
| `agent:blocked` | Stop automation and require human intervention |
| `agent:done` | Human accepted the work |

### 4. Keep implementation and review separate

Do not ask the same agent run to both implement and judge its own work. The useful split is:

```txt
Implementation agent: change files and write evidence
Verify workflow: run independent quality gate
Review agent: inspect PR diff, checks, evidence, and comments
Human: decide merge
```

### 5. Gate every task with evidence

A task should not be considered done unless it has:

- changed files within the allowlist,
- evidence file present,
- evidence sections present,
- local or CI verification output,
- PR checks visible,
- human-reviewable diff.

### 6. Track run IDs and SHAs

For each serious proof, record:

- issue number,
- PR number,
- implementation run ID,
- PR head SHA,
- Verify run ID and conclusion,
- review run ID and verdict,
- fix run ID if applicable,
- merge commit,
- final main Verify run ID.

Without IDs and SHAs, the report becomes vibes.

### 7. Be honest about manual intervention

Manual recovery is not failure if it is documented. It becomes a useful lesson.

Use wording like:

```txt
This path required manual recovery because workflow-file updates exceeded the token capability boundary.
```

Do not say:

```txt
The full automation loop passed.
```

unless the exact automated path actually ran.

## Recommended operating checklist

### Before creating an issue

- [ ] Is the task one slice?
- [ ] Is the behavior testable?
- [ ] Are allowed files explicit?
- [ ] Are out-of-scope items explicit?
- [ ] Are verification commands listed?
- [ ] Is the human merge gate preserved?

### After Sandcastle opens a PR

- [ ] Confirm PR head branch and SHA.
- [ ] Confirm Verify ran against that exact SHA.
- [ ] Confirm PR Walkthrough or reviewer-orientation artifact if enabled.
- [ ] Confirm `agent:review` was queued only after Verify success.

### After Sandcastle Review

- [ ] Parse the final `**Verdict:**` line.
- [ ] If `APPROVE`, inspect diff and run human-gate verification.
- [ ] If `COMMENT` or `REQUEST_CHANGES`, verify `agent:fix` was queued automatically on the linked issue.
- [ ] If fix loop repeats too many times, label blocked and stop.

### Before merge

- [ ] Inspect changed files and focused diff.
- [ ] Run local task harness check.
- [ ] Run lint, typecheck, tests, and build.
- [ ] Confirm PR checks are green.
- [ ] Mark ready only after evidence is good.
- [ ] Merge only as the human gate.

### After merge

- [ ] Fast-forward local `main`.
- [ ] Find the final main Verify run for the merged HEAD SHA.
- [ ] Watch it to success.
- [ ] Reconcile `.harness/TASKS.json` or progress if needed.
- [ ] Update working memory or project tracker with concise final status.

## Failure modes discovered

| Failure mode | Symptom | Fix or rule |
| --- | --- | --- |
| Cloud agent dispatch without publication | Agent appears to run but no branch or PR exists | Treat dispatch and publication as separate gates |
| `gh pr create` permission or GraphQL quirks | PR creation fails despite apparent permissions | Use REST pulls API with idempotent PR reuse |
| Token lacks workflow-file permission | Push rejected for `.github/workflows/**` changes | Use workflow-capable token or manual recovery, document honestly |
| Bot push does not trigger PR Verify | Fix commit exists but expected PR check does not run | Add `workflow_dispatch` Verify and dispatch explicitly |
| Stale branch Verify result selected | Old failed run blocks review after a newer commit | Filter Verify runs by current PR head SHA |
| Review artifact not copied back | Review agent wrote output but workflow cannot post it | Recover from preserved worktree or structured stdout |
| Harness gate runs from wrong worktree | Main checkout is checked instead of task branch | Resolve actual Sandcastle branch/worktree before checking |
| Transient `.pnpm-store/` appears | Allowed-files check sees unrelated untracked file | Remove transient sandbox store before status checks |
| Overclaiming proof | Report says fix loop proved when review approved first try | Report exact path exercised, not theoretical path |

## Final judgement

This harness is now useful as a reusable pattern for small to medium, well-scoped coding tasks.

It is strongest when:

- scope is deliberately narrow,
- task files are precise,
- allowed files are explicit,
- tests and build are cheap enough to run often,
- review is separate from implementation,
- humans keep final merge authority.

It is weakest when:

- tasks are vague,
- workflow files need modification,
- token capability boundaries are unclear,
- success is reported without run IDs and SHAs,
- the agent is asked to plan, implement, review, and merge in one undifferentiated loop.

The practical reusable lesson is:

> Do not build an "autonomous coding agent". Build a **bounded implementation loop** with durable task state, independent verification, separate review, automatic fix routing, and a human-owned merge gate.

## Next recommended use

Do not add more harness infrastructure unless a concrete failure appears.

For future repos, copy the pattern, not the entire clinical app:

1. Start with one tiny smoke issue.
2. Prove branch publication and draft PR creation.
3. Add independent Verify.
4. Add separate review.
5. Add automatic fix routing.
6. Run one real product slice.
7. Record exact evidence.
8. Only then scale to more important tasks.
