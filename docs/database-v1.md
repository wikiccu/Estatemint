# EstateMint Database v1

EstateMint uses PostgreSQL with Prisma as the database toolkit. This gives the project a typed schema, versioned migrations, generated TypeScript client, and a repeatable seed workflow.

## Connection Model

The application keeps two forms of database configuration:

- Split variables such as `DATABASE_HOST`, `DATABASE_PORT`, and `DATABASE_NAME`.
- `DATABASE_URL`, consumed directly by Prisma.

The split variables are still useful for Docker Compose readability and health checks. `DATABASE_URL` is configured directly because Prisma CLI commands, Prisma Client, Prisma Studio, and migrations all expect a single connection URL.

Docker Compose value:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/estatemint?schema=public
```

Host-machine value when running NestJS directly:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/estatemint?schema=public
```

## Prisma Files

- `prisma/schema.prisma`: source of truth for models, enums, relations, indexes, and constraints.
- `prisma/migrations/20260624000000_init_database_schema/migration.sql`: initial SQL migration.
- `prisma/seed.ts`: sample development data.
- `src/database/database.module.ts`: NestJS database module.
- `src/database/prisma.service.ts`: reusable Prisma Client provider.

## Models

### User

Represents platform identities for buyers, sellers, agents, and admins.

Important fields:

- `email` is unique.
- `passwordHash` stores hashed passwords only.
- `role` uses `UserRole`.
- `isActive` supports account disabling without deleting data.

The NestJS users foundation exposes safe user objects that omit `passwordHash` by default. Future authentication code may request internal password data deliberately, but normal service responses should not carry credential material.

### Property

Represents a real estate listing.

Important fields:

- `ownerId` links each property to a user.
- `price` uses a decimal column for money-safe storage.
- `currency`, `type`, and `status` use enums for consistent filtering.
- `city`, `price`, `type`, `status`, and `ownerId` are indexed for common listing queries.

### PropertyImage

Stores ordered image metadata for properties. Images cascade when a property is deleted.

### Favorite

Connects users to saved properties. The pair `userId + propertyId` is unique so a user cannot favorite the same property twice.

### Appointment

Stores visit requests for properties. Appointments include a scheduled time, status, optional message, and relations to both user and property.

## Enums

- `UserRole`: `BUYER`, `SELLER`, `AGENT`, `ADMIN`
- `Currency`: `USD`, `EUR`, `GBP`
- `PropertyType`: `HOUSE`, `APARTMENT`, `CONDO`, `TOWNHOUSE`, `LAND`, `COMMERCIAL`
- `PropertyStatus`: `DRAFT`, `ACTIVE`, `PENDING`, `SOLD`, `ARCHIVED`
- `AppointmentStatus`: `REQUESTED`, `CONFIRMED`, `CANCELLED`, `COMPLETED`

## Migrations

Run a development migration after PostgreSQL is available:

```bash
npm run prisma:migrate:dev
```

Apply committed migrations in production or CI-like environments:

```bash
npm run prisma:migrate:deploy
```

Check migration status:

```bash
npm run prisma:migrate:status
```

Migration commands require a reachable PostgreSQL database. If Docker Desktop is not running, Prisma can still validate and generate, but migration status/apply commands will fail to connect.

## Prisma Client

Generate Prisma Client after schema changes:

```bash
npm run prisma:generate
```

The generated client is used by `PrismaService` and future feature modules.

## Seed Data

Seed the database after migrations:

```bash
npm run prisma:seed
```

The seed creates:

- one admin user
- one agent user
- one buyer user
- sample properties
- sample property images
- a favorite
- an appointment request

The seed hashes its temporary development password with the same bcrypt cost used by the application password service. Runtime registration and login are owned by the auth module; the seed keeps its hashing local so it can run without bootstrapping NestJS.

Development seed password:

```text
Password123!
```

## Prisma Studio

Open Prisma Studio for local inspection:

```bash
npm run prisma:studio
```

Use Studio only for local development and debugging, not as an operational admin interface.
