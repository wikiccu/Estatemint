import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

const appointmentInclude = {
  property: {
    select: {
      id: true,
      title: true,
      city: true,
      address: true,
      price: true,
      currency: true,
      images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
    },
  },
} as const;

@Injectable()
export class AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId },
      include: appointmentInclude,
      orderBy: { scheduledAt: 'asc' },
    });
  }

  create(userId: string, input: CreateAppointmentDto) {
    return this.prisma.appointment.create({
      data: {
        userId,
        propertyId: input.propertyId,
        scheduledAt: new Date(input.scheduledAt),
        message: input.message,
      },
      include: appointmentInclude,
    });
  }
}
