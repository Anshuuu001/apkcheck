/**
 * AppForge-AI — Domain Classifier (V2 Analyzer)
 * 
 * Identifies the target industry of the application using rule-based heuristics
 * with an optional machine learning/LLM reinforcement.
 */

import type { IndustryType } from '../../blueprint/schema';
import { detectIndustry } from '../intentAnalyzer/localClassifier';

export class DomainClassifier {
  classify(idea: string): { industry: IndustryType; confidence: number } {
    // Rely on localClassifier's keyword detection rule set
    const result = detectIndustry(idea);
    
    // Default to Custom if confidence is extremely low
    if (result.confidence < 0.05) {
      return { industry: 'Custom', confidence: 0.1 };
    }
    
    return result;
  }
}
