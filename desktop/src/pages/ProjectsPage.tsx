import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Trash2, Edit, ExternalLink, Calendar, 
  Code2, AppWindow, FolderPlus, ArrowUpDown, RefreshCw, 
  FolderOpen, Tag
} from 'lucide-react';
import type { Project } from '../electron';

interface ProjectsPageProps {
  onOpenProject: (projectId: number) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onOpenProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<{ [key: number]: { screens: number; components: number } }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name-asc' | 'name-desc'>('updated');
  const [themeFilter, setThemeFilter] = useState<'all' | 'Dark' | 'Light' | 'Glassmorphic'>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form input states
  const [projectName, setProjectName] = useState('');
  const [projectTheme, setProjectTheme] = useState('Dark');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Fetch all projects and statistics
  const loadProjects = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const list = await window.electronAPI.getProjects();
      setProjects(list);

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
      setErrorMsg('Failed to load projects. Ensure the database is running.');
    } finally {
      setLoading(false);
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
      await loadProjects();
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
      await loadProjects();
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
      await loadProjects();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting project');
    }
  };

  const openRenameModal = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(p);
    setRenameValue(p.name);
    setIsRenameModalOpen(true);
  };

  const openDeleteModal = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(p);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter and Sort Logic
  const filteredProjects = projects
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTheme = themeFilter === 'all' || p.theme.toLowerCase() === themeFilter.toLowerCase();
      return matchSearch && matchTheme;
    })
    .sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      if (sortBy === 'created') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

  // Calculate metrics for filtered projects
  const totalFilteredScreens = filteredProjects.reduce(
    (acc, curr) => acc + (projectStats[curr.id]?.screens || 0), 0
  );
  const totalFilteredComponents = filteredProjects.reduce(
    (acc, curr) => acc + (projectStats[curr.id]?.components || 0), 0
  );

  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full animate-slide-up">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FolderOpen size={30} className="text-violet-500" />
            Projects Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your localized application workspace schemas, custom screen components, and design themes.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadProjects}
            disabled={loading}
            className="flex items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer hover:border-slate-700"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="glow-button flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/25 transition-all cursor-pointer"
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="glass-card p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 justify-between items-center border border-slate-800/80">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-10 text-xs text-slate-300 focus:outline-none focus:border-violet-500 transition-colors placeholder:text-slate-650 font-medium"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Theme Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-900">
            <span className="p-1 text-slate-500" title="Filter by Theme">
              <Tag size={14} />
            </span>
            <select
              value={themeFilter}
              onChange={(e: any) => setThemeFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-400 focus:outline-none px-2 pr-4 py-1 cursor-pointer"
            >
              <option value="all">All Themes</option>
              <option value="Dark">Dark Theme</option>
              <option value="Light">Light Theme</option>
              <option value="Glassmorphic">Glassmorphism</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-900">
            <span className="p-1 text-slate-500" title="Sort Projects">
              <ArrowUpDown size={14} />
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-slate-400 focus:outline-none px-2 pr-4 py-1 cursor-pointer"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="name-asc">Name (A &rarr; Z)</option>
              <option value="name-desc">Name (Z &rarr; A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Matching Projects</span>
            <h4 className="text-xl font-bold text-white mt-0.5">{filteredProjects.length}</h4>
          </div>
          <FolderPlus size={20} className="text-violet-500/60" />
        </div>
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Generated Screens</span>
            <h4 className="text-xl font-bold text-white mt-0.5">{totalFilteredScreens}</h4>
          </div>
          <AppWindow size={20} className="text-indigo-500/60" />
        </div>
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Configured Components</span>
            <h4 className="text-xl font-bold text-white mt-0.5">{totalFilteredComponents}</h4>
          </div>
          <Code2 size={20} className="text-blue-500/60" />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl text-center border border-dashed border-slate-800/80 my-8">
          <div className="w-16 h-16 rounded-full bg-slate-900/60 border border-slate-850 flex items-center justify-center mx-auto mb-4 text-slate-600">
            <FolderOpen size={28} />
          </div>
          <h4 className="text-lg font-bold text-slate-350 mb-1">No Projects Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Try adjusting your search criteria or theme filters to locate your project files, or build a new one.
          </p>
          {(searchTerm !== '' || themeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setThemeFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer hover:border-slate-700"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const stats = projectStats[p.id] || { screens: 0, components: 0 };
            return (
              <div 
                key={p.id} 
                onClick={() => onOpenProject(p.id)}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between h-56 relative group border border-slate-850 cursor-pointer"
              >
                <div>
                  {/* Card Header Info */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${
                      p.theme === 'Dark' ? 'bg-slate-950 border-slate-800 text-slate-400' :
                      p.theme === 'Light' ? 'bg-slate-100 border-slate-300 text-slate-700' :
                      'bg-violet-950/20 border-violet-800/30 text-violet-400'
                    }`}>
                      {p.theme} Theme
                    </span>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openRenameModal(p, e)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-violet-500 hover:text-violet-400 transition-all text-slate-400 cursor-pointer"
                        title="Rename Project"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={(e) => openDeleteModal(p, e)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-red-500 hover:text-red-400 transition-all text-slate-400 cursor-pointer"
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
                  
                  {/* Timestamps */}
                  <div className="flex flex-col gap-1 mt-2 text-[10px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      <span>Updated: {formatDate(p.updated_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Card footer details & Open Button */}
                <div className="flex justify-between items-center border-t border-slate-800/60 pt-4 mt-4">
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-900 text-slate-400">
                      <span className="text-white font-bold">{stats.screens}</span> screens
                    </div>
                    <div className="flex items-center gap-1 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-900 text-slate-400">
                      <span className="text-white font-bold">{stats.components}</span> comps
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProject(p.id);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white border border-violet-500/20 hover:border-violet-500 text-xs font-bold transition-all cursor-pointer"
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
                  placeholder="e.g. MyAmazingApp"
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
            <p className="text-xs text-slate-400 mb-6">Rename project directory folder and change database references.</p>
            
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
              This will permanently delete the project folder from local workspace directory and wipe its design manifests and configurations. This cannot be undone.
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
