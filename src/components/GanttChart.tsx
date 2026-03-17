import { useState } from 'react';
import type { Task } from '../types/Task';

interface GanttChartProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStart: (task: Task) => void;
}

interface GanttTask {
  name: string;
  duration: string;
  startDay: number;
  lengthDays: number;
  color: string;
  phase?: string;
  isMilestone?: boolean;
  originalTask?: Task;
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, onUpdate, onDelete, onEdit, onStart }) => {
  const [viewMode, setViewMode] = useState<'Timeline' | 'Board' | 'List'>('Timeline');

  // Generate Gantt data from real tasks + some static demo data for visual completeness
  const phases: { phase: string; tasks: GanttTask[] }[] = [
    {
      phase: 'Phase 1: Planning',
      tasks: [
        { name: 'Market Research', duration: '5 days', startDay: 0, lengthDays: 5, color: 'bg-green-500' },
        { name: 'Competitor Analysis', duration: '3 days', startDay: 3, lengthDays: 3, color: 'bg-cyan-400' },
        { name: 'Draft Strategy', duration: '4 days', startDay: 5, lengthDays: 4, color: 'bg-purple-400' },
      ]
    },
    {
      phase: 'Phase 2: Execution',
      tasks: [
        { name: 'Design Assets', duration: '7 days', startDay: 7, lengthDays: 7, color: 'bg-pink-500' },
        { name: 'Content Creation', duration: '5 days', startDay: 9, lengthDays: 5, color: 'bg-pink-400' },
        { name: 'Social Media Plan', duration: '5 days', startDay: 11, lengthDays: 5, color: 'bg-pink-300' },
      ]
    },
  ];

  // Also add real tasks as milestones
  const realTasksMilestones: GanttTask[] = tasks.filter(t => t.status !== 'completed').slice(0, 5).map((t, i) => ({
    name: t.title,
    duration: '1 day',
    startDay: 14 + i,
    lengthDays: 1,
    color: 'bg-yellow-400',
    isMilestone: true,
    originalTask: t
  }));

  const days = ['01 Mon', '02 Tue', '03 Wed', '04 Thu', '05 Fri', '06 Sat', '07 Sun', '08 Mon', '09 Tue', '10 Wed', '11 Thu', '12 Fri', '13 Sat', '14 Sun', '15 Mon', '16 Tue', '17 Wed', '18 Thu'];
  const todayIndex = 4; // The "today" line

  return (
    <div className="flex flex-col h-full">
      {/* Top Navigation Bar */}
      <header className="shrink-0 px-6 md:px-10 py-4 flex items-center justify-between border-b border-slate-800 bg-background-dark/95 backdrop-blur z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Projects</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-white font-semibold">Q4 Marketing Launch</span>
            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold ml-2">Active</span>
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
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${viewMode === v ? 'bg-slate-700 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'}`}
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
          <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">sort</span>
            Sort
          </button>
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg px-3 py-1.5">
            <span className="text-sm text-white font-medium">Today</span>
          </div>
          <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden">
            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
          <span className="text-sm text-slate-400 font-medium">Month</span>
          <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/25 transition-all">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Task
          </button>
        </div>
      </div>

      {/* Gantt Chart Area */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-w-[1200px]">
          {/* Left Panel: Task List */}
          <div className="w-72 shrink-0 border-r border-slate-800">
            {/* Header */}
            <div className="flex items-center px-4 py-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-1">Task Name</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-20 text-right">Duration</span>
            </div>
            {/* Tasks */}
            {phases.map((phase) => (
              <div key={phase.phase}>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/30 border-b border-slate-800/50">
                  <span className="material-symbols-outlined text-primary text-[18px]">expand_more</span>
                  <span className="text-sm font-bold text-white">{phase.phase}</span>
                  <span className="text-xs text-slate-400 ml-auto">{phase.tasks.reduce((sum, t) => sum + t.lengthDays, 0)} days</span>
                </div>
                {phase.tasks.map((task) => (
                  <div key={task.name} className="flex items-center px-4 py-2.5 border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors cursor-pointer pl-10">
                    <span className="text-sm text-slate-300 flex-1">{task.name}</span>
                    <span className="text-xs text-slate-500 w-20 text-right">{task.duration}</span>
                  </div>
                ))}
              </div>
            ))}
            {/* Milestones from real tasks */}
            {realTasksMilestones.length > 0 && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border-y border-yellow-400/20">
                  <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Active Milestones</span>
                </div>
                {realTasksMilestones.map((task) => (
                  <div key={task.originalTask?.id} className="group flex items-center px-4 py-2.5 border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors pl-4">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="material-symbols-outlined text-yellow-400 text-[16px] shrink-0">diamond</span>
                      <span onClick={() => task.originalTask && onStart(task.originalTask)} className="text-sm text-yellow-400 font-medium truncate cursor-pointer hover:underline">{task.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button onClick={() => task.originalTask && onUpdate(task.originalTask.id, { status: 'completed' })} className="p-1 hover:bg-green-500/20 text-slate-400 hover:text-green-500 rounded transition-all" title="Complete">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </button>
                        <button onClick={() => task.originalTask && onEdit(task.originalTask)} className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-all" title="Edit">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onClick={() => task.originalTask && onDelete(task.originalTask.id)} className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition-all" title="Delete">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Add task button */}
            <div className="flex items-center gap-2 px-4 py-3 text-slate-500 hover:text-primary cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="text-sm font-medium">New Task</span>
            </div>
          </div>

          {/* Right Panel: Timeline Grid */}
          <div className="flex-1 relative">
            {/* Date Headers */}
            <div className="border-b border-slate-800 sticky top-0 bg-background-dark z-10">
              <div className="flex items-center px-0 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <div className="h-6 flex items-center justify-center px-2 col-span-full text-center text-xs text-slate-400">
                  OCTOBER 2025
                </div>
              </div>
              <div className="flex">
                {days.map((day, i) => (
                  <div
                    key={day}
                    className={`flex-1 text-center py-2 text-[10px] font-medium border-r border-slate-800/30 ${i === todayIndex ? 'text-primary bg-primary/5' : 'text-slate-500'}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Rows with bars */}
            <div className="relative">
              {/* Today line */}
              <div
                className="absolute top-0 bottom-0 w-px bg-primary/50 z-20"
                style={{ left: `${((todayIndex + 0.5) / days.length) * 100}%` }}
              >
                <div className="w-2 h-2 rounded-full bg-primary -ml-[3px] -mt-1"></div>
              </div>

              {phases.map((phase) => (
                <div key={phase.phase}>
                  {/* Phase row */}
                  <div className="h-10 border-b border-slate-800/30 relative">
                    <div
                      className="absolute top-2 h-6 bg-slate-600/40 rounded"
                      style={{
                        left: `${(phase.tasks[0].startDay / days.length) * 100}%`,
                        width: `${((phase.tasks[phase.tasks.length - 1].startDay + phase.tasks[phase.tasks.length - 1].lengthDays - phase.tasks[0].startDay) / days.length) * 100}%`
                      }}
                    ></div>
                  </div>
                  {/* Task bars */}
                  {phase.tasks.map((task) => (
                    <div key={task.name} className="h-10 border-b border-slate-800/30 relative group">
                      <div
                        className={`absolute top-2 h-6 ${task.color} rounded shadow-lg cursor-pointer transition-all group-hover:brightness-110 flex items-center px-2`}
                        style={{
                          left: `${(task.startDay / days.length) * 100}%`,
                          width: `${(task.lengthDays / days.length) * 100}%`
                        }}
                      >
                        <span className="text-[10px] font-bold text-white truncate">{task.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {/* Milestone rows */}
              {realTasksMilestones.map((task) => (
                <div key={task.name} className="h-10 border-b border-slate-800/30 relative">
                  <div
                    className="absolute top-1.5 w-5 h-5 bg-yellow-400 rotate-45 cursor-pointer hover:scale-110 transition-transform shadow-lg"
                    style={{
                      left: `${((task.startDay + 0.5) / days.length) * 100}%`,
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
