import { todayAppointmentListSchema } from "@clinical/shared";

export const dynamic = "force-dynamic";

const apiBaseUrl = process.env.NEXT_PUBLIC_CLINICAL_API_URL ?? "http://localhost:3001";

export default async function DashboardPage() {
  const { appointments, error } = await fetchTodayAppointments();

  return (
    <main>
      <div className="shell">
        <header>
          <h1>Today's Appointments</h1>
          <a href="/appointments">View all appointments</a>
        </header>
        {error === undefined ? null : <p role="status">{error}</p>}
        <section aria-label="Today's appointments" className="status">
          {appointments.length === 0 ? (
            <p>No appointments scheduled for today.</p>
          ) : (
            <ul>
              {appointments.map((appointment) => (
                <li key={appointment.id}>
                  <div>
                    <strong>{new Date(appointment.scheduledAt).toLocaleTimeString()}</strong>
                    {" - "}
                    <span>{appointment.patientName}</span>
                    {" with "}
                    <span>{appointment.doctorName}</span>
                  </div>
                  <div>
                    <span>Status: {appointment.status}</span>
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

async function fetchTodayAppointments() {
  try {
    const response = await fetch(`${apiBaseUrl}/appointments/today`, { cache: "no-store" });

    if (!response.ok) {
      return { appointments: [], error: "Unable to load today's appointments." };
    }

    return { appointments: todayAppointmentListSchema.parse(await response.json()) };
  } catch {
    return { appointments: [], error: "Unable to load today's appointments." };
  }
}
