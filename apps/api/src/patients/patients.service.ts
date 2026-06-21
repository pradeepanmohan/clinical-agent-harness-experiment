import { Injectable, NotFoundException } from "@nestjs/common";

import {
  type CreatePatientInput,
  type Patient,
  type UpdatePatientInput
} from "@clinical/shared";

@Injectable()
export class PatientsService {
  private readonly patients = new Map<string, Patient>();

  create(input: CreatePatientInput): Patient {
    const now = new Date().toISOString();
    const patient: Patient = {
      id: crypto.randomUUID(),
      fullName: input.fullName,
      ...(input.dateOfBirth === undefined ? {} : { dateOfBirth: input.dateOfBirth }),
      ...(input.phone === undefined ? {} : { phone: input.phone }),
      ...(input.email === undefined ? {} : { email: input.email }),
      createdAt: now,
      updatedAt: now
    };

    this.patients.set(patient.id, patient);
    return patient;
  }

  list(query?: string): Patient[] {
    const allPatients = Array.from(this.patients.values());

    if (query === undefined || query.trim() === "") {
      return allPatients;
    }

    const normalizedQuery = query.toLowerCase();
    return allPatients.filter(patient => {
      return (
        patient.fullName.toLowerCase().includes(normalizedQuery) ||
        (patient.email !== undefined && patient.email.toLowerCase().includes(normalizedQuery)) ||
        (patient.phone !== undefined && patient.phone.toLowerCase().includes(normalizedQuery))
      );
    });
  }

  get(id: string): Patient {
    const patient = this.patients.get(id);

    if (patient === undefined) {
      throw new NotFoundException(`Patient ${id} was not found`);
    }

    return patient;
  }

  update(id: string, input: UpdatePatientInput): Patient {
    const patient = this.get(id);
    const updated: Patient = {
      ...patient,
      ...input,
      updatedAt: new Date().toISOString()
    };

    this.patients.set(id, updated);
    return updated;
  }
}
