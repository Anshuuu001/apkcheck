import type { IndustryType } from '../../blueprint/schema';

export class ConfidenceCalculator {
  /**
   * Calculates overall domain classification confidence.
   */
  calculate(industry: IndustryType, matchScore: number): number {
    if (industry === 'Custom') {
      return 0.3;
    }
    
    // Clamp score between 0.1 and 1.0
    return Math.min(1.0, Math.max(0.1, matchScore));
  }

  /**
   * Determines if the confidence is high enough to skip secondary analysis steps.
   */
  isConfidenceHigh(confidence: number): boolean {
    return confidence >= 0.85;
  }
}
