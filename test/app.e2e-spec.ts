import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApiStandards } from './../src/api-standards';
import { AppModule } from './../src/app.module';
import { HealthService } from './../src/modules/health/health.service';
import type { HealthResponse } from './../src/modules/health/health.service';
import { UsersService } from './../src/modules/users/users.service';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import type { CreateUserDto } from './../src/modules/users/dto/create-user.dto';
import type {
  SafeUser,
  UserWithPasswordHash,
} from './../src/modules/users/types/safe-user.type';

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

type EmailLookup = (email: string) => UserWithPasswordHash | null;
type UserLookup = (id: string) => SafeUser | null;

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let healthResponse: HealthResponse;
  let safeUser: SafeUser;
  let userWithPasswordHash: UserWithPasswordHash | null;

  beforeEach(async () => {
    healthResponse = healthyResponse;
    safeUser = {
      id: '27a701e8-2ff8-4a0a-a3f1-b44a43a7a548',
      email: 'buyer@estatemint.local',
      firstName: 'Ben',
      lastName: 'Buyer',
      role: UserRole.BUYER,
      isActive: true,
      createdAt: new Date('2026-06-24T12:00:00.000Z'),
      updatedAt: new Date('2026-06-24T12:00:00.000Z'),
    };
    userWithPasswordHash = null;

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
      .overrideProvider(UsersService)
      .useValue({
        createUser: jest.fn().mockImplementation((data: CreateUserDto) => {
          safeUser = {
            ...safeUser,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
          };
          userWithPasswordHash = {
            ...safeUser,
            passwordHash: data.passwordHash,
          };

          return safeUser;
        }),
        findByEmailForAuth: jest
          .fn<ReturnType<EmailLookup>, Parameters<EmailLookup>>()
          .mockImplementation((email) => {
            if (userWithPasswordHash?.email === email) {
              return userWithPasswordHash;
            }

            return null;
          }),
        findById: jest
          .fn<ReturnType<UserLookup>, Parameters<UserLookup>>()
          .mockImplementation((id) => {
            if (safeUser.id === id) {
              return safeUser;
            }

            return null;
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

  it('/api/v1/auth/register (POST) registers a safe user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'buyer@estatemint.local',
        password: 'Password123!',
        firstName: 'Ben',
        lastName: 'Buyer',
      })
      .expect(201)
      .expect(({ body }) => {
        const userBody = body as SafeUser;

        expect(userBody.email).toBe('buyer@estatemint.local');
        expect(userBody.firstName).toBe('Ben');
        expect(userBody).not.toHaveProperty('passwordHash');
      });
  });

  it('/api/v1/auth/login (POST) logs in and returns an access token', async () => {
    userWithPasswordHash = {
      ...safeUser,
      passwordHash: await bcrypt.hash('Password123!', 12),
    };

    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: safeUser.email,
        password: 'Password123!',
      })
      .expect(200)
      .expect(({ body }) => {
        const authBody = body as { accessToken: string; user: SafeUser };

        expect(typeof authBody.accessToken).toBe('string');
        expect(authBody.user.email).toBe(safeUser.email);
        expect(authBody.user).not.toHaveProperty('passwordHash');
      });
  });

  it('/api/v1/auth/me (GET) returns the authenticated user', async () => {
    userWithPasswordHash = {
      ...safeUser,
      passwordHash: await bcrypt.hash('Password123!', 12),
    };

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: safeUser.email,
        password: 'Password123!',
      })
      .expect(200);
    const authBody = loginResponse.body as { accessToken: string };

    return request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authBody.accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        const userBody = body as SafeUser;

        expect(userBody.id).toBe(safeUser.id);
        expect(userBody.email).toBe(safeUser.email);
        expect(userBody).not.toHaveProperty('passwordHash');
      });
  });

  afterEach(async () => {
    if (app !== undefined) {
      await app.close();
    }
  });
});
