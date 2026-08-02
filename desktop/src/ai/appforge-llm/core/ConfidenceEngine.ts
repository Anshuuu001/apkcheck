import { Tokenizer } from './Tokenizer';
import { INDUSTRIES_KNOWLEDGE } from '../../knowledge/industries';
import type { LearningDatabase } from '../learning/learningDb';

export class ConfidenceEngine {
  /**
   * Calculates local confidence score (0.0 to 1.0) based on keyword overlaps and learning history
   */
  calculate(idea: string, industry: string, db?: LearningDatabase): number {
    const tokens = Tokenizer.tokenize(idea);
    const knowledge = INDUSTRIES_KNOWLEDGE[industry];

    if (!knowledge || industry === 'Custom') {
      return 0.5; // low confidence for custom/unrecognized domains
    }

    // Measure overlap with required and optional modules
    const modules = [...knowledge.requiredModules, ...knowledge.optionalModules];
    const matchCount = modules.filter(mod => 
      tokens.some(token => mod.toLowerCase().includes(token) || token.includes(mod.toLowerCase()))
    ).length;

    let confidence = 0.5 + (matchCount / Math.max(1, modules.length)) * 0.45;

    // Check if learning history boosts this domain
    if (db) {
      const avgHist = db.getAverageConfidence(industry);
      if (avgHist > 0) {
        // Boost confidence if we have high historical averages!
        confidence = confidence * 0.7 + avgHist * 0.3;
      }
    }

    return Math.min(0.99, Math.max(0.1, confidence));
  }
}
