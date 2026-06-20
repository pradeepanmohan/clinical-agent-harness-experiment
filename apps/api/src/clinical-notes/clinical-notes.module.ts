import { Module } from "@nestjs/common";

import { AppointmentsModule } from "../appointments/appointments.module.js";
import { ClinicalNotesController } from "./clinical-notes.controller.js";
import { ClinicalNotesService } from "./clinical-notes.service.js";

@Module({
  imports: [AppointmentsModule],
  controllers: [ClinicalNotesController],
  providers: [ClinicalNotesService],
  exports: [ClinicalNotesService]
})
export class ClinicalNotesModule {}
