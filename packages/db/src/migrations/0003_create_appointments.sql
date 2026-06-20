CREATE TYPE "appointment_status" AS ENUM ('scheduled', 'checked_in', 'completed', 'cancelled');

CREATE TABLE "appointments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "patient_id" uuid NOT NULL REFERENCES "patients"("id"),
  "doctor_id" uuid NOT NULL REFERENCES "doctors"("id"),
  "scheduled_at" timestamp with time zone NOT NULL,
  "status" appointment_status NOT NULL DEFAULT 'scheduled',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
