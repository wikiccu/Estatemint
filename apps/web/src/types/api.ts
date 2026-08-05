export type UserRole = 'BUYER' | 'SELLER' | 'AGENT' | 'ADMIN';
export type PropertyType =
  | 'HOUSE'
  | 'APARTMENT'
  | 'CONDO'
  | 'TOWNHOUSE'
  | 'LAND'
  | 'COMMERCIAL';
export type PropertyStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PENDING'
  | 'SOLD'
  | 'ARCHIVED';
export type Currency = 'USD' | 'EUR' | 'GBP';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  propertyId: string;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: Currency;
  city: string;
  address: string;
  type: PropertyType;
  status: PropertyStatus;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  yearBuilt: number | null;
  ownerId: string;
  owner: Pick<User, 'id' | 'firstName' | 'lastName' | 'role'>;
  images: PropertyImage[];
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyPage {
  items: Property[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Appointment {
  id: string;
  userId: string;
  propertyId: string;
  scheduledAt: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  message: string | null;
  property: Pick<
    Property,
    'id' | 'title' | 'city' | 'address' | 'price' | 'currency' | 'images'
  >;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  errors?: Array<{ field: string; messages: string[] }>;
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  price: number;
  currency: Currency;
  city: string;
  address: string;
  type: PropertyType;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  yearBuilt?: number;
  imageUrls?: string[];
}
