import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthResponse, HealthService } from './health.service';

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

describe('HealthController', () => {
  let controller: HealthController;
  let service: jest.Mocked<
    Pick<HealthService, 'getHealth' | 'getLiveness' | 'getReadiness'>
  >;

  beforeEach(async () => {
    service = {
      getHealth: jest.fn().mockResolvedValue(healthyResponse),
      getReadiness: jest.fn().mockResolvedValue(healthyResponse),
      getLiveness: jest.fn().mockReturnValue({
        status: 'ok',
        timestamp: '2026-06-18T12:00:00.000Z',
        uptime: 1234,
        environment: 'test',
        version: '0.0.1',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: service }],
    }).compile();

    controller = module.get(HealthController);
  });

  it('returns health from the service', async () => {
    await expect(controller.getHealth()).resolves.toEqual(healthyResponse);
    expect(service.getHealth).toHaveBeenCalledTimes(1);
  });

  it('throws a 503 response when dependencies are degraded', async () => {
    service.getHealth.mockResolvedValue({
      ...healthyResponse,
      status: 'degraded',
      checks: {
        database: { status: 'down', message: 'Connection refused' },
        redis: { status: 'up' },
      },
    });

    await expect(controller.getHealth()).rejects.toBeInstanceOf(HttpException);
  });

  it('returns liveness from the service', () => {
    expect(controller.getLiveness()).toEqual(
      expect.objectContaining({ status: 'ok' }),
    );
    expect(service.getLiveness).toHaveBeenCalledTimes(1);
  });

  it('returns readiness from the service', async () => {
    await expect(controller.getReadiness()).resolves.toEqual(healthyResponse);
    expect(service.getReadiness).toHaveBeenCalledTimes(1);
  });
});
