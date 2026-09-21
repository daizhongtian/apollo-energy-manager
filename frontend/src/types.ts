export interface User {
  id: number;
  name: string;
  email: string;
}

export type ProjectStatus = 'active' | 'completed' | 'archived';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  tasks: Task[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
