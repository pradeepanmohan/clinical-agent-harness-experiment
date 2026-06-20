import { z } from "zod";

const appointmentStatusEnum = z.enum([
  "scheduled",
  "checked_in",
  "completed",
  "cancelled"
]);

export const appointmentSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1, "patientId is required"),
  doctorId: z.string().min(1, "doctorId is required"),
  scheduledAt: z.string().datetime(),
  status: appointmentStatusEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createAppointmentSchema = appointmentSchema.pick({
  patientId: true,
  doctorId: true,
  scheduledAt: true
});

export const updateAppointmentStatusSchema = z.object({
  status: appointmentStatusEnum
});

export const appointmentListSchema = z.array(appointmentSchema);

export const appointmentWithDetailsSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  doctorId: z.string().min(1),
  doctorName: z.string().min(1),
  scheduledAt: z.string().datetime(),
  status: appointmentStatusEnum,
  reason: z.string().optional()
});

export const todayAppointmentListSchema = z.array(appointmentWithDetailsSchema);

export type Appointment = z.infer<typeof appointmentSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
export type AppointmentStatus = z.infer<typeof appointmentStatusEnum>;
export type AppointmentWithDetails = z.infer<typeof appointmentWithDetailsSchema>;
