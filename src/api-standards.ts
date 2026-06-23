import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { API_PREFIX } from './common/constants/api.constants';
import { createValidationException } from './common/validation/validation-exception.factory';

export const configureApiStandards = (app: INestApplication): void => {
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: createValidationException,
    }),
  );
};
