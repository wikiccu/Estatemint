# Configuration

EstateMint uses `@nestjs/config` as a dedicated, global configuration layer. The application loads environment variables once during bootstrap, validates them before the HTTP server starts, and exposes typed configuration namespaces through Nest's `ConfigService`.

## File Structure

Configuration lives under `src/config/`:

- `app.config.ts`: application runtime settings such as `NODE_ENV`, `PORT`, and allowed browser origins.
- `auth.config.ts`: JWT authentication settings.
- `database.config.ts`: PostgreSQL connection settings.
- `redis.config.ts`: Redis connection settings.
- `env.validation.ts`: Joi schema for required environment variables.
- `config.module.ts`: global Nest configuration module.

The root `AppModule` imports `ConfigurationModule` once. Because the module is global, feature modules can inject `ConfigService` without importing `ConfigModule` repeatedly.

## Local Environment Setup

Create a local `.env` file from the example file:

```bash
cp .env.example .env
```

The checked-in `.env.example` is optimized for Docker Compose, where the API container reaches infrastructure through Docker service names:

```dotenv
NODE_ENV=development
PORT=3000
CORS_ALLOWED_ORIGINS=http://localhost:3001
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_EXPIRES_IN=15m

DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=estatemint
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/estatemint?schema=public

REDIS_HOST=redis
REDIS_PORT=6379
```

Use these database and Redis hostnames when the API itself runs inside a Docker network. The committed Compose file starts infrastructure only, so host-based API development should use `localhost` as described below.

If you run the NestJS app directly on your host machine with `npm run start:dev` while PostgreSQL and Redis are still provided by Docker Compose, change only the host values in your local `.env`:

```dotenv
DATABASE_HOST=localhost
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/estatemint?schema=public
REDIS_HOST=localhost
```

Keep `DATABASE_NAME=estatemint` so it matches the PostgreSQL database created by `docker-compose.yml`.

`DATABASE_URL` is configured directly rather than derived in application code. Prisma expects a single connection URL for migrations, client generation, Studio, and runtime database access. The split variables remain useful for Docker readability and low-level health checks.

The `.env` file is intentionally not committed. Keep real credentials in local environment files, deployment secrets, or platform-managed secret stores.

Create `apps/web/.env.local` from `apps/web/.env.example` for the Next.js application. `NEXT_PUBLIC_API_BASE_URL` must include `/api/v1`; `NEXT_PUBLIC_SITE_URL` should be the final public origin in production.

## Validation

Environment validation is defined in `src/config/env.validation.ts` with Joi. Validation runs during application bootstrap through `ConfigModule.forRoot()`.

If a required variable is missing, has the wrong type, or uses an unsupported value, Nest fails fast and the application does not start. This protects production deployments from booting with partial infrastructure settings.

Validation currently requires:

- `NODE_ENV`: one of `development`, `test`, or `production`.
- `PORT`: valid TCP port.
- `CORS_ALLOWED_ORIGINS`: comma-separated browser origins allowed to call the API.
- `JWT_SECRET`: secret key used to sign JWT access tokens.
- `JWT_EXPIRES_IN`: JWT access token lifetime, such as `15m`.
- `DATABASE_HOST`: PostgreSQL hostname.
- `DATABASE_PORT`: valid TCP port.
- `DATABASE_NAME`: PostgreSQL database name.
- `DATABASE_USER`: PostgreSQL username.
- `DATABASE_PASSWORD`: PostgreSQL password.
- `DATABASE_URL`: PostgreSQL connection URL consumed by Prisma.
- `REDIS_HOST`: Redis hostname.
- `REDIS_PORT`: valid TCP port.

## Consuming Configuration

Inject `ConfigService` into providers instead of reading `process.env` directly:

```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExampleService {
  constructor(private readonly configService: ConfigService) {}

  getDatabaseHost(): string {
    return this.configService.getOrThrow<string>('database.host');
  }
}
```

Centralizing access through `ConfigService` keeps modules testable and prevents scattered environment parsing.

## Adding New Variables

When adding a new environment variable:

1. Add it to `.env.example` with a safe placeholder value.
2. Add validation rules in `src/config/env.validation.ts`.
3. Add the parsed value to the appropriate typed config file, or create a new namespaced config file when it belongs to a new infrastructure concern.
4. Register any new config file in `src/config/config.module.ts`.
5. Consume it through `ConfigService` using the namespaced key.

This workflow keeps runtime configuration explicit, validated, and discoverable as EstateMint grows.
