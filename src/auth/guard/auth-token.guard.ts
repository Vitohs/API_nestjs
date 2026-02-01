import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from '../config/jwt.config.js';
import type { ConfigType } from '@nestjs/config';
import { REQUEST_TOKEN_PAYLOAD_NAME } from '../common/auth.constants.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(req);

    if (!token) throw new UnauthorizedException('Token não encontrado.');

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );
      req[REQUEST_TOKEN_PAYLOAD_NAME] = payload;
      const user = this.prisma.user.findFirst({
        where: { id: payload?.sub, active: true },
      });
      if (!user) throw new UnauthorizedException('Acesso negado.');
    } catch (error) {
      throw new UnauthorizedException('Você não tem autorização para isso.');
    }

    return true;
  }

  extractToken(req: Request) {
    const authorization = req.headers?.authorization;
    if (!authorization || typeof authorization !== 'string') return;
    return authorization.split(' ')[1];
  }
}
