import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import morgan from 'morgan';
import packageJson from '../package.json';
import { configureApiStandards } from './api-standards';
import { AppModule } from './app.module';
import { SWAGGER_PATH } from './common/constants/api.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(morgan('dev'));
  configureApiStandards(app);

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('app.port');
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EstateMint API')
    .setDescription('EstateMint backend API documentation')
    .setVersion(packageJson.version)
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(SWAGGER_PATH, app, swaggerDocument);

  await app.listen(port);
}
void bootstrap();
