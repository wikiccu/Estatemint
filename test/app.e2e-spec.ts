import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApiStandards } from './../src/api-standards';
import { AppModule } from './../src/app.module';
import { HealthService } from './../src/modules/health/health.service';
import type { HealthResponse } from './../src/modules/health/health.service';

const healthyResponse: HealthResponse = {
  status: 'ok',
  timestamp: '2026-06-18T12:00:00.000Z',
  uptime: 1234,
  environment: 'test',
  version: '0.0.1',
  checks: {
    database: { status: 'up' },
    redis: { status: 'up' },
  },
};

interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let healthResponse: HealthResponse;

  beforeEach(async () => {
    healthResponse = healthyResponse;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HealthService)
      .useValue({
        getHealth: jest.fn().mockImplementation(() => healthResponse),
        getReadiness: jest.fn().mockImplementation(() => healthResponse),
        getLiveness: jest.fn().mockReturnValue({
          status: 'ok',
          timestamp: '2026-06-18T12:00:00.000Z',
          uptime: 1234,
          environment: 'test',
          version: '0.0.1',
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    configureApiStandards(app);
    await app.init();
  });

  it('/api/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          name: 'EstateMint API',
          version: '0.0.1',
          status: 'ok',
          docs: '/docs',
          health: '/api/v1/health',
        });
      });
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect(({ body }) => {
        const healthBody = body as HealthResponse;

        expect(healthBody.status).toBe('ok');
        expect(typeof healthBody.timestamp).toBe('string');
        expect(typeof healthBody.uptime).toBe('number');
        expect(healthBody.environment).toBe('test');
        expect(healthBody.version).toBe('0.0.1');
        expect(healthBody.checks.database.status).toBe('up');
        expect(healthBody.checks.redis.status).toBe('up');
      });
  });

  it('/api/v1/health (GET) returns degraded health details with 503', () => {
    healthResponse = {
      ...healthyResponse,
      status: 'degraded',
      checks: {
        database: { status: 'down', message: 'Connection refused' },
        redis: { status: 'up' },
      },
    };

    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(503)
      .expect(({ body }) => {
        const healthBody = body as HealthResponse;

        expect(healthBody.status).toBe('degraded');
        expect(healthBody.checks.database).toEqual({
          status: 'down',
          message: 'Connection refused',
        });
        expect(healthBody.checks.redis.status).toBe('up');
      });
  });

  it('/api/v1/missing (GET) returns the standard error shape', () => {
    return request(app.getHttpServer())
      .get('/api/v1/missing')
      .expect(404)
      .expect(({ body }) => {
        const errorBody = body as ApiErrorResponse;

        expect(errorBody).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: 'Cannot GET /api/v1/missing',
          path: '/api/v1/missing',
          timestamp: errorBody.timestamp,
        });
        expect(typeof errorBody.timestamp).toBe('string');
      });
  });

  afterEach(async () => {
    if (app !== undefined) {
      await app.close();
    }
  });
});
