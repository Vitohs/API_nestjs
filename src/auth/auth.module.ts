import { Global, Module } from '@nestjs/common';
import { HashingServiceProtocol } from './utils/hash.service.js';
import { BcryptService } from './utils/bcript.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config.js';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  providers: [
    { provide: HashingServiceProtocol, useClass: BcryptService },
    AuthService,
  ],
  imports: [
    PrismaModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  exports: [HashingServiceProtocol, JwtModule, ConfigModule],
  controllers: [AuthController],
})
export class AuthModule {}
