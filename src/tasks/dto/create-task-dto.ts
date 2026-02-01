import { PickType } from '@nestjs/mapped-types';
import { Task } from '../entities/task.entity.js';

export class CreateTaskDTO extends PickType(Task, ['name', 'description']) {}
