"use client";

import { useState, type FormEvent } from "react";

import { appointmentSchema } from "@clinical/shared";

const apiBaseUrl = process.env.NEXT_PUBLIC_CLINICAL_API_URL ?? "http://localhost:3001";

export default function NewAppointmentPage() {
  const [error, setError] = useState<string | undefined>();

  async function submitAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    const formData = new FormData(event.currentTarget);
    const patientId = String(formData.get("patientId") ?? "").trim();
    const doctorId = String(formData.get("doctorId") ?? "").trim();
    const scheduledAt = String(formData.get("scheduledAt") ?? "").trim();

    if (!patientId || !doctorId || !scheduledAt) {
      setError("All fields are required.");
      return;
    }

    const payload = {
      patientId,
      doctorId,
      scheduledAt: new Date(scheduledAt).toISOString()
    };

    const response = await fetch(`${apiBaseUrl}/appointments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setError("Unable to create appointment.");
      return;
    }

    appointmentSchema.parse(await response.json());
    window.location.assign("/appointments");
  }

  return (
    <main>
      <div className="shell">
        <header>
          <h1>Create appointment</h1>
          <a href="/appointments">Back to appointments</a>
        </header>
        <form onSubmit={submitAppointment} className="status">
          {error === undefined ? null : <p role="alert">{error}</p>}
          <p>
            <label htmlFor="patientId">Patient ID</label>
            <br />
            <input id="patientId" name="patientId" required />
          </p>
          <p>
            <label htmlFor="doctorId">Doctor ID</label>
            <br />
            <input id="doctorId" name="doctorId" required />
          </p>
          <p>
            <label htmlFor="scheduledAt">Scheduled date and time</label>
            <br />
            <input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
          </p>
          <button type="submit">Create</button>
        </form>
      </div>
    </main>
  );
}
