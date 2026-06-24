# EstateMint Roadmap

EstateMint is organized into eight phases that build from foundation to scale. Each phase delivers user value while preserving architecture flexibility.

## Phase 1: Foundation

- Establish repository structure and monorepo tooling.
- Define core domain models and database schema.
- Set up Docker-based local development environment.
- Create baseline NestJS application and shared libraries.
- Implement CI checks for linting, formatting, and unit tests.

## Phase 2: Authentication

- Build the internal Users module foundation before exposing authentication endpoints.
- Implement secure registration and login flows.
- Add JWT authentication and current-user lookup.
- Add role-based access controls for buyer, seller, agent, and admin personas.
- Support Redis-backed session management if refresh tokens or token revocation are introduced.
- Introduce user profile management and account status.

## Phase 3: Property Management

- Build property creation, editing, publishing, and archival workflows.
- Model property metadata, pricing, status, and location details.
- Add support for property image uploads and management.
- Introduce ownership and listing assignment for agents and sellers.

## Phase 4: Search

- Implement property search with filtering by location, price, type, and status.
- Build a search module optimized for extensibility and future indexing.
- Add relevance ranking and support for paginated search results.
- Introduce caching strategies for common search queries.

## Phase 5: Favorites

- Enable buyers to save and revisit properties.
- Provide user-specific favorites collection and status indicators.
- Integrate favorites into property listing views.
- Introduce rudimentary watchlists and saved search hooks.

## Phase 6: Notifications

- Add event-driven notification infrastructure.
- Deliver email or in-app notifications for listing updates and inquiry responses.
- Build a notifications module with pluggable channels.
- Support notification preferences and basic subscription management.

## Phase 7: Analytics

- Add marketplace usage metrics and dashboard insights.
- Track property views, favorites activity, and listing performance.
- enable admin visibility into platform adoption and engagement.
- Instrument key backend operations for performance monitoring.

## Phase 8: Scaling & Infrastructure

- Harden deployment with Docker production patterns.
- Add monitoring, logging, and tracing support.
- Prepare the architecture for microservice extraction.
- Optimize database schema, query performance, and cache usage.
- Validate the platform under higher load through performance testing.
