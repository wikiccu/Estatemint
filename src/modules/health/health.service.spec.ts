import { ConfigService } from '@nestjs/config';
import { createServer, Server } from 'node:net';
import { HealthService } from './health.service';

const createConfigService = (
  databasePort: number,
  redisPort: number,
): ConfigService =>
  ({
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string | number> = {
        'app.nodeEnv': 'test',
        'database.host': '127.0.0.1',
        'database.port': databasePort,
        'redis.host': '127.0.0.1',
        'redis.port': redisPort,
      };

      return values[key];
    }),
  }) as unknown as ConfigService;

const listen = async (): Promise<{ server: Server; port: number }> => {
  const server = createServer();

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Unable to resolve test server port');
  }

  return { server, port: address.port };
};

describe('HealthService', () => {
  let servers: Server[] = [];

  afterEach(async () => {
    await Promise.all(
      servers.map(
        (server) =>
          new Promise<void>((resolve) => {
            server.close(() => resolve());
          }),
      ),
    );
    servers = [];
  });

  it('returns ok when PostgreSQL and Redis are reachable', async () => {
    const database = await listen();
    const redis = await listen();
    servers = [database.server, redis.server];
    const service = new HealthService(
      createConfigService(database.port, redis.port),
    );

    const health = await service.getHealth();

    expect(health.status).toBe('ok');
    expect(health.environment).toBe('test');
    expect(health.version).toBe('0.0.1');
    expect(health.checks.database.status).toBe('up');
    expect(health.checks.redis.status).toBe('up');
  });

  it('returns degraded when a dependency is unavailable', async () => {
    const redis = await listen();
    servers = [redis.server];
    const service = new HealthService(createConfigService(1, redis.port));

    const health = await service.getHealth();

    expect(health.status).toBe('degraded');
    expect(health.checks.database.status).toBe('down');
    expect(health.checks.redis.status).toBe('up');
  });

  it('returns liveness without dependency checks', () => {
    const service = new HealthService(createConfigService(1, 1));

    expect(service.getLiveness()).toEqual(
      expect.objectContaining({
        status: 'ok',
        environment: 'test',
        version: '0.0.1',
      }),
    );
  });
});
