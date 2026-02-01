import { PartialType, PickType } from '@nestjs/mapped-types';
import { Task } from '../entities/task.entity.js';

export class UpdateTaskDTO extends PartialType(
  PickType(Task, ['isCompleted', 'name', 'description']),
) {}
