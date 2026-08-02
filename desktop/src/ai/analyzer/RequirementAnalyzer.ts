import { INDUSTRIES_KNOWLEDGE } from '../knowledge/industries';

export interface RequirementAnalysisResult {
  requiredFeatures: string[];
  optionalFeatures: string[];
  detectedFeatures: string[];
  missingFeatures: string[];
}

export class RequirementAnalyzer {
  analyze(idea: string, industry: string): RequirementAnalysisResult {
    const lowerIdea = idea.toLowerCase();
    const knowledge = INDUSTRIES_KNOWLEDGE[industry] || { industry: 'Custom', requiredModules: [], optionalModules: [] };

    const required = knowledge.requiredModules;
    const optional = knowledge.optionalModules;

    const detectedFeatures: string[] = [];

    // Check which standard required modules are present in the idea
    required.forEach(feat => {
      const kw = feat.toLowerCase();
      if (lowerIdea.includes(kw) || 
          lowerIdea.includes(kw + 's') || 
          (kw === 'admin' && (lowerIdea.includes('manage') || lowerIdea.includes('control') || lowerIdea.includes('admin')))) {
        detectedFeatures.push(feat);
      }
    });

    // Check optional modules
    optional.forEach(feat => {
      const kw = feat.toLowerCase();
      if (lowerIdea.includes(kw) || lowerIdea.includes(kw + 's')) {
        detectedFeatures.push(feat);
      }
    });

    // Extract other standard modules (like Auth, Billing, GPS, Notifications) if present
    const generalMappings = [
      { key: 'auth', name: 'Authentication' },
      { key: 'login', name: 'Authentication' },
      { key: 'pay', name: 'Billing' },
      { key: 'bill', name: 'Billing' },
      { key: 'stripe', name: 'Billing' },
      { key: 'gps', name: 'Live Tracking' },
      { key: 'track', name: 'Live Tracking' },
      { key: 'notify', name: 'Authentication' }, // default notifications can trigger auth too
    ];

    generalMappings.forEach(mapping => {
      if (lowerIdea.includes(mapping.key) && !detectedFeatures.includes(mapping.name)) {
        detectedFeatures.push(mapping.name);
      }
    });

    // Missing features: required modules that are NOT detected
    const missingFeatures = required.filter(req => !detectedFeatures.includes(req));

    return {
      requiredFeatures: required,
      optionalFeatures: optional,
      detectedFeatures: Array.from(new Set(detectedFeatures)),
      missingFeatures
    };
  }
}
