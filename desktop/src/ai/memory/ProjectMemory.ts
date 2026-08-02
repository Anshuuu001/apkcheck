/**
 * AppForge-AI — Project Memory V2
 * 
 * Manages project-specific metadata, loaded context rules,
 * templates, and persistent configurations.
 */

import type { AppBlueprint } from '../../blueprint/schema';

export interface ProjectMetadata {
  projectId: number;
  name: string;
  industry: string;
  version: string;
  themeMode: 'light' | 'dark';
}

export class ProjectMemory {
  private activeMetadata: ProjectMetadata | null = null;
  private currentBlueprint: AppBlueprint | null = null;

  loadProject(blueprint: AppBlueprint): void {
    this.currentBlueprint = blueprint;
    this.activeMetadata = {
      projectId: parseInt(blueprint.id.split('_')[1]) || 0,
      name: blueprint.name,
      industry: blueprint.industry,
      version: blueprint.version,
      themeMode: blueprint.theme?.mode || 'light',
    };
  }

  getMetadata(): ProjectMetadata | null {
    return this.activeMetadata;
  }

  getCurrentBlueprint(): AppBlueprint | null {
    return this.currentBlueprint;
  }

  hasActiveProject(): boolean {
    return this.currentBlueprint !== null;
  }

  clear(): void {
    this.activeMetadata = null;
    this.currentBlueprint = null;
  }
}
