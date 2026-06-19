import { Injectable, NotFoundException } from "@nestjs/common";

import {
  type CreateDoctorInput,
  type Doctor,
  type UpdateDoctorInput
} from "@clinical/shared";

@Injectable()
export class DoctorsService {
  private readonly doctors = new Map<string, Doctor>();

  create(input: CreateDoctorInput): Doctor {
    const now = new Date().toISOString();
    const doctor: Doctor = {
      id: crypto.randomUUID(),
      fullName: input.fullName,
      specialty: input.specialty,
      ...(input.phone === undefined ? {} : { phone: input.phone }),
      ...(input.email === undefined ? {} : { email: input.email }),
      createdAt: now,
      updatedAt: now
    };

    this.doctors.set(doctor.id, doctor);
    return doctor;
  }

  list(): Doctor[] {
    return Array.from(this.doctors.values());
  }

  get(id: string): Doctor {
    const doctor = this.doctors.get(id);

    if (doctor === undefined) {
      throw new NotFoundException(`Doctor ${id} was not found`);
    }

    return doctor;
  }

  update(id: string, input: UpdateDoctorInput): Doctor {
    const doctor = this.get(id);
    const updated: Doctor = {
      ...doctor,
      ...input,
      updatedAt: new Date().toISOString()
    };

    this.doctors.set(id, updated);
    return updated;
  }
}
