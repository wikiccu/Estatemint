import { Injectable } from '@nestjs/common';
import { Prisma, PropertyStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertyQueryDto, PropertySort } from './dto/property-query.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyEntity, propertyInclude } from './property.types';

@Injectable()
export class PropertiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic(query: PropertyQueryDto): Promise<{
    items: PropertyEntity[];
    total: number;
  }> {
    const where: Prisma.PropertyWhereInput = {
      status: PropertyStatus.ACTIVE,
      ...(query.city === undefined
        ? {}
        : { city: { contains: query.city.trim(), mode: 'insensitive' } }),
      ...(query.type === undefined ? {} : { type: query.type }),
      ...(query.bedrooms === undefined
        ? {}
        : { bedrooms: { gte: query.bedrooms } }),
      ...(query.minPrice === undefined && query.maxPrice === undefined
        ? {}
        : {
            price: {
              ...(query.minPrice === undefined ? {} : { gte: query.minPrice }),
              ...(query.maxPrice === undefined ? {} : { lte: query.maxPrice }),
            },
          }),
      ...(query.search === undefined || query.search.trim() === ''
        ? {}
        : {
            OR: [
              {
                title: {
                  contains: query.search.trim(),
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: query.search.trim(),
                  mode: 'insensitive',
                },
              },
            ],
          }),
    };
    const orderBy: Prisma.PropertyOrderByWithRelationInput =
      query.sort === PropertySort.PRICE_ASC
        ? { price: 'asc' }
        : query.sort === PropertySort.PRICE_DESC
          ? { price: 'desc' }
          : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: propertyInclude,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.property.count({ where }),
    ]);

    return { items, total };
  }

  findPublicById(id: string): Promise<PropertyEntity | null> {
    return this.prisma.property.findFirst({
      where: { id, status: PropertyStatus.ACTIVE },
      include: propertyInclude,
    });
  }

  findById(id: string): Promise<PropertyEntity | null> {
    return this.prisma.property.findUnique({
      where: { id },
      include: propertyInclude,
    });
  }

  findByOwner(ownerId: string): Promise<PropertyEntity[]> {
    return this.prisma.property.findMany({
      where: { ownerId },
      include: propertyInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  create(ownerId: string, input: CreatePropertyDto): Promise<PropertyEntity> {
    const { imageUrls, ...data } = input;

    return this.prisma.property.create({
      data: {
        ...data,
        ownerId,
        status: PropertyStatus.ACTIVE,
        images:
          imageUrls === undefined
            ? undefined
            : {
                create: imageUrls.map((url, sortOrder) => ({ url, sortOrder })),
              },
      },
      include: propertyInclude,
    });
  }

  update(id: string, input: UpdatePropertyDto): Promise<PropertyEntity> {
    const { imageUrls, ...data } = input;

    return this.prisma.property.update({
      where: { id },
      data: {
        ...data,
        images:
          imageUrls === undefined
            ? undefined
            : {
                deleteMany: {},
                create: imageUrls.map((url, sortOrder) => ({ url, sortOrder })),
              },
      },
      include: propertyInclude,
    });
  }

  archive(id: string): Promise<PropertyEntity> {
    return this.prisma.property.update({
      where: { id },
      data: { status: PropertyStatus.ARCHIVED },
      include: propertyInclude,
    });
  }
}
