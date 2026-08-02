import React, { useState, useEffect } from 'react';
import { Search, Bell, Cpu, HelpCircle, LogOut, User as UserIcon, Shield, Sparkles, X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useNotificationStore } from '../store/notificationStore';

interface HeaderProps {
  title: string;
  selectedProjectName?: string;
  onBackToDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  selectedProjectName,
  onBackToDashboard,
}) => {
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const updateUser = useAppStore((state) => state.updateUser);

  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);
  const addToast = useNotificationStore((state) => state.addToast);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Profile modal edit states
  const [editName, setEditName] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [editGeminiKey, setEditGeminiKey] = useState(user?.apiKeyGemini || '');
  const [editOpenAIKey, setEditOpenAIKey] = useState(user?.apiKeyOpenAI || '');
  const [editAiProvider, setEditAiProvider] = useState<'gemini' | 'openai' | 'ollama'>(user?.aiProvider || 'gemini');
  const [editOllamaUrl, setEditOllamaUrl] = useState(user?.ollamaUrl || 'http://127.0.0.1:11434');
  const [editOllamaModel, setEditOllamaModel] = useState(user?.ollamaModel || 'llama3');

  // Reset profile modal edit states when opened
  useEffect(() => {
    if (showProfileModal && user) {
      setEditName(user.name);
      setEditAvatar(user.avatar || '');
      setEditGeminiKey(user.apiKeyGemini || '');
      setEditOpenAIKey(user.apiKeyOpenAI || '');
      setEditAiProvider(user.aiProvider || 'gemini');
      setEditOllamaUrl(user.ollamaUrl || 'http://127.0.0.1:11434');
      setEditOllamaModel(user.ollamaModel || 'llama3');
    }
  }, [showProfileModal, user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      addToast('Validation Error', 'Name is required.', 'warning');
      return;
    }
    // Simple key format verification prefix check
    if (editAiProvider === 'gemini' && editGeminiKey && !editGeminiKey.startsWith('AIzaSy')) {
      addToast('API Key Format Warning', 'Gemini API Keys typically start with "AIzaSy". Please check it.', 'warning');
    }
    updateUser({
      name: editName.trim(),
      avatar: editAvatar.trim(),
      apiKeyGemini: editGeminiKey.trim(),
      apiKeyOpenAI: editOpenAIKey.trim(),
      aiProvider: editAiProvider,
      ollamaUrl: editOllamaUrl.trim(),
      ollamaModel: editOllamaModel.trim(),
    });
    addToast('Profile Updated', 'Your profile details and keys have been saved locally.', 'success');
    setShowProfileModal(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      // Small timeout to allow action click to happen first
      setTimeout(() => {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }, 150);
    };
    if (showNotifications || showProfileMenu) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [showNotifications, showProfileMenu]);

  return (
    <header className="glass-panel border-b border-slate-800/80 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      {/* Title & Navigation breadcrumb */}
      <div className="flex items-center gap-4">
        {selectedProjectName ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToDashboard}
              className="text-slate-400 hover:text-white font-medium text-sm transition-colors cursor-pointer"
            >
              Projects
            </button>
            <span className="text-slate-600">/</span>
            <span className="font-extrabold text-white text-lg tracking-wide bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              {selectedProjectName}
            </span>
            <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-semibold uppercase tracking-wider border border-violet-500/10">
              Active Workspace
            </span>
          </div>
        ) : (
          <h1 className="text-xl font-bold text-white tracking-wide">{title}</h1>
        )}
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects, blueprints..."
            className="w-64 bg-slate-950/60 border border-slate-800/80 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all"
          />
        </div>

        {/* AI Engine Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <Cpu size={14} className="text-violet-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-400">Model:</span>
          <span className="text-xs font-extrabold text-violet-400">Gemini 3.5 Flash</span>
        </div>

        {/* Action Icons & Notification Drawer */}
        <div className="flex items-center gap-2.5 relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className={`p-2 rounded-xl bg-slate-900 border transition-all text-slate-400 hover:text-white cursor-pointer relative ${
              showNotifications ? 'border-violet-500 text-white' : 'border-slate-800/80 hover:border-violet-500/50'
            }`}
          >
            <Bell size={16} />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-12 w-80 glass-panel border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 flex flex-col gap-3 max-h-96 overflow-y-auto animate-slide-up"
            >
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { markAllAsRead(); addToast('Read All', 'All notifications marked as read', 'success'); }}
                    className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                  >
                    Read All
                  </button>
                  <span className="text-slate-700 text-[10px]">|</span>
                  <button
                    onClick={() => { clearNotifications(); addToast('Cleared', 'Clear list complete.', 'info'); }}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No new notifications
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-0.5 text-left ${
                        n.read
                          ? 'bg-slate-950/20 border-slate-900/40 opacity-60'
                          : 'bg-slate-900/60 border-slate-800 hover:border-violet-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-white">{n.title}</h4>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 self-center" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">{n.message}</p>
                      <span className="text-[9px] text-slate-500 mt-1">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-violet-500/50 hover:text-white transition-all text-slate-400 cursor-pointer">
            <HelpCircle size={16} />
          </button>
        </div>

        {/* User avatar indicator & Profile Menu */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-6 relative">
          <div
            onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="text-right hidden xl:block">
              <p className="text-xs font-bold text-white group-hover:text-violet-400 transition-colors">
                {user?.name || 'Guest Developer'}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                {user?.email === 'guest@appforge.local' ? 'Guest Mode' : 'Online Account'}
              </p>
            </div>
            
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-xl border border-slate-800 object-cover shadow-md ring-2 ring-violet-500/20 group-hover:ring-violet-500/50 transition-all"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md ring-2 ring-violet-500/20 group-hover:ring-violet-500/50 transition-all">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'GD'}
              </div>
            )}
          </div>

          {showProfileMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-12 w-56 glass-panel border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 flex flex-col gap-1.5 animate-slide-up text-left"
            >
              <div className="px-3 py-1.5 border-b border-slate-900">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Guest Developer'}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email || 'guest@appforge.local'}</p>
              </div>
              <button
                onClick={() => { setShowProfileMenu(false); setShowProfileModal(true); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <UserIcon size={14} className="text-violet-400" />
                Profile Settings
              </button>
              <button
                onClick={() => { setShowProfileMenu(false); logout(); addToast('Session Closed', 'Logged out successfully', 'info'); }}
                className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all flex items-center gap-2.5 cursor-pointer border-t border-slate-900 mt-1"
              >
                <LogOut size={14} />
                Logout Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- USER PROFILE SETTINGS MODAL --- */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-800/85 animate-slide-up text-left">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield size={18} className="text-violet-400" />
                Profile & Encryption keys
              </h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-6">Manage settings and developer intelligence credentials. Saved locally.</p>
            
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Developer Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Avatar Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all font-mono"
                />
              </div>

              <div className="border-t border-slate-900 my-2 pt-4">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-violet-400" />
                  AI Models Authentication (Optional)
                </h4>
                <p className="text-[10px] text-slate-500 leading-normal mb-4">
                  Add local keys to target custom AI processors in preview/chat configurations. Keep fields blank to fallback to built-in presets.
                </p>

                <div className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Active AI Provider</label>
                    <select
                      value={editAiProvider}
                      onChange={(e) => setEditAiProvider(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all font-semibold"
                    >
                      <option value="gemini">Google Gemini API (Cloud)</option>
                      <option value="openai">OpenAI API (Cloud)</option>
                      <option value="ollama">Ollama (Local LLM)</option>
                    </select>
                  </div>

                  {editAiProvider === 'gemini' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Gemini API Key</label>
                      <input
                        type="password"
                        placeholder="AIzaSy..."
                        value={editGeminiKey}
                        onChange={(e) => setEditGeminiKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all font-mono"
                      />
                    </div>
                  )}

                  {editAiProvider === 'openai' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">OpenAI API Key</label>
                      <input
                        type="password"
                        placeholder="sk-or-..."
                        value={editOpenAIKey}
                        onChange={(e) => setEditOpenAIKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all font-mono"
                      />
                    </div>
                  )}

                  {editAiProvider === 'ollama' && (
                    <div className="flex flex-col gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Ollama API URL</label>
                        <input
                          type="text"
                          placeholder="http://127.0.0.1:11434"
                          value={editOllamaUrl}
                          onChange={(e) => setEditOllamaUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Model Name</label>
                        <input
                          type="text"
                          placeholder="e.g. llama3, gemma2, codellama"
                          value={editOllamaModel}
                          onChange={(e) => setEditOllamaModel(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-850 text-slate-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-button px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
