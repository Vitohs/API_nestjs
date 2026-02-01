import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const isAdmin = req.headers['x-admin'];

    console.log('OI SOU O GUARD');

    if (isAdmin !== 'true')
      throw new UnauthorizedException('Usuário não autorizado');

    return true;
  }
}
