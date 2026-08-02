import type { DatabasePlan } from '../../blueprint/schema';

export const getDbPrompt = (dbPlan: DatabasePlan) => `
You are a database designer. Refine this relational database plan:
- Tables: ${dbPlan.tables.map(t => t.name).join(', ')}

Return index recommendations and field optimizations.
Return ONLY valid JSON:
{
  "optimizedTables": [],
  "indexes": []
}
`.trim();
