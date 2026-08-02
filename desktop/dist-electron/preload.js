// src/main/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Project Manager APIs
  getProjects: () => import_electron.ipcRenderer.invoke("projects:getAll"),
  createProject: (name, theme) => import_electron.ipcRenderer.invoke("projects:create", name, theme),
  renameProject: (id, newName) => import_electron.ipcRenderer.invoke("projects:rename", id, newName),
  deleteProject: (id) => import_electron.ipcRenderer.invoke("projects:delete", id),
  getProjectDetails: (id) => import_electron.ipcRenderer.invoke("projects:getDetails", id),
  saveSettings: (projectId, settings) => import_electron.ipcRenderer.invoke("projects:saveSettings", projectId, settings),
  saveBlueprint: (projectId, blueprint) => import_electron.ipcRenderer.invoke("projects:saveBlueprint", projectId, blueprint),
  updateBlueprint: (projectId, blueprintJson) => {
    try {
      const parsed = JSON.parse(blueprintJson);
      return import_electron.ipcRenderer.invoke("projects:saveBlueprint", projectId, parsed);
    } catch (e) {
      return Promise.reject(new Error("Invalid blueprint JSON structure: " + e));
    }
  },
  syncProject: (projectId) => import_electron.ipcRenderer.invoke("projects:sync", projectId),
  getProjectVersions: (projectId) => import_electron.ipcRenderer.invoke("projects:getVersions", projectId),
  createProjectVersion: (projectId, tag, desc, blueprint) => import_electron.ipcRenderer.invoke("projects:createVersion", projectId, tag, desc, blueprint),
  deleteProjectVersion: (id) => import_electron.ipcRenderer.invoke("projects:deleteVersion", id),
  // Screen APIs
  createScreen: (projectId, name, layoutData) => import_electron.ipcRenderer.invoke("screens:create", projectId, name, layoutData),
  updateScreen: (id, name, layoutData) => import_electron.ipcRenderer.invoke("screens:update", id, name, layoutData),
  deleteScreen: (id) => import_electron.ipcRenderer.invoke("screens:delete", id),
  // Component APIs
  createComponent: (projectId, name, type, configData) => import_electron.ipcRenderer.invoke("components:create", projectId, name, type, configData),
  updateComponent: (id, name, type, configData) => import_electron.ipcRenderer.invoke("components:update", id, name, type, configData),
  deleteComponent: (id) => import_electron.ipcRenderer.invoke("components:delete", id),
  // Chat APIs
  getChatHistory: (projectId) => import_electron.ipcRenderer.invoke("chat:getHistory", projectId),
  addChatMessage: (projectId, role, content, imagePath) => import_electron.ipcRenderer.invoke("chat:addMessage", projectId, role, content, imagePath),
  clearChatHistory: (projectId) => import_electron.ipcRenderer.invoke("chat:clearHistory", projectId),
  // Blueprint engine planner helper (Phase 2 Step 8)
  buildBlueprint: (projectId, schema) => import_electron.ipcRenderer.invoke("blueprint:build", projectId, schema),
  // Custom analysis and validation hooks
  analyzeProjectIntent: (message, currentBlueprint) => import_electron.ipcRenderer.invoke("projects:analyze-intent", message, currentBlueprint),
  validateProjectRequirements: (projectId) => import_electron.ipcRenderer.invoke("projects:validate-requirements", projectId),
  callAI: (prompt) => import_electron.ipcRenderer.invoke("projects:call-ai", prompt),
  // Screen Generator Engine Trigger (Phase 3)
  generateCodeAssets: (projectId) => import_electron.ipcRenderer.invoke("generator:run", projectId),
  // Build System APIs (Phase 10)
  buildRelease: (projectId) => import_electron.ipcRenderer.invoke("generator:build-release", projectId),
  onBuildLog: (callback) => {
    import_electron.ipcRenderer.on("generator:build-log", (_event, data) => callback(data));
  },
  removeBuildLogListener: () => {
    import_electron.ipcRenderer.removeAllListeners("generator:build-log");
  }
});
//# sourceMappingURL=preload.js.map
