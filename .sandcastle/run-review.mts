#!/usr/bin/env tsx
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { claudeCode, run } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const repoRoot = process.cwd();
const prNumber = required("PR_NUMBER");
const prContextFile = required("PR_CONTEXT_FILE");
const reviewFile = process.env.SANDCASTLE_REVIEW_FILE ?? ".sandcastle/runtime/sandcastle-review.md";
const outputFile = process.env.SANDCASTLE_RESULT_FILE ?? ".sandcastle/runtime/sandcastle-review-result.json";
const imageName = process.env.SANDCASTLE_IMAGE_NAME ?? "sandcastle:clinical-agent-harness";
const model = process.env.SANDCASTLE_AGENT_MODEL ?? "claude-sonnet-4-5";
const dryRun = process.env.SANDCASTLE_DRY_RUN === "1";
const claudeToken = process.env.CLAUDE_CODE_OAUTH_TOKEN;

const prContext = readFileSync(resolve(repoRoot, prContextFile), "utf8");
const absoluteReviewFile = resolve(repoRoot, reviewFile);

const prompt = `# Sandcastle clinical harness PR review

You are reviewing Pull Request #${prNumber} for the Clinical Agent Harness experiment.

## Your job

Produce a code-review comment, not code changes.

Review the PR against:
- AGENTS.md
- docs/HARNESS.md
- docs/WORKFLOW.md
- the linked issue/task file, if present
- the PR diff and checks in the context below

## Review priorities

1. Acceptance criteria coverage.
2. Allowed-files and scope compliance.
3. Runtime correctness, especially NestJS DI/routing when backend code changes.
4. Test quality and whether verification evidence is strong enough.
5. Evidence quality under .harness/evidence/.
6. Overengineering, unclear boundaries, or future-agent maintenance risks.

## Output format

Write the review to ${reviewFile} in this exact shape:

<!-- sandcastle-review -->
## Sandcastle Review

**Verdict:** APPROVE | COMMENT | REQUEST_CHANGES

### Blockers
- Use "None" if there are no blockers.

### Warnings
- Use "None" if there are no warnings.

### What looks good
- Concise bullets.

### Verification notes
- Mention PR check status and any missing verification.

Do not edit repository files except writing ${reviewFile}.
Do not commit.
Output <promise>COMPLETE</promise> when the review file is written.

## PR context

${prContext}
`;

mkdirSync(dirname(resolve(repoRoot, outputFile)), { recursive: true });
mkdirSync(dirname(absoluteReviewFile), { recursive: true });

if (dryRun) {
  const payload = {
    dryRun: true,
    repoRoot,
    prNumber,
    imageName,
    model,
    prContextFile,
    reviewFile,
    promptLength: prompt.length,
  };
  writeFileSync(resolve(repoRoot, outputFile), JSON.stringify(payload, null, 2));
  writeFileSync(absoluteReviewFile, `<!-- sandcastle-review -->\n## Sandcastle Review\n\n**Verdict:** COMMENT\n\n### Blockers\n- Dry run only.\n\n### Warnings\n- Dry run only.\n\n### What looks good\n- Dry run prompt generation succeeded.\n\n### Verification notes\n- No live review agent was executed.\n`);
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

if (!claudeToken) {
  throw new Error("Missing CLAUDE_CODE_OAUTH_TOKEN. Add it as a GitHub Actions secret before running Sandcastle review.");
}

const result = await run({
  cwd: repoRoot,
  name: `Sandcastle review PR #${prNumber}`,
  agent: claudeCode(model, {
    env: {
      CLAUDE_CODE_OAUTH_TOKEN: claudeToken,
    },
  }),
  sandbox: docker({
    imageName,
    env: {
      HOME: "/tmp/agent-home",
      GIT_CONFIG_GLOBAL: "/tmp/agent-home/.gitconfig",
      COREPACK_HOME: "/tmp/agent-home/.cache/corepack",
      PNPM_HOME: "/tmp/agent-home/.local/share/pnpm",
      PATH: "/tmp/agent-home/.local/share/pnpm:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
    },
  }),
  branchStrategy: {
    type: "branch",
    branch: `sandcastle-review/pr-${prNumber}`,
    baseBranch: "HEAD",
  },
  hooks: {
    sandbox: {
      onSandboxReady: [
        { command: "mkdir -p /tmp/agent-home/.cache/corepack /tmp/agent-home/.local/share/pnpm && git config --global --add safe.directory '*'" },
        { command: "export HOME=/tmp/agent-home GIT_CONFIG_GLOBAL=/tmp/agent-home/.gitconfig COREPACK_HOME=/tmp/agent-home/.cache/corepack PNPM_HOME=/tmp/agent-home/.local/share/pnpm PATH=/tmp/agent-home/.local/share/pnpm:$PATH && corepack enable && pnpm install --frozen-lockfile" },
      ],
    },
  },
  prompt,
  maxIterations: Number(process.env.SANDCASTLE_REVIEW_MAX_ITERATIONS ?? "2"),
  idleTimeoutSeconds: Number(process.env.SANDCASTLE_IDLE_TIMEOUT_SECONDS ?? "600"),
  completionTimeoutSeconds: Number(process.env.SANDCASTLE_COMPLETION_TIMEOUT_SECONDS ?? "60"),
  logging: { type: "stdout", verbose: true },
});

const payload = {
  dryRun: false,
  prNumber,
  completionSignal: result.completionSignal,
  commits: result.commits,
  logFilePath: result.logFilePath,
  preservedWorktreePath: result.preservedWorktreePath,
  reviewFile,
};

writeFileSync(resolve(repoRoot, outputFile), JSON.stringify(payload, null, 2));
console.log(JSON.stringify(payload, null, 2));

const review = readFileSync(absoluteReviewFile, "utf8");
if (!review.includes("<!-- sandcastle-review -->") || !review.includes("**Verdict:**")) {
  throw new Error(`Review file ${reviewFile} is missing the required Sandcastle review marker or verdict.`);
}
