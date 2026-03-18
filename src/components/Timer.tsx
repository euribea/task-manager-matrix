import { useState, useEffect } from 'react';
import type { Task } from '../types/Task';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface TimerProps {
  task: Task;
  onExit: () => void;
  onEdit: () => void;
}

export const Timer: React.FC<TimerProps> = ({ task, onExit, onEdit }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [completedSessions, setCompletedSessions] = useState(4);
  const totalSessions = 8;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'focus') {
        setCompletedSessions(prev => Math.min(prev + 1, totalSessions));
        const nextTime = 5 * 60;
        setMode('shortBreak');
        setTimeLeft(nextTime);
      } else {
        const nextTime = 25 * 60;
        setMode('focus');
        setTimeLeft(nextTime);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60);
  };
  
  const finishTaskEarly = async () => {
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, { status: 'completed' });
      onExit();
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const totalTime = mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progressPercentage = ((totalTime - timeLeft) / totalTime) * 100;
  const strokeDashoffset = 283 - (283 * progressPercentage) / 100;

  return (
    <div className="flex-1 flex flex-col h-full w-full">
      {/* Header - matching Stitch design exactly */}
      <header className="flex items-center justify-between px-6 py-4 md:px-10 border-b border-slate-800 bg-[#111621]/90 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">timelapse</span>
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-white">Concentration Mode</h1>
            <p className="text-xs text-slate-400 font-medium">Productivity Suite</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
            <span className="material-symbols-outlined">volume_up</span>
          </button>
          <button className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
            <span className="material-symbols-outlined">fullscreen</span>
          </button>
          <button 
            onClick={onExit} 
            className="hidden md:flex h-9 items-center justify-center px-4 rounded-lg border border-slate-700 hover:bg-slate-800 text-sm font-bold text-white transition-colors"
          >
            Exit Mode
          </button>
          <button 
            onClick={onExit} 
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 hover:bg-slate-800 text-sm font-bold text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative w-full max-w-7xl mx-auto px-4 py-6">
        {/* Task Info */}
        <div className="flex flex-col items-center gap-2 mb-8 md:mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            {mode === 'focus' ? 'Focus Session' : 'Break Time'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2">
            {task.title}
          </h2>
          <button onClick={onEdit} className="text-slate-400 hover:text-primary text-sm flex items-center justify-center gap-1.5 transition-colors mt-2 px-3 py-1.5 rounded-lg hover:bg-slate-800/50">
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span className="font-medium">View & Edit Details</span>
          </button>
        </div>

        {/* Timer Module */}
        <div className="relative flex flex-col items-center justify-center mb-10">
          {/* Circular Progress */}
          <div className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] lg:w-[420px] lg:h-[420px]">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-slate-800" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="2"></circle>
              <circle 
                className="text-primary progress-ring__circle drop-shadow-[0_0_10px_rgba(25,93,230,0.4)] transition-all duration-300 ease-linear" 
                cx="50" cy="50" fill="none" r="45" stroke="currentColor" 
                strokeDasharray="283" strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" strokeWidth="2">
              </circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[5rem] md:text-[6.5rem] lg:text-[7.5rem] font-bold leading-none tracking-tighter tabular-nums text-white">
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </span>
              <p className="text-slate-400 font-medium text-lg mt-2">
                {mode === 'focus' ? 'until break' : 'until focus'}
              </p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="absolute -bottom-8 md:-bottom-10 flex items-center gap-4">
            <button onClick={resetTimer} className="group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all shadow-lg hover:shadow-xl">
              <span className="material-symbols-outlined text-2xl md:text-3xl">replay</span>
            </button>
            <button onClick={toggleTimer} className="group flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary hover:bg-blue-600 text-white transition-all shadow-lg hover:shadow-primary/50 hover:scale-105 active:scale-95">
              <span className="material-symbols-outlined text-4xl md:text-5xl fill-current">
                {isActive ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button onClick={() => { setIsActive(false); setTimeLeft(0); }} className="group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all shadow-lg hover:shadow-xl">
              <span className="material-symbols-outlined text-2xl md:text-3xl">stop</span>
            </button>
          </div>
        </div>

        {/* Mode Toggles */}
        <div className="mt-16 md:mt-20 flex p-1 bg-slate-800/50 rounded-xl">
          <button 
            onClick={() => { setMode('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
            className={`px-6 py-2 rounded-lg text-sm transition-all ${mode === 'focus' ? 'bg-slate-700 shadow-sm font-bold text-white' : 'font-medium text-slate-400 hover:text-white'}`}>
            Focus
          </button>
          <button 
            onClick={() => { setMode('shortBreak'); setTimeLeft(5 * 60); setIsActive(false); }}
            className={`px-6 py-2 rounded-lg text-sm transition-all ${mode === 'shortBreak' ? 'bg-slate-700 shadow-sm font-bold text-white' : 'font-medium text-slate-400 hover:text-white'}`}>
            Short Break
          </button>
          <button 
            onClick={() => { setMode('longBreak'); setTimeLeft(15 * 60); setIsActive(false); }}
            className={`px-6 py-2 rounded-lg text-sm transition-all ${mode === 'longBreak' ? 'bg-slate-700 shadow-sm font-bold text-white' : 'font-medium text-slate-400 hover:text-white'}`}>
            Long Break
          </button>
        </div>

        {/* Finish Session Button */}
        {task.status !== 'completed' && (
          <div className="mt-8">
            <button onClick={finishTaskEarly} className="text-sm font-semibold text-slate-400 border border-slate-700 px-6 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Finish Session Early
            </button>
          </div>
        )}
      </main>

      {/* Footer: Daily Stats - matching Stitch design exactly */}
      <footer className="w-full border-t border-slate-800 bg-[#111621]/90 backdrop-blur-md px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-400">Sessions Today:</span>
            <div className="flex items-center gap-1.5">
              {/* Completed sessions */}
              {Array.from({ length: completedSessions }).map((_, i) => (
                <div key={`completed-${i}`} className="w-2.5 h-2.5 rounded-full bg-primary"></div>
              ))}
              {/* Pending/Empty slots */}
              {Array.from({ length: totalSessions - completedSessions }).map((_, i) => (
                <div key={`pending-${i}`} className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              ))}
            </div>
            <span className="text-xs text-slate-500 ml-1">({completedSessions}/{totalSessions})</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">bolt</span>
              <span>High Focus</span>
            </div>
            <div className="w-px h-4 bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">schedule</span>
              <span>Total: 2h 15m</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
