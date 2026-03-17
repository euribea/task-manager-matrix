import type { Task } from '../types/Task';

interface TaskMatrixProps {
  tasks: Task[];
  onStart: (task: Task) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

interface MatrixTask {
  id: string;
  title: string;
  originalTask: Task;
  quadrantId: 1 | 2 | 3 | 4;
}

export const TaskMatrix: React.FC<TaskMatrixProps> = ({ tasks, onStart, onUpdate, onDelete, onEdit }) => {
  // Distribute real tasks + demo data across the 4 quadrants
  // Distribute real tasks across the 4 quadrants
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  // Map real tasks to MatrixTask format
  const mapToMatrix = (tasks: Task[]): MatrixTask[] => {
    return tasks.map(task => {
      let quadrantId: 1 | 2 | 3 | 4 = 4; // Default to eliminate

      if (task.isImportant && task.isUrgent) quadrantId = 1; // DO
      else if (task.isImportant && !task.isUrgent) quadrantId = 2; // SCHEDULE
      else if (!task.isImportant && task.isUrgent) quadrantId = 3; // DELEGATE
      else quadrantId = 4; // ELIMINATE

      return {
        id: task.id,
        title: task.title,
        quadrantId,
        originalTask: task
      };
    });
  };

  const matrixTasks = mapToMatrix(pendingTasks);

  // Workflow velocity stats
  const velocityStats = [
    { label: 'To Do', count: pendingTasks.length, color: 'bg-primary', icon: 'assignment' },
    { label: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length, color: 'bg-cyan-400', icon: 'pending_actions' },
    { label: 'Review', count: 0, color: 'bg-orange-400', icon: 'rate_review' },
    { label: 'Done', count: tasks.filter(t => t.status === 'completed').length, color: 'bg-green-400', icon: 'check_circle' },
  ];

  const QuadrantCard = ({ title, subtitle, color, qTasks, onUpdate, onDelete, onEdit, onStart }: { title: string; subtitle: string; color: string; qTasks: MatrixTask[] } & Omit<TaskMatrixProps, 'tasks'>) => (
    <div className={`bg-surface-lighter rounded-xl border border-slate-700/50 p-5 flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className={`text-sm font-bold ${color} uppercase tracking-wider`}>{title}</h4>
          <span className="text-[10px] text-slate-400 font-medium">{subtitle}</span>
        </div>
        <button className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>
      <div className="flex flex-col gap-4 flex-1">
        {qTasks.map((task) => (
          <div key={task.id} className="group flex flex-col gap-2 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-primary/30 transition-all hover:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${color.replace('text-', 'border-').replace('text-', 'bg-')}/20 ${color} bg-slate-900/50`}>
                {task.quadrantId === 1 ? 'DO' : task.quadrantId === 2 ? 'PLAN' : task.quadrantId === 3 ? 'DELEGATE' : 'DROP'}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onUpdate(task.id, { status: 'completed' })}
                  className="p-1 hover:bg-green-500/20 text-slate-400 hover:text-green-500 rounded transition-colors" 
                  title="Complete"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </button>
                <button 
                  onClick={() => onEdit(task.originalTask)}
                  className="p-1 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded transition-colors" 
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button 
                  onClick={() => onDelete(task.id)}
                  className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition-colors" 
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
            <h5 onClick={() => onStart(task.originalTask)} className="text-sm font-bold text-white leading-tight cursor-pointer hover:text-primary transition-colors">{task.title}</h5>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{task.originalTask.description || task.originalTask.notes || 'No details provided.'}</p>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-slate-300">person</span>
                </div>
              </div>
              {task.originalTask.dueDate && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {new Date(task.originalTask.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
        {qTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-2">check_circle</span>
            <p className="text-xs text-slate-400">Clean slate!</p>
            <p className="text-[10px] text-slate-500">Distractions eliminated.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <header className="shrink-0 px-6 md:px-10 py-6 border-b border-slate-800 bg-background-dark/95 backdrop-blur z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <span>Productivity Suite</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-white font-semibold">Eisenhower Matrix</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Task Matrix</h2>
            <p className="text-sm text-slate-400 mt-1">Prioritize your workload by urgency and importance to maximize productivity.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/25 transition-all">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Task
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Workflow Velocity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
                Workflow Velocity
              </h3>
              <span className="text-xs text-slate-400">On Track • 85% in last week</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {velocityStats.map((stat) => (
                <div key={stat.label} className="bg-surface-lighter rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                    <div className="p-1 rounded bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-slate-400 text-[14px]">trending_up</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.count} <span className="text-sm text-slate-500 font-medium">tasks</span></p>
                  <div className="mt-3 h-1 bg-slate-700 rounded-full">
                    <div className={`h-full ${stat.color} rounded-full transition-all`} style={{ width: `${Math.min((stat.count / 30) * 100, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Eisenhower Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuadrantCard 
              title="Do First" 
              subtitle="Important & Urgent"
              color="text-primary" 
              qTasks={matrixTasks.filter(t => t.quadrantId === 1)} 
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEdit={onEdit}
              onStart={onStart}
            />
            <QuadrantCard 
              title="Schedule" 
              subtitle="Important but Not Urgent"
              color="text-yellow-400" 
              qTasks={matrixTasks.filter(t => t.quadrantId === 2)} 
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEdit={onEdit}
              onStart={onStart}
            />
            <QuadrantCard 
              title="Delegate" 
              subtitle="Urgent but Not Important"
              color="text-purple-400" 
              qTasks={matrixTasks.filter(t => t.quadrantId === 3)} 
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEdit={onEdit}
              onStart={onStart}
            />
            <QuadrantCard 
              title="Eliminate" 
              subtitle="Not Important & Not Urgent"
              color="text-slate-400" 
              qTasks={matrixTasks.filter(t => t.quadrantId === 4)} 
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEdit={onEdit}
              onStart={onStart}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
