import { z } from "zod";

const optionalTextSchema = z
  .string()
  .trim()
  .min(1)
  .optional();

export const doctorSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().trim().min(1, "fullName is required"),
  specialty: z.string().trim().min(1, "specialty is required"),
  phone: optionalTextSchema,
  email: z.string().trim().email().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createDoctorSchema = doctorSchema.pick({
  fullName: true,
  specialty: true,
  phone: true,
  email: true
});

export const updateDoctorSchema = createDoctorSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one doctor field is required"
);

export const doctorListSchema = z.array(doctorSchema);

export type Doctor = z.infer<typeof doctorSchema>;
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
