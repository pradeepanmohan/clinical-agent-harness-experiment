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
  appointmentWithDetailsSchema,
  createAppointmentSchema,
  todayAppointmentListSchema,
  updateAppointmentStatusSchema,
  type Appointment,
  type AppointmentStatus,
  type AppointmentWithDetails,
  type CreateAppointmentInput,
  type UpdateAppointmentStatusInput
} from "./appointment.js";

export {
  clinicalNoteListSchema,
  clinicalNoteSchema,
  createClinicalNoteSchema,
  type ClinicalNote,
  type CreateClinicalNoteInput
} from "./clinical-note.js";
