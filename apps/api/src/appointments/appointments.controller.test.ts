import { BadRequestException, NotFoundException } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { describe, expect, it } from "vitest";

import { AppModule } from "../app.module.js";
import { AppointmentsController } from "./appointments.controller.js";
import { DoctorsController } from "../doctors/doctors.controller.js";
import { PatientsController } from "../patients/patients.controller.js";

async function createControllers() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false
  });

  return {
    app,
    appointments: app.get(AppointmentsController),
    doctors: app.get(DoctorsController),
    patients: app.get(PatientsController)
  };
}

async function createPatientAndDoctor() {
  const controllers = await createControllers();
  const patient = controllers.patients.create({ fullName: "Pat Appointment" });
  const doctor = controllers.doctors.create({
    fullName: "Dr. Appointment",
    specialty: "Family Medicine"
  });

  return { ...controllers, patient, doctor };
}

describe("AppointmentsController", () => {
  it("creates an appointment with an existing patient and doctor", async () => {
    const { app, appointments, patient, doctor } = await createPatientAndDoctor();

    try {
      const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const appointment = appointments.create({
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt,
        reason: "Annual visit"
      });

      expect(appointment).toMatchObject({
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt,
        reason: "Annual visit",
        status: "scheduled"
      });
      expect(appointment.id).toEqual(expect.any(String));
      expect(appointment.createdAt).toEqual(expect.any(String));
      expect(appointment.updatedAt).toEqual(expect.any(String));
    } finally {
      await app.close();
    }
  });

  it("rejects an appointment for a missing patient", async () => {
    const { app, appointments, doctor } = await createPatientAndDoctor();

    try {
      expect(() =>
        appointments.create({
          patientId: "missing-patient",
          doctorId: doctor.id,
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        })
      ).toThrow(NotFoundException);
    } finally {
      await app.close();
    }
  });

  it("rejects an appointment for a missing doctor", async () => {
    const { app, appointments, patient } = await createPatientAndDoctor();

    try {
      expect(() =>
        appointments.create({
          patientId: patient.id,
          doctorId: "missing-doctor",
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        })
      ).toThrow(NotFoundException);
    } finally {
      await app.close();
    }
  });

  it("rejects a new appointment scheduled in the past", async () => {
    const { app, appointments, patient, doctor } = await createPatientAndDoctor();

    try {
      expect(() =>
        appointments.create({
          patientId: patient.id,
          doctorId: doctor.id,
          scheduledAt: new Date(Date.now() - 60 * 1000).toISOString()
        })
      ).toThrow(BadRequestException);
    } finally {
      await app.close();
    }
  });

  it.each(["checked_in", "completed", "cancelled"] as const)(
    "updates appointment status to %s",
    async (status) => {
      const { app, appointments, patient, doctor } = await createPatientAndDoctor();

      try {
        const created = appointments.create({
          patientId: patient.id,
          doctorId: doctor.id,
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        });

        const updated = appointments.updateStatus(created.id, { status });

        expect(updated).toMatchObject({
          id: created.id,
          status
        });
      } finally {
        await app.close();
      }
    }
  );

  it("wires appointment scheduling for HTTP requests", async () => {
    const app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(0);
    const address = app.getHttpServer().address();

    if (typeof address === "string" || address === null) {
      throw new Error("Expected HTTP server to listen on a TCP port");
    }

    try {
      const baseUrl = `http://127.0.0.1:${address.port}`;
      const patientResponse = await fetch(`${baseUrl}/patients`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullName: "HTTP Patient" })
      });
      const patient = await patientResponse.json();

      const doctorResponse = await fetch(`${baseUrl}/doctors`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: "Dr. HTTP Appointment",
          specialty: "Urgent Care"
        })
      });
      const doctor = await doctorResponse.json();

      const createResponse = await fetch(`${baseUrl}/appointments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          doctorId: doctor.id,
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        })
      });

      expect(createResponse.status).toBe(201);
      const created = await createResponse.json();
      expect(created.status).toBe("scheduled");

      const updateResponse = await fetch(`${baseUrl}/appointments/${created.id}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "checked_in" })
      });

      expect(updateResponse.status).toBe(200);
      await expect(updateResponse.json()).resolves.toMatchObject({
        id: created.id,
        status: "checked_in"
      });
    } finally {
      await app.close();
    }
  });
});
