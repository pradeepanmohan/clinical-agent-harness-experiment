import { Module } from "@nestjs/common";

import { PatientsController } from "./patients.controller.js";
import { PatientsService } from "./patients.service.js";

@Module({
  controllers: [PatientsController],
  exports: [PatientsService],
  providers: [PatientsService]
})
export class PatientsModule {}
