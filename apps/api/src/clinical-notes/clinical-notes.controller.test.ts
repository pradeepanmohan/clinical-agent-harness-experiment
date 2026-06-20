import { BadRequestException, NotFoundException } from "@nestjs/common";
import { describe, it, expect, beforeEach } from "vitest";

import { AppointmentsService } from "../appointments/appointments.service.js";
import { DoctorsService } from "../doctors/doctors.service.js";
import { PatientsService } from "../patients/patients.service.js";
import { ClinicalNotesController } from "./clinical-notes.controller.js";
import { ClinicalNotesService } from "./clinical-notes.service.js";

const futureDate = (): string => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

describe("ClinicalNotesController", () => {
  let controller: ClinicalNotesController;
  let appointmentId: string;
  let service: ClinicalNotesService;

  beforeEach(() => {
    const patientsService = new PatientsService();
    const doctorsService = new DoctorsService();
    const appointmentsService = new AppointmentsService(patientsService, doctorsService);

    const patientId = patientsService.create({ fullName: "Asha Kumar" }).id;
    const doctorId = doctorsService.create({ fullName: "Dr. Ravi Menon", specialty: "Cardiology" }).id;
    appointmentId = appointmentsService.create({
      patientId,
      doctorId,
      scheduledAt: futureDate()
    }).id;

    service = new ClinicalNotesService(appointmentsService);
    controller = new ClinicalNotesController(service);
  });

  describe("create", () => {
    it("creates a clinical note with valid input", () => {
      const input = {
        appointmentId,
        noteText: "Patient reports chest pain. ECG ordered."
      };

      const note = controller.create(input);

      expect(note.id).toBeDefined();
      expect(note.appointmentId).toBe(appointmentId);
      expect(note.noteText).toBe("Patient reports chest pain. ECG ordered.");
      expect(note.createdAt).toBeDefined();
      expect(note.updatedAt).toBeDefined();
    });

    it("rejects note with empty text", () => {
      const input = {
        appointmentId,
        noteText: ""
      };

      expect(() => controller.create(input)).toThrow(BadRequestException);
    });

    it("rejects note missing noteText", () => {
      const input = {
        appointmentId
      };

      expect(() => controller.create(input)).toThrow(BadRequestException);
    });

    it("rejects note missing appointmentId", () => {
      const input = {
        noteText: "Patient reports chest pain."
      };

      expect(() => controller.create(input)).toThrow(BadRequestException);
    });

    it("rejects note for missing appointment", () => {
      expect(() =>
        controller.create({
          appointmentId: "missing-appointment",
          noteText: "Patient reports chest pain."
        })
      ).toThrow(BadRequestException);
    });
  });

  describe("listByAppointment", () => {
    it("returns empty list when no notes for appointment", () => {
      const notes = controller.listByAppointment(appointmentId);
      expect(notes).toEqual([]);
    });

    it("returns all notes for an appointment", () => {
      controller.create({
        appointmentId,
        noteText: "First note"
      });
      controller.create({
        appointmentId,
        noteText: "Second note"
      });

      const notes = controller.listByAppointment(appointmentId);
      expect(notes).toHaveLength(2);
      expect(notes[0]!.noteText).toBe("First note");
      expect(notes[1]!.noteText).toBe("Second note");
    });

    it("filters notes by appointment", () => {
      const patientsService = new PatientsService();
      const doctorsService = new DoctorsService();
      const appointmentsService = new AppointmentsService(patientsService, doctorsService);

      const patientId = patientsService.create({ fullName: "John Doe" }).id;
      const doctorId = doctorsService.create({ fullName: "Dr. Smith", specialty: "Neurology" }).id;
      const otherAppointmentId = appointmentsService.create({
        patientId,
        doctorId,
        scheduledAt: futureDate()
      }).id;

      const otherService = new ClinicalNotesService(appointmentsService);
      const otherController = new ClinicalNotesController(otherService);

      controller.create({
        appointmentId,
        noteText: "Note for first appointment"
      });
      otherController.create({
        appointmentId: otherAppointmentId,
        noteText: "Note for second appointment"
      });

      const notes = controller.listByAppointment(appointmentId);
      expect(notes).toHaveLength(1);
      expect(notes[0]!.noteText).toBe("Note for first appointment");
    });
  });

  describe("get", () => {
    it("returns clinical note by id", () => {
      const created = controller.create({
        appointmentId,
        noteText: "Patient reports chest pain."
      });

      const note = controller.get(created.id);
      expect(note.id).toBe(created.id);
      expect(note.noteText).toBe("Patient reports chest pain.");
    });

    it("throws NotFoundException for missing id", () => {
      expect(() => controller.get("missing-id")).toThrow(NotFoundException);
    });
  });
});
