"use client";

import { useState, type FormEvent } from "react";

import { patientSchema } from "@clinical/shared";

const apiBaseUrl = process.env.NEXT_PUBLIC_CLINICAL_API_URL ?? "http://localhost:3001";

export default function NewPatientPage() {
  const [error, setError] = useState<string | undefined>();

  async function submitPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(
      ["fullName", "dateOfBirth", "phone", "email"].flatMap((field) => {
        const value = String(formData.get(field) ?? "").trim();
        return value.length === 0 ? [] : [[field, value]];
      })
    );

    const response = await fetch(`${apiBaseUrl}/patients`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setError("Unable to create patient.");
      return;
    }

    const patient = patientSchema.parse(await response.json());
    window.location.assign(`/patients/${patient.id}`);
  }

  return (
    <main>
      <div className="shell">
        <header>
          <h1>Create patient</h1>
          <a href="/patients">Back to patients</a>
        </header>
        <form onSubmit={submitPatient} className="status">
          {error === undefined ? null : <p role="alert">{error}</p>}
          <p>
            <label htmlFor="fullName">Full name</label>
            <br />
            <input id="fullName" name="fullName" required />
          </p>
          <p>
            <label htmlFor="dateOfBirth">Date of birth</label>
            <br />
            <input id="dateOfBirth" name="dateOfBirth" type="date" />
          </p>
          <p>
            <label htmlFor="phone">Phone</label>
            <br />
            <input id="phone" name="phone" />
          </p>
          <p>
            <label htmlFor="email">Email</label>
            <br />
            <input id="email" name="email" type="email" />
          </p>
          <button type="submit">Create</button>
        </form>
      </div>
    </main>
  );
}
