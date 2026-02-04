import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { FileService } from '../common/services/file.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, FileService],
})
export class UsersModule {}
