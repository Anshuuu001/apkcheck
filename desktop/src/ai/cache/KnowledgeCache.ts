import type { IndustryKnowledge } from '../appforge-llm/core/KnowledgeEngine';

export class KnowledgeCache {
  private static cache = new Map<string, IndustryKnowledge>();

  static get(industry: string): IndustryKnowledge | null {
    return this.cache.get(industry) || null;
  }

  static set(industry: string, knowledge: IndustryKnowledge): void {
    this.cache.set(industry, knowledge);
  }

  static clear(): void {
    this.cache.clear();
  }
}
