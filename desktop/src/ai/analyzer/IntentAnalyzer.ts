export type IntentType = 
  | 'CREATE_APPLICATION' 
  | 'UPDATE_APPLICATION' 
  | 'ADD_FEATURE' 
  | 'REMOVE_FEATURE' 
  | 'FIX_BUG' 
  | 'CHANGE_THEME' 
  | 'ADD_SCREEN' 
  | 'DELETE_SCREEN' 
  | 'GENERATE_APK' 
  | 'GENERATE_BACKEND' 
  | 'GENERATE_DATABASE' 
  | 'UNKNOWN';

export interface IntentResult {
  intent: IntentType;
  confidence: number;
}

const INTENT_PROMPT = (idea: string) => `You are an expert app architect. Analyze this user request and determine the user's intent.
Possible intents:
- CREATE_APPLICATION: Wants to build a new app from scratch.
- UPDATE_APPLICATION: Wants to modify or update an existing application.
- ADD_FEATURE: Wants to add a specific feature (e.g. Stripe, chat, biometric).
- REMOVE_FEATURE: Wants to remove a specific feature.
- FIX_BUG: Wants to debug or resolve a code error.
- CHANGE_THEME: Wants to customize colors, fonts, or styling theme.
- ADD_SCREEN: Wants to create a new layout screen.
- DELETE_SCREEN: Wants to delete an existing screen.
- GENERATE_APK: Wants to build the APK package.
- GENERATE_BACKEND: Wants to export Spring Boot files.
- GENERATE_DATABASE: Wants to configure or generate SQL database tables.

USER MESSAGE: "${idea}"

Return ONLY a JSON object with no markdown:
{
  "intent": "IntentType",
  "confidence": 0.95
}`;

export class IntentAnalyzer {
  async analyze(idea: string): Promise<IntentResult> {
    try {
      if (window.electronAPI && typeof window.electronAPI.callAI === 'function') {
        const response = await window.electronAPI.callAI(INTENT_PROMPT(idea));
        if (response) {
          const cleaned = response.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
          const parsed = JSON.parse(cleaned);
          if (parsed && parsed.intent) {
            return {
              intent: parsed.intent as IntentType,
              confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
            };
          }
        }
      }
    } catch (e) {
      console.warn('[IntentAnalyzer] LLM classification failed, falling back to heuristics:', e);
    }

    // Heuristics fallback
    const lower = idea.toLowerCase();
    
    // Hinglish and English CREATE_APPLICATION
    if (lower.includes('build') || lower.includes('create') || lower.includes('make') || lower.includes('develop') || 
        lower.includes('banana') || lower.includes('banaye') || lower.includes('banado') || lower.includes('banaiye')) {
      return { intent: 'CREATE_APPLICATION', confidence: 0.9 };
    }
    if (lower.includes('apk') || lower.includes('compile') || lower.includes('build apk') || lower.includes('binary')) {
      return { intent: 'GENERATE_APK', confidence: 0.95 };
    }
    if (lower.includes('backend') || lower.includes('spring boot') || lower.includes('controller') || lower.includes('java')) {
      return { intent: 'GENERATE_BACKEND', confidence: 0.9 };
    }
    if (lower.includes('database') || lower.includes('mysql') || lower.includes('table') || lower.includes('sql') || lower.includes('schema')) {
      return { intent: 'GENERATE_DATABASE', confidence: 0.9 };
    }
    if (lower.includes('theme') || lower.includes('color') || lower.includes('style') || lower.includes('dark mode') || lower.includes('rang') || lower.includes('design')) {
      return { intent: 'CHANGE_THEME', confidence: 0.95 };
    }
    if (lower.includes('add screen') || lower.includes('new screen') || lower.includes('create screen') || lower.includes('screen jodo') || lower.includes('screen add')) {
      return { intent: 'ADD_SCREEN', confidence: 0.95 };
    }
    if (lower.includes('delete screen') || lower.includes('remove screen') || lower.includes('screen hatao')) {
      return { intent: 'DELETE_SCREEN', confidence: 0.95 };
    }
    if (lower.includes('add feature') || lower.includes('enable') || lower.includes('feature jodo') || lower.includes('feature add') || lower.includes('daalo') || lower.includes('jodo')) {
      return { intent: 'ADD_FEATURE', confidence: 0.85 };
    }
    if (lower.includes('remove feature') || lower.includes('disable') || lower.includes('hatao') || lower.includes('hata')) {
      return { intent: 'REMOVE_FEATURE', confidence: 0.85 };
    }
    if (lower.includes('fix') || lower.includes('bug') || lower.includes('error') || lower.includes('debug') || lower.includes('theek karo') || lower.includes('sudhar')) {
      return { intent: 'FIX_BUG', confidence: 0.9 };
    }
    if (lower.includes('update') || lower.includes('modify') || lower.includes('change') || lower.includes('badalna') || lower.includes('badlo')) {
      return { intent: 'UPDATE_APPLICATION', confidence: 0.8 };
    }

    return { intent: 'CREATE_APPLICATION', confidence: 0.7 };
  }
}
