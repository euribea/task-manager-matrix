export interface TaskLogEntry {
  text: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  color?: string; // For visual grouping
  userId?: string;
  createdAt?: any;
  startDate?: any;
  endDate?: any;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  description?: string; // Keep for backward compatibility if needed temporarily
  status: string; // e.g., 'Pendiente', 'pending', 'En Progreso', 'Completado'
  priority?: string;
  isUrgent?: boolean;
  isImportant?: boolean;
  estimatedMinutes?: number;
  userId?: string;
  projectId?: string; // Foreign key to a Project
  createdAt?: any;
  startDate?: any;
  dueDate?: any;
  log?: TaskLogEntry[];
}
