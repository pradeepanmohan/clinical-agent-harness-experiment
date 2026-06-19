import { z } from "zod";

export const appointmentStatusSchema = z.enum([
  "scheduled",
  "checked_in",
  "completed",
  "cancelled"
]);

export const appointmentSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().trim().min(1, "patientId is required"),
  doctorId: z.string().trim().min(1, "doctorId is required"),
  scheduledAt: z.string().datetime(),
  status: appointmentStatusSchema,
  reason: z.string().trim().min(1).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createAppointmentSchema = appointmentSchema.pick({
  patientId: true,
  doctorId: true,
  scheduledAt: true,
  reason: true
});

export const updateAppointmentStatusSchema = z.object({
  status: appointmentStatusSchema.exclude(["scheduled"])
});

export const appointmentListSchema = z.array(appointmentSchema);

export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
