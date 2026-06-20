"use client";

import { useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_CLINICAL_API_URL ?? "http://localhost:3001";

export default async function NewClinicalNotePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [noteText, setNoteText] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/clinical-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: id,
          noteText
        })
      });

      if (!response.ok) {
        setError("Failed to create clinical note. Please check your input.");
        setSubmitting(false);
        return;
      }

      window.location.href = `/appointments/${id}`;
    } catch {
      setError("Unable to create clinical note.");
      setSubmitting(false);
    }
  };

  return (
    <main>
      <div className="shell">
        <header>
          <h1>Add Clinical Note</h1>
          <a href={`/appointments/${id}`}>Back to appointment</a>
        </header>
        {error === undefined ? null : <p role="status">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="noteText">
            Note Text:
            <textarea
              id="noteText"
              name="noteText"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              required
              rows={8}
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Note"}
          </button>
        </form>
      </div>
    </main>
  );
}
