# EstateMint Database v1

This document describes the initial database design for EstateMint. The schema is optimized for a modular monolith and prepares the platform for future growth.

## Initial Entities

### User

Represents platform participants and access control identities.

Fields:

- `id`: UUID, primary key
- `email`: string, unique, required
- `passwordHash`: string, required
- `firstName`: string
- `lastName`: string
- `role`: enum(`buyer`, `seller`, `agent`, `admin`)
- `status`: enum(`active`, `inactive`, `suspended`)
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `profileData`: JSONB, optional profile metadata

### Property

Represents a real estate listing that can be created by sellers or agents.

Fields:

- `id`: UUID, primary key
- `ownerId`: UUID, foreign key to `User.id`
- `agentId`: UUID, foreign key to `User.id`, nullable
- `title`: string, required
- `description`: text
- `price`: decimal
- `currency`: string, default `USD`
- `propertyType`: enum(`house`, `apartment`, `condo`, `land`, `commercial`)
- `status`: enum(`draft`, `active`, `pending`, `sold`, `archived`)
- `address`: string
- `city`: string
- `state`: string
- `postalCode`: string
- `country`: string
- `bedrooms`: integer
- `bathrooms`: integer
- `squareFeet`: integer
- `lotSize`: decimal, nullable
- `yearBuilt`: integer, nullable
- `listingMetadata`: JSONB
- `createdAt`: timestamp
- `updatedAt`: timestamp

### PropertyImage

Stores image records for each property listing.

Fields:

- `id`: UUID, primary key
- `propertyId`: UUID, foreign key to `Property.id`
- `url`: string, required
- `altText`: string
- `order`: integer, default 0
- `isPrimary`: boolean, default false
- `createdAt`: timestamp

### Favorite

Captures user favorites and watchlist items.

Fields:

- `id`: UUID, primary key
- `userId`: UUID, foreign key to `User.id`
- `propertyId`: UUID, foreign key to `Property.id`
- `createdAt`: timestamp

## Relationships

- `User` has many `Property` through `ownerId`.
- `User` may be assigned to many `Property` entities as `agentId`.
- `Property` has many `PropertyImage` records.
- `User` has many `Favorite` records.
- `Property` has many `Favorite` records.

### Referential integrity

- Deleting a `User` should be handled carefully. Use soft delete or status flags for user accounts rather than cascading deletes.
- Deleting a `Property` should remove associated `PropertyImage` records and preserve historical data in analytics tables.

## Future Entities

The first version focuses on the core marketplace data model. Future additions include:

- `Inquiry`: buyer inquiries and lead capture data.
- `ListingStatusHistory`: an audit trail for property status changes.
- `Notification`: persisted notification events and delivery state.
- `SearchIndex`: materialized search records or denormalized search documents.
- `AnalyticsEvent`: market activity and engagement telemetry.
- `Subscription`: notification and communication preferences.
- `AuditLog`: platform-wide operational history for security and compliance.

The v1 schema is intentionally narrow to keep the MVP focused while enabling safe expansion into richer data domains.