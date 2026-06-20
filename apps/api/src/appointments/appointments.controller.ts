import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post } from "@nestjs/common";
import {
  type Appointment,
  type AppointmentWithDetails,
  createAppointmentSchema,
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

  @Get()
  list(): Appointment[] {
    return this.appointmentsService.list();
  }

  @Get("today")
  listToday(): AppointmentWithDetails[] {
    return this.appointmentsService.listToday();
  }

  @Get(":id")
  get(@Param("id") id: string): Appointment {
    return this.appointmentsService.get(id);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() body: unknown): Appointment {
    return this.appointmentsService.updateStatus(id, this.parseUpdateStatus(body));
  }

  private parseCreate(body: unknown): CreateAppointmentInput {
    try {
      return createAppointmentSchema.parse(body);
    } catch (error) {
      throw this.toBadRequest(error);
    }
  }

  private parseUpdateStatus(body: unknown): UpdateAppointmentStatusInput {
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
