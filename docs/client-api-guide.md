# Client API guide

This guide documents the production-facing HTTP contract used by the Next.js application in `apps/web`.

## Base URL

All application routes use the `/api/v1` prefix. Configure the browser with an environment-specific full prefix:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

Production code must not assume a host. Netlify should receive the public HTTPS API prefix through its environment settings.

## Request conventions

- Send and accept JSON.
- Send JWTs through `Authorization: Bearer <accessToken>`.
- Treat every non-2xx response as an error.
- Abort or time out requests that are no longer useful.
- Do not fetch the API while Next.js is building; current marketplace requests run in client components.

The frontend centralizes these rules in `apps/web/src/lib/api.ts`.

## Errors

Regular API errors use this shape:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/auth/register",
  "timestamp": "2026-08-05T12:00:00.000Z",
  "errors": [
    {
      "field": "email",
      "messages": ["email must be an email"]
    }
  ]
}
```

Use `errors` for field-level form feedback and `message` for a safe form-level fallback. Never display backend stack traces.

## Authentication

### Register

```http
POST /auth/register
```

```json
{
  "email": "buyer@example.com",
  "password": "Password123!",
  "firstName": "Ben",
  "lastName": "Buyer"
}
```

Public registration creates an active buyer. Passwords require 8–128 characters with upper and lowercase letters and a number.

### Login

```http
POST /auth/login
```

```json
{
  "email": "buyer@example.com",
  "password": "Password123!"
}
```

The response contains `accessToken` and a safe `user` object. Authentication endpoints apply a per-instance attempt limit.

### Current user

```http
GET /auth/me
Authorization: Bearer <accessToken>
```

Missing, invalid, expired, or deactivated sessions return `401`. The web application then clears its tab-scoped token state.

Refresh tokens are not part of the current access-token flow.

## Properties

### Search active properties

```http
GET /properties?search=garden&city=Denver&type=HOUSE&minPrice=250000&maxPrice=900000&bedrooms=3&sort=newest&page=1&pageSize=12
```

Supported `sort` values are `newest`, `price-asc`, and `price-desc`. `pageSize` is capped at 50. The result contains `items`, `page`, `pageSize`, `total`, and `totalPages`.

### Property detail

```http
GET /properties/:id
```

Only active properties are public. Missing or inactive IDs return `404`.

### Current user's listings

```http
GET /properties/mine
Authorization: Bearer <accessToken>
```

### Publish a property

```http
POST /properties
Authorization: Bearer <accessToken>
```

Seller, agent, or administrator role required. The API assigns ownership from the authenticated user; the client cannot choose `ownerId`.

### Update or archive

```http
PATCH /properties/:id
DELETE /properties/:id
Authorization: Bearer <accessToken>
```

Only the owner or an administrator may change a listing. Delete is a recoverable archive operation and does not remove the database record.

## Favorites

All routes require a bearer token.

```http
GET /favorites
POST /favorites/:propertyId
DELETE /favorites/:propertyId
```

Adding the same property twice is idempotent. The list excludes properties that are no longer active.

## Tour requests

### List current user's requests

```http
GET /appointments
Authorization: Bearer <accessToken>
```

### Request a tour

```http
POST /appointments
Authorization: Bearer <accessToken>
```

```json
{
  "propertyId": "64225f72-b5aa-4370-80db-0443c109609c",
  "scheduledAt": "2026-09-15T14:00:00.000Z",
  "message": "Afternoons work best for me."
}
```

The property must be active, the time must be in the future, and owners cannot request tours of their own listings.

## Health

```http
GET /health
GET /health/live
GET /health/ready
```

Liveness only checks the process. Full health and readiness also probe PostgreSQL and Redis, returning `503` with an operational status body when a dependency is unavailable.

## CORS

The API accepts browser requests only from the comma-separated origins in `CORS_ALLOWED_ORIGINS`. Add the final Netlify HTTPS origin before production testing. The JWT flow does not use credentialed cross-origin cookies.

## Interactive reference

Swagger is served from `/docs` on the API host and reflects the controller DTOs and bearer requirements.
