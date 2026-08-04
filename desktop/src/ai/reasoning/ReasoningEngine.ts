/**
 * AppForge-AI — Reasoning Engine ⭐
 * 
 * The "brain" of the AI pipeline. Takes raw intent and produces a structured
 * reasoning result that informs all downstream planners.
 */

import type { IntentResult, IndustryType } from '../../blueprint/schema';
import { INDUSTRY_STANDARDS, getDomainInsights, type DomainInsight } from './DomainKnowledge';
import { GapAnalyzer } from '../analyzer/GapAnalyzer';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SuggestedFeature {
  feature: string;
  reason: string;
  priority: 'must-have' | 'should-have' | 'nice-to-have';
  addedByAI: boolean;
}

export interface ArchDecision {
  pattern: 'real-time' | 'rest-api' | 'offline-first' | 'hybrid';
  reasoning: string;
  techStack: {
    stateManagement: string;
    networking: string;
    database: string;
    auth: string;
  };
}

export interface PriorityItem {
  feature: string;
  priority: 'must-have' | 'should-have' | 'nice-to-have';
  reason: string;
}

export interface ReasoningResult {
  domainInsights: DomainInsight[];
  suggestedFeatures: SuggestedFeature[];
  gapAnalysis: string[];
  architectureDecision: ArchDecision;
  priorityMatrix: PriorityItem[];
  estimatedScreenCount: number;
  estimatedComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  confidenceScore: number;
}

export class ReasoningEngine {
  private gapAnalyzer = new GapAnalyzer();

  async reason(intent: IntentResult, userFeatures: string[] = []): Promise<ReasoningResult> {
    const industry = intent.industry;
    const standard = INDUSTRY_STANDARDS[industry] || INDUSTRY_STANDARDS['Custom'];

    const domainInsights = getDomainInsights(industry, userFeatures);

    const gapAnalysis = this.gapAnalyzer.analyze(
      userFeatures,
      industry
    );

    const suggestedFeatures = this.buildSuggestions(industry, userFeatures, standard);
    const architectureDecision = this.decideArchitecture(industry, userFeatures, standard);
    const priorityMatrix = this.buildPriorityMatrix(userFeatures, standard);
    const estimatedScreenCount = this.estimateScreenCount(userFeatures, standard);
    const estimatedComplexity = this.estimateComplexity(userFeatures, intent.targetUsers, standard);
    const confidenceScore = this.calculateConfidence(intent, userFeatures, standard);

    return {
      domainInsights,
      suggestedFeatures,
      gapAnalysis,
      architectureDecision,
      priorityMatrix,
      estimatedScreenCount,
      estimatedComplexity,
      confidenceScore,
    };
  }

  private buildSuggestions(
    industry: IndustryType,
    userFeatures: string[],
    standard: typeof INDUSTRY_STANDARDS[IndustryType]
  ): SuggestedFeature[] {
    const suggestions: SuggestedFeature[] = [];

    standard.mustHaveFeatures.forEach(feature => {
      if (!userFeatures.includes(feature)) {
        suggestions.push({
          feature,
          reason: `Essential for ${industry} apps. Most competitors include this.`,
          priority: 'must-have',
          addedByAI: true,
        });
      }
    });

    const topCommon = standard.commonFeatures.slice(0, 4);
    topCommon.forEach(feature => {
      if (!userFeatures.includes(feature)) {
        suggestions.push({
          feature,
          reason: `Commonly found in successful ${industry} apps.`,
          priority: 'should-have',
          addedByAI: true,
        });
      }
    });

    if (!userFeatures.includes('notifications')) {
      suggestions.push({
        feature: 'notifications',
        reason: 'Push notifications increase user engagement by 3-10x.',
        priority: 'should-have',
        addedByAI: true,
      });
    }

    return suggestions;
  }

  private decideArchitecture(
    industry: IndustryType,
    userFeatures: string[],
    standard: typeof INDUSTRY_STANDARDS[IndustryType]
  ): ArchDecision {
    const hasRealTime = userFeatures.some(f =>
      ['text_chat', 'gps_tracking', 'live', 'video', 'voice', 'teleconsult'].includes(f)
    );
    const hasOffline = userFeatures.includes('offline');

    let pattern: ArchDecision['pattern'] = standard.recommendedArchitecture;
    let reasoning = `Based on ${industry} industry standards.`;

    if (hasRealTime && hasOffline) {
      pattern = 'hybrid';
      reasoning = 'App needs both real-time communication and offline capability.';
    } else if (hasRealTime) {
      pattern = 'real-time';
      reasoning = 'Real-time features detected (chat/GPS/video). WebSocket recommended.';
    } else if (hasOffline) {
      pattern = 'offline-first';
      reasoning = 'Offline-first approach needed. Local DB with background sync.';
    }

    return {
      pattern,
      reasoning,
      techStack: {
        stateManagement: 'Zustand (lightweight, React-native friendly)',
        networking: pattern === 'real-time' ? 'WebSocket + REST API fallback' : 'REST API (Axios)',
        database: 'MySQL (Spring Boot JPA)',
        auth: 'JWT with refresh tokens',
      },
    };
  }

  private buildPriorityMatrix(
    userFeatures: string[],
    standard: typeof INDUSTRY_STANDARDS[IndustryType]
  ): PriorityItem[] {
    const matrix: PriorityItem[] = [];

    userFeatures.forEach(feature => {
      matrix.push({
        feature,
        priority: standard.mustHaveFeatures.includes(feature) ? 'must-have' : 'should-have',
        reason: 'Explicitly requested by user.',
      });
    });

    standard.mustHaveFeatures.forEach(feature => {
      if (!userFeatures.includes(feature)) {
        matrix.push({
          feature,
          priority: 'must-have',
          reason: 'Industry standard requirement.',
        });
      }
    });

    return matrix;
  }

  private estimateScreenCount(
    userFeatures: string[],
    standard: typeof INDUSTRY_STANDARDS[IndustryType]
  ): number {
    let count = 3;
    count += Math.ceil(userFeatures.length * 1.5);
    count += 1;
    return Math.max(standard.typicalScreenCount.min, Math.min(count, standard.typicalScreenCount.max));
  }

  private estimateComplexity(
    userFeatures: string[],
    userRoles: string[],
    standard: typeof INDUSTRY_STANDARDS[IndustryType]
  ): ReasoningResult['estimatedComplexity'] {
    const score =
      userFeatures.length * 2 +
      userRoles.length * 3 +
      (standard.dataPrivacyLevel !== 'standard' ? 10 : 0) +
      (standard.recommendedArchitecture === 'real-time' ? 5 : 0);

    if (score >= 30) return 'enterprise';
    if (score >= 20) return 'complex';
    if (score >= 10) return 'moderate';
    return 'simple';
  }

  private calculateConfidence(
    intent: IntentResult,
    userFeatures: string[],
    standard: typeof INDUSTRY_STANDARDS[IndustryType]
  ): number {
    let confidence = intent.confidence;

    const overlap = userFeatures.filter(f =>
      [...standard.mustHaveFeatures, ...standard.commonFeatures].includes(f)
    );
    confidence += (overlap.length / Math.max(userFeatures.length, 1)) * 0.15;

    return Math.min(confidence, 0.98);
  }
}
