import path from 'path';
import fs from 'fs';

// Database interfaces
export interface Project {
  id: number;
  name: string;
  theme: string;
  created_at: string;
  updated_at: string;
  settings: string; // JSON string
  blueprint: string; // JSON string (Phase 2 Blueprint)
}

export interface Screen {
  id: number;
  project_id: number;
  name: string;
  layout_data: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface Component {
  id: number;
  project_id: number;
  name: string;
  type: string;
  config_data: string; // JSON string
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

export interface IDatabase {
  getProjects(): Project[];
  getProject(id: number): Project | null;
  getProjectByName(name: string): Project | null;
  createProject(name: string, theme: string, settings: string, blueprint: string): Project;
  updateProject(id: number, name: string, theme: string, settings: string, blueprint: string): void;
  deleteProject(id: number): void;
  
  getScreens(projectId: number): Screen[];
  createScreen(projectId: number, name: string, layoutData: string): Screen;
  updateScreen(id: number, name: string, layoutData: string): void;
  deleteScreen(id: number): void;
  
  getComponents(projectId: number): Component[];
  createComponent(projectId: number, name: string, type: string, configData: string): Component;
  updateComponent(id: number, name: string, type: string, configData: string): void;
  deleteComponent(id: number): void;
  
  getChatHistory(projectId: number): ChatMessage[];
  addChatMessage(projectId: number, role: 'user' | 'assistant', content: string, imagePath?: string): ChatMessage;
  clearChatHistory(projectId: number): void;

  getProjectVersions(projectId: number): ProjectVersion[];
  createProjectVersion(projectId: number, versionTag: string, description: string, blueprintContent: string): ProjectVersion;
  deleteProjectVersion(id: number): void;
}

// Fallback JSON-based Database Implementation
class JsonDatabase implements IDatabase {
  private filePath: string;
  private data: {
    projects: Project[];
    screens: Screen[];
    components: Component[];
    chat_messages: ChatMessage[];
    project_versions: ProjectVersion[];
    lastIds: { [key: string]: number };
  };

  constructor(projectsDir: string) {
    this.filePath = path.join(projectsDir, 'appforge_db_fallback.json');
    this.data = {
      projects: [],
      screens: [],
      components: [],
      chat_messages: [],
      project_versions: [],
      lastIds: { projects: 0, screens: 0, components: 0, chat_messages: 0, project_versions: 0 }
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(fileContent);
        // Ensure structure is correct
        if (!this.data.projects) this.data.projects = [];
        if (!this.data.screens) this.data.screens = [];
        if (!this.data.components) this.data.components = [];
        if (!this.data.chat_messages) this.data.chat_messages = [];
        if (!this.data.project_versions) this.data.project_versions = [];
        if (!this.data.lastIds) this.data.lastIds = { projects: 0, screens: 0, components: 0, chat_messages: 0, project_versions: 0 };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading fallback JSON database:', err);
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving fallback JSON database:', err);
    }
  }

  private getNextId(table: string): number {
    this.data.lastIds[table] = (this.data.lastIds[table] || 0) + 1;
    return this.data.lastIds[table];
  }

  getProjects(): Project[] {
    return this.data.projects;
  }

  getProject(id: number): Project | null {
    return this.data.projects.find(p => p.id === id) || null;
  }

  getProjectByName(name: string): Project | null {
    return this.data.projects.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
  }

  createProject(name: string, theme: string, settings: string, blueprint: string): Project {
    const timestamp = new Date().toISOString();
    const project: Project = {
      id: this.getNextId('projects'),
      name,
      theme,
      created_at: timestamp,
      updated_at: timestamp,
      settings,
      blueprint
    };
    this.data.projects.push(project);
    this.save();
    return project;
  }

  updateProject(id: number, name: string, theme: string, settings: string, blueprint: string): void {
    const project = this.data.projects.find(p => p.id === id);
    if (project) {
      project.name = name;
      project.theme = theme;
      project.settings = settings;
      project.blueprint = blueprint;
      project.updated_at = new Date().toISOString();
      this.save();
    }
  }

  deleteProject(id: number): void {
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    this.data.screens = this.data.screens.filter(s => s.project_id !== id);
    this.data.components = this.data.components.filter(c => c.project_id !== id);
    this.data.chat_messages = this.data.chat_messages.filter(m => m.project_id !== id);
    this.save();
  }

  getScreens(projectId: number): Screen[] {
    return this.data.screens.filter(s => s.project_id === projectId);
  }

  createScreen(projectId: number, name: string, layoutData: string): Screen {
    const timestamp = new Date().toISOString();
    const screen: Screen = {
      id: this.getNextId('screens'),
      project_id: projectId,
      name,
      layout_data: layoutData,
      created_at: timestamp,
      updated_at: timestamp
    };
    this.data.screens.push(screen);
    this.save();
    return screen;
  }

  updateScreen(id: number, name: string, layoutData: string): void {
    const screen = this.data.screens.find(s => s.id === id);
    if (screen) {
      screen.name = name;
      screen.layout_data = layoutData;
      screen.updated_at = new Date().toISOString();
      this.save();
    }
  }

  deleteScreen(id: number): void {
    this.data.screens = this.data.screens.filter(s => s.id !== id);
    this.save();
  }

  getComponents(projectId: number): Component[] {
    return this.data.components.filter(c => c.project_id === projectId);
  }

  createComponent(projectId: number, name: string, type: string, configData: string): Component {
    const timestamp = new Date().toISOString();
    const component: Component = {
      id: this.getNextId('components'),
      project_id: projectId,
      name,
      type,
      config_data: configData,
      created_at: timestamp,
      updated_at: timestamp
    };
    this.data.components.push(component);
    this.save();
    return component;
  }

  updateComponent(id: number, name: string, type: string, configData: string): void {
    const component = this.data.components.find(c => c.id === id);
    if (component) {
      component.name = name;
      component.type = type;
      component.config_data = configData;
      component.updated_at = new Date().toISOString();
      this.save();
    }
  }

  deleteComponent(id: number): void {
    this.data.components = this.data.components.filter(c => c.id !== id);
    this.save();
  }

  getChatHistory(projectId: number): ChatMessage[] {
    return this.data.chat_messages.filter(m => m.project_id === projectId);
  }

  addChatMessage(projectId: number, role: 'user' | 'assistant', content: string, imagePath?: string): ChatMessage {
    const message: ChatMessage = {
      id: this.getNextId('chat_messages'),
      project_id: projectId,
      role,
      content,
      image_path: imagePath,
      created_at: new Date().toISOString()
    };
    this.data.chat_messages.push(message);
    this.save();
    return message;
  }

  clearChatHistory(projectId: number): void {
    this.data.chat_messages = this.data.chat_messages.filter(m => m.project_id !== projectId);
    this.save();
  }

  getProjectVersions(projectId: number): ProjectVersion[] {
    return (this.data.project_versions || []).filter(v => v.project_id === projectId);
  }

  createProjectVersion(projectId: number, versionTag: string, description: string, blueprintContent: string): ProjectVersion {
    const timestamp = new Date().toISOString();
    const version: ProjectVersion = {
      id: this.getNextId('project_versions'),
      project_id: projectId,
      version_tag: versionTag,
      description,
      blueprint_content: blueprintContent,
      created_at: timestamp
    };
    if (!this.data.project_versions) this.data.project_versions = [];
    this.data.project_versions.push(version);
    this.save();
    return version;
  }

  deleteProjectVersion(id: number): void {
    if (this.data.project_versions) {
      this.data.project_versions = this.data.project_versions.filter(v => v.id !== id);
      this.save();
    }
  }
}

// SQLite Database Implementation using better-sqlite3
class SqliteDatabase implements IDatabase {
  private db: any;

  constructor(dbPath: string) {
    const Database = require('better-sqlite3');
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Create projects table
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        theme TEXT NOT NULL DEFAULT 'Dark',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        settings TEXT NOT NULL,
        blueprint TEXT NOT NULL
      )
    `).run();

    // Create screens table
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS screens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        layout_data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `).run();

    // Create components table
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS components (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        config_data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `).run();

    // Create chat_history table
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        image_path TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `).run();

    // Create project_versions table
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS project_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        version_tag TEXT NOT NULL,
        description TEXT,
        blueprint_content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `).run();
  }

  getProjects(): Project[] {
    return this.db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all();
  }

  getProject(id: number): Project | null {
    return this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id) || null;
  }

  getProjectByName(name: string): Project | null {
    return this.db.prepare('SELECT * FROM projects WHERE name = ?').get(name) || null;
  }

  createProject(name: string, theme: string, settings: string, blueprint: string): Project {
    const timestamp = new Date().toISOString();
    const result = this.db.prepare(`
      INSERT INTO projects (name, theme, created_at, updated_at, settings, blueprint)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, theme, timestamp, timestamp, settings, blueprint);
    
    return {
      id: Number(result.lastInsertRowid),
      name,
      theme,
      created_at: timestamp,
      updated_at: timestamp,
      settings,
      blueprint
    };
  }

  updateProject(id: number, name: string, theme: string, settings: string, blueprint: string): void {
    const timestamp = new Date().toISOString();
    this.db.prepare(`
      UPDATE projects 
      SET name = ?, theme = ?, settings = ?, blueprint = ?, updated_at = ?
      WHERE id = ?
    `).run(name, theme, settings, blueprint, timestamp, id);
  }

  deleteProject(id: number): void {
    this.db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  }

  getScreens(projectId: number): Screen[] {
    return this.db.prepare('SELECT * FROM screens WHERE project_id = ?').all(projectId);
  }

  createScreen(projectId: number, name: string, layoutData: string): Screen {
    const timestamp = new Date().toISOString();
    const result = this.db.prepare(`
      INSERT INTO screens (project_id, name, layout_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(projectId, name, layoutData, timestamp, timestamp);

    return {
      id: Number(result.lastInsertRowid),
      project_id: projectId,
      name,
      layout_data: layoutData,
      created_at: timestamp,
      updated_at: timestamp
    };
  }

  updateScreen(id: number, name: string, layoutData: string): void {
    const timestamp = new Date().toISOString();
    this.db.prepare(`
      UPDATE screens SET name = ?, layout_data = ?, updated_at = ? WHERE id = ?
    `).run(name, layoutData, timestamp, id);
  }

  deleteScreen(id: number): void {
    this.db.prepare('DELETE FROM screens WHERE id = ?').run(id);
  }

  getComponents(projectId: number): Component[] {
    return this.db.prepare('SELECT * FROM components WHERE project_id = ?').all(projectId);
  }

  createComponent(projectId: number, name: string, type: string, configData: string): Component {
    const timestamp = new Date().toISOString();
    const result = this.db.prepare(`
      INSERT INTO components (project_id, name, type, config_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(projectId, name, type, configData, timestamp, timestamp);

    return {
      id: Number(result.lastInsertRowid),
      project_id: projectId,
      name,
      type,
      config_data: configData,
      created_at: timestamp,
      updated_at: timestamp
    };
  }

  updateComponent(id: number, name: string, type: string, configData: string): void {
    const timestamp = new Date().toISOString();
    this.db.prepare(`
      UPDATE components SET name = ?, type = ?, config_data = ?, updated_at = ? WHERE id = ?
    `).run(name, type, configData, timestamp, id);
  }

  deleteComponent(id: number): void {
    this.db.prepare('DELETE FROM components WHERE id = ?').run(id);
  }

  getChatHistory(projectId: number): ChatMessage[] {
    return this.db.prepare('SELECT * FROM chat_history WHERE project_id = ? ORDER BY id ASC').all(projectId);
  }

  addChatMessage(projectId: number, role: 'user' | 'assistant', content: string, imagePath?: string): ChatMessage {
    const timestamp = new Date().toISOString();
    const result = this.db.prepare(`
      INSERT INTO chat_history (project_id, role, content, image_path, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(projectId, role, content, imagePath || null, timestamp);

    return {
      id: Number(result.lastInsertRowid),
      project_id: projectId,
      role,
      content,
      image_path: imagePath,
      created_at: timestamp
    };
  }

  clearChatHistory(projectId: number): void {
    this.db.prepare('DELETE FROM chat_history WHERE project_id = ?').run(projectId);
  }

  getProjectVersions(projectId: number): ProjectVersion[] {
    return this.db.prepare('SELECT * FROM project_versions WHERE project_id = ? ORDER BY id DESC').all(projectId);
  }

  createProjectVersion(projectId: number, versionTag: string, description: string, blueprintContent: string): ProjectVersion {
    const timestamp = new Date().toISOString();
    const result = this.db.prepare(`
      INSERT INTO project_versions (project_id, version_tag, description, blueprint_content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(projectId, versionTag, description, blueprintContent, timestamp);

    return {
      id: Number(result.lastInsertRowid),
      project_id: projectId,
      version_tag: versionTag,
      description,
      blueprint_content: blueprintContent,
      created_at: timestamp
    };
  }

  deleteProjectVersion(id: number): void {
    this.db.prepare('DELETE FROM project_versions WHERE id = ?').run(id);
  }
}

// Database Manager Factory
export function initDatabase(projectsDir: string): IDatabase {
  const dbPath = path.join(projectsDir, 'appforge.db');
  console.log(`Database target path: ${dbPath}`);

  try {
    // Attempt to load better-sqlite3 and instantiate the SQLite database
    console.log('Attempting to initialize SQLite database with better-sqlite3...');
    const dbInstance = new SqliteDatabase(dbPath);
    console.log('SQLite database successfully initialized!');
    return dbInstance;
  } catch (error) {
    console.warn('Failed to load better-sqlite3 native driver. Falling back to JSON file-based database.', error);
    return new JsonDatabase(projectsDir);
  }
}
