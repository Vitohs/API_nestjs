import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user-dto.js';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {}
