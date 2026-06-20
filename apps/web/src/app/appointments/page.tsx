import { appointmentListSchema } from "@clinical/shared";

export const dynamic = "force-dynamic";

const apiBaseUrl = process.env.NEXT_PUBLIC_CLINICAL_API_URL ?? "http://localhost:3001";

export default async function AppointmentsPage() {
  const { appointments, error } = await fetchAppointments();

  return (
    <main>
      <div className="shell">
        <header>
          <h1>Appointments</h1>
          <a href="/appointments/new">Create appointment</a>
        </header>
        {error === undefined ? null : <p role="status">{error}</p>}
        <section aria-label="Appointment list" className="status">
          {appointments.length === 0 ? (
            <p>No appointments yet.</p>
          ) : (
            <ul>
              {appointments.map((appointment) => (
                <li key={appointment.id}>
                  <strong>{new Date(appointment.scheduledAt).toLocaleString()}</strong>
                  {" - "}
                  <span>Status: {appointment.status}</span>
                  {" - "}
                  <span>Patient: {appointment.patientId}</span>
                  {" - "}
                  <span>Doctor: {appointment.doctorId}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

async function fetchAppointments() {
  try {
    const response = await fetch(`${apiBaseUrl}/appointments`, { cache: "no-store" });

    if (!response.ok) {
      return { appointments: [], error: "Unable to load appointments." };
    }

    return { appointments: appointmentListSchema.parse(await response.json()) };
  } catch {
    return { appointments: [], error: "Unable to load appointments." };
  }
}
