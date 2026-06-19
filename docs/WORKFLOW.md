# Workflow: Matt Pocock Style Harness Adaptation

## Source pattern

The workflow mirrors the saved agent harness note:

```txt
PRD issue
-> label: agent:implement
-> GitHub Actions starts
-> agent executes one sub-issue
-> tests and typecheck
-> commit and push
-> close sub-issue
-> repeat for next sub-issue
-> PR review
```

## Our version

```txt
Clinical PRD
-> .harness/TASKS.json
-> GitHub Actions workflow_dispatch
-> Codex executes one task
-> verification runs
-> evidence is written
-> PR is created or updated
-> separate review pass
-> human merge gate
```

## Matt-inspired steps

### 1. Grill

Before a task exists, clarify:

- who uses this?
- what is the smallest useful behavior?
- what is explicitly out of scope?
- what would be over-engineering?
- how will we verify it?

### 2. Plan

Write the task file with:

- goal
- allowed files
- acceptance criteria
- verification commands
- evidence requirements
- out of scope list

### 3. Execute

Codex handles one task only. It should not select its own next task unless the harness asks it to.

### 4. Verify

GitHub Actions runs verification independently from Codex's self-report.

### 5. Review

A separate review pass checks the diff against the task contract.

### 6. Repeat

The next run starts from repository state, not the prior chat.

## Why this matters

Long chats rot. Durable files do not. The workflow should make progress inspectable through git, tests, and evidence rather than through a giant conversation transcript.
