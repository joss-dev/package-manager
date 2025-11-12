import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] | object =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    if (
      typeof message === 'object' &&
      message !== null &&
      !Array.isArray(message)
    ) {
      if ('message' in message) {
        message = message.message as string | string[];
      }
    }

    if (Array.isArray(message)) {
      message = message.join(', ');
    }

    const errorResponse = {
      statusCode: status,
      error:
        exception instanceof HttpException
          ? exception.constructor.name
          : 'InternalServerError',
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    console.error(`[${status}] ${request.method} ${request.url}:`, exception);

    response.status(status).json(errorResponse);
  }
}
