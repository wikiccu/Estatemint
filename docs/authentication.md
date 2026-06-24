# Authentication

EstateMint uses JWT-based authentication with bcrypt password hashing.

## Endpoints

### Register

```http
POST /api/v1/auth/register
```

Creates a user account and returns a safe user object. The response never includes `passwordHash`.

Request:

```json
{
  "email": "buyer@estatemint.local",
  "password": "Password123!",
  "firstName": "Ben",
  "lastName": "Buyer"
}
```

### Login

```http
POST /api/v1/auth/login
```

Verifies credentials, rejects inactive users, and returns an access token with the safe user.

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "27a701e8-2ff8-4a0a-a3f1-b44a43a7a548",
    "email": "buyer@estatemint.local",
    "firstName": "Ben",
    "lastName": "Buyer",
    "role": "BUYER",
    "isActive": true,
    "createdAt": "2026-06-24T12:00:00.000Z",
    "updatedAt": "2026-06-24T12:00:00.000Z"
  }
}
```

### Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
```

Returns the authenticated user. Missing, invalid, or expired tokens return `401 Unauthorized`.

## Password Security

Passwords are hashed with bcrypt before storage. The auth module uses `PasswordService` so hashing and verification remain isolated from controllers and business logic.

Plain text passwords are never stored. Normal user responses use safe user objects that omit `passwordHash`.

## JWT Settings

JWT configuration is loaded through the global configuration module:

```dotenv
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_EXPIRES_IN=15m
```

`JWT_SECRET` must be a strong secret and should be managed through deployment secrets outside local development.

## Role-Aware Foundation

JWT payloads include the user id, email, and role. This prepares the platform for role-based authorization, but this feature does not add role guards or business permissions yet.
