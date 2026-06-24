import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SafeUser, toSafeUser } from './types/safe-user.type';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string): Promise<SafeUser | null> {
    const user = await this.usersRepository.findById(id);

    return user === null ? null : toSafeUser(user);
  }

  async findByEmail(email: string): Promise<SafeUser | null> {
    const user = await this.usersRepository.findByEmail(email);

    return user === null ? null : toSafeUser(user);
  }

  async createUser(data: CreateUserDto): Promise<SafeUser> {
    const existingUser = await this.usersRepository.findByEmail(data.email);

    if (existingUser !== null) {
      throw new ConflictException('A user with this email already exists.');
    }

    try {
      const user = await this.usersRepository.create(data);

      return toSafeUser(user);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<SafeUser> {
    try {
      const user = await this.usersRepository.update(id, data);

      return toSafeUser(user);
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async deactivateUser(id: string): Promise<SafeUser> {
    try {
      const user = await this.usersRepository.deactivate(id);

      return toSafeUser(user);
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('A user with this email already exists.');
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException(
        id === undefined ? 'User was not found.' : `User ${id} was not found.`,
      );
    }

    throw error;
  }
}
