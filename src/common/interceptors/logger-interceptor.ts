import {
  ExecutionContext,
  NestInterceptor,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest(); // obtem a requisição
    const method = req.method; // pega o método (get | post etc)
    const url = req.url; // pega o caminho da rota (/y)
    const now = Date.now(); // para pegar o tempo

    console.log('sou o interceptor');

    return next.handle().pipe(
      tap(() => {
        // atuando no fim do ciclo, antes de chegar a resposta para o usuário
        console.log(`[RESPONSE] ${method} ${url} - ${Date.now() - now}ms`);
      }),
    );
  }
}
