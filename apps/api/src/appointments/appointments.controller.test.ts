import { BadRequestException, NotFoundException } from "@nestjs/common";
import { describe, it, expect, beforeEach } from "vitest";

import { DoctorsService } from "../doctors/doctors.service.js";
import { PatientsService } from "../patients/patients.service.js";
import { AppointmentsController } from "./appointments.controller.js";
import { AppointmentsService } from "./appointments.service.js";

const futureDate = (): string => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

const todayDate = (): string => {
  const now = new Date();
  const hours = now.getHours();
  now.setHours(hours < 23 ? hours + 1 : 23, 30, 0, 0);
  return now.toISOString();
};

const tomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  return tomorrow.toISOString();
};

describe("AppointmentsController", () => {
  let controller: AppointmentsController;
  let doctorId: string;
  let patientId: string;
  let service: AppointmentsService;

  beforeEach(() => {
    const patientsService = new PatientsService();
    const doctorsService = new DoctorsService();
    patientId = patientsService.create({ fullName: "Asha Kumar" }).id;
    doctorId = doctorsService.create({ fullName: "Dr. Ravi Menon", specialty: "Cardiology" }).id;
    service = new AppointmentsService(patientsService, doctorsService);
    controller = new AppointmentsController(service);
  });

  describe("create", () => {
    it("creates an appointment with valid input", () => {
      const scheduledAt = futureDate();
      const input = {
        patientId,
        doctorId,
        scheduledAt
      };

      const appointment = controller.create(input);

      expect(appointment.id).toBeDefined();
      expect(appointment.patientId).toBe(patientId);
      expect(appointment.doctorId).toBe(doctorId);
      expect(appointment.scheduledAt).toBe(scheduledAt);
      expect(appointment.status).toBe("scheduled");
      expect(appointment.createdAt).toBeDefined();
      expect(appointment.updatedAt).toBeDefined();
    });

    it("rejects appointment missing patientId", () => {
      const input = {
        doctorId,
        scheduledAt: futureDate()
      };

      expect(() => controller.create(input)).toThrow(BadRequestException);
    });

    it("rejects appointment missing doctorId", () => {
      const input = {
        patientId,
        scheduledAt: futureDate()
      };

      expect(() => controller.create(input)).toThrow(BadRequestException);
    });

    it("rejects appointment for missing patient", () => {
      expect(() =>
        controller.create({
          patientId: "missing-patient",
          doctorId,
          scheduledAt: futureDate()
        })
      ).toThrow(BadRequestException);
    });

    it("rejects appointment for missing doctor", () => {
      expect(() =>
        controller.create({
          patientId,
          doctorId: "missing-doctor",
          scheduledAt: futureDate()
        })
      ).toThrow(BadRequestException);
    });

    it("rejects appointment scheduled in the past", () => {
      const input = {
        patientId,
        doctorId,
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      };

      expect(() => controller.create(input)).toThrow(BadRequestException);
    });

    it("rejects appointment missing scheduledAt", () => {
      const input = {
        patientId,
        doctorId
      };

      expect(() => controller.create(input)).toThrow(BadRequestException);
    });
  });

  describe("list", () => {
    it("returns empty list initially", () => {
      const appointments = controller.list();
      expect(appointments).toEqual([]);
    });

    it("returns all appointments", () => {
      const scheduledAt = futureDate();
      controller.create({
        patientId,
        doctorId,
        scheduledAt
      });
      controller.create({
        patientId,
        doctorId,
        scheduledAt
      });

      const appointments = controller.list();
      expect(appointments).toHaveLength(2);
    });
  });

  describe("get", () => {
    it("returns appointment by id", () => {
      const scheduledAt = futureDate();
      const created = controller.create({
        patientId,
        doctorId,
        scheduledAt
      });

      const appointment = controller.get(created.id);
      expect(appointment.id).toBe(created.id);
    });

    it("throws NotFoundException for missing id", () => {
      expect(() => controller.get("missing-id")).toThrow(NotFoundException);
    });
  });

  describe("updateStatus", () => {
    it("updates appointment status to checked_in", () => {
      const scheduledAt = futureDate();
      const created = controller.create({
        patientId,
        doctorId,
        scheduledAt
      });

      const updated = controller.updateStatus(created.id, { status: "checked_in" });
      expect(updated.status).toBe("checked_in");
    });

    it("updates appointment status to completed", () => {
      const scheduledAt = futureDate();
      const created = controller.create({
        patientId,
        doctorId,
        scheduledAt
      });

      const updated = controller.updateStatus(created.id, { status: "completed" });
      expect(updated.status).toBe("completed");
    });

    it("updates appointment status to cancelled", () => {
      const scheduledAt = futureDate();
      const created = controller.create({
        patientId,
        doctorId,
        scheduledAt
      });

      const updated = controller.updateStatus(created.id, { status: "cancelled" });
      expect(updated.status).toBe("cancelled");
    });

    it("rejects invalid status", () => {
      const scheduledAt = futureDate();
      const created = controller.create({
        patientId,
        doctorId,
        scheduledAt
      });

      expect(() => controller.updateStatus(created.id, { status: "invalid" })).toThrow(
        BadRequestException
      );
    });
  });

  describe("listToday", () => {
    it("returns empty list when no appointments today", () => {
      controller.create({
        patientId,
        doctorId,
        scheduledAt: tomorrowDate()
      });

      const today = controller.listToday();
      expect(today).toEqual([]);
    });

    it("returns today's appointments with patient and doctor details", () => {
      const todayAppt = controller.create({
        patientId,
        doctorId,
        scheduledAt: todayDate()
      });

      const today = controller.listToday();
      expect(today).toHaveLength(1);
      expect(today[0]!.id).toBe(todayAppt.id);
      expect(today[0]!.patientName).toBe("Asha Kumar");
      expect(today[0]!.doctorName).toBe("Dr. Ravi Menon");
      expect(today[0]!.scheduledAt).toBe(todayAppt.scheduledAt);
      expect(today[0]!.status).toBe("scheduled");
    });

    it("filters by date correctly", () => {
      controller.create({
        patientId,
        doctorId,
        scheduledAt: todayDate()
      });
      controller.create({
        patientId,
        doctorId,
        scheduledAt: tomorrowDate()
      });

      const today = controller.listToday();
      expect(today).toHaveLength(1);
      expect(new Date(today[0]!.scheduledAt).getDate()).toBe(new Date().getDate());
    });

    it("excludes tomorrow's appointments", () => {
      controller.create({
        patientId,
        doctorId,
        scheduledAt: tomorrowDate()
      });

      const today = controller.listToday();
      expect(today).toEqual([]);
    });

    it("returns multiple today's appointments", () => {
      controller.create({
        patientId,
        doctorId,
        scheduledAt: todayDate()
      });
      controller.create({
        patientId,
        doctorId,
        scheduledAt: todayDate()
      });
      controller.create({
        patientId,
        doctorId,
        scheduledAt: tomorrowDate()
      });

      const today = controller.listToday();
      expect(today).toHaveLength(2);
    });
  });
});
