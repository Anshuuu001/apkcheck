import type { IntentResult } from '../../blueprint/schema';

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
