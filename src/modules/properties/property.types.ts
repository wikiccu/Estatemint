import { Prisma } from '@prisma/client';

export const propertyInclude = {
  owner: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
  images: { orderBy: { sortOrder: 'asc' as const } },
  _count: { select: { favorites: true } },
} satisfies Prisma.PropertyInclude;

export type PropertyEntity = Prisma.PropertyGetPayload<{
  include: typeof propertyInclude;
}>;

export interface PropertyResponse {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: PropertyEntity['currency'];
  city: string;
  address: string;
  type: PropertyEntity['type'];
  status: PropertyEntity['status'];
  area: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  yearBuilt: number | null;
  ownerId: string;
  owner: PropertyEntity['owner'];
  images: PropertyEntity['images'];
  favoriteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const toPropertyResponse = (
  property: PropertyEntity,
): PropertyResponse => ({
  id: property.id,
  title: property.title,
  description: property.description,
  price: property.price.toString(),
  currency: property.currency,
  city: property.city,
  address: property.address,
  type: property.type,
  status: property.status,
  area: property.area,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  parkingSpaces: property.parkingSpaces,
  yearBuilt: property.yearBuilt,
  ownerId: property.ownerId,
  owner: property.owner,
  images: property.images,
  favoriteCount: property._count.favorites,
  createdAt: property.createdAt,
  updatedAt: property.updatedAt,
});
