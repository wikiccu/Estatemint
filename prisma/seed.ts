import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  PropertyStatus,
  PropertyType,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl === undefined) {
  throw new Error('DATABASE_URL is required to seed the database.');
}

const adapter = new PrismaPg(databaseUrl);
const prisma = new PrismaClient({ adapter });
const seedPassword = 'Password123!';

async function main() {
  const passwordHash = await bcrypt.hash(seedPassword, 12);
  const samplePropertyTitles = [
    'Modern Downtown Condo',
    'Family Home With Garden',
  ];

  await prisma.property.deleteMany({
    where: {
      title: {
        in: samplePropertyTitles,
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@estatemint.local' },
    update: {},
    create: {
      email: 'admin@estatemint.local',
      passwordHash,
      firstName: 'EstateMint',
      lastName: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@estatemint.local' },
    update: {},
    create: {
      email: 'agent@estatemint.local',
      passwordHash,
      firstName: 'Ava',
      lastName: 'Agent',
      role: UserRole.AGENT,
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@estatemint.local' },
    update: {},
    create: {
      email: 'buyer@estatemint.local',
      passwordHash,
      firstName: 'Ben',
      lastName: 'Buyer',
      role: UserRole.BUYER,
    },
  });

  const downtownCondo = await prisma.property.create({
    data: {
      title: 'Modern Downtown Condo',
      description:
        'Bright two-bedroom condo near transit, restaurants, and business districts.',
      price: '425000.00',
      city: 'Austin',
      address: '1200 Market Street',
      type: PropertyType.CONDO,
      status: PropertyStatus.ACTIVE,
      area: 1180,
      bedrooms: 2,
      bathrooms: 2,
      parkingSpaces: 1,
      yearBuilt: 2019,
      ownerId: agent.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
            alt: 'Open living room with city view',
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85',
            alt: 'Modern kitchen with island',
            sortOrder: 1,
          },
        ],
      },
    },
  });

  const familyHouse = await prisma.property.create({
    data: {
      title: 'Family Home With Garden',
      description:
        'Comfortable detached house with a private garden and flexible office space.',
      price: '675000.00',
      city: 'Denver',
      address: '88 Maple Ridge Road',
      type: PropertyType.HOUSE,
      status: PropertyStatus.ACTIVE,
      area: 2450,
      bedrooms: 4,
      bathrooms: 3,
      parkingSpaces: 2,
      yearBuilt: 2012,
      ownerId: agent.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
            alt: 'Front exterior with landscaped garden',
            sortOrder: 0,
          },
        ],
      },
    },
  });

  await prisma.favorite.upsert({
    where: {
      userId_propertyId: {
        userId: buyer.id,
        propertyId: downtownCondo.id,
      },
    },
    update: {},
    create: {
      userId: buyer.id,
      propertyId: downtownCondo.id,
    },
  });

  await prisma.appointment.create({
    data: {
      userId: buyer.id,
      propertyId: familyHouse.id,
      scheduledAt: new Date('2026-07-01T15:00:00.000Z'),
      message: 'I would like to tour this home next week.',
    },
  });

  console.log({
    message: 'Database seeded successfully',
    users: [admin.email, agent.email, buyer.email],
    password: seedPassword,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
