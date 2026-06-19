# Domain Model

## Entities

### Patient

A person receiving care from the clinic.

Fields:

- id
- fullName
- dateOfBirth
- phone
- email
- createdAt
- updatedAt

Rules:

- fullName is required.
- email is optional but must be valid when present.
- phone is optional in the first slice.

### Doctor

A clinical provider who can receive appointments.

Fields:

- id
- fullName
- specialty
- createdAt
- updatedAt

Rules:

- fullName is required.
- specialty is required.

### Appointment

A scheduled meeting between a patient and a doctor.

Fields:

- id
- patientId
- doctorId
- scheduledAt
- status
- reason
- createdAt
- updatedAt

Statuses:

- scheduled
- checked_in
- completed
- cancelled

Rules:

- patientId and doctorId must reference existing records.
- scheduledAt cannot be in the past for new appointments.
- default status is scheduled.

### ClinicalNote

A note attached to an appointment.

Fields:

- id
- appointmentId
- note
- createdAt
- updatedAt

Rules:

- note is required.
- notes are not shown in broad appointment list views unless explicitly requested.

## First experiment simplification

No auth, tenant isolation, audit logs, or PHI-grade controls are implemented in the first milestone. Sensitive-domain thinking is documented, but the testbed must stay small.
