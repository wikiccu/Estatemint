import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PropertiesModule } from '../properties/properties.module';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsRepository } from './appointments.repository';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [AuthModule, PropertiesModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsRepository, AppointmentsService],
})
export class AppointmentsModule {}
