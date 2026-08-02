import { KnowledgeEngine } from './KnowledgeEngine';
import { ReasoningEngine } from './ReasoningEngine';
import { DecisionEngine } from './DecisionEngine';
import type { LearningDatabase } from '../learning/learningDb';

export class Brain {
  private knowledgeEngine = new KnowledgeEngine();
  private reasoningEngine = new ReasoningEngine();
  private decisionEngine = new DecisionEngine();

  constructor(private db?: LearningDatabase) {}

  /**
   * Directs the request flow: User Idea -> Brain -> Knowledge -> Reasoning -> Decision -> Output
   */
  async processRequest(idea: string, industry: string): Promise<{
    intent: string;
    confidence: number;
    decision: 'LOCAL' | 'API' | 'OPTIONAL_API';
    suggestedModules: string[];
  }> {
    // 1. Fetch template domain knowledge (Offline / No API)
    const knowledge = this.knowledgeEngine.getKnowledge(industry);
    const baselineModules = knowledge ? [...knowledge.requiredModules, ...knowledge.optionalModules] : [];

    // 2. Resolve relationships constraints (Offline / No API)
    const reasonedModules = this.reasoningEngine.resolveConstraints(baselineModules);

    // 3. Evaluate Confidence and Decision trigger paths
    const decision = this.decisionEngine.evaluate(idea, industry, this.db);

    console.log(`[AppForge LLM - Brain] Request evaluated. Confidence: ${Math.round(decision.confidence * 100)}%. Decision: ${decision.action}`);

    return {
      intent: 'CREATE_APPLICATION',
      confidence: decision.confidence,
      decision: decision.action,
      suggestedModules: reasonedModules
    };
  }
}
