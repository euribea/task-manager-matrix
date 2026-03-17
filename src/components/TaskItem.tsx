import type { Task } from '../types/Task';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStart: (task: Task) => void;
  isActive?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete, onEdit, onStart, isActive }) => {
  const handleStatusChange = () => {
    onUpdate(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' });
  };

  const isCompleted = task.status === 'completed';

  if (isActive) {
    return (
      <div className="bg-gradient-to-br from-surface-lighter to-[#1e2636] p-6 rounded-2xl border border-primary/40 shadow-xl shadow-primary/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-9xl text-white transform rotate-12">timer</span>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">Active Focus</span>
                  </div>
                  <h4 className={`text-2xl font-bold text-white mb-2 leading-tight ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h4>
                  {task.description && <p className="text-slate-400 text-sm mb-4">{task.description}</p>}
              </div>

              <div className="shrink-0 flex gap-4">
                  <button onClick={handleStatusChange} className="flex items-center justify-center p-3 rounded-xl border border-slate-600 hover:border-green-500 text-white hover:text-green-500 transition-colors tooltip" title="Mark done">
                      {isCompleted ? <span className="material-symbols-outlined filled">close</span> : <span className="material-symbols-outlined">check</span>}
                  </button>
                  <button onClick={() => onStart(task)} className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all transform hover:scale-105 active:scale-95 w-full md:w-auto">
                      <span className="material-symbols-outlined filled">play_arrow</span>
                      Focus Session
                  </button>
                  <button onClick={() => onEdit(task)} className="flex items-center justify-center p-3 rounded-xl border border-slate-600 hover:border-primary text-white hover:text-primary transition-colors tooltip" title="Edit task">
                      <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button onClick={() => onDelete(task.id)} className="flex items-center justify-center p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                      <span className="material-symbols-outlined">delete</span>
                  </button>
              </div>
          </div>
      </div>
    );
  }

  // Secondary Task Item Style
  return (
    <div className={`p-4 rounded-xl border transition-colors flex items-center gap-4 group ${isCompleted ? 'bg-surface-lighter/50 border-slate-800 opacity-60 hover:opacity-100' : 'bg-surface-lighter border-slate-700 hover:border-slate-600'}`}>
        <button onClick={handleStatusChange} className={`shrink-0 size-6 rounded border-2 flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500/20 border-green-500' : 'border-slate-500 hover:border-primary group-hover:bg-primary/10'}`}>
            <span className={`material-symbols-outlined text-sm ${isCompleted ? 'text-green-500' : 'text-primary opacity-0 group-hover:opacity-100'}`}>check</span>
        </button>

        <div className="flex-1 cursor-pointer" onClick={() => onStart(task)}>
            <h5 className={`font-semibold text-base transition-colors ${isCompleted ? 'text-slate-300 line-through' : 'text-white group-hover:text-primary'}`}>
              {task.title}
            </h5>
            {task.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>
            )}
        </div>

        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button onClick={() => onStart(task)} className="p-2 hover:bg-slate-700 rounded-lg text-primary hover:text-blue-400 transition-colors" title="Start Pomodoro">
                <span className="material-symbols-outlined text-[20px]">timer</span>
            </button>
            <button onClick={() => onEdit(task)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Edit Task">
                <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button onClick={() => onDelete(task.id)} className="p-2 hover:bg-slate-700 rounded-lg text-red-400 hover:text-red-300 transition-colors" title="Delete Task">
                <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
        </div>
    </div>
  );
};
