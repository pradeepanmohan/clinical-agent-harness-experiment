import { Module } from "@nestjs/common";

import { AppController } from "./app.controller.js";
import { AppointmentsModule } from "./appointments/appointments.module.js";
import { ClinicalNotesModule } from "./clinical-notes/clinical-notes.module.js";
import { DoctorsModule } from "./doctors/doctors.module.js";
import { PatientsModule } from "./patients/patients.module.js";

@Module({
  controllers: [AppController],
  imports: [AppointmentsModule, ClinicalNotesModule, DoctorsModule, PatientsModule]
})
export class AppModule {}
