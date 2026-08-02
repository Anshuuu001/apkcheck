/**
 * AppForge-AI — Project Context Manager
 * 
 * Central manager for per-project structured data.
 * Reads/writes requirements, blueprints, versions, and conversation history
 * through the Electron IPC bridge (SQLite) with localStorage fallback.
 */

import type { AppBlueprint, RequirementAnswers } from '../../blueprint/schema';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProjectContext {
  projectId: number;
  requirements: RequirementAnswers | null;
  blueprint: AppBlueprint | null;
  versions: VersionEntry[];
  conversationHistory: ConversationEntry[];
  lastUpdated: string;
}

export interface VersionEntry {
  id: number;
  tag: string;
  description: string;
  blueprintSnapshot: string;
  createdAt: string;
}

export interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ─── Project Context Manager ─────────────────────────────────────────────────

export class ProjectContextManager {
  private cache: Map<number, ProjectContext> = new Map();

  /**
   * Load the full context for a project. Uses Electron IPC if available,
   * falls back to localStorage for browser-only dev mode.
   */
  async loadContext(projectId: number): Promise<ProjectContext> {
    // Check cache first
    if (this.cache.has(projectId)) {
      return this.cache.get(projectId)!;
    }

    const context: ProjectContext = {
      projectId,
      requirements: null,
      blueprint: null,
      versions: [],
      conversationHistory: [],
      lastUpdated: new Date().toISOString(),
    };

    try {
      if (window.electronAPI && typeof window.electronAPI.getProjectDetails === 'function') {
        const details = await window.electronAPI.getProjectDetails(projectId);

        if (details?.project?.blueprint) {
          try {
            context.blueprint = JSON.parse(details.project.blueprint);
          } catch (_e) {
            console.warn('[ProjectContextManager] Failed to parse stored blueprint');
          }
        }

        // Load version history
        if (typeof window.electronAPI.getProjectVersions === 'function') {
          const versions = await window.electronAPI.getProjectVersions(projectId);
          context.versions = (versions || []).map((v: any) => ({
            id: v.id,
            tag: v.tag,
            description: v.description,
            blueprintSnapshot: v.blueprint_snapshot || v.blueprintSnapshot || '',
            createdAt: v.created_at || v.createdAt || '',
          }));
        }

        // Load conversation history
        if (details?.chatHistory) {
          context.conversationHistory = details.chatHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.created_at || new Date().toISOString(),
          }));
        }
      } else {
        // Fallback: localStorage
        const stored = localStorage.getItem(`appforge_context_${projectId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          Object.assign(context, parsed);
        }
      }
    } catch (e) {
      console.warn('[ProjectContextManager] Error loading context:', e);
    }

    this.cache.set(projectId, context);
    return context;
  }

  /**
   * Save requirement answers for a project.
   */
  async saveRequirements(projectId: number, requirements: RequirementAnswers): Promise<void> {
    const context = await this.loadContext(projectId);
    context.requirements = requirements;
    context.lastUpdated = new Date().toISOString();
    this.persistToLocalStorage(projectId, context);
  }

  /**
   * Save blueprint for a project.
   */
  async saveBlueprint(projectId: number, blueprint: AppBlueprint): Promise<void> {
    const context = await this.loadContext(projectId);
    context.blueprint = blueprint;
    context.lastUpdated = new Date().toISOString();

    // Persist to Electron if available
    try {
      if (window.electronAPI && typeof window.electronAPI.saveBlueprint === 'function') {
        await window.electronAPI.saveBlueprint(projectId, blueprint);
      }
    } catch (e) {
      console.warn('[ProjectContextManager] Error saving blueprint to Electron:', e);
    }

    this.persistToLocalStorage(projectId, context);
  }

  /**
   * Create a version snapshot.
   */
  async createSnapshot(projectId: number, tag: string, description: string): Promise<void> {
    const context = await this.loadContext(projectId);
    if (!context.blueprint) return;

    const blueprintJson = JSON.stringify(context.blueprint);

    try {
      if (window.electronAPI && typeof window.electronAPI.createProjectVersion === 'function') {
        const version = await window.electronAPI.createProjectVersion(projectId, tag, description, blueprintJson);
        context.versions.push({
          id: version.id || Date.now(),
          tag,
          description,
          blueprintSnapshot: blueprintJson,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('[ProjectContextManager] Error creating snapshot:', e);
      // Fallback: store in local context
      context.versions.push({
        id: Date.now(),
        tag,
        description,
        blueprintSnapshot: blueprintJson,
        createdAt: new Date().toISOString(),
      });
    }

    this.persistToLocalStorage(projectId, context);
  }

  /**
   * Add a conversation entry.
   */
  async addConversation(projectId: number, role: 'user' | 'assistant', content: string): Promise<void> {
    const context = await this.loadContext(projectId);
    context.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString(),
    });

    try {
      if (window.electronAPI && typeof window.electronAPI.addChatMessage === 'function') {
        await window.electronAPI.addChatMessage(projectId, role, content);
      }
    } catch (_e) {
      // Silent fallback
    }

    this.persistToLocalStorage(projectId, context);
  }

  /**
   * Get the version history for a project.
   */
  async getHistory(projectId: number): Promise<VersionEntry[]> {
    const context = await this.loadContext(projectId);
    return context.versions;
  }

  /**
   * Get the conversation summary for AI context.
   * Returns the last N messages formatted for prompt injection.
   */
  getConversationSummary(projectId: number, maxMessages: number = 10): string {
    const context = this.cache.get(projectId);
    if (!context || context.conversationHistory.length === 0) return '';

    const recent = context.conversationHistory.slice(-maxMessages);
    return recent.map(e => `[${e.role}]: ${e.content}`).join('\n');
  }

  /**
   * Invalidate cache for a project.
   */
  invalidate(projectId: number): void {
    this.cache.delete(projectId);
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private persistToLocalStorage(projectId: number, context: ProjectContext): void {
    try {
      localStorage.setItem(`appforge_context_${projectId}`, JSON.stringify({
        ...context,
        // Don't store large blueprint snapshots in localStorage
        versions: context.versions.map(v => ({ ...v, blueprintSnapshot: '' })),
      }));
    } catch (_e) {
      // localStorage full or unavailable
    }
  }
}
