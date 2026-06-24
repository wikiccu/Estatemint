import { ConflictException } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

const user: User = {
  id: '4be327f8-7ad4-4e38-9557-f34efdd9e33c',
  email: 'agent@estatemint.local',
  passwordHash: 'hashed-password',
  firstName: 'Ava',
  lastName: 'Agent',
  role: UserRole.AGENT,
  isActive: true,
  createdAt: new Date('2026-06-24T10:00:00.000Z'),
  updatedAt: new Date('2026-06-24T10:00:00.000Z'),
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<
    Pick<
      UsersRepository,
      'findById' | 'findByEmail' | 'create' | 'update' | 'deactivate'
    >
  >;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deactivate: jest.fn(),
    };
    service = new UsersService(repository as UsersRepository);
  });

  it('finds a user by email and excludes passwordHash', async () => {
    repository.findByEmail.mockResolvedValue(user);

    const result = await service.findByEmail('agent@estatemint.local');

    expect(repository.findByEmail).toHaveBeenCalledWith(
      'agent@estatemint.local',
    );
    expect(result).toEqual({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('creates a user when email is available', async () => {
    const createUserDto: CreateUserDto = {
      email: 'buyer@estatemint.local',
      passwordHash: 'hashed-password',
      firstName: 'Ben',
      lastName: 'Buyer',
      role: UserRole.BUYER,
    };
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue({
      ...user,
      ...createUserDto,
      id: '5756dccc-f46c-4cba-8bfe-45d6bb1d8bb2',
    });

    const result = await service.createUser(createUserDto);

    expect(repository.create).toHaveBeenCalledWith(createUserDto);
    expect(result.email).toBe(createUserDto.email);
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('prevents creating a duplicate email', async () => {
    repository.findByEmail.mockResolvedValue(user);

    await expect(
      service.createUser({
        email: user.email,
        passwordHash: 'another-hash',
        firstName: 'Duplicate',
        lastName: 'User',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('deactivates a user and returns a safe user', async () => {
    repository.deactivate.mockResolvedValue({ ...user, isActive: false });

    const result = await service.deactivateUser(user.id);

    expect(repository.deactivate).toHaveBeenCalledWith(user.id);
    expect(result.isActive).toBe(false);
    expect(result).not.toHaveProperty('passwordHash');
  });
});
