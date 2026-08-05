import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  Currency,
  Prisma,
  PropertyStatus,
  PropertyType,
  UserRole,
} from '@prisma/client';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PropertyQueryDto } from './dto/property-query.dto';
import { PropertiesRepository } from './properties.repository';
import { PropertiesService } from './properties.service';
import type { PropertyEntity } from './property.types';

const owner: AuthenticatedUser = {
  id: '2a51db74-c277-42c9-a01c-c3c81f85a3e4',
  email: 'agent@estatemint.local',
  role: UserRole.AGENT,
};

const property: PropertyEntity = {
  id: 'ef31d864-f82a-4b01-b99b-bc78987bf332',
  title: 'Modern city apartment',
  description: 'A light-filled apartment with a practical layout.',
  price: new Prisma.Decimal('425000.00'),
  currency: Currency.USD,
  city: 'Austin',
  address: '1200 Market Street',
  type: PropertyType.CONDO,
  status: PropertyStatus.ACTIVE,
  area: 1180,
  bedrooms: 2,
  bathrooms: 2,
  parkingSpaces: 1,
  yearBuilt: 2019,
  ownerId: owner.id,
  owner: {
    id: owner.id,
    firstName: 'Ava',
    lastName: 'Agent',
    role: UserRole.AGENT,
  },
  images: [],
  _count: { favorites: 3 },
  createdAt: new Date('2026-06-24T12:00:00.000Z'),
  updatedAt: new Date('2026-06-24T12:00:00.000Z'),
};

describe('PropertiesService', () => {
  let repository: jest.Mocked<
    Pick<
      PropertiesRepository,
      | 'findPublic'
      | 'findPublicById'
      | 'findById'
      | 'findByOwner'
      | 'create'
      | 'update'
      | 'archive'
    >
  >;
  let service: PropertiesService;

  beforeEach(() => {
    repository = {
      findPublic: jest.fn(),
      findPublicById: jest.fn(),
      findById: jest.fn(),
      findByOwner: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
    };
    service = new PropertiesService(
      repository as unknown as PropertiesRepository,
    );
  });

  it('returns a serializable, paginated public property result', async () => {
    repository.findPublic.mockResolvedValue({ items: [property], total: 1 });
    const query = Object.assign(new PropertyQueryDto(), {
      page: 1,
      pageSize: 12,
    });

    const result = await service.findPublic(query);

    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        id: property.id,
        price: '425000',
        favoriteCount: 3,
      }),
    );
  });

  it('rejects an inverted price range', async () => {
    const query = Object.assign(new PropertyQueryDto(), {
      minPrice: 500_000,
      maxPrice: 100_000,
    });

    await expect(service.findPublic(query)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.findPublic).not.toHaveBeenCalled();
  });

  it('returns not found for an inactive or missing public property', async () => {
    repository.findPublicById.mockResolvedValue(null);

    await expect(service.findPublicById(property.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('allows the owner to update a property', async () => {
    repository.findById.mockResolvedValue(property);
    repository.update.mockResolvedValue({ ...property, title: 'Updated home' });

    const result = await service.update(owner, property.id, {
      title: 'Updated home',
    });

    expect(result.title).toBe('Updated home');
    expect(repository.update).toHaveBeenCalledWith(property.id, {
      title: 'Updated home',
    });
  });

  it('prevents a different agent from changing a property', async () => {
    repository.findById.mockResolvedValue(property);

    await expect(
      service.update(
        { ...owner, id: '08259aea-e3c7-4c58-8638-c4ef32e860cd' },
        property.id,
        { title: 'Unauthorized change' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
