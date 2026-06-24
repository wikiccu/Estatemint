# EstateMint

EstateMint is an open-source real estate marketplace platform designed to modernize property discovery, listing, and transaction workflows. We are building EstateMint publicly to showcase product strategy, software architecture, and scalable platform design for residential and commercial real estate markets.

## Project Overview

EstateMint is a digital marketplace tailored for property buyers, sellers, real estate agents, and administrators. It combines modern web architecture, a scalable backend foundation, and thoughtful domain design to support the full lifecycle of property marketing and discovery.

## Vision Summary

EstateMint aims to become a trusted digital infrastructure for real estate transactions by delivering a secure, transparent, and high-performance marketplace experience. We are focused on engineering a platform that is easy to extend, easy to maintain, and capable of evolving from a monolith into a distributed system as demand grows.

## Tech Stack

- NestJS
- PostgreSQL
- Redis
- Docker
- TypeScript
- Monorepo Architecture

## Runtime Requirements

- Node.js 22 or newer
- npm 10 or newer
- Docker and Docker Compose for containerized local development

## Configuration

EstateMint uses a global NestJS configuration module backed by `@nestjs/config` and Joi validation. Environment variables are loaded during application bootstrap and validated before the server starts, so missing or invalid infrastructure settings fail fast.

For Docker Compose development, copy `.env.example` to `.env` and run the stack. The example file uses Docker service hostnames such as `postgres` and `redis`. If you run the NestJS app directly on your host machine while keeping PostgreSQL and Redis in Docker, use `localhost` for those host values instead. See [docs/configuration.md](docs/configuration.md) for the full configuration workflow, validation rules, and guidance for adding new environment variables.

## API Standards

Application routes are versioned under `/api/v1`, while Swagger is available at `/docs`. Global validation and error formatting are configured during bootstrap so modules share the same request and response behavior. See [docs/api-standards.md](docs/api-standards.md) for the details.

## Database

EstateMint uses Prisma with PostgreSQL. The application keeps split database environment variables for operational checks and Docker readability, while Prisma uses `DATABASE_URL` directly.

Common commands:

- `npm run prisma:generate`
- `npm run prisma:migrate:dev`
- `npm run prisma:migrate:deploy`
- `npm run prisma:migrate:status`
- `npm run prisma:seed`
- `npm run prisma:studio`

Migrations and seeding require a running PostgreSQL database. See [docs/database-v1.md](docs/database-v1.md) for schema design, local setup notes, and seed data details.

## Health Checks

EstateMint exposes public health endpoints for operations and monitoring:

- `GET /api/v1/health`
- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`

These endpoints are designed for Docker, Kubernetes, load balancers, and external monitoring systems. See [docs/health-checks.md](docs/health-checks.md) for response examples and probe guidance.

## High-Level Architecture

EstateMint starts as a modular monolith with clear domain boundaries. Core modules include:

- Authentication & authorization
- Property management
- Search and discovery
- Favorites and saved items
- Notifications

The architecture is intentionally designed to support future extraction into microservices and federated APIs.

## Development Philosophy

- Domain-first design: Build features around clear user roles and business workflows.
- Incremental scaling: Ship a high-quality modular monolith, then extract services as needed.
- Public iteration: Document technical decisions openly and welcome contribution from the community.
- Reliability mindset: Prioritize data integrity, security, and predictable behavior.

## Roadmap Summary

EstateMint will evolve through a sequence of foundational phases:

1. Foundation: Establish project structure, core database models, and developer environment.
2. Authentication: Implement secure sign-up, sign-in, and role-based access control.
3. Property Management: Build property creation, listing, and lifecycle workflows.
4. Search: Add faceted search, filtering, and relevance ranking.
5. Favorites: Enable users to save and revisit properties.
6. Notifications: Provide event-driven notifications and alerts.
7. Analytics: Capture marketplace metrics and usage insights.
8. Scaling & Infrastructure: Harden deployment, observability, and horizontal scaling.

## Contribution

EstateMint is built to be open and collaborative.

- Check the issue tracker for milestone-aligned tasks.
- Follow the repository contribution guidelines for code quality and PR expectations.
- Contribute to product, architecture, documentation, and developer experience.

If you are interested in architecture, distributed systems, or modern TypeScript platforms, EstateMint is an ideal place to contribute and learn.
