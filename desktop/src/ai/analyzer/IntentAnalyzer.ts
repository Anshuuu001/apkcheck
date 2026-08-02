export type IntentType = 'CREATE_APPLICATION' | 'MODIFY_APPLICATION' | 'ASK_QUESTION' | 'UNKNOWN';

export interface IntentResult {
  intent: IntentType;
  confidence: number;
}

const INTENT_PROMPT = (idea: string) => `You are an expert app architect. Analyze this user message and determine if they want to build a new application, modify an existing application, ask a question, or if the intent is unknown.
Return ONLY a JSON object with no markdown:

USER MESSAGE: "${idea}"

Return this exact JSON structure:
{
  "intent": "CREATE_APPLICATION" | "MODIFY_APPLICATION" | "ASK_QUESTION" | "UNKNOWN",
  "confidence": 0.95
}`;

export class IntentAnalyzer {
  async analyze(idea: string): Promise<IntentResult> {
    // 1. Try LLM if available
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

    // 2. Fallback heuristic matching
    const lower = idea.toLowerCase();
    
    // Check modify keywords
    if (lower.includes('add') || lower.includes('modify') || lower.includes('change') || lower.includes('update') || lower.includes('remove') || lower.includes('edit')) {
      return { intent: 'MODIFY_APPLICATION', confidence: 0.8 };
    }

    // Check ask question keywords
    if (lower.includes('how to') || lower.includes('what is') || lower.includes('why') || lower.includes('explain') || lower.includes('help')) {
      return { intent: 'ASK_QUESTION', confidence: 0.75 };
    }

    // Default to CREATE_APPLICATION if they describe an app
    if (lower.includes('app') || lower.includes('application') || lower.includes('system') || lower.includes('platform') || lower.includes('portal') || lower.includes('software')) {
      return { intent: 'CREATE_APPLICATION', confidence: 0.85 };
    }

    return { intent: 'UNKNOWN', confidence: 0.5 };
  }
}
