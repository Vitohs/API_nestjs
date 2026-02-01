import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { APP_FILTER } from '@nestjs/core';
import { ApiExceptionFilter } from '../common/filters/exception-filter.js';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController],
  exports: [],
  providers: [
    TasksService,
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class TasksModule {}
