import { OpenAIProvider } from './OpenAIProvider';
import { GeminiProvider } from './GeminiProvider';
import { PromptExecutor } from './PromptExecutor';
import type { LLMRequestOptions } from './LLMProvider';
import { initLearningDatabase, type LearningDatabase } from '../appforge-llm/learning/learningDb';
import { DecisionEngine } from '../appforge-llm/core/DecisionEngine';
import { LearningManager } from '../appforge-llm/learning/LearningManager';
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

// Resolve write-permitted folder path for learning.db
const appDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.config');
const learningDbDir = path.join(appDataPath, 'AppForge AI');
if (!fs.existsSync(learningDbDir)) {
  fs.mkdirSync(learningDbDir, { recursive: true });
}

export class AIOrchestrator {
  private openai: OpenAIProvider;
  private gemini: GeminiProvider;
  
  private openaiExecutor: PromptExecutor;
  private geminiExecutor: PromptExecutor;

  // AppForge LLM components
  private learningDb: LearningDatabase;
  private decisionEngine: DecisionEngine;
  private learningManager: LearningManager;

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

    // Instantiate local AppForge LLM self-improving engines
    this.learningDb = initLearningDatabase(learningDbDir);
    this.decisionEngine = new DecisionEngine();
    this.learningManager = new LearningManager(this.learningDb);
  }

  /**
   * Routes prompt queries first through local AppForge LLM evaluation.
   * If local confidence is high (>95%), answers directly from local expert systems.
   * Otherwise, makes external API calls and runs the self-learning training loops.
   */
  async callAI(prompt: string, taskType: 'core' | 'ui-suggestion' = 'core', options?: LLMRequestOptions): Promise<string> {
    // 1. Evaluate prompt using AppForge LLM core
    const promptLower = prompt.toLowerCase();
    let guessedIndustry = 'Custom';
    if (promptLower.includes('hospital') || promptLower.includes('doctor')) guessedIndustry = 'Hospital';
    else if (promptLower.includes('food') || promptLower.includes('delivery')) guessedIndustry = 'FoodDelivery';
    else if (promptLower.includes('shop') || promptLower.includes('ecommerce')) guessedIndustry = 'Ecommerce';

    const decision = this.decisionEngine.evaluate(prompt, guessedIndustry, this.learningDb);
    console.log(`[AppForge LLM] Self confidence rating: ${Math.round(decision.confidence * 100)}% -> Action: ${decision.action}`);

    // Rule: Confidence >95% -> Local Resolution (No external API Call!)
    if (decision.action === 'LOCAL' && taskType === 'core') {
      console.log('[AppForge LLM] Confidence is high (>95%). Bypassing external API and serving local expert blueprint!');
      // Returns local checklist questions dynamically mapping the domain
      if (guessedIndustry === 'Hospital') {
        return JSON.stringify([
          {
            id: 'roles_hospital_local',
            question: 'Which portals and dashboards do you need in your hospital app?',
            type: 'multi-select',
            required: true,
            field: 'userRoles',
            options: [
              { label: 'Doctor Portal', value: 'Doctor' },
              { label: 'Patient Portal', value: 'Patient' },
              { label: 'Reception Dashboard', value: 'Receptionist' },
              { label: 'System Admin Panel', value: 'Admin' }
            ]
          }
        ]);
      }
    }

    // Optional or Required external API execution
    const apiResult = await this.callExternalLLM(prompt, taskType, options);

    // Rule: Confidence <80% -> Learn and Save updates to local learning database!
    if (decision.action === 'API' && taskType === 'core') {
      try {
        console.log('[AppForge LLM] Confidence score was low (<80%). Running dynamic comparison and self-improving training update...');
        const localTemplateMock = JSON.stringify({ industry: guessedIndustry, modules: [] });
        await this.learningManager.compareAndLearn(prompt, localTemplateMock, apiResult);
      } catch (err) {
        console.warn('[AIOrchestrator] Self-learning training loop error ignored:', err);
      }
    }

    return apiResult;
  }

  private async callExternalLLM(prompt: string, taskType: 'core' | 'ui-suggestion', options?: LLMRequestOptions): Promise<string> {
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
