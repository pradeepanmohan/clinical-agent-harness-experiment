# S05 - Clinical notes evidence

## Goal

Allow creating and viewing clinical notes for an appointment.

## Implementation summary

### Backend

1. **Shared validation** (`packages/shared/src/clinical-note.ts`)
   - Created `clinicalNoteSchema` with id, appointmentId, noteText (required), createdAt, updatedAt
   - Created `createClinicalNoteSchema` requiring appointmentId and noteText
   - Exported types `ClinicalNote` and `CreateClinicalNoteInput`

2. **Database schema** (`packages/db/src/schema.ts`)
   - Added `clinicalNotes` table with foreign key to appointments
   - noteText field is varchar(10000) and required (NOT NULL)

3. **Service** (`apps/api/src/clinical-notes/clinical-notes.service.ts`)
   - `create`: validates appointment exists, requires noteText
   - `listByAppointment`: filters notes by appointmentId
   - `get`: retrieves single note by id
   - In-memory storage consistent with other services

4. **Controller** (`apps/api/src/clinical-notes/clinical-notes.controller.ts`)
   - `POST /clinical-notes`: create note
   - `GET /clinical-notes/appointment/:appointmentId`: list notes for appointment
   - `GET /clinical-notes/:id`: get note by id
   - Zod validation with error handling

5. **Module** (`apps/api/src/clinical-notes/clinical-notes.module.ts`)
   - Imports AppointmentsModule for appointment validation
   - Exports ClinicalNotesService
   - Registered in AppModule

### Frontend

1. **Appointment detail page** (`apps/web/src/app/appointments/[id]/page.tsx`)
   - Shows appointment details (scheduledAt, status, patientId, doctorId)
   - Lists all clinical notes for the appointment with timestamp and text
   - Link to add new note
   - Notes are NOT shown in broad appointment list (`/appointments`)

2. **New note form** (`apps/web/src/app/appointments/[id]/notes/new/page.tsx`)
   - Client component using React.use() to unwrap Next.js 15 async params
   - Textarea for noteText with client-side state management
   - Form validation requires noteText
   - POSTs to `/clinical-notes` endpoint
   - Redirects to appointment detail on success

### Tests

Created comprehensive test suite (`apps/api/src/clinical-notes/clinical-notes.controller.test.ts`):
- ✓ Creates note with valid appointmentId and noteText
- ✓ Rejects note with empty noteText
- ✓ Rejects note missing noteText (required field test)
- ✓ Rejects note missing appointmentId
- ✓ Rejects note for non-existent appointment (appointment association test)
- ✓ Lists notes by appointment
- ✓ Filters notes correctly by appointment
- ✓ Gets note by id
- ✓ Throws NotFoundException for missing note

## Acceptance criteria

- [x] Create note for appointment - POST /clinical-notes with appointmentId and noteText
- [x] View notes for appointment - GET /clinical-notes/appointment/:appointmentId and detail page UI
- [x] Note text is required - Zod validation rejects empty or missing noteText
- [x] Notes are not shown in broad appointment list views - Only shown on appointment detail page
- [x] Tests cover required note text and appointment association - See test file

## Verification results

```bash
pnpm lint
# ✓ All packages passed

pnpm typecheck  
# ✓ All packages type-checked successfully

pnpm test
# ✓ 46 tests passed (10 new clinical notes tests)
# Test Files: 5 passed (5)
# Tests: 46 passed (46)

pnpm build
# ✓ All packages built successfully
# ✓ Next.js routes generated including:
#   - /appointments/[id] (appointment detail with notes)
#   - /appointments/[id]/notes/new (new note form)
```

## Files changed

Within allowed scope:
- `packages/shared/src/clinical-note.ts` (new)
- `packages/shared/src/index.ts` (export clinical note schemas)
- `packages/db/src/schema.ts` (add clinicalNotes table)
- `apps/api/src/clinical-notes/clinical-notes.service.ts` (new)
- `apps/api/src/clinical-notes/clinical-notes.controller.ts` (new)
- `apps/api/src/clinical-notes/clinical-notes.controller.test.ts` (new)
- `apps/api/src/clinical-notes/clinical-notes.module.ts` (new)
- `apps/api/src/app.module.ts` (register ClinicalNotesModule)
- `apps/web/src/app/appointments/[id]/page.tsx` (new - detail view)
- `apps/web/src/app/appointments/[id]/notes/new/page.tsx` (new - create form)

## Design decisions

1. **Required noteText**: Enforced at both Zod schema level (min(1)) and database schema level (NOT NULL)
2. **Appointment association**: Service validates appointment exists before creating note
3. **No notes in list views**: Notes only appear on appointment detail page, not in `/appointments` list
4. **In-memory storage**: Consistent with other services (patients, doctors, appointments)
5. **Next.js 15 async params**: Client component uses React.use() to unwrap Promise params (required in Next.js 15 App Router)
6. **Component architecture**: Fixed initial async/client hybrid error by using React.use() for proper Next.js 15 client component param handling

## Sandcastle review fix

The initial implementation had a critical React component error: the new note page was marked `"use client"` with client hooks (`useState`) but also declared as an async server component with `await params`. This is invalid in React.

**Fix applied**: Changed the component to use React's `use()` hook to unwrap the Promise params, which is the correct pattern for client components in Next.js 15. This maintains the client-side form state while properly handling Next.js 15's async params requirement.

## Out of scope (as specified)

- Rich text editor (plain textarea used)
- Attachments
- Audit log
- Role-based access control
