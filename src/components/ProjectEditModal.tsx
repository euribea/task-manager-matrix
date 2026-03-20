import React, { useState, useEffect } from 'react';
import type { Project } from '../types/Task';

interface ProjectEditModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Project>) => void;
}

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({ project, isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setColor(project.color || '#3b82f6');
      
      const formatDate = (val: any) => {
        if (!val) return '';
        const d = val.seconds ? new Date(val.seconds * 1000) : new Date(val);
        return d.toISOString().split('T')[0];
      };
      
      setStartDate(formatDate(project.startDate));
      setEndDate(formatDate(project.endDate));
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(project.id, {
      name,
      color,
      startDate,
      endDate
    });
    onClose();
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-lighter border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
        <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">folder_open</span>
            Editar Proyecto
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre del Proyecto</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-50 dark:bg-[#1e2636] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-primary outline-none transition-colors"
              placeholder="Nombre del proyecto"
              required
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Color del Proyecto</label>
            <div className="flex flex-wrap gap-3">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-8 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold shadow-lg shadow-primary/20 transition-all transform active:scale-95"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
