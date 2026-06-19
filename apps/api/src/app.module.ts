import { Module } from "@nestjs/common";

import { AppController } from "./app.controller.js";
import { DoctorsModule } from "./doctors/doctors.module.js";
import { PatientsModule } from "./patients/patients.module.js";

@Module({
  controllers: [AppController],
  imports: [DoctorsModule, PatientsModule]
})
export class AppModule {}
