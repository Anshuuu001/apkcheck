import { INDUSTRIES_KNOWLEDGE } from '../../knowledge/industries';

export interface IndustryKnowledge {
  industry: string;
  requiredModules: string[];
  optionalModules: string[];
}

export class KnowledgeEngine {
  getKnowledge(industry: string): IndustryKnowledge | null {
    return (INDUSTRIES_KNOWLEDGE[industry] as IndustryKnowledge) || null;
  }
}
