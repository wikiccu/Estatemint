# EstateMint

EstateMint is a full-stack real estate marketplace for discovering active properties, building a personal shortlist, requesting tours, and publishing listings. It pairs a responsive Next.js application with a modular NestJS API and is structured for a Netlify frontend plus a separately hosted API.

![EstateMint social preview](apps/web/public/og.png)

## Features

- Search active properties by keyword, city, type, price, bedrooms, and sort order
- View pricing, property facts, photography, ownership context, and listing details
- Register, sign in, restore a session, sign out, and handle expired JWTs
- Save and remove favorite properties
- Request a future tour and review tour status from a personal dashboard
- Publish and archive listings as a seller, agent, or administrator
- Enforce listing ownership and role permissions in the API
- Browse responsive loading, empty, validation, success, error, and not-found states
- Inspect the live OpenAPI documentation at `/docs` on the API host

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js 16 App Router, React 19, TypeScript, CSS |
| API | NestJS 11, Passport JWT, Swagger/OpenAPI |
| Data | PostgreSQL 17, Prisma 7 |
| Infrastructure | Redis 8, Docker Compose |
| Quality | ESLint, Prettier, Jest, Supertest, Vitest, GitHub Actions |
| Frontend hosting | Netlify static hosting (no Netlify Functions) |

## Architecture

EstateMint is an npm-workspace monorepo. The API remains at the repository root to preserve the original NestJS history, while the Next.js application lives in `apps/web`.

```text
.
├── apps/web/                  # Next.js frontend
│   ├── public/                # Public assets and social card
│   └── src/
│       ├── app/               # App Router pages and layouts
│       ├── components/        # Reusable product UI
│       ├── lib/               # API client and format helpers
│       └── types/             # Frontend API contracts
├── prisma/                    # Schema, migrations, and development seed
├── src/                       # NestJS API
│   ├── common/                # Error and validation standards
│   ├── config/                # Validated environment configuration
│   ├── database/              # Prisma lifecycle integration
│   └── modules/               # Auth, users, properties, favorites, tours, health
├── test/                      # API integration tests
├── docs/                      # Product and API architecture notes
├── .github/workflows/ci.yml   # Pull-request and main-branch validation
└── netlify.toml               # Netlify frontend build settings
```

The browser calls the API through `NEXT_PUBLIC_API_BASE_URL`. JWT access tokens are held in memory and mirrored to `sessionStorage` for tab-scoped persistence, then sent only through the `Authorization` header. The backend should be deployed as a conventional long-running Node service; it is not packaged as a Netlify Function.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- Docker and Docker Compose for local PostgreSQL and Redis

## Local setup

1. Install dependencies from the repository root:

   ```bash
   npm ci
   ```

2. Create local environment files:

   ```bash
   cp .env.example .env
   cp apps/web/.env.example apps/web/.env.local
   ```

3. When the API runs on the host, change `DATABASE_HOST`, `DATABASE_URL`, and `REDIS_HOST` in `.env` from the Docker service names to `localhost`.

4. Start PostgreSQL and Redis:

   ```bash
   docker compose up -d
   ```

5. Generate the Prisma client, apply migrations, and add development data:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate:deploy
   npm run prisma:seed
   ```

6. Start both applications:

   ```bash
   npm run dev
   ```

The frontend runs at `http://localhost:3001`, the API at `http://localhost:3000/api/v1`, and Swagger at `http://localhost:3000/docs`.

### Safe development accounts

The development seed creates buyer, agent, and administrator accounts with the password `Password123!`. These credentials are development-only and must never be used in production.

| Role | Email |
| --- | --- |
| Buyer | `buyer@estatemint.local` |
| Agent | `agent@estatemint.local` |
| Administrator | `admin@estatemint.local` |

## Environment variables

### API (`.env`)

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | API listening port |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins; include the final Netlify origin |
| `JWT_SECRET` | Private JWT signing secret with at least 32 characters |
| `JWT_EXPIRES_IN` | Access-token lifetime such as `15m` |
| `DATABASE_HOST` | PostgreSQL host used by health checks |
| `DATABASE_PORT` | PostgreSQL port |
| `DATABASE_NAME` | PostgreSQL database name |
| `DATABASE_USER` | PostgreSQL user |
| `DATABASE_PASSWORD` | PostgreSQL password |
| `DATABASE_URL` | Prisma PostgreSQL connection URL |
| `REDIS_HOST` | Redis host used by health checks |
| `REDIS_PORT` | Redis port |

### Frontend (`apps/web/.env.local` or Netlify)

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Full public API prefix, for example `https://YOUR-BACKEND-DOMAIN.example.com/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical frontend URL used for absolute social metadata |

Never commit real secrets. All `.env` and local/production variants are ignored; the committed example files contain development values or safe placeholders only.

## Database and migrations

The initial migration defines users, properties, property images, favorites, and appointments. Apply committed migrations in production with:

```bash
npm run prisma:migrate:deploy
```

Use `npm run prisma:migrate:dev` only when authoring a migration locally. The seed is idempotent for its sample users and property titles, and is intended for local demonstrations rather than production.

See [database notes](docs/database-v1.md) for the domain model and constraints.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run API and frontend together |
| `npm run dev:api` | Run only NestJS in watch mode |
| `npm run dev:web` | Run only Next.js on port 3001 |
| `npm run build` | Build API and frontend |
| `npm run build:api` | Build only the API |
| `npm run build:web` | Build only the frontend |
| `npm run lint` | Lint both applications without rewriting files |
| `npm run typecheck` | Strictly type-check both applications |
| `npm test` | Run API unit tests and frontend tests |
| `npm run test:e2e` | Run API integration tests |
| `npm run prisma:studio` | Inspect local data in Prisma Studio |

## API documentation

When the API is running, interactive OpenAPI documentation is available at `/docs`. Routes are versioned under `/api/v1`.

Core route groups:

- `/auth`: register, login, current user
- `/properties`: public search/details and protected listing management
- `/favorites`: protected shortlist management
- `/appointments`: protected tour requests and history
- `/health`: liveness and dependency readiness

See [client API guide](docs/client-api-guide.md) and [API standards](docs/api-standards.md) for response and error conventions.

## Production build

```bash
npm ci
npm run prisma:generate
npm run lint
npm run typecheck
npm test
npm run test:e2e -- --runInBand
npm run build
```

The API artifact is written to `dist/`. The frontend static export is written to `apps/web/out/`.

## Netlify deployment

The root [netlify.toml](netlify.toml) deliberately keeps dependency installation at the repository root so npm workspaces resolve correctly.

- Base directory: repository root (leave blank in the Netlify dashboard)
- Build command: `npm run build:web`
- Publish directory: `apps/web/out`
- Node.js: 22

Deployment steps:

1. Push the repository to GitHub and import it into Netlify.
2. Allow Netlify to read the root `netlify.toml`; do not set a conflicting base directory.
3. Add only `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SITE_URL` to the production environment. They are public browser configuration, not secrets.
4. Deploy the site through Netlify's Git integration.
5. Add the generated Netlify origin to the API's `CORS_ALLOWED_ORIGINS` and restart the API.

Do not add `DATABASE_*`, `JWT_*`, `REDIS_*`, `PORT`, or `CORS_ALLOWED_ORIGINS` to Netlify. Those values belong only on the separately hosted API. The frontend uses Next.js static export, so Netlify publishes HTML, CSS, and JavaScript without creating a backend function.

Netlify secret scanning remains enabled. The configuration excludes only the two intentional `NEXT_PUBLIC_*` values from value matching because Next.js must embed them in browser bundles; no backend secret keys or paths are excluded.

## Backend deployment

Deploy the NestJS API separately to a Node-compatible service such as Render, Railway, Fly.io, or a VPS/container platform. The host must provide PostgreSQL, Redis connectivity, HTTPS, all API environment variables, and a release step that runs `npm run prisma:migrate:deploy`.

Before production traffic:

- generate a strong, unique `JWT_SECRET`
- replace all development database credentials
- set `NODE_ENV=production`
- set `CORS_ALLOWED_ORIGINS` to explicit HTTPS frontend origins
- keep PostgreSQL and Redis off the public network where possible
- add provider-level rate limiting when running multiple API instances

## CI

GitHub Actions installs from the lockfile, generates Prisma, lints, type-checks, runs unit and integration tests, and builds both applications on pull requests and pushes to `main`.

## Live demo

Frontend: `https://YOUR-SITE.netlify.app`

Backend API: `https://YOUR-BACKEND-DOMAIN.example.com`

Replace these placeholders only after the services exist; no deployed URL is assumed by the codebase.

## Screenshots

The generated social preview above reflects the production visual system. Add real desktop and mobile captures here after the frontend has been deployed with a reachable API.

## Security notes

The current release validates request DTOs, strips unknown fields, hashes passwords with bcrypt, applies authentication throttling, enforces listing ownership and role checks, restricts CORS, avoids client-side protected-value trust, and returns safe error messages. `npm audit` is expected to report zero known vulnerabilities for the committed lockfile.

The in-process authentication throttle is suitable for a single API instance. A multi-instance production deployment should add a shared Redis-backed or edge/provider rate limit. Access tokens are tab-persistent bearer tokens; refresh-token rotation and server-managed sessions are not yet implemented.

## Known limitations

- Property photography accepts HTTPS URLs; direct file upload and media moderation are not implemented.
- Tour requests can be created and reviewed, but agent confirmation/cancellation workflows are not yet exposed.
- Search uses PostgreSQL filters rather than geographic radius or a dedicated search index.
- The API requires separately managed PostgreSQL and Redis services.
- Automated browser end-to-end tests are not included; API integration and frontend unit coverage protect the current core paths.

## Future improvements

- Add moderated image uploads backed by object storage
- Add seller/agent appointment status transitions and notifications
- Introduce refresh-token rotation and revocation
- Add geospatial search, map browsing, and saved searches
- Add browser-level accessibility and journey tests

## Contributing

Open a focused issue before a large change, keep migrations backward-compatible, and run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` before submitting a pull request.

## License

EstateMint is available under the [MIT License](LICENSE).
