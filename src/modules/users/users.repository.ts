import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: this.normalizeEmail(email) },
    });
  }

  create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        email: this.normalizeEmail(data.email),
      },
    });
  }

  update(id: string, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data:
        data.email === undefined
          ? data
          : {
              ...data,
              email: this.normalizeEmail(data.email),
            },
    });
  }

  deactivate(id: string): Promise<User> {
    return this.update(id, { isActive: false });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
