import { INDUSTRIES_KNOWLEDGE } from '../knowledge/industries';

export interface RequirementAnalysisResult {
  requiredFeatures: string[];
  optionalFeatures: string[];
  detectedFeatures: string[];
  missingFeatures: string[];
}

const MODULE_SYNONYMS: Record<string, string[]> = {
  'Doctor': ['doctor', 'doc', 'dr', 'physician', 'clinician'],
  'Patient': ['patient', 'sick', 'bimar', 'client', 'customer', 'user'],
  'Appointment': ['appointment', 'booking', 'slot', 'milna', 'meet', 'appointments'],
  'Admin': ['admin', 'manager', 'owner', 'control', 'superadmin'],
  'Customer': ['customer', 'buyer', 'user', 'client', 'grahak'],
  'Restaurant': ['restaurant', 'hotel', 'kitchen', 'cafe', 'dhaba'],
  'Delivery Partner': ['delivery', 'driver', 'agent', 'courier', 'rider'],
  'Product Catalog': ['product', 'item', 'catalog', 'samaan', 'list', 'products'],
  'Shopping Cart': ['cart', 'basket', 'bag', 'trolley'],
  'Checkout': ['checkout', 'pay', 'billing', 'buy', 'purchase'],
  'Student': ['student', 'pupil', 'bacha', 'classmate'],
  'Teacher': ['teacher', 'guru', 'tutor', 'instructor'],
  'Classroom': ['classroom', 'class', 'lectures'],
  'Transaction': ['transaction', 'transfer', 'send', 'money', 'paisa'],
  'Account': ['account', 'khata', 'profile']
};

export class RequirementAnalyzer {
  analyze(idea: string, industry: string): RequirementAnalysisResult {
    const lowerIdea = idea.toLowerCase();
    const knowledge = INDUSTRIES_KNOWLEDGE[industry] || { industry: 'Custom', requiredModules: [], optionalModules: [] };

    const required = knowledge.requiredModules;
    const optional = knowledge.optionalModules;

    const detectedFeatures: string[] = [];

    const checkMatch = (feat: string): boolean => {
      const kw = feat.toLowerCase();
      if (lowerIdea.includes(kw) || lowerIdea.includes(kw + 's')) return true;
      
      const synonyms = MODULE_SYNONYMS[feat] || [];
      return synonyms.some(syn => lowerIdea.includes(syn));
    };

    // Check which standard required modules are present in the idea
    required.forEach(feat => {
      if (checkMatch(feat)) {
        detectedFeatures.push(feat);
      }
    });

    // Check optional modules
    optional.forEach(feat => {
      if (checkMatch(feat)) {
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
