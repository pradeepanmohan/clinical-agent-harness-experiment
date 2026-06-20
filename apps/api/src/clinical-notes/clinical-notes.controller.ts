import { BadRequestException, Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import {
  type ClinicalNote,
  createClinicalNoteSchema,
  type CreateClinicalNoteInput
} from "@clinical/shared";

import { ClinicalNotesService } from "./clinical-notes.service.js";

@Controller("clinical-notes")
export class ClinicalNotesController {
  constructor(@Inject(ClinicalNotesService) private readonly clinicalNotesService: ClinicalNotesService) {}

  @Post()
  create(@Body() body: unknown): ClinicalNote {
    return this.clinicalNotesService.create(this.parseCreate(body));
  }

  @Get("appointment/:appointmentId")
  listByAppointment(@Param("appointmentId") appointmentId: string): ClinicalNote[] {
    return this.clinicalNotesService.listByAppointment(appointmentId);
  }

  @Get(":id")
  get(@Param("id") id: string): ClinicalNote {
    return this.clinicalNotesService.get(id);
  }

  private parseCreate(body: unknown): CreateClinicalNoteInput {
    try {
      return createClinicalNoteSchema.parse(body);
    } catch (error) {
      throw this.toBadRequest(error);
    }
  }

  private toBadRequest(error: unknown): BadRequestException {
    if (
      typeof error === "object" &&
      error !== null &&
      "flatten" in error &&
      typeof error.flatten === "function"
    ) {
      return new BadRequestException(error.flatten());
    }

    return new BadRequestException("Invalid clinical note payload");
  }
}
