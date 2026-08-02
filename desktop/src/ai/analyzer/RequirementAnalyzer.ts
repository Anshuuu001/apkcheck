import type { IntentResult } from '../../blueprint/schema';

export interface PortalCheck {
  name: string;
  detected: boolean;
  reason?: string;
}

export class RequirementAnalyzer {
  /**
   * Evaluates which standard user roles/portals are detected vs. missing from the user's idea.
   */
  analyzePortals(intent: IntentResult, rawIdea: string): PortalCheck[] {
    const lowerIdea = rawIdea.toLowerCase();
    const standardRoles = intent.targetUsers;
    const checks: PortalCheck[] = [];

    standardRoles.forEach(role => {
      const isDetected = lowerIdea.includes(role.toLowerCase()) || 
                         lowerIdea.includes(role.toLowerCase() + 's') ||
                         (role.toLowerCase() === 'admin' && (lowerIdea.includes('manage') || lowerIdea.includes('control') || lowerIdea.includes('admin')));
      
      checks.push({
        name: `${role} Portal`,
        detected: isDetected,
        reason: isDetected ? 'Found in description' : 'Not explicitly mentioned'
      });
    });

    return checks;
  }
}
