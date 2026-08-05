import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PropertyEntity, propertyInclude } from '../properties/property.types';

@Injectable()
export class FavoritesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProperties(userId: string): Promise<PropertyEntity[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId, property: { status: 'ACTIVE' } },
      include: { property: { include: propertyInclude } },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((favorite) => favorite.property);
  }

  async add(userId: string, propertyId: string): Promise<void> {
    await this.prisma.favorite.upsert({
      where: { userId_propertyId: { userId, propertyId } },
      create: { userId, propertyId },
      update: {},
    });
  }

  async remove(userId: string, propertyId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({ where: { userId, propertyId } });
  }
}
