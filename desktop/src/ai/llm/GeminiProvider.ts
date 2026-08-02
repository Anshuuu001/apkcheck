import { LLMProvider, type LLMRequestOptions } from './LLMProvider';

export class GeminiProvider extends LLMProvider {
  name = 'Gemini';
  private apiKey: string = '';
  private model: string = 'gemini-2.5-pro';

  initialize(apiKey: string, modelName?: string): void {
    this.apiKey = apiKey;
    if (modelName) this.model = modelName;
  }

  async generate(prompt: string, options?: LLMRequestOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API Key is not initialized. Please set GEMINI_API_KEY in .env');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const headers = { 'Content-Type': 'application/json' };

    const body: any = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
      }
    };

    if (options?.maxTokens) {
      body.generationConfig.maxOutputTokens = options.maxTokens;
    }
    if (options?.responseFormat === 'json') {
      body.generationConfig.responseMimeType = 'application/json';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}
