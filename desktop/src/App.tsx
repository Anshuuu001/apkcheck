import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ProjectWorkspace } from './components/ProjectWorkspace';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { RequirementInterview } from './components/RequirementInterview';
import { useAppStore } from './store/appStore';
import { useNotificationStore } from './store/notificationStore';
import { useEngineStore } from './store/engineStore';
import { TEMPLATE_REGISTRY } from './templates/index';
import { Layers, Bot, Settings as SettingsIcon, Cpu, Sliders, Layout, Database, Network, Sparkles } from 'lucide-react';

function App() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const user = useAppStore((state) => state.user);
  const toasts = useNotificationStore((state) => state.toasts);
  const dismissToast = useNotificationStore((state) => state.dismissToast);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [activeProjectName, setActiveProjectName] = useState<string>('');
  const [showLogin, setShowLogin] = useState<boolean>(false);

  // Update header/tab when a project is selected
  useEffect(() => {
    if (activeProjectId !== null) {
      // Find project details to display name (safe optional chaining for mock/browser fallback)
      window.electronAPI?.getProjects().then((list) => {
        const found = list.find((p) => p.id === activeProjectId);
        if (found) {
          setActiveProjectName(found.name);
        }
      }).catch((e) => console.error('getProjects error:', e));
    } else {
      setActiveProjectName('');
    }
  }, [activeProjectId]);

  if (!isAuthenticated) {
    return (
      <>
        {!showLogin ? (
          <LandingPage onLaunch={() => setShowLogin(true)} />
        ) : (
          <LoginPage onBackToLanding={() => setShowLogin(false)} />
        )}
        {/* Toast notifications container */}
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none animate-slide-up">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-xl border bg-slate-950/95 backdrop-blur flex flex-col gap-1 shadow-2xl transition-all duration-300 ${
                t.type === 'success' ? 'border-emerald-500/30' :
                t.type === 'error' ? 'border-rose-500/30' :
                t.type === 'warning' ? 'border-amber-500/30' : 'border-violet-500/30'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs font-extrabold uppercase tracking-wider ${
                  t.type === 'success' ? 'text-emerald-400' :
                  t.type === 'error' ? 'text-rose-400' :
                  t.type === 'warning' ? 'text-amber-400' : 'text-violet-400'
                }`}>
                  {t.title}
                </span>
                <button
                  onClick={() => dismissToast(t.id)}
                  className="text-slate-500 hover:text-slate-300 font-semibold cursor-pointer"
                >
                  &times;
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{t.message}</p>
            </div>
          ))}
        </div>
      </>
    );
  }

  const handleOpenProject = (projectId: number) => {
    setActiveProjectId(projectId);
  };

  const handleBackToDashboard = () => {
    setActiveProjectId(null);
  };

  const handleCreateFromTemplate = async (templateName: string) => {
    const defaultName = templateName.replace(/\s+/g, '');
    const name = prompt(`Enter a name for your new ${templateName}:`, `My${defaultName}`);
    if (!name || !name.trim()) return;

    try {
      const trimmedName = name.trim();
      const newProj = await window.electronAPI.createProject(trimmedName, 'Dark');
      
      let answers = { login: false, payment: false, chat: false, gps: false };
      if (templateName === 'Food Delivery App') {
        answers = { login: true, payment: true, chat: true, gps: true };
      } else if (templateName === 'Direct Messaging Client') {
        answers = { login: true, payment: false, chat: true, gps: false };
      } else if (templateName === 'E-Commerce Storefront') {
        answers = { login: true, payment: true, chat: false, gps: false };
      }
      
      await window.electronAPI.buildBlueprint(newProj.id, answers);

      const welcomeText = `👋 Welcome to your **${trimmedName}** pre-seeded project workspace!\n\nThis template includes pre-configured layouts and API endpoints. Click on the screens list to preview it or try asking me to "create screen ProfileScreen".`;
      await window.electronAPI.addChatMessage(newProj.id, 'assistant', welcomeText);
      
      useNotificationStore.getState().addToast(
        'Template Instantiated', 
        `Successfully created and configured "${trimmedName}" using the ${templateName} template.`,
        'success'
      );

      setActiveProjectId(newProj.id);
    } catch (err: any) {
      useNotificationStore.getState().addToast(
        'Template Error', 
        err.message || 'Failed to initialize project from template.',
        'error'
      );
    }
  };

  // Render contents based on active tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onOpenProject={handleOpenProject} />;
      case 'projects':
        return <ProjectsPage onOpenProject={handleOpenProject} />;
      
      case 'templates':
        return (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-wide flex items-center gap-2">
                    <Layers className="text-violet-500" size={22} />
                    Industry Templates
                  </h2>
                  <p className="text-xs text-slate-500">12 pre-built blueprints with screens, database schemas, and API endpoints — ready to customize.</p>
                </div>
                <div className="flex items-center gap-2">
                  {[{label:'All', filter:'all'},{label:'🔥 Trending', filter:'trending'},{label:'⭐ Featured', filter:'featured'},{label:'✨ New', filter:'new'}].map(tab => (
                    <button key={tab.filter} className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer">{tab.label}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {TEMPLATE_REGISTRY.map((tpl) => (
                  <div key={tpl.id} className="glass-card rounded-2xl border border-slate-800 hover:border-violet-500/30 transition-all duration-300 group overflow-hidden cursor-pointer"
                    onClick={() => handleCreateFromTemplate(tpl.name)}>
                    {/* Header */}
                    <div className="p-5 pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{tpl.icon}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border ${
                          tpl.popularity === 'featured' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          tpl.popularity === 'trending' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          tpl.popularity === 'new' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-violet-500/10 text-violet-400 border-violet-500/20'
                        }`}>
                          {tpl.popularity === 'featured' ? '⭐ Featured' :
                           tpl.popularity === 'trending' ? '🔥 Trending' :
                           tpl.popularity === 'new' ? '✨ New' : 'Popular'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">{tpl.name}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{tpl.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="px-5 py-3 border-t border-slate-800/60 flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Layout size={10} />
                        <span className="text-[10px] font-semibold">{tpl.screenCount} screens</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Database size={10} />
                        <span className="text-[10px] font-semibold">{tpl.tableCount} tables</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Network size={10} />
                        <span className="text-[10px] font-semibold">{tpl.endpointCount} APIs</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="px-5 pb-4 flex flex-wrap gap-1">
                      {tpl.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">{tag}</span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="px-5 pb-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-violet-400 group-hover:text-violet-300 transition-colors">
                        <Sparkles size={10} />
                        Use this template →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ai-assistant':
        return (
          <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-wide flex items-center gap-2">
              <Bot className="text-violet-500" size={22} />
              Global Developer Companion
            </h2>
            <p className="text-xs text-slate-500 mb-8">Consult with the AI regarding systems design, database indexing, and visual layout logic.</p>
            
            <div className="glass-card p-8 rounded-3xl border border-slate-850 text-center max-w-md mx-auto my-12">
              <Bot className="text-violet-400 mx-auto mb-4" size={36} />
              <h3 className="text-md font-bold text-white mb-1.5">No Project Selected</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The developer assistant requires context to compile blueprint configurations. Please open a project from the **Dashboard** to initiate requirements collection.
              </p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-wide flex items-center gap-2">
              <SettingsIcon className="text-violet-500" size={22} />
              AppForge Settings
            </h2>
            <p className="text-xs text-slate-500 mb-8">Manage IDE environment configurations, database paths, and compiler targets.</p>
            
            <div className="flex flex-col gap-6">
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 border border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders size={16} className="text-violet-400" />
                  Local Workspace Directories
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="text-xs">
                    <span className="block text-slate-500 font-bold mb-1.5">Projects Save Path</span>
                    <code className="bg-slate-950 p-3 rounded-lg block border border-slate-850 font-mono text-[10px] text-slate-400 select-all">
                      AppForge-AI/projects/
                    </code>
                  </div>
                  <div className="text-xs">
                    <span className="block text-slate-500 font-bold mb-1.5">Database Store</span>
                    <code className="bg-slate-950 p-3 rounded-lg block border border-slate-850 font-mono text-[10px] text-slate-400 select-all">
                      AppForge-AI/projects/appforge.db
                    </code>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 border border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu size={16} className="text-violet-400" />
                  AI Models Configuration
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-900">
                    <div>
                      <h4 className="text-xs font-bold text-white">Gemini 3.5 Flash</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Medium intelligence model optimized for code and speed.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-bold border border-violet-500/10">
                      Active (Built-in)
                    </span>
                  </div>

                  <div className="text-xs">
                    <span className="block text-slate-500 font-bold mb-1.5">Gemini API Key</span>
                    <input
                      type="password"
                      placeholder="API key is empty (using default workspace key)"
                      value={user?.apiKeyGemini || ''}
                      disabled
                      className="w-full bg-slate-950/80 border border-slate-850 rounded-xl py-2.5 px-4 text-xs text-slate-400 select-all font-mono"
                    />
                    <span className="text-[10px] text-slate-600 mt-1 block">To modify this key, open your User Profile dropdown in the top header and select Profile Settings.</span>
                  </div>

                  <div className="text-xs">
                    <span className="block text-slate-500 font-bold mb-1.5">OpenAI API Key</span>
                    <input
                      type="password"
                      placeholder="API key is empty (using default workspace key)"
                      value={user?.apiKeyOpenAI || ''}
                      disabled
                      className="w-full bg-slate-950/80 border border-slate-850 rounded-xl py-2.5 px-4 text-xs text-slate-400 select-all font-mono"
                    />
                    <span className="text-[10px] text-slate-600 mt-1 block">To modify this key, open your User Profile dropdown in the top header and select Profile Settings.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <Dashboard onOpenProject={handleOpenProject} />;
    }
  };

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden text-slate-300">
        {/* If project is open, we load the full workspace (Sidebar is hidden to maximize coding/design space) */}
        {activeProjectId !== null ? (
          <ProjectWorkspace
            projectId={activeProjectId}
            onBackToDashboard={handleBackToDashboard}
          />
        ) : (
          <>
            {/* Sidebar Navigation */}
            <Sidebar
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
            />

            {/* Main workspace container */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
              <Header
                title={
                  currentTab.charAt(0).toUpperCase() + currentTab.slice(1).replace('-', ' ')
                }
                selectedProjectName={activeProjectName || undefined}
                onBackToDashboard={handleBackToDashboard}
              />

              {/* Dashboard or Tab rendering */}
              {renderTabContent()}
            </div>
          </>
        )}
      </div>

      {/* Toast notifications container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none animate-slide-up">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl border bg-slate-950/95 backdrop-blur flex flex-col gap-1 shadow-2xl transition-all duration-300 ${
              t.type === 'success' ? 'border-emerald-500/30' :
              t.type === 'error' ? 'border-rose-500/30' :
              t.type === 'warning' ? 'border-amber-500/30' : 'border-violet-500/30'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-xs font-extrabold uppercase tracking-wider ${
                t.type === 'success' ? 'text-emerald-400' :
                t.type === 'error' ? 'text-rose-400' :
                t.type === 'warning' ? 'text-amber-400' : 'text-violet-400'
              }`}>
                {t.title}
              </span>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-slate-500 hover:text-slate-300 font-semibold cursor-pointer"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{t.message}</p>
          </div>
        ))}
      </div>

      {/* RequirementInterview overlay — appears whenever the AI pipeline reaches interview stage */}
      <RequirementInterview
        onComplete={() => {
          useNotificationStore.getState().addToast(
            'Requirements Collected',
            'Building your complete app blueprint now...',
            'info'
          );
        }}
        onCancel={() => useEngineStore.getState().reset()}
      />
    </>
  );
}

export default App;
