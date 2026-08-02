import type { IntentResult } from '../../blueprint/schema';

const INTENT_PROMPT = (idea: string) => `You are an expert app architect. Analyze this app idea and return ONLY a JSON object with no markdown:

APP IDEA: "${idea}"

Return this exact JSON structure:
{
  "industry": "one of: Healthcare | Education | E-Commerce | Food & Delivery | Transportation | Finance & Banking | Real Estate | Social Media | Fitness & Health | Entertainment | CRM & Business | Chat & Communication | Travel & Tourism | Agriculture | Manufacturing | Custom",
  "appType": "specific name e.g. Hospital Management System",
  "targetUsers": ["role1", "role2", "role3"],
  "primaryGoal": "one sentence describing the main purpose",
  "suggestedFeatures": ["feature1", "feature2", "feature3", "feature4", "feature5", "feature6"],
  "confidence": 0.95
}`;

export async function classifyWithLLM(idea: string): Promise<IntentResult | null> {
  try {
    const response = await window.electronAPI?.callAI?.(INTENT_PROMPT(idea));
    if (response) {
      const cleaned = response.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
      const parsed = JSON.parse(cleaned);
      return {
        ...parsed,
        rawIdea: idea,
        confidence: parsed.confidence || 0.9,
      } as IntentResult;
    }
  } catch (e) {
    console.warn('[LLMClassifier] Gemini Flash API call failed:', e);
  }
  return null;
}
