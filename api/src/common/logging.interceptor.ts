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
    const res = context.switchToHttp().getResponse();
    const { method, url, user } = req;
    const started = Date.now();
    const requestId = req.headers['x-request-id'] ?? '';
    const path = typeof url === 'string' ? url.split('?')[0] : url;

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - started;
        const status = res.statusCode;
        const msg = {
          requestId,
          method,
          path,
          status,
          durationMs: ms,
          userId: user?.userId ?? null,
          role: user?.role ?? null,
        };
        this.logger.log(JSON.stringify(msg));
      }),
    );
  }
}
