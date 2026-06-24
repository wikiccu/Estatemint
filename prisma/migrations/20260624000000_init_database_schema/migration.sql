-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUYER', 'SELLER', 'AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PENDING', 'SOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'BUYER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "area" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "parkingSpaces" INTEGER NOT NULL DEFAULT 0,
    "yearBuilt" INTEGER,
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_images" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "propertyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'REQUESTED',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "properties_city_idx" ON "properties"("city");

-- CreateIndex
CREATE INDEX "properties_price_idx" ON "properties"("price");

-- CreateIndex
CREATE INDEX "properties_type_idx" ON "properties"("type");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "properties_ownerId_idx" ON "properties"("ownerId");

-- CreateIndex
CREATE INDEX "property_images_propertyId_idx" ON "property_images"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_propertyId_key" ON "favorites"("userId", "propertyId");

-- CreateIndex
CREATE INDEX "favorites_propertyId_idx" ON "favorites"("propertyId");

-- CreateIndex
CREATE INDEX "appointments_userId_idx" ON "appointments"("userId");

-- CreateIndex
CREATE INDEX "appointments_propertyId_idx" ON "appointments"("propertyId");

-- CreateIndex
CREATE INDEX "appointments_scheduledAt_idx" ON "appointments"("scheduledAt");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
