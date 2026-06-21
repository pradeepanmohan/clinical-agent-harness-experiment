import { doctorListSchema } from "@clinical/shared";

export const dynamic = "force-dynamic";

const apiBaseUrl = process.env.NEXT_PUBLIC_CLINICAL_API_URL ?? "http://localhost:3001";

interface DoctorsPageProps {
  searchParams?: Promise<{ q?: string }>;
}

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q ?? "";
  const { doctors, error } = await fetchDoctors(query);

  const hasNoDoctors = doctors.length === 0 && query === "";
  const hasNoSearchResults = doctors.length === 0 && query !== "";

  return (
    <main>
      <div className="shell">
        <header>
          <h1>Doctors</h1>
          <a href="/doctors/new">Create doctor</a>
        </header>
        <form action="/doctors" method="get">
          <input
            type="search"
            name="q"
            placeholder="Search by name or specialty"
            defaultValue={query}
            aria-label="Search doctors"
          />
          <button type="submit">Search</button>
        </form>
        {error === undefined ? null : <p role="status">{error}</p>}
        <section aria-label="Doctor list" className="status">
          {hasNoDoctors ? (
            <p>No doctors yet.</p>
          ) : hasNoSearchResults ? (
            <p>No doctors match your search.</p>
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

async function fetchDoctors(query: string) {
  try {
    const url = new URL(`${apiBaseUrl}/doctors`);
    if (query !== "") {
      url.searchParams.set("q", query);
    }

    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      return { doctors: [], error: "Unable to load doctors." };
    }

    return { doctors: doctorListSchema.parse(await response.json()) };
  } catch {
    return { doctors: [], error: "Unable to load doctors." };
  }
}
