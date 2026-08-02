export interface ProjectMemoryRecord {
  projectId: string;
  conversationHistory: { role: string; content: string }[];
  blueprintsHistory: any[];
  learningCorrections: string[];
}

export class MemoryEngine {
  private static memories = new Map<string, ProjectMemoryRecord>();

  /**
   * Loads or instantiates standard project memory tracking
   */
  static getProjectMemory(projectId: string): ProjectMemoryRecord {
    let memory = this.memories.get(projectId);
    if (!memory) {
      memory = {
        projectId,
        conversationHistory: [],
        blueprintsHistory: [],
        learningCorrections: []
      };
      this.memories.set(projectId, memory);
    }
    return memory;
  }

  static logMessage(projectId: string, role: string, content: string): void {
    const memory = this.getProjectMemory(projectId);
    memory.conversationHistory.push({ role, content });
  }

  static recordBlueprintUpdate(projectId: string, blueprint: any): void {
    const memory = this.getProjectMemory(projectId);
    memory.blueprintsHistory.push(JSON.parse(JSON.stringify(blueprint)));
  }

  static addCorrection(projectId: string, correction: string): void {
    const memory = this.getProjectMemory(projectId);
    memory.learningCorrections.push(correction);
  }
}
