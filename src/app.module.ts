import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './config/config.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [ConfigurationModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
