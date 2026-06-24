import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  errors?: unknown;
}

interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
  errors?: unknown;
}

interface OperationalHealthResponse {
  status: string;
  checks: unknown;
}

const isErrorBody = (value: unknown): value is ErrorBody =>
  typeof value === 'object' && value !== null;

const isOperationalHealthResponse = (
  value: unknown,
): value is OperationalHealthResponse =>
  typeof value === 'object' &&
  value !== null &&
  'status' in value &&
  'checks' in value;

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    if (isOperationalHealthResponse(exceptionResponse)) {
      response.status(statusCode).json(exceptionResponse);
      return;
    }

    const body = isErrorBody(exceptionResponse) ? exceptionResponse : undefined;
    const message =
      body?.message ??
      (typeof exceptionResponse === 'string'
        ? exceptionResponse
        : 'Internal server error');
    const error =
      body?.error ??
      (exception instanceof HttpException
        ? exception.name
        : 'Internal Server Error');
    const payload: ApiErrorResponse = {
      statusCode,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (body?.errors !== undefined) {
      payload.errors = body.errors;
    }

    response.status(statusCode).json(payload);
  }
}
