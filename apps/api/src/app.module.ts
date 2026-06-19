import { Module } from "@nestjs/common";

import { AppController } from "./app.controller.js";
import { PatientsModule } from "./patients/patients.module.js";

@Module({
  controllers: [AppController],
  imports: [PatientsModule]
})
export class AppModule {}
