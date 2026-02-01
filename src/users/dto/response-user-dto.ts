import { PickType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity.js';

export class ResponseUserDTO extends PickType(User, [
  'name',
  'email',
  'createdAt',
]) {}
