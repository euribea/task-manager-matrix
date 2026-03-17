import React, { useState, useEffect } from 'react';
import type { Task } from '../types/Task';

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Task>) => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({ task, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [status, setStatus] = useState('Pendiente');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setNotes(task.notes || task.description || '');
      setIsUrgent(task.isUrgent || false);
      setIsImportant(task.isImportant || false);
      setStatus(task.status || 'Pendiente');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(task.id, {
      title,
      notes,
      isUrgent,
      isImportant,
      status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm">
      <div className="bg-surface-lighter border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit</span>
            Edit Task
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#1e2636] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
              placeholder="What are you working on?"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notes / Description</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[#1e2636] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors min-h-[100px] resize-none"
              placeholder="Add details, links, or subtasks..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3 p-4 bg-[#1e2636] border border-slate-700 rounded-xl">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority Matrix</label>
               <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="size-5 rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary/20 transition-all"
                    />
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Urgent</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={isImportant}
                      onChange={(e) => setIsImportant(e.target.checked)}
                      className="size-5 rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary/20 transition-all"
                    />
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Important</span>
                  </label>
               </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-[#1e2636] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors appearance-none cursor-pointer h-full"
              >
                <option value="Pendiente">To Do (Pendiente)</option>
                <option value="En Progreso">In Progress (En Progreso)</option>
                <option value="Completada">Done (Completada)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold shadow-lg shadow-primary/20 transition-all transform active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
