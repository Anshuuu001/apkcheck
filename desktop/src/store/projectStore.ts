import { create } from 'zustand';
import type { Project, Screen, Component } from '../electron';

interface ProjectState {
  projects: Project[];
  activeProjectId: number | null;
  activeProject: Project | null;
  screens: Screen[];
  components: Component[];
  selectedScreenId: number | null;
  selectedElementIndex: number | null;
  
  isLoadingProjects: boolean;
  isBuilding: boolean;
  buildLogs: string[];
  
  setProjects: (projects: Project[]) => void;
  loadProjects: () => Promise<void>;
  selectProject: (id: number | null) => Promise<void>;
  setScreens: (screens: Screen[]) => void;
  setSelectedScreenId: (id: number | null) => void;
  setSelectedElementIndex: (idx: number | null) => void;
  setComponents: (components: Component[]) => void;
  
  addBuildLog: (log: string) => void;
  clearBuildLogs: () => void;
  setIsBuilding: (building: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProjectId: null,
  activeProject: null,
  screens: [],
  components: [],
  selectedScreenId: null,
  selectedElementIndex: null,
  
  isLoadingProjects: false,
  isBuilding: false,
  buildLogs: [],
  
  setProjects: (projects) => set({ projects }),
  loadProjects: async () => {
    set({ isLoadingProjects: true });
    try {
      const list = await window.electronAPI.getProjects();
      set({ projects: list, isLoadingProjects: false });
    } catch (e) {
      console.error('Failed to get projects:', e);
      set({ isLoadingProjects: false });
    }
  },
  selectProject: async (id) => {
    if (id === null) {
      set({ activeProjectId: null, activeProject: null, screens: [], components: [], selectedScreenId: null, selectedElementIndex: null });
      return;
    }
    set({ activeProjectId: id });
    try {
      const details = await window.electronAPI.getProjectDetails(id);
      set({
        activeProject: details.project,
        screens: details.screens,
        components: details.components,
        selectedScreenId: details.screens[0]?.id || null,
        selectedElementIndex: null
      });
    } catch (e) {
      console.error('Failed to load project details:', e);
    }
  },
  setScreens: (screens) => set({ screens }),
  setSelectedScreenId: (id) => set({ selectedScreenId: id, selectedElementIndex: null }),
  setSelectedElementIndex: (idx) => set({ selectedElementIndex: idx }),
  setComponents: (components) => set({ components }),
  
  addBuildLog: (log) => set((state) => ({ buildLogs: [...state.buildLogs, log] })),
  clearBuildLogs: () => set({ buildLogs: [] }),
  setIsBuilding: (building) => set({ isBuilding: building }),
}));
