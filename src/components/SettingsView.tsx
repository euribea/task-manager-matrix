import React from 'react';

interface SettingsViewProps {
  appName: string;
  setAppName: (name: string) => void;
  appIcon: string;
  setAppIcon: (icon: string) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  appName,
  setAppName,
  appIcon,
  setAppIcon,
  theme,
  setTheme
}) => {
  const icons = [
    'task_alt', 'dashboard', 'timer', 'insights', 'grid_view', 
    'rocket_launch', 'bolt', 'auto_awesome', 'edit_square', 'star'
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background-light dark:bg-background-dark transition-colors">
      {/* Header */}
      <header className="shrink-0 px-6 md:px-10 py-6 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-dark/95 backdrop-blur z-10 transition-colors">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">App Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Personalize your productivity workspace.</p>
        </div>
      </header>

      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          
          {/* General Appearance */}
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">palette</span>
              Appearance
            </h3>
            <div className="bg-white dark:bg-surface-lighter rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 flex flex-col gap-6 shadow-sm transition-colors">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Color Theme</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Switch between dark and light modes.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 trasition-colors">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">light_mode</span>
                    <span className="text-sm font-bold">Light</span>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                    <span className="text-sm font-bold">Dark</span>
                  </button>
                </div>
              </div>

              {/* App Display Name */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  App Name
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Preview: {appName}</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Enter app name..."
                  />
                </div>
              </div>

              {/* App Icon Selection */}
              <div className="flex flex-col gap-3">
                <p className="font-semibold text-slate-700 dark:text-slate-200">App Icon</p>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setAppIcon(icon)}
                      className={`size-10 flex items-center justify-center rounded-xl border transition-all ${
                        appIcon === icon 
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-[#1a2233]' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Account Section */}
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              Identity
            </h3>
            <div className="bg-white dark:bg-surface-lighter rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 flex items-center gap-4 shadow-sm transition-colors">
              <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-primary/30 flex items-center justify-center overflow-hidden transition-colors">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZrdP5MAjj26HGZUu0ZifL0ziDdIRAq4AgApnOUo2DTA7A0d0HIzoXu80SqjupW3jxaNhE0Jj4PthIE-Xl-goB6q7bvU-lq_ntXGW_b5UOUF4CtrT7Nq77tMxgwkvOhaPnZa8w7oakTAMdaJIV1vWUDqow8FcQncoJAOK6VuQlr6XbMBFFM5DHmDwOxrHphvF9sUTKNUrRukNS4WRRapBDBzP59ymfZZwmS3KQEGKoen1MNUng9l_mFidvmeJkrLYIQMGajRmtELc" alt="Profile" className="size-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Alex Rivera</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">alex.rivera@example.com</p>
              </div>
              <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Edit Profile
              </button>
            </div>
          </section>

          {/* Premium Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-indigo-800 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-black text-white italic tracking-tighter mb-2">PRO PLAN ACTIVE</h4>
              <p className="text-white/80 text-sm max-w-sm mb-6">Enjoy unlimited tasks, cloud sync across all devices, and advanced productivity analytics.</p>
              <button className="px-6 py-2.5 bg-white text-indigo-900 rounded-xl font-black text-sm hover:bg-slate-100 transition-all shadow-xl">
                MANAGE SUBSCRIPTION
              </button>
            </div>
            {/* Abstract decorations */}
            <div className="absolute top-0 right-0 size-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 size-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>
          </div>

        </div>
      </div>
    </div>
  );
};
