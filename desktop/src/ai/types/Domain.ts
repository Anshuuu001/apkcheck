import type { IndustryType } from '../../blueprint/schema';

export interface DomainClassification {
  industry: IndustryType;
  confidence: number;
}
