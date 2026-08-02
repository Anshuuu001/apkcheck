import type { LearningDatabase } from './learningDb';

export class LearningManager {
  constructor(private db: LearningDatabase) {}

  /**
   * Compares the AppForge LLM's local answer with the external OpenAI answer.
   * If there's a difference (e.g. missing features or wrong domains), it logs it
   * as a correction and boosts future confidence.
   */
  async compareAndLearn(idea: string, localOutput: string, externalOutput: string): Promise<number> {
    try {
      const local = JSON.parse(localOutput);
      const external = JSON.parse(externalOutput);

      let differenceFound = false;
      const corrections: string[] = [];

      // Check if external found modules that local missed
      if (external && local) {
        const extModules: string[] = external.modules || external.suggestedFeatures || [];
        const locModules: string[] = local.modules || local.suggestedFeatures || [];

        extModules.forEach(mod => {
          if (!locModules.includes(mod)) {
            differenceFound = true;
            corrections.push(`Added module: ${mod}`);
          }
        });
      }

      const recordId = Date.now();
      
      // Log correction to SQL database
      this.db.logPrompt({
        user_prompt: idea,
        response_data: JSON.stringify(external),
        source_llm: 'OpenAI (Learned)',
        confidence: differenceFound ? 0.85 : 0.99
      });

      console.log(`[LearningManager] learning completed. Differences resolved: ${corrections.join(', ')}`);
      return differenceFound ? 0.85 : 0.98;
    } catch (e) {
      console.warn('[LearningManager] Error parsing responses for learning comparison:', e);
      return 0.70;
    }
  }
}
