import { z } from "zod";

export const healthCheckSchema = z.object({
  service: z.string().min(1),
  status: z.literal("ok")
});

export type HealthCheck = z.infer<typeof healthCheckSchema>;

export {
  createPatientSchema,
  patientListSchema,
  patientSchema,
  updatePatientSchema,
  type CreatePatientInput,
  type Patient,
  type UpdatePatientInput
} from "./patient.js";

export {
  createDoctorSchema,
  doctorListSchema,
  doctorSchema,
  updateDoctorSchema,
  type CreateDoctorInput,
  type Doctor,
  type UpdateDoctorInput
} from "./doctor.js";


export {
  appointmentListSchema,
  appointmentSchema,
  appointmentStatusSchema,
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  type Appointment,
  type AppointmentStatus,
  type CreateAppointmentInput,
  type UpdateAppointmentStatusInput
} from "./appointment.js";
