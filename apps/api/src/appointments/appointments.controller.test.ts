import { BadRequestException, NotFoundException } from "@nestjs/common";
import { describe, it, expect, beforeEach } from "vitest";

import { AppointmentsController } from "./appointments.controller.js";
import { AppointmentsService } from "./appointments.service.js";

describe("AppointmentsController", () => {
  let controller: AppointmentsController;
  let service: AppointmentsService;

  beforeEach(() => {
    service = new AppointmentsService();
    controller = new AppointmentsController(service);
  });

  describe("create", () => {
    it("creates an appointment with valid input", () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const input = {
        patientId: "patient-123",
        doctorId: "doctor-456",
        scheduledAt
      };

      const appointment = controller.create(input);

      expect(appointment.id).toBeDefined();
      expect(appointment.patientId).toBe("patient-123");
      expect(appointment.doctorId).toBe("doctor-456");
      expect(appointment.scheduledAt).toBe(scheduledAt);
      expect(appointment.status).toBe("scheduled");
      expect(appointment.createdAt).toBeDefined();
      expect(appointment.updatedAt).toBeDefined();
    });

    it("rejects appointment missing patientId", () => {
      const input = {
        doctorId: "doctor-456",
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      expect(() => controller.create(input)).toThrow(BadRequestException);
    });

    it("rejects appointment missing doctorId", () => {
      const input = {
        patientId: "patient-123",
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      expect(() => controller.create(input)).toThrow(BadRequestException);
    });

    it("rejects appointment scheduled in the past", () => {
      const input = {
        patientId: "patient-123",
        doctorId: "doctor-456",
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      };

      expect(() => controller.create(input)).toThrow(BadRequestException);
    });

    it("rejects appointment missing scheduledAt", () => {
      const input = {
        patientId: "patient-123",
        doctorId: "doctor-456"
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
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      controller.create({
        patientId: "patient-123",
        doctorId: "doctor-456",
        scheduledAt
      });
      controller.create({
        patientId: "patient-789",
        doctorId: "doctor-012",
        scheduledAt
      });

      const appointments = controller.list();
      expect(appointments).toHaveLength(2);
    });
  });

  describe("get", () => {
    it("returns appointment by id", () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const created = controller.create({
        patientId: "patient-123",
        doctorId: "doctor-456",
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
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const created = controller.create({
        patientId: "patient-123",
        doctorId: "doctor-456",
        scheduledAt
      });

      const updated = controller.updateStatus(created.id, { status: "checked_in" });
      expect(updated.status).toBe("checked_in");
    });

    it("updates appointment status to completed", () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const created = controller.create({
        patientId: "patient-123",
        doctorId: "doctor-456",
        scheduledAt
      });

      const updated = controller.updateStatus(created.id, { status: "completed" });
      expect(updated.status).toBe("completed");
    });

    it("updates appointment status to cancelled", () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const created = controller.create({
        patientId: "patient-123",
        doctorId: "doctor-456",
        scheduledAt
      });

      const updated = controller.updateStatus(created.id, { status: "cancelled" });
      expect(updated.status).toBe("cancelled");
    });

    it("rejects invalid status", () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const created = controller.create({
        patientId: "patient-123",
        doctorId: "doctor-456",
        scheduledAt
      });

      expect(() => controller.updateStatus(created.id, { status: "invalid" })).toThrow(
        BadRequestException
      );
    });
  });
});
