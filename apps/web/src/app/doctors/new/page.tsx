"use client";

import { useState, type FormEvent } from "react";

import { doctorSchema } from "@clinical/shared";

const apiBaseUrl = process.env.NEXT_PUBLIC_CLINICAL_API_URL ?? "http://localhost:3001";

export default function NewDoctorPage() {
  const [error, setError] = useState<string | undefined>();

  async function submitDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(
      ["fullName", "specialty", "phone", "email"].flatMap((field) => {
        const value = String(formData.get(field) ?? "").trim();
        return value.length === 0 ? [] : [[field, value]];
      })
    );

    const response = await fetch(`${apiBaseUrl}/doctors`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setError("Unable to create doctor.");
      return;
    }

    const doctor = doctorSchema.parse(await response.json());
    window.location.assign(`/doctors/${doctor.id}`);
  }

  return (
    <main>
      <div className="shell">
        <header>
          <h1>Create doctor</h1>
          <a href="/doctors">Back to doctors</a>
        </header>
        <form onSubmit={submitDoctor} className="status">
          {error === undefined ? null : <p role="alert">{error}</p>}
          <p><label htmlFor="fullName">Full name</label><br /><input id="fullName" name="fullName" required /></p>
          <p><label htmlFor="specialty">Specialty</label><br /><input id="specialty" name="specialty" required /></p>
          <p><label htmlFor="phone">Phone</label><br /><input id="phone" name="phone" /></p>
          <p><label htmlFor="email">Email</label><br /><input id="email" name="email" type="email" /></p>
          <button type="submit">Create</button>
        </form>
      </div>
    </main>
  );
}
