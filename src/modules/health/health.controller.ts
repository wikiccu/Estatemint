import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HealthService } from './health.service';
import type { BaseHealthResponse, HealthResponse } from './health.service';

const baseHealthSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', example: 'ok' },
    timestamp: { type: 'string', example: '2026-06-18T12:00:00.000Z' },
    uptime: { type: 'number', example: 1234 },
    environment: { type: 'string', example: 'development' },
    version: { type: 'string', example: '0.0.1' },
  },
};

const dependencyChecksSchema = {
  type: 'object',
  properties: {
    checks: {
      type: 'object',
      properties: {
        database: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'up' },
            latencyMs: { type: 'number', example: 4 },
            message: { type: 'string', example: 'Connection refused' },
          },
        },
        redis: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'up' },
            latencyMs: { type: 'number', example: 2 },
            message: { type: 'string', example: 'Connection refused' },
          },
        },
      },
    },
  },
};

const healthSchema = {
  allOf: [baseHealthSchema, dependencyChecksSchema],
};

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({
    description: 'Application and dependencies are healthy.',
    schema: healthSchema,
  })
  @ApiServiceUnavailableResponse({
    description:
      'Application is reachable, but one or more dependencies are down.',
    schema: healthSchema,
  })
  async getHealth(): Promise<HealthResponse> {
    const health = await this.healthService.getHealth();

    if (health.status !== 'ok') {
      throw new HttpException(health, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return health;
  }

  @Get('live')
  @ApiOkResponse({
    description: 'Application process is running.',
    schema: baseHealthSchema,
  })
  getLiveness(): BaseHealthResponse {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @ApiOkResponse({
    description: 'Application and dependencies are ready to serve traffic.',
    schema: healthSchema,
  })
  @ApiServiceUnavailableResponse({
    description: 'Application is running, but is not ready to serve traffic.',
    schema: healthSchema,
  })
  async getReadiness(): Promise<HealthResponse> {
    const health = await this.healthService.getReadiness();

    if (health.status !== 'ok') {
      throw new HttpException(health, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return health;
  }
}
