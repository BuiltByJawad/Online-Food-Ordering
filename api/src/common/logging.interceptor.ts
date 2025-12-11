import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const started = Date.now();
    const requestId = req.headers['x-request-id'] ?? '';

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - started;
        this.logger.log(
          `${requestId ? `[${requestId}] ` : ''}${method} ${url} ${ms}ms`,
        );
      }),
    );
  }
}
