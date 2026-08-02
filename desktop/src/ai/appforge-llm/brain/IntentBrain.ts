import { IntentAnalyzer, type IntentResult } from '../../analyzer/IntentAnalyzer';

export class IntentBrain {
  private analyzer = new IntentAnalyzer();

  async determineIntent(idea: string): Promise<IntentResult> {
    return this.analyzer.analyze(idea);
  }
}
