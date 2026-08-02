/**
 * AppForge-AI — History V2
 * 
 * Version control manager for blueprint snapshots, enabling rollbacks (Undo/Redo).
 */

import type { AppBlueprint } from '../../blueprint/schema';

export interface VersionCommit {
  version: number;
  description: string;
  blueprint: AppBlueprint;
  timestamp: string;
}

export class History {
  private commits: VersionCommit[] = [];
  private activeIndex = -1;

  commit(blueprint: AppBlueprint, description: string): void {
    // If we are committed in the middle of undo/redo stack, truncate future commits
    if (this.activeIndex < this.commits.length - 1) {
      this.commits = this.commits.slice(0, this.activeIndex + 1);
    }

    const nextVersion = this.commits.length + 1;
    this.commits.push({
      version: nextVersion,
      description,
      blueprint: JSON.parse(JSON.stringify(blueprint)), // Deep clone
      timestamp: new Date().toISOString(),
    });

    this.activeIndex = this.commits.length - 1;
  }

  getCurrent(): AppBlueprint | null {
    if (this.activeIndex >= 0 && this.activeIndex < this.commits.length) {
      return this.commits[this.activeIndex].blueprint;
    }
    return null;
  }

  undo(): AppBlueprint | null {
    if (this.activeIndex > 0) {
      this.activeIndex--;
      return this.commits[this.activeIndex].blueprint;
    }
    return null;
  }

  redo(): AppBlueprint | null {
    if (this.activeIndex < this.commits.length - 1) {
      this.activeIndex++;
      return this.commits[this.activeIndex].blueprint;
    }
    return null;
  }

  canUndo(): boolean {
    return this.activeIndex > 0;
  }

  canRedo(): boolean {
    return this.activeIndex < this.commits.length - 1;
  }

  getCommits(): VersionCommit[] {
    return this.commits;
  }

  clear(): void {
    this.commits = [];
    this.activeIndex = -1;
  }
}
