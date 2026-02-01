import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { CreateTaskDTO } from './dto/create-task-dto.js';
import { UpdateTaskDTO } from './dto/update-task-dto.js';
import { PaginationDTO } from '../common/dto/pagination-dto.js';
import { AuthTokenGuard } from '../auth/guard/auth-token.guard.js';
import { TokenPayloadParam } from '../auth/param/token-payload.params.js';
import { PayloadDTO } from '../auth/dto/payload-dto.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Get()
  getTasks(@Query() params: PaginationDTO) {
    return this.taskService.getTasks(params);
  }

  @Get('/:id')
  getTask(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.getTask(id);
  }

  @UseGuards(AuthTokenGuard)
  @Post()
  createTask(
    @Body() data: CreateTaskDTO,
    @TokenPayloadParam() tokenPayload: PayloadDTO,
  ) {
    return this.taskService.createTask(data, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Patch('/:id')
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateTaskDTO,
    @TokenPayloadParam() tokenPayload: PayloadDTO,
  ) {
    return this.taskService.updateTask(id, data, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: PayloadDTO,
  ) {
    return this.taskService.deleteTask(id, tokenPayload);
  }
}
