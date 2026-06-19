import { Controller, Get } from "@nestjs/common";

import { type HealthCheck, healthCheckSchema } from "@clinical/shared";

@Controller()
export class AppController {
  @Get("health")
  health(): HealthCheck {
    return healthCheckSchema.parse({
      service: "api",
      status: "ok"
    });
  }
}
