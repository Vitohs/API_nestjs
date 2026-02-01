import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from './dto/login-dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { HashingServiceProtocol } from './utils/hash.service.js';
import jwtConfig from './config/jwt.config.js';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashingServiceProtocol,

    @Inject(jwtConfig.KEY)
    private readonly jwtconfiguration: ConfigType<typeof jwtConfig>,

    private readonly jwtService: JwtService,
  ) {}

  async Login(data: LoginDTO) {
    const user = await this.emailIsEmptyOrFail(data.email);

    const passwordValid = await this.hashService.compare(
      data.password,
      user.passwordHash,
    );

    if (!passwordValid)
      throw new UnauthorizedException('Email ou senha inválido');

    const token = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: this.jwtconfiguration.secret,
        expiresIn: this.jwtconfiguration.tokenTtl,
        audience: this.jwtconfiguration.audience,
        issuer: this.jwtconfiguration.issuer,
      },
    );

    return {
      message: 'autorizado!',
      data: {
        id: user.id,
        nome: user.name,
        email: user.email,
      },
      token: token,
    };
  }

  private async emailIsEmptyOrFail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email, active: true },
    });

    if (!user) throw new UnauthorizedException('Email ou senha inválido');

    return user;
  }
}
