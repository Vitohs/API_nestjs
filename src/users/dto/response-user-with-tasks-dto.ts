import { ResponseUserDTO } from './response-user-dto.js';

interface TaskSummary {
  id: number;
  name: string;
  isCompleted: boolean;
  createdAt?: Date;
}

export class ResponseUserWithTasksDTO extends ResponseUserDTO {
  tasks: TaskSummary[];
}
