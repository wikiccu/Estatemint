import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PropertiesRepository } from '../properties/properties.repository';
import { AppointmentsRepository } from './appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly propertiesRepository: PropertiesRepository,
  ) {}

  findAll(userId: string) {
    return this.appointmentsRepository.findAll(userId);
  }

  async create(userId: string, input: CreateAppointmentDto) {
    if (new Date(input.scheduledAt).getTime() <= Date.now()) {
      throw new BadRequestException('Tour time must be in the future.');
    }

    const property = await this.propertiesRepository.findPublicById(
      input.propertyId,
    );

    if (property === null) {
      throw new NotFoundException('Property was not found.');
    }

    if (property.ownerId === userId) {
      throw new BadRequestException(
        'You cannot request a tour of your own property.',
      );
    }

    return this.appointmentsRepository.create(userId, input);
  }
}
