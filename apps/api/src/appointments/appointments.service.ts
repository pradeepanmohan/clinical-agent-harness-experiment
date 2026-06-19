import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";

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
    @Inject(PatientsService) private readonly patientsService: PatientsService,
    @Inject(DoctorsService) private readonly doctorsService: DoctorsService
  ) {}

  create(input: CreateAppointmentInput): Appointment {
    const scheduledAt = new Date(input.scheduledAt);

    if (scheduledAt.getTime() < Date.now()) {
      throw new BadRequestException("Appointment cannot be scheduled in the past");
    }

    this.patientsService.get(input.patientId);
    this.doctorsService.get(input.doctorId);

    const now = new Date().toISOString();
    const appointment: Appointment = {
      id: crypto.randomUUID(),
      patientId: input.patientId,
      doctorId: input.doctorId,
      scheduledAt: scheduledAt.toISOString(),
      status: "scheduled",
      ...(input.reason === undefined ? {} : { reason: input.reason }),
      createdAt: now,
      updatedAt: now
    };

    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  list(): Appointment[] {
    return Array.from(this.appointments.values());
  }

  updateStatus(id: string, input: UpdateAppointmentStatusInput): Appointment {
    const appointment = this.appointments.get(id);

    if (appointment === undefined) {
      throw new NotFoundException(`Appointment ${id} was not found`);
    }

    const updated: Appointment = {
      ...appointment,
      status: input.status,
      updatedAt: new Date().toISOString()
    };

    this.appointments.set(id, updated);
    return updated;
  }
}
