import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { PaginatedResponse } from '../types/paginated-response';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, PaginatedResponse<T> | { data: T }>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data: T | PaginatedResponse<T>) => {
        const response = context.switchToHttp().getResponse<Response>();

        const isPaginated =
          typeof data === 'object' &&
          data !== null &&
          'data' in data &&
          'total' in data;

        const safeData: PaginatedResponse<T> | { data: T } = isPaginated
          ? data
          : { data };

        return {
          statusCode: response.statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
          durationMs: Date.now() - now,
          ...safeData,
        };
      }),
    );
  }
}
