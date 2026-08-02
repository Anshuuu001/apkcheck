import { OpenAIProvider } from './OpenAIProvider';
import { GeminiProvider } from './GeminiProvider';
import { PromptExecutor } from './PromptExecutor';
import type { LLMRequestOptions } from './LLMProvider';
import * as fs from 'fs';
import * as path from 'path';

// Native env loader to avoid dotenv dependency in packaged Electron build
function loadEnv(): void {
  const possiblePaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../../.env'),
    path.join(__dirname, '../../../.env'),
    path.join(__dirname, '../../../../.env'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'desktop', '.env')
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return;
          const parts = trimmed.split('=');
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
          if (key) {
            process.env[key] = val;
          }
        });
        console.log(`[AIOrchestrator] Environment variables loaded from: ${envPath}`);
        break;
      } catch (err) {
        console.warn(`[AIOrchestrator] Error loading env from ${envPath}:`, err);
      }
    }
  }
}

// Load environment variables immediately
loadEnv();

export class AIOrchestrator {
  private openai: OpenAIProvider;
  private gemini: GeminiProvider;
  
  private openaiExecutor: PromptExecutor;
  private geminiExecutor: PromptExecutor;

  constructor() {
    this.openai = new OpenAIProvider();
    this.gemini = new GeminiProvider();

    const openaiKey = process.env.OPENAI_API_KEY || '';
    const geminiKey = process.env.GEMINI_API_KEY || '';
    const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o';
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-pro';

    this.openai.initialize(openaiKey, openaiModel);
    this.gemini.initialize(geminiKey, geminiModel);

    this.openaiExecutor = new PromptExecutor(this.openai);
    this.geminiExecutor = new PromptExecutor(this.gemini);
  }

  /**
   * Orchestrates the call to the appropriate LLM provider.
   * If taskType is 'ui-suggestion' and Gemini is available, uses Gemini.
   * Otherwise, defaults to OpenAI with a fallback to Gemini if OpenAI fails.
   */
  async callAI(prompt: string, taskType: 'core' | 'ui-suggestion' = 'core', options?: LLMRequestOptions): Promise<string> {
    const isGeminiAvailable = !!process.env.GEMINI_API_KEY;
    const isOpenAIAvailable = !!process.env.OPENAI_API_KEY;

    if (taskType === 'ui-suggestion' && isGeminiAvailable) {
      try {
        console.log('[AIOrchestrator] Routing UI/UX suggestion request to Gemini');
        return await this.geminiExecutor.execute(prompt, options);
      } catch (e) {
        console.warn('[AIOrchestrator] Gemini UI suggestion execution failed, falling back to OpenAI:', e);
      }
    }

    // Default to OpenAI
    if (isOpenAIAvailable) {
      try {
        console.log('[AIOrchestrator] Routing core task to OpenAI');
        return await this.openaiExecutor.execute(prompt, options);
      } catch (e) {
        if (isGeminiAvailable) {
          console.warn('[AIOrchestrator] OpenAI core execution failed! Falling back to Gemini:', e);
          return await this.geminiExecutor.execute(prompt, options);
        }
        throw e;
      }
    }

    // Fallback if OpenAI key is not set but Gemini is
    if (isGeminiAvailable) {
      console.log('[AIOrchestrator] OpenAI key missing, executing on Gemini Fallback');
      return await this.geminiExecutor.execute(prompt, options);
    }

    throw new Error('No AI Providers configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in .env');
  }
}
