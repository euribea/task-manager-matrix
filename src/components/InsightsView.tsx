import type { Task } from '../types/Task';

interface InsightsViewProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStart: (task: Task) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ tasks, onUpdate, onDelete, onEdit, onStart }) => {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const focusScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Mock data for charts - Zeroed out until real analytics integration
  const velocityData = [0, 0, 0, 0, 0, 0, 0]; 
  const maxVelocity = Math.max(...velocityData, 1); // Avoid division by zero
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
 
  // Peak hours data
  const peakHoursData = [0, 0, 0, 0, 0, 0];
  const maxPeakHour = Math.max(...peakHoursData, 1);
  const peakHourLabels = ['8am', '10am', '12pm', '2pm', '4pm', '6pm'];
 
  // Focus distribution (placeholder logic based on actual tasks if possible, or 0)
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  
  const deepWorkPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const adminPct = totalCount > 0 ? Math.round((inProgressCount / totalCount) * 100) : 0;
  const otherPct = totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;
  // SVG donut chart calculations
  const donutRadius = 40;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const deepWorkDash = (deepWorkPct / 100) * donutCircumference;
  const adminDash = (adminPct / 100) * donutCircumference;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <header className="shrink-0 px-6 md:px-10 py-6 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-dark/95 backdrop-blur z-10 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Productivity Insights</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your performance, focus habits, and task completion velocity.</p>
          </div>
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            <button className="px-4 py-1.5 rounded-md text-sm bg-primary text-white font-bold shadow-sm transition-all">Last 7 Days</button>
            <button className="px-4 py-1.5 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">This Month</button>
            <button className="px-4 py-1.5 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">Quarter</button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Focus Score */}
            <div className="bg-white dark:bg-surface-lighter rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-primary/50 transition-colors shadow-sm dark:shadow-none">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <span className="material-symbols-outlined">bolt</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Focus Score</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">trending_up</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{focusScore}<span className="text-xl text-slate-400 dark:text-slate-500 font-medium">/100</span></p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+12%
                  </span>
                  <span className="text-xs text-slate-500">vs. previous period</span>
                </div>
              </div>
            </div>

            {/* Tasks Completed */}
            <div className="bg-white dark:bg-surface-lighter rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-primary/50 transition-colors shadow-sm dark:shadow-none">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tasks Completed</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">trending_up</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{completedCount}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+18%
                  </span>
                  <span className="text-xs text-slate-500">vs. previous period</span>
                </div>
              </div>
            </div>

            {/* Avg Daily Focus */}
            <div className="bg-white dark:bg-surface-lighter rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-primary/50 transition-colors shadow-sm dark:shadow-none">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Daily Focus</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">trending_down</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">4h 12m</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">arrow_downward</span>-8%
                  </span>
                  <span className="text-xs text-slate-500">vs. previous period</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Productivity Velocity - Area Chart */}
            <div className="lg:col-span-3 bg-white dark:bg-surface-lighter rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Productivity Velocity</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Task completion trend over time</p>
                </div>
                <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                </button>
              </div>
              {/* Simple area chart with SVG */}
              <div className="relative h-48">
                <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line key={i} x1="0" y1={i * 50} x2="700" y2={i * 50} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
                  ))}
                  {/* Area fill */}
                  <defs>
                    <linearGradient id="velocityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#195de6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#195de6" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M0,${200 - (velocityData[0] / maxVelocity) * 180} ${velocityData.map((v, i) => `L${(i / (velocityData.length - 1)) * 700},${200 - (v / maxVelocity) * 180}`).join(' ')} L700,200 L0,200 Z`}
                    fill="url(#velocityGradient)"
                  />
                  {/* Line */}
                  <polyline
                    points={velocityData.map((v, i) => `${(i / (velocityData.length - 1)) * 700},${200 - (v / maxVelocity) * 180}`).join(' ')}
                    fill="none"
                    stroke="#195de6"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Dots */}
                  {velocityData.map((v, i) => (
                    <circle
                      key={i}
                      cx={(i / (velocityData.length - 1)) * 700}
                      cy={200 - (v / maxVelocity) * 180}
                      r="4"
                      fill="#195de6"
                      stroke="currentColor"
                      className="text-white dark:text-[#111621]"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-400 -ml-6">
                  {[10, 8, 6, 4, 0].map(v => <span key={v}>{v}</span>)}
                </div>
              </div>
              {/* X-axis labels */}
              <div className="flex justify-between mt-3 px-1">
                {daysOfWeek.map(day => (
                  <span key={day} className="text-xs text-slate-500">{day}</span>
                ))}
              </div>
            </div>

            {/* Right column: Focus Distribution + Peak Hours */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Focus Distribution - Donut */}
              <div className="bg-white dark:bg-surface-lighter rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Focus Distribution</h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-28 h-28 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r={donutRadius} fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r={donutRadius}
                        fill="none" stroke="#195de6" strokeWidth="8"
                        strokeDasharray={`${deepWorkDash} ${donutCircumference}`}
                        strokeLinecap="round"
                      />
                      <circle
                        cx="50" cy="50" r={donutRadius}
                        fill="none" stroke="#22c55e" strokeWidth="8"
                        strokeDasharray={`${adminDash} ${donutCircumference}`}
                        strokeDashoffset={-deepWorkDash}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">{deepWorkPct}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">Deep Work</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white ml-auto">{deepWorkPct}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">Admin</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white ml-auto">{adminPct}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">Other</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white ml-auto">{otherPct}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Peak Hours - Bar Chart */}
              <div className="bg-white dark:bg-surface-lighter rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Peak Hours</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Activity by time of day</p>
                <div className="flex items-end gap-3 h-24">
                  {peakHoursData.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t transition-all ${i === 1 ? 'bg-primary' : 'bg-primary/40'}`}
                        style={{ height: `${(val / maxPeakHour) * 100}%` }}
                      ></div>
                      <span className="text-[10px] text-slate-500">{peakHourLabels[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Daily Insight + Action Items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Insight */}
            <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 rounded-xl p-6 border border-primary/10 dark:border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-full bg-primary/20">
                  <span className="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
                </div>
                <span className="text-xs font-bold text-primary dark:text-primary uppercase tracking-wider">Daily Insight</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-white leading-relaxed">
                {totalCount > 0 
                  ? "Based on your current activity, we're analyzing your peak productivity windows to provide personalized focus insights."
                  : "Start completing tasks to unlock personalized productivity insights and peak performance analysis."}
              </p>
            </div>

            {/* Action Items */}
            <div className="lg:col-span-2 bg-white dark:bg-surface-lighter rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Action Items: High Priority</h3>
                <button className="text-sm text-primary font-medium hover:text-blue-500 dark:hover:text-blue-400 transition-colors">View Matrix</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700/50 text-left">
                      <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 pr-4">Task Name</th>
                      <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 pr-4">Due Date</th>
                      <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 pr-4">Status</th>
                      <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.filter(t => t.status !== 'completed').slice(0, 4).map((task) => (
                      <tr key={task.id} className="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 pr-4">
                          <span className="text-sm text-slate-900 dark:text-white font-medium">{task.title}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {task.createdAt?.toDate ? task.createdAt.toDate().toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${task.status === 'pending' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                            {task.status === 'pending' ? 'Pending' : 'In Progress'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => onUpdate(task.id, { status: 'completed' })} className="p-1 hover:bg-green-50 dark:hover:bg-green-500/20 text-slate-400 hover:text-green-600 dark:hover:text-green-500 transition-all rounded" title="Complete task">
                              <span className="material-symbols-outlined text-[18px]">check</span>
                            </button>
                            <button onClick={() => onStart(task)} className="p-1 hover:bg-blue-50 dark:hover:bg-primary/20 text-primary hover:text-blue-600 dark:hover:text-blue-400 transition-all rounded shadow-sm hover:shadow-primary/20" title="Start Focus Session">
                              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                            </button>
                            <button onClick={() => onEdit(task)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all rounded" title="Edit Task">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button onClick={() => onDelete(task.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-500/20 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all rounded" title="Delete Task">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {tasks.filter(t => t.status !== 'completed').length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-sm text-slate-400 italic">All tasks completed! 🎉</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
