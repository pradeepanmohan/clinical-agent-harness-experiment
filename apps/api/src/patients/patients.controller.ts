import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import {
  createPatientSchema,
  type CreatePatientInput,
  type Patient,
  updatePatientSchema,
  type UpdatePatientInput
} from "@clinical/shared";

import { PatientsService } from "./patients.service.js";

@Controller("patients")
export class PatientsController {
  constructor(@Inject(PatientsService) private readonly patientsService: PatientsService) {}

  @Post()
  create(@Body() body: unknown): Patient {
    return this.patientsService.create(this.parseCreate(body));
  }

  @Get()
  list(@Query("q") query?: string): Patient[] {
    return this.patientsService.list(query);
  }

  @Get(":id")
  get(@Param("id") id: string): Patient {
    return this.patientsService.get(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown): Patient {
    return this.patientsService.update(id, this.parseUpdate(body));
  }

  private parseCreate(body: unknown): CreatePatientInput {
    try {
      return createPatientSchema.parse(body);
    } catch (error) {
      throw this.toBadRequest(error);
    }
  }

  private parseUpdate(body: unknown): UpdatePatientInput {
    try {
      return updatePatientSchema.parse(body);
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

    return new BadRequestException("Invalid patient payload");
  }
}
