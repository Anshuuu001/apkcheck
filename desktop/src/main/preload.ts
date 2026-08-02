import { contextBridge, ipcRenderer } from 'electron';

// Expose API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Project Manager APIs
  getProjects: () => ipcRenderer.invoke('projects:getAll'),
  createProject: (name: string, theme?: string) => ipcRenderer.invoke('projects:create', name, theme),
  renameProject: (id: number, newName: string) => ipcRenderer.invoke('projects:rename', id, newName),
  deleteProject: (id: number) => ipcRenderer.invoke('projects:delete', id),
  getProjectDetails: (id: number) => ipcRenderer.invoke('projects:getDetails', id),
  saveSettings: (projectId: number, settings: any) => ipcRenderer.invoke('projects:saveSettings', projectId, settings),
  saveBlueprint: (projectId: number, blueprint: any) => ipcRenderer.invoke('projects:saveBlueprint', projectId, blueprint),
  updateBlueprint: (projectId: number, blueprintJson: string) => {
    try {
      const parsed = JSON.parse(blueprintJson);
      return ipcRenderer.invoke('projects:saveBlueprint', projectId, parsed);
    } catch (e) {
      return Promise.reject(new Error('Invalid blueprint JSON structure: ' + e));
    }
  },
  syncProject: (projectId: number) => ipcRenderer.invoke('projects:sync', projectId),
  getProjectVersions: (projectId: number) => ipcRenderer.invoke('projects:getVersions', projectId),
  createProjectVersion: (projectId: number, tag: string, desc: string, blueprint: string) => ipcRenderer.invoke('projects:createVersion', projectId, tag, desc, blueprint),
  deleteProjectVersion: (id: number) => ipcRenderer.invoke('projects:deleteVersion', id),

  // Screen APIs
  createScreen: (projectId: number, name: string, layoutData: string) => ipcRenderer.invoke('screens:create', projectId, name, layoutData),
  updateScreen: (id: number, name: string, layoutData: string) => ipcRenderer.invoke('screens:update', id, name, layoutData),
  deleteScreen: (id: number) => ipcRenderer.invoke('screens:delete', id),

  // Component APIs
  createComponent: (projectId: number, name: string, type: string, configData: string) => ipcRenderer.invoke('components:create', projectId, name, type, configData),
  updateComponent: (id: number, name: string, type: string, configData: string) => ipcRenderer.invoke('components:update', id, name, type, configData),
  deleteComponent: (id: number) => ipcRenderer.invoke('components:delete', id),

  // Chat APIs
  getChatHistory: (projectId: number) => ipcRenderer.invoke('chat:getHistory', projectId),
  addChatMessage: (projectId: number, role: 'user' | 'assistant', content: string, imagePath?: string) => ipcRenderer.invoke('chat:addMessage', projectId, role, content, imagePath),
  clearChatHistory: (projectId: number) => ipcRenderer.invoke('chat:clearHistory', projectId),
  
  // Blueprint engine planner helper (Phase 2 Step 8)
  buildBlueprint: (projectId: number, schema: any) => 
    ipcRenderer.invoke('blueprint:build', projectId, schema),
  
  // Custom analysis and validation hooks
  analyzeProjectIntent: (message: string, currentBlueprint: any) => ipcRenderer.invoke('projects:analyze-intent', message, currentBlueprint),
  validateProjectRequirements: (projectId: number) => ipcRenderer.invoke('projects:validate-requirements', projectId),
  callAI: (prompt: string) => ipcRenderer.invoke('projects:call-ai', prompt),

  // Screen Generator Engine Trigger (Phase 3)
  generateCodeAssets: (projectId: number) => ipcRenderer.invoke('generator:run', projectId),

  // Build System APIs (Phase 10)
  buildRelease: (projectId: number) => ipcRenderer.invoke('generator:build-release', projectId),
  onBuildLog: (callback: (data: any) => void) => {
    ipcRenderer.on('generator:build-log', (_event, data) => callback(data));
  },
  removeBuildLogListener: () => {
    ipcRenderer.removeAllListeners('generator:build-log');
  }
});
