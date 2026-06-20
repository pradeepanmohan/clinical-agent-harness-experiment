import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import {
  type Appointment,
  type CreateAppointmentInput,
  type UpdateAppointmentStatusInput
} from "@clinical/shared";

import { DoctorsService } from "../doctors/doctors.service.js";
import { PatientsService } from "../patients/patients.service.js";

@Injectable()
export class AppointmentsService {
  private readonly appointments = new Map<string, Appointment>();

  constructor(
    private readonly patientsService: PatientsService,
    private readonly doctorsService: DoctorsService
  ) {}

  create(input: CreateAppointmentInput): Appointment {
    const scheduledAt = new Date(input.scheduledAt);
    const now = new Date();

    if (scheduledAt < now) {
      throw new BadRequestException("Appointment cannot be scheduled in the past");
    }

    try {
      this.patientsService.get(input.patientId);
      this.doctorsService.get(input.doctorId);
    } catch {
      throw new BadRequestException("Appointment requires an existing patient and doctor");
    }

    const nowISO = now.toISOString();
    const appointment: Appointment = {
      id: crypto.randomUUID(),
      patientId: input.patientId,
      doctorId: input.doctorId,
      scheduledAt: input.scheduledAt,
      status: "scheduled",
      createdAt: nowISO,
      updatedAt: nowISO
    };

    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  list(): Appointment[] {
    return Array.from(this.appointments.values());
  }

  get(id: string): Appointment {
    const appointment = this.appointments.get(id);

    if (appointment === undefined) {
      throw new NotFoundException(`Appointment ${id} was not found`);
    }

    return appointment;
  }

  updateStatus(id: string, input: UpdateAppointmentStatusInput): Appointment {
    const appointment = this.get(id);
    const updated: Appointment = {
      ...appointment,
      status: input.status,
      updatedAt: new Date().toISOString()
    };

    this.appointments.set(id, updated);
    return updated;
  }
}
