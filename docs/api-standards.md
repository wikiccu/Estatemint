# API Standards

EstateMint applies global API standards during application bootstrap so HTTP behavior is consistent across every module.

## API Prefix

All application API routes use the versioned prefix:

```text
/api/v1
```

Examples:

- `GET /api/v1`
- `GET /api/v1/health`
- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`

Swagger remains available outside the API prefix at:

```text
/docs
```

Keeping Swagger outside `/api/v1` makes it an operational documentation surface rather than part of the public API contract.

## Validation

The global `ValidationPipe` is configured with:

- `whitelist: true`: removes properties that are not declared on DTOs, which prevents accidental mass assignment.
- `forbidNonWhitelisted: true`: rejects requests with unknown properties instead of silently dropping them, which makes API mistakes visible to clients.
- `transform: true`: converts incoming payloads to DTO instances and supports typed query/path values when DTOs declare them.

Validation failures use a consistent response shape:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/example",
  "timestamp": "2026-06-24T12:00:00.000Z",
  "errors": [
    {
      "field": "email",
      "messages": ["email must be an email"]
    }
  ]
}
```

## Error Responses

Unhandled HTTP errors pass through a global exception filter. The standard error response includes:

- `statusCode`
- `error`
- `message`
- `path`
- `timestamp`
- `errors`, when structured validation details exist

Example:

```json
{
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "Cannot GET /api/v1/missing",
  "path": "/api/v1/missing",
  "timestamp": "2026-06-24T12:00:00.000Z"
}
```

This gives API clients, tests, and logs a predictable shape without introducing a heavy custom response framework too early.

## API Root

`GET /api/v1` is an intentional metadata endpoint. It replaces the default NestJS `Hello World` route and points clients toward documentation and health checks.
