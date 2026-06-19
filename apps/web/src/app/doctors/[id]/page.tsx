import { doctorSchema } from "@clinical/shared";

export const dynamic = "force-dynamic";

const apiBaseUrl = process.env.NEXT_PUBLIC_CLINICAL_API_URL ?? "http://localhost:3001";

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctor = await fetchDoctor(id);

  if (doctor === undefined) {
    return <main><div className="shell"><h1>Doctor not found</h1><a href="/doctors">Back to doctors</a></div></main>;
  }

  return (
    <main>
      <div className="shell">
        <header><h1>{doctor.fullName}</h1><a href="/doctors">Back to doctors</a></header>
        <section aria-label="Doctor detail" className="status">
          <dl>
            <dt>Specialty</dt><dd>{doctor.specialty}</dd>
            <dt>Phone</dt><dd>{doctor.phone ?? "Not recorded"}</dd>
            <dt>Email</dt><dd>{doctor.email ?? "Not recorded"}</dd>
          </dl>
        </section>
      </div>
    </main>
  );
}

async function fetchDoctor(id: string) {
  const response = await fetch(`${apiBaseUrl}/doctors/${id}`, { cache: "no-store" });

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error("Unable to load doctor.");
  }

  return doctorSchema.parse(await response.json());
}
