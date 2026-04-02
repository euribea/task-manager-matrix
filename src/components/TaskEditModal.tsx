import React, { useState, useEffect } from 'react';
import type { Task, TaskLogEntry } from '../types/Task';

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  projects: any[]; // Project[] or any[]
  onClose: () => void;
  onSave: (id: string, updates: Partial<Task>) => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({ task, isOpen, projects, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [status, setStatus] = useState('Pendiente');
  const [projectId, setProjectId] = useState('');
  const [log, setLog] = useState<TaskLogEntry[]>([]);
  const [logInput, setLogInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setNotes(task.notes || task.description || '');
      setIsUrgent(task.isUrgent || false);
      setIsImportant(task.isImportant || false);
      setStatus(task.status || 'Pendiente');
      setProjectId(task.projectId || '');
      setLog(task.log || []);
      
      // Helper to format Date/Timestamp to YYYY-MM-DD
      const formatDate = (val: any) => {
        if (!val) return '';
        const d = val.seconds ? new Date(val.seconds * 1000) : new Date(val);
        try {
          return d.toISOString().split('T')[0];
        } catch (e) {
          return '';
        }
      };
      
      setStartDate(formatDate(task.startDate));
      setDueDate(formatDate(task.dueDate));
    } else {
      // Reset for new task
      setTitle('');
      setNotes('');
      setIsUrgent(false);
      setIsImportant(false);
      setStatus('Pendiente');
      setProjectId('');
      setLog([]);
      setStartDate('');
      setDueDate('');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const isNewTask = !task.id;

  const handleAddLogEntry = () => {
    if (!logInput.trim()) return;
    
    const newEntry: TaskLogEntry = {
      text: logInput.trim(),
      timestamp: new Date().toLocaleString(),
    };
    
    setLog(prev => [newEntry, ...prev]);
    setLogInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLogEntry();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(task.id, {
      title,
      notes,
      isUrgent,
      isImportant,
      status,
      projectId,
      log,
      startDate,
      dueDate
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-lighter border border-slate-200 dark:border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
        <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">{isNewTask ? 'add_task' : 'edit'}</span>
            {isNewTask ? 'New Task' : 'Edit Task'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Task Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-50 dark:bg-[#1e2636] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-primary outline-none transition-colors"
              placeholder="What are you working on?"
              required
            />
          </div>

          {/* Bitácora / Log Section - Replaces static Notes */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">history</span>
                Bitácora de Seguimiento
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 normal-case font-medium">Presiona Enter para agregar</span>
            </label>
            
            <div className="flex flex-col gap-3 bg-slate-50 dark:bg-[#1e2636] border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-inner transition-colors">
              <div className="relative">
                <input 
                  type="text" 
                  value={logInput}
                  onChange={(e) => setLogInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600/50 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm pr-10"
                  placeholder="Escribe una actualización..."
                />
                <button 
                  type="button"
                  onClick={handleAddLogEntry}
                  className="absolute right-2 top-1.5 p-1 text-primary hover:bg-primary/10 rounded-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                </button>
              </div>
              
              <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                {log.length > 0 ? (
                  log.map((entry, index) => (
                    <div key={index} className="flex flex-col p-3 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40 transition-all hover:border-primary/30 group">
                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{entry.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-bold">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          {entry.timestamp}
                        </span>
                        <button 
                          type="button"
                          onClick={() => setLog(prev => prev.filter((_, i) => i !== index))}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-lg">
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-3xl mb-2">speaker_notes_off</span>
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center uppercase tracking-widest font-bold">Sin registros</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-[#1e2636] border border-slate-200 dark:border-slate-700 rounded-xl transition-colors">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority Matrix</label>
               <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="size-5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 transition-all"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Urgent</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={isImportant}
                      onChange={(e) => setIsImportant(e.target.checked)}
                      className="size-5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 transition-all"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Important</span>
                  </label>
               </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-50 dark:bg-[#1e2636] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-primary outline-none transition-colors appearance-none cursor-pointer h-full"
              >
                <option value="Pendiente">To Do (Pendiente)</option>
                <option value="En Progreso">In Progress (En Progreso)</option>
                <option value="Completada">Done (Completada)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project</label>
            <select 
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="bg-slate-50 dark:bg-[#1e2636] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-primary outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="">No Project (General)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-[#1e2636] border border-slate-200 dark:border-slate-700 rounded-xl transition-colors">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                Fecha Inicio
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-sm text-slate-900 dark:text-white focus:ring-0 outline-none w-full"
              />
            </div>
            <div className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-[#1e2636] border border-slate-200 dark:border-slate-700 rounded-xl transition-colors">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">event</span>
                Fecha Término
              </label>
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent border-none text-sm text-slate-900 dark:text-white focus:ring-0 outline-none w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold shadow-lg shadow-primary/20 transition-all transform active:scale-95"
            >
              {isNewTask ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
