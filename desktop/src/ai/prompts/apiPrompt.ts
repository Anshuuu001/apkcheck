import type { ApiPlan } from '../../blueprint/schema';

export const getApiPrompt = (apiPlan: ApiPlan) => `
You are an API Planner. For these endpoints:
- Endpoints: ${apiPlan.endpoints.map(e => e.path).join(', ')}

Return request/response schemas for each endpoint path.
Return ONLY valid JSON.
`.trim();
