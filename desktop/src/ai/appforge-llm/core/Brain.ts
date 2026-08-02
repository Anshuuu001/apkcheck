import { IntentAnalyzer } from '../../analyzer/IntentAnalyzer';
import { KnowledgeEngine } from './KnowledgeEngine';
import { ReasoningEngine } from './ReasoningEngine';
import { DecisionEngine } from './DecisionEngine';
import { InterviewEngine } from '../../interview/InterviewEngine';
import type { LearningDatabase } from '../learning/learningDb';

export class Brain {
  private intentAnalyzer = new IntentAnalyzer();
  private knowledgeEngine = new KnowledgeEngine();
  private reasoningEngine = new ReasoningEngine();
  private decisionEngine = new DecisionEngine();
  private interviewEngine = new InterviewEngine();

  constructor(private db?: LearningDatabase) {}

  /**
   * Directs request sequence: User Idea -> Brain -> IntentAnalyzer -> KnowledgeEngine -> ReasoningEngine -> DecisionEngine -> InterviewEngine
   */
  async processRequest(idea: string, industry: string): Promise<{
    intent: string;
    confidence: number;
    decision: 'LOCAL' | 'QUESTIONS' | 'API';
    suggestedModules: string[];
    missingModules: string[];
    questions: any[];
  }> {
    // 1. Resolve prompt command intent
    const intentResult = await this.intentAnalyzer.analyze(idea);

    // 2. Fetch template domain knowledge (Offline / No API)
    const knowledge = this.knowledgeEngine.getKnowledge(industry);
    const baselineModules = knowledge ? [...knowledge.roles, ...knowledge.screens, ...knowledge.entities] : [];

    // 3. Infer missing modules and solve constraints dynamically
    const reasonedModules = this.reasoningEngine.inferModules(idea, baselineModules);

    // 4. Evaluate Confidence score and Decision trigger gates
    const decision = this.decisionEngine.evaluate(idea, industry, this.db);

    // 5. Gather missing gaps and toggle interview questions
    const missingModules = knowledge ? knowledge.recommendedFeatures.filter(f => !reasonedModules.includes(f)) : [];
    const questions = this.interviewEngine.generateQuestions(industry, missingModules);

    console.log(`[AppForge LLM - Brain] Pipeline executed. Confidence: ${Math.round(decision.confidence * 100)}%. Decision path: ${decision.action}`);

    return {
      intent: intentResult.intent,
      confidence: decision.confidence,
      decision: decision.action,
      suggestedModules: reasonedModules,
      missingModules,
      questions
    };
  }
}
