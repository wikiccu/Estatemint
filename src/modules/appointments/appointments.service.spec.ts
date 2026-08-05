import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentsRepository } from './appointments.repository';
import { AppointmentsService } from './appointments.service';
import { PropertiesRepository } from '../properties/properties.repository';

describe('AppointmentsService', () => {
  const userId = '860cd10a-38f4-46da-94bc-852067fc5999';
  const propertyId = '64225f72-b5aa-4370-80db-0443c109609c';
  let appointmentsRepository: jest.Mocked<
    Pick<AppointmentsRepository, 'create' | 'findAll'>
  >;
  let propertiesRepository: jest.Mocked<
    Pick<PropertiesRepository, 'findPublicById'>
  >;
  let service: AppointmentsService;

  beforeEach(() => {
    appointmentsRepository = { create: jest.fn(), findAll: jest.fn() };
    propertiesRepository = { findPublicById: jest.fn() };
    service = new AppointmentsService(
      appointmentsRepository as unknown as AppointmentsRepository,
      propertiesRepository as unknown as PropertiesRepository,
    );
  });

  it('rejects tour requests in the past before querying the property', async () => {
    await expect(
      service.create(userId, {
        propertyId,
        scheduledAt: '2020-01-01T12:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(propertiesRepository.findPublicById).not.toHaveBeenCalled();
  });

  it('rejects requests for unavailable properties', async () => {
    propertiesRepository.findPublicById.mockResolvedValue(null);

    await expect(
      service.create(userId, {
        propertyId,
        scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
