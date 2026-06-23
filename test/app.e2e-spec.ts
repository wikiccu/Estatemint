import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HealthService } from './../src/modules/health/health.service';
import type { HealthResponse } from './../src/modules/health/health.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HealthService)
      .useValue({
        getHealth: jest.fn().mockResolvedValue({
          status: 'ok',
          timestamp: '2026-06-18T12:00:00.000Z',
          uptime: 1234,
          environment: 'test',
          version: '0.0.1',
          checks: {
            database: { status: 'up' },
            redis: { status: 'up' },
          },
        }),
        getReadiness: jest.fn().mockResolvedValue({
          status: 'ok',
          timestamp: '2026-06-18T12:00:00.000Z',
          uptime: 1234,
          environment: 'test',
          version: '0.0.1',
          checks: {
            database: { status: 'up' },
            redis: { status: 'up' },
          },
        }),
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
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
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

  afterEach(async () => {
    if (app !== undefined) {
      await app.close();
    }
  });
});
