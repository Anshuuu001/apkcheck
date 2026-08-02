import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, ExternalLink, Calendar, Code2, AppWindow, FolderPlus } from 'lucide-react';
import type { Project } from '../electron';

interface DashboardProps {
  onOpenProject: (projectId: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<{ [key: number]: { screens: number; components: number } }>({});
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form input states
  const [projectName, setProjectName] = useState('');
  const [projectTheme, setProjectTheme] = useState('Dark');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all projects and statistics on load
  const loadProjects = async () => {
    try {
      setErrorMsg('');
      const list = await window.electronAPI.getProjects();
      setProjects(list);

      // Fetch screen/component counts for each project
      const statsMap: typeof projectStats = {};
      for (const p of list) {
        try {
          const details = await window.electronAPI.getProjectDetails(p.id);
          statsMap[p.id] = {
            screens: details.screens?.length || 0,
            components: details.components?.length || 0
          };
        } catch (e) {
          statsMap[p.id] = { screens: 0, components: 0 };
        }
      }
      setProjectStats(statsMap);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setErrorMsg('Failed to load projects.');
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setErrorMsg('Project name is required');
      return;
    }
    try {
      setErrorMsg('');
      const newProj = await window.electronAPI.createProject(projectName.trim(), projectTheme);
      setProjectName('');
      setIsCreateModalOpen(false);
      loadProjects();
      // Auto open newly created project
      onOpenProject(newProj.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating project');
    }
  };

  const handleRenameProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !renameValue.trim()) return;
    try {
      setErrorMsg('');
      await window.electronAPI.renameProject(selectedProject.id, renameValue.trim());
      setIsRenameModalOpen(false);
      setSelectedProject(null);
      setRenameValue('');
      loadProjects();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error renaming project');
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    try {
      setErrorMsg('');
      await window.electronAPI.deleteProject(selectedProject.id);
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
      loadProjects();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting project');
    }
  };

  const openRenameModal = (p: Project) => {
    setSelectedProject(p);
    setRenameValue(p.name);
    setIsRenameModalOpen(true);
  };

  const openDeleteModal = (p: Project) => {
    setSelectedProject(p);
    setIsDeleteModalOpen(true);
  };

  // Format timestamp helper
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Banner / Welcome Header */}
      <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-slate-900/40 border border-violet-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Decorative ambient background lights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px]" />
        
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome to AppForge AI</h2>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Create native-styled layouts, write application blueprints, and generate code schemas using guided AI dialogs and local data storage.
          </p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="glow-button flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/25 transition-all cursor-pointer"
        >
          <Plus size={18} />
          Create New Project
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Stats Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <FolderPlus size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Projects</p>
            <p className="text-2xl font-extrabold text-white mt-1">{projects.length}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <AppWindow size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Screens Generated</p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {Object.values(projectStats).reduce((acc, curr) => acc + curr.screens, 0)}
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Code2 size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Components</p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {Object.values(projectStats).reduce((acc, curr) => acc + curr.components, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Projects List Section */}
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white tracking-wide">Recent Projects</h3>
        <span className="text-xs text-slate-500 font-medium">Sorted by last updated</span>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center border-dashed border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Code2 size={28} />
          </div>
          <h4 className="text-md font-bold text-slate-300 mb-1">No Projects Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Get started by creating your very first local project file using guided prompts.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 hover:text-white transition-all text-xs font-semibold text-slate-400 cursor-pointer"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const stats = projectStats[p.id] || { screens: 0, components: 0 };
            return (
              <div key={p.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between h-56 relative group">
                <div>
                  {/* Card Header Info */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-[10px] text-slate-400 font-bold uppercase tracking-wider border border-slate-800">
                      {p.theme} Theme
                    </span>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openRenameModal(p)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-violet-500 hover:text-violet-400 transition-all text-slate-400 cursor-pointer"
                        title="Rename Project"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(p)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500 hover:text-red-400 transition-all text-slate-400 cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Project Name */}
                  <h4 className="text-lg font-bold text-white tracking-wide group-hover:text-violet-400 transition-colors">
                    {p.name}
                  </h4>
                  
                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1">
                    <Calendar size={12} />
                    <span>Updated: {formatDate(p.updated_at)}</span>
                  </div>
                </div>

                {/* Card footer details & Open Button */}
                <div className="flex justify-between items-center border-t border-slate-800/60 pt-4 mt-4">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                    <div className="flex items-center gap-1">
                      <span className="text-white">{stats.screens}</span> screens
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-white">{stats.components}</span> comps
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenProject(p.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white border border-violet-500/20 hover:border-violet-500 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Open
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- CREATE NEW PROJECT MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-800/80 animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-2">Create New Project</h3>
            <p className="text-xs text-slate-400 mb-6">Create a local workspace for screens, components, settings and AI chat blueprint logs.</p>
            
            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. FoodGo, ChatApp"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Theme Scheme</label>
                <select
                  value={projectTheme}
                  onChange={(e) => setProjectTheme(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="Dark">Dark Mode Theme</option>
                  <option value="Light">Light Mode Theme</option>
                  <option value="Glassmorphic">Glassmorphic Accents</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setProjectName('');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-button px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RENAME PROJECT MODAL --- */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-800/80 animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-2">Rename Project</h3>
            <p className="text-xs text-slate-400 mb-6">Rename project directory folder and change application manifest variables.</p>
            
            <form onSubmit={handleRenameProject} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Name</label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsRenameModalOpen(false);
                    setSelectedProject(null);
                    setRenameValue('');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-button px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Rename Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE PROJECT MODAL --- */}
      {isDeleteModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl shadow-2xl border border-red-500/20 animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Trash2 className="text-red-500" size={22} />
              Delete Project?
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-extrabold text-white">"{selectedProject.name}"</span>? 
              This will permanently delete the folder <span className="text-red-400 font-mono text-[10px]">AppForge-AI/projects/{selectedProject.name}/</span> from local files and wipe its SQLite databases. This cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedProject(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
