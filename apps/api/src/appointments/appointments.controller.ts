import { BadRequestException, Body, Controller, Inject, Patch, Post, Param } from "@nestjs/common";
import {
  createAppointmentSchema,
  type Appointment,
  type CreateAppointmentInput,
  updateAppointmentStatusSchema,
  type UpdateAppointmentStatusInput
} from "@clinical/shared";

import { AppointmentsService } from "./appointments.service.js";

@Controller("appointments")
export class AppointmentsController {
  constructor(@Inject(AppointmentsService) private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() body: unknown): Appointment {
    return this.appointmentsService.create(this.parseCreate(body));
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() body: unknown): Appointment {
    return this.appointmentsService.updateStatus(id, this.parseStatus(body));
  }

  private parseCreate(body: unknown): CreateAppointmentInput {
    try {
      return createAppointmentSchema.parse(body);
    } catch (error) {
      throw this.toBadRequest(error);
    }
  }

  private parseStatus(body: unknown): UpdateAppointmentStatusInput {
    try {
      return updateAppointmentStatusSchema.parse(body);
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

    return new BadRequestException("Invalid appointment payload");
  }
}
