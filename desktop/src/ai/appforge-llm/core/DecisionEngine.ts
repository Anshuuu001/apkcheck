import { ConfidenceEngine } from './ConfidenceEngine';
import type { LearningDatabase } from '../learning/learningDb';

export class DecisionEngine {
  private confidenceEngine = new ConfidenceEngine();

  /**
   * Evaluates if we execute offline, trigger clarifying questions, or route to API:
   * - Confidence >= 90%: Offline (LOCAL)
   * - Confidence 70-89%: Ask user clarifying questions (QUESTIONS)
   * - Confidence < 70%: Use External LLM (API)
   */
  evaluate(idea: string, industry: string, db?: LearningDatabase): { action: 'LOCAL' | 'QUESTIONS' | 'API'; confidence: number } {
    const confidence = this.confidenceEngine.calculate(idea, industry, db);
    
    if (confidence >= 0.90) {
      return { action: 'LOCAL', confidence };
    }
    if (confidence >= 0.70) {
      return { action: 'QUESTIONS', confidence };
    }
    return { action: 'API', confidence };
  }
}
