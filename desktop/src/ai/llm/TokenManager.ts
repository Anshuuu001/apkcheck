export class TokenManager {
  private static totalInputTokens = 0;
  private static totalOutputTokens = 0;

  /**
   * Approximates token count based on character length (standard 4 chars per token)
   */
  static estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  static recordUsage(input: string, output: string): { inputTokens: number; outputTokens: number } {
    const inTokens = this.estimateTokens(input);
    const outTokens = this.estimateTokens(output);
    
    this.totalInputTokens += inTokens;
    this.totalOutputTokens += outTokens;
    
    return { inputTokens: inTokens, outputTokens: outTokens };
  }

  static getAccumulatedUsage() {
    return {
      inputTokens: this.totalInputTokens,
      outputTokens: this.totalOutputTokens,
      totalTokens: this.totalInputTokens + this.totalOutputTokens
    };
  }

  static resetUsage(): void {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
  }
}
