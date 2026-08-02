import type { IntentResult, RequirementAnswers } from '../../blueprint/schema';

export const getBusinessLogicPrompt = (intent: IntentResult, answers: RequirementAnswers) => `
You are a business logic generator. Analyze the following intent and requirements:
- Industry: ${intent.industry}
- App Type: ${intent.appType}
- Features: ${answers.features.join(', ')}

Generate 2-3 logical business flows.
Return ONLY valid JSON matching this format:
[{
  "name": "Flow Name",
  "description": "Flow description",
  "trigger": "User action that triggers the flow",
  "steps": [
    { "label": "Step label", "actor": "User | System", "action": "Action done", "screen": "ScreenName", "outcome": "Outcome description" }
  ]
}]
`.trim();
