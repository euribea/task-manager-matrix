import { useState, useMemo } from 'react';
import type { Task, Project } from '../types/Task';

interface GanttChartProps {
  tasks: Task[];
  projects: Project[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStart: (task: Task) => void;
}

interface GanttTask {
  id: string;
  name: string;
  duration: string;
  startDay: number;
  lengthDays: number;
  color: string;
  isMilestone?: boolean;
  originalTask: Task;
}

interface ProjectGroup {
  id: string;
  name: string;
  color: string;
  tasks: GanttTask[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, projects, onUpdate, onDelete, onEdit, onStart }) => {
  const [viewMode, setViewMode] = useState<'Timeline' | 'Board' | 'List'>('Timeline');

  // Days for the header
  const days = ['01 Mon', '02 Tue', '03 Wed', '04 Thu', '05 Fri', '06 Sat', '07 Sun', '08 Mon', '09 Tue', '10 Wed', '11 Thu', '12 Fri', '13 Sat', '14 Sun', '15 Mon', '16 Tue', '17 Wed', '18 Thu'];
  const todayIndex = 4; // Mock today

  const projectGroups = useMemo(() => {
    const groups: ProjectGroup[] = [];

    // Add each project's tasks
    projects.forEach(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      if (projectTasks.length > 0) {
        groups.push({
          id: project.id,
          name: project.name,
          color: project.color || '#3b82f6',
          tasks: projectTasks.map((t, index) => {
            // Logic to spread tasks in the timeline if no dates are set
            // In a real app, this would use t.startDate and t.dueDate
            const startDay = index % 10;
            const lengthDays = 2 + (index % 5);
            
            return {
              id: t.id,
              name: t.title,
              duration: `${lengthDays} days`,
              startDay,
              lengthDays,
              color: `bg-[${project.color}]` || 'bg-primary',
              originalTask: t
            };
          })
        });
      }
    });

    // Add tasks with no project
    const orphanTasks = tasks.filter(t => !t.projectId);
    if (orphanTasks.length > 0) {
      groups.push({
        id: 'no-project',
        name: 'Uncategorized Tasks',
        color: '#64748b',
        tasks: orphanTasks.map((t, index) => ({
          id: t.id,
          name: t.title,
          duration: '1 day',
          startDay: 10 + (index % 5),
          lengthDays: 1,
          color: 'bg-slate-500',
          isMilestone: true,
          originalTask: t
        }))
      });
    }

    return groups;
  }, [tasks, projects]);

  return (
    <div className="flex flex-col h-full bg-background-dark text-slate-100 font-display">
      {/* Top Navigation Bar */}
      <header className="shrink-0 px-6 md:px-10 py-4 flex items-center justify-between border-b border-slate-800 bg-background-dark/95 backdrop-blur z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="material-symbols-outlined text-primary">account_tree</span>
            <span className="text-white font-semibold">Project Roadmap</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold ml-2">Real-time</span>
          </div>
        </div>
      </header>

      {/* View Toggles & Actions */}
      <div className="shrink-0 px-6 md:px-10 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex p-1 bg-slate-800/50 rounded-lg">
          {(['Timeline', 'Board', 'List'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${viewMode === v ? 'bg-primary text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg px-3 py-1.5">
            <span className="text-sm text-white font-medium">Today</span>
          </div>
          <span className="text-sm text-slate-400 font-medium">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
          <button className="hidden md:flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/25 transition-all">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Task
          </button>
        </div>
      </div>

      {/* Gantt Chart Area */}
      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="flex min-w-[1200px] h-full">
          {/* Left Panel: Task List */}
          <div className="w-80 shrink-0 border-r border-slate-800 bg-background-dark/50 overflow-y-auto">
            <div className="flex items-center px-6 py-4 border-b border-slate-800 sticky top-0 bg-background-dark z-20">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex-1">Project / Task</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-20 text-right">Time</span>
            </div>
            
            {projectGroups.map((group) => (
              <div key={group.id} className="border-b border-slate-800/50">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/20 group hover:bg-slate-800/40 transition-colors">
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: group.color }}></div>
                  <span className="text-sm font-bold text-white flex-1 truncate">{group.name}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{group.tasks.length} tasks</span>
                </div>
                
                {group.tasks.map((task) => (
                  <div key={task.id} className="flex items-center px-6 py-3 border-b border-slate-800/30 hover:bg-slate-800/30 transition-all cursor-pointer group pl-10">
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className="text-sm text-slate-300 truncate font-medium group-hover:text-white transition-colors">{task.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-tight">{task.originalTask.status}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button onClick={(e) => { e.stopPropagation(); onUpdate(task.id, { status: 'completed' }); }} className="p-1 px-1.5 hover:bg-green-500/20 text-slate-400 hover:text-green-500 rounded transition-all">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onEdit(task.originalTask); }} className="p-1 px-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-all">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="p-1 px-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition-all">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            
            {!tasks.length && (
              <div className="p-10 text-center text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-4 block opacity-20">inventory_2</span>
                <p className="text-sm">No tasks found. Create some in the Dashboard!</p>
              </div>
            )}
          </div>

          {/* Right Panel: Timeline Grid */}
          <div className="flex-1 relative bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px)] bg-[size:calc(100%/18)_100%]">
            {/* Date Headers */}
            <div className="border-b border-slate-800 sticky top-0 bg-background-dark z-30">
              <div className="flex border-b border-slate-800/30">
                {days.map((day, i) => (
                  <div
                    key={day}
                    className={`flex-1 text-center py-4 text-[10px] font-bold uppercase tracking-widest border-r border-slate-800/30 ${i === todayIndex ? 'text-primary bg-primary/5' : 'text-slate-500'}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Rows with bars */}
            <div className="relative min-h-full">
              {/* Today line */}
              <div
                className="absolute top-0 bottom-0 w-px bg-primary/30 z-20 pointer-events-none"
                style={{ left: `${((todayIndex + 0.5) / days.length) * 100}%` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-primary -ml-[5px] -mt-1.5 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              </div>

              {projectGroups.map((group) => (
                <div key={group.id} className="relative">
                  {/* Group Container Header row (background only) */}
                  <div className="h-12 border-b border-slate-800/30 bg-slate-800/5"></div>
                  
                  {/* Task rows */}
                  {group.tasks.map((task) => (
                    <div key={task.id} className="h-11 border-b border-slate-800/20 relative group hover:bg-white/[0.02] transition-colors">
                      <div
                        onClick={() => onStart(task.originalTask)}
                        className={`absolute top-2.5 h-6 rounded-lg shadow-lg cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-center px-3 z-10 border border-white/10`}
                        style={{
                          left: `${(task.startDay / days.length) * 100}%`,
                          width: `${(task.lengthDays / days.length) * 100}%`,
                          backgroundColor: task.isMilestone ? '#64748b' : group.color
                        }}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          {task.isMilestone && <span className="material-symbols-outlined text-[14px]">diamond</span>}
                          <span className="text-[10px] font-bold text-white truncate drop-shadow-sm">{task.name}</span>
                        </div>
                        {/* Status dot */}
                        <div className={`absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full border-2 border-background-dark ${task.originalTask.status === 'completed' ? 'bg-green-500' : task.originalTask.status === 'in-progress' ? 'bg-primary' : 'bg-slate-500'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
