/**
 * AppForge-AI — Reasoning Engine ⭐
 * 
 * The "brain" of the AI pipeline. Takes raw intent and produces a structured
 * reasoning result that informs all downstream planners.
 * 
 * Flow: Idea → Intent → ★ REASONING ★ → Requirements → Planning → Blueprint
 */

import type { IntentResult, IndustryType } from '../../blueprint/schema';
import { INDUSTRY_STANDARDS, getDomainInsights, type DomainInsight } from './DomainKnowledge';
import { analyzeGaps, type GapItem } from './GapAnalyzer';

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
  gapAnalysis: GapItem[];
  architectureDecision: ArchDecision;
  priorityMatrix: PriorityItem[];
  estimatedScreenCount: number;
  estimatedComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  confidenceScore: number;
}

// ─── Reasoning Engine ────────────────────────────────────────────────────────

export class ReasoningEngine {

  /**
   * Performs deep reasoning on the user's intent to produce structured analysis
   * that informs all downstream planners (screens, DB, API, business logic).
   */
  async reason(intent: IntentResult, userFeatures: string[] = []): Promise<ReasoningResult> {
    const industry = intent.industry;
    const standard = INDUSTRY_STANDARDS[industry] || INDUSTRY_STANDARDS['Custom'];

    // 1. Domain insights — what does the AI know about this industry?
    const domainInsights = getDomainInsights(industry, userFeatures);

    // 2. Gap analysis — what's missing?
    const gapAnalysis = analyzeGaps(
      industry,
      userFeatures,
      intent.targetUsers,
      true, // authRequired assumed true as default reasoning
      userFeatures.some(f => ['billing', 'cart', 'payments', 'fees'].includes(f))
    );

    // 3. Feature suggestions — AI-recommended additions
    const suggestedFeatures = this.buildSuggestions(industry, userFeatures, standard);

    // 4. Architecture decision — what tech pattern fits?
    const architectureDecision = this.decideArchitecture(industry, userFeatures, standard);

    // 5. Priority matrix — rank everything
    const priorityMatrix = this.buildPriorityMatrix(userFeatures, standard);

    // 6. Estimate screen count and complexity
    const estimatedScreenCount = this.estimateScreenCount(userFeatures, standard);
    const estimatedComplexity = this.estimateComplexity(userFeatures, intent.targetUsers, standard);

    // 7. Confidence score (how sure are we about our reasoning)
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

  // ─── Private Helpers ─────────────────────────────────────────────────────

  private buildSuggestions(
    industry: IndustryType,
    userFeatures: string[],
    standard: typeof INDUSTRY_STANDARDS[IndustryType]
  ): SuggestedFeature[] {
    const suggestions: SuggestedFeature[] = [];

    // Must-have features user didn't request
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

    // Common features that would improve the app
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

    // Always suggest notifications if not present
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

    // User-requested features are automatically must-have
    userFeatures.forEach(feature => {
      matrix.push({
        feature,
        priority: standard.mustHaveFeatures.includes(feature) ? 'must-have' : 'should-have',
        reason: 'Explicitly requested by user.',
      });
    });

    // Must-haves not requested by user
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
    // Base: 3 screens (splash, login, home)
    let count = 3;
    // Each feature adds ~1.5 screens on average
    count += Math.ceil(userFeatures.length * 1.5);
    // Profile screen
    count += 1;
    // Clamp to industry range
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

    // Boost confidence if user features align with industry standards
    const overlap = userFeatures.filter(f =>
      [...standard.mustHaveFeatures, ...standard.commonFeatures].includes(f)
    );
    confidence += (overlap.length / Math.max(userFeatures.length, 1)) * 0.15;

    // Cap at 0.98
    return Math.min(confidence, 0.98);
  }
}
