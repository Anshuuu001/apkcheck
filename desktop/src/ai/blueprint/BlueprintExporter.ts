/**
 * AppForge-AI — Blueprint Exporter V2
 * 
 * Serializes and exports blueprints to disk, backend database storage, or markdown docs.
 */

import type { AppBlueprint } from '../../blueprint/schema';
import { exportBlueprintAsMarkdown } from '../../blueprint/exporter';

export class BlueprintExporter {
  async export(projectId: number, blueprint: AppBlueprint): Promise<void> {
    try {
      const serialized = JSON.stringify(blueprint, null, 2);
      if (window.electronAPI && typeof window.electronAPI.updateBlueprint === 'function') {
        await window.electronAPI.updateBlueprint(projectId, serialized);
      } else {
        console.warn('[BlueprintExporter V2] electronAPI.updateBlueprint not available. Saving in local storage.');
        localStorage.setItem(`appforge_blueprint_${projectId}`, serialized);
      }
    } catch (e) {
      console.error('[BlueprintExporter V2] Export failed:', e);
      throw e;
    }
  }

  exportMarkdown(blueprint: AppBlueprint): string {
    return exportBlueprintAsMarkdown(blueprint);
  }
}
