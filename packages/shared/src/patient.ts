import { z } from "zod";

const optionalTextSchema = z
  .string()
  .trim()
  .min(1)
  .optional();

export const patientSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().trim().min(1, "fullName is required"),
  dateOfBirth: optionalTextSchema,
  phone: optionalTextSchema,
  email: z.string().trim().email().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createPatientSchema = patientSchema.pick({
  fullName: true,
  dateOfBirth: true,
  phone: true,
  email: true
});

export const updatePatientSchema = createPatientSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one patient field is required"
);

export const patientListSchema = z.array(patientSchema);

export type Patient = z.infer<typeof patientSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
