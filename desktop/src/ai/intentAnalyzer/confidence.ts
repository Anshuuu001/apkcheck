import type { IntentResult } from '../../blueprint/schema';

/**
 * Checks the confidence rating of the local classification.
 * Returns true if confidence is high (>= 0.85), meaning we can bypass LLM.
 */
export function isConfidenceHigh(result: IntentResult): boolean {
  // If the industry is resolved to Custom (default fallback), confidence is always low
  if (result.industry === 'Custom') {
    return false;
  }

  // If matching keywords are found in rawIdea and score > 0.8, confidence is high
  if (result.confidence >= 0.85) {
    return true;
  }

  return false;
}
