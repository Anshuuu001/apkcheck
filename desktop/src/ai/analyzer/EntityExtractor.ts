/**
 * AppForge-AI — Entity Extractor (V2 Analyzer)
 * 
 * Extracts system entities, target user roles, and domain-specific terms
 * from the app idea.
 */

import type { IndustryType } from '../../blueprint/schema';
import { INDUSTRY_ROLES } from '../intentAnalyzer/localClassifier';

export class EntityExtractor {
  extractRoles(idea: string, industry: IndustryType): string[] {
    const lower = idea.toLowerCase();
    const defaults = INDUSTRY_ROLES[industry] || ['User', 'Admin'];
    
    // Explicitly scan the user idea for any mentions of common roles
    const detected = defaults.filter(role => 
      lower.includes(role.toLowerCase()) || 
      lower.includes(role.toLowerCase() + 's') // plural forms
    );

    // If we detected specific roles, make sure Admin is always available if needed,
    // otherwise default to standard industry roles list.
    if (detected.length > 0) {
      if (!detected.includes('Admin') && defaults.includes('Admin')) {
        detected.push('Admin');
      }
      return Array.from(new Set(detected));
    }

    // Default to first 3 roles of industry defaults if none explicitly detected
    return defaults.slice(0, 3);
  }
}
