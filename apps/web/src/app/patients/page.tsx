import { patientListSchema } from "@clinical/shared";

export const dynamic = "force-dynamic";

const apiBaseUrl = process.env.NEXT_PUBLIC_CLINICAL_API_URL ?? "http://localhost:3001";

export default async function PatientsPage() {
  const { patients, error } = await fetchPatients();

  return (
    <main>
      <div className="shell">
        <header>
          <h1>Patients</h1>
          <a href="/patients/new">Create patient</a>
        </header>
        {error === undefined ? null : <p role="status">{error}</p>}
        <section aria-label="Patient list" className="status">
          {patients.length === 0 ? (
            <p>No patients yet.</p>
          ) : (
            <ul>
              {patients.map((patient) => (
                <li key={patient.id}>
                  <a href={`/patients/${patient.id}`}>{patient.fullName}</a>
                  {patient.email === undefined ? null : <span> - {patient.email}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

async function fetchPatients() {
  try {
    const response = await fetch(`${apiBaseUrl}/patients`, { cache: "no-store" });

    if (!response.ok) {
      return { patients: [], error: "Unable to load patients." };
    }

    return { patients: patientListSchema.parse(await response.json()) };
  } catch {
    return { patients: [], error: "Unable to load patients." };
  }
}
