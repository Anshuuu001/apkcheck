import { ConfidenceEngine } from './ConfidenceEngine';
import type { LearningDatabase } from '../learning/learningDb';

export class DecisionEngine {
  private confidenceEngine = new ConfidenceEngine();

  evaluate(idea: string, industry: string, db?: LearningDatabase): { action: 'LOCAL' | 'API' | 'OPTIONAL_API'; confidence: number } {
    const confidence = this.confidenceEngine.calculate(idea, industry, db);
    
    if (confidence >= 0.95) {
      return { action: 'LOCAL', confidence };
    }
    if (confidence >= 0.80) {
      return { action: 'OPTIONAL_API', confidence };
    }
    return { action: 'API', confidence };
  }
}
