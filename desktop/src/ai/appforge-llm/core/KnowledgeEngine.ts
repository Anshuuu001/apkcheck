import { INDUSTRIES_KNOWLEDGE } from '../../knowledge/industries';

export interface IndustryKnowledge {
  industry: string;
  roles: string[];
  screens: string[];
  entities: string[];
  apis: string[];
  businessRules: string[];
  navigation: string[];
  recommendedFeatures: string[];
}

export class KnowledgeEngine {
  getKnowledge(industry: string): IndustryKnowledge | null {
    return (INDUSTRIES_KNOWLEDGE[industry] as IndustryKnowledge) || null;
  }
}
