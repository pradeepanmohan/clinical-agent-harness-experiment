import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { type ClinicalNote, type CreateClinicalNoteInput } from "@clinical/shared";

import { AppointmentsService } from "../appointments/appointments.service.js";

@Injectable()
export class ClinicalNotesService {
  private readonly notes = new Map<string, ClinicalNote>();

  constructor(private readonly appointmentsService: AppointmentsService) {}

  create(input: CreateClinicalNoteInput): ClinicalNote {
    try {
      this.appointmentsService.get(input.appointmentId);
    } catch {
      throw new BadRequestException("Clinical note requires an existing appointment");
    }

    const nowISO = new Date().toISOString();
    const note: ClinicalNote = {
      id: crypto.randomUUID(),
      appointmentId: input.appointmentId,
      noteText: input.noteText,
      createdAt: nowISO,
      updatedAt: nowISO
    };

    this.notes.set(note.id, note);
    return note;
  }

  listByAppointment(appointmentId: string): ClinicalNote[] {
    return Array.from(this.notes.values()).filter((note) => note.appointmentId === appointmentId);
  }

  get(id: string): ClinicalNote {
    const note = this.notes.get(id);

    if (note === undefined) {
      throw new NotFoundException(`Clinical note ${id} was not found`);
    }

    return note;
  }
}
