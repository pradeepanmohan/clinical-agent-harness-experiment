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
const issueNumber = required("ISSUE_NUMBER");
const issueTitle = required("ISSUE_TITLE");
const branch = required("SANDCASTLE_BRANCH");
const issueContextFile = required("ISSUE_CONTEXT_FILE");
const outputFile = process.env.SANDCASTLE_RESULT_FILE ?? ".sandcastle/runtime/last-result.json";
const imageName = process.env.SANDCASTLE_IMAGE_NAME ?? "sandcastle:clinical-agent-harness";
const model = process.env.SANDCASTLE_AGENT_MODEL ?? "claude-sonnet-4-5";
const baseBranch = process.env.SANDCASTLE_BASE_BRANCH ?? "origin/main";
const dryRun = process.env.SANDCASTLE_DRY_RUN === "1";
const runMode = process.env.SANDCASTLE_RUN_MODE ?? "implement";
const claudeToken = process.env.CLAUDE_CODE_OAUTH_TOKEN;

const issueContext = readFileSync(resolve(repoRoot, issueContextFile), "utf8");

const prompt = `# Sandcastle clinical harness task

You are running inside a Sandcastle Docker worktree on branch ${branch}.

Run mode: ${runMode}.

Implement exactly one GitHub issue from the context below.

## Repo rules

1. Read AGENTS.md, docs/HARNESS.md, docs/WORKFLOW.md, .harness/PROGRESS.md, and the active task file before editing.
2. Keep the diff small and inside the task's allowed files.
3. Prefer TDD for new behavior.
4. Run the verification commands named by the task.
5. Write or update the required evidence file under .harness/evidence/.
6. If run mode is fix, address the latest Sandcastle review findings in the linked PR context. Do not redo unrelated work.
7. Make one or more git commits on branch ${branch}.
8. Do not merge the PR or push directly to main.
9. Do not close the issue; the GitHub workflow will create or update a draft PR.

## Required final behavior

Before finishing:
- ensure the working tree is clean except committed changes,
- include verification evidence in the commit,
- output <promise>COMPLETE</promise>.

## Issue #${issueNumber}: ${issueTitle}

${issueContext}
`;

mkdirSync(dirname(resolve(repoRoot, outputFile)), { recursive: true });

if (dryRun) {
  const payload = {
    dryRun: true,
    repoRoot,
    issueNumber,
    issueTitle,
    runMode,
    branch,
    baseBranch,
    imageName,
    model,
    issueContextFile,
    promptLength: prompt.length,
  };
  writeFileSync(resolve(repoRoot, outputFile), JSON.stringify(payload, null, 2));
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

if (!claudeToken) {
  throw new Error("Missing CLAUDE_CODE_OAUTH_TOKEN. Add it as a GitHub Actions secret before running Sandcastle.");
}

const result = await run({
  cwd: repoRoot,
  name: `Sandcastle issue #${issueNumber}`,
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
    branch,
    baseBranch,
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
  maxIterations: Number(process.env.SANDCASTLE_MAX_ITERATIONS ?? "3"),
  idleTimeoutSeconds: Number(process.env.SANDCASTLE_IDLE_TIMEOUT_SECONDS ?? "600"),
  completionTimeoutSeconds: Number(process.env.SANDCASTLE_COMPLETION_TIMEOUT_SECONDS ?? "60"),
  logging: { type: "stdout", verbose: true },
});

const payload = {
  dryRun: false,
  issueNumber,
  issueTitle,
  runMode,
  branch: result.branch,
  commits: result.commits,
  completionSignal: result.completionSignal,
  logFilePath: result.logFilePath,
  preservedWorktreePath: result.preservedWorktreePath,
};

writeFileSync(resolve(repoRoot, outputFile), JSON.stringify(payload, null, 2));
console.log(JSON.stringify(payload, null, 2));

if (result.commits.length === 0) {
  throw new Error("Sandcastle completed without producing commits.");
}
