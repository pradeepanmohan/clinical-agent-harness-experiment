import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import {
  type Appointment,
  type AppointmentWithDetails,
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

  listToday(): AppointmentWithDetails[] {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const todayAppointments = Array.from(this.appointments.values()).filter((appointment) => {
      const scheduledAt = new Date(appointment.scheduledAt);
      return scheduledAt >= startOfToday && scheduledAt < endOfToday;
    });

    return todayAppointments.map((appointment) => {
      const patient = this.patientsService.get(appointment.patientId);
      const doctor = this.doctorsService.get(appointment.doctorId);

      return {
        id: appointment.id,
        patientId: appointment.patientId,
        patientName: patient.fullName,
        doctorId: appointment.doctorId,
        doctorName: doctor.fullName,
        scheduledAt: appointment.scheduledAt,
        status: appointment.status
      };
    });
  }
}
