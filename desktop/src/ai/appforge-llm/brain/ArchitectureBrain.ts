import type { DatabasePlan } from '../../../blueprint/schema';

export class ArchitectureBrain {
  /**
   * Plans standard constraints and settings
   */
  resolveArchitecturePatterns(plan: DatabasePlan): string {
    if (plan.tables.length > 8) return 'microservice';
    return 'monolith';
  }
}
