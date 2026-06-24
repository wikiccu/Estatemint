import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PasswordService } from './password.service';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import type {
  SafeUser,
  UserWithPasswordHash,
} from '../users/types/safe-user.type';

const safeUser: SafeUser = {
  id: '29d1f79e-f706-447c-a9c9-aa3f941c43f6',
  email: 'buyer@estatemint.local',
  firstName: 'Ben',
  lastName: 'Buyer',
  role: UserRole.BUYER,
  isActive: true,
  createdAt: new Date('2026-06-24T12:00:00.000Z'),
  updatedAt: new Date('2026-06-24T12:00:00.000Z'),
};

const userWithPasswordHash: UserWithPasswordHash = {
  ...safeUser,
  passwordHash: 'hashed-password',
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<
    Pick<UsersService, 'createUser' | 'findByEmailForAuth' | 'findById'>
  >;
  let passwordService: jest.Mocked<Pick<PasswordService, 'hash' | 'verify'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  beforeEach(() => {
    usersService = {
      createUser: jest.fn(),
      findByEmailForAuth: jest.fn(),
      findById: jest.fn(),
    };
    passwordService = {
      hash: jest.fn(),
      verify: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
    };
    service = new AuthService(
      usersService as UsersService,
      passwordService as PasswordService,
      jwtService as JwtService,
    );
  });

  it('registers a user with a password hash and returns a safe user', async () => {
    passwordService.hash.mockResolvedValue('hashed-password');
    usersService.createUser.mockResolvedValue(safeUser);

    const result = await service.register({
      email: safeUser.email,
      password: 'Password123!',
      firstName: safeUser.firstName,
      lastName: safeUser.lastName,
    });

    expect(passwordService.hash).toHaveBeenCalledWith('Password123!');
    expect(usersService.createUser).toHaveBeenCalledWith({
      email: safeUser.email,
      passwordHash: 'hashed-password',
      firstName: safeUser.firstName,
      lastName: safeUser.lastName,
    });
    expect(result).toEqual(safeUser);
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('logs in with valid credentials', async () => {
    usersService.findByEmailForAuth.mockResolvedValue(userWithPasswordHash);
    usersService.findById.mockResolvedValue(safeUser);
    passwordService.verify.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('access-token');

    const result = await service.login({
      email: safeUser.email,
      password: 'Password123!',
    });

    expect(passwordService.verify).toHaveBeenCalledWith(
      'Password123!',
      userWithPasswordHash.passwordHash,
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    });
    expect(result).toEqual({
      accessToken: 'access-token',
      user: safeUser,
    });
  });

  it('rejects invalid credentials', async () => {
    usersService.findByEmailForAuth.mockResolvedValue(userWithPasswordHash);
    passwordService.verify.mockResolvedValue(false);

    await expect(
      service.login({ email: safeUser.email, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects inactive users', async () => {
    usersService.findByEmailForAuth.mockResolvedValue({
      ...userWithPasswordHash,
      isActive: false,
    });
    passwordService.verify.mockResolvedValue(true);

    await expect(
      service.login({ email: safeUser.email, password: 'Password123!' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
