import { INDUSTRIES_KNOWLEDGE } from '../knowledge/industries';

export class GapAnalyzer {
  analyze(detected: string[], industry: string): string[] {
    const knowledge = INDUSTRIES_KNOWLEDGE[industry] || { industry: 'Custom', requiredModules: [], optionalModules: [] };
    const missing: string[] = [];

    // 1. Add standard required features that are not in detected list
    knowledge.requiredModules.forEach(feat => {
      if (!detected.includes(feat) && !missing.includes(feat)) {
        missing.push(feat);
      }
    });

    // 2. Add standard optional modules if they are not in the detected list
    knowledge.optionalModules.forEach(feat => {
      if (!detected.includes(feat) && !missing.includes(feat)) {
        missing.push(feat);
      }
    });

    // 3. Apply industry-specific standards overrides
    if (industry === 'E-Commerce' || industry === 'Ecommerce') {
      const ecommerceStandards = ['Payment', 'Authentication', 'Cart', 'Orders', 'Reviews', 'Coupons'];
      ecommerceStandards.forEach(std => {
        if (!detected.includes(std) && !missing.includes(std)) {
          missing.push(std);
        }
      });
    }

    if (industry === 'Healthcare' || industry === 'Hospital') {
      const hcStandards = ['Billing', 'Lab', 'Pharmacy', 'Authentication'];
      hcStandards.forEach(std => {
        if (!detected.includes(std) && !missing.includes(std)) {
          missing.push(std);
        }
      });
    }

    return missing;
  }
}
