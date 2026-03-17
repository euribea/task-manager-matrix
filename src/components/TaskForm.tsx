import React, { useState } from 'react';

interface TaskFormProps {
  onAdd: (title: string, description: string) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // We are only handling title from the quick input, description can be empty for now 
    // or we could add a modal later for more details
    onAdd(title.trim(), '');
    setTitle('');
  };

  return (
    <div className="bg-surface-lighter rounded-xl border border-slate-700/50 p-5 mt-6">
      <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Quick Add</h3>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center bg-[#1e2636] rounded-lg px-3 py-2 border border-slate-700 focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">add_task</span>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-none text-sm text-white placeholder-slate-400 focus:ring-0 w-full ml-2 p-0 outline-none" 
              placeholder="What needs to be done?" 
            />
        </div>
        <button 
            type="submit" 
            disabled={!title.trim()}
            className="self-end bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/25">
            Add Task
        </button>
      </form>
    </div>
  );
};
