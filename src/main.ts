import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import packageJson from '../package.json';
import { configureApiStandards } from './api-standards';
import { AppModule } from './app.module';
import { API_PREFIX, SWAGGER_PATH } from './common/constants/api.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApiStandards(app);

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('app.port');
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EstateMint API')
    .setDescription('EstateMint backend API documentation')
    .setVersion(packageJson.version)
    .addServer(`/${API_PREFIX}`)
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(SWAGGER_PATH, app, swaggerDocument);

  await app.listen(port);
}
void bootstrap();
