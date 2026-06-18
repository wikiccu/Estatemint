# Configuration

EstateMint uses `@nestjs/config` as a dedicated, global configuration layer. The application loads environment variables once during bootstrap, validates them before the HTTP server starts, and exposes typed configuration namespaces through Nest's `ConfigService`.

## File Structure

Configuration lives under `src/config/`:

- `app.config.ts`: application runtime settings such as `NODE_ENV` and `PORT`.
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

Then update values as needed for your local machine:

```dotenv
NODE_ENV=development
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=app_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6379
```

The `.env` file is intentionally not committed. Keep real credentials in local environment files, deployment secrets, or platform-managed secret stores.

## Validation

Environment validation is defined in `src/config/env.validation.ts` with Joi. Validation runs during application bootstrap through `ConfigModule.forRoot()`.

If a required variable is missing, has the wrong type, or uses an unsupported value, Nest fails fast and the application does not start. This protects production deployments from booting with partial infrastructure settings.

Validation currently requires:

- `NODE_ENV`: one of `development`, `test`, or `production`.
- `PORT`: valid TCP port.
- `DATABASE_HOST`: PostgreSQL hostname.
- `DATABASE_PORT`: valid TCP port.
- `DATABASE_NAME`: PostgreSQL database name.
- `DATABASE_USER`: PostgreSQL username.
- `DATABASE_PASSWORD`: PostgreSQL password.
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
