import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDTO } from './dto/create-user-dto.js';
import { UpdateUserDTO } from './dto/update-user-dto.js';
import { AuthTokenGuard } from '../auth/guard/auth-token.guard.js';
import { TokenPayloadParam } from '../auth/param/token-payload.params.js';
import { PayloadDTO } from '../auth/dto/payload-dto.js';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }

  @Get(':id/tasks')
  async getUserWithTasks(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserWithTasks(id);
  }

  @Post()
  create(@Body() data: CreateUserDTO) {
    return this.userService.create(data);
  }

  @UseGuards(AuthTokenGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    data: UpdateUserDTO,
    @TokenPayloadParam()
    tokenPayload: PayloadDTO,
  ) {
    return this.userService.update(id, data, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  deletar(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: PayloadDTO,
  ) {
    return this.userService.delete(id, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  upload(
    @TokenPayloadParam() tokenPayload: PayloadDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator( { fileType: /jpeg|jpg|png/g, errorMessage: "imagem precisa estar em jpeg ou jpg ou png." } )
        .addMaxSizeValidator( { maxSize: 1 * (1024 * 1024), errorMessage: "imagem excede tamanho permitido." } )
        .build({
          exceptionFactory: (error) => new UnprocessableEntityException(error)
        })
    ) file: Express.Multer.File
  ) {
    return this.userService.uploadFile(file, tokenPayload)
  }
}
