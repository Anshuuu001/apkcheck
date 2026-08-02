import type { IntentResult } from '../../blueprint/schema';
import type { InterviewQuestion } from '../types/Requirement';

export const getRequirementPrompt = (intent: IntentResult) => `
You are an expert requirements engineer. Analyze this app intent:
- Industry: ${intent.industry}
- App Type: ${intent.appType}
- Target Users: ${intent.targetUsers.join(', ')}
- Primary Goal: ${intent.primaryGoal}

Generate 3-5 smart, industry-specific requirement questions to resolve gaps in the app architecture.
Return ONLY valid JSON array of questions matching this interface:
[{
  "id": "string",
  "question": "question text",
  "subtext": "optional subtext explanation",
  "type": "single-select" | "multi-select" | "toggle" | "text",
  "options": [{"label": "option label", "value": "option_value"}], // only for select type
  "required": boolean,
  "field": "features" | "authRequired" | "paymentRequired" | "locationRequired" | "notificationsRequired" | "offlineSupport"
}]
`.trim();

export class QuestionGenerator {
  async generate(intent: IntentResult): Promise<InterviewQuestion[] | null> {
    try {
      if (window.electronAPI && typeof window.electronAPI.callAI === 'function') {
        const prompt = getRequirementPrompt(intent);
        const response = await window.electronAPI.callAI(prompt);
        if (response) {
          const cleaned = response.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((q: any) => ({
              id: q.id || `custom_${Math.random().toString(36).substring(7)}`,
              question: q.question || 'Requirement Details',
              subtext: q.subtext || '',
              type: q.type || 'text',
              options: Array.isArray(q.options) ? q.options : undefined,
              required: typeof q.required === 'boolean' ? q.required : false,
              field: q.field || 'features'
            }));
          }
        }
      }
    } catch (e) {
      console.warn('[QuestionGenerator] Failed to generate dynamic questions:', e);
    }
    return null;
  }
}
