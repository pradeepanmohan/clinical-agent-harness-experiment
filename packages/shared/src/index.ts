import { z } from "zod";

export const healthCheckSchema = z.object({
  service: z.string().min(1),
  status: z.literal("ok")
});

export type HealthCheck = z.infer<typeof healthCheckSchema>;
