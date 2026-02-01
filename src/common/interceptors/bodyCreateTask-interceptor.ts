import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class BodyCreateTaskInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const { method, url, body } = req;

    console.log(`[REQUEST] ${method} ${url}`);
    console.log(`[Body] ${JSON.stringify(body, null, 2)}`);

    return next.handle();
  }
}
