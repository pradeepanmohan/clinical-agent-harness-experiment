import { appointmentSchema, clinicalNoteListSchema } from "@clinical/shared";

export const dynamic = "force-dynamic";

const apiBaseUrl = process.env.NEXT_PUBLIC_CLINICAL_API_URL ?? "http://localhost:3001";

export default async function AppointmentDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { appointment, notes, error } = await fetchAppointmentWithNotes(id);

  if (error !== undefined) {
    return (
      <main>
        <div className="shell">
          <p role="status">{error}</p>
          <a href="/appointments">Back to appointments</a>
        </div>
      </main>
    );
  }

  if (appointment === undefined) {
    return (
      <main>
        <div className="shell">
          <p>Appointment not found.</p>
          <a href="/appointments">Back to appointments</a>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="shell">
        <header>
          <h1>Appointment Details</h1>
          <a href="/appointments">Back to appointments</a>
        </header>
        <section aria-label="Appointment information">
          <dl>
            <dt>Scheduled At:</dt>
            <dd>{new Date(appointment.scheduledAt).toLocaleString()}</dd>
            <dt>Status:</dt>
            <dd>{appointment.status}</dd>
            <dt>Patient ID:</dt>
            <dd>{appointment.patientId}</dd>
            <dt>Doctor ID:</dt>
            <dd>{appointment.doctorId}</dd>
          </dl>
        </section>
        <section aria-label="Clinical notes">
          <h2>Clinical Notes</h2>
          <a href={`/appointments/${id}/notes/new`}>Add note</a>
          {notes.length === 0 ? (
            <p>No clinical notes yet.</p>
          ) : (
            <ul>
              {notes.map((note) => (
                <li key={note.id}>
                  <div>
                    <strong>{new Date(note.createdAt).toLocaleString()}</strong>
                    <p>{note.noteText}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

async function fetchAppointmentWithNotes(id: string) {
  try {
    const [appointmentResponse, notesResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/appointments/${id}`, { cache: "no-store" }),
      fetch(`${apiBaseUrl}/clinical-notes/appointment/${id}`, { cache: "no-store" })
    ]);

    if (!appointmentResponse.ok) {
      return { appointment: undefined, notes: [], error: "Unable to load appointment." };
    }

    const appointment = appointmentSchema.parse(await appointmentResponse.json());
    const notes = notesResponse.ok
      ? clinicalNoteListSchema.parse(await notesResponse.json())
      : [];

    return { appointment, notes };
  } catch {
    return { appointment: undefined, notes: [], error: "Unable to load appointment." };
  }
}
