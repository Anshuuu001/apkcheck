import { INDUSTRIES_KNOWLEDGE } from '../knowledge/industries';

export interface EntityExtractionResult {
  domain: string;
  modules: string[];
}

export class EntityExtractor {
  extract(idea: string, industry: string): EntityExtractionResult {
    const lowerIdea = idea.toLowerCase();
    const knowledge = INDUSTRIES_KNOWLEDGE[industry] || { industry: 'Custom', requiredModules: [], optionalModules: [] };
    
    // Explicitly scan the user idea for any mentions of modules
    const modules: string[] = [];

    // Check required modules of target industry
    knowledge.requiredModules.forEach(mod => {
      if (lowerIdea.includes(mod.toLowerCase()) || lowerIdea.includes(mod.toLowerCase() + 's')) {
        modules.push(mod);
      }
    });

    // Check optional modules of target industry
    knowledge.optionalModules.forEach(mod => {
      if (lowerIdea.includes(mod.toLowerCase()) || lowerIdea.includes(mod.toLowerCase() + 's')) {
        modules.push(mod);
      }
    });

    // Check common modules generally (e.g. Wallet, Payments, Live Tracking, Login, Billing)
    const generalModules = [
      { key: 'wallet', name: 'Wallet' },
      { key: 'coupon', name: 'Coupons' },
      { key: 'track', name: 'Live Tracking' },
      { key: 'pay', name: 'Billing' },
      { key: 'auth', name: 'Authentication' },
      { key: 'login', name: 'Authentication' },
      { key: 'video', name: 'Telemedicine' },
      { key: 'chat', name: 'Chat' },
    ];

    generalModules.forEach(m => {
      if (lowerIdea.includes(m.key) && !modules.includes(m.name)) {
        modules.push(m.name);
      }
    });

    // Clean up domain name string formatting (e.g. FoodDelivery -> Food Delivery)
    let domainName = knowledge.industry;
    if (domainName === 'FoodDelivery') domainName = 'Food Delivery';
    else if (domainName === 'SocialMedia') domainName = 'Social Media';
    else if (domainName === 'RealEstate') domainName = 'Real Estate';
    else if (domainName === 'JobPortal') domainName = 'Job Portal';

    return {
      domain: domainName,
      modules: Array.from(new Set(modules))
    };
  }
}
