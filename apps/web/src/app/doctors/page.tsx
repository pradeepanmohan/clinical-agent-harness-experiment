import { doctorListSchema } from "@clinical/shared";

export const dynamic = "force-dynamic";

const apiBaseUrl = process.env.NEXT_PUBLIC_CLINICAL_API_URL ?? "http://localhost:3001";

export default async function DoctorsPage() {
  const { doctors, error } = await fetchDoctors();

  return (
    <main>
      <div className="shell">
        <header>
          <h1>Doctors</h1>
          <a href="/doctors/new">Create doctor</a>
        </header>
        {error === undefined ? null : <p role="status">{error}</p>}
        <section aria-label="Doctor list" className="status">
          {doctors.length === 0 ? (
            <p>No doctors yet.</p>
          ) : (
            <ul>
              {doctors.map((doctor) => (
                <li key={doctor.id}>
                  <a href={`/doctors/${doctor.id}`}>{doctor.fullName}</a>
                  <span> - {doctor.specialty}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

async function fetchDoctors() {
  try {
    const response = await fetch(`${apiBaseUrl}/doctors`, { cache: "no-store" });

    if (!response.ok) {
      return { doctors: [], error: "Unable to load doctors." };
    }

    return { doctors: doctorListSchema.parse(await response.json()) };
  } catch {
    return { doctors: [], error: "Unable to load doctors." };
  }
}
