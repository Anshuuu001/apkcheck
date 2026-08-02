import { LLMProvider, type LLMRequestOptions } from './LLMProvider';

export class OpenAIProvider extends LLMProvider {
  name = 'OpenAI';
  private apiKey: string = '';
  private model: string = 'gpt-4o';

  initialize(apiKey: string, modelName?: string): void {
    this.apiKey = apiKey;
    if (modelName) this.model = modelName;
  }

  async generate(prompt: string, options?: LLMRequestOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API Key is not initialized. Please set it in .env');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    const body: any = {
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? 0.7,
    };

    if (options?.maxTokens) {
      body.max_tokens = options.maxTokens;
    }
    if (options?.responseFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
}
