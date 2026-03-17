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
  createdAt?: any;
  startDate?: any;
  dueDate?: any;
}
