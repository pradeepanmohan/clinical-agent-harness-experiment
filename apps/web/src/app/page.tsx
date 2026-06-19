import { healthCheckSchema } from "@clinical/shared";

export default function HomePage() {
  const health = healthCheckSchema.parse({
    service: "web",
    status: "ok"
  });

  return (
    <main>
      <div className="shell">
        <h1>Clinical Agent Harness</h1>
        <section className="status" aria-label="Application status">
          <p>Web scaffold is running.</p>
          <p>
            {health.service}: {health.status}
          </p>
        </section>
      </div>
    </main>
  );
}
