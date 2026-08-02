import type { ScreenBlueprint, NavigationPlan } from '../../../blueprint/schema';

export class PlanningBrain {
  /**
   * Builds basic routing setups
   */
  planNavigation(type: 'stack-only' | 'bottom-tabs'): NavigationPlan {
    return {
      type,
      groups: []
    };
  }
}
