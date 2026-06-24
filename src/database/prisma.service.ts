import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const adapter = new PrismaPg(
      configService.getOrThrow<string>('database.url'),
    );

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch (error) {
      this.logger.warn(
        `Prisma could not connect during startup: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
