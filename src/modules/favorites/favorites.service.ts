import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertiesRepository } from '../properties/properties.repository';
import {
  PropertyResponse,
  toPropertyResponse,
} from '../properties/property.types';
import { FavoritesRepository } from './favorites.repository';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly favoritesRepository: FavoritesRepository,
    private readonly propertiesRepository: PropertiesRepository,
  ) {}

  async findAll(userId: string): Promise<PropertyResponse[]> {
    const properties = await this.favoritesRepository.findProperties(userId);
    return properties.map(toPropertyResponse);
  }

  async add(userId: string, propertyId: string): Promise<PropertyResponse> {
    const property = await this.propertiesRepository.findPublicById(propertyId);

    if (property === null) {
      throw new NotFoundException('Property was not found.');
    }

    await this.favoritesRepository.add(userId, propertyId);
    return toPropertyResponse(property);
  }

  async remove(userId: string, propertyId: string): Promise<{ removed: true }> {
    await this.favoritesRepository.remove(userId, propertyId);
    return { removed: true };
  }
}
