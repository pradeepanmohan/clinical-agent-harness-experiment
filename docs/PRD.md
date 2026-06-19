# PRD: Clinical Management App Harness Experiment

## Purpose

Use a small Clinical Management App to test a repeatable agent harness workflow with Codex and GitHub Actions.

This is not intended to become a production healthcare product. It is a safe, realistic playground for full-stack agent execution.

## Product goal

A clinic receptionist can manage patients, doctors, appointments, and basic clinical notes.

## Experiment goal

Prove that a coding agent can execute one bounded vertical slice at a time using fresh context, durable file state, verification, evidence, and human review.

## Users

- Receptionist: creates patients and appointments.
- Doctor: views appointments and writes notes.
- Admin or reviewer: reviews agent-created PRs.

## MVP scope

| Area | Included |
|---|---|
| Patients | create, list, view, update |
| Doctors | create, list, view, update |
| Appointments | schedule, list today's appointments, update status |
| Clinical notes | create note for completed or active appointment |
| Dashboard | today's appointments summary |

## Out of scope for first experiment

- Auth
- Insurance
- Billing
- Prescriptions
- File uploads
- Advanced EMR
- Role-based permissions
- External integrations
- Production deployment

## Success criteria

- S01 Patient CRUD can be implemented by Codex from a task card.
- CI verifies the generated change.
- Evidence file is useful for human review.
- Allowed-file policy catches unrelated edits.
- A later task can continue from `.harness/PROGRESS.md` without previous chat history.
