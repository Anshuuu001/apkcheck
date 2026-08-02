import type { IntentResult } from '../../blueprint/schema';
import { DomainClassifier } from '../analyzer/DomainClassifier';
import { EntityExtractor } from '../analyzer/EntityExtractor';
import { FeatureExtractor } from '../analyzer/FeatureExtractor';
import { classifyWithLLM } from './llmClassifier';
import { deriveAppType, INDUSTRY_KEYWORDS, INDUSTRY_FEATURES, INDUSTRY_ROLES } from './localClassifier';

export class IntentAnalyzer {
  private domainClassifier = new DomainClassifier();
  private entityExtractor = new EntityExtractor();
  private featureExtractor = new FeatureExtractor();

  async analyze(idea: string): Promise<IntentResult> {
    // 1. Try to classify using LLM if available
    try {
      const llmResult = await classifyWithLLM(idea);
      if (llmResult) {
        return llmResult;
      }
    } catch (e) {
      console.warn('[IntentAnalyzer V2] LLM classification failed, falling back to heuristics:', e);
    }

    // 2. Local fallback heuristics execution
    const domainInfo = this.domainClassifier.classify(idea);
    const appType = deriveAppType(idea, domainInfo.industry);
    const targetUsers = this.entityExtractor.extractRoles(idea, domainInfo.industry);
    const suggestedFeatures = this.featureExtractor.extractFeatures(idea, domainInfo.industry);

    return {
      industry: domainInfo.industry,
      appType,
      targetUsers,
      primaryGoal: `Manage a ${appType} workflow for ${targetUsers.join(' and ')}`,
      suggestedFeatures,
      confidence: domainInfo.confidence,
      rawIdea: idea,
    };
  }
}

// Backward compatibility helper
export async function analyzeIntent(idea: string): Promise<IntentResult> {
  const analyzer = new IntentAnalyzer();
  return analyzer.analyze(idea);
}

export {
  INDUSTRY_ROLES,
  INDUSTRY_FEATURES,
  INDUSTRY_KEYWORDS
};
