import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { Task, Project } from './types/Task';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { Timer } from './components/Timer';
import { GanttChart } from './components/GanttChart';
import { InsightsView } from './components/InsightsView';
import { TaskMatrix } from './components/TaskMatrix';
import { TaskEditModal } from './components/TaskEditModal';
import { ProjectEditModal } from './components/ProjectEditModal';
import { SettingsView } from './components/SettingsView';

type ViewMode = 'dashboard' | 'tasks' | 'gantt' | 'matrix' | 'insights' | 'pomodoro' | 'settings';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  
  const [activePomodoroTask, setActivePomodoroTask] = useState<Task | null>(null);
   const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');

  // App Customization State
  const [appName, setAppName] = useState(() => localStorage.getItem('appName') || 'TaskMaster');
  const [appIcon, setAppIcon] = useState(() => localStorage.getItem('appIcon') || 'task_alt');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'Usuario');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || 'usuario@ejemplo.com');
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('userAvatar') || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y');

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
    localStorage.setItem('userName', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('userEmail', userEmail);
  }, [userEmail]);

  useEffect(() => {
    localStorage.setItem('userAvatar', userAvatar);
  }, [userAvatar]);

  useEffect(() => {
    // Fetcch Projects
    const qProjects = query(collection(db, 'projects'));
    const unsubscribeProjects = onSnapshot(qProjects, (querySnapshot) => {
      const projectsData: Project[] = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projectsData);
    });

    // Fetch Tasks
    const qTasks = query(collection(db, 'tasks'));
    const unsubscribeTasks = onSnapshot(qTasks, (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasksData.push({ 
          id: doc.id, 
          ...data,
          description: data.description || data.notes || '',
          status: (data.status === 'Pendiente' || data.status === 'pending') ? 'pending' : 
                  (data.status === 'Completada' || data.status === 'Completado' || data.status === 'completed') ? 'completed' : 'in-progress'
        } as Task);
      });
      setTasks(tasksData);
      setLoading(false);
      
      if (activePomodoroTask) {
        const updatedTask = tasksData.find(t => t.id === activePomodoroTask.id);
        if (updatedTask) {
          setActivePomodoroTask(updatedTask);
        }
      }
    }, (err) => {
      console.error("Error fetching tasks: ", err);
      setError("Failed to load tasks.");
      setLoading(false);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeTasks();
    };
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
        projectId: selectedProjectId || '',
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

  const handleCreateProject = async () => {
    const name = prompt('Project Name:');
    if (!name) return;
    
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    try {
      await addDoc(collection(db, 'projects'), {
        name,
        color: randomColor,
        userId: 'flux-titan-user-001',
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error("Error creating project: ", err);
      setError(err.message || 'Error occurred while creating project.');
    }
  };

  const handleUpdateProject = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (id: string, updates: Partial<Project>) => {
    try {
      await updateDoc(doc(db, 'projects', id), updates);
      setIsProjectModalOpen(false);
      setEditingProject(null);
    } catch (err: any) {
      console.error("Error updating project: ", err);
      setError(err.message || 'Error occurred while updating project.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? Tasks will remain but without a project assignment.')) return;

    try {
      // 1. Delete the project
      await deleteDoc(doc(db, 'projects', id));
      
      // 2. Clear projectId for all tasks in this project
      const projectTasks = tasks.filter(t => t.projectId === id);
      for (const task of projectTasks) {
        await updateDoc(doc(db, 'tasks', task.id), {
          projectId: ''
        });
      }
      
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
    } catch (err: any) {
      console.error("Error deleting project: ", err);
      setError(err.message || 'Error occurred while deleting project.');
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
      <div className="flex h-screen items-center justify-center bg-white dark:bg-background-dark text-slate-900 dark:text-white transition-colors">
        <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl animate-spin text-primary">autorenew</span>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Loading your focus dashboard...</p>
        </div>
      </div>
    );
  }

  // If we have an active pomodoro task, render ONLY the Timer View
  if (activePomodoroTask) {
    return (
      <div className="flex flex-col relative h-screen w-full overflow-hidden bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors">
         <Timer task={activePomodoroTask} onExit={() => setActivePomodoroTask(null)} onEdit={() => handleEditTask(activePomodoroTask)} />
         {/* Edit Modal for Pomodoro View */}
         <TaskEditModal 
           task={editingTask}
           isOpen={isEditModalOpen}
           projects={projects}
           onClose={() => {
             setIsEditModalOpen(false);
             setEditingTask(null);
           }}
           onSave={async (id, updates) => {
             await handleUpdateTask(id, updates);
             setIsEditModalOpen(false);
             setEditingTask(null);
           }}
         />
      </div>
    );
  }

  // Filter tasks by selected project and search query
  const filteredTasks = tasks.filter(t => {
    const matchesProject = !selectedProjectId || t.projectId === selectedProjectId;
    const matchesSearch = !searchQuery || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesProject && matchesSearch;
  });

  // Dashboard stats
  const completedCount = filteredTasks.filter(t => t.status === 'completed').length;
  const pendingCount = filteredTasks.length - completedCount;
  const progressPercent = filteredTasks.length > 0 ? Math.round((completedCount / filteredTasks.length) * 100) : 0;

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
        return <GanttChart tasks={filteredTasks} projects={projects} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} onEdit={handleEditTask} onStart={handleStartPomodoro} />;
      case 'insights':
        return <InsightsView tasks={filteredTasks} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} onEdit={handleEditTask} onStart={handleStartPomodoro} />;
      case 'matrix':
        return <TaskMatrix tasks={filteredTasks} onStart={handleStartPomodoro} onEdit={handleEditTask} onDelete={handleDeleteTask} onUpdate={handleUpdateTask} />;
      case 'settings':
        return (
          <SettingsView 
            appName={appName} 
            setAppName={setAppName} 
            appIcon={appIcon} 
            setAppIcon={setAppIcon} 
            theme={theme} 
            setTheme={setTheme} 
            userName={userName}
            setUserName={setUserName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            userAvatar={userAvatar}
            setUserAvatar={setUserAvatar}
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
                      {currentView === 'tasks' ? 'My Tasks' : `Good morning, ${userName.split(' ')[0]}`}
                    </h2>
                    {currentView === 'dashboard' && (
                      <p className="text-sm text-slate-400">{dateString}</p>
                    )}
                </div>
                
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="hidden md:flex items-center bg-slate-50 dark:bg-surface-lighter rounded-lg px-3 py-2 w-64 border border-slate-200 dark:border-slate-700 focus-within:border-primary transition-colors">
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                      <input 
                        className="bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 w-full ml-2 p-0 outline-none" 
                        placeholder="Search tasks..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="p-1 hover:text-slate-900 dark:hover:text-white text-slate-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      )}
                  </div>
                  {/* Notification bell */}
                  <button className="relative p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-surface-lighter">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
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
                          <div className="bg-white dark:bg-surface-lighter rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between hover:border-primary/50 transition-colors group shadow-sm dark:shadow-none">
                              <div className="flex items-start justify-between">
                                  <div className="p-2 rounded-lg bg-green-500/10 text-green-500 dark:text-green-400">
                                      <span className="material-symbols-outlined">check_circle</span>
                                  </div>
                                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+{progressPercent}%</span>
                              </div>
                              <div className="mt-4">
                                  <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{completedCount}<span className="text-xl text-slate-400 font-medium">/{tasks.length}</span></p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tasks Completed</p>
                              </div>
                          </div>

                          {/* Focus Time */}
                          <div className="bg-white dark:bg-surface-lighter rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between hover:border-primary/50 transition-colors group shadow-sm dark:shadow-none">
                              <div className="flex items-start justify-between">
                                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                      <span className="material-symbols-outlined">schedule</span>
                                  </div>
                              </div>
                              <div className="mt-4">
                                  <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">--</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Focus Time</p>
                              </div>
                          </div>

                          {/* Pending Tasks */}
                          <div className="bg-white dark:bg-surface-lighter rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between hover:border-primary/50 transition-colors group shadow-sm dark:shadow-none">
                              <div className="flex items-start justify-between">
                                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 dark:text-orange-400">
                                      <span className="material-symbols-outlined">pending_actions</span>
                                  </div>
                              </div>
                              <div className="mt-4">
                                  <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{pendingCount}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pending Tasks</p>
                              </div>
                          </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Area Layout (Active/pending tasks) */}
                        <div className="lg:col-span-2 flex flex-col gap-6 border-slate-800">
                          <TaskList 
                            tasks={filteredTasks} 
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
                              <div className="bg-white dark:bg-surface-lighter rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm dark:shadow-none">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">grid_view</span>
                                    Matrix Overview
                                </h3>
                                <div className="grid grid-cols-2 gap-2 h-48">
                                    <div onClick={() => setCurrentView('matrix')} className="bg-slate-50 dark:bg-[#2c3b55] rounded-lg p-3 flex flex-col justify-between border-l-4 border-red-500 hover:bg-slate-100 dark:hover:bg-[#324260] transition-colors cursor-pointer">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Do First</span>
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                          {filteredTasks.filter(t => t.isUrgent && t.isImportant && t.status !== 'completed').length}
                                        </span>
                                    </div>
                                    <div onClick={() => setCurrentView('matrix')} className="bg-slate-50 dark:bg-[#2c3b55] rounded-lg p-3 flex flex-col justify-between border-l-4 border-blue-500 hover:bg-slate-100 dark:hover:bg-[#324260] transition-colors cursor-pointer">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Schedule</span>
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                          {filteredTasks.filter(t => !t.isUrgent && t.isImportant && t.status !== 'completed').length}
                                        </span>
                                    </div>
                                    <div onClick={() => setCurrentView('matrix')} className="bg-slate-50 dark:bg-[#2c3b55] rounded-lg p-3 flex flex-col justify-between border-l-4 border-orange-500 hover:bg-slate-100 dark:hover:bg-[#324260] transition-colors cursor-pointer">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Delegate</span>
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                          {filteredTasks.filter(t => t.isUrgent && !t.isImportant && t.status !== 'completed').length}
                                        </span>
                                    </div>
                                    <div onClick={() => setCurrentView('matrix')} className="bg-slate-50 dark:bg-[#2c3b55] rounded-lg p-3 flex flex-col justify-between border-l-4 border-slate-500 hover:bg-slate-100 dark:hover:bg-[#324260] transition-colors cursor-pointer">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Eliminate</span>
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                          {filteredTasks.filter(t => !t.isUrgent && !t.isImportant && t.status !== 'completed').length}
                                        </span>
                                    </div>
                                </div>
                              </div>

                              {/* Tomorrow / Next Up (Placeholders removed as requested) */}
                               <div className="bg-white dark:bg-surface-lighter rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 flex-1 shadow-sm dark:shadow-none flex flex-col items-center justify-center text-center py-12">
                                <span className="material-symbols-outlined text-4xl text-slate-200 dark:text-slate-700 mb-2">calendar_today</span>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Scheduled tasks for tomorrow will appear here as you add them.</p>
                              </div>
                            </>
                          )}
                          
                          {/* Pomodoro hint card for non-dashboard views */}
                          {currentView === 'tasks' && (
                            <div className="bg-white dark:bg-surface-lighter border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col items-center">
                                <span className="material-symbols-outlined text-6xl text-primary/20 mb-3 block text-center">timelapse</span>
                                <p className="text-sm text-center text-slate-600 dark:text-slate-300">Click <strong>"Focus Session"</strong> on any task to instantly enter full-screen pomodoro mode.</p>
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
                      <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/30 flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-primary text-[24px]">{appIcon}</span>
                      </div>
                      <div className="flex flex-col">
                          <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight">{appName}</h1>
                          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Pro Plan</p>
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

                  {/* Projects Section */}
                  <div className="flex flex-col gap-2 mt-4">
                      <div className="flex items-center justify-between px-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Projects</span>
                          <button 
                            onClick={handleCreateProject}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-surface-lighter rounded text-slate-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                          </button>
                      </div>
                      <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto pr-1 flex-1">
                          <button 
                            onClick={() => setSelectedProjectId(null)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                              !selectedProjectId 
                              ? 'bg-slate-100 dark:bg-surface-lighter text-slate-900 dark:text-white font-semibold' 
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                              <span className="material-symbols-outlined text-[18px]">all_out</span>
                              <span className="text-sm">All Tasks</span>
                          </button>
                          {projects.map(project => (
                              <div 
                                key={project.id}
                                className={`flex items-center gap-1 group px-1 py-1 rounded-lg transition-all ${
                                  selectedProjectId === project.id
                                  ? 'bg-primary/10'
                                  : 'hover:bg-slate-100 dark:hover:bg-surface-lighter'
                                }`}
                              >
                                <button 
                                  onClick={() => setSelectedProjectId(project.id)}
                                  className={`flex items-center gap-3 px-2 py-1 rounded-lg flex-1 text-left ${
                                    selectedProjectId === project.id
                                    ? 'text-primary font-semibold'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                  }`}
                                >
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: project.color || '#3b82f6' }}></div>
                                    <span className="text-sm truncate">{project.name}</span>
                                </button>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => handleUpdateProject(project.id)}
                                    className="p-1 text-slate-400 hover:text-primary rounded transition-colors"
                                    title="Edit Project"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProject(project.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                                    title="Delete Project"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </div>
                              </div>
                          ))}
                      </div>
                  </div>
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
        projects={projects}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateTask}
      />
      <ProjectEditModal
        project={editingProject}
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
      />
    </div>
  );
}

export default App;
