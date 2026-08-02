import type { IntentResult } from '../../blueprint/schema';
import type { InterviewQuestion } from '../../store/engineStore';
import { generateInterviewQuestions } from '../requirement/RequirementEngine';
import { getRequirementPrompt } from '../prompts/requirementPrompt';

export class RequirementAnalyzer {
  async generateQuestions(intent: IntentResult): Promise<InterviewQuestion[]> {
    // 1. Try to generate custom questions using LLM
    try {
      if (window.electronAPI && typeof window.electronAPI.callAI === 'function') {
        const prompt = getRequirementPrompt(intent);
        const response = await window.electronAPI.callAI(prompt);
        if (response) {
          const cleaned = response.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const customQuestions: InterviewQuestion[] = parsed.map((q: any) => ({
              id: q.id || `custom_${Math.random().toString(36).substring(7)}`,
              question: q.question || 'Requirement Details',
              subtext: q.subtext || '',
              type: q.type || 'text',
              options: Array.isArray(q.options) ? q.options : undefined,
              required: typeof q.required === 'boolean' ? q.required : false,
              field: q.field || 'features'
            }));

            // Merge with standard checklist questions (auth, notifications, etc.)
            const baseQuestions = generateInterviewQuestions(intent);
            const seenFields = new Set(customQuestions.map(q => q.field));
            const mergedQuestions = [
              ...customQuestions,
              ...baseQuestions.filter(q => !seenFields.has(q.field))
            ];
            return mergedQuestions;
          }
        }
      }
    } catch (e) {
      console.warn('[RequirementAnalyzer V2] Dynamic question generation failed, falling back to heuristics:', e);
    }

    // 2. Offline heuristic questions fallback
    const baseQuestions = generateInterviewQuestions(intent);
    const appTypeLower = intent.appType.toLowerCase();
    
    if (appTypeLower.includes('hospital') || appTypeLower.includes('doctor') || appTypeLower.includes('patient')) {
      if (!baseQuestions.some(q => q.id === 'telehealth_video')) {
        baseQuestions.push({
          id: 'telehealth_video',
          question: 'Do you need video-telehealth consultation?',
          subtext: 'Requires access to device camera and microphone integrations',
          type: 'toggle',
          required: false,
          field: 'locationRequired'
        });
      }
    }
    
    return baseQuestions;
  }
}
