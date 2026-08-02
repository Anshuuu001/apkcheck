import type { IntentResult, RequirementAnswers } from '../../blueprint/schema';

export const getBlueprintPrompt = (intent: IntentResult, answers: RequirementAnswers) => `
You are a master app architect. Take this intent and answers:
- Industry: ${intent.industry}
- App Type: ${intent.appType}
- Target Users: ${intent.targetUsers.join(', ')}
- Suggested Features: ${answers.features.join(', ')}

Assemble a comprehensive master AppBlueprint JSON file.
Return ONLY JSON matching the AppBlueprint interface.
Do not wrap in markdown tags.
`.trim();
