import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { Task } from './types/Task';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { Timer } from './components/Timer';
import { GanttChart } from './components/GanttChart';
import { InsightsView } from './components/InsightsView';
import { TaskMatrix } from './components/TaskMatrix';
import { TaskEditModal } from './components/TaskEditModal';
import { SettingsView } from './components/SettingsView';

type ViewMode = 'dashboard' | 'tasks' | 'gantt' | 'matrix' | 'insights' | 'pomodoro' | 'settings';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  
  const [activePomodoroTask, setActivePomodoroTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // App Customization State
  const [appName, setAppName] = useState(() => localStorage.getItem('appName') || 'TaskMaster');
  const [appIcon, setAppIcon] = useState(() => localStorage.getItem('appIcon') || 'task_alt');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('appName', appName);
  }, [appName]);

  useEffect(() => {
    localStorage.setItem('appIcon', appIcon);
  }, [appIcon]);

  useEffect(() => {
    // We remove the order by 'createdAt' as it might be missing in existing documents
    const q = query(collection(db, 'tasks'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Normalizing data from user's schema
        tasksData.push({ 
          id: doc.id, 
          ...data,
          // Map 'notes' to 'description' if description is missing
          description: data.description || data.notes || '',
          // Map 'Pendiente' or 'Completado' to 'pending' or 'completed'
          status: (data.status === 'Pendiente' || data.status === 'pending') ? 'pending' : 
                  (data.status === 'Completada' || data.status === 'Completado' || data.status === 'completed') ? 'completed' : 'in-progress'
        } as Task);
      });
      setTasks(tasksData);
      setLoading(false);
      
      // Update active pomodoro task reference if it was changed externally
      if (activePomodoroTask) {
        const updatedTask = tasksData.find(t => t.id === activePomodoroTask.id);
        if (updatedTask) {
          setActivePomodoroTask(updatedTask);
        }
      }
    }, (err) => {
      console.error("Error fetching tasks: ", err);
      setError("Failed to load tasks. Please check your Firestore rules.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activePomodoroTask]);

  const handleAddTask = async (title: string, description: string) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        title,
        notes: description,
        status: 'Pendiente',
        priority: 'Baja',
        isUrgent: false,
        isImportant: false,
        userId: 'flux-titan-user-001',
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error("Error adding task: ", err);
      setError(err.message || 'Error occurred while saving task.');
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const taskRef = doc(db, 'tasks', id);
      const firestoreUpdates: any = { ...updates };
      
      // Map back to Firestore schema if we are updating status/description
      if (updates.status === 'pending') firestoreUpdates.status = 'Pendiente';
      if (updates.status === 'in-progress') firestoreUpdates.status = 'En Progreso';
      if (updates.status === 'completed') firestoreUpdates.status = 'Completada';
      if (updates.description) firestoreUpdates.notes = updates.description;
      if (updates.isUrgent !== undefined) firestoreUpdates.isUrgent = updates.isUrgent;
      if (updates.isImportant !== undefined) firestoreUpdates.isImportant = updates.isImportant;

      await updateDoc(taskRef, firestoreUpdates);
    } catch (err: any) {
      console.error("Error updating task: ", err);
      setError(err.message || 'Error occurred while updating task.');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (err: any) {
      console.error("Error deleting task: ", err);
      setError(err.message || 'Error occurred while deleting task.');
    }
  };

  const handleStartPomodoro = (task: Task) => {
    setActivePomodoroTask(task);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-dark text-white">
        <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl animate-spin text-primary">autorenew</span>
            <p className="mt-4 text-slate-400">Loading your focus dashboard...</p>
        </div>
      </div>
    );
  }

  // If we have an active pomodoro task, render ONLY the Timer View
  if (activePomodoroTask) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background-dark text-slate-100 font-display">
         <Timer task={activePomodoroTask} onExit={() => setActivePomodoroTask(null)} />
      </div>
    );
  }

  // Dashboard stats
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.length - completedCount;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Navigation items matching the Stitch sidebar design  
  const navItems: { id: ViewMode; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'tasks', icon: 'check_circle', label: 'My Tasks' },
    { id: 'gantt', icon: 'bar_chart', label: 'Gantt View' },
    { id: 'matrix', icon: 'grid_view', label: 'Matrix' },
    { id: 'insights', icon: 'insights', label: 'Insights' },
    { id: 'pomodoro', icon: 'timer', label: 'Pomodoro' },
  ];

  // Get current date info
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dateString = `${dayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}${getDaySuffix(now.getDate())}`;

  function getDaySuffix(day: number): string {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'gantt':
        return <GanttChart tasks={tasks} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} onEdit={handleEditTask} onStart={handleStartPomodoro} />;
      case 'insights':
        return <InsightsView tasks={tasks} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} onEdit={handleEditTask} onStart={handleStartPomodoro} />;
      case 'matrix':
        return <TaskMatrix tasks={tasks} onStart={handleStartPomodoro} onEdit={handleEditTask} onDelete={handleDeleteTask} onUpdate={handleUpdateTask} />;
      case 'settings':
        return (
          <SettingsView 
            appName={appName} 
            setAppName={setAppName} 
            appIcon={appIcon} 
            setAppIcon={setAppIcon} 
            theme={theme} 
            setTheme={setTheme} 
          />
        );
      case 'tasks':
      case 'dashboard':
      default:
        return (
          <>
            {/* Header */}
            <header className="h-20 shrink-0 px-6 md:px-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-dark/95 backdrop-blur z-10 transition-colors">
                <div className="flex flex-col">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {currentView === 'tasks' ? 'My Tasks' : `Good morning, Alex`}
                    </h2>
                    {currentView === 'dashboard' && (
                      <p className="text-sm text-slate-400">{dateString}</p>
                    )}
                </div>
                
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="hidden md:flex items-center bg-surface-lighter rounded-lg px-3 py-2 w-64 border border-slate-700 focus-within:border-primary transition-colors">
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                      <input className="bg-transparent border-none text-sm text-white placeholder-slate-400 focus:ring-0 w-full ml-2 p-0 outline-none" placeholder="Search tasks..." type="text"/>
                  </div>
                  {/* Notification bell */}
                  <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-surface-lighter">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background-dark"></span>
                  </button>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide">
                <div className="max-w-6xl mx-auto flex flex-col gap-8">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        <p>{error}</p>
                      </div>
                    )}

                    {/* Stats Grid - only on dashboard */}
                    {currentView === 'dashboard' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Tasks Completed */}
                          <div className="bg-surface-lighter rounded-xl p-6 border border-slate-700/50 flex flex-col justify-between hover:border-primary/50 transition-colors group">
                              <div className="flex items-start justify-between">
                                  <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                                      <span className="material-symbols-outlined">check_circle</span>
                                  </div>
                                  <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+{progressPercent}%</span>
                              </div>
                              <div className="mt-4">
                                  <p className="text-3xl font-bold text-white tracking-tight">{completedCount}<span className="text-xl text-slate-500 font-medium">/{tasks.length}</span></p>
                                  <p className="text-sm text-slate-400 mt-1">Tasks Completed</p>
                              </div>
                          </div>

                          {/* Focus Time */}
                          <div className="bg-surface-lighter rounded-xl p-6 border border-slate-700/50 flex flex-col justify-between hover:border-primary/50 transition-colors group">
                              <div className="flex items-start justify-between">
                                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                      <span className="material-symbols-outlined">schedule</span>
                                  </div>
                                  <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+25m</span>
                              </div>
                              <div className="mt-4">
                                  <p className="text-3xl font-bold text-white tracking-tight">3h 20m</p>
                                  <p className="text-sm text-slate-400 mt-1">Focus Time</p>
                              </div>
                          </div>

                          {/* Pending Tasks */}
                          <div className="bg-surface-lighter rounded-xl p-6 border border-slate-700/50 flex flex-col justify-between hover:border-primary/50 transition-colors group">
                              <div className="flex items-start justify-between">
                                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                      <span className="material-symbols-outlined">pending_actions</span>
                                  </div>
                                  <span className="text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">-2</span>
                              </div>
                              <div className="mt-4">
                                  <p className="text-3xl font-bold text-white tracking-tight">{pendingCount}</p>
                                  <p className="text-sm text-slate-400 mt-1">Pending Tasks</p>
                              </div>
                          </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Area Layout (Active/pending tasks) */}
                        <div className="lg:col-span-2 flex flex-col gap-6 border-slate-800">
                          <TaskList 
                            tasks={tasks} 
                            onUpdate={handleUpdateTask} 
                            onDelete={handleDeleteTask} 
                            onEdit={handleEditTask}
                            onStart={handleStartPomodoro} 
                          />
                        </div>

                        {/* Right Column Layout */}
                        <div className="flex flex-col gap-6 border-slate-800">
                          <TaskForm onAdd={handleAddTask} />
                          
                          {/* Matrix Mini Overview - matching Stitch design */}
                          {currentView === 'dashboard' && (
                            <>
                              <div className="bg-surface-lighter rounded-xl border border-slate-700/50 p-5">
                                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">grid_view</span>
                                    Matrix Overview
                                </h3>
                                <div className="grid grid-cols-2 gap-2 h-48">
                                    <div onClick={() => setCurrentView('matrix')} className="bg-[#2c3b55] rounded-lg p-3 flex flex-col justify-between border-l-4 border-red-500 hover:bg-[#324260] transition-colors cursor-pointer">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Do First</span>
                                        <span className="text-2xl font-bold text-white">3</span>
                                    </div>
                                    <div onClick={() => setCurrentView('matrix')} className="bg-[#2c3b55] rounded-lg p-3 flex flex-col justify-between border-l-4 border-blue-500 hover:bg-[#324260] transition-colors cursor-pointer">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Schedule</span>
                                        <span className="text-2xl font-bold text-white">5</span>
                                    </div>
                                    <div onClick={() => setCurrentView('matrix')} className="bg-[#2c3b55] rounded-lg p-3 flex flex-col justify-between border-l-4 border-orange-500 hover:bg-[#324260] transition-colors cursor-pointer">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Delegate</span>
                                        <span className="text-2xl font-bold text-white">2</span>
                                    </div>
                                    <div onClick={() => setCurrentView('matrix')} className="bg-[#2c3b55] rounded-lg p-3 flex flex-col justify-between border-l-4 border-slate-500 hover:bg-[#324260] transition-colors cursor-pointer">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Eliminate</span>
                                        <span className="text-2xl font-bold text-white">1</span>
                                    </div>
                                </div>
                              </div>

                              {/* Tomorrow / Next Up */}
                              <div className="bg-surface-lighter rounded-xl border border-slate-700/50 p-5 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-base font-bold text-white">Tomorrow</h3>
                                  <button className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700">
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                  </button>
                                </div>
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-slate-500"></div>
                                    <div>
                                      <p className="text-sm text-slate-200 font-medium">Review Q4 Budget</p>
                                      <p className="text-xs text-slate-500">10:00 AM • Finance</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-slate-500"></div>
                                    <div>
                                      <p className="text-sm text-slate-200 font-medium">Dentist Appointment</p>
                                      <p className="text-xs text-slate-500">02:30 PM • Personal</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-slate-500"></div>
                                    <div>
                                      <p className="text-sm text-slate-200 font-medium">Team Sync</p>
                                      <p className="text-xs text-slate-500">04:00 PM • Work</p>
                                    </div>
                                  </div>
                                </div>
                                {/* Productivity Tip */}
                                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 border border-white/5">
                                  <p className="text-xs font-semibold text-primary mb-1">Productivity Tip</p>
                                  <p className="text-sm text-white italic">"The key is not to prioritize what's on your schedule, but to schedule your priorities."</p>
                                </div>
                              </div>
                            </>
                          )}
                          
                          {/* Pomodoro hint card for non-dashboard views */}
                          {currentView === 'tasks' && (
                            <div className="bg-surface-lighter border border-slate-700/50 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col items-center">
                                <span className="material-symbols-outlined text-6xl text-primary/20 mb-3 block text-center">timelapse</span>
                                <p className="text-sm text-center text-slate-300">Click <strong>"Focus Session"</strong> on any task to instantly enter full-screen pomodoro mode.</p>
                            </div>
                          )}
                        </div>
                    </div>
                </div>
            </div>
          </>
        );
    }
  };

  return (
      <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors">
      {/* Sidebar - matches Stitch design exactly */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-[#111722] border-r border-slate-200 dark:border-slate-800 h-full shrink-0 transition-colors">
          <div className="flex flex-col h-full justify-between p-4">
              <div className="flex flex-col gap-6">
                  {/* User Profile Header */}
                  <div className="flex gap-3 items-center px-2">
                      <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/30 flex items-center justify-center bg-slate-800">
                        <span className="material-symbols-outlined text-primary text-[24px]">{appIcon}</span>
                      </div>
                      <div className="flex flex-col">
                          <h1 className="text-white text-base font-bold leading-tight">{appName}</h1>
                          <p className="text-slate-400 text-xs font-medium">Pro Plan</p>
                      </div>
                  </div>
                  {/* Navigation */}
                  <nav className="flex flex-col gap-1">
                      {navItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.id === 'pomodoro' && tasks.length > 0) {
                              // If Pomodoro is clicked, auto-select first pending task
                              const firstPending = tasks.find(t => t.status !== 'completed');
                              if (firstPending) {
                                handleStartPomodoro(firstPending);
                              } else {
                                setCurrentView(item.id);
                              }
                            } else {
                              setCurrentView(item.id);
                            }
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                            currentView === item.id
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-lighter'
                          }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            <span className={`text-sm ${currentView === item.id ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                        </button>
                      ))}
                  </nav>
              </div>
              {/* Bottom Actions */}
              <div className="flex flex-col gap-2 mt-auto">
                  {/* Storage indicator */}
                  <div className="px-3 py-4 rounded-xl bg-slate-100 dark:bg-surface-lighter/50 border border-slate-200 dark:border-slate-700/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Storage</span>
                          <span className="text-xs font-medium text-primary">75%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 transition-colors">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                  </div>
                  {/* Settings */}
                  <button 
                    onClick={() => setCurrentView('settings')}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      currentView === 'settings' 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-lighter'
                    }`}
                  >
                      <span className="material-symbols-outlined text-[20px]">settings</span>
                      <span className="text-sm font-medium">Settings</span>
                  </button>
                  {/* Log Out */}
                  <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      <span className="text-sm font-medium">Log Out</span>
                  </button>
              </div>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {renderMainContent()}
      </main>

      {/* Edit Modal */}
      <TaskEditModal 
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateTask}
      />
    </div>
  );
}

export default App;
