import type { AppBlueprint } from '../../blueprint/schema';

export class BlueprintCache {
  private static cache = new Map<string, { blueprint: AppBlueprint; expires: number }>();

  /**
   * Retrieves cached blueprint by project identifier
   */
  static get(projectId: string): AppBlueprint | null {
    const entry = this.cache.get(projectId);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.cache.delete(projectId);
      return null;
    }
    return entry.blueprint;
  }

  /**
   * Saves blueprint structure to cache with 10 minutes default TTL
   */
  static set(projectId: string, blueprint: AppBlueprint, ttlMs: number = 10 * 60 * 1000): void {
    this.cache.set(projectId, {
      blueprint,
      expires: Date.now() + ttlMs
    });
  }

  static clear(): void {
    this.cache.clear();
  }
}
