import { BadRequestException } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

export interface ApiValidationError {
  field: string;
  messages: string[];
}

const formatValidationErrors = (
  errors: ValidationError[],
  parentPath = '',
): ApiValidationError[] =>
  errors.flatMap((error) => {
    const fieldPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const currentError =
      error.constraints === undefined
        ? []
        : [
            {
              field: fieldPath,
              messages: Object.values(error.constraints),
            },
          ];
    const childErrors =
      error.children === undefined || error.children.length === 0
        ? []
        : formatValidationErrors(error.children, fieldPath);

    return [...currentError, ...childErrors];
  });

export const createValidationException = (
  errors: ValidationError[],
): BadRequestException =>
  new BadRequestException({
    statusCode: 400,
    error: 'Bad Request',
    message: 'Validation failed',
    errors: formatValidationErrors(errors),
  });
