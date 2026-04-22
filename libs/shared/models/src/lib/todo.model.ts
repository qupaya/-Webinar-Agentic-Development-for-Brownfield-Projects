export type TodoStatus = 'pending' | 'accepted' | 'rejected';

export interface Todo {
  id: number;
  title: string;
  description: string;
  status: TodoStatus;
  createdAt: string;
  processedDate?: string;
  processedReason?: string;
}

export interface CreateTodoDto {
  title: string;
  description: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
}

export interface ProcessPetitionDto {
  reason: string;
}
