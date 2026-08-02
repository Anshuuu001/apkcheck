export interface Project {
  id: number;
  name: string;
  theme: string;
  created_at: string;
  updated_at: string;
  settings: string;
  blueprint: string;
}

export interface Screen {
  id: number;
  project_id: number;
  name: string;
  layout_data: string;
  created_at: string;
  updated_at: string;
}

export interface Component {
  id: number;
  project_id: number;
  name: string;
  type: string;
  config_data: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  project_id: number;
  role: 'user' | 'assistant';
  content: string;
  image_path?: string;
  created_at: string;
}

export interface ProjectVersion {
  id: number;
  project_id: number;
  version_tag: string;
  description: string;
  blueprint_content: string;
  created_at: string;
}

export interface ElectronAPI {
  getProjects(): Promise<Project[]>;
  createProject(name: string, theme?: string): Promise<Project>;
  renameProject(id: number, newName: string): Promise<{ success: boolean }>;
  deleteProject(id: number): Promise<{ success: boolean }>;
  getProjectDetails(id: number): Promise<{
    project: Project;
    screens: Screen[];
    components: Component[];
    chatHistory: ChatMessage[];
  }>;
  saveSettings(projectId: number, settings: any): Promise<{ success: boolean }>;
  saveBlueprint(projectId: number, blueprint: any): Promise<{ success: boolean }>;
  updateBlueprint(projectId: number, blueprintJson: string): Promise<{ success: boolean }>;
  syncProject(projectId: number): Promise<{ success: boolean }>;
  getProjectVersions(projectId: number): Promise<ProjectVersion[]>;
  createProjectVersion(projectId: number, tag: string, desc: string, blueprint: string): Promise<ProjectVersion>;
  deleteProjectVersion(id: number): Promise<{ success: boolean }>;

  createScreen(projectId: number, name: string, layoutData: string): Promise<Screen>;
  updateScreen(id: number, name: string, layoutData: string): Promise<{ success: boolean }>;
  deleteScreen(id: number): Promise<{ success: boolean }>;

  createComponent(projectId: number, name: string, type: string, configData: string): Promise<Component>;
  updateComponent(id: number, name: string, type: string, configData: string): Promise<{ success: boolean }>;
  deleteComponent(id: number): Promise<{ success: boolean }>;

  getChatHistory(projectId: number): Promise<ChatMessage[]>;
  addChatMessage(projectId: number, role: 'user' | 'assistant', content: string, imagePath?: string): Promise<ChatMessage>;
  clearChatHistory(projectId: number): Promise<{ success: boolean }>;

  buildBlueprint(projectId: number, schema: any): Promise<{
    success: boolean;
    blueprint: any;
  }>;
  analyzeProjectIntent(message: string, currentBlueprint: any): Promise<any>;
  validateProjectRequirements(projectId: number): Promise<any[]>;
  generateCodeAssets(projectId: number): Promise<{ success: boolean; filesGenerated: string[] }>;
  buildRelease(projectId: number): Promise<{ success: boolean; apkPath: string; zipPath: string; exportDir: string }>;
  onBuildLog(callback: (data: { projectId: number; message: string }) => void): void;
  removeBuildLogListener(): void;
  getBlueprint(projectId: number): Promise<any>;
  callAI(prompt: string): Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
