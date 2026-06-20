import { z } from "zod";

export const clinicalNoteSchema = z.object({
  id: z.string().min(1),
  appointmentId: z.string().min(1, "appointmentId is required"),
  noteText: z.string().min(1, "noteText is required"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createClinicalNoteSchema = clinicalNoteSchema.pick({
  appointmentId: true,
  noteText: true
});

export const clinicalNoteListSchema = z.array(clinicalNoteSchema);

export type ClinicalNote = z.infer<typeof clinicalNoteSchema>;
export type CreateClinicalNoteInput = z.infer<typeof createClinicalNoteSchema>;
