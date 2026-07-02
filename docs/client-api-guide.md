# EstateMint Client API Guide

This document is for frontend and client-side agents integrating with the EstateMint backend.

## Current Backend Scope

Implemented public API areas:

- API metadata
- Authentication
- Current authenticated user
- Health checks
- Swagger documentation

Not implemented yet:

- Property listing APIs
- Property detail APIs
- Favorites APIs
- Appointment APIs
- Upload APIs
- Admin APIs
- Role-management APIs
- Refresh tokens

Do not write client code that assumes those missing APIs exist.

## Base URLs

Local backend:

```ts
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

Swagger documentation:

```text
http://localhost:3000/docs
```

All application API routes are prefixed with:

```text
/api/v1
```

Swagger is intentionally outside the prefix at `/docs`.

## Authentication Summary

EstateMint uses JWT bearer authentication.

Flow:

1. Register with `POST /auth/register`, or use an existing seeded user.
2. Login with `POST /auth/login`.
3. Store the returned `accessToken` on the client.
4. Send protected requests with:

```http
Authorization: Bearer <accessToken>
```

Seeded login credentials after `npm run prisma:seed`:

```text
buyer@estatemint.local / Password123!
agent@estatemint.local / Password123!
admin@estatemint.local / Password123!
```

Public registration currently creates a default `BUYER` user. Do not expose client-side role selection for registration.

## Shared Types

Use these TypeScript types on the client.

```ts
export type UserRole = 'BUYER' | 'SELLER' | 'AGENT' | 'ADMIN';

export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: SafeUser;
}

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
  errors?: Array<{
    field: string;
    messages: string[];
  }>;
}
```

The backend never returns `passwordHash` in normal API responses.

## API Client Helper

Recommended small fetch wrapper:

```ts
const API_BASE_URL = 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type');
  const body =
    contentType?.includes('application/json') === true
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as TResponse;
}
```

Authenticated helper:

```ts
export function withBearerToken(
  token: string,
  options: RequestInit = {},
): RequestInit {
  return {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };
}
```

## Endpoints

### API Metadata

```http
GET /api/v1
```

Response:

```json
{
  "name": "EstateMint API",
  "version": "0.0.1",
  "status": "ok",
  "docs": "/docs",
  "health": "/api/v1/health"
}
```

Client example:

```ts
interface ApiRootResponse {
  name: string;
  version: string;
  status: 'ok';
  docs: string;
  health: string;
}

const apiRoot = await apiRequest<ApiRootResponse>('');
```

### Register

```http
POST /api/v1/auth/register
```

Request:

```json
{
  "email": "buyer@estatemint.local",
  "password": "Password123!",
  "firstName": "Ben",
  "lastName": "Buyer"
}
```

Validation rules:

- `email`: valid email, max 254 characters
- `password`: string, 8 to 128 characters
- `firstName`: string, 1 to 80 characters
- `lastName`: string, 1 to 80 characters

Success:

```http
201 Created
```

Response:

```json
{
  "id": "27a701e8-2ff8-4a0a-a3f1-b44a43a7a548",
  "email": "buyer@estatemint.local",
  "firstName": "Ben",
  "lastName": "Buyer",
  "role": "BUYER",
  "isActive": true,
  "createdAt": "2026-06-24T12:00:00.000Z",
  "updatedAt": "2026-06-24T12:00:00.000Z"
}
```

Possible errors:

- `400 Bad Request`: validation failed
- `409 Conflict`: email already exists

Client example:

```ts
export async function register(
  input: RegisterRequest,
): Promise<SafeUser> {
  return apiRequest<SafeUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
```

### Login

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "buyer@estatemint.local",
  "password": "Password123!"
}
```

Success:

```http
200 OK
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

Possible errors:

- `400 Bad Request`: validation failed
- `401 Unauthorized`: invalid email or password
- `403 Forbidden`: user account is inactive

Client example:

```ts
export async function login(input: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
```

### Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
```

Success:

```http
200 OK
```

Response:

```json
{
  "id": "27a701e8-2ff8-4a0a-a3f1-b44a43a7a548",
  "email": "buyer@estatemint.local",
  "firstName": "Ben",
  "lastName": "Buyer",
  "role": "BUYER",
  "isActive": true,
  "createdAt": "2026-06-24T12:00:00.000Z",
  "updatedAt": "2026-06-24T12:00:00.000Z"
}
```

Possible errors:

- `401 Unauthorized`: missing, invalid, or expired token

Client example:

```ts
export async function getCurrentUser(token: string): Promise<SafeUser> {
  return apiRequest<SafeUser>(
    '/auth/me',
    withBearerToken(token),
  );
}
```

## Health Endpoints

### Full Health

```http
GET /api/v1/health
```

Returns `200 OK` when the app and dependencies are healthy.

Returns `503 Service Unavailable` when PostgreSQL or Redis is unavailable, but still returns a useful body:

```json
{
  "status": "degraded",
  "timestamp": "2026-06-24T12:00:00.000Z",
  "uptime": 1234,
  "environment": "development",
  "version": "0.0.1",
  "checks": {
    "database": {
      "status": "down",
      "message": "connect ECONNREFUSED 127.0.0.1:5432"
    },
    "redis": {
      "status": "up",
      "latencyMs": 2
    }
  }
}
```

### Liveness

```http
GET /api/v1/health/live
```

Use for process-level checks.

### Readiness

```http
GET /api/v1/health/ready
```

Use for dependency-aware checks.

## Error Handling

All regular API errors use the global error shape:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/auth/register",
  "timestamp": "2026-06-24T12:00:00.000Z",
  "errors": [
    {
      "field": "email",
      "messages": ["email must be an email"]
    }
  ]
}
```

Validation errors include `errors` with field-level messages.

Do not rely only on `message` for form errors. Prefer `errors` when present.

## Token Storage Guidance

For web clients:

- Keep the access token in memory when possible.
- If persistence is required, use a clear project decision before choosing local storage or cookies.
- Send tokens only in the `Authorization` header.
- Do not put tokens in query strings.

Refresh tokens are not implemented yet.

## Frontend Auth State Shape

Recommended client auth state:

```ts
interface AuthState {
  accessToken: string | null;
  user: SafeUser | null;
  isAuthenticated: boolean;
}
```

After login:

```ts
const auth = await login({
  email: 'buyer@estatemint.local',
  password: 'Password123!',
});

authState.accessToken = auth.accessToken;
authState.user = auth.user;
authState.isAuthenticated = true;
```

On app boot, if an access token exists:

```ts
try {
  const user = await getCurrentUser(accessToken);
  authState.user = user;
  authState.isAuthenticated = true;
} catch {
  authState.accessToken = null;
  authState.user = null;
  authState.isAuthenticated = false;
}
```

## Current Role Behavior

Roles exist in user objects and JWT payloads:

```ts
type UserRole = 'BUYER' | 'SELLER' | 'AGENT' | 'ADMIN';
```

Current public registration creates `BUYER` users by default.

There are no role-specific protected APIs yet. Do not hide or show critical business features based only on client-side role checks once business APIs exist; the backend must enforce permissions.

## Quick Manual Test

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"buyer@estatemint.local\",\"password\":\"Password123!\"}"
```

Then call:

```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

## Client Implementation Checklist

- Use `http://localhost:3000/api/v1` as the local API base URL.
- Use `/docs` to inspect Swagger.
- Implement register form against `POST /auth/register`.
- Implement login form against `POST /auth/login`.
- Store and attach `accessToken` as a bearer token.
- Implement current-user bootstrap with `GET /auth/me`.
- Handle `400`, `401`, `403`, and `409` explicitly in auth UI.
- Do not call Users APIs; no public Users API exists.
- Do not call Properties/Favorites/Appointments/Uploads APIs yet; they do not exist.
