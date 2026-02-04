import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDTO } from './dto/create-user-dto.js';
import { ResponseUserDTO } from './dto/response-user-dto.js';
import { ResponseUserWithTasksDTO } from './dto/response-user-with-tasks-dto.js';
import type { UserModel } from '../generated/prisma/models/User.js';
import { UpdateUserDTO } from './dto/update-user-dto.js';
import { HashingServiceProtocol } from '../auth/utils/hash.service.js';
import { PayloadDTO } from '../auth/dto/payload-dto.js';
import path from 'path';
import { FileService } from '../common/services/file.service.js';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly hashService: HashingServiceProtocol,
    private readonly fileService: FileService,
  ) {}

  async getUser(id: number) {
    const user = await this.findUserOrFail(id);

    const responseUser = this.toResponseDTO(user);

    return responseUser;
  }

  async create(data: CreateUserDTO) {
    await this.emailIsEmptyOrFail(data.email);

    const passwordHash = await this.hashService.hash(data.password);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: passwordHash,
      },
    });

    const responseUser = this.toResponseDTO(user);

    return {
      message: 'Usuário criado com sucesso.',
      data: responseUser,
    };
  }

  async update(id: number, data: UpdateUserDTO, token: PayloadDTO) {
    const user = await this.findUserOrFail(id);
    this.equalIdOrFail(user.id, token.sub);

    const dataUser: { name?: string; passwordHash?: string } = {
      name: data.name ? data.name : user.name,
    };

    if (data?.password) {
      const passwordHash = await this.hashService.hash(data.password);
      dataUser['passwordHash'] = passwordHash;
    }

    const userUpdated = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: dataUser.name,
        passwordHash: dataUser?.passwordHash
          ? dataUser.passwordHash
          : user.passwordHash,
      },
    });

    const responseUser = this.toResponseDTO(userUpdated);

    return {
      message: 'Usuário atualizado com sucesso.',
      data: responseUser,
    };
  }

  async delete(id: number, token: PayloadDTO) {
    await this.findUserOrFail(id);

    this.equalIdOrFail(id, token.sub);

    await this.prisma.user.update({
      where: { id: id },
      data: { active: false },
    });

    return {
      message: 'Usuário inativado com sucesso!',
    };
  }

  private async findUserOrFail(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: id, active: true },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return user;
  }

  async getUserWithTasks(id: number): Promise<ResponseUserWithTasksDTO> {
    const user = await this.prisma.user.findUnique({
      where: { id: id, active: true },
      include: { Task: true },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt as Date,
      tasks: user.Task.map((task) => ({
        id: task.id,
        name: task.name,
        isCompleted: task.isCompleted,
        createdAt: task.createdAt!,
      })),
    };
  }

  async uploadFile(file: Express.Multer.File, token: PayloadDTO) {
    const user = await this.findUserOrFail(token.sub);

    const extName = path.extname(file.originalname).toLowerCase().substring(1);

    const fileName = `${token.sub}.${extName}`;

    const pathMaster = path.resolve(process.cwd(), 'imgs', fileName);

    await this.fileService.writeFile(pathMaster, file.buffer);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { avatar: fileName },
      select: { id: true, name: true, email: true, avatar: true },
    });

    return {
      message: 'imagem criada com sucesso.',
      data: updatedUser,
    };
  }

  private toResponseDTO(user: UserModel): ResponseUserDTO {
    return {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt as Date,
    };
  }

  private equalIdOrFail(userId: number, payloadId: number) {
    if (userId !== payloadId) throw new UnauthorizedException('Acesso negado.');
  }

  private async emailIsEmptyOrFail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    if (user) throw new ConflictException('Email já existente');

    return true;
  }
}
