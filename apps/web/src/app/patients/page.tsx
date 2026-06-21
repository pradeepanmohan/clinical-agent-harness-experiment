import { patientListSchema } from "@clinical/shared";

export const dynamic = "force-dynamic";

const apiBaseUrl = process.env.NEXT_PUBLIC_CLINICAL_API_URL ?? "http://localhost:3001";

interface PatientsPageProps {
  searchParams?: { q?: string };
}

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const query = searchParams?.q ?? "";
  const { patients, error } = await fetchPatients(query);

  const hasNoPatients = patients.length === 0 && query === "";
  const hasNoSearchResults = patients.length === 0 && query !== "";

  return (
    <main>
      <div className="shell">
        <header>
          <h1>Patients</h1>
          <a href="/patients/new">Create patient</a>
        </header>
        <form action="/patients" method="get">
          <input
            type="search"
            name="q"
            placeholder="Search by name, email, or phone"
            defaultValue={query}
            aria-label="Search patients"
          />
          <button type="submit">Search</button>
        </form>
        {error === undefined ? null : <p role="status">{error}</p>}
        <section aria-label="Patient list" className="status">
          {hasNoPatients ? (
            <p>No patients yet.</p>
          ) : hasNoSearchResults ? (
            <p>No patients match your search.</p>
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

async function fetchPatients(query: string) {
  try {
    const url = new URL(`${apiBaseUrl}/patients`);
    if (query !== "") {
      url.searchParams.set("q", query);
    }

    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      return { patients: [], error: "Unable to load patients." };
    }

    return { patients: patientListSchema.parse(await response.json()) };
  } catch {
    return { patients: [], error: "Unable to load patients." };
  }
}
