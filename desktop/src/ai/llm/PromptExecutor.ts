import { LLMProvider, type LLMRequestOptions } from './LLMProvider';
import { TokenManager } from './TokenManager';

export class PromptExecutor {
  constructor(private provider: LLMProvider) {}

  async execute(prompt: string, options?: LLMRequestOptions): Promise<string> {
    try {
      const result = await this.provider.generate(prompt, options);
      TokenManager.recordUsage(prompt, result);
      return result;
    } catch (e) {
      console.error(`[PromptExecutor] Error executing prompt on provider ${this.provider.name}:`, e);
      throw e;
    }
  }
}
