import type { Task, Project } from '../types/Task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStart: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, projects, onUpdate, onDelete, onEdit, onStart }) => {
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  // If there's an active/in-progress task or just take the first pending as "Active"
  const activeTask = pendingTasks.length > 0 ? pendingTasks[0] : null;
  const secondaryPending = pendingTasks.slice(1);

  if (tasks.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center opacity-40">
        <span className="material-symbols-outlined text-6xl mb-2 text-primary">add_task</span>
        <p className="text-sm font-medium text-slate-300">No tasks found. Add one below!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">target</span>
              Today's Focus
          </h3>
      </div>
      
      <div className="flex flex-col gap-4">
        {activeTask ? (
           <TaskItem 
            key={activeTask.id} 
            task={activeTask} 
            projects={projects}
            onUpdate={onUpdate} 
            onDelete={onDelete} 
            onEdit={onEdit}
            onStart={onStart}
            isActive={true} 
          />
        ) : (
           <p className="text-sm text-slate-400 italic mb-2">No active tasks focus. Feel free to review completed tasks below!</p>
        )}
       
        {secondaryPending.length > 0 && <h4 className="text-slate-400 font-bold uppercase text-xs mt-4 tracking-wider">Up Next</h4>}
        {secondaryPending.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            projects={projects}
            onUpdate={onUpdate} 
            onDelete={onDelete}
            onEdit={onEdit}
            onStart={onStart} 
          />
        ))}

        {completedTasks.length > 0 && <h4 className="text-slate-400 font-bold uppercase text-xs mt-4 tracking-wider">Completed</h4>}
        {completedTasks.map(task => (
           <TaskItem 
             key={task.id} 
             task={task} 
             projects={projects}
             onUpdate={onUpdate} 
             onDelete={onDelete} 
             onEdit={onEdit}
             onStart={onStart}
           />
        ))}
      </div>
    </div>
  );
};
