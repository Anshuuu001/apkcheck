import React from 'react';
import { LayoutDashboard, Folder, Layers, Bot, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isCollapsed,
  setIsCollapsed,
}) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', name: 'Projects', icon: Folder },
    { id: 'templates', name: 'Templates', icon: Layers },
    { id: 'ai-assistant', name: 'AI Assistant', icon: Bot },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`glass-panel h-screen flex flex-col justify-between border-r border-slate-800 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col">
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/60">
          {!isCollapsed && (
            <div className="flex items-center gap-2 animate-slide-up">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/20">
                AF
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                AppForge<span className="text-violet-500 text-xs font-bold align-super ml-0.5">AI</span>
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/20">
              AF
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md bg-slate-900 border border-slate-800 hover:border-violet-500 hover:text-violet-400 transition-colors hidden md:block"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 flex flex-col gap-2 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-4 p-3.5 rounded-xl font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/10 border border-violet-500/30 text-white shadow-inner'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border border-transparent'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-r-md" />
                )}
                
                <Icon
                  size={20}
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                
                {!isCollapsed && (
                  <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-6 border-t border-slate-800/60">
        {!isCollapsed ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 glow-pulse" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Local DB Engaged</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">v0.1.0 (Developer Mode)</p>
          </div>
        ) : (
          <div className="w-2.5 h-2.5 mx-auto rounded-full bg-emerald-500 glow-pulse" title="System Connected" />
        )}
      </div>
    </aside>
  );
};
