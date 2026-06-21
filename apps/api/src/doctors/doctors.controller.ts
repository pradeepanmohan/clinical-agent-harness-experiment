import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import {
  createDoctorSchema,
  type CreateDoctorInput,
  type Doctor,
  updateDoctorSchema,
  type UpdateDoctorInput
} from "@clinical/shared";

import { DoctorsService } from "./doctors.service.js";

@Controller("doctors")
export class DoctorsController {
  constructor(@Inject(DoctorsService) private readonly doctorsService: DoctorsService) {}

  @Post()
  create(@Body() body: unknown): Doctor {
    return this.doctorsService.create(this.parseCreate(body));
  }

  @Get()
  list(@Query("q") q?: string): Doctor[] {
    return this.doctorsService.list(q);
  }

  @Get(":id")
  get(@Param("id") id: string): Doctor {
    return this.doctorsService.get(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown): Doctor {
    return this.doctorsService.update(id, this.parseUpdate(body));
  }

  private parseCreate(body: unknown): CreateDoctorInput {
    try {
      return createDoctorSchema.parse(body);
    } catch (error) {
      throw this.toBadRequest(error);
    }
  }

  private parseUpdate(body: unknown): UpdateDoctorInput {
    try {
      return updateDoctorSchema.parse(body);
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

    return new BadRequestException("Invalid doctor payload");
  }
}
