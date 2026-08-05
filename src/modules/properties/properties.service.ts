import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertyQueryDto } from './dto/property-query.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertiesRepository } from './properties.repository';
import { PropertyResponse, toPropertyResponse } from './property.types';

export interface PropertyPage {
  items: PropertyResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class PropertiesService {
  constructor(private readonly repository: PropertiesRepository) {}

  async findPublic(query: PropertyQueryDto): Promise<PropertyPage> {
    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      query.minPrice > query.maxPrice
    ) {
      throw new BadRequestException(
        'Minimum price cannot be greater than maximum price.',
      );
    }

    const result = await this.repository.findPublic(query);

    return {
      items: result.items.map(toPropertyResponse),
      page: query.page,
      pageSize: query.pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / query.pageSize),
    };
  }

  async findPublicById(id: string): Promise<PropertyResponse> {
    const property = await this.repository.findPublicById(id);

    if (property === null) {
      throw new NotFoundException('Property was not found.');
    }

    return toPropertyResponse(property);
  }

  async findMine(userId: string): Promise<PropertyResponse[]> {
    const properties = await this.repository.findByOwner(userId);
    return properties.map(toPropertyResponse);
  }

  async create(
    user: AuthenticatedUser,
    input: CreatePropertyDto,
  ): Promise<PropertyResponse> {
    return toPropertyResponse(await this.repository.create(user.id, input));
  }

  async update(
    user: AuthenticatedUser,
    id: string,
    input: UpdatePropertyDto,
  ): Promise<PropertyResponse> {
    await this.assertCanManage(user, id);
    return toPropertyResponse(await this.repository.update(id, input));
  }

  async archive(
    user: AuthenticatedUser,
    id: string,
  ): Promise<PropertyResponse> {
    await this.assertCanManage(user, id);
    return toPropertyResponse(await this.repository.archive(id));
  }

  private async assertCanManage(
    user: AuthenticatedUser,
    id: string,
  ): Promise<void> {
    const property = await this.repository.findById(id);

    if (property === null) {
      throw new NotFoundException('Property was not found.');
    }

    if (property.ownerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot manage this property.');
    }
  }
}
