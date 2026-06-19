import { patientSchema } from "@clinical/shared";

export const dynamic = "force-dynamic";

const apiBaseUrl = process.env.NEXT_PUBLIC_CLINICAL_API_URL ?? "http://localhost:3001";

export default async function PatientDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await fetchPatient(id);

  if (patient === undefined) {
    return (
      <main>
        <div className="shell">
          <h1>Patient not found</h1>
          <a href="/patients">Back to patients</a>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="shell">
        <header>
          <h1>{patient.fullName}</h1>
          <a href="/patients">Back to patients</a>
        </header>
        <section aria-label="Patient detail" className="status">
          <dl>
            <dt>Date of birth</dt>
            <dd>{patient.dateOfBirth ?? "Not recorded"}</dd>
            <dt>Phone</dt>
            <dd>{patient.phone ?? "Not recorded"}</dd>
            <dt>Email</dt>
            <dd>{patient.email ?? "Not recorded"}</dd>
          </dl>
        </section>
      </div>
    </main>
  );
}

async function fetchPatient(id: string) {
  const response = await fetch(`${apiBaseUrl}/patients/${id}`, {
    cache: "no-store"
  });

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error("Unable to load patient.");
  }

  return patientSchema.parse(await response.json());
}
