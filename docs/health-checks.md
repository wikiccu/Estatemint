# Health Checks

EstateMint exposes public health endpoints for containers, load balancers, orchestration platforms, and monitoring tools.

## Endpoints

- `GET /health`: full application health summary, including dependency checks.
- `GET /health/live`: liveness probe for the running Node.js process.
- `GET /health/ready`: readiness probe for serving traffic, including dependency checks.

These endpoints are intentionally public and must not require authentication. Infrastructure systems need to call them before user authentication, during deploys, and while recovering from incidents.

## Full Health Response

`GET /health` returns `200 OK` when the application and dependencies are healthy:

```json
{
  "status": "ok",
  "timestamp": "2026-06-18T12:00:00.000Z",
  "uptime": 1234,
  "environment": "development",
  "version": "0.0.1",
  "checks": {
    "database": {
      "status": "up",
      "latencyMs": 4
    },
    "redis": {
      "status": "up",
      "latencyMs": 2
    }
  }
}
```

If PostgreSQL or Redis is unavailable, the endpoint returns `503 Service Unavailable` with a structured degraded response:

```json
{
  "status": "degraded",
  "timestamp": "2026-06-18T12:00:00.000Z",
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

The application does not crash when a dependency is unavailable. The health service reports the failed dependency and lets infrastructure decide whether to route traffic.

## Liveness

Use `GET /health/live` for Kubernetes liveness probes or equivalent process-level checks. This endpoint verifies that the NestJS process can respond and does not perform database or Redis calls.

Example Kubernetes liveness probe:

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30
```

## Readiness

Use `GET /health/ready` for Kubernetes readiness probes, deployment rollout checks, and load balancer target health. This endpoint includes PostgreSQL and Redis connectivity checks.

Example Kubernetes readiness probe:

```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

## Dependency Checks

The current checks use short TCP probes against the configured PostgreSQL and Redis hosts and ports. This keeps the health module independent from future ORM, query builder, or Redis client choices while still validating that required infrastructure is reachable.

When dedicated database and cache clients are introduced, the health service can be expanded to use client-native ping queries without changing the public endpoint contract.

## Swagger

Swagger documentation is available at `/docs` when the application is running. The health endpoints are tagged as `Health` and document both healthy and unavailable responses.
