export interface LLMRequestOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export abstract class LLMProvider {
  abstract name: string;
  abstract initialize(apiKey: string, modelName?: string): void;
  abstract generate(prompt: string, options?: LLMRequestOptions): Promise<string>;
}
