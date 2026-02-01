import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTaskDTO } from './dto/update-task-dto.js';
import { CreateTaskDTO } from './dto/create-task-dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaginationDTO } from '../common/dto/pagination-dto.js';
import { PayloadDTO } from '../auth/dto/payload-dto.js';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async getTasks(params?: PaginationDTO) {
    const { limit = 10, offset = 0 } = params ?? {};

    const tasks = await this.prisma.task.findMany({
      take: limit,
      skip: offset,
    });

    return tasks;
  }

  async getTask(id: number) {
    const task = await this.findTaskOrFail(id);

    return task;
  }

  async createTask(data: CreateTaskDTO, token: PayloadDTO) {
    await this.verifyUserIdOrFail(token.sub);

    const taksCreated = await this.prisma.task.create({
      data: {
        name: data.name,
        description: data.description,
        isCompleted: false,
        userId: token.sub,
      },
    });

    return taksCreated;
  }

  async deleteTask(id: number, token: PayloadDTO) {
    const task = await this.findTaskOrFail(id);

    this.equalIdOrFail(task.userId!, token.sub);

    await this.prisma.task.delete({
      where: {
        id: id,
      },
    });

    return {
      message: 'task deletada com sucesso.',
    };
  }

  async updateTask(id: number, data: UpdateTaskDTO, token: PayloadDTO) {
    const taks = await this.findTaskOrFail(id);

    this.equalIdOrFail(taks.userId!, token.sub);

    const taskUpdated = await this.prisma.task.update({
      where: {
        id: taks.id,
      },
      data: data,
    });

    return taskUpdated;
  }

  private async verifyUserIdOrFail(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('Usuário não existe.');

    return user;
  }

  private async findTaskOrFail(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id: id } });

    if (!task) throw new NotFoundException('Task não encontrada.');

    return task;
  }

  private equalIdOrFail(userId: number, payloadId: number) {
    if (userId !== payloadId) throw new ForbiddenException('Acesso negado.');
  }
}
