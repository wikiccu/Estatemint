import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createConnection } from 'node:net';
import packageJson from '../../../package.json';

export type HealthStatus = 'ok' | 'degraded';
export type DependencyStatus = 'up' | 'down';

export interface DependencyHealth {
  status: DependencyStatus;
  latencyMs?: number;
  message?: string;
}

export interface HealthChecks {
  database: DependencyHealth;
  redis: DependencyHealth;
}

export interface BaseHealthResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}

export interface HealthResponse extends BaseHealthResponse {
  checks: HealthChecks;
}

@Injectable()
export class HealthService {
  private readonly dependencyTimeoutMs = 1000;

  constructor(private readonly configService: ConfigService) {}

  getLiveness(): BaseHealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: this.configService.getOrThrow<string>('app.nodeEnv'),
      version: packageJson.version,
    };
  }

  async getHealth(): Promise<HealthResponse> {
    const checks = await this.getDependencyChecks();
    const dependencyChecks: DependencyHealth[] = [
      checks.database,
      checks.redis,
    ];
    const isHealthy = dependencyChecks.every((check) => check.status === 'up');

    return {
      ...this.getLiveness(),
      status: isHealthy ? 'ok' : 'degraded',
      checks,
    };
  }

  async getReadiness(): Promise<HealthResponse> {
    return this.getHealth();
  }

  private async getDependencyChecks(): Promise<HealthChecks> {
    const [database, redis] = await Promise.all([
      this.checkTcpDependency(
        this.configService.getOrThrow<string>('database.host'),
        this.configService.getOrThrow<number>('database.port'),
      ),
      this.checkTcpDependency(
        this.configService.getOrThrow<string>('redis.host'),
        this.configService.getOrThrow<number>('redis.port'),
      ),
    ]);

    return { database, redis };
  }

  // TCP probes keep health checks decoupled from future ORM/cache client choices.
  private checkTcpDependency(
    host: string,
    port: number,
  ): Promise<DependencyHealth> {
    const startedAt = Date.now();

    return new Promise((resolve) => {
      const socket = createConnection({ host, port });

      const finish = (result: DependencyHealth) => {
        socket.removeAllListeners();
        socket.destroy();
        resolve(result);
      };

      socket.setTimeout(this.dependencyTimeoutMs);

      socket.once('connect', () => {
        finish({
          status: 'up',
          latencyMs: Date.now() - startedAt,
        });
      });

      socket.once('timeout', () => {
        finish({
          status: 'down',
          message: `Connection timed out after ${this.dependencyTimeoutMs}ms`,
        });
      });

      socket.once('error', (error: NodeJS.ErrnoException) => {
        finish({
          status: 'down',
          message: error.message,
        });
      });
    });
  }
}
