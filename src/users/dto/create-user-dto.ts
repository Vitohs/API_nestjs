import { PickType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity.js';

export class CreateUserDTO extends PickType(User, [
  'name',
  'email',
  'password',
]) {}
